import { createContext, useCallback, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const WishlistContext = createContext(null)
const STORAGE_KEY = 'cstyle.wishlist.v1'

/** Wishlist (heart) state, persisted to localStorage (PRD §22 FR-03). */
export function WishlistProvider({ children }) {
  const [ids, setIds] = useLocalStorage(STORAGE_KEY, [])

  const toggle = useCallback(
    (productId) => {
      setIds((current) =>
        current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
      )
    },
    [setIds],
  )

  const clear = useCallback(() => setIds([]), [setIds])

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      toggle,
      clear,
      has: (productId) => ids.includes(productId),
    }),
    [ids, toggle, clear],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return context
}
