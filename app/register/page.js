'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const plans = {
  starter: {
    name: 'STARTER',
    price: '$10',
    normalPrice: '$15',
    promo: true,
    description: {
      en: 'For small businesses and startups.',
      id: 'Untuk UMKM dan bisnis kecil.',
    },
  },
  business: {
    name: 'BUSINESS',
    price: '$30',
    normalPrice: '$50',
    promo: false,
    description: {
      en: 'For growing businesses.',
      id: 'Untuk bisnis yang sedang berkembang.',
    },
  },
  agency: {
    name: 'AGENCY / ORGANIZATION',
    price: '$100+',
    normalPrice: 'Custom',
    promo: false,
    description: {
      en: 'For agencies and organizations.',
      id: 'Untuk agency dan organisasi.',
    },
  },
}

export default function RegisterPage() {
  const router = useRouter()

  const [language, setLanguage] = useState('en')
  const [selectedPlan, setSelectedPlan] = useState('starter')

  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Read plan from URL without useSearchParams()
  // This avoids the Vercel Suspense/build error.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const planFromUrl = params.get('plan')

    if (planFromUrl && plans[planFromUrl]) {
      setSelectedPlan(planFromUrl)
    }
  }, [])

  const plan = plans[selectedPlan] || plans.starter

  const t = {
    en: {
      back: '← Back to Pricing',
      title: 'Create your account',
      subtitle: 'Start using SocialPulse to grow your business.',
      selectedPlan: 'Selected plan',
      month: '/ month',
      promo: 'Introductory price for the first 2 months',
      normalPrice: 'Regular price',
      fullName: 'Full name',
      fullNamePlaceholder: 'Your name',
      businessName: 'Business name',
      businessNamePlaceholder: 'Company / business name',
      email: 'Email address',
      emailPlaceholder: 'name@company.com',
      emailNote: 'Your email will be used for your account and promotional verification.',
      password: 'Password',
      passwordPlaceholder: 'Minimum 8 characters',
      show: 'Show',
      hide: 'Hide',
      agreement: 'I agree to the SocialPulse Terms & Conditions and Privacy Policy.',
      create: 'Create Account',
      creating: 'Creating Account...',
      loginQuestion: 'Already have an account?',
      login: 'Sign in',
      success: 'Registration successful. Please sign in.',
      registerError: 'Registration failed',
      requiredError: 'Please complete all required fields.',
      passwordError: 'Password must be at least 8 characters.',
      agreementError: 'Please accept the Terms & Conditions and Privacy Policy.',
      leftTitle: 'Manage social media',
      leftHighlight: 'smarter.',
      leftDescription:
        'Monitor social media performance, understand your audience, and discover business growth opportunities from one dashboard.',
      feature1: 'Social media analytics',
      feature2: 'AI-powered insights',
      feature3: 'Performance reports',
      feature4: 'Multi-platform analytics',
      languageName: 'English',
    },

    id: {
      back: '← Kembali ke Pricing',
      title: 'Buat akun Anda',
      subtitle: 'Mulai gunakan SocialPulse untuk mengembangkan bisnis Anda.',
      selectedPlan: 'Paket yang dipilih',
      month: '/ bulan',
      promo: 'Harga promo untuk 2 bulan pertama',
      normalPrice: 'Harga normal',
      fullName: 'Nama lengkap',
      fullNamePlaceholder: 'Nama Anda',
      businessName: 'Nama bisnis',
      businessNamePlaceholder: 'Nama perusahaan / bisnis',
      email: 'Alamat email',
      emailPlaceholder: 'nama@perusahaan.com',
      emailNote: 'Email digunakan untuk akun dan verifikasi promo.',
      password: 'Kata sandi',
      passwordPlaceholder: 'Minimal 8 karakter',
      show: 'Lihat',
      hide: 'Sembunyikan',
      agreement:
        'Saya menyetujui Syarat & Ketentuan dan Kebijakan Privasi SocialPulse.',
      create: 'Buat Akun',
      creating: 'Membuat Akun...',
      loginQuestion: 'Sudah memiliki akun?',
      login: 'Masuk',
      success: 'Registrasi berhasil. Silakan login.',
      registerError: 'Registrasi gagal',
      requiredError: 'Mohon lengkapi semua kolom yang wajib diisi.',
      passwordError: 'Kata sandi minimal 8 karakter.',
      agreementError: 'Mohon setujui Syarat & Ketentuan dan Kebijakan Privasi.',
      leftTitle: 'Mulai kelola media sosial',
      leftHighlight: 'lebih cerdas.',
      leftDescription:
        'Pantau performa media sosial, pahami audiens, dan temukan peluang pertumbuhan bisnis dari satu dashboard.',
      feature1: 'Analytics media sosial',
      feature2: 'AI-powered insights',
      feature3: 'Laporan performa',
      feature4: 'Multi-platform analytics',
      languageName: 'Indonesia',
    },
  }

  const text = t[language]

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!name || !businessName || !email || !password) {
      setError(text.requiredError)
      return
    }

    if (password.length < 8) {
      setError(text.passwordError)
      return
    }

    if (!agree) {
      setError(text.agreementError)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          businessName,
          email,
          password,
          role: 'user',
          plan: selectedPlan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || text.registerError)
      }

      setSuccess(text.success)

      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err) {
      setError(err.message || text.registerError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="hidden lg:flex flex-col justify-center px-16 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950">
          <div className="max-w-xl">

            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                📊
              </div>

              <div>
                <div className="text-xl font-bold">
                  SocialPulse
                </div>

                <div className="text-xs uppercase tracking-[0.25em] text-blue-300">
                  Analytics Platform
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              {text.leftTitle}
              <span className="text-blue-400">
                {' '}{text.leftHighlight}
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              {text.leftDescription}
            </p>

            <div className="mt-10 space-y-4 text-slate-300">
              <div>✓ {text.feature1}</div>
              <div>✓ {text.feature2}</div>
              <div>✓ {text.feature3}</div>
              <div>✓ {text.feature4}</div>
            </div>

          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg">

            {/* LANGUAGE SWITCHER */}
            <div className="mb-6 flex justify-end">
              <div className="flex rounded-full border border-slate-700 bg-slate-900 p-1">

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇬🇧 English
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    language === 'id'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇮🇩 Indonesia
                </button>

              </div>
            </div>

            {/* HEADER */}
            <div className="mb-8">

              <Link
                href="/pricing"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {text.back}
              </Link>

              <h2 className="mt-6 text-3xl font-bold">
                {text.title}
              </h2>

              <p className="mt-2 text-slate-400">
                {text.subtitle}
              </p>

            </div>

            {/* SELECTED PLAN */}
            <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <div className="text-sm text-blue-300">
                    {text.selectedPlan}
                  </div>

                  <div className="mt-1 text-xl font-bold">
                    {plan.name}
                  </div>

                  <div className="mt-1 text-sm text-slate-400">
                    {plan.description[language]}
                  </div>
                </div>

                <div className="text-right">

                  <div className="text-2xl font-bold">
                    {plan.price}
                  </div>

                  <div className="text-xs text-slate-400">
                    {text.month}
                  </div>

                  {plan.promo && (
                    <div className="mt-1 text-xs font-semibold text-green-400">
                      {text.promo}
                    </div>
                  )}

                  <div className="mt-1 text-xs text-slate-500">
                    {text.normalPrice} {plan.normalPrice}
                  </div>

                </div>

              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {text.fullName}
                </label>

                <input
                  type="text"
                  placeholder={text.fullNamePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* BUSINESS */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {text.businessName}
                </label>

                <input
                  type="text"
                  placeholder={text.businessNamePlaceholder}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {text.email}
                </label>

                <input
                  type="email"
                  placeholder={text.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                  required
                />

                <p className="mt-2 text-xs text-slate-500">
                  {text.emailNote}
                </p>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {text.password}
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={text.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pr-24 text-white outline-none focus:border-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    {showPassword ? text.hide : text.show}
                  </button>

                </div>
              </div>

              {/* AGREEMENT */}
              <label className="flex gap-3 text-sm text-slate-400">

                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1"
                  required
                />

                <span>
                  {text.agreement}
                </span>

              </label>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  {success}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? text.creating : text.create}
              </button>

            </form>

            {/* LOGIN */}
            <p className="mt-6 text-center text-sm text-slate-400">
              {text.loginQuestion}{' '}

              <Link
                href="/login"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                {text.login}
              </Link>
            </p>

          </div>
        </section>

      </div>
    </main>
  )
}