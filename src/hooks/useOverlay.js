import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Overlays can be stacked (search opened from the menu, cart opened from
 * search). Only the top-most one may react to Escape.
 */
const openOverlays = []

function isTopMost(id) {
  return openOverlays[openOverlays.length - 1] === id
}

/**
 * Shared overlay behaviour for the mobile menu, search overlay and cart drawer:
 * locks background scrolling, traps Tab inside the panel, closes on Escape and
 * returns focus to whatever opened the panel.
 *
 * @param {boolean} open
 * @param {{current: HTMLElement | null}} panelRef
 * @param {() => void} onClose
 * @param {{lockScroll?: boolean}} [options]
 */
export function useOverlay(open, panelRef, onClose, { lockScroll = true } = {}) {
  useEffect(() => {
    if (!open) return undefined

    const id = Symbol('overlay')
    const previouslyFocused = document.activeElement
    const scrollY = window.scrollY
    const { body } = document
    const inline = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }
    openOverlays.push(id)

    if (lockScroll) {
      const gap = window.innerWidth - document.documentElement.clientWidth
      body.style.overflow = 'hidden'
      if (gap > 0) body.style.paddingRight = `${gap}px`
      // position:fixed is what actually stops iOS Safari from scrolling
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.width = '100%'
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (!isTopMost(id)) return
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector('[data-autofocus]')?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      const index = openOverlays.indexOf(id)
      if (index !== -1) openOverlays.splice(index, 1)
      if (lockScroll) {
        body.style.overflow = inline.overflow
        body.style.paddingRight = inline.paddingRight
        body.style.position = inline.position
        body.style.top = inline.top
        body.style.width = inline.width
        window.scrollTo(0, scrollY)
      }
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open, panelRef, onClose, lockScroll])
}
