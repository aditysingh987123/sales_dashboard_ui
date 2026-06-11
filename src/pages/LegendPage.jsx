import Badge from '../components/Badge'
import React from "react";

const rows = [
  ['E', 'Existing', 'Account Type'], ['N', 'New', 'Account Type'], ['L', 'Leasing', 'Business Opportunity We Have'], ['R', 'Renting', 'Business Opportunity We Have'], ['H', 'Hybrid', 'Business Opportunity We Have'], ['Complete', 'Complete', 'Order Status'], ['Pending', 'Pending', 'Order Status'], ['ND', 'Not Delivered', 'Delivery Status'], ['PD', 'Partial Delivered', 'Delivery Status'], ['D', 'Delivered', 'Delivery Status']
]
export default function LegendPage(){
 return <main className="mx-auto max-w-5xl p-4 md:p-6"><div className="mb-6"><h1 className="text-3xl font-black">Legend</h1><p className="text-slate-500">Short codes used in the account cards and tables.</p></div><div className="grid gap-4 md:grid-cols-2">{rows.map(([code,label,type])=><div className="card flex items-center justify-between gap-4" key={code}><div><p className="text-xs font-bold text-slate-500">{type}</p><p className="text-lg font-black">{label}</p></div><Badge>{code}</Badge></div>)}</div></main>
}
