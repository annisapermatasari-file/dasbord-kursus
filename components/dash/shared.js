'use client'
import { useState } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Calendar, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, Target, Lightbulb, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { formatNumber, pctChange } from '@/lib/mockData'

export const PERIODS = [
  { key:'1', label:'Hari ini', days:1 },
  { key:'7', label:'7 hari terakhir', days:7 },
  { key:'30', label:'30 hari terakhir', days:30 },
  { key:'90', label:'90 hari terakhir', days:90 },
  { key:'ytd', label:'Tahun berjalan', days: (() => { const n=new Date(); const s=new Date(n.getFullYear(),0,1); return Math.floor((n-s)/86400000)+1 })() },
]

export function PeriodFilter({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex-wrap">
      <div className="pl-2 pr-1 text-slate-400"><Calendar className="w-4 h-4" /></div>
      {PERIODS.map(p => (
        <button key={p.key} onClick={() => onChange(p.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
            ${value === p.key ? 'bg-[#0B2545] text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function MockDataBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-[13px] text-amber-800">
        Data menggunakan <strong>demo/mock data</strong> realistis (200 hari). Hubungkan Instagram/Facebook Graph API, YouTube Data API, TikTok API, dan Google Analytics 4 untuk data aktual.
      </p>
    </div>
  )
}

export function KpiCard({ label, value, prev, spark = [], format='num', prefix='', isLive=false }) {
  const change = pctChange(value, prev)
  const up = change >= 0
  const displayValue = format === 'pct' ? `${value}%` : format === 'time' ? fmtDuration(value) : `${prefix}${formatNumber(value)}`
  const id = label.replace(/[^a-z0-9]/gi,'-')
  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition ${isLive?'border-emerald-300 ring-1 ring-emerald-100':'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        {isLive && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 font-semibold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />Live</span>}
      </div>
      <div className="text-[24px] font-bold text-slate-900 leading-none tracking-tight mt-1.5">{displayValue}</div>
      <div className="flex items-center justify-between mt-3">
        <div className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
          {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {up ? '+' : ''}{change}%
          <span className="text-[10px] text-slate-400 font-medium ml-1">vs prev</span>
        </div>
        {spark.length > 1 && (
          <div className="w-[90px] h-[34px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark.map((v,i)=>({ i, v }))}>
                <defs>
                  <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={up ? '#10B981' : '#EF4444'} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={up ? '#10B981' : '#EF4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={up ? '#10B981' : '#EF4444'} strokeWidth={1.6} fill={`url(#sp-${id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export function ChartTooltip({ active, payload, label, formatter = formatNumber }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold text-slate-700 mb-1">{label && typeof label === 'string' ? fmtLongDate(label) : label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{formatter(p.value)}</span>
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
      const r = await fetch('/api/ai-insights', {
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
    <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-[#0B2545] via-[#0B2545] to-[#123572] text-white shadow-lg overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-white/10 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/15">
            <Sparkles className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-blue-200/80 font-semibold">AI Communication Insights</div>
            <h3 className="text-lg font-semibold">Analisis Otomatis {source==='llm' && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 ml-2 align-middle">LLM · Claude Sonnet 4.5</span>}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runLLM} disabled={loading} className="text-xs inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 disabled:opacity-60 font-medium">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Menganalisis…' : 'Generate AI Insight'}
          </button>
          <button onClick={()=>setExpanded(v=>!v)} className="text-xs text-blue-100/80 hover:text-white inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10">
            {expanded ? <><EyeOff className="w-3.5 h-3.5" /> Sembunyikan</> : <><Eye className="w-3.5 h-3.5" /> Tampilkan</>}
          </button>
        </div>
      </div>
      {error && <div className="px-5 py-2 text-xs text-amber-200 bg-amber-900/30">{error}</div>}
      {expanded && (
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <InsightBlock icon={CheckCircle2} title="Key Findings" tone="emerald" items={insights?.findings || []} />
          <InsightBlock icon={TrendingUp} title="Opportunities" tone="blue" items={insights?.opportunities || []} />
          <InsightBlock icon={AlertTriangle} title="Risks" tone="amber" items={(insights?.risks?.length ? insights.risks : ['Tidak ada risiko signifikan pada periode ini.'])} />
          <InsightBlock icon={Target} title="Recommended Actions" tone="cyan" items={insights?.actions || []} />
          <InsightBlock icon={Lightbulb} title="Next Content Ideas" tone="violet" items={insights?.ideas || []} span={2} />
        </div>
      )}
    </div>
  )
}

function InsightBlock({ icon: Icon, title, tone, items, span=1 }) {
  const toneClass = { emerald:'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30', blue:'bg-blue-500/15 text-blue-200 ring-blue-400/30', amber:'bg-amber-500/15 text-amber-300 ring-amber-400/30', cyan:'bg-cyan-500/15 text-cyan-200 ring-cyan-400/30', violet:'bg-violet-500/15 text-violet-200 ring-violet-400/30' }[tone]
  return (
    <div className={`rounded-xl bg-white/5 ring-1 ring-white/10 p-4 ${span===2?'lg:col-span-2':''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${toneClass}`}><Icon className="w-4 h-4" /></span>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="text-[13px] text-blue-50/90 leading-relaxed flex gap-2">
            <span className="text-blue-300 mt-1">•</span><span>{it}</span>
          </li>
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
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {desc && <p className="text-sm text-slate-500">{desc}</p>}
      </div>
      {right}
    </div>
  )
}

export function Card({ title, desc, children, right, className='' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
            {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
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
export function colorOf(k) { return { instagram:'#E1306C', facebook:'#1877F2', youtube:'#FF0000', tiktok:'#111827', website:'#0EA5E9' }[k] || '#334155' }
export function labelOf(k) { return { instagram:'Instagram', facebook:'Facebook', youtube:'YouTube', tiktok:'TikTok', website:'Website' }[k] || k }
