import { useEffect, useState } from 'react'

/**
 * Samples the dominant hue of a flier so a card can wear its poster's colour
 * instead of the flat grey surface. Results are memoised per URL — the same
 * event appears in several rows and the sample is worth doing once.
 */
const cache = new Map()

/** Average the pixels, weighting saturated ones so a colourful subject wins
 *  over the large flat areas of sky or wall that usually surround it. */
function sample(img) {
  const canvas = document.createElement('canvas')
  canvas.width = 24
  canvas.height = 32
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let x = 0
  let y = 0
  let sat = 0
  let weight = 0

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
    // Near-black and near-white pixels carry no usable hue.
    if (l < 0.08 || l > 0.95) continue
    const w = s * s
    const rad = (h * Math.PI) / 180
    x += Math.cos(rad) * w
    y += Math.sin(rad) * w
    sat += s * w
    weight += w
  }

  if (weight === 0) return null
  const hue = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
  return { h: Math.round(hue), s: Math.round(Math.min(sat / weight, 0.7) * 100) }
}

function rgbToHsl(r, g, b) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l]

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
  else if (max === gn) h = ((bn - rn) / d + 2) * 60
  else h = ((rn - gn) / d + 4) * 60
  return [h, s, l]
}

export default function useImageTint(src) {
  const [tint, setTint] = useState(() => (src ? (cache.get(src) ?? null) : null))

  useEffect(() => {
    if (!src || cache.has(src)) {
      setTint(src ? (cache.get(src) ?? null) : null)
      return
    }

    let live = true
    const img = new Image()
    // Without CORS the canvas is tainted and getImageData throws; hosts that
    // refuse the header simply fail to load here and the card keeps its
    // default surface.
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'

    img.onload = () => {
      let result = null
      try {
        result = sample(img)
      } catch {
        result = null
      }
      cache.set(src, result)
      if (live) setTint(result)
    }
    img.onerror = () => {
      cache.set(src, null)
      if (live) setTint(null)
    }
    img.src = src

    return () => {
      live = false
    }
  }, [src])

  return tint
}
