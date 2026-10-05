import Link from 'next/link'

/** Tanda SocialPulse — garis denyut, sama dengan logo di sidebar dashboard. */
export function PulseMark({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 13h3.5l2.5-6 4 11 2.5-5H21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Logo({ lang = 'id', className = '', tone = 'dark' }) {
  return (
    <Link href={`/?lang=${lang}`} className={`flex items-center gap-2.5 ${className}`} aria-label="SocialPulse — beranda">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal text-white">
        <PulseMark />
      </div>
      <span className={`text-[17px] font-extrabold tracking-tight ${tone === 'light' ? 'text-white' : 'text-ink'}`}>SocialPulse</span>
    </Link>
  )
}
