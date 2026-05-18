'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CreditCard, TrendingUp, PiggyBank, LogOut } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: CreditCard },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/holdings', label: 'Holdings', icon: PiggyBank },
]

export default function Navbar() {
  const path = usePathname()
  const router = useRouter()
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }
  return (
    <>
      <aside className="hidden md:flex flex-col w-60 bg-slate-800/50 border-r border-slate-700/50 min-h-screen p-4 fixed backdrop-blur">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/30">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Finance Tracker</span>
        </div>
        <nav className="flex-1 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-700/50 text-sm font-medium transition-all">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/90 border-t border-slate-700/50 z-50 backdrop-blur-md">
        <div className="flex items-center justify-around py-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href
            return (
              <Link key={href} href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl ${active ? 'text-blue-400' : 'text-slate-500'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
