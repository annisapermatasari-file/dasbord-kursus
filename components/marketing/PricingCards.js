import Link from 'next/link'

/**
 * Grid kartu paket harga — tema terang minimalis, dipakai bersama oleh
 * halaman depan (landing) dan halaman /pricing agar tampilannya identik.
 */
export default function PricingCards({ plans, language }) {
  const isEnglish = language === 'en'

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
      {plans.map((plan) => {
        const href =
          plan.id === 'agency'
            ? '/contact'
            : `/register?plan=${plan.id}&lang=${language}`

        return (
          <div
            key={plan.id}
            className={[
              'relative flex flex-col rounded-2xl border p-7 transition',
              plan.popular
                ? 'border-slate-900 bg-white shadow-xl shadow-slate-900/5'
                : 'border-slate-200 bg-white hover:border-slate-300',
            ].join(' ')}
          >
            {plan.popular && (
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white">
                {isEnglish ? 'MOST POPULAR' : 'PALING POPULER'}
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <h2 className="text-sm font-semibold tracking-wide text-slate-900">{plan.name}</h2>
              <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                {plan.badge}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">{plan.description}</p>

            <div className="mt-6">
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{plan.price}</span>
                <span className="pb-1 text-sm text-slate-400">{plan.period}</span>
              </div>
              <div className="mt-1.5 text-xs text-slate-400">
                {isEnglish ? `Regular price ${plan.normalPrice}` : `Harga normal ${plan.normalPrice}`}
              </div>
            </div>

            <div className="mt-7 flex-1 border-t border-slate-100 pt-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm text-slate-600">
                    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-slate-900">
                      <path d="M4 10.5 8 14l8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={href}
              className={[
                'mt-8 block w-full rounded-lg px-5 py-3 text-center text-sm font-semibold transition',
                plan.popular
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50',
              ].join(' ')}
            >
              {plan.button}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
