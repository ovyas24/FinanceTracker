'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
    })
    if (res.ok) { router.push('/dashboard') }
    else { const d = await res.json(); setErr(d.error || 'Invalid credentials') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Finance Tracker</h1>
          <p className="text-slate-400 mt-1 text-sm">Your personal money dashboard</p>
        </div>
        <form onSubmit={submit} className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 space-y-4 border border-slate-700/50 shadow-xl">
          {err && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">{err}</div>}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Username</label>
            <input value={u} onChange={e => setU(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              placeholder="Enter username" required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
            <input type="password" value={p} onChange={e => setP(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              placeholder="Enter password" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20">
            <Lock className="w-4 h-4" />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
