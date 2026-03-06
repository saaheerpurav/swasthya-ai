import { Outlet, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/alerts', label: 'Alerts' },
  { to: '/admin/outbreaks', label: 'Outbreaks' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/queries', label: 'Queries' },
  { to: '/admin/vaccination', label: 'Vaccination' },
  { to: '/admin/analytics', label: 'Analytics' },
]

function AdminLayout() {
  const [adminKey, setAdminKey] = useState<string | null>(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('admin_key')
    setAdminKey(stored)
  }, [])

  const handleSubmit = () => {
    if (!input.trim()) return
    localStorage.setItem('admin_key', input.trim())
    setAdminKey(input.trim())
  }

  if (!adminKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
        {/* Decorative radial glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-800/20 blur-3xl" />
        </div>
        <div className="relative w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500 text-sm font-bold text-black">+</div>
            <span className="text-sm font-semibold tracking-tight text-slate-100">SwasthyaAI Admin</span>
          </div>
          <h1 className="text-base font-semibold text-slate-50">Secure Access</h1>
          <p className="mt-1 text-xs text-slate-400">
            Enter the admin key provided to health officials to access the control panel.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Admin key"
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30"
          />
          <button
            onClick={handleSubmit}
            className="mt-3 w-full rounded-lg bg-gradient-to-r from-green-500 to-green-400 px-3 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 active:scale-95"
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <aside className="hidden w-56 flex-col border-r border-slate-800/70 bg-slate-950 px-3 py-5 text-sm md:flex">
        {/* Sidebar logo */}
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500 text-xs font-bold text-black">+</div>
          <span className="text-xs font-semibold tracking-wide text-slate-200">SwasthyaAI</span>
          <span className="ml-0.5 rounded bg-slate-800 px-1 py-0.5 text-[9px] font-medium uppercase tracking-widest text-slate-400">admin</span>
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition ${
                  isActive
                    ? 'bg-green-500/15 font-semibold text-green-300 shadow-sm ring-1 ring-green-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`
              }
            >
              <span className="h-1 w-1 rounded-full bg-current opacity-60" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-800 pt-4">
          <a href="/" className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-slate-500 transition hover:bg-slate-900 hover:text-slate-300">← Back to site</a>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3 text-xs text-slate-300 backdrop-blur">
          <span className="font-medium text-slate-200">Admin Panel</span>
          <a href="/dashboard" className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white">
            Live Dashboard →
          </a>
        </header>
        <div className="p-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout

