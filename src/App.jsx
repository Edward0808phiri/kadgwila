import { useEffect, useMemo, useRef, useState } from 'react'
import { events as allEvents, categories } from './data/events.js'
import Checkout from './components/Checkout.jsx'
import Account from './components/Account.jsx'
import LocationView from './components/LocationView.jsx'
import Admin from './components/Admin.jsx'
import { useAccount } from './store.js'

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

const fmtLong = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

const money = (n) => (n === 0 ? 'FREE' : `K${n.toLocaleString()}`)

const blurb = (e) =>
  `${e.artist} live at ${e.venue}, ${e.city}. ${e.tags.join(' · ')}.`

/* ---------- Poster card (Netflix-style tile) ---------- */
function Poster({ e, onPick, active = false }) {
  const soldOut = !!e.soldOut
  return (
    <article
      className={`poster ${soldOut ? 'is-sold' : ''} ${active ? 'is-wide' : ''}`}
      onClick={() => !soldOut && onPick(e)}
    >
      <div className="poster-img" style={{ backgroundImage: `url(${e.image})` }}>
        <span className="poster-price">{e.price === 0 ? 'FREE' : money(e.price)}</span>
        {soldOut && <span className="poster-stamp">Sold Out</span>}
      </div>
      <div className="poster-info">
        <div className="poster-cat">{e.category} · {e.city}</div>
        <h3>{e.title}</h3>
        <div className="poster-org">
          <span className="poster-org-avatar">{e.organiser.charAt(0)}</span>
          <span className="poster-org-name">By {e.organiser}</span>
        </div>
        <div className="poster-reveal">
          <div className="poster-meta">
            <span>📅 {fmtDate(e.date)} · {e.time}</span>
            <span>📍 {e.venue}</span>
          </div>
          {soldOut ? (
            <button className="btn btn-soldout poster-btn" disabled>Sold out</button>
          ) : (
            <button className="btn btn-primary poster-btn" onClick={(ev) => { ev.stopPropagation(); onPick(e) }}>
              {e.price === 0 ? '＋ Reserve free spot' : '▶ Grab yours'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

/* ---------- Infinite sliding row (carousel) ---------- */
function Row({ title, subtitle, items, onPick }) {
  const track = useRef(null)
  // Index of the card that is "focused" and expanded wider than the rest.
  const [active, setActive] = useState(0)

  const len = items.length
  const loop = len > 1
  // Repeat the list enough times that it feels never-ending — short lists get
  // more copies so a wide viewport is always filled on both sides.
  const copies = loop ? Math.max(3, Math.ceil(24 / len)) : 1
  const data = loop ? Array.from({ length: copies }, () => items).flat() : items

  // Pixel width of a single copy of the list (start of copy 2 − start of copy 1).
  const setWidth = () => {
    const el = track.current
    if (!el || !loop || el.children.length <= len) return 0
    return el.children[len].offsetLeft - el.children[0].offsetLeft
  }

  // The card whose left edge sits closest to the row's left edge is the
  // focused one — so swiping right hands the "wide" state to the next card.
  const leftmostIndex = () => {
    const el = track.current
    if (!el) return 0
    const base = el.getBoundingClientRect().left + 24
    let best = 0
    let bestDist = Infinity
    Array.from(el.children).forEach((c, i) => {
      const d = Math.abs(c.getBoundingClientRect().left - base)
      if (d < bestDist) { bestDist = d; best = i }
    })
    return best
  }

  const onScroll = () => {
    const el = track.current
    if (!el) return
    if (loop) {
      const w = setWidth()
      if (w > 0) {
        // Keep the viewport inside the middle copy; snap back by one copy
        // when it drifts into the first or third — invisibly, since the
        // content one copy away is identical.
        if (el.scrollLeft < w) el.scrollLeft += w
        else if (el.scrollLeft >= w * 2) el.scrollLeft -= w
      }
    }
    setActive(leftmostIndex())
  }

  useEffect(() => {
    const el = track.current
    if (!el) return
    if (loop) {
      const w = setWidth()
      if (w > 0) el.scrollLeft = w // start in the middle copy
    }
    setActive(leftmostIndex())
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  // Advance exactly one card in the given direction.
  const slide = (dir) => {
    const el = track.current
    if (!el) return
    const target = el.children[leftmostIndex() + dir]
    if (!target) {
      el.scrollBy({ left: dir * 240, behavior: 'smooth' })
      return
    }
    const padLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0
    el.scrollTo({ left: target.offsetLeft - padLeft, behavior: 'smooth' })
  }

  if (!len) return null
  const activeRel = ((active % len) + len) % len

  return (
    <section className="row">
      <div className="row-head">
        <h2>{title}</h2>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="row-viewport">
        <button className="row-arrow left" onClick={() => slide(-1)} aria-label="Scroll left">‹</button>
        <div className="row-track" ref={track}>
          {data.map((e, i) => (
            <Poster
              key={`${e.id}-${i}`}
              e={e}
              onPick={onPick}
              active={loop ? (i % len) === activeRel : i === active}
            />
          ))}
        </div>
        <button className="row-arrow right" onClick={() => slide(1)} aria-label="Scroll right">›</button>
      </div>
    </section>
  )
}

export default function App() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [freeOnly, setFreeOnly] = useState(false)
  const [active, setActive] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [heroIdx, setHeroIdx] = useState(0)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'dark' } catch { return 'dark' }
  })
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const { purchases, plans } = useAccount()
  const accountCount = purchases.length + plans.length

  // Apply + persist the colour theme.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('theme', theme) } catch { /* ignore */ }
  }, [theme])

  // Solid nav once the user scrolls past the hero fade.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Featured billboard rotates through the top picks.
  const featuredList = useMemo(() => allEvents.filter((e) => !e.soldOut).slice(0, 5), [])
  const featured = featuredList[heroIdx % featuredList.length]

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % featuredList.length), 6500)
    return () => clearInterval(t)
  }, [featuredList.length])

  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      const matchCat = category === 'All' || e.category === category
      const matchFree = !freeOnly || e.price === 0
      const q = query.trim().toLowerCase()
      const matchQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.artist.toLowerCase().includes(q)
      return matchCat && matchFree && matchQuery
    })
  }, [category, query, freeOnly])

  // Rows for the "browse" (Netflix) layout.
  const browsing = category === 'All' && !query && !freeOnly

  const rows = useMemo(() => {
    const soon = [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date))
    const free = allEvents.filter((e) => e.price === 0)
    const sellingFast = [...allEvents].sort((a, b) => a.spotsLeft - b.spotsLeft)
    return [
      { title: 'Trending now', subtitle: 'what everyone’s booking', items: allEvents },
      { title: 'Happening soon', subtitle: 'don’t miss out', items: soon },
      { title: 'Selling fast 🔥', subtitle: 'grab a seat before they’re gone', items: sellingFast },
      { title: 'Free & community', subtitle: 'no ticket, no cost', items: free },
    ]
  }, [])

  const scrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app">
      <nav className="nav" data-solid={scrolled}>
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-search" data-open={searchOpen}>
              <input
                ref={searchRef}
                className="nav-search-input"
                placeholder="Search events, cities, artists…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={scrollToEvents}
                onBlur={() => { if (!query.trim()) setSearchOpen(false) }}
              />
              <button
                className="nav-search-btn"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
            <button
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button className="nav-account" onClick={() => setShowAccount(true)}>
              <span className="nav-account-icon">🙂</span>
              {accountCount > 0 && <span className="nav-badge">{accountCount}</span>}
            </button>
          </div>

          <div className="nav-center">
            <button className="nav-ghost" onClick={scrollToEvents}>Home</button>
            <button className="nav-ghost" onClick={() => { setFreeOnly(true); scrollToEvents() }}>Free events</button>
            <button className="nav-ghost" onClick={() => setShowMap(true)}>Near me</button>
          </div>

          <div className="nav-right">
            <div className="logo">
              ZIKETS<span className="dot">.</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ---------- Cinematic hero billboard ---------- */}
      <header className="hero">
        <div className="hero-stage">
          {featuredList.map((f, i) => (
            <div
              key={f.id}
              className="hero-bg"
              data-active={i === heroIdx}
              style={{ backgroundImage: `url(${f.image})` }}
            />
          ))}
          <div className="hero-shade" />
          <div className="hero-vignette" />
        </div>

        <div className="hero-content">
          <span className="hero-badge">🔥 Featured event</span>
          <h1 key={featured.id}>{featured.title}</h1>
          <div className="hero-meta">
            <span className="hero-price">{money(featured.price)}</span>
            <span className="hero-dot">•</span>
            <span>{featured.category}</span>
            <span className="hero-dot">•</span>
            <span>📅 {fmtLong(featured.date)}</span>
            <span className="hero-dot">•</span>
            <span>📍 {featured.venue}, {featured.city}</span>
          </div>
          <p className="hero-desc">{blurb(featured)}</p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => setActive(featured)}>
              ▶ Grab tickets
            </button>
            <button className="btn btn-glass btn-lg" onClick={scrollToEvents}>
              ⓘ More events
            </button>
          </div>
          <div className="hero-dots">
            {featuredList.map((f, i) => (
              <button
                key={f.id}
                className="hero-dot-btn"
                data-active={i === heroIdx}
                onClick={() => setHeroIdx(i)}
                aria-label={`Featured ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* ---------- Big category tiles ---------- */}
      <div className="catbar" id="events">
        <div className="wrap">
          <h2 className="catbar-title">Browse by category</h2>
          <div className="cat-grid">
            {categories.map((c) => (
              <button
                key={c}
                className="cat-tile"
                data-active={c === category && !freeOnly}
                onClick={() => { setCategory(c); setQuery(''); setFreeOnly(false) }}
              >
                {c}
              </button>
            ))}
            <button
              className="cat-tile"
              data-active={freeOnly}
              onClick={() => { setFreeOnly((v) => !v); setCategory('All'); setQuery('') }}
            >
              {freeOnly ? 'Free only ✓' : 'Free only'}
            </button>
            <button className="cat-tile cat-near" onClick={() => setShowMap(true)}>
              Events near me
            </button>
          </div>
        </div>
      </div>

      <main className="rows-wrap">
        {browsing ? (
          <>
            {rows.map((r) => (
              <Row key={r.title} title={r.title} subtitle={r.subtitle} items={r.items} onPick={setActive} />
            ))}
          </>
        ) : (
          <section className="results wrap">
            <div className="row-head">
              <h2>{query ? `Results for “${query}”` : freeOnly ? 'Free events' : category}</h2>
              <span>{filtered.length} event{filtered.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid">
              {filtered.map((e) => (
                <Poster key={e.id} e={e} onPick={setActive} />
              ))}
              {filtered.length === 0 && (
                <div className="empty">Nothing here yet — try clearing filters. 🙂</div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>Made with ❤️ in Zambia 🇿🇲 · Zikets {new Date().getFullYear()}</span>
          <div className="footer-right">
            <button className="btn btn-primary footer-cta" onClick={() => setShowAdmin(true)}>
              ＋ Create events
            </button>
            <div className="pay-logos">
              <em>Pay with</em>
              <span>Airtel</span>
              <span>MTN</span>
              <span>Zamtel</span>
            </div>
          </div>
        </div>
      </footer>

      {showMap && (
        <LocationView onClose={() => setShowMap(false)} onPick={(e) => setActive(e)} />
      )}

      {showAdmin && <Admin onClose={() => setShowAdmin(false)} />}

      {active && <Checkout event={active} onClose={() => setActive(null)} />}

      {showAccount && <Account onClose={() => setShowAccount(false)} />}
    </div>
  )
}
