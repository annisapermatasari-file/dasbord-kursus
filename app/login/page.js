'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AuthShell, { field, label, primaryBtn, secondaryBtn, textLink, errorBox, okBox } from '@/components/marketing/AuthShell'

const T = {
  en: {
    badge: 'WELCOME BACK',
    title: 'Welcome back',
    subtitle: 'Sign in to see how your channels are doing.',
    registered: 'Your account has been created. Please sign in.',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'Enter your password',
    login: 'Sign in',
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
    title: 'Selamat datang kembali',
    subtitle: 'Masuk untuk melihat performa kanal Anda.',
    registered: 'Akun Anda berhasil dibuat. Silakan masuk.',
    email: 'Email',
    password: 'Kata sandi',
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

  const hide = language === 'id' ? 'Sembunyikan' : 'Hide'
  const show = language === 'id' ? 'Lihat' : 'Show'
  return (
    <AuthShell lang={language} basePath="/login" title={t.title} subtitle={t.subtitle}
      footer={<>{t.noAccount}{' '}<Link href={`/register?lang=${language}`} className={textLink}>{t.register}</Link></>}>
      {registered && <div className={`${okBox} mb-5`} role="status">{t.registered}</div>}

      <form onSubmit={submit} noValidate>
        <div className="mb-4">
          <label htmlFor="email" className={label}>{t.email}</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder} autoComplete="username" className={field} />
        </div>

        <div className="mb-2">
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="password" className={label.replace('mb-1.5 ', '')}>{t.password}</label>
            <button type="button" onClick={onForgot} className={`text-[13px] ${textLink}`}>{t.forgot}</button>
          </div>
          <div className="relative">
            <input id="password" type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder} autoComplete="current-password" className={`${field} pr-24`} />
            <button type="button" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-muted hover:bg-ink/[0.05] hover:text-ink">
              {showPw ? hide : show}
            </button>
          </div>
        </div>

        {error && <div className={`${errorBox} mt-4`} role="alert">{error}</div>}

        <button type="submit" disabled={loading} className={`${primaryBtn} mt-6`}>
          {loading ? t.loggingIn : t.login}
        </button>
      </form>
    </AuthShell>
  )
}

const FT = {
  en: {
    back: 'Back to sign in',
    title1: 'Reset your password',
    subtitle1: 'Enter your account email. We will send a verification code.',
    email: 'Email',
    send: 'Send verification code',
    sending: 'Sending…',
    title2: 'Enter the code and a new password',
    sentTo: 'Verification code sent to',
    demoTitle: 'Development mode: email not connected',
    demoDesc: 'Your verification code is shown here because SMTP/SendGrid is not configured. In production the code is delivered by email.',
    autofill: 'Autofill',
    demoNone: 'If your email is registered, a verification code has been sent. Check your inbox and spam folder.',
    code: 'Verification code',
    codePlaceholder: '6-digit code',
    newPassword: 'New password',
    newPasswordPlaceholder: 'At least 8 characters',
    changeEmail: 'Change email',
    reset: 'Save new password',
    resetting: 'Processing…',
    doneTitle: 'Your password has been changed',
    doneDesc: 'Please sign in again using your new password.',
    doneCta: 'Sign in now',
    errRequestGeneric: 'Failed to request reset code.',
    errResetGeneric: 'Failed to reset password.',
    errServer: 'Server error',
  },
  id: {
    back: 'Kembali ke halaman masuk',
    title1: 'Atur ulang kata sandi',
    subtitle1: 'Masukkan email akun Anda. Kami akan kirim kode verifikasi.',
    email: 'Email',
    send: 'Kirim kode verifikasi',
    sending: 'Mengirim…',
    title2: 'Masukkan kode dan kata sandi baru',
    sentTo: 'Kode verifikasi dikirim ke',
    demoTitle: 'Mode pengembangan: email belum aktif',
    demoDesc: 'Kode verifikasi ditampilkan di sini karena SMTP/SendGrid belum disambungkan. Di produksi kode akan dikirim ke email.',
    autofill: 'Isi otomatis',
    demoNone: 'Jika email Anda terdaftar, kode verifikasi telah dikirim. Cek folder inbox dan spam.',
    code: 'Kode verifikasi',
    codePlaceholder: '6 digit angka',
    newPassword: 'Kata sandi baru',
    newPasswordPlaceholder: 'Minimal 8 karakter',
    changeEmail: 'Ganti email',
    reset: 'Simpan kata sandi baru',
    resetting: 'Memproses…',
    doneTitle: 'Kata sandi sudah diganti',
    doneDesc: 'Silakan masuk kembali menggunakan kata sandi baru Anda.',
    doneCta: 'Masuk sekarang',
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

  const titles = { 1: [t.title1, t.subtitle1], 2: [t.title2, <>{t.sentTo} <span className="font-semibold text-ink">{masked}</span></>], 3: [t.doneTitle, t.doneDesc] }
  return (
    <AuthShell lang={language} basePath="/login" title={titles[step][0]} subtitle={titles[step][1]}
      footer={step !== 3 && <button onClick={onBack} className={textLink}>{t.back}</button>}>
      {step === 1 && (
        <form onSubmit={requestCode}>
          <label htmlFor="reset-email" className={label}>{t.email}</label>
          <input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={language === 'id' ? 'anda@email.com' : 'you@email.com'} autoComplete="email" className={field} />
          {error && <div className={`${errorBox} mt-4`} role="alert">{error}</div>}
          <button type="submit" disabled={loading} className={`${primaryBtn} mt-6`}>{loading ? t.sending : t.send}</button>
        </form>
      )}

      {step === 2 && (
        <>
          {devCode !== null ? (
            <div className="mb-5 rounded-xl bg-marigold-soft p-4">
              <div className="text-[13px] font-bold text-marigold-deep">{t.demoTitle}</div>
              <div className="mt-1 text-[13px] text-marigold-deep/80">{t.demoDesc}</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 rounded-lg bg-white py-2.5 text-center text-[24px] font-extrabold tracking-[0.3em] text-ink tabular">{devCode}</div>
                <button type="button" onClick={() => setCode(devCode)} className="rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-marigold-deep hover:bg-white/80">{t.autofill}</button>
              </div>
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-ink/10 bg-white p-4 text-[14px] text-ink-muted">{t.demoNone}</div>
          )}
          <form onSubmit={submitReset}>
            <div className="mb-4">
              <label htmlFor="code" className={label}>{t.code}</label>
              <input id="code" type="text" required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t.codePlaceholder} maxLength={6} inputMode="numeric" autoComplete="one-time-code"
                className={`${field} text-center text-[20px] font-bold tracking-[0.4em] tabular`} />
            </div>
            <div>
              <label htmlFor="new-password" className={label}>{t.newPassword}</label>
              <input id="new-password" type="password" required value={newPw} onChange={(e) => setNewPw(e.target.value)}
                placeholder={t.newPasswordPlaceholder} autoComplete="new-password" className={field} />
            </div>
            {error && <div className={`${errorBox} mt-4`} role="alert">{error}</div>}
            <div className="mt-6 flex items-center gap-2">
              <button type="button" onClick={() => { setStep(1); setCode(''); setNewPw(''); setError('') }} className={secondaryBtn}>{t.changeEmail}</button>
              <button type="submit" disabled={loading} className={`${primaryBtn} flex-1`}>{loading ? t.resetting : t.reset}</button>
            </div>
          </form>
        </>
      )}

      {step === 3 && (
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-growth-soft text-growth">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <button onClick={onBack} className={`${primaryBtn} mt-6`}>{t.doneCta}</button>
        </div>
      )}
    </AuthShell>
  )
}
