const decimal = new Intl.NumberFormat('en-GB')

/** Kwacha, no decimals — Zambian ticket prices are always whole. */
export const kwacha = (n) => `K${decimal.format(Math.round(n))}`

/** Price for display: free events read as "Free", not "K0". */
export const price = (n) => (n === 0 ? 'Free' : kwacha(n))

export const count = (n) => decimal.format(n)

export const compact = (n) =>
  new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

const date = (iso, opts) => new Date(iso).toLocaleDateString('en-GB', opts)

export const dayMonth = (iso) => date(iso, { day: 'numeric', month: 'short' })
export const weekdayShort = (iso) => date(iso, { weekday: 'short', day: 'numeric', month: 'short' })
export const weekdayLong = (iso) => date(iso, { weekday: 'long', day: 'numeric', month: 'long' })
export const fullDate = (iso) => date(iso, { day: 'numeric', month: 'short', year: 'numeric' })

/** Split parts for the date chip on an event card. */
export const dateParts = (iso) => {
  const d = new Date(iso)
  return {
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
    day: d.toLocaleDateString('en-GB', { day: 'numeric' }),
  }
}

export const timestamp = (ms) =>
  new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const isPast = (iso) => new Date(iso).getTime() < Date.now()

/** "Tomorrow", "In 3 days", "Sat 11 Jul" — whichever reads best. */
export const whenLabel = (iso) => {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return 'Past event'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 6) return `In ${days} days`
  return weekdayShort(iso)
}

export const distance = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(km < 10 ? 1 : 0)} km away`
