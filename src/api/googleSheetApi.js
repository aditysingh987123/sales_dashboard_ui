const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || ''

const CACHE_KEY = 'accounts-cache'
const CACHE_TIME = 10 * 60 * 1000 // 10 minutes

function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)

    if (!cached) return null

    const parsed = JSON.parse(cached)

    if (Date.now() - parsed.timestamp > CACHE_TIME) {
      return null
    }

    return parsed.accounts
  } catch {
    return null
  }
}

function saveCache(accounts) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      accounts,
    }),
  )
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY)
}

async function post(action, payload = {}) {
  if (!API_URL) {
    throw new Error('Missing VITE_GOOGLE_SCRIPT_URL in .env')
  }

  if (API_URL.includes('docs.google.com/spreadsheets')) {
    throw new Error('Use Apps Script Web App URL, not Google Sheet URL')
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload }),
  })

  const text = await res.text()

  let data

  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(
      `Google Apps Script did not return JSON. Response: ${text.slice(0, 150)}`
    )
  }

  if (!data.ok) {
    throw new Error(data.message || 'Google Sheet API error')
  }

  return data
}

export const googleSheetApi = {
  async listAccounts(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getCache()

      if (cached) {
        return cached
      }
    }

    const data = await post('listAccounts', {})

    const accounts = data.accounts || []

    saveCache(accounts)

    return accounts
  },

  async saveAccount(account) {
    const data = await post('saveAccount', account)

    clearCache()

    return data.account
  },

  async updateAccount(account) {
    const data = await post('updateAccount', account)

    clearCache()

    return data.account
  },

  async deleteAccount(accountId) {
    clearCache()

    return post('deleteAccount', { accountId })
  },
}
