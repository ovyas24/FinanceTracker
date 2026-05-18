import { NextRequest, NextResponse } from 'next/server'
import { getExpenses, addExpense, deleteExpense } from '@/lib/sheets'
export async function GET() {
  try { return NextResponse.json(await getExpenses()) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  try { const id = await addExpense(await req.json()); return NextResponse.json({ id }, { status: 201 }) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function DELETE(req: NextRequest) {
  try { await deleteExpense((await req.json()).id); return NextResponse.json({ ok: true }) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
