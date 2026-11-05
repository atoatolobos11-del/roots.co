import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { products } from '../data/products.js'
import { useInventory } from './InventoryContext.jsx'
import { matchesQuery } from '../lib/utils.js'

const ShopContext = createContext(null)

export function getShopProducts(catalog, inventory) {
  const productsById = new Map(catalog.map((product) => [product.id, product]))

  return inventory.map((item) => {
    const catalogProduct = productsById.get(item.id)
    const name = item.name || catalogProduct?.name || 'New Product'
    const image = catalogProduct?.image || item.image || '/images/products/2.jpg'

    return {
      ...catalogProduct,
      ...item,
      price: item.price ?? catalogProduct?.price ?? 0,
      slug: catalogProduct?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name,
      tagline: catalogProduct?.tagline || '',
      image,
      hoverImage: catalogProduct?.hoverImage || image,
      alt: catalogProduct?.alt || name,
      colors: catalogProduct?.colors || [],
      sizes: item.sizes?.length ? item.sizes : catalogProduct?.sizes?.length ? catalogProduct.sizes : ['ONE SIZE'],
      tags: catalogProduct?.tags || [],
    }
  })
}

/**
 * Search + category filter state shared between the header search overlay,
 * the category rail, the filter chips and the nav links, so a filter chosen
 * in one place updates the product grid everywhere (PRD §22 FR-02 / FR-05).
 */
export function ShopProvider({ children }) {
  const { inventory } = useInventory()
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const shopProducts = useMemo(() => getShopProducts(products, inventory), [inventory])

  const openSearch = useCallback(() => setIsSearchOpen(true), [])
  const closeSearch = useCallback(() => setIsSearchOpen(false), [])

  const applyFilter = useCallback((filter) => setActiveFilter(filter), [])
  const clearQuery = useCallback(() => setQuery(''), [])

  const filteredProducts = useMemo(() => {
    return shopProducts.filter((product) => {
      const matchesCategory =
        activeFilter === 'all'
          ? true
          : activeFilter === 'sale'
            ? Boolean(product.originalPrice)
            : product.category.toLowerCase() === activeFilter
      return matchesCategory && matchesQuery(product, query)
    })
  }, [activeFilter, query, shopProducts])

  /** Live suggestions for the search overlay. */
  const suggestions = useMemo(
    () => (query.trim() ? filteredProducts.slice(0, 5) : shopProducts.slice(0, 5)),
    [query, filteredProducts, shopProducts],
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
