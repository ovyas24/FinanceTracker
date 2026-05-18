'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Plus, Trash2, X } from 'lucide-react'
import { EXPENSE_CATEGORIES } from '@/lib/types'
import { format } from 'date-fns'

const inr = (n: number) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n)
const MODES = ['UPI','Cash','Card','Net Banking'] as const

export default function ExpensesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [month, setMonth] = useState(format(new Date(),'yyyy-MM'))
  const [cat, setCat] = useState('')
  const [form, setForm] = useState<{ date:string; category:string; amount:string; note:string; payment_mode:typeof MODES[number] }>({ date:format(new Date(),'yyyy-MM-dd'), category:'Food & Dining', amount:'', note:'', payment_mode:'UPI' })

  async function load() {
    const d = await fetch('/api/expenses').then(r=>r.json())
    setItems(Array.isArray(d) ? d.sort((a:any,b:any)=>b.date.localeCompare(a.date)) : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch('/api/expenses', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({...form, amount:parseFloat(form.amount)}) })
    setForm({ date:format(new Date(),'yyyy-MM-dd'), category:'Food & Dining', amount:'', note:'', payment_mode:'UPI' })
    setShow(false); setSaving(false); await load()
  }

  async function del(id: string) {
    if (!confirm('Delete this expense?')) return
    await fetch('/api/expenses', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    await load()
  }

  const list = items.filter(e => (!month || e.date.startsWith(month)) && (!cat || e.category === cat))
  const total = list.reduce((s,e) => s+e.amount, 0)
  const byCat: Record<string,number> = {}
  list.forEach(e => { byCat[e.category] = (byCat[e.category]||0)+e.amount })

  return (
    <div className="md:pl-60 pb-24 md:pb-8">
      <Navbar />
      <main className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Expenses</h1>
          <button onClick={() => setShow(true)} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 text-white text-sm font-medium px-3 py-2 rounded-xl shadow-lg shadow-red-500/20 transition-all">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40" />
          <select value={cat} onChange={e=>setCat(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40">
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-4">
          <p className="text-xs text-slate-400">Total · {list.length} transactions</p>
          <p className="text-2xl font-bold text-red-400">{inr(total)}</p>
        </div>

        {Object.keys(byCat).length > 0 && (
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">By Category</h2>
            {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,amt]) => (
              <div key={c} className="mb-2.5">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{c}</span><span>{inr(amt as number)} · {total>0?Math.round((amt as number)/total*100):0}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full">
                  <div className="h-1.5 bg-red-500 rounded-full" style={{width:`${total>0?(amt as number)/total*100:0}%`}} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {loading ? <p className="text-slate-500 text-sm text-center py-6">Loading…</p>
            : list.length === 0 ? <p className="text-slate-500 text-sm text-center py-6">No expenses for this period</p>
            : list.map(e => (
              <div key={e.id} className="bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/50 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{e.category}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{e.payment_mode}</span>
                  </div>
                  {e.note && <p className="text-xs text-slate-500 truncate mt-0.5">{e.note}</p>}
                  <p className="text-xs text-slate-600 mt-0.5">{e.date}</p>
                </div>
                <span className="text-sm font-bold text-red-400 shrink-0">{inr(e.amount)}</span>
                <button onClick={()=>del(e.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      </main>

      {show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-slate-800 rounded-t-3xl md:rounded-2xl w-full md:max-w-md border border-slate-700/50 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Add Expense</h2>
                <button onClick={()=>setShow(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Date</label>
                    <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
                      placeholder="0" min="0" step="0.01"
                      className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40">
                    {EXPENSE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-2">Payment Mode</label>
                  <div className="grid grid-cols-4 gap-2">
                    {MODES.map(m => (
                      <button key={m} type="button" onClick={()=>setForm(f=>({...f,payment_mode:m}))}
                        className={`py-2 rounded-xl text-xs font-medium transition-all ${form.payment_mode===m?'bg-red-500 text-white shadow-sm':'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Note (optional)</label>
                  <input type="text" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}
                    placeholder="e.g. Lunch at office"
                    className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40" />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20">
                  {saving ? 'Saving…' : 'Add Expense'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
