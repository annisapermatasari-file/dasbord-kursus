import Link from 'next/link'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import PricingCards from './PricingCards'
import { PRICING_PLANS } from '@/lib/constants/pricing'

const T = {
  en: {
    badge: 'SOCIAL MEDIA ANALYTICS PLATFORM',
    title: 'Manage social media,',
    titleAccent: 'smarter.',
    subtitle:
      'One dashboard to monitor performance, understand your audience, and find growth opportunities — across every platform.',
    ctaPrimary: 'Get Started Free',
    ctaSecondary: 'View Pricing',
    stats: [
      ['10+', 'Platforms'],
      ['24/7', 'Monitoring'],
      ['AI', 'Insights'],
      ['1', 'Dashboard'],
    ],
    featuresTitle: 'Everything you need in one place',
    featuresSubtitle: 'Built for businesses, creators, and organizations that take their social presence seriously.',
    features: [
      { title: 'Unified Analytics', desc: 'Instagram, Facebook, YouTube, and TikTok performance in a single, clear view.' },
      { title: 'AI-Powered Insights', desc: 'Automatic recommendations to improve reach, engagement, and content strategy.' },
      { title: 'Custom Reports', desc: 'Generate monthly, quarterly, and executive reports in a few clicks.' },
      { title: 'Team Access', desc: 'Role-based access for admins, analysts, executives, and viewers.' },
    ],
    pricingTitle: 'Simple, transparent pricing',
    pricingSubtitle: 'Choose the plan that fits your business. Upgrade anytime.',
    finalTitle: 'Ready to understand your audience better?',
    finalSubtitle: 'Create your free account in under a minute — no credit card required.',
    finalCta: 'Create Free Account',
  },
  id: {
    badge: 'PLATFORM ANALYTICS MEDIA SOSIAL',
    title: 'Kelola media sosial,',
    titleAccent: 'lebih cerdas.',
    subtitle:
      'Satu dashboard untuk memantau performa, memahami audiens, dan menemukan peluang pertumbuhan — di semua platform.',
    ctaPrimary: 'Daftar Gratis',
    ctaSecondary: 'Lihat Harga',
    stats: [
      ['10+', 'Platform'],
      ['24/7', 'Monitoring'],
      ['AI', 'Insights'],
      ['1', 'Dashboard'],
    ],
    featuresTitle: 'Semua yang Anda butuhkan, satu tempat',
    featuresSubtitle: 'Dibangun untuk bisnis, creator, dan organisasi yang serius mengelola media sosial.',
    features: [
      { title: 'Analytics Terpadu', desc: 'Performa Instagram, Facebook, YouTube, dan TikTok dalam satu tampilan yang jelas.' },
      { title: 'AI-Powered Insights', desc: 'Rekomendasi otomatis untuk meningkatkan reach, engagement, dan strategi konten.' },
      { title: 'Laporan Kustom', desc: 'Buat laporan bulanan, kuartalan, dan eksekutif hanya dalam beberapa klik.' },
      { title: 'Akses Tim', desc: 'Akses berbasis peran untuk admin, analyst, executive, dan viewer.' },
    ],
    pricingTitle: 'Harga sederhana dan transparan',
    pricingSubtitle: 'Pilih paket yang sesuai dengan bisnis Anda. Upgrade kapan saja.',
    finalTitle: 'Siap memahami audiens Anda lebih baik?',
    finalSubtitle: 'Buat akun gratis kurang dari satu menit — tanpa kartu kredit.',
    finalCta: 'Buat Akun Gratis',
  },
}

const FEATURE_ICONS = [
  <path key="a" d="M4 19V10M12 19V5M20 19v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="b" d="M12 2l2.4 5.5L20 8l-4.4 4L17 18l-5-3-5 3 1.4-6L4 8l5.6-.5L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="c" d="M6 4h9l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M14 4v5h5 M9 13h6 M9 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="d" d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M23 20v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
]

export default function LandingScreen({ searchParams }) {
  const language = searchParams?.lang === 'id' ? 'id' : 'en'
  const t = T[language]
  const plans = PRICING_PLANS[language]

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader lang={language} basePath="/" variant="full" />

      {/* HERO */}
      <section className="px-6 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t.badge}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {t.title}
            <br />
            <span className="text-blue-600">{t.titleAccent}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            {t.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/register?lang=${language}`}
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="#pricing"
              className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {t.ctaSecondary}
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {t.stats.map(([value, label]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4">
                <div className="text-xl font-bold text-slate-900">{value}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-slate-100 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t.featuresTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{t.featuresSubtitle}</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.map((f, i) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">{FEATURE_ICONS[i]}</svg>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-slate-100 px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t.pricingTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t.pricingSubtitle}</p>
        </div>

        <div className="mt-10">
          <PricingCards plans={plans} language={language} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-slate-100 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t.finalTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t.finalSubtitle}</p>
          <Link
            href={`/register?lang=${language}`}
            className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t.finalCta}
          </Link>
        </div>
      </section>

      <SiteFooter lang={language} />
    </main>
  )
}
