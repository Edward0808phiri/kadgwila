/**
 * Zambian mobile numbers.
 *
 * National format is 0XX XXX XXXX; the operator lives in the two digits
 * after the trunk zero. Both the 09x and 07x ranges are in use, which the
 * old 09x-only check rejected.
 */
export const NETWORKS = {
  airtel: { id: 'airtel', name: 'Airtel Money', short: 'Airtel', colour: '#e8112d', prefixes: ['97', '77'] },
  mtn: { id: 'mtn', name: 'MTN MoMo', short: 'MTN', colour: '#ffcc00', prefixes: ['96', '76'] },
  zamtel: { id: 'zamtel', name: 'Zamtel Kwacha', short: 'Zamtel', colour: '#00a651', prefixes: ['95', '75'] },
}

export const networkList = Object.values(NETWORKS)

const byPrefix = new Map(
  networkList.flatMap((n) => n.prefixes.map((p) => [p, n.id])),
)

/**
 * Reduce any of +260977123456 / 260977123456 / 0977123456 / 977123456
 * to the nine national digits, or null if it can't be one.
 */
function nationalDigits(input) {
  let d = String(input).replace(/\D/g, '')
  if (d.startsWith('260')) d = d.slice(3)
  else if (d.startsWith('0')) d = d.slice(1)
  return d.length === 9 ? d : null
}

export function parsePhone(input) {
  const digits = nationalDigits(input)
  if (!digits) return { valid: false }

  const network = byPrefix.get(digits.slice(0, 2))
  if (!network) return { valid: false }

  return {
    valid: true,
    network,
    national: `0${digits}`,
    e164: `+260${digits}`,
    display: `0${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`,
  }
}

export const isValidPhone = (input) => parsePhone(input).valid

/** Group digits as the user types, without fighting deletions. */
export function formatPhoneInput(input) {
  const d = String(input).replace(/\D/g, '').slice(0, 12)
  if (d.startsWith('260')) {
    const rest = d.slice(3)
    return `+260 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`.trimEnd()
  }
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean)
  return parts.join(' ')
}

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v).trim())
