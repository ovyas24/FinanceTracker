import { NextResponse } from 'next/server'
import { getAllData } from '@/lib/sheets'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const { expenses, income, holdings, accounts } = await getAllData()
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Bank Name','Account Type','Balance','Last Updated'],
      ...accounts.map(a => [a.bank_name, a.account_type, a.balance, a.last_updated]),
      [],['Total','',accounts.reduce((s,a) => s+a.balance,0),''],
    ]), 'Accounts')

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Date','Type','Amount','Note'],
      ...income.map(i => [i.date, i.type, i.amount, i.note]),
      [],['Total','',income.reduce((s,i) => s+i.amount,0),''],
    ]), 'Income')

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Date','Category','Amount','Note','Payment Mode'],
      ...expenses.map(e => [e.date, e.category, e.amount, e.note, e.payment_mode]),
      [],['Total','',expenses.reduce((s,e) => s+e.amount,0),'',''],
    ]), 'Expenses')

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Type','Name','Amount','Units','Buy Price','Maturity Date','Last Updated'],
      ...holdings.map(h => [h.type, h.name, h.amount, h.units, h.buy_price, h.maturity_date, h.last_updated]),
      [],['Total','',holdings.reduce((s,h) => s+h.amount,0),'','','',''],
    ]), 'Holdings')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const filename = `finance-${new Date().toISOString().slice(0,10)}.xlsx`
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
