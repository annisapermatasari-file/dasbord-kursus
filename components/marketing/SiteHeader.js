import Link from 'next/link'
import Logo from './Logo'

/**
 * Header bersama untuk seluruh halaman publik (landing, pricing, register,
 * login, terms, privacy) — tema terang, minimalis, konsisten di semua halaman.
 *
 * variant="full"    -> tampilkan nav Harga/Masuk/Daftar (landing, pricing, terms, privacy)
 * variant="minimal" -> hanya logo + language toggle (login, register — halaman ini
 *                       sudah punya tautan Masuk/Daftar sendiri di dalam form)
 */
export default function SiteHeader({ lang = 'id', basePath = '/', extraQuery = '', variant = 'full' }) {
  const qs = extraQuery ? `&${extraQuery}` : ''
  const hrefFor = (l) => `${basePath}?lang=${l}${qs}`
  const isId = lang === 'id'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Logo lang={lang} />

        <nav className="flex items-center gap-1 sm:gap-2">
          {variant === 'full' && (
            <>
              <Link
                href={`/pricing?lang=${lang}`}
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline-block"
              >
                {isId ? 'Harga' : 'Pricing'}
              </Link>
              <Link
                href={`/login?lang=${lang}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                {isId ? 'Masuk' : 'Sign In'}
              </Link>
              <Link
                href={`/register?lang=${lang}`}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {isId ? 'Daftar' : 'Sign Up'}
              </Link>
            </>
          )}

          <div className="ml-1 flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <Link
              href={hrefFor('en')}
              className={`rounded-md px-2.5 py-1.5 transition ${
                !isId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </Link>
            <Link
              href={hrefFor('id')}
              className={`rounded-md px-2.5 py-1.5 transition ${
                isId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ID
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
