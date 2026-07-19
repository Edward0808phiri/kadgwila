import { useMemo, useState } from 'react'
import { events as baseEvents, categories } from '../data/events.js'

const money = (n) => `K${Math.round(n).toLocaleString()}`

// Deterministic pseudo-random from a string, so demo numbers stay stable.
const seed = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}
const rand = (str, min, max) => min + (seed(str) % (max - min + 1))

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const TABS = [
  { id: 'overview', label: 'Overview', icon: '▤' },
  { id: 'create', label: 'Create event', icon: '＋' },
  { id: 'events', label: 'My events', icon: '🗓' },
  { id: 'tickets', label: 'Tickets sold', icon: '🎟' },
  { id: 'loyalty', label: 'Loyalty program', icon: '★' },
]

const NETWORKS = [
  { name: 'Airtel Money', share: 0.44, color: '#ff2a2a' },
  { name: 'MTN MoMo', share: 0.38, color: '#f5c518' },
  { name: 'Zamtel Kwacha', share: 0.18, color: '#2ecc71' },
]

const LOYALTY_TIERS = [
  { name: 'Bronze', members: 1840, perk: '5% back in points', color: '#cd7f32' },
  { name: 'Silver', members: 720, perk: 'Early access to tickets', color: '#c0c7d0' },
  { name: 'Gold', members: 265, perk: 'Free upgrades & fast lane', color: '#f5c518' },
  { name: 'Platinum', members: 48, perk: 'VIP lounge + meet & greet', color: '#8ad7ff' },
]

const TOP_MEMBERS = [
  { name: 'Chanda Mwale', tier: 'Platinum', points: 12480, events: 34 },
  { name: 'Bwalya Phiri', tier: 'Gold', points: 9120, events: 27 },
  { name: 'Natasha Zulu', tier: 'Gold', points: 8630, events: 25 },
  { name: 'Mulenga Banda', tier: 'Silver', points: 5410, events: 18 },
  { name: 'Temwani Sakala', tier: 'Silver', points: 4980, events: 16 },
]

const ACTIVITY = [
  { icon: '🎟', text: 'Chanda M. bought 2× Lusaka July', time: '4 min ago' },
  { icon: '⭐', text: 'Natasha Z. reached Gold tier', time: '22 min ago' },
  { icon: '💳', text: 'Payout of K18,400 sent to your wallet', time: '1 hr ago' },
  { icon: '🎫', text: '38 tickets sold for Kitwe Food Festival', time: '3 hrs ago' },
  { icon: '📣', text: 'Promo YOMAPS20 used 14 times today', time: '5 hrs ago' },
]

export default function Admin({ onClose }) {
  const [tab, setTab] = useState('overview')
  const [created, setCreated] = useState([])
  const [programOn, setProgramOn] = useState(true)
  const [form, setForm] = useState({
    title: '', category: 'Music', city: 'Lusaka', venue: '', date: '', time: '19:00',
    price: '', capacity: '500', image: '', desc: '',
  })
  const [justCreated, setJustCreated] = useState(null)

  // Build demo sales stats for every event.
  const enriched = useMemo(() => {
    const all = [...created, ...baseEvents]
    return all.map((e) => {
      const capacity = e.capacity || rand(e.id + 'cap', 300, 2500)
      const sold = e.soldOut ? capacity : Math.round(capacity * (rand(e.id + 's', 35, 96) / 100))
      const price = e.price || 0
      const revenue = sold * price
      const past = new Date(e.date) < new Date('2026-07-19')
      return { ...e, capacity, sold, revenue, status: e.soldOut ? 'Sold out' : past ? 'Past' : 'Live' }
    })
  }, [created])

  const totals = useMemo(() => {
    const revenue = enriched.reduce((s, e) => s + e.revenue, 0)
    const sold = enriched.reduce((s, e) => s + e.sold, 0)
    const live = enriched.filter((e) => e.status === 'Live').length
    const members = LOYALTY_TIERS.reduce((s, t) => s + t.members, 0)
    return { revenue, sold, live, members }
  }, [enriched])

  const topEvents = useMemo(
    () => [...enriched].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    [enriched],
  )

  const week = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((d) => ({ d, v: rand('wk' + d, 30, 100) }))
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const publish = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    const ev = {
      id: `new-${Date.now()}`,
      title: form.title,
      artist: form.venue || form.city,
      category: form.category,
      city: form.city,
      venue: form.venue || 'TBA',
      date: form.date,
      time: form.time,
      price: Number(form.price) || 0,
      capacity: Number(form.capacity) || 500,
      image: form.image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
      organiser: 'Your Studio',
      tags: [form.category],
    }
    setCreated((c) => [ev, ...c])
    setJustCreated(ev.title)
    setForm({ title: '', category: 'Music', city: 'Lusaka', venue: '', date: '', time: '19:00', price: '', capacity: '500', image: '', desc: '' })
    setTab('events')
  }

  const maxTop = Math.max(1, ...topEvents.map((e) => e.revenue))

  return (
    <div className="admin">
      <div className="admin-topbar">
        <button className="admin-back" onClick={onClose}>← Back to site</button>
        <div className="admin-brand">ZIKETS <span>Studio</span></div>
        <div className="admin-user">
          <span className="admin-avatar">Z</span>
          <span className="admin-user-name">Organiser</span>
        </div>
      </div>

      <div className="admin-shell">
        <nav className="admin-nav">
          {TABS.map((t) => (
            <button key={t.id} className="admin-navitem" data-active={tab === t.id} onClick={() => setTab(t.id)}>
              <span className="admin-navicon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <main className="admin-main">
          {/* ---------- OVERVIEW ---------- */}
          {tab === 'overview' && (
            <>
              <header className="admin-head">
                <h1>Welcome back 👋</h1>
                <p>Here’s how your events are performing.</p>
              </header>

              <div className="kpi-grid">
                <Kpi label="Total revenue" value={money(totals.revenue)} trend="+12.4%" tone="green" />
                <Kpi label="Tickets sold" value={totals.sold.toLocaleString()} trend="+8.1%" tone="brand" />
                <Kpi label="Live events" value={totals.live} trend="3 upcoming" tone="blue" />
                <Kpi label="Loyalty members" value={totals.members.toLocaleString()} trend="+230 this month" tone="gold" />
              </div>

              <div className="admin-cols">
                <section className="panel">
                  <div className="panel-head"><h3>Sales this week</h3><span>tickets / day</span></div>
                  <div className="bars">
                    {week.map((w) => (
                      <div className="bar-col" key={w.d}>
                        <div className="bar" style={{ height: `${w.v}%` }} />
                        <em>{w.d}</em>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head"><h3>Recent activity</h3></div>
                  <ul className="feed">
                    {ACTIVITY.map((a, i) => (
                      <li key={i}>
                        <span className="feed-icon">{a.icon}</span>
                        <span className="feed-text">{a.text}</span>
                        <span className="feed-time">{a.time}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="panel">
                <div className="panel-head"><h3>Top earning events</h3></div>
                <div className="ranklist">
                  {topEvents.map((e, i) => (
                    <div className="rank" key={e.id}>
                      <span className="rank-n">{i + 1}</span>
                      <div className="rank-main">
                        <strong>{e.title}</strong>
                        <div className="rank-bar"><div style={{ width: `${(e.revenue / maxTop) * 100}%` }} /></div>
                      </div>
                      <span className="rank-val">{money(e.revenue)}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ---------- CREATE EVENT ---------- */}
          {tab === 'create' && (
            <>
              <header className="admin-head">
                <h1>Create an event</h1>
                <p>Publish a new event to Zikets in seconds.</p>
              </header>

              {justCreated && (
                <div className="admin-banner">✓ <strong>{justCreated}</strong> was published. Find it under My events.</div>
              )}

              <div className="admin-cols create-cols">
                <form className="panel form" onSubmit={publish}>
                  <label>Event title
                    <input value={form.title} onChange={set('title')} placeholder="e.g. Lusaka Summer Fest" />
                  </label>
                  <div className="form-row">
                    <label>Category
                      <select value={form.category} onChange={set('category')}>
                        {categories.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                    <label>City
                      <input value={form.city} onChange={set('city')} placeholder="Lusaka" />
                    </label>
                  </div>
                  <label>Venue
                    <input value={form.venue} onChange={set('venue')} placeholder="Heroes Stadium" />
                  </label>
                  <div className="form-row">
                    <label>Date
                      <input type="date" value={form.date} onChange={set('date')} />
                    </label>
                    <label>Time
                      <input type="time" value={form.time} onChange={set('time')} />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>Ticket price (K) — 0 = free
                      <input type="number" min="0" value={form.price} onChange={set('price')} placeholder="250" />
                    </label>
                    <label>Capacity
                      <input type="number" min="1" value={form.capacity} onChange={set('capacity')} placeholder="500" />
                    </label>
                  </div>
                  <label>Flier image URL
                    <input value={form.image} onChange={set('image')} placeholder="https://…" />
                  </label>
                  <button className="btn btn-primary btn-block" type="submit">Publish event</button>
                </form>

                <section className="panel preview-panel">
                  <div className="panel-head"><h3>Live preview</h3></div>
                  <div className="prev-card">
                    <div
                      className="prev-img"
                      style={{ backgroundImage: `url(${form.image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80'})` }}
                    >
                      <span className="prev-price">{Number(form.price) > 0 ? money(Number(form.price)) : 'FREE'}</span>
                    </div>
                    <div className="prev-body">
                      <div className="prev-cat">{form.category} · {form.city || 'City'}</div>
                      <strong>{form.title || 'Your event title'}</strong>
                      <em>{form.venue || 'Venue'} · {form.date ? fmtDate(form.date) : 'Date'} · {form.time}</em>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* ---------- MY EVENTS ---------- */}
          {tab === 'events' && (
            <>
              <header className="admin-head">
                <h1>My events</h1>
                <p>{enriched.length} events · past, live and sold out.</p>
              </header>
              <div className="ev-table">
                <div className="ev-row ev-head">
                  <span>Event</span><span>Date</span><span>Status</span><span>Sold</span><span>Revenue</span>
                </div>
                {enriched.map((e) => (
                  <div className="ev-row" key={e.id}>
                    <div className="ev-name">
                      <div className="ev-thumb" style={{ backgroundImage: `url(${e.image})` }} />
                      <div><strong>{e.title}</strong><em>{e.venue}, {e.city}</em></div>
                    </div>
                    <span className="ev-date">{fmtDate(e.date)}</span>
                    <span><span className={`status s-${e.status.replace(' ', '').toLowerCase()}`}>{e.status}</span></span>
                    <div className="ev-sold">
                      <div className="ev-progress"><div style={{ width: `${(e.sold / e.capacity) * 100}%` }} /></div>
                      <em>{e.sold}/{e.capacity}</em>
                    </div>
                    <span className="ev-rev">{e.price === 0 ? '—' : money(e.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ---------- TICKETS SOLD ---------- */}
          {tab === 'tickets' && (
            <>
              <header className="admin-head">
                <h1>Tickets sold</h1>
                <p>{totals.sold.toLocaleString()} tickets · {money(totals.revenue)} collected.</p>
              </header>

              <div className="admin-cols">
                <section className="panel">
                  <div className="panel-head"><h3>Sales by payment method</h3></div>
                  {NETWORKS.map((n) => (
                    <div className="split" key={n.name}>
                      <span className="split-name">{n.name}</span>
                      <div className="split-bar"><div style={{ width: `${n.share * 100}%`, background: n.color }} /></div>
                      <span className="split-val">{Math.round(n.share * 100)}%</span>
                    </div>
                  ))}
                </section>

                <section className="panel">
                  <div className="panel-head"><h3>Best sellers</h3></div>
                  <div className="ranklist">
                    {[...enriched].sort((a, b) => b.sold - a.sold).slice(0, 5).map((e, i) => (
                      <div className="rank" key={e.id}>
                        <span className="rank-n">{i + 1}</span>
                        <div className="rank-main">
                          <strong>{e.title}</strong>
                          <div className="rank-bar"><div style={{ width: `${(e.sold / Math.max(...enriched.map((x) => x.sold))) * 100}%` }} /></div>
                        </div>
                        <span className="rank-val">{e.sold}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="panel">
                <div className="panel-head"><h3>Per-event breakdown</h3></div>
                <div className="ev-table compact">
                  <div className="ev-row ev-head"><span>Event</span><span>Price</span><span>Sold</span><span>Revenue</span></div>
                  {enriched.map((e) => (
                    <div className="ev-row" key={e.id}>
                      <span className="ev-simple">{e.title}</span>
                      <span>{e.price === 0 ? 'Free' : money(e.price)}</span>
                      <span>{e.sold}</span>
                      <span className="ev-rev">{e.price === 0 ? '—' : money(e.revenue)}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ---------- LOYALTY ---------- */}
          {tab === 'loyalty' && (
            <>
              <header className="admin-head">
                <h1>Customer loyalty program</h1>
                <p>Reward regulars with points, tiers and perks.</p>
                <label className="switch">
                  <input type="checkbox" checked={programOn} onChange={() => setProgramOn((v) => !v)} />
                  <span className="switch-track"><span className="switch-thumb" /></span>
                  {programOn ? 'Program active' : 'Program paused'}
                </label>
              </header>

              <div className="tier-grid">
                {LOYALTY_TIERS.map((t) => (
                  <div className="tier" key={t.name}>
                    <span className="tier-badge" style={{ background: t.color }}>{t.name[0]}</span>
                    <strong>{t.name}</strong>
                    <span className="tier-members">{t.members.toLocaleString()} members</span>
                    <em>{t.perk}</em>
                  </div>
                ))}
              </div>

              <div className="admin-cols">
                <section className="panel">
                  <div className="panel-head"><h3>Program stats</h3></div>
                  <div className="mini-kpis">
                    <div><em>Points issued</em><strong>1.24M</strong></div>
                    <div><em>Points redeemed</em><strong>860K</strong></div>
                    <div><em>Redemption rate</em><strong>69%</strong></div>
                    <div><em>Repeat buyers</em><strong>41%</strong></div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head"><h3>Top members</h3></div>
                  <div className="member-list">
                    {TOP_MEMBERS.map((m, i) => (
                      <div className="member" key={m.name}>
                        <span className="member-rank">{i + 1}</span>
                        <span className="member-avatar">{m.name.charAt(0)}</span>
                        <div className="member-main">
                          <strong>{m.name}</strong>
                          <em>{m.events} events attended</em>
                        </div>
                        <span className="member-tier" data-tier={m.tier}>{m.tier}</span>
                        <span className="member-pts">{m.points.toLocaleString()} pts</span>
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

function Kpi({ label, value, trend, tone }) {
  return (
    <div className={`kpi tone-${tone}`}>
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      <span className="kpi-trend">{trend}</span>
    </div>
  )
}
