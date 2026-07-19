import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { events } from '../data/events.js'

const LUSAKA = { lat: -15.4167, lng: 28.2833 }
const money = (n) => (n === 0 ? 'FREE' : `K${n.toLocaleString()}`)

// Great-circle distance in km
function haversine(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const fmtDist = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(km < 10 ? 1 : 0)} km away`

const eventPin = (e) =>
  L.divIcon({
    className: '',
    html: `<div class="evt-pin ${e.price === 0 ? 'free' : ''}">${e.price === 0 ? '🎉' : '🎟️'}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })

const userPin = () =>
  L.divIcon({
    className: '',
    html: `<div class="user-pin"><span></span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })

export default function LocationView({ onClose, onPick }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [phase, setPhase] = useState('locating') // locating | zooming | done
  const [denied, setDenied] = useState(false)
  const [nearby, setNearby] = useState([])

  useEffect(() => {
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    }).setView([20, 10], 2) // start at world view
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    setTimeout(() => map.invalidateSize(), 200)

    let settled = false
    const settle = () => {
      if (settled) return
      settled = true
      setPhase('done')
    }

    const reveal = (lat, lng) => {
      const me = { lat, lng }

      // Drop event pins
      events.forEach((e) => {
        const m = L.marker([e.lat, e.lng], { icon: eventPin(e) }).addTo(map)
        m.bindPopup(
          `<strong>${e.title}</strong><br/>${e.venue}, ${e.city}<br/><b>${money(e.price)}</b>`
        )
        m.on('click', () => onPick?.(e))
      })

      // Your location
      L.marker([lat, lng], { icon: userPin() }).addTo(map).bindPopup('You are here')

      // Rank events by distance
      const ranked = events
        .map((e) => ({ ...e, dist: haversine(me, e) }))
        .sort((a, b) => a.dist - b.dist)
      setNearby(ranked)

      // Cinematic zoom: world -> your area
      setTimeout(() => {
        setPhase('zooming')
        map.flyTo([lat, lng], 11, { duration: 3.4 })
      }, 800)

      map.once('moveend', settle)
      setTimeout(settle, 5200) // safety fallback
    }

    if (!navigator.geolocation) {
      setDenied(true)
      reveal(LUSAKA.lat, LUSAKA.lng)
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => reveal(pos.coords.latitude, pos.coords.longitude),
        () => {
          setDenied(true)
          reveal(LUSAKA.lat, LUSAKA.lng)
        },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
      )
    }

    return () => map.remove()
  }, [])

  const flyTo = (e) => {
    mapRef.current?.flyTo([e.lat, e.lng], 14, { duration: 1.4 })
  }

  return (
    <div className="loc-view">
      <div ref={containerRef} className="loc-map" />

      {/* Loading veil during locating + zooming — GPS acquisition scan */}
      <div className={`loc-veil ${phase === 'done' ? 'gone' : ''}`}>
        <div className="scanner">
          <div className="scanner-face" />
          <div className="scanner-ring r1" />
          <div className="scanner-ring r2" />
          <div className="scanner-sweep" />
          <span className="scanner-pulse" />
          <span className="scanner-pulse" />
          <span className="scanner-pulse" />
          <div className="scanner-dot" />
        </div>
        <h2>{phase === 'zooming' ? 'Zooming to your area' : 'Acquiring your location'}</h2>
        <p>{phase === 'zooming' ? 'Mapping events around you…' : 'Triangulating your GPS signal…'}</p>
        <div className="loc-progress"><span /></div>
      </div>

      {/* Top bar */}
      <div className="loc-top">
        <button className="loc-back" onClick={onClose}>← Back to all events</button>
        <span className="loc-title">📍 Events near you</span>
      </div>

      {/* Nearby panel */}
      <div className={`loc-panel ${phase === 'done' ? 'up' : ''}`}>
        <div className="loc-panel-grab" />
        {denied && (
          <div className="loc-note">
            Couldn&apos;t get your exact spot — showing <strong>Lusaka</strong>. Enable location in
            your browser to personalise this.
          </div>
        )}
        <div className="loc-panel-head">
          <h3>Closest to you</h3>
          <span>{nearby.length} events</span>
        </div>
        <div className="loc-list">
          {nearby.map((e) => (
            <div className="loc-item" key={e.id}>
              <button className="loc-item-main" onClick={() => flyTo(e)}>
                <span className={`loc-dot ${e.price === 0 ? 'free' : ''}`} />
                <span className="loc-item-text">
                  <strong>{e.title}</strong>
                  <em>{e.city} · {fmtDist(e.dist)}</em>
                </span>
              </button>
              <span className={`loc-price ${e.price === 0 ? 'free' : ''}`}>{money(e.price)}</span>
              <button className="btn btn-primary loc-buy" onClick={() => onPick?.(e)}>
                {e.price === 0 ? 'Reserve' : 'Tickets'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
