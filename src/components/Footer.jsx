import { useState } from 'react'
import { ArrowRight, Check, CreditCard, Globe } from 'lucide-react'
import Wordmark from './Wordmark.jsx'
import { brandValues, footerColumns, announcementMessages, FREE_SHIPPING_THRESHOLD } from '../data/site.js'

/**
 * Dark brand-values band (PRD §15) + full site footer (PRD §16).
 * Both live in one dark block so the page ends on a single heavy surface.
 */
export default function Footer() {
  return (
    <footer className="on-dark bg-ink text-white">
      {/* Brand values */}
      <section id="values" aria-labelledby="values-title" className="border-b border-white/10">
        <div className="shell py-12 sm:py-14 lg:py-20">
          <h2 id="values-title" className="sr-only">
            Our brand values
          </h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4 lg:gap-x-10">
            {brandValues.map((value) => {
              const Icon = value.icon
              return (
                <li key={value.title}>
                  <Icon size={20} strokeWidth={1.25} className="text-white" aria-hidden="true" />
                  <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-label">
                    {value.title}
                  </h3>
                  <p className="mt-2 max-w-[22ch] text-[12px] leading-relaxed text-white/60">
                    {value.text}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Footer navigation */}
      <h2 className="sr-only">Site information</h2>
      <div className="shell grid gap-10 py-12 sm:py-14 lg:grid-cols-[1.4fr_repeat(3,minmax(0,0.6fr))_1.4fr] lg:gap-8">
        <div>
          <Wordmark className="text-white" />
          <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-white/60">
            Modern fashion and everyday essentials, designed to last. New drops every Thursday.
          </p>
          <p className="mt-5 text-[11px] text-white/40">
            Free shipping over ${FREE_SHIPPING_THRESHOLD} · 30-day returns
          </p>
        </div>

        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
              {column.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[12px] text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <Newsletter />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-5 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ROOT.CO. Portfolio project — no real orders are processed.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Globe size={13} strokeWidth={1.5} aria-hidden="true" />
              EUR / USD
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard size={13} strokeWidth={1.5} aria-hidden="true" />
              Visa · Mastercard · Amex · PayPal
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const onSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setIsSubmitted(true)
    setEmail('')
  }

  return (
    <div id="newsletter">
      <h3 className="text-[11px] font-semibold uppercase tracking-label">Join our newsletter</h3>
      <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-white/60">
        {announcementMessages[1]}
      </p>

      {isSubmitted ? (
        <p className="mt-5 flex items-center gap-2 border border-white/20 px-4 py-3 text-[12px] text-white">
          <Check size={15} strokeWidth={1.5} aria-hidden="true" />
          Thanks — you are on the list.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5" noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            Your email address
          </label>
          <div className="flex border border-white/25 focus-within:border-white">
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[12px] text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-white px-4 text-[10px] font-semibold uppercase tracking-label text-ink transition-colors duration-200 hover:bg-off"
            >
              Subscribe
              <ArrowRight size={13} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2.5 text-[10px] leading-relaxed text-white/40">
            Demo form — nothing is stored or sent anywhere.
          </p>
        </form>
      )}
    </div>
  )
}
