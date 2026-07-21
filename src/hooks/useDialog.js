import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const focusable = (root) =>
  Array.from(root?.querySelectorAll(FOCUSABLE) ?? []).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )

/**
 * Wires up the four things every modal owes its users: Escape to dismiss,
 * focus moved in and trapped, the page behind held still, and focus handed
 * back to whatever opened it.
 */
export default function useDialog(onClose) {
  const ref = useRef(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const node = ref.current
    const opener = document.activeElement

    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    const first = node?.querySelector('[data-autofocus]') ?? focusable(node)[0] ?? node
    first?.focus({ preventScroll: true })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close.current()
        return
      }
      if (event.key !== 'Tab' || !node) return

      const items = focusable(node)
      if (!items.length) return
      const edge = event.shiftKey ? items[0] : items[items.length - 1]
      if (document.activeElement === edge || !node.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? items[items.length - 1] : items[0]).focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true })
    }
  }, [])

  return ref
}
