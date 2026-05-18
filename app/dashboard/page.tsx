'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Download, Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

const inr = (n: number) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n)

function Card({ label, value, sub, icon: Icon, accent }: any) {
  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-xl font-bold text-white leading-tight">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [exp, setExp] = useState<any[]>([])
  const [inc, setInc] = useState<any[]>([])
  const [hol, setHol] = useState<any[]>([])
  const [acc, setAcc] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/expenses').then(r=>r.json()),
      fetch('/api/income').then(r=>r.json()),
      fetch('/api/holdings').then(r=>r.json()),
      fetch('/api/accounts').then(r=>r.json()),
    ]).then(([e,i,h,a]) => {
      setExp(Array.isArray(e)?e:[]); setInc(Array.isArray(i)?i:[])
      setHol(Array.isArray(h)?h:[]); setAcc(Array.isArray(a)?a:[])
      setLoading(false)
    })
  }, [])

  const now = new Date()
  const interval = { start: startOfMonth(now), end: endOfMonth(now) }
  const inMonth = (d: string) => { try { return isWithinInterval(parseISO(d), interval) } catch { return false } }
  const mExp = exp.filter(e => inMonth(e.date)).reduce((s,e) => s+e.amount, 0)
  const mInc = inc.filter(i => inMonth(i.date)).reduce((s,i) => s+i.amount, 0)
  const totalAcc = acc.reduce((s,a) => s+a.balance, 0)
  const totalHol = hol.reduce((s,h) => s+h.amount, 0)
  const netWorth = totalAcc + totalHol
  const holByType: Record<string,number> = {}
  hol.forEach(h => { holByType[h.type] = (holByType[h.type]||0) + h.amount })
  const recent = [...exp].sort((a,b) => b.date.localeCompare(a.date)).slice(0,6)

  async function doExport() {
    const res = await fetch('/api/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `finance-${format(now,'yyyy-MM')}.xlsx`; a.click()
  }

  if (loading) return (
    <div className="md:pl-60 flex items-center justify-center min-h-screen">
      <Navbar />
      <div className="text-slate-400 text-sm">Loading your data…</div>
    </div>
  )

  const savings = mInc - mExp

  return (
    <div className="md:pl-60 pb-24 md:pb-8">
      <Navbar />
      <main className="p-4 md:p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-slate-400">{format(now, 'MMMM yyyy')}</p>
          </div>
          <button onClick={doExport}
            className="flex items-center gap-1.5 text-xs bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-600/50 transition-all">
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>

        {/* Net Worth Banner */}
        <div className="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 rounded-2xl p-5 border border-blue-500/30 mb-5 backdrop-blur">
          <p className="text-blue-200 text-xs font-medium mb-1">Total Net Worth</p>
          <p className="text-3xl font-bold text-white">{inr(netWorth)}</p>
          <div className="flex gap-4 mt-3">
            <div><p className="text-blue-200 text-xs">Cash & Bank</p><p className="text-white font-semibold text-sm">{inr(totalAcc)}</p></div>
            <div><p className="text-blue-200 text-xs">Investments</p><p className="text-white font-semibold text-sm">{inr(totalHol)}</p></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Card label="This Month Income" value={inr(mInc)} icon={TrendingUp} accent="bg-green-600" />
          <Card label="This Month Expenses" value={inr(mExp)} icon={TrendingDown} accent="bg-red-500" />
          <Card label="Monthly Savings" value={inr(Math.abs(savings))} sub={savings >= 0 ? 'surplus' : 'deficit'} icon={Wallet} accent={savings >= 0 ? 'bg-emerald-600' : 'bg-orange-600'} />
          <Card label="Investments" value={inr(totalHol)} icon={PiggyBank} accent="bg-violet-600" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Accounts */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
            <h2 className="text-sm font-semibold text-white mb-3">Bank Accounts</h2>
            {acc.length === 0
              ? <p className="text-slate-500 text-sm">No accounts — add one in Holdings</p>
              : acc.map(a => (
                <div key={a.id} className="flex justify-between items-center py-2.5 border-b border-slate-700/50 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">{a.bank_name}</p>
                    <p className="text-xs text-slate-500">{a.account_type}</p>
                  </div>
                  <span className="text-sm font-bold text-green-400">{inr(a.balance)}</span>
                </div>
              ))}
          </div>

          {/* Holdings */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
            <h2 className="text-sm font-semibold text-white mb-3">Investment Breakdown</h2>
            {Object.keys(holByType).length === 0
              ? <p className="text-slate-500 text-sm">No investments — add in Holdings</p>
              : <>
                {Object.entries(holByType).sort((a,b)=>b[1]-a[1]).map(([type,amt]) => (
                  <div key={type} className="mb-2.5">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{type}</span>
                      <span>{inr(amt as number)} ({totalHol > 0 ? Math.round((amt as number)/totalHol*100) : 0}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full">
                      <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{width: `${totalHol > 0 ? (amt as number)/totalHol*100 : 0}%`}} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-slate-700/50 mt-2">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-sm font-bold text-blue-400">{inr(totalHol)}</span>
                </div>
              </>}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
          <h2 className="text-sm font-semibold text-white mb-3">Recent Expenses</h2>
          {recent.length === 0
            ? <p className="text-slate-500 text-sm">No expenses yet</p>
            : recent.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-slate-700/50 last:border-0">
                <div>
                  <p className="text-sm text-white">{e.category}</p>
                  <p className="text-xs text-slate-500">{e.note ? `${e.note} · ` : ''}{e.payment_mode} · {e.date}</p>
                </div>
                <span className="text-sm font-bold text-red-400">-{inr(e.amount)}</span>
              </div>
            ))}
        </div>
      </main>
    </div>
  )
}
