'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import SiteHeader from '@/components/marketing/SiteHeader'

const T = {
  en: {
    badge: 'WELCOME BACK',
    title: 'Sign in to your account',
    subtitle: 'Use your account to continue to your dashboard.',
    registered: 'Your account has been created. Please sign in.',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'Enter your password',
    login: 'Sign In',
    loggingIn: 'Signing in…',
    forgot: 'Forgot password?',
    noAccount: "Don't have an account?",
    register: 'Create one',
    errorRequired: 'Email and password are required.',
    errorGeneric: 'Invalid email or password.',
    errorNetwork: 'Unable to connect to the server. Please try again.',
  },
  id: {
    badge: 'SELAMAT DATANG KEMBALI',
    title: 'Masuk ke akun Anda',
    subtitle: 'Gunakan akun Anda untuk melanjutkan ke dashboard.',
    registered: 'Akun Anda berhasil dibuat. Silakan masuk.',
    email: 'Email',
    password: 'Kata Sandi',
    emailPlaceholder: 'anda@example.com',
    passwordPlaceholder: 'Masukkan kata sandi',
    login: 'Masuk',
    loggingIn: 'Sedang masuk…',
    forgot: 'Lupa kata sandi?',
    noAccount: 'Belum punya akun?',
    register: 'Daftar sekarang',
    errorRequired: 'Email dan kata sandi wajib diisi.',
    errorGeneric: 'Email atau kata sandi salah.',
    errorNetwork: 'Gagal menghubungi server. Coba lagi.',
  },
}

export default function LoginPage({ searchParams }) {
  const router = useRouter()
  const language = searchParams?.lang === 'id' ? 'id' : 'en'
  const registered = searchParams?.registered === '1'
  const [mode, setMode] = useState('login')

  return mode === 'forgot'
    ? <ForgotPasswordCard language={language} onBack={() => setMode('login')} />
    : <LoginCard language={language} registered={registered} onForgot={() => setMode('forgot')} router={router} />
}

function LoginCard({ language, registered, onForgot, router }) {
  const t = T[language]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e?.preventDefault?.()
    setError('')

    const em = email.trim().toLowerCase()
    if (!em || !password) {
      setError(t.errorRequired)
      return
    }

    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, password }),
      })
      const j = await r.json()

      if (r.ok && j.user) {
        try { localStorage.setItem('dashboard_user', JSON.stringify(j.user)) } catch {}
        router.push('/')
        return
      }

      setError(j.error || t.errorGeneric)
    } catch {
      setError(t.errorNetwork)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader lang={language} basePath="/login" variant="minimal" />

      <div className="mx-auto max-w-md px-6 py-16">

        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-600">
            {t.badge}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t.subtitle}</p>
        </div>

        {registered && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            {t.registered}
          </div>
        )}

        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              autoComplete="username"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.password}</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {showPw ? (language === 'id' ? 'Sembunyikan' : 'Hide') : (language === 'id' ? 'Lihat' : 'Show')}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t.loggingIn : t.login}
          </button>

          <div className="mt-5 flex items-center justify-between text-sm">
            <button type="button" onClick={onForgot} className="font-semibold text-blue-600 hover:text-blue-700">
              {t.forgot}
            </button>
            <span className="text-slate-500">
              {t.noAccount}{' '}
              <Link href={`/register?lang=${language}`} className="font-semibold text-blue-600 hover:text-blue-700">
                {t.register}
              </Link>
            </span>
          </div>

        </form>

      </div>
    </main>
  )
}

const FT = {
  en: {
    back: 'Back to sign in',
    title1: 'Reset your password',
    subtitle1: 'Enter your account email. We will send a verification code.',
    email: 'Email',
    send: 'Send Verification Code',
    sending: 'Sending…',
    title2: 'Verify & set a new password',
    sentTo: 'Verification code sent to',
    demoTitle: 'Demo Mode — Email Service Not Connected',
    demoDesc: 'Your verification code is shown here because SMTP/SendGrid is not configured. In production the code is delivered by email.',
    autofill: 'Autofill',
    demoNone: 'If your email is registered, a verification code has been sent. Check your inbox and spam folder.',
    code: 'Verification Code',
    codePlaceholder: '6-digit code',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'At least 6 characters',
    changeEmail: 'Change Email',
    reset: 'Reset Password',
    resetting: 'Processing…',
    doneTitle: 'Password reset successful',
    doneDesc: 'Please sign in again using your new password.',
    doneCta: 'Back to sign in →',
    errRequestGeneric: 'Failed to request reset code.',
    errResetGeneric: 'Failed to reset password.',
    errServer: 'Server error',
  },
  id: {
    back: 'Kembali ke halaman masuk',
    title1: 'Reset Kata Sandi',
    subtitle1: 'Masukkan email akun Anda. Kami akan kirim kode verifikasi.',
    email: 'Email',
    send: 'Kirim Kode Verifikasi',
    sending: 'Mengirim…',
    title2: 'Verifikasi & Kata Sandi Baru',
    sentTo: 'Kode verifikasi dikirim ke',
    demoTitle: 'Mode Demo — Email Service Belum Diaktifkan',
    demoDesc: 'Kode verifikasi ditampilkan di sini karena SMTP/SendGrid belum disambungkan. Di produksi kode akan dikirim ke email.',
    autofill: 'Isi otomatis',
    demoNone: 'Jika email Anda terdaftar, kode verifikasi telah dikirim. Cek folder inbox dan spam.',
    code: 'Kode Verifikasi',
    codePlaceholder: '6 digit angka',
    newPassword: 'Kata Sandi Baru',
    newPasswordPlaceholder: 'Minimal 6 karakter',
    changeEmail: 'Ganti Email',
    reset: 'Reset Kata Sandi',
    resetting: 'Memproses…',
    doneTitle: 'Kata Sandi Berhasil Direset',
    doneDesc: 'Silakan masuk kembali menggunakan kata sandi baru Anda.',
    doneCta: 'Ke Halaman Masuk →',
    errRequestGeneric: 'Gagal meminta kode reset.',
    errResetGeneric: 'Gagal reset kata sandi.',
    errServer: 'Server error',
  },
}

function ForgotPasswordCard({ language, onBack }) {
  const t = FT[language]
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPw, setNewPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devCode, setDevCode] = useState(null)
  const [masked, setMasked] = useState('')

  async function requestCode(e) {
    e?.preventDefault?.()
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const j = await r.json()
      if (!r.ok) { setError(j.error || t.errRequestGeneric); setLoading(false); return }
      setDevCode(j.dev_code); setMasked(j.masked_email || email); setStep(2)
    } catch { setError(t.errServer) }
    setLoading(false)
  }

  async function submitReset(e) {
    e?.preventDefault?.()
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, new_password: newPw }) })
      const j = await r.json()
      if (!r.ok) { setError(j.error || t.errResetGeneric); setLoading(false); return }
      setStep(3)
    } catch { setError(t.errServer) }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader lang={language} basePath="/login" variant="minimal" />

      <div className="mx-auto max-w-md px-6 py-16">
        <button onClick={onBack} className="mb-6 text-sm text-slate-400 hover:text-slate-700">← {t.back}</button>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.title1}</h1>
            <p className="mt-2 text-sm text-slate-500">{t.subtitle1}</p>
            <form onSubmit={requestCode} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.email}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@dikdasmen.belajar.id"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
              {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
              <button type="submit" disabled={loading} className="mt-5 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">
                {loading ? t.sending : t.send}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.title2}</h1>
            <p className="mt-2 text-sm text-slate-500">{t.sentTo} <span className="font-mono text-slate-700">{masked}</span></p>

            {devCode !== null && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">{t.demoTitle}</div>
                <div className="mt-1 text-xs text-amber-800">{t.demoDesc}</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 rounded-lg border border-amber-200 bg-white py-3 text-center font-mono text-2xl font-bold tracking-widest text-amber-900">{devCode}</div>
                  <button type="button" onClick={() => setCode(devCode)} className="rounded-lg bg-amber-200 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-300">{t.autofill}</button>
                </div>
              </div>
            )}
            {devCode === null && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">{t.demoNone}</div>
            )}

            <form onSubmit={submitReset} className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.code}</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t.codePlaceholder}
                  maxLength={6}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-center text-sm font-mono tracking-widest text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.newPassword}</label>
                <input
                  type="password"
                  required
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder={t.newPasswordPlaceholder}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />
              </div>
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setStep(1); setCode(''); setNewPw(''); setError('') }} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {t.changeEmail}
                </button>
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">
                  {loading ? t.resetting : t.reset}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{t.doneTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">{t.doneDesc}</p>
            <button onClick={onBack} className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              {t.doneCta}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
