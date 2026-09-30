import { ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils.js'

/**
 * One promotional block (PRD §11). Three visual variants:
 * `dark` (photographic), `light` (editorial) and `image` (in-store).
 */
export default function PromoCard({ promo, onNavigate, className }) {
  const isDark = promo.variant === 'dark'
  const isImage = promo.variant === 'image'

  return (
    <article
      className={cn(
        'group relative isolate flex flex-col justify-end overflow-hidden',
        'aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[540px]',
        className,
      )}
    >
      <img
        src={promo.image}
        alt={promo.alt}
        width="1200"
        height="900"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
      />

      {/* Legibility scrim — heavy for the photographic cards, light for the editorial one */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0',
          isDark || isImage
            ? 'bg-gradient-to-t from-ink/85 via-ink/45 to-ink/15'
            : 'bg-gradient-to-t from-white/90 via-white/45 to-transparent',
        )}
      />

      <div className={cn('relative p-5 sm:p-7', isDark || isImage ? 'text-white' : 'text-ink')}>
        <p className={cn(isDark || isImage ? 'label-dark' : 'label')}>{promo.kicker}</p>
        <h3 className="mt-2.5 text-[24px] font-semibold uppercase leading-[1.02] tracking-[-0.02em] sm:text-[30px]">
          {promo.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
        <p
          className={cn(
            'mt-3 max-w-xs text-[12px] leading-relaxed sm:text-[13px]',
            isDark || isImage ? 'text-white/75' : 'text-ash',
          )}
        >
          {promo.text}
        </p>
        <a
          href={promo.href ?? '#'}
          onClick={(event) => onNavigate?.(event, promo)}
          className={cn(
            'mt-5 inline-flex items-center gap-1.5 border-b pb-1 text-[10px] font-semibold uppercase tracking-label transition-colors duration-200',
            isDark || isImage
              ? 'border-white/50 text-white hover:border-white'
              : 'border-ink text-ink hover:border-accent hover:text-accent',
          )}
        >
          {promo.cta}
          <ArrowRight size={13} strokeWidth={1.5} className="transition-transform duration-300 ease-soft group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  )
}
