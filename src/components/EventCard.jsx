import Icon from './ui/Icon.jsx'
import { categoryIcon } from '../data/events.js'
import { dateParts, kwacha, whenLabel } from '../lib/format.js'
import { eventImage, eventSrcSet, eventTintSource } from '../lib/images.js'
import useImageTint from '../hooks/useImageTint.js'

const LOW_STOCK = 60

export default function EventCard({ event, onSelect, priority = false }) {
  const { month, day } = dateParts(event.date)
  const soldOut = Boolean(event.soldOut)
  const free = event.price === 0
  const low = !soldOut && event.spotsLeft > 0 && event.spotsLeft <= LOW_STOCK

  const action = soldOut ? 'Sold out' : free ? 'Reserve a spot' : 'Get tickets'

  const tint = useImageTint(eventTintSource(event))

  return (
    <article
      className="card"
      data-sold={soldOut || undefined}
      data-tinted={tint ? 'true' : undefined}
      style={tint ? { '--tint-h': tint.h, '--tint-s': `${tint.s}%` } : undefined}
    >
      <div className="card-media">
        <img
          className="card-img"
          src={eventImage(event, 300, 400)}
          srcSet={eventSrcSet(event, 300, 400)}
          sizes="(min-width: 900px) 244px, (min-width: 640px) 232px, 62vw"
          alt=""
          width="300"
          height="400"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />

        <div className="card-date">
          <span className="card-date-month">{month}</span>
          <span className="card-date-day">{day}</span>
        </div>

        {soldOut && (
          <span className="badge card-status" data-kind="sold">
            Sold out
          </span>
        )}
        {low && (
          <span className="badge card-status" data-kind="low">
            {event.spotsLeft} left
          </span>
        )}

        <span className="card-price" data-free={free || undefined}>
          {free ? 'Free entry' : kwacha(event.price)}
          {!free && <small>each</small>}
        </span>
      </div>

      <div className="card-body">
        <span className="card-eyebrow">
          <Icon name={categoryIcon(event.category)} size={13} />
          {event.category}
        </span>

        <h3 className="card-title">{event.title}</h3>

        <div className="card-meta">
          <span className="card-meta-row">
            <Icon name="pin" size={14} />
            <span>
              {event.venue}, {event.city}
            </span>
          </span>
          <span className="card-meta-row">
            <Icon name="clock" size={14} />
            <span>
              {whenLabel(event.date)} · {event.time}
            </span>
          </span>
        </div>

        <div className="card-foot">
          <button
            type="button"
            className="card-cta"
            onClick={() => !soldOut && onSelect(event)}
            disabled={soldOut}
            aria-label={`${action} — ${event.title}`}
          >
            {action}
            {!soldOut && <Icon name="arrowRight" size={15} />}
          </button>

          {!soldOut && !low && (
            <span className="card-spots">{event.spotsLeft.toLocaleString('en-GB')} left</span>
          )}
        </div>
      </div>
    </article>
  )
}
