import { ArrowRight, ArrowDown } from 'lucide-react'
import { useShop } from '../context/ShopContext.jsx'

/** Full-bleed fashion hero with left-aligned overlay copy (PRD §5). */
export default function Hero() {
  const { applyFilter } = useShop()

  const shop = (event, filter) => {
    event.preventDefault()
    // Reset the filter so "Shop new in" from anywhere shows the full grid
    // rather than whatever was last selected.
    applyFilter(filter)
    document.querySelector('#new-arrivals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="top" className="relative isolate overflow-hidden bg-off">
      <picture>
        <source media="(max-width: 767px)" srcSet="/images/photos/hero-rail.jpg" />
        <img
          src="/images/photos/hero-rail.jpg"
          alt="Rail of cream and camel wool coats hanging in a ROOTS.CO store"
          width="2000"
          height="1125"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[60%_center] md:object-center"
        />
      </picture>

      {/* Readability scrim: heavier on the left where the copy sits */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-ink/5 md:from-ink/75 md:via-ink/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/35 to-transparent md:hidden"
      />

      <div className="relative shell flex min-h-[78svh] items-center py-16 sm:min-h-[84svh] md:py-24 lg:min-h-[86svh]">
        <div className="max-w-lg animate-fade-up sm:max-w-xl">
          <p className="label-dark">Trendy pieces. Timeless style.</p>
          <h1 className="mt-5 text-[clamp(2.5rem,8.5vw,4.75rem)] font-semibold uppercase leading-[0.92] tracking-[-0.03em] text-white">
            Wear your
            <br />
            confidence
          </h1>
          <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-white/75 sm:text-sm">
            ROOTS.CO has everything you need to look and feel your best — considered neutrals,
            everyday essentials and new-season tailoring.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#new-arrivals" onClick={(event) => shop(event, 'all')} className="btn-light">
              Shop new in
              <ArrowRight size={15} strokeWidth={1.5} />
            </a>
            <a href="#collections" className="btn-ghost-light">
              Explore collections
            </a>
          </div>
        </div>
      </div>

      <a
        href="#benefits"
        aria-label="Scroll to shopping benefits"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-white/70 transition-colors duration-200 hover:text-white sm:flex"
      >
        <span className="label-dark">Scroll</span>
        <ArrowDown size={14} strokeWidth={1.5} className="animate-bounce" />
      </a>
    </section>
  )
}
