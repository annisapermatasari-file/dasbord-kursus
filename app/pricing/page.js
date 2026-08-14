'use client'

const plans = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 'Rp99.000',
    normalPrice: 'Rp149.000',
    period: '/ bulan',
    badge: 'PROMO 2 BULAN',
    description: 'Untuk UMKM dan bisnis kecil.',
    features: [
      'Analytics media sosial',
      'AI-powered insights',
      'Laporan performa',
      'Multi-platform analytics',
    ],
    button: 'Mulai dengan Starter',
    href: '/register?plan=starter',
  },
  {
    id: 'business',
    name: 'BUSINESS',
    price: 'Rp299.000',
    normalPrice: 'Rp499.000',
    period: '/ bulan',
    badge: 'PROMO TERBATAS',
    popular: true,
    description: 'Untuk bisnis yang sedang berkembang.',
    features: [
      'Semua fitur Starter',
      'Analytics lebih lengkap',
      'AI-powered business insights',
      'Laporan performa berkala',
      'Multi-platform analytics',
    ],
    button: 'Mulai dengan Business',
    href: '/register?plan=business',
  },
  {
    id: 'agency',
    name: 'AGENCY / ORGANIZATION',
    price: 'Rp999.000',
    normalPrice: 'Rp2.500.000+',
    period: '/ bulan',
    badge: 'CUSTOM PLAN',
    description: 'Untuk agency dan organisasi.',
    features: [
      'Semua fitur Business',
      'Multi-account management',
      'Advanced analytics',
      'Laporan untuk organisasi',
      'Dukungan prioritas',
    ],
    button: 'Hubungi Kami',
    href: '/contact',
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <section className="px-6 pb-12 pt-20">
        <div className="mx-auto max-w-5xl text-center">

          <div className="mb-6 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300">
            HARGA SEDERHANA UNTUK BISNIS YANG BERKEMBANG
          </div>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Pilih paket yang tepat
            <br />
            untuk bisnis Anda.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Kelola, analisis, dan pahami performa media sosial Anda
            dalam satu dashboard.
          </p>

        </div>
      </section>

      {/* PROMO */}
      <section className="px-6 pb-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 px-6 py-7 text-center">

          <div className="text-sm font-bold tracking-wide text-blue-300">
            🎉 PROMO PERKENALAN
          </div>

          <div className="mt-3 text-lg font-bold">
            Harga promo berlaku selama 2 bulan untuk setiap akun.
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Setelah masa promo berakhir, harga normal akan berlaku.
          </div>

        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">

          {plans.map((plan) => (
            <div
              key={plan.id}
              className={[
                'relative flex flex-col rounded-3xl border p-7',
                plan.popular
                  ? 'border-blue-500 bg-gradient-to-b from-blue-950/80 to-slate-950 shadow-2xl shadow-blue-500/10'
                  : 'border-slate-800 bg-slate-900/60',
              ].join(' ')}
            >

              {/* POPULAR */}
              {plan.popular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg">
                  ⭐ PALING POPULER
                </div>
              )}

              {/* PLAN HEADER */}
              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold">
                    {plan.name}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {plan.description}
                  </p>
                </div>

                <span className="whitespace-nowrap rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400">
                  {plan.badge}
                </span>

              </div>

              {/* PRICE */}
              <div className="mt-8">

                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black">
                    {plan.price}
                  </span>

                  <span className="pb-1 text-sm text-slate-500">
                    {plan.period}
                  </span>
                </div>

                <div className="mt-2 text-sm text-slate-500">
                  Harga normal {plan.normalPrice}
                </div>

              </div>

              {/* FEATURES */}
              <div className="mt-8 flex-1">

                <div className="mb-4 text-sm font-semibold text-slate-300">
                  Yang Anda dapatkan:
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 text-sm text-slate-300"
                    >
                      <span className="text-emerald-400">
                        ✓
                      </span>

                      <span>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

              </div>

              {/* BUTTON */}
              <a
                href={plan.href}
                className={[
                  'mt-10 block w-full rounded-xl px-5 py-4 text-center text-sm font-bold transition',
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
                    : 'border border-slate-700 bg-white text-slate-950 hover:bg-slate-200',
                ].join(' ')}
              >
                {plan.button}
              </a>

            </div>
          ))}

        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="border-t border-slate-800 px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm leading-6 text-slate-500">
            Semua paket dapat digunakan untuk mengelola dan
            menganalisis performa media sosial dari satu dashboard.
          </p>

        </div>
      </section>

    </main>
  )
}