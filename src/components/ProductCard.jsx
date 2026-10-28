import { useState } from 'react'
import { Heart, Check, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useInventory } from '../context/InventoryContext.jsx'
import { formatPrice, discountPercent, cn } from '../lib/utils.js'

/**
 * Reusable product card (PRD §9). Hover swaps to the second image on pointer
 * devices; touch devices get an always-available quick-add control so no
 * functionality depends on hover.
 */
export default function ProductCard({ product, priority = false }) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()
  const wishlist = useWishlist()
  const { isOutOfStock } = useInventory()

  const outOfStock = isOutOfStock(product.id)
  const isSaved = wishlist.has(product.id)
  const percentOff = discountPercent(product.price, product.originalPrice)

  const quickAdd = (size) => {
    if (outOfStock) return
    addItem(product, { size })
    setJustAdded(true)
    window.setTimeout(() => {
      setJustAdded(false)
      setIsQuickAddOpen(false)
    }, 1400)
  }

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-mist">
        <img
          src={product.image}
          alt={product.alt}
          width="400"
          height="500"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-soft group-hover:scale-[1.04] group-hover:opacity-0"
        />
        <img
          src={product.hoverImage}
          alt=""
          aria-hidden="true"
          width="400"
          height="500"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-0 transition-all duration-500 ease-soft group-hover:scale-100 group-hover:opacity-100"
        />

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {outOfStock ? (
            <span className="bg-ink px-2 py-1 text-[9px] font-semibold uppercase tracking-label text-white">
              Sold Out
            </span>
          ) : (
            product.badge && (
              <span className="bg-ink px-2 py-1 text-[9px] font-semibold uppercase tracking-label text-white">
                {product.badge}
              </span>
            )
          )}
          {percentOff > 0 && !outOfStock && (
            <span className="bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-label text-ink">
              −{percentOff}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={cn(
            'absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full',
            'bg-white/85 backdrop-blur-sm transition-all duration-200 hover:bg-white',
            'md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100',
            isSaved ? 'md:opacity-100' : '',
          )}
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            className={isSaved ? 'fill-ink text-ink' : 'text-ink'}
            aria-hidden="true"
          />
        </button>

        {/* Quick add — hover revealed on desktop, tap driven on touch */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-2.5 transition-all duration-300 ease-soft',
            'md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100',
            'md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100',
          )}
        >
          {outOfStock ? (
            <p className="flex items-center justify-center bg-off/90 py-2.5 text-[10px] font-semibold uppercase tracking-label text-ash backdrop-blur-sm">
              Sold Out
            </p>
          ) : justAdded ? (
            <p className="flex items-center justify-center gap-2 bg-ink py-2.5 text-[10px] font-semibold uppercase tracking-label text-white">
              <Check size={13} strokeWidth={2} aria-hidden="true" />
              Added
            </p>
          ) : (
            <>
              <ul
                className={cn(
                  'gap-1.5',
                  isQuickAddOpen ? 'flex' : 'hidden',
                  'md:flex',
                )}
              >
                {product.sizes.map((size) => (
                  <li key={size} className="flex-1">
                    <button
                      type="button"
                      onClick={() => quickAdd(size)}
                      className="w-full bg-white/95 py-2 text-[9px] font-semibold uppercase tracking-wideish text-ink transition-colors duration-200 hover:bg-ink hover:text-white"
                    >
                      {size === 'ONE SIZE' ? 'One size' : size}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                aria-expanded={isQuickAddOpen}
                className={cn(
                  'flex w-full items-center justify-center gap-2 bg-ink py-2.5 text-[10px] font-semibold uppercase tracking-label text-white',
                  'transition-colors duration-200 hover:bg-soft',
                  isQuickAddOpen ? 'hidden' : 'flex',
                  'md:hidden',
                )}
              >
                <Plus size={13} strokeWidth={2} aria-hidden="true" />
                Quick add
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-medium leading-snug text-ink sm:text-sm">
            {product.name}
          </h3>
          <p className="mt-1 truncate text-[11px] text-ash sm:text-xs">{product.tagline}</p>
          {product.colors?.length > 0 && (
            <ul className="mt-2 flex items-center gap-1.5" aria-label={`${product.colors.length} colours`}>
              {product.colors.map((color) => (
                <li
                  key={color}
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-line"
                  style={{ backgroundColor: color }}
                />
              ))}
            </ul>
          )}
        </div>
        <p className="shrink-0 text-right text-[13px] tabular-nums text-ink sm:text-sm">
          {formatPrice(product.price)}
          {product.originalPrice && (
            <span className="ml-1.5 text-ash line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </p>
      </div>
    </article>
  )
}
