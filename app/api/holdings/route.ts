import { NextRequest, NextResponse } from 'next/server'
import { getHoldings, addHolding, updateHolding, deleteHolding } from '@/lib/sheets'
export async function GET() {
  try { return NextResponse.json(await getHoldings()) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  try { const id = await addHolding(await req.json()); return NextResponse.json({ id }, { status: 201 }) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function PUT(req: NextRequest) {
  try { const { id, ...body } = await req.json(); await updateHolding(id, body); return NextResponse.json({ ok: true }) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function DELETE(req: NextRequest) {
  try { await deleteHolding((await req.json()).id); return NextResponse.json({ ok: true }) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
