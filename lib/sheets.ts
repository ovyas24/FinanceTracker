import { google } from 'googleapis'

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set')
  const creds = JSON.parse(raw)
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID
  if (!id) throw new Error('GOOGLE_SHEET_ID not set')
  return id
}

async function getSheets() {
  const auth = getAuth()
  return google.sheets({ version: 'v4', auth })
}

async function readSheet(sheetName: string): Promise<string[][]> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${sheetName}!A2:Z`,
  })
  return (res.data.values as string[][]) || []
}

async function appendRow(sheetName: string, values: (string | number)[]) {
  const sheets = await getSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

async function updateRow(sheetName: string, rowIndex: number, values: (string | number)[]) {
  const sheets = await getSheets()
  const row = rowIndex + 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${sheetName}!A${row}:Z${row}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

async function deleteRow(sheetName: string, rowIndex: number) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const meta = await sheets.spreadsheets.get({ spreadsheetId: getSheetId() })
  const sheet = meta.data.sheets?.find(s => s.properties?.title === sheetName)
  if (!sheet?.properties?.sheetId === undefined) throw new Error(`Sheet ${sheetName} not found`)
  const sheetId = sheet!.properties!.sheetId!
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSheetId(),
    requestBody: {
      requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 } } }]
    }
  })
}

// ── Expenses: id|date|category|amount|note|payment_mode ──
export async function getExpenses() {
  const rows = await readSheet('expenses')
  return rows.map(r => ({ id: r[0]||'', date: r[1]||'', category: r[2]||'', amount: parseFloat(r[3])||0, note: r[4]||'', payment_mode: (r[5]||'UPI') as any }))
}
export async function addExpense(e: any) {
  const id = Date.now().toString()
  await appendRow('expenses', [id, e.date, e.category, e.amount, e.note, e.payment_mode])
  return id
}
export async function deleteExpense(id: string) {
  const rows = await readSheet('expenses')
  const idx = rows.findIndex(r => r[0] === id)
  if (idx === -1) throw new Error('Not found')
  await deleteRow('expenses', idx)
}

// ── Income: id|date|type|amount|note ──
export async function getIncome() {
  const rows = await readSheet('income')
  return rows.map(r => ({ id: r[0]||'', date: r[1]||'', type: (r[2]||'Other') as any, amount: parseFloat(r[3])||0, note: r[4]||'' }))
}
export async function addIncome(i: any) {
  const id = Date.now().toString()
  await appendRow('income', [id, i.date, i.type, i.amount, i.note])
  return id
}
export async function deleteIncome(id: string) {
  const rows = await readSheet('income')
  const idx = rows.findIndex(r => r[0] === id)
  if (idx === -1) throw new Error('Not found')
  await deleteRow('income', idx)
}

// ── Holdings: id|type|name|amount|units|buy_price|maturity_date|last_updated ──
export async function getHoldings() {
  const rows = await readSheet('holdings')
  return rows.map(r => ({ id: r[0]||'', type: (r[1]||'SIP') as any, name: r[2]||'', amount: parseFloat(r[3])||0, units: r[4]||'', buy_price: r[5]||'', maturity_date: r[6]||'', last_updated: r[7]||'' }))
}
export async function addHolding(h: any) {
  const id = Date.now().toString()
  await appendRow('holdings', [id, h.type, h.name, h.amount, h.units||'', h.buy_price||'', h.maturity_date||'', h.last_updated])
  return id
}
export async function updateHolding(id: string, h: any) {
  const rows = await readSheet('holdings')
  const idx = rows.findIndex(r => r[0] === id)
  if (idx === -1) throw new Error('Not found')
  await updateRow('holdings', idx, [id, h.type, h.name, h.amount, h.units||'', h.buy_price||'', h.maturity_date||'', h.last_updated])
}
export async function deleteHolding(id: string) {
  const rows = await readSheet('holdings')
  const idx = rows.findIndex(r => r[0] === id)
  if (idx === -1) throw new Error('Not found')
  await deleteRow('holdings', idx)
}

// ── Accounts: id|bank_name|account_type|balance|last_updated ──
export async function getAccounts() {
  const rows = await readSheet('accounts')
  return rows.map(r => ({ id: r[0]||'', bank_name: r[1]||'', account_type: r[2]||'', balance: parseFloat(r[3])||0, last_updated: r[4]||'' }))
}
export async function addAccount(a: any) {
  const id = Date.now().toString()
  await appendRow('accounts', [id, a.bank_name, a.account_type, a.balance, a.last_updated])
  return id
}
export async function updateAccount(id: string, a: any) {
  const rows = await readSheet('accounts')
  const idx = rows.findIndex(r => r[0] === id)
  if (idx === -1) throw new Error('Not found')
  await updateRow('accounts', idx, [id, a.bank_name, a.account_type, a.balance, a.last_updated])
}
export async function deleteAccount(id: string) {
  const rows = await readSheet('accounts')
  const idx = rows.findIndex(r => r[0] === id)
  if (idx === -1) throw new Error('Not found')
  await deleteRow('accounts', idx)
}

export async function getAllData() {
  const [expenses, income, holdings, accounts] = await Promise.all([getExpenses(), getIncome(), getHoldings(), getAccounts()])
  return { expenses, income, holdings, accounts }
}
