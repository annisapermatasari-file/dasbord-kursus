import Link from 'next/link'
import Logo from './Logo'

/**
 * Header bersama untuk halaman publik (landing, pricing, register, login,
 * terms, privacy) — memakai token warna yang sama dengan dashboard.
 *
 * variant="full"    -> nav Harga / Masuk / Daftar
 * variant="minimal" -> hanya logo + pilihan bahasa (login, register)
 */
export default function SiteHeader({ lang = 'id', basePath = '/', extraQuery = '', variant = 'full' }) {
  const qs = extraQuery ? `&${extraQuery}` : ''
  const hrefFor = (l) => `${basePath}?lang=${l}${qs}`
  const isId = lang === 'id'

  return (
    <header className="sticky top-0 z-30 border-b border-ink/[0.07] bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo lang={lang} />

        <nav className="flex items-center gap-1 sm:gap-2" aria-label={isId ? 'Navigasi utama' : 'Main navigation'}>
          {variant === 'full' && (
            <>
              <Link href={`/pricing?lang=${lang}`} className="hidden rounded-full px-3.5 py-2 text-[14px] font-medium text-ink-muted hover:text-ink sm:inline-block">
                {isId ? 'Harga' : 'Pricing'}
              </Link>
              <Link href={`/login?lang=${lang}`} className="rounded-full px-3.5 py-2 text-[14px] font-medium text-ink-muted hover:text-ink">
                {isId ? 'Masuk' : 'Sign in'}
              </Link>
              <Link href={`/register?lang=${lang}`} className="rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-ink-soft">
                {isId ? 'Daftar' : 'Sign up'}
              </Link>
            </>
          )}

          <div className="ml-1 flex rounded-full border border-ink/10 bg-white p-0.5 text-[12px] font-semibold" role="group" aria-label={isId ? 'Bahasa' : 'Language'}>
            <Link href={hrefFor('id')} aria-current={isId ? 'true' : undefined}
              className={`rounded-full px-2.5 py-1 transition-colors ${isId ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'}`}>ID</Link>
            <Link href={hrefFor('en')} aria-current={!isId ? 'true' : undefined}
              className={`rounded-full px-2.5 py-1 transition-colors ${!isId ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'}`}>EN</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
