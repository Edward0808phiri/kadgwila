import { useEffect, useRef, useState } from 'react'
import Icon from './ui/Icon.jsx'
import Logo from './ui/Logo.jsx'

export default function Nav({
  query,
  onQuery,
  solid,
  theme,
  onToggleTheme,
  ticketCount,
  onOpenAccount,
  onOpenMap,
  onBrowseAll,
  onBrowseFree,
  activeView,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const input = useRef(null)

  useEffect(() => {
    if (searchOpen) input.current?.focus()
  }, [searchOpen])

  const closeSearch = () => {
    setSearchOpen(false)
    onQuery('')
  }

  return (
    <header className="nav" data-solid={solid}>
      <div className="nav-inner">
        <button type="button" className="nav-brand" onClick={onBrowseAll} aria-label="Zikets — home">
          <Logo />
        </button>

        <nav className="nav-links" aria-label="Primary">
          <button
            type="button"
            className="nav-link"
            data-active={activeView === 'browse' || undefined}
            onClick={onBrowseAll}
          >
            Browse
          </button>
          <button
            type="button"
            className="nav-link"
            data-active={activeView === 'free' || undefined}
            onClick={onBrowseFree}
          >
            Free events
          </button>
          <button type="button" className="nav-link" onClick={onOpenMap}>
            Near me
          </button>
        </nav>

        <div className="nav-actions">
          <div className="nav-search" data-open={searchOpen || undefined}>
            <div className="nav-search-field">
              <input
                ref={input}
                type="search"
                className="nav-search-input"
                placeholder="Search events, cities, artists"
                aria-label="Search events"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
              />
              <button
                type="button"
                className="nav-search-clear"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              aria-label={searchOpen ? 'Close search' : 'Search events'}
              aria-expanded={searchOpen}
            >
              <Icon name="search" />
            </button>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>

          <button
            type="button"
            className="icon-btn nav-account"
            onClick={onOpenAccount}
            aria-label={`Your account${ticketCount ? `, ${ticketCount} saved` : ''}`}
          >
            <Icon name="user" />
            {ticketCount > 0 && <span className="nav-badge">{ticketCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
