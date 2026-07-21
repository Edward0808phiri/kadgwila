import { useEffect, useMemo, useState } from 'react'
import Nav from './components/Nav.jsx'
import TabBar from './components/TabBar.jsx'
import Hero from './components/Hero.jsx'
import EventRow from './components/EventRow.jsx'
import EventCard from './components/EventCard.jsx'
import Footer from './components/Footer.jsx'
import Checkout from './components/Checkout.jsx'
import Account from './components/Account.jsx'
import NearbyMap from './components/NearbyMap.jsx'
import Studio from './components/Studio.jsx'
import Icon from './components/ui/Icon.jsx'
import { categories, events as allEvents } from './data/events.js'
import { useAccount } from './store.js'

const byDate = (a, b) => new Date(a.date) - new Date(b.date)

export default function App() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [freeOnly, setFreeOnly] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [checkoutEvent, setCheckoutEvent] = useState(null)
  const [showAccount, setShowAccount] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showStudio, setShowStudio] = useState(false)

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('zikets.theme') || 'dark'
    } catch {
      return 'dark'
    }
  })

  const { purchases, plans } = useAccount()
  const ticketCount = purchases.length + plans.length

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('zikets.theme', theme)
    } catch {
      /* private mode — the theme just won't persist */
    }
  }, [theme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filtering = category !== 'All' || freeOnly || query.trim() !== ''

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allEvents.filter((event) => {
      if (category !== 'All' && event.category !== category) return false
      if (freeOnly && event.price !== 0) return false
      if (!q) return true
      return [event.title, event.city, event.artist, event.venue, event.organiser].some((field) =>
        field.toLowerCase().includes(q),
      )
    })
  }, [category, freeOnly, query])

  const featured = useMemo(
    () => allEvents.filter((e) => !e.soldOut).sort(byDate).slice(0, 5),
    [],
  )

  const rows = useMemo(() => {
    const upcoming = [...allEvents].sort(byDate)
    return [
      {
        title: 'Happening soon',
        subtitle: 'The next events on sale across Zambia',
        events: upcoming,
        priority: true,
      },
      {
        title: 'Selling fast',
        subtitle: 'Fewest tickets left',
        events: upcoming.filter((e) => !e.soldOut).sort((a, b) => a.spotsLeft - b.spotsLeft),
      },
      {
        title: 'Free and community',
        subtitle: 'No ticket price, just turn up',
        events: upcoming.filter((e) => e.price === 0),
      },
    ]
  }, [])

  const goToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const browseAll = () => {
    setCategory('All')
    setFreeOnly(false)
    setQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const browseFree = () => {
    setCategory('All')
    setQuery('')
    setFreeOnly(true)
    goToEvents()
  }

  const activeView = freeOnly ? 'free' : 'browse'

  return (
    <div className="app">
      <a className="skip-link" href="#events">
        Skip to events
      </a>

      <Nav
        query={query}
        onQuery={setQuery}
        solid={scrolled}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        ticketCount={ticketCount}
        onOpenAccount={() => setShowAccount(true)}
        onOpenMap={() => setShowMap(true)}
        onBrowseAll={browseAll}
        onBrowseFree={browseFree}
        activeView={activeView}
      />

      <Hero events={featured} onSelect={setCheckoutEvent} onBrowse={goToEvents} />

      <main id="events">
        <section className="section section-tight wrap">
          <div className="section-head">
            <div>
              <h2>Browse by category</h2>
              <p>Pick a category, or search for a city or artist</p>
            </div>
          </div>

          <div className="catrail" role="group" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                className="cat-chip"
                data-active={(!freeOnly && category === item.id) || undefined}
                aria-pressed={!freeOnly && category === item.id}
                onClick={() => {
                  setCategory(item.id)
                  setFreeOnly(false)
                }}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="cat-chip cat-chip-free"
              data-active={freeOnly || undefined}
              aria-pressed={freeOnly}
              onClick={() => {
                setFreeOnly((v) => !v)
                setCategory('All')
              }}
            >
              <Icon name="tag" size={16} />
              Free only
            </button>
            <button type="button" className="cat-chip" onClick={() => setShowMap(true)}>
              <Icon name="navigation" size={16} />
              Near me
            </button>
          </div>
        </section>

        {filtering ? (
          <section className="section wrap">
            <div className="section-head">
              <div>
                <h2>
                  {query.trim()
                    ? `Results for “${query.trim()}”`
                    : freeOnly
                      ? 'Free events'
                      : category}
                </h2>
              </div>
              <span className="section-count" role="status">
                {results.length} {results.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {results.length ? (
              <div className="grid">
                {results.map((event) => (
                  <EventCard key={event.id} event={event} onSelect={setCheckoutEvent} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="search" size={32} className="empty-state-icon" />
                <strong>No events match that</strong>
                <p>Try a different city or category, or clear the filters to see everything.</p>
                <button type="button" className="btn btn-quiet" onClick={browseAll}>
                  Clear filters
                </button>
              </div>
            )}
          </section>
        ) : (
          rows.map((row) => (
            <EventRow
              key={row.title}
              title={row.title}
              subtitle={row.subtitle}
              events={row.events}
              onSelect={setCheckoutEvent}
              priority={row.priority}
            />
          ))
        )}
      </main>

      <Footer
        onBrowseAll={browseAll}
        onBrowseFree={browseFree}
        onOpenMap={() => setShowMap(true)}
        onOpenStudio={() => setShowStudio(true)}
      />

      <TabBar
        activeView={activeView}
        ticketCount={ticketCount}
        onBrowseAll={browseAll}
        onBrowseFree={browseFree}
        onOpenMap={() => setShowMap(true)}
        onOpenAccount={() => setShowAccount(true)}
      />

      {checkoutEvent && (
        <Checkout event={checkoutEvent} onClose={() => setCheckoutEvent(null)} />
      )}
      {showAccount && <Account onClose={() => setShowAccount(false)} />}
      {showMap && (
        <NearbyMap onClose={() => setShowMap(false)} onSelect={setCheckoutEvent} />
      )}
      {showStudio && <Studio onClose={() => setShowStudio(false)} />}
    </div>
  )
}
