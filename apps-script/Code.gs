/**
 * CPS Demo CRM - Google Apps Script API
 * 1) Create a Google Sheet.
 * 2) Extensions -> Apps Script.
 * 3) Paste this code.
 * 4) Set SCRIPT PROPERTIES:
 *    SPREADSHEET_ID = your sheet id
 *    DRIVE_FOLDER_ID = folder id for meeting photos
 * 5) Deploy -> New deployment -> Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 */

const SHEETS = {
  ACCOUNTS: 'Accounts',
  DEVICES: 'Devices',
  COMPANY: 'CompanyDetails',
  ACTIVITY: 'Activity',
}

const ACCOUNT_HEADERS = [
  'accountId','companyName','contactPerson','mobile','email','city','accountType','businessOpportunityWeHave','referredBy','hasPotential','timeForFirstOrder','expectedQtyFirstOrder','expectedQty3Months','expectedQty6Months','expectedQty9Months','expectedQty12Months','noPotentialReason','shownLeaseVsBuyCalculator','wantedProduct','mismatchPriceAmount','mismatchReason','otherReason','unknownContactName','unknownContactDesignation','unknownContactPhone','unknownContactEmail','orderStatus','trackingStatus','mainStatus','quotationSent','poSent','deliveryStatus','approvalStatus','createdDate','actualClosureDate','remarks','isFrozen','meetingPhotoUrl','updatedAt'
]

const DEVICE_HEADERS = ['deviceId','accountId','deviceType','condition','brand','processorBrand','processor','generation','ram','storage','graphicCard','quantity','lockInMonths','pricePerMonth','excludingGst','deliveryStatus']
const COMPANY_HEADERS = ['accountId','yearOfEstablishment','headquarterLocation','currentEmployees','employeesSixMonthsBefore','netEmployeesLastSixMonths','revenueTwoYearsBefore','latestRevenueCrore','latestRevenueYear','previousYearRevenue','netRevenueIncreaseFromLastYear','latestInvestment','latestInvestmentYear','investmentTakenFrom','legalCases','highRiskLegalCases','highRiskCasesResponded']

function doGet() {
  return json({ ok: true, message: 'CPS Demo CRM API is running' })
}

function doPost(e) {
  try {
    setupSheets_()
    const body = JSON.parse(e.postData.contents || '{}')
    const action = body.action
    const payload = body.payload || {}
    if (action === 'listAccounts') return json({ ok: true, accounts: listAccounts_() })
    if (action === 'saveAccount') return json({ ok: true, account: saveAccount_(payload) })
    if (action === 'updateAccount') return json({ ok: true, account: saveAccount_(payload) })
    if (action === 'deleteAccount') return json({ ok: true, deleted: deleteAccount_(payload.accountId) })
    return json({ ok: false, message: 'Unknown action: ' + action })
  } catch (err) {
    return json({ ok: false, message: String(err && err.message ? err.message : err) })
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

function ss_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
  if (!id) throw new Error('Missing SPREADSHEET_ID in Script Properties')
  return SpreadsheetApp.openById(id)
}

function setupSheets_() {
  const ss = ss_()
  ensureSheet_(ss, SHEETS.ACCOUNTS, ACCOUNT_HEADERS)
  ensureSheet_(ss, SHEETS.DEVICES, DEVICE_HEADERS)
  ensureSheet_(ss, SHEETS.COMPANY, COMPANY_HEADERS)
  ensureSheet_(ss, SHEETS.ACTIVITY, ['timestamp','action','accountId','description'])
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name)
  if (!sh) sh = ss.insertSheet(name)
  const row = sh.getRange(1, 1, 1, headers.length).getValues()[0]
  if (row.join('') === '') sh.getRange(1, 1, 1, headers.length).setValues([headers])
  sh.setFrozenRows(1)
}

function readObjects_(sheetName, headers) {
  const sh = ss_().getSheetByName(sheetName)
  const values = sh.getDataRange().getValues()
  if (values.length <= 1) return []
  return values.slice(1).filter(r => r[0]).map(row => {
    const o = {}
    headers.forEach((h, i) => o[h] = row[i])
    return o
  })
}

function upsert_(sheetName, headers, key, obj) {
  const sh = ss_().getSheetByName(sheetName)
  const values = sh.getDataRange().getValues()
  const keyIndex = headers.indexOf(key)
  let rowNumber = -1
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][keyIndex]) === String(obj[key])) { rowNumber = i + 1; break }
  }
  const row = headers.map(h => obj[h] === undefined ? '' : obj[h])
  if (rowNumber > 0) sh.getRange(rowNumber, 1, 1, headers.length).setValues([row])
  else sh.appendRow(row)
}

function deleteRowsByKey_(sheetName, headers, key, value) {
  const sh = ss_().getSheetByName(sheetName)
  const data = sh.getDataRange().getValues()
  const idx = headers.indexOf(key)
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idx]) === String(value)) sh.deleteRow(i + 1)
  }
}

function listAccounts_() {
  const accounts = readObjects_(SHEETS.ACCOUNTS, ACCOUNT_HEADERS)
  const devices = readObjects_(SHEETS.DEVICES, DEVICE_HEADERS)
  const details = readObjects_(SHEETS.COMPANY, COMPANY_HEADERS)
  return accounts.map(a => ({
    ...a,
    isFrozen: String(a.isFrozen) === 'true',
    devices: devices.filter(d => d.accountId === a.accountId),
    companyDetails: details.find(d => d.accountId === a.accountId) || {},
  })).reverse()
}

function saveAccount_(payload) {
  const account = Object.assign({}, payload)
  const devices = account.devices || []
  const companyDetails = account.companyDetails || {}

  if (account.meetingPhotoBase64 && String(account.meetingPhotoBase64).indexOf('data:image') === 0) {
    account.meetingPhotoUrl = uploadPhoto_(account.meetingPhotoBase64, account.meetingPhotoName || (account.accountId + '.jpg'))
  }
  delete account.devices
  delete account.companyDetails
  delete account.meetingPhotoBase64
  delete account.meetingPhotoName
  account.updatedAt = new Date()
  account.isFrozen = String(account.isFrozen === true || account.isFrozen === 'true')

  upsert_(SHEETS.ACCOUNTS, ACCOUNT_HEADERS, 'accountId', account)
  deleteRowsByKey_(SHEETS.DEVICES, DEVICE_HEADERS, 'accountId', account.accountId)
  devices.forEach(d => upsert_(SHEETS.DEVICES, DEVICE_HEADERS, 'deviceId', Object.assign({}, d, { accountId: account.accountId })))
  upsert_(SHEETS.COMPANY, COMPANY_HEADERS, 'accountId', Object.assign({}, companyDetails, { accountId: account.accountId }))
  ss_().getSheetByName(SHEETS.ACTIVITY).appendRow([new Date(), 'SAVE_ACCOUNT', account.accountId, account.companyName])

  return Object.assign({}, account, { isFrozen: account.isFrozen === 'true', devices, companyDetails })
}

function uploadPhoto_(dataUrl, filename) {
  const folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID')
  if (!folderId) throw new Error('Missing DRIVE_FOLDER_ID in Script Properties')
  const parts = dataUrl.split(',')
  const meta = parts[0]
  const bytes = Utilities.base64Decode(parts[1])
  const mime = meta.indexOf('png') > -1 ? 'image/png' : 'image/jpeg'
  const blob = Utilities.newBlob(bytes, mime, filename)
  const file = DriveApp.getFolderById(folderId).createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  return file.getUrl()
}

function deleteAccount_(accountId) {
  deleteRowsByKey_(SHEETS.ACCOUNTS, ACCOUNT_HEADERS, 'accountId', accountId)
  deleteRowsByKey_(SHEETS.DEVICES, DEVICE_HEADERS, 'accountId', accountId)
  deleteRowsByKey_(SHEETS.COMPANY, COMPANY_HEADERS, 'accountId', accountId)
  return true
}
