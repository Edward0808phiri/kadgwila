import { useState } from 'react'
import Sheet from './ui/Sheet.jsx'
import Icon from './ui/Icon.jsx'
import { compact, count } from '../lib/format.js'
import { eventImage, eventSrcSet } from '../lib/images.js'
import { addComment, reactionFor, removeComment, toggleLike, useReactions } from '../store.js'

/* Reaction motes drifting up behind the hero copy. Fixed offsets rather than
   random ones so the arrangement is the same on every open. */
const MOTES = [
  { icon: 'heart', left: '8%', delay: '0s', scale: 1 },
  { icon: 'heart', left: '26%', delay: '1.4s', scale: 0.72 },
  { icon: 'star', left: '44%', delay: '2.6s', scale: 0.85 },
  { icon: 'heart', left: '62%', delay: '0.7s', scale: 0.62 },
  { icon: 'music', left: '78%', delay: '3.1s', scale: 0.9 },
  { icon: 'heart', left: '91%', delay: '2s', scale: 0.75 },
]

export default function Live({ events, onSelect, onClose }) {
  const reactions = useReactions()

  return (
    <Sheet
      eyebrow="On air now"
      title="Live"
      sub="Events streaming right now — like them, leave a comment"
      onClose={onClose}
      wide
    >
      <div className="live-hero">
        <div className="live-motes" aria-hidden="true">
          {MOTES.map((mote, i) => (
            <span
              key={i}
              className="live-mote"
              style={{ left: mote.left, animationDelay: mote.delay, '--mote-scale': mote.scale }}
            >
              <Icon name={mote.icon} size={18} />
            </span>
          ))}
        </div>

        <div className="live-hero-copy">
          <span className="live-pill">
            <span className="live-dot" />
            {events.length} live
          </span>
          <h3>Zambia, right now</h3>
          <p>Tap into an event as it happens. Your likes and comments stay on this device.</p>
        </div>
      </div>

      {events.length ? (
        <ul className="live-list">
          {events.map((event) => (
            <LiveItem
              key={event.id}
              event={event}
              reaction={reactionFor(reactions, event.id)}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <Icon name="broadcast" size={32} className="empty-state-icon" />
          <strong>Nothing live right now</strong>
          <p>Check back when the next event kicks off.</p>
        </div>
      )}
    </Sheet>
  )
}

function LiveItem({ event, reaction, onSelect }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const { liked, comments } = reaction
  const likes = (event.baseLikes ?? 0) + (liked ? 1 : 0)

  const submit = (e) => {
    e.preventDefault()
    addComment(event.id, draft)
    setDraft('')
  }

  return (
    <li className="live-item">
      <div className="live-item-main">
        <button
          type="button"
          className="live-thumb"
          onClick={() => onSelect(event)}
          aria-label={`Get tickets — ${event.title}`}
        >
          <img
            src={eventImage(event, 120, 120)}
            srcSet={eventSrcSet(event, 120, 120)}
            alt=""
            width="120"
            height="120"
            loading="lazy"
            decoding="async"
          />
        </button>

        <div className="live-item-text">
          <h4>{event.title}</h4>
          <p>
            {event.venue}, {event.city}
          </p>
          <span className="live-viewers">
            <Icon name="users" size={13} />
            {compact(event.spotsLeft)} watching
          </span>
        </div>

        {/* The live badge lands at the end of every row, so they line up. */}
        <span className="live-badge">
          <span className="live-dot" />
          LIVE
        </span>
      </div>

      <div className="live-actions">
        <button
          type="button"
          className="live-action"
          data-on={liked || undefined}
          aria-pressed={liked}
          onClick={() => toggleLike(event.id)}
        >
          <Icon name="heart" size={16} className="live-heart" />
          {count(likes)}
        </button>

        <button
          type="button"
          className="live-action"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name="comment" size={16} />
          {comments.length ? count(comments.length) : 'Comment'}
        </button>
      </div>

      {open && (
        <div className="live-thread">
          {comments.length > 0 && (
            <ul className="live-comments">
              {comments.map((comment) => (
                <li key={comment.id}>
                  <p>{comment.body}</p>
                  <button
                    type="button"
                    className="live-comment-del"
                    onClick={() => removeComment(event.id, comment.id)}
                    aria-label="Delete comment"
                  >
                    <Icon name="close" size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className="live-compose" onSubmit={submit}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Say something about ${event.title}`}
              aria-label={`Comment on ${event.title}`}
              maxLength={280}
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Post comment">
              <Icon name="send" size={16} />
            </button>
          </form>
        </div>
      )}
    </li>
  )
}
