const UNSPLASH = 'https://images.unsplash.com'

/**
 * Events carry an Unsplash photo id so we can request an exact crop per slot;
 * organiser-created events carry a plain URL instead and are used as-is.
 */
export function eventImage(event, w, h) {
  if (event?.image) return event.image
  if (!event?.photo) return ''
  return `${UNSPLASH}/${event.photo}?auto=format&fit=crop&w=${w}&h=${h}&q=75`
}

export function eventSrcSet(event, w, h) {
  if (event?.image || !event?.photo) return undefined
  return `${eventImage(event, w, h)} 1x, ${eventImage(event, w * 2, h * 2)} 2x`
}

export const PLACEHOLDER_PHOTO = 'photo-1459749411175-04bf5292ceea'
