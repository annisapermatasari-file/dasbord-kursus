import { headers } from 'next/headers'
import { PRICING_PLANS as plans } from '@/lib/constants/pricing'
import SiteHeader from '@/components/marketing/SiteHeader'
import SiteFooter from '@/components/marketing/SiteFooter'
import PricingCards from '@/components/marketing/PricingCards'

export default async function PricingPage({ searchParams }) {
  const params = await searchParams

  const requestHeaders = await headers()

  const country = requestHeaders.get('x-vercel-ip-country')

  /*
   * Language priority:
   *
   * 1. ?lang=en or ?lang=id
   * 2. Indonesia IP -> Indonesian
   * 3. Other countries -> English
   */
  let isEnglish = true

  if (params?.lang === 'id') {
    isEnglish = false
  } else if (params?.lang === 'en') {
    isEnglish = true
  } else if (country === 'ID') {
    isEnglish = false
  }

  const language = isEnglish ? 'en' : 'id'
  const currentPlans = plans[language]

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <SiteHeader lang={language} basePath="/pricing" variant="full" />

      {/* HERO */}
      <section className="px-6 pb-10 pt-20">
        <div className="mx-auto max-w-3xl text-center">

          <div className="mb-5 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-600">
            {isEnglish
              ? 'SIMPLE PRICING FOR GROWING BUSINESSES'
              : 'HARGA SEDERHANA UNTUK BISNIS YANG BERKEMBANG'}
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {isEnglish ? (
              <>Choose the right plan for your business.</>
            ) : (
              <>Pilih paket yang tepat untuk bisnis Anda.</>
            )}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500">
            {isEnglish
              ? 'Manage, analyze, and understand your social media performance in one powerful dashboard.'
              : 'Kelola, analisis, dan pahami performa media sosial Anda dalam satu dashboard.'}
          </p>

        </div>
      </section>

      {/* PROMO */}
      <section className="px-6 pb-14">
        <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
          <div className="text-sm font-semibold text-slate-900">
            {isEnglish
              ? 'Introductory pricing available for the first 2 months.'
              : 'Harga promo berlaku selama 2 bulan untuk setiap akun.'}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {isEnglish
              ? 'After the promotional period, regular pricing will apply.'
              : 'Setelah masa promo berakhir, harga normal akan berlaku.'}
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="px-6 pb-20">
        <PricingCards plans={currentPlans} language={language} />
      </section>

      {/* NOTE */}
      <section className="border-t border-slate-100 px-6 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm leading-6 text-slate-400">
            {isEnglish
              ? 'All plans include access to social media analytics and performance insights from one dashboard.'
              : 'Semua paket dapat digunakan untuk mengelola dan menganalisis performa media sosial dari satu dashboard.'}
          </p>
        </div>
      </section>

      <SiteFooter lang={language} />

    </main>
  )
}