import { useCallback, useEffect, useRef, useState } from 'react'
import EventCard from './EventCard.jsx'
import Icon from './ui/Icon.jsx'

/**
 * Horizontal rail. Scrolls natively (touch, trackpad, keyboard focus) with
 * arrows layered on top for pointer users; the arrows disable at each end
 * rather than wrapping, so position in the list stays predictable.
 */
export default function EventRow({ title, subtitle, events, onSelect, priority = false }) {
  const track = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft >= max - 4)
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', sync)
      observer.disconnect()
    }
  }, [sync, events])

  const page = (direction) => {
    const el = track.current
    if (!el) return
    const card = el.firstElementChild
    const gap = parseFloat(getComputedStyle(el).columnGap) || 12
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8
    const perView = Math.max(1, Math.floor(el.clientWidth / step))
    el.scrollBy({ left: direction * step * perView, behavior: 'smooth' })
  }

  if (!events.length) return null

  return (
    <section className="section row" aria-roledescription="carousel" aria-label={title}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <span className="section-count">{events.length} events</span>
        </div>

        <div className="row-viewport">
          <button
            type="button"
            className="row-arrow"
            data-dir="prev"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label={`Scroll ${title} back`}
          >
            <Icon name="chevronLeft" />
          </button>

          <ul className="row-track" ref={track}>
            {events.map((event, i) => (
              <li key={event.id}>
                <EventCard event={event} onSelect={onSelect} priority={priority && i < 4} />
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="row-arrow"
            data-dir="next"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label={`Scroll ${title} forward`}
          >
            <Icon name="chevronRight" />
          </button>
        </div>
      </div>
    </section>
  )
}
