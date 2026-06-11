export function todayDDMMYY() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}/${mm}/${yy}`
}

export function uid(prefix = 'ID') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`
}
