'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  LayoutDashboard, BarChart3, Instagram, Facebook, Youtube, Music2, Globe,
  FileText, Users, Heart, MessageSquareText, Megaphone, Trophy, Lightbulb,
  FileBarChart, Settings, ChevronLeft, ChevronRight, RefreshCw, Calendar,
  ArrowUpRight, ArrowDownRight, Sparkles, ShieldCheck, TrendingUp, AlertTriangle,
  CheckCircle2, Target, Eye, EyeOff,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  getPlatforms, getAllSeries, sliceByDays, aggregate, pctChange,
  formatNumber, generateInsights,
} from '@/lib/mockData'

const MENU = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, active: true },
  { key: 'social', label: 'Social Media Performance', icon: BarChart3, active: true },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'youtube', label: 'YouTube', icon: Youtube },
  { key: 'tiktok', label: 'TikTok', icon: Music2 },
  { key: 'website', label: 'Website', icon: Globe },
  { key: 'content', label: 'Content Analytics', icon: FileText },
  { key: 'audience', label: 'Audience Analytics', icon: Users },
  { key: 'engagement', label: 'Engagement Analytics', icon: Heart },
  { key: 'sentiment', label: 'Sentiment Analysis', icon: MessageSquareText },
  { key: 'campaign', label: 'Campaign Performance', icon: Megaphone },
  { key: 'best', label: 'Best Performing Content', icon: Trophy },
  { key: 'recommend', label: 'Recommendations', icon: Lightbulb },
  { key: 'reports', label: 'Reports', icon: FileBarChart },
  { key: 'settings', label: 'Settings', icon: Settings },
]

function ytdDays() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.floor((now - start) / (1000*60*60*24)) + 1
}

const PERIODS = [
  { key: '1', label: 'Hari ini', days: 1 },
  { key: '7', label: '7 hari terakhir', days: 7 },
  { key: '30', label: '30 hari terakhir', days: 30 },
  { key: '90', label: '90 hari terakhir', days: 90 },
  { key: 'ytd', label: 'Tahun berjalan', days: ytdDays() },
]

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('overview')
  const [period, setPeriod] = useState('30')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => { setLastUpdated(new Date()) }, [])

  const periodDef = PERIODS.find(p => p.key === period) || PERIODS[2]
  const days = periodDef.days

  const platforms = getPlatforms()
  const allSeries = getAllSeries(Math.max(days * 2 + 5, 200))

  const { perPlatformCurr, perPlatformPrev, totalsCurr, totalsPrev, mergedDaily } = useMemo(() => {
    const perCurr = {}, perPrev = {}
    let mergedDaily = null
    platforms.forEach(p => {
      const s = allSeries[p.key]
      const curr = sliceByDays(s, days)
      const prev = s.slice(-days*2, -days)
      perCurr[p.key] = aggregate(curr)
      perPrev[p.key] = aggregate(prev.length ? prev : curr)
      if (!mergedDaily) {
        mergedDaily = curr.map(r => ({ date: r.date, reach: 0, engagement: 0, followers: 0, contentPublished: 0, views: 0, engagementRate: 0 }))
      }
      curr.forEach((r,i) => {
        mergedDaily[i].reach += r.reach
        mergedDaily[i].engagement += r.engagement
        mergedDaily[i].followers += r.followers
        mergedDaily[i].contentPublished += r.contentPublished
        mergedDaily[i].views += r.views
      })
    })
    mergedDaily && mergedDaily.forEach(r => { r.engagementRate = r.reach>0 ? +(r.engagement/r.reach*100).toFixed(2) : 0 })
    const sumField = (obj, f) => Object.values(obj).reduce((a,v)=>a+(v[f]||0),0)
    const totalsCurr = {
      followers: sumField(perCurr,'followers'),
      followerGrowth: sumField(perCurr,'followerGrowth'),
      reach: sumField(perCurr,'reach'),
      impressions: sumField(perCurr,'impressions'),
      engagement: sumField(perCurr,'engagement'),
      views: sumField(perCurr,'views'),
      contentPublished: sumField(perCurr,'contentPublished'),
      engagementRate: 0,
    }
    totalsCurr.engagementRate = totalsCurr.reach>0 ? +(totalsCurr.engagement/totalsCurr.reach*100).toFixed(2) : 0
    const totalsPrev = {
      followers: sumField(perPrev,'followers'),
      followerGrowth: sumField(perPrev,'followerGrowth'),
      reach: sumField(perPrev,'reach'),
      impressions: sumField(perPrev,'impressions'),
      engagement: sumField(perPrev,'engagement'),
      views: sumField(perPrev,'views'),
      contentPublished: sumField(perPrev,'contentPublished'),
      engagementRate: 0,
    }
    totalsPrev.engagementRate = totalsPrev.reach>0 ? +(totalsPrev.engagement/totalsPrev.reach*100).toFixed(2) : 0

    return { perPlatformCurr: perCurr, perPlatformPrev: perPrev, totalsCurr, totalsPrev, mergedDaily }
  }, [days, platforms, allSeries])

  const websiteVisitors = perPlatformCurr.website?.reach || 0
  const websiteEngagement = perPlatformCurr.website?.engagement || 0

  const insights = useMemo(() => generateInsights(totalsCurr, totalsPrev, perPlatformCurr),
    [totalsCurr, totalsPrev, perPlatformCurr])

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setLastUpdated(new Date()); setRefreshing(false) }, 900)
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={`${collapsed ? 'w-[76px]' : 'w-[268px]'} transition-all duration-300 shrink-0 bg-[#0B2545] text-slate-100 flex flex-col sticky top-0 h-screen`}>
        <div className="px-4 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 ring-1 ring-white/15">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-blue-200/80">Direktorat</div>
              <div className="text-sm font-semibold leading-tight truncate">Kursus &amp; Pelatihan</div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {MENU.map(m => {
            const Icon = m.icon
            const isActive = active === m.key
            const enabled = m.active
            return (
              <button
                key={m.key}
                onClick={() => enabled && setActive(m.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${isActive ? 'bg-blue-500/95 text-white shadow-lg shadow-blue-900/30' : 'text-slate-200/85 hover:bg-white/5'}
                  ${!enabled ? 'opacity-45 cursor-not-allowed' : ''}`}
                title={m.label}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="truncate text-left flex-1">{m.label}</span>}
                {!collapsed && !enabled && <span className="text-[9px] uppercase font-semibold text-blue-200/60">soon</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={() => setCollapsed(v => !v)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Ciutkan Menu</>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#1D4ED8] flex items-center justify-center ring-1 ring-slate-200 shadow-sm">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-[22px] leading-tight font-bold text-slate-900 tracking-tight">
                  Dashboard Media Sosial Direktorat Kursus dan Pelatihan
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Monitoring, Analisis, dan Evaluasi Komunikasi Digital &middot;{' '}
                  <span className="italic">Data-driven Communication for Education</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill />
              <div className="text-xs text-slate-500 hidden md:block">
                <div>Terakhir diperbarui</div>
                <div className="font-medium text-slate-700">
                  {lastUpdated ? lastUpdated.toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' }) : '—'}
                </div>
              </div>
              <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0B2545] text-white text-sm hover:bg-[#0e2f5c] transition">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {active === 'overview' ? 'Ringkasan Performa Digital' : 'Social Media Performance'}
              </h2>
              <p className="text-sm text-slate-500">
                {active === 'overview'
                  ? 'Ringkasan performa seluruh kanal komunikasi digital Direktorat.'
                  : 'Perbandingan performa antar platform: Instagram, Facebook, YouTube, TikTok, dan Website.'}
              </p>
            </div>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <MockDataBanner />

          {active === 'overview' && (
            <OverviewSection
              totalsCurr={totalsCurr} totalsPrev={totalsPrev}
              perPlatformCurr={perPlatformCurr} mergedDaily={mergedDaily}
              websiteVisitors={websiteVisitors} websiteEngagement={websiteEngagement}
              insights={insights}
            />
          )}

          {active === 'social' && (
            <SocialMediaSection
              platforms={platforms} perPlatformCurr={perPlatformCurr}
              perPlatformPrev={perPlatformPrev} allSeries={allSeries} days={days}
            />
          )}

          <footer className="pt-6 pb-2 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Direktorat Kursus dan Pelatihan — Kementerian Pendidikan Dasar dan Menengah
          </footer>
        </div>
      </main>
    </div>
  )
}

function StatusPill() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Connected · Mock Data
    </div>
  )
}

function MockDataBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-[13px] text-amber-800">
        Data yang ditampilkan menggunakan <strong>demo/mock data</strong> yang realistis (90+ hari). Hubungkan Instagram Graph API,
        Facebook Graph API, YouTube Data API, TikTok API, dan Google Analytics 4 untuk mendapatkan data aktual — tanpa mengubah desain dashboard.
      </p>
    </div>
  )
}

function PeriodFilter({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
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

function OverviewSection({ totalsCurr, totalsPrev, perPlatformCurr, mergedDaily, websiteVisitors, websiteEngagement, insights }) {
  const kpis = [
    { label: 'Total Followers', value: totalsCurr.followers, prev: totalsPrev.followers, spark: mergedDaily.map(r => r.followers), format: 'num' },
    { label: 'Follower Growth', value: totalsCurr.followerGrowth, prev: totalsPrev.followerGrowth, spark: mergedDaily.map(r => r.contentPublished*20+r.engagement/50), format: 'num', prefix: '+' },
    { label: 'Total Reach', value: totalsCurr.reach, prev: totalsPrev.reach, spark: mergedDaily.map(r => r.reach), format: 'num' },
    { label: 'Total Impressions', value: totalsCurr.impressions, prev: totalsPrev.impressions, spark: mergedDaily.map(r => r.reach*1.4), format: 'num' },
    { label: 'Total Engagement', value: totalsCurr.engagement, prev: totalsPrev.engagement, spark: mergedDaily.map(r => r.engagement), format: 'num' },
    { label: 'Engagement Rate', value: totalsCurr.engagementRate, prev: totalsPrev.engagementRate, spark: mergedDaily.map(r => r.engagementRate), format: 'pct' },
    { label: 'Total Video Views', value: totalsCurr.views, prev: totalsPrev.views, spark: mergedDaily.map(r => r.views), format: 'num' },
    { label: 'Content Published', value: totalsCurr.contentPublished, prev: totalsPrev.contentPublished, spark: mergedDaily.map(r => r.contentPublished), format: 'num' },
    { label: 'Website Visitors', value: websiteVisitors, prev: Math.round(websiteVisitors*0.92), spark: mergedDaily.map(r => r.reach*0.15), format: 'num' },
    { label: 'Website Engagement', value: websiteEngagement, prev: Math.round(websiteEngagement*0.9), spark: mergedDaily.map(r => r.engagement*0.15), format: 'num' },
  ]

  const platformShare = Object.entries(perPlatformCurr).map(([k,v]) => ({ name: labelOf(k), value: v.engagement, color: colorOf(k) }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Tren Reach &amp; Engagement</h3>
              <p className="text-xs text-slate-500 mt-0.5">Agregat seluruh platform per hari</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <LegendDot color="#1D4ED8" label="Reach" />
              <LegendDot color="#10B981" label="Engagement" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mergedDaily} margin={{ top:10, right:10, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="reachG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="engG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} />
              <YAxis tick={{ fontSize: 11, fill:'#64748B' }} tickFormatter={formatNumber} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="reach" stroke="#1D4ED8" strokeWidth={2} fill="url(#reachG)" />
              <Area type="monotone" dataKey="engagement" stroke="#10B981" strokeWidth={2} fill="url(#engG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Kontribusi Engagement per Platform</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">Distribusi engagement pada periode ini</p>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={platformShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {platformShare.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={formatNumber} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {platformShare.map(p => {
              const total = platformShare.reduce((a,x)=>a+x.value,0)
              const pct = total>0 ? Math.round(p.value/total*100) : 0
              return (
                <div key={p.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="flex-1 text-slate-600">{p.name}</span>
                  <span className="font-medium text-slate-800">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <AIInsightsPanel insights={insights} />
    </div>
  )
}

function SocialMediaSection({ platforms, perPlatformCurr, perPlatformPrev, allSeries, days }) {
  const growthData = useMemo(() => {
    const dates = sliceByDays(allSeries.instagram, days).map(r => r.date)
    return dates.map((d, i) => {
      const row = { date: d }
      platforms.forEach(p => {
        const s = sliceByDays(allSeries[p.key], days)
        row[p.key] = s[i]?.followers || 0
      })
      return row
    })
  }, [allSeries, days, platforms])

  const engagementBars = platforms.map(p => ({
    name: p.name,
    reach: perPlatformCurr[p.key].reach,
    engagement: perPlatformCurr[p.key].engagement,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Perbandingan Platform</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ringkasan performa seluruh kanal pada periode terpilih</p>
          </div>
          <div className="text-xs text-slate-500">Total {platforms.length} platform aktif</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-[11px] uppercase text-slate-500 tracking-wider">
              <tr>
                {['Platform','Followers','Growth','Reach','Impressions','Views','Likes','Comments','Shares','Saves','Eng. Rate','Konten'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platforms.map(p => {
                const v = perPlatformCurr[p.key]
                return (
                  <tr key={p.key} className="border-t border-slate-100 hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                        <div>
                          <div className="font-medium text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500">{p.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{formatNumber(v.followers)}</td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{formatNumber(v.followerGrowth)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.reach)}</td>
                    <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.impressions)}</td>
                    <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.views)}</td>
                    <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.likes)}</td>
                    <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.comments)}</td>
                    <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.shares)}</td>
                    <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.saves)}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                        {v.engagementRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{v.contentPublished}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Follower Growth Antar Platform</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">Perkembangan jumlah pengikut harian</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={22} />
              <YAxis tick={{ fontSize: 11, fill:'#64748B' }} tickFormatter={formatNumber} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {platforms.filter(p => p.key !== 'website').map(p => (
                <Line key={p.key} type="monotone" dataKey={p.key} name={p.name} stroke={p.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Reach vs Engagement</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">Perbandingan volume total per platform</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill:'#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill:'#64748B' }} tickFormatter={formatNumber} />
              <Tooltip content={<ChartTooltip formatter={formatNumber} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="reach" name="Reach" fill="#1D4ED8" radius={[6,6,0,0]} />
              <Bar dataKey="engagement" name="Engagement" fill="#10B981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-slate-900">Tren Publikasi Konten</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">Jumlah konten yang dipublikasikan per hari (seluruh platform)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sliceByDays(allSeries.instagram, days).map((r,i) => ({
              date: r.date,
              published: platforms.reduce((a,p)=>a+(sliceByDays(allSeries[p.key], days)[i]?.contentPublished||0),0),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} />
              <YAxis tick={{ fontSize: 11, fill:'#64748B' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="published" name="Konten Terbit" fill="#0B2545" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, prev, spark, format='num', prefix='' }) {
  const change = pctChange(value, prev)
  const up = change >= 0
  const displayValue = format === 'pct'
    ? `${value}%`
    : `${prefix}${formatNumber(value)}`
  const sparkId = label.replace(/\s+/g, '-')
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="text-[26px] font-bold text-slate-900 leading-none tracking-tight mt-1.5">{displayValue}</div>
      <div className="flex items-center justify-between mt-3">
        <div className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
          {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {up ? '+' : ''}{change}%
          <span className="text-[10px] text-slate-400 font-medium ml-1">vs prev</span>
        </div>
        <div className="w-[90px] h-[34px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark.map((v,i)=>({ i, v }))}>
              <defs>
                <linearGradient id={`sp-${sparkId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={up ? '#10B981' : '#EF4444'} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={up ? '#10B981' : '#EF4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={up ? '#10B981' : '#EF4444'} strokeWidth={1.6} fill={`url(#sp-${sparkId})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function AIInsightsPanel({ insights }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-[#0B2545] via-[#0B2545] to-[#123572] text-white shadow-lg overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/15">
            <Sparkles className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-blue-200/80 font-semibold">AI Communication Insights</div>
            <h3 className="text-lg font-semibold">Analisis Otomatis Performa Digital</h3>
          </div>
        </div>
        <button onClick={()=>setExpanded(v=>!v)} className="text-xs text-blue-100/80 hover:text-white inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">
          {expanded ? <><EyeOff className="w-3.5 h-3.5" /> Sembunyikan</> : <><Eye className="w-3.5 h-3.5" /> Tampilkan</>}
        </button>
      </div>
      {expanded && (
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <InsightBlock icon={CheckCircle2} title="Key Findings" tone="emerald" items={insights.findings} />
          <InsightBlock icon={TrendingUp} title="Opportunities" tone="blue" items={insights.opportunities} />
          <InsightBlock icon={AlertTriangle} title="Risks" tone="amber" items={insights.risks.length ? insights.risks : ['Tidak ada risiko signifikan pada periode ini.']} />
          <InsightBlock icon={Target} title="Recommended Actions" tone="cyan" items={insights.actions} />
          <InsightBlock icon={Lightbulb} title="Next Content Ideas" tone="violet" items={insights.ideas} span={2} />
        </div>
      )}
    </div>
  )
}

function InsightBlock({ icon: Icon, title, tone, items, span=1 }) {
  const toneClass = {
    emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    blue:    'bg-blue-500/15 text-blue-200 ring-blue-400/30',
    amber:   'bg-amber-500/15 text-amber-300 ring-amber-400/30',
    cyan:    'bg-cyan-500/15 text-cyan-200 ring-cyan-400/30',
    violet:  'bg-violet-500/15 text-violet-200 ring-violet-400/30',
  }[tone]
  return (
    <div className={`rounded-xl bg-white/5 ring-1 ring-white/10 p-4 ${span===2?'lg:col-span-2':''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${toneClass}`}>
          <Icon className="w-4 h-4" />
        </span>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="text-[13px] text-blue-50/90 leading-relaxed flex gap-2">
            <span className="text-blue-300 mt-1">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-600">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} /> {label}
    </span>
  )
}

function ChartTooltip({ active, payload, label, formatter = formatNumber }) {
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

function fmtShortDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}
function fmtLongDate(s) {
  const d = new Date(s)
  if (isNaN(d)) return s
  return d.toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })
}
function labelOf(k) { return { instagram:'Instagram', facebook:'Facebook', youtube:'YouTube', tiktok:'TikTok', website:'Website' }[k] || k }
function colorOf(k) { return { instagram:'#E1306C', facebook:'#1877F2', youtube:'#FF0000', tiktok:'#111827', website:'#0EA5E9' }[k] || '#334155' }
