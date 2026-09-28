import PromoCard from './PromoCard.jsx'
import { promos } from '../data/site.js'

/** Three-up promotional row (PRD §11). Stacks on mobile, 2-up on tablet. */
export default function PromoSection() {
  return (
    <section aria-labelledby="promos-title" className="shell py-4 sm:py-6 lg:py-8">
      <h2 id="promos-title" className="sr-only">
        Featured promotions
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {promos.map((promo, index) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            className={index === 2 ? 'sm:col-span-2 lg:col-span-1' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
