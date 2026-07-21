import { useMemo, useState } from 'react'
import Icon from './ui/Icon.jsx'
import Logo from './ui/Logo.jsx'
import useDialog from '../hooks/useDialog.js'
import { events as baseEvents, publishableCategories } from '../data/events.js'
import { compact, count, fullDate, isPast, kwacha } from '../lib/format.js'
import { eventImage, PLACEHOLDER_PHOTO } from '../lib/images.js'
import { networkList } from '../lib/phone.js'

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'chart' },
  { id: 'create', label: 'Create event', icon: 'plus' },
  { id: 'events', label: 'My events', icon: 'calendar' },
  { id: 'sales', label: 'Tickets sold', icon: 'ticket' },
  { id: 'loyalty', label: 'Loyalty', icon: 'award' },
]

const TIERS = [
  { name: 'Bronze', members: 1840, perk: '5% back in points', colour: '#cd7f32' },
  { name: 'Silver', members: 720, perk: 'Early access to tickets', colour: '#c0c7d0' },
  { name: 'Gold', members: 265, perk: 'Free upgrades and fast lane', colour: '#f5c518' },
  { name: 'Platinum', members: 48, perk: 'VIP lounge and meet & greet', colour: '#8ad7ff' },
]

const TOP_MEMBERS = [
  { name: 'Chanda Mwale', tier: 'Platinum', points: 12480, events: 34 },
  { name: 'Bwalya Phiri', tier: 'Gold', points: 9120, events: 27 },
  { name: 'Natasha Zulu', tier: 'Gold', points: 8630, events: 25 },
  { name: 'Mulenga Banda', tier: 'Silver', points: 5410, events: 18 },
  { name: 'Temwani Sakala', tier: 'Silver', points: 4980, events: 16 },
]

const ACTIVITY = [
  { icon: 'ticket', text: 'Chanda M. bought 2 tickets for Lusaka July', time: '4 min ago' },
  { icon: 'star', text: 'Natasha Z. reached Gold tier', time: '22 min ago' },
  { icon: 'wallet', text: 'Payout of K18,400 sent to your wallet', time: '1 hr ago' },
  { icon: 'trending', text: '38 tickets sold for Kitwe Food Festival', time: '3 hrs ago' },
  { icon: 'tag', text: 'Promo YOMAPS20 used 14 times today', time: '5 hrs ago' },
]

const SHARE = [0.44, 0.38, 0.18]

// Stable pseudo-random demo figures, derived from the event id.
const seed = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}
const between = (str, min, max) => min + (seed(str) % (max - min + 1))

const EMPTY_FORM = {
  title: '',
  category: 'Music',
  city: 'Lusaka',
  venue: '',
  date: '',
  time: '19:00',
  price: '',
  capacity: '500',
  image: '',
}

export default function Studio({ onClose }) {
  const root = useDialog(onClose)
  const [tab, setTab] = useState('overview')
  const [created, setCreated] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [published, setPublished] = useState(null)
  const [loyaltyOn, setLoyaltyOn] = useState(true)

  const enriched = useMemo(
    () =>
      [...created, ...baseEvents].map((event) => {
        const capacity = event.capacity || between(`${event.id}cap`, 300, 2500)
        const sold = event.soldOut
          ? capacity
          : Math.round((capacity * between(`${event.id}sold`, 35, 96)) / 100)
        return {
          ...event,
          capacity,
          sold,
          revenue: sold * (event.price || 0),
          status: event.soldOut ? 'Sold out' : isPast(event.date) ? 'Past' : 'On sale',
        }
      }),
    [created],
  )

  const totals = useMemo(
    () => ({
      revenue: enriched.reduce((sum, e) => sum + e.revenue, 0),
      sold: enriched.reduce((sum, e) => sum + e.sold, 0),
      live: enriched.filter((e) => e.status === 'On sale').length,
      members: TIERS.reduce((sum, t) => sum + t.members, 0),
    }),
    [enriched],
  )

  const topByRevenue = useMemo(
    () => [...enriched].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    [enriched],
  )
  const topBySales = useMemo(
    () => [...enriched].sort((a, b) => b.sold - a.sold).slice(0, 5),
    [enriched],
  )

  const week = useMemo(
    () =>
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        day,
        value: between(`wk${day}`, 30, 100),
      })),
    [],
  )

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const publish = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return

    setCreated((list) => [
      {
        id: `new-${Date.now()}`,
        title: form.title.trim(),
        artist: form.venue || form.city,
        category: form.category,
        city: form.city,
        venue: form.venue || 'To be announced',
        date: form.date,
        time: form.time,
        price: Number(form.price) || 0,
        capacity: Number(form.capacity) || 500,
        image: form.image || undefined,
        photo: form.image ? undefined : PLACEHOLDER_PHOTO,
        organiser: 'Your organisation',
        tags: [form.category],
        spotsLeft: Number(form.capacity) || 500,
      },
      ...list,
    ])
    setPublished(form.title.trim())
    setForm(EMPTY_FORM)
    setTab('events')
  }

  const maxRevenue = Math.max(1, ...topByRevenue.map((e) => e.revenue))
  const maxSold = Math.max(1, ...topBySales.map((e) => e.sold))

  return (
    <div
      ref={root}
      className="studio"
      role="dialog"
      aria-modal="true"
      aria-label="Organiser studio"
      tabIndex={-1}
    >
      <div className="studio-top">
        <button type="button" className="btn btn-quiet btn-sm" onClick={onClose}>
          <Icon name="arrowLeft" size={16} />
          Back to site
        </button>
        <span className="studio-brand">
          <Logo compact />
          Studio
        </span>
        <span className="studio-user">
          <span className="studio-avatar">Z</span>
          <span className="studio-user-name">Organiser</span>
        </span>
      </div>

      <div className="studio-shell">
        <nav className="studio-nav" aria-label="Studio sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="studio-navitem"
              data-active={tab === item.id || undefined}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => setTab(item.id)}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        <main className="studio-main">
          {tab === 'overview' && (
            <>
              <header className="studio-head">
                <h1>Overview</h1>
                <p>How your events are performing this month.</p>
              </header>

              <div className="kpi-grid">
                <Kpi label="Total revenue" value={kwacha(totals.revenue)} trend="+12.4%" tone="accent" up />
                <Kpi label="Tickets sold" value={count(totals.sold)} trend="+8.1%" up />
                <Kpi label="On sale now" value={totals.live} trend="events live" tone="info" />
                <Kpi label="Loyalty members" value={count(totals.members)} trend="+230 this month" tone="warn" up />
              </div>

              <div className="studio-cols">
                <section className="panel">
                  <div className="panel-head">
                    <h3>Sales this week</h3>
                    <span>tickets per day</span>
                  </div>
                  <div className="bars">
                    {week.map((item) => (
                      <div className="bar-col" key={item.day}>
                        <div className="bar" style={{ height: `${item.value}%` }} />
                        <span>{item.day}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <h3>Recent activity</h3>
                  </div>
                  <ul className="feed">
                    {ACTIVITY.map((item) => (
                      <li key={item.text}>
                        <span className="feed-icon">
                          <Icon name={item.icon} size={16} />
                        </span>
                        <span className="feed-text">{item.text}</span>
                        <span className="feed-time">{item.time}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="panel">
                <div className="panel-head">
                  <h3>Top earning events</h3>
                </div>
                <RankList
                  items={topByRevenue}
                  max={maxRevenue}
                  valueOf={(e) => e.revenue}
                  format={kwacha}
                />
              </section>
            </>
          )}

          {tab === 'create' && (
            <>
              <header className="studio-head">
                <h1>Create an event</h1>
                <p>Publish to Zikets and start selling in minutes.</p>
              </header>

              {published && (
                <p className="studio-banner">
                  <Icon name="check" size={17} />
                  <span>
                    <strong>{published}</strong> is published. Find it under My events.
                  </span>
                </p>
              )}

              <div className="studio-cols" data-layout="create">
                <form className="panel form" onSubmit={publish}>
                  <label>
                    Event title
                    <input value={form.title} onChange={set('title')} placeholder="Lusaka Summer Fest" required />
                  </label>

                  <div className="form-row">
                    <label>
                      Category
                      <select value={form.category} onChange={set('category')}>
                        {publishableCategories.map((c) => (
                          <option key={c.id}>{c.id}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      City
                      <input value={form.city} onChange={set('city')} placeholder="Lusaka" />
                    </label>
                  </div>

                  <label>
                    Venue
                    <input value={form.venue} onChange={set('venue')} placeholder="National Heroes Stadium" />
                  </label>

                  <div className="form-row">
                    <label>
                      Date
                      <input type="date" value={form.date} onChange={set('date')} required />
                    </label>
                    <label>
                      Start time
                      <input type="time" value={form.time} onChange={set('time')} />
                    </label>
                  </div>

                  <div className="form-row">
                    <label>
                      Ticket price (K)
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={set('price')}
                        placeholder="0 for a free event"
                      />
                    </label>
                    <label>
                      Capacity
                      <input type="number" min="1" value={form.capacity} onChange={set('capacity')} />
                    </label>
                  </div>

                  <label>
                    Flyer image URL
                    <input value={form.image} onChange={set('image')} placeholder="https://" />
                  </label>

                  <button type="submit" className="btn btn-primary btn-block">
                    Publish event
                  </button>
                </form>

                <section className="panel">
                  <div className="panel-head">
                    <h3>Preview</h3>
                    <span>as attendees see it</span>
                  </div>
                  <div className="preview-card">
                    <div className="preview-media">
                      <img
                        src={eventImage(
                          { image: form.image || undefined, photo: PLACEHOLDER_PHOTO },
                          640,
                          400,
                        )}
                        alt=""
                      />
                      <span className="badge badge-accent preview-price">
                        {Number(form.price) > 0 ? kwacha(Number(form.price)) : 'Free'}
                      </span>
                    </div>
                    <div className="preview-body">
                      <span className="card-eyebrow">
                        {form.category} · {form.city || 'City'}
                      </span>
                      <strong>{form.title || 'Your event title'}</strong>
                      <span>
                        {form.venue || 'Venue'} · {form.date ? fullDate(form.date) : 'Date'} ·{' '}
                        {form.time}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {tab === 'events' && (
            <>
              <header className="studio-head">
                <h1>My events</h1>
                <p>{enriched.length} events — on sale, past and sold out.</p>
              </header>

              <div className="table" style={{ '--table-cols': '2.4fr 1.1fr 1fr 1.3fr 1fr' }}>
                <div className="table-head">
                  <span>Event</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span>Sold</span>
                  <span>Revenue</span>
                </div>
                {enriched.map((event) => (
                  <div className="table-row" key={event.id}>
                    <div className="cell-event">
                      <img src={eventImage(event, 88, 88)} alt="" loading="lazy" />
                      <div>
                        <strong>{event.title}</strong>
                        <span>
                          {event.venue}, {event.city}
                        </span>
                      </div>
                    </div>
                    <span className="cell-muted" data-label="Date">
                      {fullDate(event.date)}
                    </span>
                    <span data-label="Status">
                      <Status value={event.status} />
                    </span>
                    <div className="cell-sold" data-label="Sold">
                      <div className="progress">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(100, (event.sold / event.capacity) * 100)}%` }}
                        />
                      </div>
                      <em>
                        {count(event.sold)} / {count(event.capacity)}
                      </em>
                    </div>
                    <span className="cell-num" data-label="Revenue">
                      {event.price === 0 ? '—' : kwacha(event.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'sales' && (
            <>
              <header className="studio-head">
                <h1>Tickets sold</h1>
                <p>
                  {count(totals.sold)} tickets · {kwacha(totals.revenue)} collected.
                </p>
              </header>

              <div className="studio-cols">
                <section className="panel">
                  <div className="panel-head">
                    <h3>By payment method</h3>
                  </div>
                  {networkList.map((network, i) => (
                    <div className="split" key={network.id}>
                      <span className="split-name">{network.name}</span>
                      <div className="split-bar">
                        <div style={{ width: `${SHARE[i] * 100}%`, background: network.colour }} />
                      </div>
                      <span className="split-val">{Math.round(SHARE[i] * 100)}%</span>
                    </div>
                  ))}
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <h3>Best sellers</h3>
                  </div>
                  <RankList items={topBySales} max={maxSold} valueOf={(e) => e.sold} format={count} />
                </section>
              </div>

              <section className="panel">
                <div className="panel-head">
                  <h3>Per-event breakdown</h3>
                </div>
                <div className="table" style={{ '--table-cols': '2fr 1fr 1fr 1fr' }}>
                  <div className="table-head">
                    <span>Event</span>
                    <span>Price</span>
                    <span>Sold</span>
                    <span>Revenue</span>
                  </div>
                  {enriched.map((event) => (
                    <div className="table-row" key={event.id}>
                      <strong className="cell-muted">{event.title}</strong>
                      <span className="cell-muted" data-label="Price">
                        {event.price === 0 ? 'Free' : kwacha(event.price)}
                      </span>
                      <span className="cell-num" data-label="Sold">
                        {count(event.sold)}
                      </span>
                      <span className="cell-num" data-label="Revenue">
                        {event.price === 0 ? '—' : kwacha(event.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {tab === 'loyalty' && (
            <>
              <header className="studio-head">
                <h1>Loyalty programme</h1>
                <p>Reward regulars with points, tiers and perks.</p>
                <label className="switch" style={{ marginTop: 'var(--sp-4)' }}>
                  <input
                    type="checkbox"
                    checked={loyaltyOn}
                    onChange={() => setLoyaltyOn((v) => !v)}
                  />
                  <span className="switch-track">
                    <span className="switch-thumb" />
                  </span>
                  {loyaltyOn ? 'Programme active' : 'Programme paused'}
                </label>
              </header>

              <div className="tier-grid">
                {TIERS.map((tier) => (
                  <div className="tier" key={tier.name}>
                    <span className="tier-badge" style={{ background: tier.colour }}>
                      {tier.name[0]}
                    </span>
                    <strong>{tier.name}</strong>
                    <span className="tier-members">{count(tier.members)} members</span>
                    <span>{tier.perk}</span>
                  </div>
                ))}
              </div>

              <div className="studio-cols">
                <section className="panel">
                  <div className="panel-head">
                    <h3>Programme stats</h3>
                  </div>
                  <div className="mini-kpis">
                    <div>
                      <span>Points issued</span>
                      <strong>{compact(1_240_000)}</strong>
                    </div>
                    <div>
                      <span>Points redeemed</span>
                      <strong>{compact(860_000)}</strong>
                    </div>
                    <div>
                      <span>Redemption rate</span>
                      <strong>69%</strong>
                    </div>
                    <div>
                      <span>Repeat buyers</span>
                      <strong>41%</strong>
                    </div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <h3>Top members</h3>
                  </div>
                  <div className="member-list">
                    {TOP_MEMBERS.map((member, i) => (
                      <div className="member" key={member.name}>
                        <span className="member-rank">{i + 1}</span>
                        <span className="member-avatar">{member.name[0]}</span>
                        <div className="member-main">
                          <strong>{member.name}</strong>
                          <span>{member.events} events attended</span>
                        </div>
                        <span className="badge badge-neutral member-tier">{member.tier}</span>
                        <span className="member-pts">{count(member.points)} pts</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function Kpi({ label, value, trend, tone, up }) {
  return (
    <div className="kpi" data-tone={tone}>
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      <span className="kpi-trend" data-up={up || undefined}>
        {trend}
      </span>
    </div>
  )
}

function RankList({ items, max, valueOf, format }) {
  return (
    <div className="ranklist">
      {items.map((item, i) => (
        <div className="rank" key={item.id}>
          <span className="rank-n">{i + 1}</span>
          <div className="rank-main">
            <strong>{item.title}</strong>
            <div className="rank-bar">
              <div style={{ width: `${(valueOf(item) / max) * 100}%` }} />
            </div>
          </div>
          <span className="rank-val">{format(valueOf(item))}</span>
        </div>
      ))}
    </div>
  )
}

function Status({ value }) {
  const tone = value === 'On sale' ? 'badge-accent' : value === 'Sold out' ? 'badge-danger' : 'badge-neutral'
  return <span className={`badge ${tone}`}>{value}</span>
}
