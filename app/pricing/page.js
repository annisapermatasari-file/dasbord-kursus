'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const translations = {
  id: {
    language: 'Indonesia',
    otherLanguage: 'English',

    headerBadge: 'HARGA SEDERHANA UNTUK BISNIS YANG BERKEMBANG',
    title: (
      <>
        Pilih paket yang tepat
        <br />
        untuk bisnis Anda.
      </>
    ),
    subtitle:
      'Kelola, analisis, dan pahami performa media sosial Anda dalam satu dashboard.',

    promoTitle: '🎉 PROMO PERKENALAN',
    promoMain: 'Harga promo berlaku selama 2 bulan untuk setiap akun.',
    promoSub: 'Setelah masa promo berakhir, harga normal akan berlaku.',

    popular: '⭐ PALING POPULER',

    featuresTitle: 'Yang Anda dapatkan:',
    normalPrice: 'Harga normal',

    plans: {
      starter: {
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
      },

      business: {
        name: 'BUSINESS',
        price: 'Rp299.000',
        normalPrice: 'Rp499.000',
        period: '/ bulan',
        badge: 'PROMO TERBATAS',
        description: 'Untuk bisnis yang sedang berkembang.',
        features: [
          'Semua fitur Starter',
          'Analytics lebih lengkap',
          'AI-powered business insights',
          'Laporan performa berkala',
          'Multi-platform analytics',
        ],
        button: 'Mulai dengan Business',
      },

      agency: {
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
      },
    },

    footer:
      'Semua paket dapat digunakan untuk mengelola dan menganalisis performa media sosial dari satu dashboard.',
  },

  en: {
    language: 'English',
    otherLanguage: 'Indonesia',

    headerBadge: 'SIMPLE PRICING FOR GROWING BUSINESSES',
    title: (
      <>
        Choose the right plan
        <br />
        for your business.
      </>
    ),
    subtitle:
      'Manage, analyze, and understand your social media performance from one dashboard.',

    promoTitle: '🎉 INTRODUCTORY OFFER',
    promoMain: 'Promotional pricing applies for the first 2 months for every account.',
    promoSub: 'After the promotional period ends, regular pricing will apply.',

    popular: '⭐ MOST POPULAR',

    featuresTitle: 'What you get:',
    normalPrice: 'Regular price',

    plans: {
      starter: {
        name: 'STARTER',
        price: '$10',
        normalPrice: '$15',
        period: '/ month',
        badge: '2-MONTH PROMO',
        description: 'For small businesses and growing entrepreneurs.',
        features: [
          'Social media analytics',
          'AI-powered insights',
          'Performance reports',
          'Multi-platform analytics',
        ],
        button: 'Start with Starter',
      },

      business: {
        name: 'BUSINESS',
        price: '$30',
        normalPrice: '$50',
        period: '/ month',
        badge: 'LIMITED PROMO',
        description: 'For growing businesses.',
        features: [
          'Everything in Starter',
          'Advanced analytics',
          'AI-powered business insights',
          'Regular performance reports',
          'Multi-platform analytics',
        ],
        button: 'Start with Business',
      },

      agency: {
        name: 'AGENCY / ORGANIZATION',
        price: '$100',
        normalPrice: '$250+',
        period: '/ month',
        badge: 'CUSTOM PLAN',
        description: 'For agencies and organizations.',
        features: [
          'Everything in Business',
          'Multi-account management',
          'Advanced analytics',
          'Organization reports',
          'Priority support',
        ],
        button: 'Contact Us',
      },
    },

    footer:
      'All plans allow you to manage and analyze your social media performance from one dashboard.',
  },
}

const planIds = ['starter', 'business', 'agency']

export default function PricingPage() {
  const [language, setLanguage] = useState('id')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('socialpulse-language')

    if (savedLanguage === 'en' || savedLanguage === 'id') {
      setLanguage(savedLanguage)
    }
  }, [])

  function changeLanguage(newLanguage) {
    setLanguage(newLanguage)
    localStorage.setItem('socialpulse-language', newLanguage)
  }

  const t = translations[language]

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER / LANGUAGE SWITCHER */}
      <div className="absolute right-6 top-6 z-20">
        <div className="flex items-center rounded-full border border-slate-700 bg-slate-900/90 p-1 shadow-lg backdrop-blur">

          <button
            type="button"
            onClick={() => changeLanguage('id')}
            className={[
              'rounded-full px-4 py-2 text-xs font-bold transition',
              language === 'id'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white',
            ].join(' ')}
          >
            🇮🇩 ID
          </button>

          <button
            type="button"
            onClick={() => changeLanguage('en')}
            className={[
              'rounded-full px-4 py-2 text-xs font-bold transition',
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white',
            ].join(' ')}
          >
            🇬🇧 EN
          </button>

        </div>
      </div>

      {/* HEADER */}
      <section className="px-6 pb-12 pt-24">

        <div className="mx-auto max-w-5xl text-center">

          <div className="mb-6 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300">
            {t.headerBadge}
          </div>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {t.title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            {t.subtitle}
          </p>

        </div>

      </section>

      {/* PROMO */}
      <section className="px-6 pb-10">

        <div className="mx-auto max-w-6xl rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 px-6 py-7 text-center">

          <div className="text-sm font-bold tracking-wide text-blue-300">
            {t.promoTitle}
          </div>

          <div className="mt-3 text-lg font-bold">
            {t.promoMain}
          </div>

          <div className="mt-2 text-sm text-slate-400">
            {t.promoSub}
          </div>

        </div>

      </section>

      {/* PRICING CARDS */}
      <section className="px-6 pb-20">

        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">

          {planIds.map((planId) => {

            const plan = t.plans[planId]

            const href =
              planId === 'agency'
                ? '/contact'
                : `/register?plan=${planId}`

            return (
              <div
                key={planId}
                className={[
                  'relative flex flex-col rounded-3xl border p-7',
                  planId === 'business'
                    ? 'border-blue-500 bg-gradient-to-b from-blue-950/80 to-slate-950 shadow-2xl shadow-blue-500/10'
                    : 'border-slate-800 bg-slate-900/60',
                ].join(' ')}
              >

                {/* POPULAR */}
                {planId === 'business' && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg">
                    {t.popular}
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
                    {t.normalPrice} {plan.normalPrice}
                  </div>

                </div>

                {/* FEATURES */}
                <div className="mt-8 flex-1">

                  <div className="mb-4 text-sm font-semibold text-slate-300">
                    {t.featuresTitle}
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
                <Link
                  href={href}
                  className={[
                    'mt-10 block w-full rounded-xl px-5 py-4 text-center text-sm font-bold transition',
                    planId === 'business'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
                      : 'border border-slate-700 bg-white text-slate-950 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {plan.button}
                </Link>

              </div>
            )
          })}

        </div>

      </section>

      {/* FOOTER NOTE */}
      <section className="border-t border-slate-800 px-6 py-10">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm leading-6 text-slate-500">
            {t.footer}
          </p>

        </div>

      </section>

    </main>
  )
}