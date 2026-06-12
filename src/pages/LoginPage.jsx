import { useState } from 'react'
import React from "react";

import { ShieldCheck } from 'lucide-react'
export default function LoginPage({ onLogin }) {
  const [mobile, setMobile] = useState('1234567890')
  const [otp, setOtp] = useState('1234')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault(); setError('')
    if (!sent) { if (mobile.length < 10) return setError('Enter valid mobile number'); setSent(true); return }
    if (otp !== '1234') return setError('Demo OTP is 1234')
    onLogin()
  }
  return <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 p-4">
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-4 md:grid-cols-2">
      <section>
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-3xl bg-brand-700 text-2xl font-black text-white">C</div>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Mobile-first sales demo UI</h1>
      </section>
      <form onSubmit={submit} className="card mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center gap-3"><ShieldCheck className="text-brand-700"/><div><h2 className="text-2xl font-black">Login</h2><p className="text-sm text-slate-500">Demo OTP verification</p></div></div>
        <label className="block"><span className="form-label">Mobile Number</span><input className="form-input" value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="Enter mobile number"/></label>
        {sent && <label className="mt-4 block"><span className="form-label">OTP</span><input className="form-input" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="1234"/></label>}
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button className="btn-primary mt-6 w-full">{sent ? 'Verify OTP' : 'Send OTP'}</button>
      </form>
    </div>
  </main>
}
