import Link from 'next/link'
import Logo from './Logo'

export default function SiteFooter({ lang = 'id' }) {
  const isId = lang === 'id'
  return (
    <footer className="bg-ink text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <Logo lang={lang} tone="light" />
          <span className="text-[13px]">© {new Date().getFullYear()} SocialPulse</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
          <Link href={`/pricing?lang=${lang}`} className="hover:text-white">{isId ? 'Harga' : 'Pricing'}</Link>
          <Link href={`/terms?lang=${lang}`} className="hover:text-white">{isId ? 'Syarat & ketentuan' : 'Terms & conditions'}</Link>
          <Link href={`/privacy?lang=${lang}`} className="hover:text-white">{isId ? 'Kebijakan privasi' : 'Privacy policy'}</Link>
        </div>
      </div>
    </footer>
  )
}
