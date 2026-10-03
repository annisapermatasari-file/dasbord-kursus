'use client'
import { useState } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Calendar, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, Target, Lightbulb, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { formatNumber, pctChange } from '@/lib/mockData'

/** User yang sedang login (lihat app/page.js) — dipakai untuk mengidentifikasi workspace di setiap request. */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem('dashboard_user') || 'null') } catch { return null }
}

/**
 * fetch() untuk API dashboard. Identitas user dibuktikan lewat cookie sesi
 * HttpOnly (dikirim otomatis oleh browser). Header x-actor-email hanya
 * penanda bahwa request berasal dari dashboard; server selalu mencocokkannya
 * dengan sesi dan menolak bila berbeda.
 */
export function apiFetch(path, options = {}) {
  const u = getCurrentUser()
  const headers = { ...(options.headers || {}) }
  if (u?.email) headers['x-actor-email'] = u.email
  return fetch(path, { credentials: 'same-origin', ...options, headers })
}

export const PERIODS = [
  { key:'1', label:'Hari ini', days:1 },
  { key:'7', label:'7 hari terakhir', days:7 },
  { key:'30', label:'30 hari terakhir', days:30 },
  { key:'90', label:'90 hari terakhir', days:90 },
  { key:'ytd', label:'Tahun berjalan', days: (() => { const n=new Date(); const s=new Date(n.getFullYear(),0,1); return Math.floor((n-s)/86400000)+1 })() },
]

export function PeriodFilter({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Periode data" className="inline-flex items-center gap-0.5 bg-white border border-ink/10 rounded-full p-1 max-w-full overflow-x-auto [scrollbar-width:none]">
      <Calendar className="w-4 h-4 text-ink-muted mx-2 shrink-0" aria-hidden="true" />
      {PERIODS.map(p => (
        <button key={p.key} role="radio" aria-checked={value === p.key} onClick={() => onChange(p.key)}
          className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-colors
            ${value === p.key ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink hover:bg-ink/[0.04]'}`}>
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function MockDataBanner({ onConnect }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-marigold-soft px-4 py-3 flex-wrap">
      <AlertTriangle className="w-4 h-4 text-marigold-deep shrink-0" aria-hidden="true" />
      <p className="text-[13.5px] text-marigold-deep flex-1 min-w-[220px]">
        Angka di halaman ini masih data contoh. Hubungkan akun media sosial agar dashboard menampilkan data asli.
      </p>
      {onConnect && <button onClick={onConnect} className="text-[13px] font-semibold px-3.5 py-1.5 rounded-full bg-white text-marigold-deep hover:bg-white/80">Hubungkan akun</button>}
    </div>
  )
}

/** Gaya grafik bersama — dipakai semua chart Recharts agar konsisten */
export const CHART = {
  grid: '#E6EAF2',
  axis: { fontSize: 11, fill: '#5B6785' },
  reach: '#2350E6',
  engagement: '#0E9F8E',
  highlight: '#F0A92B',
  negative: '#E5484D',
}

export function KpiCard({ label, value, prev, spark = [], format='num', prefix='', isLive=false, size='md' }) {
  const change = pctChange(value, prev)
  const up = change >= 0
  const displayValue = format === 'pct' ? `${value}%` : format === 'time' ? fmtDuration(value) : `${prefix}${formatNumber(value)}`
  const id = label.replace(/[^a-z0-9]/gi,'-')
  const lg = size === 'lg'
  const stroke = up ? '#0E9F8E' : '#E5484D'
  return (
    <div className={`bg-white rounded-xl border ${isLive ? 'border-growth/40' : 'border-ink/[0.08]'} ${lg ? 'p-5' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className={`${lg ? 'text-[13.5px]' : 'text-[12.5px]'} text-ink-muted font-medium`}>{label}</div>
        {isLive && <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-growth-soft text-growth font-semibold inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-growth" />Live</span>}
      </div>
      <div className="flex items-end justify-between gap-3 mt-2">
        <div className={`${lg ? 'text-[30px]' : 'text-[24px]'} font-extrabold text-ink leading-none tracking-tight tabular whitespace-nowrap`}>{displayValue}</div>
        {spark.length > 1 && (
          <div className={`${lg ? 'w-[96px] h-[34px]' : 'w-[72px] h-[28px]'} shrink min-w-0`} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark.map((v,i)=>({ i, v }))}>
                <defs>
                  <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.6} fill={`url(#sp-${id})`} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className={`mt-3 inline-flex items-center gap-1 text-[12px] font-semibold tabular whitespace-nowrap ${up ? 'text-growth' : 'text-alert'}`}>
        {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {up ? '+' : ''}{change}%
        <span className="text-[11.5px] text-ink-muted font-normal ml-0.5">dari periode lalu</span>
      </div>
    </div>
  )
}

export function ChartTooltip({ active, payload, label, formatter = formatNumber }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-ink text-white rounded-lg shadow-xl px-3 py-2 text-xs tabular">
      <div className="font-semibold text-white/80 mb-1">{label && typeof label === 'string' ? fmtLongDate(label) : label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-white/60">{p.name}</span>
          <span className="font-semibold text-white ml-auto pl-3">{formatter(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function AIInsightsPanel({ context, scope='overview', fallback }) {
  const [expanded, setExpanded] = useState(true)
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState(fallback)
  const [source, setSource] = useState('rule')
  const [error, setError] = useState('')

  async function runLLM() {
    setLoading(true); setError('')
    try {
      const r = await apiFetch('/api/ai-insights', {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ context, scope }),
      })
      const j = await r.json()
      if (j.insights) { setInsights({ ...fallback, ...j.insights }); setSource('llm') }
      else setError(j.error || 'Gagal memuat insight AI')
    } catch (e) { setError(String(e?.message || e)) }
    setLoading(false)
  }

  return (
    <section className="rounded-2xl bg-white border border-ink/[0.08] overflow-hidden" aria-label="Insight AI">
      <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-ink/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-signal-soft flex items-center justify-center"><Sparkles className="w-4 h-4 text-signal" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-ink">Apa artinya angka-angka ini</h3>
            <p className="text-[12.5px] text-ink-muted">{source === 'llm' ? 'Dianalisis oleh AI dari data periode ini' : 'Analisis otomatis berbasis aturan. Klik tombol untuk analisis AI yang lebih dalam.'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runLLM} disabled={loading} className="text-[13px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-signal text-white hover:bg-signal-deep disabled:opacity-60 font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Menganalisis…' : source === 'llm' ? 'Analisis ulang' : 'Analisis dengan AI'}
          </button>
          <button onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} className="text-[13px] text-ink-muted hover:text-ink inline-flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-ink/[0.04]">
            {expanded ? <><EyeOff className="w-3.5 h-3.5" /> Sembunyikan</> : <><Eye className="w-3.5 h-3.5" /> Tampilkan</>}
          </button>
        </div>
      </div>
      {error && <div className="px-5 py-2 text-[13px] text-alert bg-alert-soft">{error}</div>}
      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 divide-y lg:divide-y-0 divide-ink/[0.06]">
          <InsightBlock icon={CheckCircle2} title="Temuan utama" tone="growth" items={insights?.findings || []} />
          <InsightBlock icon={TrendingUp} title="Peluang" tone="signal" items={insights?.opportunities || []} />
          <InsightBlock icon={AlertTriangle} title="Perlu diwaspadai" tone="marigold" items={(insights?.risks?.length ? insights.risks : ['Tidak ada risiko signifikan pada periode ini.'])} />
          <InsightBlock icon={Target} title="Langkah yang disarankan" tone="ink" items={insights?.actions || []} />
          <InsightBlock icon={Lightbulb} title="Ide konten berikutnya" tone="signal" items={insights?.ideas || []} span={2} />
        </div>
      )}
    </section>
  )
}

function InsightBlock({ icon: Icon, title, tone, items, span=1 }) {
  const toneClass = { growth:'text-growth', signal:'text-signal', marigold:'text-marigold-deep', ink:'text-ink' }[tone]
  return (
    <div className={`p-5 ${span===2?'lg:col-span-2':''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${toneClass}`} aria-hidden="true" />
        <h4 className="text-[13.5px] font-bold text-ink">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="text-[13.5px] text-ink-soft leading-relaxed pl-3 border-l-2 border-ink/[0.08]">{it}</li>
        ))}
      </ul>
    </div>
  )
}

export function ScoreBadge({ score, category }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${category.bg} ${category.text} ring-1 ${category.ring}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: category.color }} />
      {score} · {category.label}
    </span>
  )
}

export function SectionHeader({ title, desc, right }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3">
      <div>
        <h2 className="text-[17px] font-bold text-ink">{title}</h2>
        {desc && <p className="text-[13.5px] text-ink-muted mt-0.5">{desc}</p>}
      </div>
      {right}
    </div>
  )
}

export function Card({ title, desc, children, right, className='' }) {
  return (
    <div className={`bg-white rounded-xl border border-ink/[0.08] p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            {title && <h3 className="text-[15px] font-bold text-ink">{title}</h3>}
            {desc && <p className="text-[12.5px] text-ink-muted mt-0.5">{desc}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

export function fmtShortDate(s) {
  if (!s) return ''
  const d = new Date(s); return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short' })
}
export function fmtLongDate(s) {
  const d = new Date(s); if (isNaN(d)) return s
  return d.toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })
}
export function fmtDuration(sec) {
  if (!sec) return '0d'; const m = Math.floor(sec/60), s = sec%60
  return `${m}m ${s}d`
}
export function colorOf(k) { return { instagram:'#E1306C', facebook:'#1877F2', youtube:'#FF0000', tiktok:'#0F1B3D', website:'#0EA5E9' }[k] || '#5B6785' }
export function labelOf(k) { return { instagram:'Instagram', facebook:'Facebook', youtube:'YouTube', tiktok:'TikTok', website:'Website' }[k] || k }
