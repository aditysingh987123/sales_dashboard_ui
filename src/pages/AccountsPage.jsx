import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw, Search } from 'lucide-react'
import Badge from '../components/Badge'
import { BUSINESS_OPPORTUNITIES, DELIVERY_STATUSES } from '../data/constants'

function labelFor(list, code) {
  return list.find((item) => item.code === code)?.label || code
}

function totalQty(account) {
  return (account.devices || []).reduce((sum, device) => sum + Number(device.quantity || 0), 0)
}

function totalValue(account) {
  return (account.devices || []).reduce(
    (sum, device) => sum + Number(device.quantity || 0) * Number(device.pricePerMonth || 0),
    0,
  )
}

export default function AccountsPage({ accounts, loading, error, onRefresh }) {
  const [q, setQ] = React.useState('')

  const filtered = accounts.filter((account) => {
    return `${account.companyName} ${account.contactPerson} ${account.mobile} ${account.city}`
      .toLowerCase()
      .includes(q.toLowerCase())
  })

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black">Accounts</h1>
          <p className="text-slate-500">Demo CRM data from Google Sheet.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={onRefresh} className="btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
          <Link to="/accounts/new" className="btn-primary">
            <Plus size={16} /> Add Account
          </Link>
        </div>
      </div>

      <div className="card mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            className="form-input !mt-0 !pl-11"
            placeholder="Search company, contact, mobile, city"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {error ? (
          <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">
            {error}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="card text-center font-bold">Loading...</div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Company</th>
                  <th className="p-4">Codes</th>
                  <th className="p-4">Opportunity</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Monthly Value</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((account) => (
                  <tr className="border-t border-slate-100" key={account.accountId}>
                    <td className="p-4">
                      <p className="font-black">{account.companyName}</p>
                      <p className="text-xs text-slate-500">
                        {account.contactPerson} • {account.mobile}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{account.accountType}</Badge>
                        <Badge>{labelFor(BUSINESS_OPPORTUNITIES, account.businessOpportunityWeHave)}</Badge>
                        <Badge>{account.deliveryStatus}</Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      {labelFor(BUSINESS_OPPORTUNITIES, account.businessOpportunityWeHave)}
                    </td>
                    <td className="p-4 font-black">{totalQty(account)}</td>
                    <td className="p-4 font-black">
                      ₹{totalValue(account).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <Badge>{account.orderStatus}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Link className="btn-secondary !py-2" to={`/accounts/${account.accountId}`}>
                          View / Update
                        </Link>
                        <Link
                          className="btn-primary !py-2"
                          to={`/accounts/${account.accountId}?addDevice=1`}
                        >
                          <Plus size={14} /> Add Device
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filtered.map((account) => (
              <div key={account.accountId} className="card block">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">{account.companyName}</h2>
                    <p className="text-sm font-semibold text-slate-500">
                      {account.contactPerson} • {account.city}
                    </p>
                  </div>
                  <Badge>{account.orderStatus}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{account.accountType}</Badge>
                  <Badge>{labelFor(BUSINESS_OPPORTUNITIES, account.businessOpportunityWeHave)}</Badge>
                  <Badge>{account.deliveryStatus}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-bold text-slate-500">Total Qty</p>
                    <p className="text-lg font-black">{totalQty(account)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-bold text-slate-500">Monthly Value</p>
                    <p className="text-lg font-black">
                      ₹{totalValue(account).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs font-bold text-slate-500">
                  {labelFor(BUSINESS_OPPORTUNITIES, account.businessOpportunityWeHave)} •{' '}
                  {labelFor(DELIVERY_STATUSES, account.deliveryStatus)}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link className="btn-secondary justify-center" to={`/accounts/${account.accountId}`}>
                    View / Update
                  </Link>
                  <Link
                    className="btn-primary justify-center"
                    to={`/accounts/${account.accountId}?addDevice=1`}
                  >
                    <Plus size={16} /> Add Device
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
