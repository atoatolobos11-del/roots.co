import { ArrowRight } from 'lucide-react'

/** Tall editorial collection card with gradient overlay (PRD §12). */
export default function CollectionCard({ collection, onExplore }) {
  const handleClick = (event) => {
    // Filter the grid to this collection's category, then jump to it. Without
    // this the card scrolled the page but left the previous filter in place.
    event.preventDefault()
    onExplore(collection)
  }

  return (
    <a
      href="#new-arrivals"
      onClick={handleClick}
      aria-label={`Shop the ${collection.name} collection`}
      className="group relative isolate block h-[380px] w-[76vw] shrink-0 snap-start overflow-hidden bg-mist sm:h-[460px] sm:w-[44vw] lg:h-[560px] lg:w-[24vw] xl:w-[300px]"
    >
      <img
        src={collection.image}
        alt={collection.alt}
        width="900"
        height="1200"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/5"
      />
      <span className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <span className="label-dark block">{collection.description}</span>
        <span className="mt-2 block text-[18px] font-semibold uppercase leading-tight tracking-[-0.01em] sm:text-[22px]">
          {collection.name}
        </span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-label">
          Explore
          <ArrowRight
            size={13}
            strokeWidth={1.5}
            className="transition-transform duration-300 ease-soft group-hover:translate-x-1.5"
          />
        </span>
      </span>
    </a>
  )
}
