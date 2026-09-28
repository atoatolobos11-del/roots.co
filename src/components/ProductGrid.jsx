import { SearchX } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { filters } from '../data/categories.js'

/**
 * Responsive product grid: 2-up on mobile, 3–4 on tablet, 5–6 on desktop
 * (PRD §8, §17). Also renders the empty states required by §35.
 */
export default function ProductGrid() {
  const { filteredProducts, query, activeFilter, clearQuery, applyFilter } = useShop()
  const activeName = filters.find((filter) => filter.id === activeFilter)?.name ?? 'All'

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-dashed border-line px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-ash">
          <SearchX size={20} strokeWidth={1.25} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium">No pieces found</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ash">
            {query
              ? `Nothing matches “${query}” in ${activeName}. Try a different search or category.`
              : `There is nothing in ${activeName} just yet.`}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {query && (
            <button type="button" onClick={clearQuery} className="btn-outline">
              Clear search
            </button>
          )}
          {activeFilter !== 'all' && (
            <button type="button" onClick={() => applyFilter('all')} className="btn-dark">
              Show all pieces
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5 lg:gap-x-5 lg:gap-y-10 2xl:grid-cols-6">
      {filteredProducts.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < 2} />
        </li>
      ))}
    </ul>
  )
}
