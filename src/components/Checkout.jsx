import { useMemo, useState } from 'react'
import { addPurchase, startPlan } from '../store.js'
import { applyPromo } from '../data/promotions.js'

const money = (n) => (n === 0 ? 'FREE' : `K${n.toLocaleString()}`)
const networks = ['Airtel Money', 'MTN MoMo', 'Zamtel Kwacha']

// Deposit choices for the down-payment (layaway) plan.
const depositPcts = [
  { pct: 25, label: '25%' },
  { pct: 50, label: '50%' },
]
const planLengths = [2, 3, 4]

export default function Checkout({ event, onClose }) {
  const [qty, setQty] = useState(1)
  const [payMode, setPayMode] = useState('full') // 'full' | 'plan'
  const [depositPct, setDepositPct] = useState(25)
  const [months, setMonths] = useState(3)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    network: networks[0],
  })
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState(null) // { promo, discount }
  const [promoMsg, setPromoMsg] = useState('')
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})

  const isFree = event.price === 0
  const subtotal = event.price * qty
  const discount = promo?.discount ?? 0
  const total = Math.max(0, subtotal - discount)

  const deposit = useMemo(
    () => Math.round((total * depositPct) / 100),
    [total, depositPct],
  )
  const monthly = useMemo(
    () => Math.ceil((total - deposit) / months / 5) * 5,
    [total, deposit, months],
  )

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const applyCode = () => {
    const res = applyPromo(promoInput, event, subtotal)
    if (!res.ok) {
      setPromo(null)
      setPromoMsg(res.reason || 'Enter a promo code')
      return
    }
    setPromo(res)
    setPromoMsg('')
  }

  const validate = () => {
    const er = {}
    if (!form.name.trim()) er.name = 'Tell us your name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email'
    if (!/^(\+?26)?0?9[5-7]\d{7}$/.test(form.phone.replace(/\s/g, '')))
      er.phone = 'Enter a valid Zambian phone'
    if (!isFree && !/^(\+?26)?0?9[5-7]\d{7}$/.test(form.mobile.replace(/\s/g, '')))
      er.mobile = 'Enter the mobile money number'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    // In a real build this is where you'd hit the mobile-money payment API.
    const base = {
      eventId: event.id,
      title: event.title,
      artist: event.artist,
      category: event.category,
      city: event.city,
      venue: event.venue,
      date: event.date,
      time: event.time,
      image: event.image,
      qty,
      total,
    }
    if (!isFree && payMode === 'plan') {
      startPlan({ ...base, deposit, paymentsLeft: months })
    } else {
      addPurchase({ ...base, total: isFree ? 0 : total })
    }
    setDone(true)
  }

  const chargedNow = isFree ? 0 : payMode === 'plan' ? deposit : total

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {done ? (
          <div className="success">
            <div className="success-tick">✓</div>
            <h2>
              {isFree ? "You're in! 🎉" : payMode === 'plan' ? 'Plan started! 🎉' : 'Sorted! 🎉'}
            </h2>
            <p>
              {isFree
                ? `Your spot for ${event.title} is locked in.`
                : payMode === 'plan'
                  ? `We took your ${money(deposit)} deposit. Pay off the rest anytime from your account.`
                  : `Check your phone — we sent a prompt to ${form.mobile} on ${form.network}.`}
            </p>
            <p className="success-sub">
              {qty}× ticket{qty > 1 ? 's' : ''} for <strong>{event.title}</strong> saved to{' '}
              <strong>{form.email}</strong>. See you there, {form.name.split(' ')[0]}!
            </p>
            <button className="btn btn-green btn-block" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <span className="modal-cat">{event.category} · {event.city}</span>
              <h2>{event.title}</h2>
              <p className="modal-artist">{event.artist}</p>
            </div>

            <div className="qty-row">
              <span>Tickets</span>
              <div className="qty-ctrl">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <strong>{qty}</strong>
                <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
              </div>
            </div>

            <form className="form" onSubmit={submit} noValidate>
              <label>
                Full name
                <input value={form.name} onChange={set('name')} placeholder="Mwila Banda" />
                {errors.name && <em>{errors.name}</em>}
              </label>

              <label>
                Email
                <input value={form.email} onChange={set('email')} placeholder="you@email.com" type="email" />
                {errors.email && <em>{errors.email}</em>}
              </label>

              <label>
                Phone
                <input value={form.phone} onChange={set('phone')} placeholder="097 1234567" />
                {errors.phone && <em>{errors.phone}</em>}
              </label>

              {!isFree && (
                <>
                  <div className="promo-row">
                    <input
                      className="promo-input"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (e.g. ZED10)"
                    />
                    <button type="button" className="btn btn-outline promo-apply" onClick={applyCode}>
                      Apply
                    </button>
                  </div>
                  {promo && (
                    <div className="promo-ok">
                      ✓ <strong>{promo.promo.code}</strong> applied — you saved {money(discount)}
                    </div>
                  )}
                  {promoMsg && <div className="promo-bad">{promoMsg}</div>}

                  <div className="paymode">
                    <button
                      type="button"
                      className="paymode-opt"
                      data-active={payMode === 'full'}
                      onClick={() => setPayMode('full')}
                    >
                      <strong>Pay in full</strong>
                      <span>{money(total)} now</span>
                    </button>
                    <button
                      type="button"
                      className="paymode-opt"
                      data-active={payMode === 'plan'}
                      onClick={() => setPayMode('plan')}
                    >
                      <strong>Pay a deposit</strong>
                      <span>from {money(Math.round((total * 25) / 100))} now</span>
                    </button>
                  </div>

                  {payMode === 'plan' && (
                    <div className="plan-block">
                      <div className="plan-title">💳 Down-payment plan</div>
                      <div className="plan-sub">Pay a bit now, the rest at your pace.</div>

                      <div className="plan-choice">
                        <span>Deposit today</span>
                        <div className="seg">
                          {depositPcts.map((d) => (
                            <button
                              type="button"
                              key={d.pct}
                              data-active={depositPct === d.pct}
                              onClick={() => setDepositPct(d.pct)}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="plan-choice">
                        <span>Then split into</span>
                        <div className="seg">
                          {planLengths.map((n) => (
                            <button
                              type="button"
                              key={n}
                              data-active={months === n}
                              onClick={() => setMonths(n)}
                            >
                              {n}×
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="plan-breakdown">
                        <div>
                          <em>Today</em>
                          <strong>{money(deposit)}</strong>
                        </div>
                        <div className="plan-then">then</div>
                        <div>
                          <em>{months} payments of</em>
                          <strong>{money(monthly)}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pay-block">
                    <div className="pay-title">📱 Pay the easy way — Mobile Money</div>
                    <div className="network-row">
                      {networks.map((n) => (
                        <button
                          type="button"
                          key={n}
                          className="network"
                          data-active={form.network === n}
                          onClick={() => setForm((f) => ({ ...f, network: n }))}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <label>
                      Mobile money number
                      <input value={form.mobile} onChange={set('mobile')} placeholder="097 1234567" />
                      {errors.mobile && <em>{errors.mobile}</em>}
                    </label>
                  </div>
                </>
              )}

              {!isFree && discount > 0 && (
                <div className="total-row muted">
                  <span>Discount</span>
                  <strong>−{money(discount)}</strong>
                </div>
              )}
              <div className="total-row">
                <span>{payMode === 'plan' && !isFree ? 'Due today' : 'Total'}</span>
                <strong>{money(chargedNow)}</strong>
              </div>

              <button className={`btn ${isFree ? 'btn-green' : 'btn-primary'} btn-block`} type="submit">
                {isFree
                  ? 'Reserve free spot'
                  : payMode === 'plan'
                    ? `Start plan · Pay ${money(deposit)}`
                    : `Pay ${money(total)}`}
              </button>
              <p className="secure-note">🔒 Secure mobile money payment</p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
