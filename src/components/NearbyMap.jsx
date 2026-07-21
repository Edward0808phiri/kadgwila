import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import Icon from './ui/Icon.jsx'
import useDialog from '../hooks/useDialog.js'
import { events } from '../data/events.js'
import { distance, price } from '../lib/format.js'

const LUSAKA = { lat: -15.4167, lng: 28.2833 }

function haversine(a, b) {
  const R = 6371
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const TICKET_GLYPH =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6Z"/></svg>'

const eventPin = (event) =>
  L.divIcon({
    className: '',
    html: `<span class="pin" data-free="${event.price === 0}">${TICKET_GLYPH}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

const userPin = () =>
  L.divIcon({ className: '', html: '<span class="pin-me"></span>', iconSize: [18, 18], iconAnchor: [9, 9] })

export default function NearbyMap({ onClose, onSelect }) {
  const root = useDialog(onClose)
  const container = useRef(null)
  const map = useRef(null)
  const [phase, setPhase] = useState('locating')
  const [fellBack, setFellBack] = useState(false)
  const [nearby, setNearby] = useState([])

  useEffect(() => {
    const instance = L.map(container.current, {
      zoomControl: false,
      worldCopyJump: true,
    }).setView([-13.5, 28], 5)
    map.current = instance

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(instance)

    L.control.zoom({ position: 'bottomright' }).addTo(instance)

    const resize = () => instance.invalidateSize()
    const raf = requestAnimationFrame(resize)
    window.addEventListener('resize', resize)

    let settled = false
    const settle = () => {
      if (settled) return
      settled = true
      setPhase('ready')
    }

    const plot = (lat, lng) => {
      const me = { lat, lng }

      events.forEach((event) => {
        L.marker([event.lat, event.lng], { icon: eventPin(event) })
          .addTo(instance)
          .bindPopup(
            `<strong>${event.title}</strong><br>${event.venue}, ${event.city}<br><b>${price(event.price)}</b>`,
          )
          .on('click', () => onSelect?.(event))
      })

      L.marker([lat, lng], { icon: userPin() }).addTo(instance).bindPopup('You are here')

      setNearby(
        events
          .map((event) => ({ ...event, km: haversine(me, event) }))
          .sort((a, b) => a.km - b.km),
      )

      setPhase('zooming')
      instance.flyTo([lat, lng], 10, { duration: 2.4 })
      instance.once('moveend', settle)
      setTimeout(settle, 4200)
    }

    if (!navigator.geolocation) {
      setFellBack(true)
      plot(LUSAKA.lat, LUSAKA.lng)
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => plot(pos.coords.latitude, pos.coords.longitude),
        () => {
          setFellBack(true)
          plot(LUSAKA.lat, LUSAKA.lng)
        },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 },
      )
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      instance.remove()
    }
  }, [onSelect])

  const ready = phase === 'ready'

  return (
    <div
      ref={root}
      className="mapview"
      role="dialog"
      aria-modal="true"
      aria-label="Events near you"
      tabIndex={-1}
    >
      <div ref={container} className="mapview-canvas" />

      <div className="mapview-veil" data-done={ready || undefined} aria-hidden={ready}>
        <div className="locator">
          <span className="locator-wave" />
          <span className="locator-wave" />
          <span className="locator-wave" />
          <span className="locator-dot" />
        </div>
        <h2>{phase === 'zooming' ? 'Finding events around you' : 'Getting your location'}</h2>
        <p>
          {phase === 'zooming'
            ? 'Plotting what is on nearby'
            : 'Allow location access for accurate results'}
        </p>
        <div className="mapview-progress">
          <span />
        </div>
      </div>

      <div className="mapview-top">
        <button type="button" className="mapview-back" onClick={onClose}>
          <Icon name="arrowLeft" size={17} />
          All events
        </button>
        <span className="mapview-title">
          <Icon name="pin" size={16} />
          Near you
        </span>
      </div>

      <aside className="mapview-panel" data-open={ready || undefined}>
        <div className="sheet-grip" />

        {fellBack && (
          <p className="mapview-note">
            <Icon name="info" size={15} />
            We couldn&apos;t get your exact location, so this is centred on Lusaka. Enable location
            access in your browser for accurate distances.
          </p>
        )}

        <div className="mapview-panel-head">
          <h3>Closest to you</h3>
          <span>{nearby.length} events</span>
        </div>

        <div className="mapview-list">
          {nearby.map((event) => (
            <div className="mapview-item" key={event.id}>
              <button
                type="button"
                className="mapview-item-main"
                onClick={() => map.current?.flyTo([event.lat, event.lng], 13, { duration: 1.2 })}
              >
                <span className="mapview-item-dot" data-free={event.price === 0 || undefined} />
                <span className="mapview-item-text">
                  <strong>{event.title}</strong>
                  <span>
                    {event.city} · {distance(event.km)}
                  </span>
                </span>
              </button>
              <span className="mapview-item-price" data-free={event.price === 0 || undefined}>
                {price(event.price)}
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onSelect?.(event)}
              >
                {event.price === 0 ? 'Reserve' : 'Tickets'}
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
