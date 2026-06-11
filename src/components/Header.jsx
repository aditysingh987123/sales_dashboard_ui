import { Link, NavLink } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header({ onLogout }) {
  const [open, setOpen] = useState(false)
  const nav = [
    ['Accounts', '/accounts'],
    ['Add Account', '/accounts/new'],
    ['Legend', '/legend'],
  ]

  return (
    <header className="app-header border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="app-header-inner mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/accounts" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-700 text-lg font-black text-white">
            C
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">CPS Demo CRM</p>
            <p className="text-xs font-semibold text-slate-500">Google Sheet Powered</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {nav.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-2 text-sm font-bold ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <button onClick={onLogout} className="btn-secondary !py-2">
            <LogOut size={16} /> Logout
          </button>
        </nav>

        <button
          type="button"
          className="btn-secondary !px-3 !py-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open ? (
        <div className="app-mobile-menu border-t border-slate-100 bg-white p-4 md:hidden">
          <div className="grid gap-2">
            {nav.map(([label, to]) => (
              <NavLink
                onClick={() => setOpen(false)}
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-bold ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-50 text-slate-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button onClick={onLogout} className="btn-secondary">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
