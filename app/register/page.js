'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const plans = {
  starter: {
    name: 'STARTER',
    promoPrice: 'Rp99.000',
    normalPrice: 'Rp149.000',
    promo: 'Promo 2 bulan pertama',
    description: 'Untuk UMKM dan bisnis kecil.',
  },

  business: {
    name: 'BUSINESS',
    promoPrice: 'Rp299.000',
    normalPrice: 'Rp499.000',
    promo: null,
    description: 'Untuk bisnis yang sedang berkembang.',
  },

  agency: {
    name: 'AGENCY / ORGANIZATION',
    promoPrice: 'Rp999.000',
    normalPrice: 'Rp2.500.000+',
    promo: null,
    description: 'Untuk agency dan organisasi.',
  },
}

function RegisterPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const selectedPlan = searchParams.get('plan') || 'starter'
  const plan = plans[selectedPlan] || plans.starter

  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!agree) {
      setError('Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi.')
      return
    }

    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter.')
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
        throw new Error(data.error || 'Registrasi gagal')
      }

      setSuccess('Registrasi berhasil. Mengarahkan ke halaman login...')

      setTimeout(() => {
        router.push('/login')
      }, 1500)

    } catch (err) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT */}
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
              Mulai kelola media sosial
              <span className="text-blue-400">
                {' '}lebih cerdas.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Pantau performa media sosial, pahami audiens,
              dan temukan peluang pertumbuhan bisnis dari
              satu dashboard.
            </p>

            <div className="mt-10 space-y-4 text-slate-300">
              <div>✓ Analytics media sosial</div>
              <div>✓ AI-powered insights</div>
              <div>✓ Laporan performa</div>
              <div>✓ Multi-platform analytics</div>
            </div>

          </div>
        </section>

        {/* RIGHT */}
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg">

            <div className="mb-8">

              <Link
                href="/pricing"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                ← Kembali ke Pricing
              </Link>

              <h2 className="mt-6 text-3xl font-bold">
                Buat akun Anda
              </h2>

              <p className="mt-2 text-slate-400">
                Mulai gunakan SocialPulse untuk bisnis Anda.
              </p>

            </div>

            {/* SELECTED PLAN */}
            <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <div className="text-sm text-blue-300">
                    Paket yang dipilih
                  </div>

                  <div className="mt-1 text-xl font-bold">
                    {plan.name}
                  </div>

                  <div className="mt-1 text-sm text-slate-400">
                    {plan.description}
                  </div>
                </div>

                <div className="text-right">

                  <div className="text-2xl font-bold">
                    {plan.promoPrice}
                  </div>

                  <div className="text-xs text-slate-400">
                    / bulan
                  </div>

                  {plan.promo && (
                    <div className="mt-1 text-xs font-semibold text-green-400">
                      {plan.promo}
                    </div>
                  )}

                  <div className="mt-1 text-xs text-slate-500">
                    Harga normal {plan.normalPrice}
                  </div>

                </div>

              </div>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nama lengkap
                </label>

                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* BUSINESS */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nama bisnis
                </label>

                <input
                  type="text"
                  placeholder="Nama perusahaan / bisnis"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="nama@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                  required
                />

                <p className="mt-2 text-xs text-slate-500">
                  Email digunakan untuk akun dan verifikasi promo.
                </p>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kata sandi
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
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
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
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
                  Saya menyetujui Syarat & Ketentuan dan
                  Kebijakan Privasi SocialPulse.
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
                {loading ? 'Membuat Akun...' : 'Buat Akun'}
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-slate-400">

              Sudah memiliki akun?{' '}

              <Link
                href="/login"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Masuk
              </Link>

            </p>

          </div>
        </section>

      </div>
    </main>
  )
}

/*
  useSearchParams() harus berada di dalam Suspense
  agar build Vercel tidak gagal.
*/

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="text-center">
            <div className="text-xl font-bold">
              SocialPulse
            </div>

            <div className="mt-2 text-sm text-slate-400">
              Memuat halaman registrasi...
            </div>
          </div>
        </main>
      }
    >
      <RegisterPageContent />
    </Suspense>
  )
}