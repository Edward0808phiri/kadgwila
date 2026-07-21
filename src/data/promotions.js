// `scope` is either 'all' or a specific event id.
export const promotions = [
  {
    code: 'ZED10',
    icon: 'tag',
    title: '10% off your booking',
    blurb: 'First time here? Take 10% off any paid ticket.',
    kind: 'percent',
    value: 10,
    scope: 'all',
  },
  {
    code: 'YOMAPS20',
    icon: 'music',
    title: '20% off Lusaka July',
    blurb: 'Yo Maps & Friends at Heroes Stadium, 25 July.',
    kind: 'percent',
    value: 20,
    scope: 'evt-001',
  },
  {
    code: 'JAZZ50',
    icon: 'ticket',
    title: 'K50 off Jazz by the Falls',
    blurb: 'K50 off each ticket to the Livingstone sunset session.',
    kind: 'flat',
    value: 50,
    scope: 'evt-004',
  },
]

const byCode = Object.fromEntries(promotions.map((p) => [p.code, p]))

/** @returns {{ok: boolean, promo?: object, discount?: number, reason?: string}} */
export function applyPromo(rawCode, event, total) {
  const code = String(rawCode).trim().toUpperCase()
  if (!code) return { ok: false, reason: 'Enter a promo code' }

  const promo = byCode[code]
  if (!promo) return { ok: false, reason: "We don't recognise that code" }

  if (promo.scope !== 'all' && promo.scope !== event.id) {
    return { ok: false, reason: `That code isn't valid for ${event.title}` }
  }

  const raw = promo.kind === 'percent' ? (total * promo.value) / 100 : promo.value
  return { ok: true, promo, discount: Math.min(total, Math.round(raw)) }
}
