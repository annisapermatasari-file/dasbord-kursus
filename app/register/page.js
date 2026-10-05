'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PRICING_PLANS } from '@/lib/constants/pricing'
import AuthShell, { field, label, primaryBtn, textLink, errorBox, okBox } from '@/components/marketing/AuthShell'

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
  const planParam = ['business', 'agency'].includes(searchParams?.plan) ? searchParams.plan : 'starter'

  const language =
    searchParams?.lang === 'id'
      ? 'id'
      : 'en'

  const isEnglish = language === 'en'

  const selectedPlan = PRICING_PLANS[language].find((p) => p.id === planParam)

  const t = {
    en: {
      badge: 'CREATE YOUR ACCOUNT',
      title: 'Create your account',
      subtitle:
        'Takes about a minute. You will be the Admin of your own workspace.',

      name: 'Full name',
      namePlaceholder: 'Enter your full name',

      business: 'Business or organization',
      businessPlaceholder: 'Enter your business or organization name',

      email: 'Email',
      emailPlaceholder: 'you@example.com',

      password: 'Password',
      passwordPlaceholder: 'At least 8 characters',

      selectedPlan: 'Selected plan',

      terms:
        'I agree to the Terms & Conditions and Privacy Policy.',

      create: 'Create account',
      creating: 'Creating account...',

      already:
        'Already have an account?',
      login: 'Sign in',

      errorName: 'Please enter your name.',
      errorBusiness: 'Please enter your business name.',
      errorEmail: 'Please enter a valid email address.',
      errorPassword: 'Password must be at least 8 characters.',
      errorTerms:
        'Please agree to the Terms & Conditions and Privacy Policy.',

      success:
        'Your account has been created successfully.',
    },

    id: {
      badge: 'BUAT AKUN ANDA',
      title: 'Buat akun Anda',
      subtitle:
        'Hanya sekitar satu menit. Anda akan menjadi Admin di workspace sendiri.',

      name: 'Nama lengkap',
      namePlaceholder: 'Masukkan nama lengkap',

      business: 'Nama bisnis atau organisasi',
      businessPlaceholder:
        'Masukkan nama bisnis atau organisasi',

      email: 'Email',
      emailPlaceholder: 'anda@example.com',

      password: 'Kata sandi',
      passwordPlaceholder: 'Minimal 8 karakter',

      selectedPlan: 'Paket dipilih',

      terms:
        'Saya menyetujui Syarat & Ketentuan dan Kebijakan Privasi.',

      create: 'Buat akun',
      creating: 'Membuat akun...',

      already: 'Sudah punya akun?',
      login: 'Masuk',

      errorName: 'Silakan masukkan nama Anda.',
      errorBusiness: 'Silakan masukkan nama bisnis.',
      errorEmail: 'Silakan masukkan alamat email yang valid.',
      errorPassword:
        'Kata sandi minimal 8 karakter.',
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

    if (password.length < 8) {
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

  const termsLinks = isEnglish
    ? <>I agree to the{' '}<Link href="/terms?lang=en" target="_blank" className={textLink}>Terms & Conditions</Link>{' '}and{' '}<Link href="/privacy?lang=en" target="_blank" className={textLink}>Privacy Policy</Link>.</>
    : <>Saya menyetujui{' '}<Link href="/terms?lang=id" target="_blank" className={textLink}>Syarat & Ketentuan</Link>{' '}dan{' '}<Link href="/privacy?lang=id" target="_blank" className={textLink}>Kebijakan Privasi</Link>.</>
  const inputs = [
    { id: 'name', l: t.name, v: name, set: setName, ph: t.namePlaceholder, type: 'text', ac: 'name' },
    { id: 'business', l: t.business, v: businessName, set: setBusinessName, ph: t.businessPlaceholder, type: 'text', ac: 'organization' },
    { id: 'email', l: t.email, v: email, set: setEmail, ph: t.emailPlaceholder, type: 'email', ac: 'email' },
    { id: 'password', l: t.password, v: password, set: setPassword, ph: t.passwordPlaceholder, type: 'password', ac: 'new-password' },
  ]

  return (
    <AuthShell lang={language} basePath="/register" extraQuery={`plan=${planParam}`} title={t.title} subtitle={t.subtitle}
      footer={<>{t.already}{' '}<Link href={`/login?lang=${language}`} className={textLink}>{t.login}</Link></>}>

      {/* Paket yang dipilih */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3.5 ring-1 ring-ink/[0.08]">
        <div>
          <div className="text-[12.5px] text-ink-muted">{t.selectedPlan}</div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-[16px] font-extrabold text-ink">{selectedPlan.name}</span>
            <span className="text-[14px] text-ink-soft tabular">{selectedPlan.price}<span className="text-ink-muted">{selectedPlan.period}</span></span>
          </div>
        </div>
        <Link href={`/pricing?lang=${language}`} className={`text-[14px] ${textLink}`}>{isEnglish ? 'Change' : 'Ubah'}</Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {inputs.map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className={label}>{f.l}</label>
              <input id={f.id} type={f.type} value={f.v} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} autoComplete={f.ac} className={field} />
            </div>
          ))}
        </div>

        <label className="mt-5 flex cursor-pointer gap-3 text-[14px] leading-relaxed text-ink-muted">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-signal" />
          <span>{termsLinks}</span>
        </label>

        {error && <div className={`${errorBox} mt-4`} role="alert">{error}</div>}
        {success && <div className={`${okBox} mt-4`} role="status">{success}</div>}

        <button type="submit" disabled={loading} className={`${primaryBtn} mt-6`}>
          {loading ? t.creating : t.create}
        </button>
      </form>
    </AuthShell>
  )
}