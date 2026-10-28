import { useState } from 'react'
import { Menu, Search, ShoppingBag, User, Heart, Boxes } from 'lucide-react'
import Wordmark from './Wordmark.jsx'
import MobileMenu from './MobileMenu.jsx'
import SearchOverlay from './SearchOverlay.jsx'
import AccountModal from './AccountModal.jsx'
import { navLinks } from '../data/site.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useInventory } from '../context/InventoryContext.jsx'
import { cn } from '../lib/utils.js'

/** Sticky main navigation (PRD §4.2). */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const { count, openCart } = useCart()
  const wishlist = useWishlist()
  const { applyFilter, openSearch, isSearchOpen, activeFilter } = useShop()
  const { user, isAdmin } = useAuth()
  const { openInventory, stats } = useInventory()

  const goTo = (event, link) => {
    event.preventDefault()
    applyFilter(link.filter)
    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="shell">
          <div className="grid h-14 grid-cols-[1fr_auto] items-center gap-4 lg:h-16 lg:grid-cols-3">
            {/* Left — wordmark (+ hamburger on mobile) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="-ml-2 rounded-full p-2 text-ink transition-colors duration-200 hover:bg-off lg:hidden"
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>
              <a
                href="#top"
                onClick={(event) => {
                  event.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="px-1 py-2"
                aria-label="ROOT.CO — back to top"
              >
                <Wordmark />
              </a>
            </div>

            {/* Center — desktop navigation */}
            <nav aria-label="Main" className="hidden lg:flex lg:items-center lg:justify-center lg:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(event) => goTo(event, link)}
                  aria-current={activeFilter === link.filter ? 'true' : undefined}
                  className={cn(
                    'relative py-2 text-[11px] font-medium uppercase tracking-label transition-colors duration-200',
                    link.accent ? 'text-accent' : 'text-ink hover:text-ash',
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ink transition-transform duration-300 ease-soft',
                      activeFilter === link.filter ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </a>
              ))}
            </nav>

            {/* Right — utilities */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5">
              {/* Single Admin-only inventory button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={openInventory}
                  aria-label="Open Inventory Management"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-2.5 sm:px-3 py-1.5 text-[10px] font-semibold uppercase tracking-label text-white shadow-sm transition-all duration-200 hover:bg-neutral-800"
                >
                  <Boxes size={14} strokeWidth={1.75} />
                  <span>Inventory</span>
                  {stats.lowStockCount + stats.outOfStockCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                      {stats.lowStockCount + stats.outOfStockCount}
                    </span>
                  )}
                </button>
              )}

              <IconButton label="Search products" onClick={openSearch} className="hidden sm:inline-flex">
                <Search size={18} strokeWidth={1.5} />
              </IconButton>
              <IconButton
                label={user ? `Account, signed in as ${user.email}` : 'Sign in or create an account'}
                className="hidden md:inline-flex"
                onClick={() => setIsAccountOpen(true)}
              >
                <User size={18} strokeWidth={1.5} className={cn(user && 'fill-ink')} />
                {user && <Count>•</Count>}
              </IconButton>
              <IconButton
                label={`Wishlist, ${wishlist.count} ${wishlist.count === 1 ? 'item' : 'items'}`}
                className="hidden sm:inline-flex"
                onClick={() => {
                  document.querySelector('#new-arrivals')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Heart size={18} strokeWidth={1.5} className={cn(wishlist.count > 0 && 'fill-ink')} />
                {wishlist.count > 0 && <Count>{wishlist.count}</Count>}
              </IconButton>
              <IconButton label={`Open shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`} onClick={openCart}>
                <ShoppingBag size={18} strokeWidth={1.5} />
                {count > 0 && <Count>{count}</Count>}
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={goTo}
        onOpenAccount={() => {
          setIsMenuOpen(false)
          setIsAccountOpen(true)
        }}
        onOpenInventory={() => {
          setIsMenuOpen(false)
          openInventory()
        }}
      />
      <SearchOverlay open={isSearchOpen} />
      <AccountModal
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenInventory={() => {
          setIsAccountOpen(false)
          openInventory()
        }}
      />
    </>
  )
}

function Count({ children }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-semibold leading-none text-white"
    >
      {children}
    </span>
  )
}

/** Icon-only control. Always a button — every icon here opens a panel. */
function IconButton({ label, children, className, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative -mr-1 rounded-full p-2 text-ink transition-colors duration-200 hover:bg-off',
        className,
      )}
      aria-label={label}
    >
      {children}
    </button>
  )
}
