'use client'

import { useState } from 'react'
import Link from 'next/link'

const plans = {
  id: [
    {
      name: 'STARTER',
      pricePromo: 'Rp99.000',
      priceNormal: 'Rp149.000',
      period: '/ bulan',
      description: 'Untuk UMKM dan bisnis kecil.',
      promo: 'PROMO 2 BULAN',
      features: [
        '1 pengguna',
        '2 koneksi media sosial',
        'Analytics dasar',
        'AI Insights terbatas',
        'Laporan bulanan',
      ],
      button: 'Mulai Sekarang',
      highlighted: false,
    },
    {
      name: 'BUSINESS',
      pricePromo: 'Rp299.000',
      priceNormal: 'Rp499.000',
      period: '/ bulan',
      description: 'Untuk bisnis yang sedang berkembang.',
      promo: 'PROMO TERBATAS',
      features: [
        '5–10 koneksi media sosial',
        'Instagram',
        'Facebook',
        'TikTok',
        'YouTube',
        'Analytics lengkap',
        'AI Recommendations',
        'Export laporan',
        'Multiple users',
        'Laporan otomatis',
      ],
      button: 'Mulai Sekarang',
      highlighted: true,
    },
    {
      name: 'AGENCY / ORGANIZATION',
      pricePromo: 'Rp999.000',
      priceNormal: 'Rp2.500.000+',
      period: '/ bulan',
      description: 'Untuk agency dan organisasi.',
      promo: 'CUSTOM PLAN',
      features: [
        'Banyak akun / client',
        'Banyak pengguna',
        'White-label',
        'Laporan otomatis',
        'AI Analytics',
        'Role Management',
        'API & Integrasi',
      ],
      button: 'Hubungi Kami',
      highlighted: false,
    },
  ],

  en: [
    {
      name: 'STARTER',
      pricePromo: 'Rp99,000',
      priceNormal: 'Rp149,000',
      period: '/ month',
      description: 'For small businesses and creators.',
      promo: '2-MONTH PROMO',
      features: [
        '1 user',
        '2 social media connections',
        'Basic analytics',
        'Limited AI insights',
        'Monthly reports',
      ],
      button: 'Get Started',
      highlighted: false,
    },
    {
      name: 'BUSINESS',
      pricePromo: 'Rp299,000',
      priceNormal: 'Rp499,000',
      period: '/ month',
      description: 'For growing businesses.',
      promo: 'LIMITED PROMO',
      features: [
        '5–10 social media connections',
        'Instagram',
        'Facebook',
        'TikTok',
        'YouTube',
        'Advanced analytics',
        'AI recommendations',
        'Report export',
        'Multiple users',
        'Automated reports',
      ],
      button: 'Get Started',
      highlighted: true,
    },
    {
      name: 'AGENCY / ORGANIZATION',
      pricePromo: 'Rp999,000',
      priceNormal: 'Rp2,500,000+',
      period: '/ month',
      description: 'For agencies and organizations.',
      promo: 'CUSTOM PLAN',
      features: [
        'Multiple accounts / clients',
        'Multiple users',
        'White-label',
        'Automated reports',
        'AI analytics',
        'Role management',
        'API & integrations',
      ],
      button: 'Contact Us',
      highlighted: false,
    },
  ],
}

export default function PricingPage() {
  const [language, setLanguage] = useState('id')

  const currentPlans = plans[language]

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold">
              S
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                SocialPulse
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                Analytics Platform
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden text-sm text-slate-300 transition hover:text-white sm:block"
            >
              {language === 'id' ? 'Beranda' : 'Home'}
            </Link>

            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setLanguage('id')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  language === 'id'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-300'
                }`}
              >
                ID
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  language === 'en'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-300'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pb-12 pt-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
            {language === 'id'
              ? 'Harga sederhana untuk bisnis yang berkembang'
              : 'Simple pricing for growing businesses'}
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            {language === 'id'
              ? 'Pilih paket yang tepat untuk bisnis Anda.'
              : 'Choose the right plan for your business.'}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            {language === 'id'
              ? 'Kelola, analisis, dan pahami performa media sosial Anda dalam satu dashboard.'
              : 'Manage, analyze, and understand your social media performance from one dashboard.'}
          </p>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="px-6 pb-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-5 text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-300">
            {language === 'id'
              ? '🎉 Promo Perkenalan'
              : '🎉 Introductory Offer'}
          </div>

          <div className="mt-2 text-lg font-semibold">
            {language === 'id'
              ? 'Harga promo berlaku selama 2 bulan untuk setiap akun.'
              : 'Promotional pricing is available for 2 months per account.'}
          </div>

          <div className="mt-1 text-sm text-slate-400">
            {language === 'id'
              ? 'Setelah masa promo berakhir, harga normal akan berlaku.'
              : 'After the promotional period, regular pricing will apply.'}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {currentPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-7 transition hover:-translate-y-1 ${
                plan.highlighted
                  ? 'border-blue-500 bg-gradient-to-b from-blue-500/15 to-indigo-500/5 shadow-2xl shadow-blue-500/10'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-lg">
                  ⭐ {language === 'id' ? 'Paling Populer' : 'Most Popular'}
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{plan.name}</h2>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  {plan.promo}
                </span>
              </div>

              <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
                {plan.description}
              </p>

              <div className="mt-6">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black sm:text-4xl">
                    {plan.pricePromo}
                  </span>

                  <span className="pb-1 text-sm text-slate-400">
                    {plan.period}
                  </span>
                </div>

                <div className="mt-2 text-sm text-slate-500">
                  {language === 'id' ? 'Harga normal: ' : 'Regular price: '}
                  <span className="line-through">
                    {plan.priceNormal}
                  </span>
                  <span className="ml-2 text-emerald-400">
                    {language === 'id' ? 'Promo' : 'Promo'}
                  </span>
                </div>
              </div>

              <div className="my-7 h-px bg-white/10" />

              <ul className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-xl px-5 py-3.5 text-sm font-bold transition ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
                    : 'bg-white text-slate-900 hover:bg-slate-200'
                }`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Note */}
      <section className="border-t border-white/10 px-6 py-10 text-center">
        <p className="text-sm text-slate-500">
          {language === 'id'
            ? 'Butuh paket khusus atau integrasi enterprise? Hubungi tim kami.'
            : 'Need a custom plan or enterprise integration? Contact our team.'}
        </p>
      </section>
    </main>
  )
}