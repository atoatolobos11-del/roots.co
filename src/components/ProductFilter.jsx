import { cn } from '../lib/utils.js'
import { filters, categoryCounts } from '../data/categories.js'
import { useShop } from '../context/ShopContext.jsx'

/** Category filter chips above the product grid (PRD §8, §22 FR-05). */
export default function ProductFilter() {
  const { activeFilter, applyFilter } = useShop()

  return (
    <div
      role="group"
      aria-label="Filter products by category"
      className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => applyFilter(filter.id)}
            aria-pressed={isActive}
            className={cn(
              'shrink-0 snap-start border px-4 py-2 text-[10px] font-medium uppercase tracking-label',
              'transition-colors duration-200 ease-soft',
              isActive
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink hover:border-ink',
            )}
          >
            {filter.name}
            <span className={cn('ml-2 tabular-nums', isActive ? 'text-white/60' : 'text-ash')}>
              {categoryCounts[filter.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
