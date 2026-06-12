import React from "react";


const MAP = {
  E: 'bg-blue-50 text-blue-700 border-blue-100',
  N: 'bg-purple-50 text-purple-700 border-purple-100',
  L: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  R: 'bg-amber-50 text-amber-700 border-amber-100',
  H: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  UNKNOWN: 'bg-slate-50 text-slate-700 border-slate-100',
  ND: 'bg-red-50 text-red-700 border-red-100',
  PD: 'bg-orange-50 text-orange-700 border-orange-100',
  D: 'bg-green-50 text-green-700 border-green-100',
  Complete: 'bg-green-50 text-green-700 border-green-100',
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  Approved: 'bg-green-50 text-green-700 border-green-100',
  Rejected: 'bg-red-50 text-red-700 border-red-100',
}

export default function Badge({ children }) {
  const displayValue = children === 'UNKNOWN' ? "This contact don't know" : children

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${MAP[children] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
      {displayValue || '-'}
    </span>
  )
}
