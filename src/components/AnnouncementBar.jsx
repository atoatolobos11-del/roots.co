import { useEffect, useState } from 'react'
import { announcementMessages } from '../data/site.js'

const ROTATE_MS = 4200

/**
 * Very thin black announcement bar (PRD §4.1). Messages rotate with a short
 * fade; `aria-live` is deliberately polite-free so screen readers are not
 * interrupted by decorative rotation.
 */
export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (announcementMessages.length < 2) return undefined
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % announcementMessages.length)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative isolate flex h-7 items-center justify-center overflow-hidden bg-ink text-white">
      <p className="sr-only">
        {announcementMessages[0]}
        {announcementMessages.length > 1 ? ' Store announcements: ' : ''}
        {announcementMessages.slice(1).join('. ')}
      </p>
      <div className="relative h-full w-full overflow-hidden" aria-hidden="true">
        {announcementMessages.map((message, messageIndex) => (
          <p
            key={message}
            className={cnMessage(messageIndex === index)}
          >
            {message}
          </p>
        ))}
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left animate-bar-grow bg-white/40"
      />
    </div>
  )
}

function cnMessage(isActive) {
  return [
    'absolute inset-0 flex items-center justify-center px-4 text-center text-[9px] font-medium uppercase tracking-label',
    'transition-all duration-500 ease-soft sm:text-[10px]',
    isActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
  ].join(' ')
}
