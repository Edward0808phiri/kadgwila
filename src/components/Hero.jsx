import { useEffect, useState } from 'react'
import Icon from './ui/Icon.jsx'
import { useReducedMotion } from '../hooks/useMediaQuery.js'
import { eventImage, eventSrcSet } from '../lib/images.js'

const ROTATE_MS = 7000

export default function Hero({ events, onSelect, onBrowse }) {
  const [index, setIndex] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || events.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % events.length), ROTATE_MS)
    return () => clearInterval(timer)
  }, [events.length, reducedMotion])

  const featured = events[index]
  if (!featured) return null

  return (
    <section className="hero">
      <div className="hero-stage" aria-hidden="true">
        {events.map((event, i) => (
          <img
            key={event.id}
            className="hero-slide"
            data-active={i === index || undefined}
            src={eventImage(event, 1600, 900)}
            srcSet={eventSrcSet(event, 1000, 620)}
            sizes="100vw"
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
        <div className="hero-scrim" />
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">
          <Icon name="trending" size={13} />
          Featured this week
        </p>

        <h1>{featured.title}</h1>

        <div className="hero-cta">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => onSelect(featured)}>
            <Icon name="ticket" size={18} />
            {featured.price === 0 ? 'Reserve a spot' : 'Get tickets'}
          </button>
          <button type="button" className="btn btn-glass btn-lg" onClick={onBrowse}>
            Browse all events
          </button>
        </div>

        <div className="hero-tabs">
          {events.map((event, i) => (
            <button
              key={event.id}
              type="button"
              className="hero-tab"
              data-active={i === index || undefined}
              aria-current={i === index}
              aria-label={`Show ${event.title}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
