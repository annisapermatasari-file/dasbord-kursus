import Link from 'next/link'

/**
 * Kartu paket harga — dipakai halaman depan dan /pricing.
 * Paket populer tampil terbalik (latar navy) agar langsung terlihat.
 */
export default function PricingCards({ plans, language }) {
  const isEnglish = language === 'en'

  return (
    <div className="mx-auto grid max-w-6xl items-stretch gap-5 lg:grid-cols-3">
      {plans.map((plan) => {
        const href = `/register?plan=${plan.id}&lang=${language}`
        const dark = !!plan.popular

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl p-7 ${dark ? 'bg-ink text-white lg:-my-3 lg:py-10' : 'border border-ink/[0.08] bg-white text-ink'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px] font-extrabold tracking-tight">{plan.name}</h3>
              <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${dark ? 'bg-marigold text-ink' : 'bg-growth-soft text-growth'}`}>
                {plan.badge}
              </span>
            </div>

            <p className={`mt-2 text-[14px] leading-relaxed ${dark ? 'text-white/65' : 'text-ink-muted'}`}>{plan.description}</p>

            <div className="mt-7">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[38px] font-extrabold leading-none tracking-tight tabular">{plan.price}</span>
                <span className={`text-[14px] ${dark ? 'text-white/55' : 'text-ink-muted'}`}>{plan.period}</span>
              </div>
              <div className={`mt-2 text-[13px] ${dark ? 'text-white/50' : 'text-ink-muted'}`}>
                <span className="line-through">{plan.normalPrice}</span>{' '}
                {isEnglish ? 'after the promo' : 'setelah promo'}
              </div>
            </div>

            <ul className={`mt-7 flex-1 space-y-3 border-t pt-6 ${dark ? 'border-white/15' : 'border-ink/[0.07]'}`}>
              {plan.features.map((feature) => (
                <li key={feature} className={`flex gap-2.5 text-[14px] ${dark ? 'text-white/85' : 'text-ink-soft'}`}>
                  <svg viewBox="0 0 20 20" fill="none" className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-marigold' : 'text-growth'}`} aria-hidden="true">
                    <path d="M4 10.5 8 14l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={href}
              className={`mt-8 block w-full rounded-full px-5 py-3 text-center text-[14px] font-semibold transition-colors ${
                dark ? 'bg-white text-ink hover:bg-white/90' : 'border border-ink/15 text-ink hover:bg-ink hover:text-white'
              }`}
            >
              {plan.button}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
