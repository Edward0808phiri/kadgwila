import { useState } from 'react'
import { useAccount, payInstallment, nextInstallment } from '../store.js'
import { promotions } from '../data/promotions.js'

const money = (n) => (n === 0 ? 'FREE' : `K${n.toLocaleString()}`)
const fmt = (ts) =>
  new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Account({ onClose }) {
  const { purchases, plans } = useAccount()
  const [tab, setTab] = useState('tickets')
  const [copied, setCopied] = useState('')

  const copy = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(''), 1400)
  }

  const tabs = [
    { id: 'tickets', label: 'My tickets', count: purchases.length },
    { id: 'plans', label: 'Payment plans', count: plans.length },
    { id: 'promos', label: 'Promotions', count: promotions.length },
  ]

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="acct-head">
          <div className="acct-avatar">🙂</div>
          <div>
            <h2>Your account</h2>
            <p className="acct-sub">Tickets, plans &amp; deals — all in one place.</p>
          </div>
        </div>

        <div className="acct-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className="acct-tab"
              data-active={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="acct-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="acct-body">
          {tab === 'tickets' && (
            purchases.length === 0 ? (
              <Empty
                emoji="🎟️"
                title="No tickets yet"
                body="Once you grab a ticket it shows up here, ready to scan at the gate."
              />
            ) : (
              <div className="acct-list">
                {purchases.map((p) => (
                  <div className="ticket" key={p.id}>
                    <div className="ticket-img" style={{ backgroundImage: `url(${p.image})` }} />
                    <div className="ticket-info">
                      <div className="ticket-top">
                        <strong>{p.title}</strong>
                        <span className={`ticket-pill ${p.total === 0 ? 'free' : ''}`}>
                          {p.total === 0 ? 'FREE' : 'PAID'}
                        </span>
                      </div>
                      <em>{p.city} · {p.qty}× ticket{p.qty > 1 ? 's' : ''}</em>
                      <div className="ticket-meta">
                        <span>Ref {p.ref}</span>
                        <span>{money(p.total)}</span>
                        {p.method === 'plan' && <span className="ticket-tag">Paid off plan</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'plans' && (
            plans.length === 0 ? (
              <Empty
                emoji="💳"
                title="No active plans"
                body="Short on cash? At checkout choose “Pay a deposit” to reserve now and pay the rest here."
              />
            ) : (
              <div className="acct-list">
                {plans.map((plan) => {
                  const pct = Math.min(100, Math.round((plan.paid / plan.total) * 100))
                  const due = nextInstallment(plan)
                  return (
                    <div className="plan-card" key={plan.id}>
                      <div className="plan-card-head">
                        <div>
                          <strong>{plan.title}</strong>
                          <em>{plan.city} · {plan.qty}× ticket{plan.qty > 1 ? 's' : ''} · Ref {plan.ref}</em>
                        </div>
                        <span className="plan-remaining">{money(plan.total - plan.paid)} left</span>
                      </div>

                      <div className="plan-bar">
                        <div className="plan-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="plan-figures">
                        <span><strong>{money(plan.paid)}</strong> paid</span>
                        <span>{pct}%</span>
                        <span>{money(plan.total)} total</span>
                      </div>

                      <div className="plan-actions">
                        <div className="plan-next">
                          Next payment
                          <strong>{money(due)}</strong>
                          <em>{plan.paymentsLeft} left</em>
                        </div>
                        <button className="btn btn-primary" onClick={() => payInstallment(plan.id)}>
                          Pay {money(due)}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {tab === 'promos' && (
            <div className="acct-list">
              <p className="promo-hint">Tap a code to copy, then paste it at checkout.</p>
              {promotions.map((p) => (
                <button
                  key={p.code}
                  className={`promo-card tone-${p.tone}`}
                  onClick={() => copy(p.code)}
                >
                  <div className="promo-emoji">{p.emoji}</div>
                  <div className="promo-text">
                    <strong>{p.title}</strong>
                    <em>{p.blurb}</em>
                  </div>
                  <div className="promo-code">
                    {copied === p.code ? 'Copied!' : p.code}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Empty({ emoji, title, body }) {
  return (
    <div className="acct-empty">
      <div className="acct-empty-emoji">{emoji}</div>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  )
}
