import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { getProductById } from '../data/products.js'

const CartContext = createContext(null)
const STORAGE_KEY = 'cstyle.cart.v1'

/**
 * Cart state. A line is identified by `productId` + `size` so the same shirt
 * in two sizes stays two lines (PRD §22 FR-04). No payment is processed —
 * checkout is intentionally a dead end for this portfolio build.
 */
export function CartProvider({ children }) {
  const [lines, setLines] = useLocalStorage(STORAGE_KEY, [])
  const [isOpen, setIsOpen] = useState(false)

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback(
    (product, { size = null, quantity = 1 } = {}) => {
      const productId = typeof product === 'object' ? product.id : product
      setLines((current) => {
        const index = current.findIndex(
          (line) => line.productId === productId && line.size === size,
        )
        if (index === -1) return [...current, { productId, size, quantity }]
        const next = [...current]
        next[index] = { ...next[index], quantity: next[index].quantity + quantity }
        return next
      })
      setIsOpen(true)
    },
    [setLines],
  )

  const removeItem = useCallback(
    (productId, size) => {
      setLines((current) => current.filter((line) => !(line.productId === productId && line.size === size)))
    },
    [setLines],
  )

  const setQuantity = useCallback(
    (productId, size, quantity) => {
      setLines((current) =>
        quantity <= 0
          ? current.filter((line) => !(line.productId === productId && line.size === size))
          : current.map((line) =>
              line.productId === productId && line.size === size ? { ...line, quantity } : line,
            ),
      )
    },
    [setLines],
  )

  const increase = useCallback(
    (productId, size) => {
      setLines((current) =>
        current.map((line) =>
          line.productId === productId && line.size === size
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        ),
      )
    },
    [setLines],
  )

  const decrease = useCallback(
    (productId, size) => {
      setLines((current) =>
        current
          .map((line) =>
            line.productId === productId && line.size === size
              ? { ...line, quantity: line.quantity - 1 }
              : line,
          )
          .filter((line) => line.quantity > 0),
      )
    },
    [setLines],
  )

  const clearCart = useCallback(() => setLines([]), [setLines])

  const value = useMemo(() => {
    // Drop lines whose product no longer exists in the catalogue.
    const items = lines
      .map((line) => {
        const product = getProductById(line.productId)
        return product ? { ...line, product, lineTotal: product.price * line.quantity } : null
      })
      .filter(Boolean)

    return {
      items,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      increase,
      decrease,
      clearCart,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    }
  }, [lines, isOpen, openCart, closeCart, addItem, removeItem, setQuantity, increase, decrease, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
