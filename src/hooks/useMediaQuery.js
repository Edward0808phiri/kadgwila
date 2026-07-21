import { useSyncExternalStore } from 'react'

const cache = new Map()

function store(query) {
  if (!cache.has(query)) {
    const mql = window.matchMedia(query)
    cache.set(query, {
      subscribe: (cb) => {
        mql.addEventListener('change', cb)
        return () => mql.removeEventListener('change', cb)
      },
      get: () => mql.matches,
    })
  }
  return cache.get(query)
}

export default function useMediaQuery(query) {
  const { subscribe, get } = store(query)
  return useSyncExternalStore(subscribe, get, () => false)
}

export const useIsDesktop = () => useMediaQuery('(min-width: 900px)')
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
