import Link from 'next/link'

export default function Logo({ lang = 'id', className = '' }) {
  return (
    <Link href={`/?lang=${lang}`} className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900">
        <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
          <path d="M4 16.5 9.5 11l4 3L20 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.5 6H20v5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-slate-900">SocialPulse</span>
    </Link>
  )
}
