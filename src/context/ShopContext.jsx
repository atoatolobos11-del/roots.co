import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { products } from '../data/products.js'
import { matchesQuery } from '../lib/utils.js'

const ShopContext = createContext(null)

/**
 * Search + category filter state shared between the header search overlay,
 * the category rail, the filter chips and the nav links, so a filter chosen
 * in one place updates the product grid everywhere (PRD §22 FR-02 / FR-05).
 */
export function ShopProvider({ children }) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = useCallback(() => setIsSearchOpen(true), [])
  const closeSearch = useCallback(() => setIsSearchOpen(false), [])

  const applyFilter = useCallback((filter) => setActiveFilter(filter), [])
  const clearQuery = useCallback(() => setQuery(''), [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeFilter === 'all'
          ? true
          : activeFilter === 'sale'
            ? Boolean(product.originalPrice)
            : product.category.toLowerCase() === activeFilter
      return matchesCategory && matchesQuery(product, query)
    })
  }, [activeFilter, query])

  /** Live suggestions for the search overlay. */
  const suggestions = useMemo(
    () => (query.trim() ? filteredProducts.slice(0, 5) : products.slice(0, 5)),
    [query, filteredProducts],
  )

  const value = useMemo(
    () => ({
      query,
      setQuery,
      clearQuery,
      activeFilter,
      applyFilter,
      filteredProducts,
      suggestions,
      isSearchOpen,
      openSearch,
      closeSearch,
    }),
    [
      query,
      clearQuery,
      activeFilter,
      applyFilter,
      filteredProducts,
      suggestions,
      isSearchOpen,
      openSearch,
      closeSearch,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) throw new Error('useShop must be used inside <ShopProvider>')
  return context
}
