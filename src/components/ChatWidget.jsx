import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Sparkles, ArrowRight } from 'lucide-react'
import { chatReplies, supportHours } from '../data/site.js'
import { useInfo } from '../context/InfoContext.jsx'
import { cn } from '../lib/utils.js'

const QUICK_REPLIES = Object.keys(chatReplies)

/**
 * Floating customer support widget (PRD §13). Frontend-only scripted
 * interaction — no backend — positioned bottom-right so it never covers
 * primary content.
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 'greeting', from: 'agent', text: 'Hi! How can we help?' },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const timerRef = useRef(null)
  const logRef = useRef(null)
  const { openInfo } = useInfo()

  useEffect(() => () => clearTimeout(timerRef.current), [])

  useEffect(() => {
    if (!isOpen) return
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, isTyping, isOpen])

  const reply = (label) => {
    clearTimeout(timerRef.current)
    setIsTyping(true)
    timerRef.current = setTimeout(() => {
      setIsTyping(false)
      setMessages((current) => [
        ...current,
        { id: `user-${current.length}`, from: 'user', text: label },
        { id: `agent-${current.length}`, from: 'agent', text: chatReplies[label] },
      ])
    }, 620)
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Chat card */}
      <div
        role="dialog"
        aria-label="ROOTS.CO support chat"
        aria-hidden={!isOpen}
        className={cn(
          'pointer-events-auto w-[min(19rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden border border-line bg-white shadow-lg',
          'transition-[transform,visibility,opacity] duration-300 ease-soft',
          isOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
        )}
      >
        <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <Sparkles size={14} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-label">
                ROOTS.CO Support
              </span>
              <span className="mt-0.5 block text-[10px] text-white/60">{supportHours}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Minimise support chat"
            className="-mr-1.5 rounded-full p-1.5 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        <div ref={logRef} className="max-h-64 space-y-2.5 overflow-y-auto bg-off px-4 py-4">
          {messages.map((message) => (
            <p
              key={message.id}
              className={cn(
                'max-w-[85%] px-3 py-2 text-[12px] leading-relaxed',
                message.from === 'agent'
                  ? 'border border-line bg-white text-ink'
                  : 'ml-auto bg-ink text-white',
              )}
            >
              {message.text}
            </p>
          ))}
          {isTyping && (
            <p className="flex w-14 items-center justify-center gap-1 border border-line bg-white px-3 py-2.5">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1 w-1 animate-bounce rounded-full bg-ash"
                  style={{ animationDelay: `${dot * 120}ms`, animationDuration: '900ms' }}
                />
              ))}
              <span className="sr-only">Support is typing</span>
            </p>
          )}
        </div>

        <div className="border-t border-line bg-white px-3 py-3">
          <ul className="flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => reply(label)}
                  disabled={isTyping}
                  className="rounded-full border border-line px-3 py-1.5 text-[10px] font-medium uppercase tracking-wideish text-ink transition-colors duration-200 enabled:hover:border-ink enabled:hover:bg-ink enabled:hover:text-white disabled:opacity-50"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                openInfo('contact')
              }}
              className="flex w-full items-center justify-between gap-2 border border-line px-3 py-2 text-[10px] font-semibold uppercase tracking-label text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white"
            >
              Contact &amp; store details
              <ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <a
              href="mailto:support@root.co"
              className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-label text-ash transition-colors duration-200 hover:text-ink"
            >
              <Send size={12} strokeWidth={1.5} aria-hidden="true" />
              support@root.co
            </a>
          </div>
        </div>
      </div>

      {/* Launcher */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
        className={cn(
          'pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white',
          'shadow-lg transition-transform duration-300 ease-soft hover:bg-soft active:scale-95',
          'sm:h-14 sm:w-14',
        )}
      >
        {!isOpen && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-ink opacity-20 motion-reduce:hidden"
          />
        )}
        {isOpen ? <X size={20} strokeWidth={1.5} /> : <MessageCircle size={20} strokeWidth={1.5} />}
      </button>
    </div>
  )
}
