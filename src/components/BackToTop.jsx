import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '../lib/utils.js'

/**
 * Small floating utility control in the lower-right area (PRD §14).
 * Kept deliberately minimal: one scroll-to-top affordance, stacked above the
 * support widget so the two never overlap.
 */
export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll back to top"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      className={cn(
        'fixed right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full',
        'border border-line bg-white text-ink shadow-sm',
        'transition-all duration-300 ease-soft hover:border-ink hover:bg-ink hover:text-white',
        'sm:right-6',
        isVisible ? 'bottom-[76px] visible opacity-100 sm:bottom-[92px]' : 'invisible bottom-[76px] opacity-0',
      )}
    >
      <ArrowUp size={16} strokeWidth={1.5} />
    </button>
  )
}
