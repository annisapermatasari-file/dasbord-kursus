'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PRICING_PLANS } from '@/lib/constants/pricing'
import SiteHeader from '@/components/marketing/SiteHeader'

export default function RegisterPage({ searchParams }) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  /*
   * Read URL parameters without useSearchParams().
   * This avoids the Vercel / Next.js build error.
   */
  const planParam =
    searchParams?.plan === 'business'
      ? 'business'
      : 'starter'

  const language =
    searchParams?.lang === 'id'
      ? 'id'
      : 'en'

  const isEnglish = language === 'en'

  const selectedPlan = PRICING_PLANS[language].find((p) => p.id === planParam)

  const t = {
    en: {
      badge: 'CREATE YOUR ACCOUNT',
      title: 'Start growing your business',
      subtitle:
        'Create your SocialPulse account and manage your social media performance from one powerful dashboard.',

      name: 'Full Name',
      namePlaceholder: 'Enter your full name',

      business: 'Business Name',
      businessPlaceholder: 'Enter your business or organization name',

      email: 'Email Address',
      emailPlaceholder: 'you@example.com',

      password: 'Password',
      passwordPlaceholder: 'At least 6 characters',

      selectedPlan: 'Selected Plan',

      terms:
        'I agree to the Terms & Conditions and Privacy Policy.',

      create: 'Create Account',
      creating: 'Creating account...',

      already:
        'Already have an account?',
      login: 'Sign in',

      errorName: 'Please enter your name.',
      errorBusiness: 'Please enter your business name.',
      errorEmail: 'Please enter a valid email address.',
      errorPassword: 'Password must be at least 6 characters.',
      errorTerms:
        'Please agree to the Terms & Conditions and Privacy Policy.',

      success:
        'Your account has been created successfully.',
    },

    id: {
      badge: 'BUAT AKUN ANDA',
      title: 'Mulai kembangkan bisnis Anda',
      subtitle:
        'Buat akun SocialPulse dan kelola performa media sosial Anda melalui satu dashboard.',

      name: 'Nama Lengkap',
      namePlaceholder: 'Masukkan nama lengkap',

      business: 'Nama Bisnis',
      businessPlaceholder:
        'Masukkan nama bisnis atau organisasi',

      email: 'Alamat Email',
      emailPlaceholder: 'anda@example.com',

      password: 'Kata Sandi',
      passwordPlaceholder: 'Minimal 6 karakter',

      selectedPlan: 'Paket Dipilih',

      terms:
        'Saya menyetujui Syarat & Ketentuan dan Kebijakan Privasi.',

      create: 'Buat Akun',
      creating: 'Membuat akun...',

      already: 'Sudah memiliki akun?',
      login: 'Masuk',

      errorName: 'Silakan masukkan nama Anda.',
      errorBusiness: 'Silakan masukkan nama bisnis.',
      errorEmail: 'Silakan masukkan alamat email yang valid.',
      errorPassword:
        'Kata sandi minimal 6 karakter.',
      errorTerms:
        'Silakan setujui Syarat & Ketentuan dan Kebijakan Privasi.',

      success:
        'Akun Anda berhasil dibuat.',
    },
  }[language]

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError(t.errorName)
      return
    }

    if (!businessName.trim()) {
      setError(t.errorBusiness)
      return
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError(t.errorEmail)
      return
    }

    if (password.length < 6) {
      setError(t.errorPassword)
      return
    }

    if (!agree) {
      setError(t.errorTerms)
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
          role: 'Admin',
          plan: selectedPlan.id,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isEnglish
              ? 'Registration failed.'
              : 'Registrasi gagal.')
        )
      }

      setSuccess(t.success)

      /*
       * Give the user a moment to see the success message,
       * then continue to login.
       */
      setTimeout(() => {
        router.push(
          `/login?registered=1&lang=${language}`
        )
      }, 1000)

    } catch (err) {
      setError(
        err?.message ||
          (isEnglish
            ? 'Something went wrong.'
            : 'Terjadi kesalahan.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <SiteHeader lang={language} basePath="/register" extraQuery={`plan=${planParam}`} variant="minimal" />

      <div className="mx-auto max-w-md px-6 py-14">

        {/* HEADER */}
        <div className="mb-8 text-center">

          <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-600">
            {t.badge}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t.title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {t.subtitle}
          </p>

        </div>

        {/* SELECTED PLAN */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span>{t.selectedPlan}</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 normal-case tracking-normal">
              {selectedPlan.badge}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">

            <div>
              <div className="text-lg font-semibold text-slate-900">
                {selectedPlan.name}
              </div>

              <div className="mt-0.5 text-sm text-slate-500">
                {selectedPlan.price}
                <span className="text-slate-400">{selectedPlan.period}</span>
              </div>
            </div>

            <Link
              href={`/pricing?lang=${language}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {isEnglish ? 'Change' : 'Ubah'}
            </Link>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          {/* NAME */}
          <div className="mb-4">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t.name}
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />

          </div>

          {/* BUSINESS */}
          <div className="mb-4">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t.business}
            </label>

            <input
              type="text"
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
              placeholder={t.businessPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />

          </div>

          {/* EMAIL */}
          <div className="mb-4">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t.email}
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />

          </div>

          {/* PASSWORD */}
          <div className="mb-5">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t.password}
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />

          </div>

          {/* TERMS */}
          <label className="mb-5 flex cursor-pointer gap-2.5 text-sm leading-6 text-slate-500">

            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-slate-900"
            />

            <span>
              {isEnglish ? (
                <>
                  I agree to the{' '}
                  <Link
                    href={`/terms?lang=en`}
                    target="_blank"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href={`/privacy?lang=en`}
                    target="_blank"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Privacy Policy
                  </Link>
                  .
                </>
              ) : (
                <>
                  Saya menyetujui{' '}
                  <Link
                    href={`/terms?lang=id`}
                    target="_blank"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Syarat & Ketentuan
                  </Link>{' '}
                  dan{' '}
                  <Link
                    href={`/privacy?lang=id`}
                    target="_blank"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Kebijakan Privasi
                  </Link>
                  .
                </>
              )}
            </span>

          </label>

          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t.creating : t.create}
          </button>

          {/* LOGIN */}
          <div className="mt-5 text-center text-sm text-slate-500">

            {t.already}{' '}

            <Link
              href={`/login?lang=${language}`}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              {t.login}
            </Link>

          </div>

        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center">

          <Link
            href={`/pricing?lang=${language}`}
            className="text-sm text-slate-400 hover:text-slate-700"
          >
            ← {isEnglish
              ? 'Back to Pricing'
              : 'Kembali ke Harga'}
          </Link>

        </div>

      </div>

    </main>
  )
}