import { useRef } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useOverlay } from '../hooks/useOverlay.js'
import { useCart } from '../context/CartContext.jsx'
import { useCheckout } from '../context/CheckoutContext.jsx'
import { FREE_SHIPPING_THRESHOLD } from '../data/site.js'
import { formatPrice, cn } from '../lib/utils.js'

/** Slide-in shopping bag (PRD §22 FR-04). Leads into the demo checkout. */
export default function CartDrawer() {
  const panelRef = useRef(null)
  const { items, isOpen, closeCart, increase, decrease, removeItem, subtotal, count, clearCart } =
    useCart()
  const checkout = useCheckout()

  useOverlay(isOpen, panelRef, closeCart)

  // Leave the drawer before the checkout dialog opens, so the two overlays are
  // never stacked and Escape always closes the visible one.
  const startCheckout = () => {
    closeCart()
    checkout.openCheckout()
  }

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div
      className={cn('fixed inset-0 z-[70]', isOpen ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={cn(
          'absolute inset-0 bg-ink/40 transition-opacity duration-300 ease-soft',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={cn(
          'on-dark absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white',
          'transition-[transform,visibility] duration-300 ease-soft',
          isOpen ? 'visible translate-x-0' : 'invisible translate-x-full',
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-label">
            Shopping bag {count > 0 && <span className="text-ash">({count})</span>}
          </h2>
          <button
            type="button"
            data-autofocus
            onClick={closeCart}
            className="-mr-2 rounded-full p-2 text-ink transition-colors duration-200 hover:bg-off"
            aria-label="Close shopping bag"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        {items.length > 0 && (
          <div className="border-b border-line px-5 py-3">
            <p className="text-[11px] text-ash">
              {remaining > 0 ? (
                <>
                  You are <span className="font-medium text-ink">{formatPrice(remaining)}</span> away from free
                  shipping
                </>
              ) : (
                <span className="font-medium text-ink">You have unlocked free shipping</span>
              )}
            </p>
            <div className="mt-2 h-px w-full bg-line">
              <div
                className="h-px bg-ink transition-[width] duration-500 ease-soft"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line text-ash">
              <ShoppingBag size={22} strokeWidth={1.25} />
            </span>
            <div>
              <p className="text-sm font-medium">Your bag is empty</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ash">
                New season pieces are waiting in New Arrivals.
              </p>
            </div>
            <button type="button" onClick={closeCart} className="btn-outline mt-2">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex gap-3 py-4">
                  <img
                    src={item.product.image}
                    alt={item.product.alt}
                    width="72"
                    height="90"
                    loading="lazy"
                    className="h-[90px] w-[72px] shrink-0 rounded-lg bg-mist object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                        <p className="mt-0.5 text-xs text-ash">
                          {item.size ? `Size ${item.size}` : item.product.category}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm">{formatPrice(item.lineTotal)}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line">
                        <StepButton
                          label={`Decrease quantity of ${item.product.name}`}
                          onClick={() => decrease(item.productId, item.size)}
                        >
                          <Minus size={13} strokeWidth={1.5} />
                        </StepButton>
                        <span className="w-7 text-center text-xs tabular-nums" aria-live="polite">
                          {item.quantity}
                        </span>
                        <StepButton
                          label={`Increase quantity of ${item.product.name}`}
                          onClick={() => increase(item.productId, item.size)}
                        >
                          <Plus size={13} strokeWidth={1.5} />
                        </StepButton>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size)}
                        className="rounded-full p-1.5 text-ash transition-colors duration-200 hover:bg-off hover:text-ink"
                        aria-label={`Remove ${item.product.name} from bag`}
                      >
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-label text-ash">Subtotal</span>
                <span className="text-lg font-medium tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1.5 text-[11px] text-ash">
                {remaining > 0
                  ? `${formatPrice(remaining)} more for free shipping.`
                  : 'Free shipping unlocked.'}
              </p>
              <button type="button" onClick={startCheckout} className="btn-dark mt-4 w-full">
                Checkout
                <ArrowRight size={15} strokeWidth={1.5} />
              </button>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeCart}
                  className="py-2 text-[11px] font-medium uppercase tracking-label text-ash transition-colors duration-200 hover:text-ink"
                >
                  Continue shopping
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="py-2 text-[11px] font-medium uppercase tracking-label text-ash transition-colors duration-200 hover:text-ink"
                >
                  Clear bag
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

function StepButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center text-ink transition-colors duration-200 hover:bg-off"
    >
      {children}
    </button>
  )
}
