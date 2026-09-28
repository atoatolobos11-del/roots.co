import { useEffect, useRef, useState } from 'react'
import { Search, X, ArrowRight, Heart } from 'lucide-react'
import { filters } from '../data/categories.js'
import { useOverlay } from '../hooks/useOverlay.js'
import { useShop } from '../context/ShopContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { formatPrice, cn } from '../lib/utils.js'

const POPULAR = ['dress', 'denim', 'sneakers', 'bag', 'oversized']

/**
 * Full-width search overlay with live product + category results
 * (PRD §22 FR-02). Typing filters the grid behind it; picking a result jumps
 * to the product grid with that item's category applied.
 */
export default function SearchOverlay({ open = false }) {
  const panelRef = useRef(null)
  const inputRef = useRef(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const {
    query,
    setQuery,
    closeSearch,
    suggestions,
    applyFilter,
    activeFilter,
    filteredProducts,
    isSearchOpen,
  } = useShop()
  const { addItem } = useCart()
  const wishlist = useWishlist()

  useOverlay(open, panelRef, closeSearch)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(timer)
    }
    setQuery('')
    return undefined
  }, [open, setQuery])

  // Scroll only after the overlay has unmounted its scroll lock, otherwise the
  // fixed body swallows the scroll.
  useEffect(() => {
    if (!shouldScroll || isSearchOpen) return
    setShouldScroll(false)
    document.querySelector('#new-arrivals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [shouldScroll, isSearchOpen])

  const goToGrid = (filter) => {
    applyFilter(filter)
    closeSearch()
    setShouldScroll(true)
  }

  const resultCount = filteredProducts.length
  const hasQuery = query.trim().length > 0

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60]',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <div
        onClick={closeSearch}
        className={cn(
          'absolute inset-0 bg-ink/40 transition-opacity duration-300 ease-soft',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className={cn(
          'absolute inset-x-0 top-0 max-h-[92vh] overflow-y-auto border-b border-line bg-white',
          'transition-[transform,visibility] duration-300 ease-soft',
          open ? 'visible translate-y-0' : 'invisible -translate-y-6',
        )}
      >
        <div className="shell py-6 sm:py-8">
          <div className="flex items-center gap-3 border-b border-ink pb-3">
            <Search size={20} strokeWidth={1.5} className="shrink-0 text-ash" aria-hidden="true" />
            <input
              ref={inputRef}
              data-autofocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') goToGrid(activeFilter)
              }}
              placeholder="Search for dresses, denim, sneakers…"
              aria-label="Search products"
              autoComplete="off"
              className="w-full bg-transparent text-lg font-medium tracking-tight outline-none placeholder:text-ash/70 sm:text-2xl"
            />
            <button
              type="button"
              onClick={closeSearch}
              className="-mr-2 rounded-full p-2 text-ink transition-colors duration-200 hover:bg-off"
              aria-label="Close search"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {!hasQuery && (
            <div className="mt-6">
              <p className="label">Popular searches</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-line px-3.5 py-1.5 text-xs text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="label">
                {hasQuery ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'}` : 'Trending now'}
              </p>
              <ul className="mt-3 divide-y divide-line">
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <div className="flex items-center gap-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => goToGrid(product.category.toLowerCase())}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <img
                          src={product.image}
                          alt=""
                          width="56"
                          height="70"
                          loading="lazy"
                          className="h-[70px] w-14 shrink-0 rounded-md bg-mist object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
                          <span className="mt-0.5 block text-xs text-ash">{product.category}</span>
                        </span>
                        <span className="ml-auto shrink-0 text-sm text-ink">{formatPrice(product.price)}</span>
                      </button>
                      <div className="flex shrink-0 items-center">
                        <button
                          type="button"
                          onClick={() => addItem(product, { size: product.sizes[0] })}
                          className="rounded-full border border-line p-2 text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white"
                          aria-label={`Add ${product.name} to bag`}
                        >
                          <ArrowRight size={14} strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => wishlist.toggle(product.id)}
                          aria-label={`Save ${product.name} to wishlist`}
                          aria-pressed={wishlist.has(product.id)}
                          className="ml-1 rounded-full border border-line p-2 text-ink transition-colors duration-200 hover:border-ink"
                        >
                          <Heart size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
                {hasQuery && suggestions.length === 0 && (
                  <li className="py-6 text-sm text-ash">
                    No pieces match “{query}”. Try “dress”, “denim” or “bag”.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="label">Browse categories</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <li key={filter.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        goToGrid(filter.id)
                      }}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-200',
                        activeFilter === filter.id && !hasQuery
                          ? 'border-ink bg-ink text-white'
                          : 'border-line text-ink hover:border-ink',
                      )}
                    >
                      {filter.name}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-ash">
                Search matches product names, categories and tags — for example “dress” or “leather shoes”.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
