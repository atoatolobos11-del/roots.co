import { useRef } from 'react'
import { X, Search, Heart, User, ShoppingBag, ArrowUpRight, Boxes } from 'lucide-react'
import Wordmark from './Wordmark.jsx'
import { navLinks } from '../data/site.js'
import { useOverlay } from '../hooks/useOverlay.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useInventory } from '../context/InventoryContext.jsx'
import { cn } from '../lib/utils.js'

const quickLinks = [
  { label: 'Shop by category', href: '#categories' },
  { label: 'New arrivals', href: '#new-arrivals' },
  { label: 'Explore collections', href: '#collections' },
  { label: 'Brand values', href: '#values' },
]

/** Slide-in navigation drawer for small screens (PRD §4.2). */
export default function MobileMenu({ open, onClose, onNavigate, onOpenAccount, onOpenInventory }) {
  const panelRef = useRef(null)
  const { openCart, count } = useCart()
  const wishlist = useWishlist()
  const { openSearch, activeFilter } = useShop()
  const { user, isAdmin } = useAuth()
  const { stats } = useInventory()

  useOverlay(open, panelRef, onClose)

  return (
    <div className={cn('lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ease-soft',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={cn(
          'on-dark fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-white shadow-xl',
          'transition-[transform,visibility] duration-300 ease-soft',
          open ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Wordmark />
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="-mr-2 rounded-full p-2 text-ink transition-colors duration-200 hover:bg-off"
            aria-label="Close navigation menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">


          <ul className="divide-y divide-line">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(event) => {
                    onNavigate(event, link)
                    onClose()
                  }}
                  aria-current={activeFilter === link.filter ? 'true' : undefined}
                  className={cn(
                    'flex items-center justify-between py-3.5 text-[13px] font-medium uppercase tracking-label',
                    'transition-colors duration-200',
                    link.accent ? 'text-accent' : 'text-ink hover:text-ash',
                  )}
                >
                  {link.label}
                  <ArrowUpRight size={16} strokeWidth={1.5} className="text-ash" />
                </a>
              </li>
            ))}
          </ul>

          <ul className="mt-6 space-y-1 border-t border-line pt-6">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => {
                    onNavigate(event, { filter: activeFilter, href: link.href })
                    onClose()
                  }}
                  className="block py-2 text-sm text-ash transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center gap-1">
            <DrawerAction
              onClick={() => {
                onClose()
                openSearch()
              }}
            >
              <Search size={17} strokeWidth={1.5} /> Search
            </DrawerAction>
            <DrawerAction
              onClick={() => {
                onClose()
                openCart()
              }}
            >
              <ShoppingBag size={17} strokeWidth={1.5} /> Bag ({count})
            </DrawerAction>
            <DrawerAction
              onClick={() => {
                onClose()
                document.querySelector('#new-arrivals')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Heart size={17} strokeWidth={1.5} /> Saved ({wishlist.count})
            </DrawerAction>
            <DrawerAction onClick={onOpenAccount}>
              <User size={17} strokeWidth={1.5} className={cn(user && 'fill-ink')} />
              {user ? (isAdmin ? 'Admin' : 'Account') : 'Sign in'}
            </DrawerAction>
          </div>
        </div>
      </div>
    </div>
  )
}

function DrawerAction({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-lg py-2 text-[10px] font-medium uppercase tracking-wideish text-ink transition-colors duration-200 hover:bg-off"
    >
      {children}
    </button>
  )
}
