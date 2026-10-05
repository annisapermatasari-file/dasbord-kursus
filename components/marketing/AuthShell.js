import SiteHeader from './SiteHeader'
import { PulseMark } from './Logo'

const ASIDE = {
  id: {
    sentence: 'Dalam 30 hari terakhir, konten Anda menjangkau 2,1 Jt orang.',
    note: 'Contoh ringkasan yang akan Anda lihat setiap membuka dashboard.',
    rows: [['Instagram', '#E1306C', 82], ['TikTok', '#ffffff', 100], ['Facebook', '#1877F2', 51], ['YouTube', '#FF0000', 40]],
  },
  en: {
    sentence: 'In the last 30 days, your content reached 2.1M people.',
    note: 'An example of the summary you will see each time you open the dashboard.',
    rows: [['Instagram', '#E1306C', 82], ['TikTok', '#ffffff', 100], ['Facebook', '#1877F2', 51], ['YouTube', '#FF0000', 40]],
  },
}

/**
 * Tata letak bersama untuk halaman masuk, daftar, dan lupa kata sandi:
 * formulir di kiri, panel navy berisi contoh ringkasan dashboard di kanan.
 */
export default function AuthShell({ lang = 'id', basePath, extraQuery, title, subtitle, children, footer }) {
  const a = ASIDE[lang] || ASIDE.id
  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader lang={lang} basePath={basePath} extraQuery={extraQuery} variant="minimal" />
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-16">
        <div className="mx-auto w-full max-w-[440px]">
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-[36px]">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-[14px] text-ink-muted">{footer}</div>}
        </div>

        <aside className="relative hidden overflow-hidden rounded-3xl bg-ink p-10 text-white lg:block" aria-hidden="true">
          <svg className="absolute -right-10 bottom-4 w-[90%] opacity-[0.08]" viewBox="0 0 400 120" fill="none">
            <path d="M0 90h70l20-48 32 88 20-40h50l18-60 30 70 20-30h140" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          <div className="relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal"><PulseMark className="h-6 w-6" /></span>
            <p className="mt-10 max-w-[18ch] text-[34px] font-extrabold leading-[1.1] tracking-tight">{a.sentence}</p>
            <div className="mt-10 space-y-3.5">
              {a.rows.map(([n, c, w]) => (
                <div key={n} className="flex items-center gap-3 text-[13px]">
                  <span className="w-20 text-white/70">{n}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full" style={{ width: `${w}%`, background: c }} /></span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-[13px] text-white/50">{a.note}</p>
          </div>
        </aside>
      </div>
    </main>
  )
}

/* Kelas bersama untuk elemen formulir */
export const field = 'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-signal focus:ring-4 focus:ring-signal/15'
export const label = 'mb-1.5 block text-[14px] font-semibold text-ink'
export const primaryBtn = 'w-full rounded-full bg-signal px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-signal-deep disabled:cursor-not-allowed disabled:opacity-50'
export const secondaryBtn = 'rounded-full border border-ink/15 bg-white px-5 py-3.5 text-[15px] font-semibold text-ink hover:border-ink/30'
export const textLink = 'font-semibold text-signal hover:text-signal-deep'
export const errorBox = 'rounded-xl bg-alert-soft px-4 py-3 text-[14px] text-alert'
export const okBox = 'rounded-xl bg-growth-soft px-4 py-3 text-[14px] text-growth'
