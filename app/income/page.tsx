'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Plus, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'

const inr = (n: number) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n)
const TYPES = ['Salary','Freelance','Rental','Investment Returns','Other'] as const

export default function IncomePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [month, setMonth] = useState(format(new Date(),'yyyy-MM'))
  const [form, setForm] = useState({ date:format(new Date(),'yyyy-MM-dd'), type:'Salary' as const, amount:'', note:'' })

  async function load() {
    const d = await fetch('/api/income').then(r=>r.json())
    setItems(Array.isArray(d) ? d.sort((a:any,b:any)=>b.date.localeCompare(a.date)) : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch('/api/income', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({...form, amount:parseFloat(form.amount)}) })
    setForm({ date:format(new Date(),'yyyy-MM-dd'), type:'Salary', amount:'', note:'' })
    setShow(false); setSaving(false); await load()
  }

  async function del(id: string) {
    if (!confirm('Delete?')) return
    await fetch('/api/income', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    await load()
  }

  const list = items.filter(i => !month || i.date.startsWith(month))
  const total = list.reduce((s,i) => s+i.amount, 0)
  const byType: Record<string,number> = {}
  list.forEach(i => { byType[i.type] = (byType[i.type]||0)+i.amount })

  return (
    <div className="md:pl-60 pb-24 md:pb-8">
      <Navbar />
      <main className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Income</h1>
          <button onClick={()=>setShow(true)} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-3 py-2 rounded-xl shadow-lg shadow-green-600/20 transition-all">
            <Plus className="w-4 h-4" /> Add Income
          </button>
        </div>

        <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500/40" />

        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-4">
          <p className="text-xs text-slate-400">Total Income · {list.length} entries</p>
          <p className="text-2xl font-bold text-green-400">{inr(total)}</p>
        </div>

        {Object.keys(byType).length > 0 && (
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-4 space-y-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">By Type</h2>
            {Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([t,amt]) => (
              <div key={t} className="flex justify-between py-1.5 border-b border-slate-700/50 last:border-0">
                <span className="text-sm text-slate-300">{t}</span>
                <span className="text-sm font-semibold text-green-400">{inr(amt as number)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {loading ? <p className="text-slate-500 text-sm text-center py-6">Loading…</p>
            : list.length === 0 ? <p className="text-slate-500 text-sm text-center py-6">No income for this month</p>
            : list.map(i => (
              <div key={i.id} className="bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/50 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{i.type}</p>
                  {i.note && <p className="text-xs text-slate-500 truncate">{i.note}</p>}
                  <p className="text-xs text-slate-600">{i.date}</p>
                </div>
                <span className="text-sm font-bold text-green-400 shrink-0">{inr(i.amount)}</span>
                <button onClick={()=>del(i.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
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
                <h2 className="text-lg font-bold text-white">Add Income</h2>
                <button onClick={()=>setShow(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Date</label>
                    <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/40" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
                      placeholder="0" min="0"
                      className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/40" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-2">Income Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPES.map(t => (
                      <button key={t} type="button" onClick={()=>setForm(f=>({...f,type:t}))}
                        className={`py-2 rounded-xl text-xs font-medium transition-all ${form.type===t?'bg-green-600 text-white':'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Note (optional)</label>
                  <input type="text" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}
                    placeholder="e.g. April salary"
                    className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/40" />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-600/20 transition-all">
                  {saving ? 'Saving…' : 'Add Income'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
