'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const plans = {
  starter: {
    id: 'starter',
    name: {
      en: 'Starter',
      id: 'Starter',
    },
    price: {
      en: '$10/month',
      id: 'Rp149.000/bulan',
    },
  },
  business: {
    id: 'business',
    name: {
      en: 'Business',
      id: 'Business',
    },
    price: {
      en: '$30/month',
      id: 'Rp499.000/bulan',
    },
  },
}

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

  const selectedPlan = plans[planParam]

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
  role: 'Viewer',
  plan: selectedPlan,
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
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">

      {/* TOP LANGUAGE */}
      <div className="mx-auto mb-8 flex max-w-xl justify-end gap-2">

        <Link
          href={`/register?plan=${planParam}&lang=id`}
          className={[
            'rounded-lg px-3 py-2 text-xs font-bold transition',
            !isEnglish
              ? 'bg-white text-slate-950'
              : 'border border-slate-700 text-slate-400 hover:bg-slate-800',
          ].join(' ')}
        >
          Indonesia
        </Link>

        <Link
          href={`/register?plan=${planParam}&lang=en`}
          className={[
            'rounded-lg px-3 py-2 text-xs font-bold transition',
            isEnglish
              ? 'bg-white text-slate-950'
              : 'border border-slate-700 text-slate-400 hover:bg-slate-800',
          ].join(' ')}
        >
          English
        </Link>

      </div>

      <div className="mx-auto max-w-xl">

        {/* HEADER */}
        <div className="mb-8 text-center">

          <div className="mb-5 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-bold tracking-wide text-blue-300">
            {t.badge}
          </div>

          <h1 className="text-4xl font-black sm:text-5xl">
            {t.title}
          </h1>

          <p className="mt-4 leading-7 text-slate-400">
            {t.subtitle}
          </p>

        </div>

        {/* SELECTED PLAN */}
        <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-950/40 p-5">

          <div className="text-xs font-semibold uppercase tracking-wide text-blue-300">
            {t.selectedPlan}
          </div>

          <div className="mt-2 flex items-center justify-between">

            <div>
              <div className="text-xl font-bold">
                {selectedPlan.name[language]}
              </div>

              <div className="mt-1 text-sm text-slate-400">
                {selectedPlan.price[language]}
              </div>
            </div>

            <Link
              href={`/pricing?lang=${language}`}
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              {isEnglish ? 'Change' : 'Ubah'}
            </Link>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl"
        >

          {/* NAME */}
          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              {t.name}
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

          </div>

          {/* BUSINESS */}
          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              {t.business}
            </label>

            <input
              type="text"
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
              placeholder={t.businessPlaceholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

          </div>

          {/* EMAIL */}
          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              {t.email}
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

          </div>

          {/* PASSWORD */}
          <div className="mb-6">

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              {t.password}
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

          </div>

          {/* TERMS */}
          <label className="mb-6 flex cursor-pointer gap-3 text-sm leading-6 text-slate-400">

            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
            />

            <span>
              {isEnglish ? (
                <>
                  I agree to the{' '}
                  <Link
                    href={`/terms?lang=en`}
                    target="_blank"
                    className="font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href={`/privacy?lang=en`}
                    target="_blank"
                    className="font-semibold text-blue-400 hover:text-blue-300"
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
                    className="font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Syarat & Ketentuan
                  </Link>{' '}
                  dan{' '}
                  <Link
                    href={`/privacy?lang=id`}
                    target="_blank"
                    className="font-semibold text-blue-400 hover:text-blue-300"
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
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t.creating : t.create}
          </button>

          {/* LOGIN */}
          <div className="mt-6 text-center text-sm text-slate-500">

            {t.already}{' '}

            <Link
              href={`/login?lang=${language}`}
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              {t.login}
            </Link>

          </div>

        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center">

          <Link
            href={`/pricing?lang=${language}`}
            className="text-sm text-slate-500 hover:text-white"
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