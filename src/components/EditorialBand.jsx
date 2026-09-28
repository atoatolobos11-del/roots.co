import { ArrowRight } from 'lucide-react'

/**
 * Editorial statement band that sits between the collection gallery and the
 * dark footer — keeps the page rhythm from going dark-on-dark.
 */
export default function EditorialBand() {
  return (
    <section aria-labelledby="editorial-title" className="shell py-12 sm:py-14 lg:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="label">The ROOT.CO standard</p>
          <h2
            id="editorial-title"
            className="mt-4 text-[28px] font-semibold uppercase leading-[1.02] tracking-[-0.02em] sm:text-[36px] lg:text-[44px]"
          >
            Modern by design.
            <br />
            Made to be worn.
          </h2>
          <p className="mt-5 max-w-md text-[13px] leading-relaxed text-ash sm:text-sm">
            We keep the palette narrow on purpose — black, bone, stone, olive — so everything you own
            works with everything else you own. Fewer, better pieces, released weekly.
          </p>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              { value: '48h', label: 'Dispatch time' },
              { value: '30d', label: 'Free returns' },
              { value: '14', label: 'New drops / mo' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[10px] uppercase tracking-label text-ash">{stat.label}</dt>
                <dd className="mt-1.5 text-[22px] font-medium tracking-tight sm:text-[26px]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <a href="#new-arrivals" className="link-arrow mt-8">
            Shop the collection
            <ArrowRight size={14} strokeWidth={1.5} />
          </a>
        </div>

        <div className="grid grid-cols-5 gap-3 sm:gap-4">
          <img
            src="/images/collections/minimal-essentials.svg"
            alt="Model in a crisp cotton shirt from the Minimal Essentials collection"
            width="900"
            height="1200"
            loading="lazy"
            decoding="async"
            className="col-span-3 aspect-[3/4] w-full rounded-xl bg-mist object-cover"
          />
          <img
            src="/images/collections/workwear.svg"
            alt="Model in a long wool coat from the Workwear collection"
            width="900"
            height="1200"
            loading="lazy"
            decoding="async"
            className="col-span-2 mt-8 aspect-[3/4] w-full rounded-xl bg-mist object-cover sm:mt-12"
          />
        </div>
      </div>
    </section>
  )
}
