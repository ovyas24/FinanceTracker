'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'

const inr = (n: number) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n)
const H_TYPES = ['FD','SIP','Stocks','PPF','EPF','NPS'] as const
const A_TYPES = ['Savings','Current','Salary','NRE','NRO'] as const
type Tab = 'accounts'|'holdings'

const BADGE: Record<string,string> = {
  FD:'bg-amber-500/20 text-amber-300', SIP:'bg-purple-500/20 text-purple-300',
  Stocks:'bg-blue-500/20 text-blue-300', PPF:'bg-green-500/20 text-green-300',
  EPF:'bg-teal-500/20 text-teal-300', NPS:'bg-indigo-500/20 text-indigo-300',
}

export default function HoldingsPage() {
  const [tab, setTab] = useState<Tab>('accounts')
  const [hol, setHol] = useState<any[]>([])
  const [acc, setAcc] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const today = format(new Date(),'yyyy-MM-dd')

  const [hf, setHf] = useState({ type:'SIP', name:'', amount:'', units:'', buy_price:'', maturity_date:'', last_updated:today })
  const [af, setAf] = useState({ bank_name:'', account_type:'Savings', balance:'', last_updated:today })

  async function load() {
    const [h,a] = await Promise.all([fetch('/api/holdings').then(r=>r.json()), fetch('/api/accounts').then(r=>r.json())])
    setHol(Array.isArray(h)?h:[]); setAcc(Array.isArray(a)?a:[])
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  async function submitHolding(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const body = {...hf, amount:parseFloat(hf.amount)}
    if (editItem) {
      await fetch('/api/holdings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:editItem.id,...body})})
    } else {
      await fetch('/api/holdings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    }
    setSaving(false); setShow(false); setEditItem(null)
    setHf({type:'SIP',name:'',amount:'',units:'',buy_price:'',maturity_date:'',last_updated:today})
    await load()
  }

  async function submitAccount(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const body = {...af, balance:parseFloat(af.balance)}
    if (editItem) {
      await fetch('/api/accounts',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:editItem.id,...body})})
    } else {
      await fetch('/api/accounts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    }
    setSaving(false); setShow(false); setEditItem(null)
    setAf({bank_name:'',account_type:'Savings',balance:'',last_updated:today})
    await load()
  }

  async function delH(id:string) {
    if(!confirm('Delete?')) return
    await fetch('/api/holdings',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
    await load()
  }
  async function delA(id:string) {
    if(!confirm('Delete?')) return
    await fetch('/api/accounts',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
    await load()
  }

  function editH(h:any) {
    setHf({type:h.type,name:h.name,amount:String(h.amount),units:h.units,buy_price:h.buy_price,maturity_date:h.maturity_date,last_updated:h.last_updated||today})
    setEditItem(h); setTab('holdings'); setShow(true)
  }
  function editA(a:any) {
    setAf({bank_name:a.bank_name,account_type:a.account_type,balance:String(a.balance),last_updated:a.last_updated||today})
    setEditItem(a); setTab('accounts'); setShow(true)
  }

  const totalHol = hol.reduce((s,h)=>s+h.amount,0)
  const totalAcc = acc.reduce((s,a)=>s+a.balance,0)

  return (
    <div className="md:pl-60 pb-24 md:pb-8">
      <Navbar />
      <main className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Holdings</h1>
          <button onClick={()=>{setEditItem(null);setShow(true)}}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-3 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['accounts','holdings'] as Tab[]).map(t => (
            <button key={t} onClick={()=>setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab===t?'bg-blue-600 text-white shadow-sm':'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
              {t==='accounts'?'Bank Accounts':'Investments'}
            </button>
          ))}
        </div>

        {tab==='accounts' && (
          <>
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-4">
              <p className="text-xs text-slate-400">Total Cash & Bank</p>
              <p className="text-2xl font-bold text-green-400">{inr(totalAcc)}</p>
            </div>
            <div className="space-y-2">
              {loading ? <p className="text-slate-500 text-sm text-center py-6">Loading…</p>
                : acc.length===0 ? <p className="text-slate-500 text-sm text-center py-6">No accounts yet</p>
                : acc.map(a => (
                  <div key={a.id} className="bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/50 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{a.bank_name}</p>
                      <p className="text-xs text-slate-500">{a.account_type} · updated {a.last_updated}</p>
                    </div>
                    <span className="text-sm font-bold text-green-400 shrink-0">{inr(a.balance)}</span>
                    <button onClick={()=>editA(a)} className="text-slate-600 hover:text-blue-400 transition-colors shrink-0"><Pencil className="w-4 h-4" /></button>
                    <button onClick={()=>delA(a.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
            </div>
          </>
        )}

        {tab==='holdings' && (
          <>
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-4">
              <p className="text-xs text-slate-400">Total Investments</p>
              <p className="text-2xl font-bold text-blue-400">{inr(totalHol)}</p>
            </div>
            <div className="space-y-2">
              {loading ? <p className="text-slate-500 text-sm text-center py-6">Loading…</p>
                : hol.length===0 ? <p className="text-slate-500 text-sm text-center py-6">No investments yet</p>
                : hol.map(h => (
                  <div key={h.id} className="bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/50 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{h.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${BADGE[h.type]||'bg-slate-700 text-slate-300'}`}>{h.type}</span>
                      </div>
                      {h.units && <p className="text-xs text-slate-500">{h.units} units{h.buy_price?` @ ₹${h.buy_price}`:''}</p>}
                      {h.maturity_date && <p className="text-xs text-slate-600">Matures: {h.maturity_date}</p>}
                    </div>
                    <span className="text-sm font-bold text-blue-400 shrink-0">{inr(h.amount)}</span>
                    <button onClick={()=>editH(h)} className="text-slate-600 hover:text-blue-400 transition-colors shrink-0"><Pencil className="w-4 h-4" /></button>
                    <button onClick={()=>delH(h.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
            </div>
          </>
        )}
      </main>

      {show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-slate-800 rounded-t-3xl md:rounded-2xl w-full md:max-w-md border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  {tab==='accounts' ? (editItem?'Edit Account':'Add Account') : (editItem?'Edit Investment':'Add Investment')}
                </h2>
                <button onClick={()=>{setShow(false);setEditItem(null)}} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {!editItem && (
                <div className="flex gap-2 mb-5">
                  {(['accounts','holdings'] as Tab[]).map(t => (
                    <button key={t} type="button" onClick={()=>setTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab===t?'bg-blue-600 text-white':'bg-slate-700 text-slate-300'}`}>
                      {t==='accounts'?'Bank Account':'Investment'}
                    </button>
                  ))}
                </div>
              )}

              {tab==='accounts' ? (
                <form onSubmit={submitAccount} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bank Name</label>
                    <input type="text" value={af.bank_name} onChange={e=>setAf(f=>({...f,bank_name:e.target.value}))}
                      placeholder="e.g. HDFC Bank, SBI"
                      className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-2">Account Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {A_TYPES.map(t => (
                        <button key={t} type="button" onClick={()=>setAf(f=>({...f,account_type:t}))}
                          className={`py-2 rounded-xl text-xs font-medium ${af.account_type===t?'bg-blue-600 text-white':'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Balance (₹)</label>
                      <input type="number" value={af.balance} onChange={e=>setAf(f=>({...f,balance:e.target.value}))}
                        placeholder="0" min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">As of Date</label>
                      <input type="date" value={af.last_updated} onChange={e=>setAf(f=>({...f,last_updated:e.target.value}))}
                        className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                    </div>
                  </div>
                  <button type="submit" disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
                    {saving?'Saving…':editItem?'Update Account':'Add Account'}
                  </button>
                </form>
              ) : (
                <form onSubmit={submitHolding} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-2">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {H_TYPES.map(t => (
                        <button key={t} type="button" onClick={()=>setHf(f=>({...f,type:t}))}
                          className={`py-2 rounded-xl text-xs font-medium ${hf.type===t?'bg-blue-600 text-white':'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Name</label>
                    <input type="text" value={hf.name} onChange={e=>setHf(f=>({...f,name:e.target.value}))}
                      placeholder="e.g. Axis Bluechip, INFY, SBI FD"
                      className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Current Value (₹)</label>
                      <input type="number" value={hf.amount} onChange={e=>setHf(f=>({...f,amount:e.target.value}))}
                        placeholder="0" min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Units (optional)</label>
                      <input type="text" value={hf.units} onChange={e=>setHf(f=>({...f,units:e.target.value}))}
                        placeholder="e.g. 50.23"
                        className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Buy Price (₹)</label>
                      <input type="text" value={hf.buy_price} onChange={e=>setHf(f=>({...f,buy_price:e.target.value}))}
                        placeholder="avg cost"
                        className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Maturity Date</label>
                      <input type="date" value={hf.maturity_date} onChange={e=>setHf(f=>({...f,maturity_date:e.target.value}))}
                        className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">As of Date</label>
                    <input type="date" value={hf.last_updated} onChange={e=>setHf(f=>({...f,last_updated:e.target.value}))}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <button type="submit" disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
                    {saving?'Saving…':editItem?'Update Investment':'Add Investment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
