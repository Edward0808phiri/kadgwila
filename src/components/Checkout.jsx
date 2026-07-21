import { useId, useMemo, useRef, useState } from 'react'
import Sheet from './ui/Sheet.jsx'
import Icon from './ui/Icon.jsx'
import { addPurchase, startPlan } from '../store.js'
import { applyPromo } from '../data/promotions.js'
import { kwacha, price as fmtPrice, weekdayShort } from '../lib/format.js'
import { eventImage } from '../lib/images.js'
import { NETWORKS, formatPhoneInput, isValidEmail, networkList, parsePhone } from '../lib/phone.js'

const MAX_TICKETS = 10
const DEPOSIT_OPTIONS = [25, 50]
const INSTALMENT_OPTIONS = [2, 3, 4]

export default function Checkout({ event, onClose }) {
  const formId = useId()
  const formRef = useRef(null)

  const [qty, setQty] = useState(1)
  const [payMode, setPayMode] = useState('full')
  const [depositPct, setDepositPct] = useState(25)
  const [instalments, setInstalments] = useState(3)
  const [fields, setFields] = useState({ name: '', email: '', phone: '', momo: '' })
  const [network, setNetwork] = useState(NETWORKS.airtel.id)
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState(null)
  const [promoNote, setPromoNote] = useState(null)
  const [errors, setErrors] = useState({})
  const [receipt, setReceipt] = useState(null)

  const free = event.price === 0
  const subtotal = event.price * qty
  const discount = promo?.discount ?? 0
  const total = Math.max(0, subtotal - discount)

  const deposit = useMemo(() => Math.round((total * depositPct) / 100), [total, depositPct])
  const perInstalment = useMemo(
    () => Math.ceil((total - deposit) / instalments / 5) * 5,
    [total, deposit, instalments],
  )

  const onPlan = !free && payMode === 'plan'
  const dueNow = free ? 0 : onPlan ? deposit : total

  const set = (key) => (e) => {
    const value = key === 'momo' || key === 'phone' ? formatPhoneInput(e.target.value) : e.target.value
    setFields((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (key === 'momo') {
      const parsed = parsePhone(value)
      if (parsed.valid) setNetwork(parsed.network)
    }
  }

  const redeem = () => {
    const result = applyPromo(promoInput, event, subtotal)
    setPromo(result.ok ? result : null)
    setPromoNote(result.ok ? { ok: true, text: `${result.promo.code} applied` } : { ok: false, text: result.reason })
  }

  const validate = () => {
    const next = {}
    if (!fields.name.trim()) next.name = 'Enter the name on the ticket'
    if (!isValidEmail(fields.email)) next.email = 'Enter a valid email address'
    if (!parsePhone(fields.phone).valid) next.phone = 'Enter a Zambian mobile number'
    if (!free && !parsePhone(fields.momo).valid) next.momo = 'Enter the number to charge'
    setErrors(next)

    const firstError = Object.keys(next)[0]
    if (firstError) {
      formRef.current?.querySelector(`[name="${firstError}"]`)?.focus()
      return false
    }
    return true
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return

    // A real build hands off to the mobile-money collection API here and only
    // records the ticket once the provider confirms the charge.
    const base = {
      eventId: event.id,
      title: event.title,
      artist: event.artist,
      category: event.category,
      city: event.city,
      venue: event.venue,
      date: event.date,
      time: event.time,
      photo: event.photo,
      image: event.image,
      qty,
      total,
    }

    const record = onPlan
      ? startPlan({ ...base, deposit, paymentsLeft: instalments })
      : addPurchase({ ...base, total: free ? 0 : total })

    setReceipt(record)
  }

  if (receipt) {
    return (
      <Sheet
        title="Booking confirmed"
        onClose={onClose}
        footer={
          <button type="button" className="btn btn-primary btn-block" onClick={onClose} data-autofocus>
            Done
          </button>
        }
      >
        <div className="confirm">
          <div className="confirm-mark">
            <Icon name="check" size={28} strokeWidth={2.4} />
          </div>
          <h2>
            {free
              ? 'Your spot is reserved'
              : onPlan
                ? 'Payment plan started'
                : 'Payment request sent'}
          </h2>
          <p>
            {free
              ? `You're on the list for ${event.title}. Bring this reference to the gate.`
              : onPlan
                ? `We've taken your ${kwacha(deposit)} deposit. Pay the balance any time from your account.`
                : `Approve the ${kwacha(total)} ${NETWORKS[network].name} prompt on ${fields.momo} to release your ${qty === 1 ? 'ticket' : 'tickets'}.`}
          </p>
          <div className="confirm-ref">
            Reference
            <strong>{receipt.ref}</strong>
          </div>
          <p className="field-hint">
            A copy is saved to your account and sent to {fields.email}.
          </p>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      eyebrow={`${event.category} · ${event.city}`}
      title={event.title}
      sub={event.artist}
      onClose={onClose}
      footer={
        <>
          <div className="totals">
            {discount > 0 && (
              <div className="total-line" data-discount="true">
                <span>Discount</span>
                <strong>−{kwacha(discount)}</strong>
              </div>
            )}
            <div className="total-line total-line-grand">
              <span>{onPlan ? 'Due today' : 'Total'}</span>
              <strong>{fmtPrice(dueNow)}</strong>
            </div>
          </div>
          <button type="submit" form={formId} className={`btn btn-block ${free ? 'btn-accent' : 'btn-primary'}`}>
            {free ? 'Reserve a spot' : onPlan ? `Pay deposit ${kwacha(deposit)}` : `Pay ${kwacha(total)}`}
          </button>
          <p className="secure-note">
            <Icon name="lock" size={13} />
            Secured mobile money payment
          </p>
        </>
      }
    >
      <div className="co-summary">
        <img src={eventImage(event, 128, 128)} alt="" width="64" height="64" loading="lazy" />
        <div className="co-summary-text">
          <strong>{event.venue}</strong>
          <span>
            <Icon name="calendar" size={14} />
            {weekdayShort(event.date)} · {event.time}
          </span>
        </div>
      </div>

      <div className="co-section">
        <div className="qty-row">
          <span className="qty-row-label">
            <strong>Tickets</strong>
            <span>{free ? 'Free entry' : `${kwacha(event.price)} each`}</span>
          </span>
          <div className="qty-ctrl">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Remove one ticket"
            >
              <Icon name="minus" size={18} />
            </button>
            <output aria-live="polite" aria-label="Ticket quantity">
              {qty}
            </output>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(MAX_TICKETS, q + 1))}
              disabled={qty >= MAX_TICKETS}
              aria-label="Add one ticket"
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>
      </div>

      <form id={formId} ref={formRef} className="form" onSubmit={submit} noValidate>
        <div className="co-section">
          <p className="co-legend">
            <Icon name="user" size={14} />
            Ticket holder
          </p>

          <div className="form">
            <Field
              label="Full name"
              name="name"
              value={fields.name}
              onChange={set('name')}
              error={errors.name}
              placeholder="Mwila Banda"
              autoComplete="name"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              inputMode="email"
              value={fields.email}
              onChange={set('email')}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              label="Mobile number"
              name="phone"
              type="tel"
              inputMode="tel"
              value={fields.phone}
              onChange={set('phone')}
              error={errors.phone}
              placeholder="097 123 4567"
              autoComplete="tel"
            />
          </div>
        </div>

        {!free && (
          <>
            <div className="co-section">
              <p className="co-legend">
                <Icon name="tag" size={14} />
                Promo code
              </p>
              <div className="promo-row">
                <input
                  className="input"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="e.g. ZED10"
                  aria-label="Promo code"
                />
                <button type="button" className="btn btn-outline" onClick={redeem}>
                  Apply
                </button>
              </div>
              {promoNote && (
                <p className="promo-note" data-ok={promoNote.ok} role="status">
                  <Icon name={promoNote.ok ? 'check' : 'alert'} size={14} />
                  {promoNote.text}
                  {promoNote.ok && discount > 0 && ` — you save ${kwacha(discount)}`}
                </p>
              )}
            </div>

            <div className="co-section">
              <p className="co-legend">
                <Icon name="wallet" size={14} />
                Payment option
              </p>
              <div className="paymode">
                <button
                  type="button"
                  className="paymode-opt"
                  data-active={payMode === 'full' || undefined}
                  aria-pressed={payMode === 'full'}
                  onClick={() => setPayMode('full')}
                >
                  <strong>Pay in full</strong>
                  <span>{kwacha(total)} now</span>
                </button>
                <button
                  type="button"
                  className="paymode-opt"
                  data-active={payMode === 'plan' || undefined}
                  aria-pressed={payMode === 'plan'}
                  onClick={() => setPayMode('plan')}
                >
                  <strong>Pay a deposit</strong>
                  <span>from {kwacha(Math.round(total * 0.25))} now</span>
                </button>
              </div>

              {onPlan && (
                <div className="plan-box">
                  <div className="plan-row">
                    <span>Deposit today</span>
                    <div className="seg">
                      {DEPOSIT_OPTIONS.map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          data-active={depositPct === pct || undefined}
                          aria-pressed={depositPct === pct}
                          onClick={() => setDepositPct(pct)}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="plan-row">
                    <span>Balance over</span>
                    <div className="seg">
                      {INSTALMENT_OPTIONS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          data-active={instalments === n || undefined}
                          aria-pressed={instalments === n}
                          onClick={() => setInstalments(n)}
                        >
                          {n} payments
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="plan-split">
                    <div>
                      <em>Today</em>
                      <strong>{kwacha(deposit)}</strong>
                    </div>
                    <Icon name="arrowRight" size={16} className="plan-split-arrow" />
                    <div>
                      <em>{instalments} × payments of</em>
                      <strong>{kwacha(perInstalment)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="co-section">
              <p className="co-legend">
                <Icon name="phone" size={14} />
                Mobile money
              </p>
              <div className="network-row" role="group" aria-label="Mobile money provider">
                {networkList.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="network"
                    data-active={network === item.id || undefined}
                    aria-pressed={network === item.id}
                    onClick={() => setNetwork(item.id)}
                  >
                    <span className="network-dot" style={{ background: item.colour }} />
                    {item.short}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 'var(--sp-3)' }}>
                <Field
                  label="Number to charge"
                  name="momo"
                  type="tel"
                  inputMode="tel"
                  value={fields.momo}
                  onChange={set('momo')}
                  error={errors.momo}
                  placeholder="097 123 4567"
                  hint="We detect your provider from the number."
                />
              </div>
            </div>
          </>
        )}
      </form>
    </Sheet>
  )
}

function Field({ label, name, error, hint, ...rest }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...rest}
      />
      {error ? (
        <span className="error-text" id={errorId}>
          <Icon name="alert" size={13} />
          {error}
        </span>
      ) : (
        hint && (
          <span className="field-hint" id={hintId}>
            {hint}
          </span>
        )
      )}
    </div>
  )
}
