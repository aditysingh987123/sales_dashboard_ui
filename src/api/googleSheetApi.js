const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || ''

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
    throw new Error(`Google Apps Script did not return JSON. Response: ${text.slice(0, 150)}`)
  }

  if (!data.ok) throw new Error(data.message || 'Google Sheet API error')
  return data
}

export const googleSheetApi = {
  async listAccounts() {
    const data = await post('listAccounts', {})
    return data.accounts || []
  },
  async saveAccount(account) {
    const data = await post('saveAccount', account)
    return data.account
  },
  async updateAccount(account) {
    const data = await post('updateAccount', account)
    return data.account
  },
  async deleteAccount(accountId) {
    return post('deleteAccount', { accountId })
  },
}
