import { ArrowRight } from 'lucide-react'
import ProductFilter from './ProductFilter.jsx'
import ProductGrid from './ProductGrid.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { filters } from '../data/categories.js'

/** New Arrivals section: heading, filter chips, responsive grid (PRD §8). */
export default function ProductSection() {
  const { activeFilter, filteredProducts, query, openSearch } = useShop()
  const activeName = filters.find((filter) => filter.id === activeFilter)?.name ?? 'All'

  return (
    <section id="new-arrivals" aria-labelledby="new-arrivals-title" className="shell py-12 sm:py-14 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">{filteredProducts.length} pieces</p>
          <h2
            id="new-arrivals-title"
            className="mt-2.5 text-[22px] font-semibold uppercase tracking-[-0.01em] sm:text-[26px] lg:text-[30px]"
          >
            {query ? `Results for “${query}”` : activeName === 'All' ? 'New arrivals' : activeName}
          </h2>
          <p className="mt-2 text-[13px] text-ash sm:text-sm">
            {query
              ? 'Filtered by your search and category.'
              : activeName === 'All'
                ? 'Fresh styles. Just in.'
                : `${activeName} — updated weekly.`}
          </p>
        </div>
        <button type="button" onClick={openSearch} className="link-arrow">
          Search all
          <ArrowRight size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-7 lg:mt-8">
        <ProductFilter />
      </div>

      <div className="mt-7 lg:mt-9">
        <ProductGrid />
      </div>
    </section>
  )
}
