import { cn } from '../lib/utils.js'

/** Circular category tile (PRD §7). */
export default function CategoryCard({ category, count, isActive, onSelect, diameter = 'w-24 sm:w-28 md:w-32' }) {
  const isSale = category.name === 'Sale'

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      aria-pressed={isActive}
      className={cn(
        'group flex shrink-0 snap-start flex-col items-center gap-3 text-center',
        'transition-opacity duration-200 hover:opacity-100',
        !isActive && 'opacity-70 hover:opacity-100',
      )}
    >
      <span
        className={cn(
          'relative block overflow-hidden rounded-full ring-1 transition-all duration-300 ease-soft',
          diameter,
          isActive ? 'ring-ink' : 'ring-line group-hover:ring-ink',
          isSale ? 'bg-ink' : 'bg-off',
        )}
      >
        <img
          src={category.image}
          alt={category.alt}
          width="160"
          height="160"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-soft group-hover:scale-110"
        />
      </span>
      <span className="leading-none">
        <span className="block text-[11px] font-medium uppercase tracking-label text-ink">
          {category.name}
        </span>
        {typeof count === 'number' && (
          <span className="mt-1.5 block text-[10px] tabular-nums text-ash">
            {count} {count === 1 ? 'piece' : 'pieces'}
          </span>
        )}
      </span>
    </button>
  )
}
