import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import { DEMO_ACCOUNTS } from './data/demoData'
import { googleSheetApi } from './api/googleSheetApi'
import LoginPage from './pages/LoginPage'
import AccountsPage from './pages/AccountsPage'
import AddAccountPage from './pages/AddAccountPage'
import AccountDetailsPage from './pages/AccountDetailsPage'
import LegendPage from './pages/LegendPage'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('cps_demo_login') === 'yes')
  const [accounts, setAccounts] = useState(DEMO_ACCOUNTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const rows = await googleSheetApi.listAccounts()
      setAccounts(rows.length ? rows : DEMO_ACCOUNTS)
    } catch (e) {
      setError(`Google Sheet not connected yet. Showing demo data. ${e.message}`)
      setAccounts(DEMO_ACCOUNTS)
    } finally { setLoading(false) }
  }

  useEffect(() => { if (loggedIn) load() }, [loggedIn])

  const login = () => { sessionStorage.setItem('cps_demo_login', 'yes'); setLoggedIn(true) }
  const logout = () => { sessionStorage.removeItem('cps_demo_login'); setLoggedIn(false) }

  const saveAccount = async (account) => {
    try {
      const saved = await googleSheetApi.saveAccount(account)
      setAccounts(prev => [saved, ...prev.filter(a => a.accountId !== saved.accountId)])
      return saved
    } catch (e) {
      setAccounts(prev => [account, ...prev.filter(a => a.accountId !== account.accountId)])
      return account
    }
  }

  const updateAccount = async (account) => {
    try {
      const saved = await googleSheetApi.updateAccount(account)
      setAccounts(prev => prev.map(a => a.accountId === saved.accountId ? saved : a))
      return saved
    } catch (e) {
      setAccounts(prev => prev.map(a => a.accountId === account.accountId ? account : a))
      return account
    }
  }

  return <BrowserRouter>
    {!loggedIn ? <Routes><Route path="*" element={<LoginPage onLogin={login}/>} /></Routes> : <>
      <Header onLogout={logout}/>
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/accounts" replace/>}/>
          <Route path="/accounts" element={<AccountsPage accounts={accounts} loading={loading} error={error} onRefresh={load}/>}/>
          <Route path="/accounts/new" element={<AddAccountPage accounts={accounts} onSave={saveAccount}/>}/>
          <Route path="/accounts/:id" element={<AccountDetailsPage accounts={accounts} onUpdate={updateAccount}/>}/>
          <Route path="/legend" element={<LegendPage/>}/>
          <Route path="*" element={<Navigate to="/accounts" replace/>}/>
        </Routes>
      </div>
    </>}
  </BrowserRouter>
}
