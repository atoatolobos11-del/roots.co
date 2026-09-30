import { useRef } from 'react'
import { X, ArrowUpRight } from 'lucide-react'
import { useOverlay } from '../hooks/useOverlay.js'
import { useInfo } from '../context/InfoContext.jsx'
import { cn } from '../lib/utils.js'

/**
 * Help / about dialog, opened from the footer, the promo cards and the support
 * widget. Content comes from src/data/info.js by topic id.
 */
export default function InfoModal() {
  const panelRef = useRef(null)
  const { topic, isOpen, closeInfo } = useInfo()

  useOverlay(isOpen, panelRef, closeInfo)

  return (
    <div
      className={cn(
        'fixed inset-0 z-[72] flex items-end justify-center sm:items-center sm:p-6',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeInfo}
        className={cn(
          'absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ease-soft',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-title"
        className={cn(
          'on-dark relative flex max-h-[85svh] w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl',
          'transition-transform duration-300 ease-soft sm:rounded-2xl max-sm:rounded-t-2xl',
          isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-[0.98] opacity-0',
        )}
      >
        {topic && (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <h2 id="info-title" className="text-[15px] font-semibold uppercase tracking-tight">
                  {topic.title}
                </h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ash">{topic.intro}</p>
              </div>
              <button
                type="button"
                onClick={closeInfo}
                aria-label={`Close ${topic.title}`}
                className="-mr-2 -mt-1 shrink-0 rounded-full p-2 text-ash transition-colors duration-200 hover:bg-off hover:text-ink"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
              <dl>
                {topic.entries.map((entry) => (
                  <div key={entry.q} className="border-b border-line py-3.5 last:border-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wideish text-ink">
                      {entry.q}
                    </dt>
                    <dd className="mt-1.5 text-[12px] leading-relaxed text-ash">
                      {entry.a.includes('@') ? (
                        <a
                          href={`mailto:${entry.a}`}
                          className="inline-flex items-center gap-1 text-ink underline underline-offset-4 transition-colors duration-200 hover:text-accent"
                        >
                          {entry.a}
                          <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
                        </a>
                      ) : (
                        entry.a
                      )}
                      {entry.q === 'Phone' && (
                        <a
                          href="tel:+15550184400"
                          className="ml-2 text-[11px] underline underline-offset-4 transition-colors duration-200 hover:text-accent"
                        >
                          Call us
                        </a>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
              <p className="text-[10px] leading-relaxed text-ash">
                Portfolio project — no orders are placed.
              </p>
              <button type="button" onClick={closeInfo} className="btn-dark shrink-0 px-5 py-2.5">
                Close
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
