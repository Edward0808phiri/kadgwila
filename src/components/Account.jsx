import { useRef, useState } from 'react'
import Sheet from './ui/Sheet.jsx'
import Icon from './ui/Icon.jsx'
import { nextInstallment, payInstallment, useAccount } from '../store.js'
import { promotions } from '../data/promotions.js'
import { kwacha, price, timestamp } from '../lib/format.js'
import { eventImage } from '../lib/images.js'

export default function Account({ onClose }) {
  const { purchases, plans } = useAccount()
  const [tab, setTab] = useState('tickets')
  const [copied, setCopied] = useState('')
  const tabRefs = useRef([])

  const tabs = [
    { id: 'tickets', label: 'Tickets', icon: 'ticket', count: purchases.length },
    { id: 'plans', label: 'Plans', icon: 'card', count: plans.length },
    { id: 'offers', label: 'Offers', icon: 'tag', count: promotions.length },
  ]

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(''), 1600)
    } catch {
      /* clipboard blocked — the code stays visible on the card */
    }
  }

  const onTabKeyDown = (event) => {
    const steps = { ArrowRight: 1, ArrowLeft: -1 }
    let index = null

    if (event.key in steps) {
      const current = tabs.findIndex((t) => t.id === tab)
      index = (current + steps[event.key] + tabs.length) % tabs.length
    } else if (event.key === 'Home') index = 0
    else if (event.key === 'End') index = tabs.length - 1
    else return

    event.preventDefault()
    setTab(tabs[index].id)
    tabRefs.current[index]?.focus()
  }

  return (
    <Sheet title="Your account" sub="Tickets, payment plans and offers" onClose={onClose} wide>
      <div className="acct-tabs" role="tablist" aria-label="Account sections">
        {tabs.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`acct-tab-${item.id}`}
            aria-controls={`acct-panel-${item.id}`}
            aria-selected={tab === item.id}
            tabIndex={tab === item.id ? 0 : -1}
            className="acct-tab"
            data-active={tab === item.id || undefined}
            onClick={() => setTab(item.id)}
            onKeyDown={onTabKeyDown}
          >
            <Icon name={item.icon} size={15} />
            {item.label}
            <span className="acct-tab-count">{item.count}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`acct-panel-${tab}`} aria-labelledby={`acct-tab-${tab}`}>
        {tab === 'tickets' &&
          (purchases.length === 0 ? (
            <Empty
              icon="ticket"
              title="No tickets yet"
              body="Tickets you buy or reserve appear here, ready to show at the gate."
            />
          ) : (
            <div className="acct-list">
              {purchases.map((item) => (
                <article className="ticket" key={item.id}>
                  <img className="ticket-img" src={eventImage(item, 124, 124)} alt="" loading="lazy" />
                  <div className="ticket-info">
                    <div className="ticket-top">
                      <strong>{item.title}</strong>
                      <span className={`badge ${item.total === 0 ? 'badge-accent' : 'badge-neutral'}`}>
                        {item.total === 0 ? 'Free' : 'Paid'}
                      </span>
                    </div>
                    <span className="ticket-sub">
                      {item.city} · {item.qty} {item.qty === 1 ? 'ticket' : 'tickets'}
                    </span>
                    <div className="ticket-meta">
                      <span>Ref {item.ref}</span>
                      <span>{price(item.total)}</span>
                      <span>{timestamp(item.boughtAt)}</span>
                      {item.method === 'plan' && <span>Plan completed</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}

        {tab === 'plans' &&
          (plans.length === 0 ? (
            <Empty
              icon="card"
              title="No active plans"
              body="Choose “Pay a deposit” at checkout to hold a ticket now and clear the balance here."
            />
          ) : (
            <div className="acct-list">
              {plans.map((plan) => {
                const pct = Math.min(100, Math.round((plan.paid / plan.total) * 100))
                const due = nextInstallment(plan)
                return (
                  <article className="plan-card" key={plan.id}>
                    <div className="plan-card-head">
                      <div>
                        <strong>{plan.title}</strong>
                        <span>
                          {plan.city} · {plan.qty} {plan.qty === 1 ? 'ticket' : 'tickets'} · Ref{' '}
                          {plan.ref}
                        </span>
                      </div>
                      <span className="plan-owed">{kwacha(plan.total - plan.paid)} left</span>
                    </div>

                    <div
                      className="progress"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${plan.title} payment progress`}
                    >
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="plan-figures">
                      <span>
                        <strong>{kwacha(plan.paid)}</strong> paid
                      </span>
                      <span>{pct}%</span>
                      <span>{kwacha(plan.total)} total</span>
                    </div>

                    <div className="plan-actions">
                      <div className="plan-next">
                        Next payment
                        <strong>{kwacha(due)}</strong>
                        {plan.paymentsLeft} remaining
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => payInstallment(plan.id)}
                      >
                        Pay {kwacha(due)}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ))}

        {tab === 'offers' && (
          <div className="acct-list">
            <p className="field-hint">Tap a code to copy it, then paste it at checkout.</p>
            {promotions.map((promo) => (
              <button
                key={promo.code}
                type="button"
                className="promo-card"
                onClick={() => copy(promo.code)}
              >
                <span className="promo-icon">
                  <Icon name={promo.icon} size={19} />
                </span>
                <span className="promo-text">
                  <strong>{promo.title}</strong>
                  <span>{promo.blurb}</span>
                </span>
                <span className="promo-code">
                  <Icon name={copied === promo.code ? 'check' : 'copy'} size={13} />
                  {copied === promo.code ? 'Copied' : promo.code}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}

function Empty({ icon, title, body }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={30} className="empty-state-icon" />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  )
}
