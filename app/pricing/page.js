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

  const faq = isEnglish ? [
    ['How long does the promo last?', 'Promo prices apply for your first two months. After that the regular price shown under each plan applies.'],
    ['Which platforms are included?', 'Instagram, Facebook, YouTube, TikTok, and Google Analytics 4 for your website, on every plan.'],
    ['Who can use the Analyst, Executive, and Viewer roles?', 'Team roles are part of the Agency plan. Starter and Business support Admin accounts only.'],
  ] : [
    ['Berapa lama harga promo berlaku?', 'Harga promo berlaku untuk dua bulan pertama. Setelah itu berlaku harga normal yang tertera di bawah setiap paket.'],
    ['Platform apa saja yang termasuk?', 'Instagram, Facebook, YouTube, TikTok, dan Google Analytics 4 untuk website, di semua paket.'],
    ['Siapa yang bisa memakai peran Analyst, Executive, dan Viewer?', 'Peran tim tersedia di paket Agency. Paket Starter dan Business hanya mendukung akun Admin.'],
  ]

  return (
    <main className="min-h-screen bg-paper text-ink">
      <SiteHeader lang={language} basePath="/pricing" variant="full" />

      <section className="px-4 pb-14 pt-14 sm:px-6 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="max-w-[18ch] text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-[52px]">
            {isEnglish ? 'Pick the plan that fits how you report.' : 'Pilih paket yang sesuai cara Anda melapor.'}
          </h1>
          <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-ink-muted">
            {isEnglish
              ? 'Every plan includes all five channels, AI insights, and printable reports. Promo prices apply for your first two months.'
              : 'Semua paket sudah mencakup lima kanal, insight AI, dan laporan siap cetak. Harga promo berlaku untuk dua bulan pertama.'}
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <PricingCards plans={currentPlans} language={language} />
      </section>

      <section className="border-t border-ink/[0.07] bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-tight">{isEnglish ? 'Common questions' : 'Pertanyaan umum'}</h2>
          <dl className="divide-y divide-ink/[0.08]">
            {faq.map(([q, a]) => (
              <div key={q} className="py-5 first:pt-0">
                <dt className="text-[16px] font-bold">{q}</dt>
                <dd className="mt-1.5 max-w-[68ch] text-[15px] leading-relaxed text-ink-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SiteFooter lang={language} />
    </main>
  )
}
