import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import CollectionCard from './CollectionCard.jsx'
import { collections } from '../data/collections.js'
import { useShop } from '../context/ShopContext.jsx'

/** Horizontal collection gallery (PRD §12). */
export default function CollectionSection() {
  const trackRef = useRef(null)
  const [canScroll, setCanScroll] = useState({ left: false, right: true })
  const { applyFilter } = useShop()

  // Selecting a card filters the grid to that collection, then scrolls to it.
  const explore = (collection) => {
    applyFilter(collection.filter)
    document.querySelector('#new-arrivals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const syncScrollState = () => {
    const track = trackRef.current
    if (!track) return
    const { scrollLeft, scrollWidth, clientWidth } = track
    setCanScroll({
      left: scrollLeft > 4,
      right: scrollLeft + clientWidth < scrollWidth - 4,
    })
  }

  const scrollBy = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * (track.clientWidth * 0.7), behavior: 'smooth' })
  }

  useEffect(() => {
    syncScrollState()
  }, [])

  return (
    <section id="collections" aria-labelledby="collections-title" className="py-12 sm:py-14 lg:py-20">
      <div className="shell flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="collections-title"
            className="text-[22px] font-semibold uppercase tracking-[-0.01em] sm:text-[26px] lg:text-[30px]"
          >
            Explore collections
          </h2>
          <p className="mt-2 text-[13px] text-ash sm:text-sm">Handpicked styles for every vibe.</p>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <GalleryButton
            label="Scroll collections left"
            disabled={!canScroll.left}
            onClick={() => scrollBy(-1)}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
          </GalleryButton>
          <GalleryButton
            label="Scroll collections right"
            disabled={!canScroll.right}
            onClick={() => scrollBy(1)}
          >
            <ArrowRight size={16} strokeWidth={1.5} />
          </GalleryButton>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={syncScrollState}
        className="shell mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar sm:gap-4 lg:mt-9"
      >
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} onExplore={explore} />
        ))}
      </div>
    </section>
  )
}

function GalleryButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors duration-200 enabled:hover:border-ink enabled:hover:bg-ink enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  )
}
