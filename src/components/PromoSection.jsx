import PromoCard from './PromoCard.jsx'
import { promos } from '../data/site.js'
import { useShop } from '../context/ShopContext.jsx'
import { useInfo } from '../context/InfoContext.jsx'

/** Three-up promotional row (PRD §11). Stacks on mobile, 2-up on tablet. */
export default function PromoSection() {
  const { applyFilter } = useShop()
  const { openInfo } = useInfo()

  // A promo CTA either filters the grid or opens a help topic.
  const onNavigate = (event, promo) => {
    if (promo.topic) {
      event.preventDefault()
      openInfo(promo.topic)
      return
    }
    if (promo.filter) {
      event.preventDefault()
      applyFilter(promo.filter)
      document.querySelector('#new-arrivals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
            onNavigate={onNavigate}
            className={index === 2 ? 'sm:col-span-2 lg:col-span-1' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
