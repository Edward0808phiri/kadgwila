import { useEffect, useState } from 'react'

export default function NearYouToast({ onEnable, onDismiss }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 600) {
        setShow(true)
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => {
    setShow(false)
    setTimeout(onDismiss, 250)
  }

  return (
    <div className={`near-toast ${show ? 'in' : ''}`}>
      <div className="near-ping">📍</div>
      <div className="near-body">
        <strong>See events near you</strong>
        <p>Turn on location and we&apos;ll show concerts &amp; free events happening around you.</p>
        <div className="near-actions">
          <button className="btn btn-primary" onClick={onEnable}>Turn on location</button>
          <button className="near-skip" onClick={close}>Not now</button>
        </div>
      </div>
      <button className="near-close" onClick={close} aria-label="Dismiss">×</button>
    </div>
  )
}
