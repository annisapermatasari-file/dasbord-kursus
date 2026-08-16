import Link from 'next/link'

export default function SiteFooter({ lang = 'id' }) {
  const isId = lang === 'id'
  return (
    <footer className="border-t border-slate-200 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 SocialPulse</span>
        <div className="flex flex-wrap gap-6">
          <Link href={`/pricing?lang=${lang}`} className="hover:text-slate-900">
            {isId ? 'Harga' : 'Pricing'}
          </Link>
          <Link href={`/terms?lang=${lang}`} className="hover:text-slate-900">
            {isId ? 'Syarat & Ketentuan' : 'Terms & Conditions'}
          </Link>
          <Link href={`/privacy?lang=${lang}`} className="hover:text-slate-900">
            {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
          </Link>
        </div>
      </div>
    </footer>
  )
}
