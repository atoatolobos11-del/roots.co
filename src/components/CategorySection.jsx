import { ArrowRight } from 'lucide-react'
import CategoryCard from './CategoryCard.jsx'
import { categories, categoryCounts } from '../data/categories.js'
import { useShop } from '../context/ShopContext.jsx'

/** Circular category rail (PRD §7). Horizontal scroll on mobile. */
export default function CategorySection() {
  const { activeFilter, applyFilter } = useShop()

  const goToGrid = () =>
    document.querySelector('#new-arrivals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const select = (category) => {
    // Tapping the active category clears the filter, so a tile always toggles.
    applyFilter(activeFilter === category.id ? 'all' : category.id)
    requestAnimationFrame(goToGrid)
  }

  // "View all" resets the filter, otherwise it lands on the grid still filtered
  // by whatever the visitor last tapped.
  const viewAll = (event) => {
    event.preventDefault()
    applyFilter('all')
    requestAnimationFrame(goToGrid)
  }

  return (
    <section id="categories" aria-labelledby="categories-title" className="shell py-12 sm:py-14 lg:py-20">
      <div className="flex items-end justify-between gap-4">
        <h2 id="categories-title" className="text-[22px] font-semibold uppercase tracking-[-0.01em] sm:text-[26px] lg:text-[30px]">
          Shop by category
        </h2>
        <a href="#new-arrivals" onClick={viewAll} className="link-arrow hidden sm:inline-flex">
          View all
          <ArrowRight size={14} strokeWidth={1.5} />
        </a>
      </div>

      <div
        className={[
          '-mx-4 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2',
          'no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0',
        ].join(' ')}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            count={categoryCounts[category.id]}
            isActive={activeFilter === category.id}
            onSelect={select}
          />
        ))}
      </div>

      <a href="#new-arrivals" onClick={viewAll} className="link-arrow mt-6 sm:hidden">
        View all
        <ArrowRight size={14} strokeWidth={1.5} />
      </a>
    </section>
  )
}
