// Promo codes. `scope` is either 'all' or a specific event id.
// kind 'percent' → value is % off, kind 'flat' → value is K off.
export const promotions = [
  {
    code: 'ZED10',
    tone: 'coral',
    emoji: '🎉',
    title: '10% off your booking',
    blurb: 'New here? Take 10% off anything — free events already sorted.',
    kind: 'percent',
    value: 10,
    scope: 'all',
  },
  {
    code: 'YOMAPS20',
    tone: 'gold',
    emoji: '🎤',
    title: '20% off Lusaka July',
    blurb: 'Yo Maps & Friends live — biggest night of the month, cheaper.',
    kind: 'percent',
    value: 20,
    scope: 'evt-001',
  },
  {
    code: 'JAZZ50',
    tone: 'green',
    emoji: '🎷',
    title: 'K50 off Jazz by the Falls',
    blurb: 'Sunset jazz in Livingstone — K50 knocked off each ticket.',
    kind: 'flat',
    value: 50,
    scope: 'evt-004',
  },
]

const byCode = Object.fromEntries(promotions.map((p) => [p.code, p]))

// Returns { promo, discount, ok, reason } for a code against an event + total.
export function applyPromo(rawCode, event, total) {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { ok: false }
  const promo = byCode[code]
  if (!promo) return { ok: false, reason: "We don't recognise that code" }
  if (promo.scope !== 'all' && promo.scope !== event.id)
    return { ok: false, reason: `That code isn't valid for ${event.title}` }
  const raw = promo.kind === 'percent' ? (total * promo.value) / 100 : promo.value
  const discount = Math.min(total, Math.round(raw))
  return { ok: true, promo, discount }
}
