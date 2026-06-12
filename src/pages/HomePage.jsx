import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Building2, PencilLine } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <section className="home-hero card">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">Hunting App</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
          What do you want to do?
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500 md:text-base">
          Choose one action. This keeps the mobile UI clean and reduces unnecessary scrolling.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link className="home-action-card" to="/accounts">
            <BarChart3 size={26} />
            <span>Dashboard</span>
            <small>View and track accounts</small>
          </Link>
          <Link className="home-action-card" to="/accounts/new">
            <Building2 size={26} />
            <span>Add Account</span>
            <small>Create a new company visit record</small>
          </Link>
          <Link className="home-action-card" to="/accounts?mode=edit">
            <PencilLine size={26} />
            <span>Edit Account</span>
            <small>Select company and update details</small>
          </Link>
        </div>
      </section>
    </main>
  )
}
