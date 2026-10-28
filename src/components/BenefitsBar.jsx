import { Truck, RotateCcw, Lock, MapPin } from 'lucide-react'
import { benefits } from '../data/site.js'
import { cn } from '../lib/utils.js'

const ICONS = { Truck, RotateCcw, Lock, MapPin }

/**
 * Four-column service strip below the hero (PRD §6).
 * Collapses to a two-column grid on mobile.
 */
export default function BenefitsBar() {
  return (
    <section id="benefits" aria-labelledby="benefits-title" className="border-b border-line bg-white">
      <h2 id="benefits-title" className="sr-only">
        Why shop with ROOTS.CO
      </h2>
      <ul className="shell grid grid-cols-2 border-line md:grid-cols-4">
        {benefits.map((benefit, index) => {
          const Icon = ICONS[benefit.icon]
          return (
            <li
              key={benefit.title}
              className={cn(
                'flex items-start gap-3 border-b border-line py-5 sm:gap-4 sm:px-5 md:border-b-0 md:px-6 md:py-7',
                // vertical rules: 2-up on mobile, 4-up from md
                index % 2 === 0 ? 'border-r' : '',
                index > 0 && 'md:border-l',
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink">
                <Icon size={16} strokeWidth={1.25} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[10px] font-semibold uppercase tracking-label text-ink">
                  {benefit.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ash sm:text-xs">{benefit.text}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
