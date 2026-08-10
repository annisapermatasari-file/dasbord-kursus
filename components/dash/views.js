'use client'
import { useMemo, useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, RadialBarChart, RadialBar,
} from 'recharts'
import {
  ArrowUpRight, Trophy, TrendingUp, Users, Heart, Play, Clock, MousePointer, Eye,
  FileText, Printer, Download, Search, Filter, Award, CheckCircle2, XCircle, Rocket, Info, Settings as SettingsIcon,
  Instagram, Facebook, Youtube, Music2, Globe, Building2, ShieldCheck, ChevronRight, Sparkles,
} from 'lucide-react'
import {
  getPlatforms, findPlatform, getAllSeries, sliceByDays, aggregate, pctChange, formatNumber,
  generateContentItems, generateCampaignMetrics, generateSentiment, generateAudience, generateWebsite,
  generateInsights, performanceScore, scoreCategory, CAMPAIGNS,
} from '@/lib/mockData'
import {
  Card, ChartTooltip, KpiCard, ScoreBadge, SectionHeader, fmtShortDate, colorOf, labelOf, AIInsightsPanel,
} from './shared'

/* =========== OVERVIEW =========== */
export function OverviewView({ days }) {
  const platforms = getPlatforms()
  const allSeries = getAllSeries(Math.max(days*2+5, 200))
  const { perPlatformCurr, perPlatformPrev, totalsCurr, totalsPrev, mergedDaily } = useMemo(() => aggregatePeriod(platforms, allSeries, days), [days, platforms, allSeries])
  const insights = useMemo(() => generateInsights(totalsCurr, totalsPrev, perPlatformCurr), [totalsCurr, totalsPrev, perPlatformCurr])
  const websiteVisitors = perPlatformCurr.website?.reach || 0
  const websiteEngagement = perPlatformCurr.website?.engagement || 0

  const kpis = [
    { label:'Total Followers', value: totalsCurr.followers, prev: totalsPrev.followers, spark: mergedDaily.map(r=>r.followers) },
    { label:'Follower Growth', value: totalsCurr.followerGrowth, prev: totalsPrev.followerGrowth, spark: mergedDaily.map(r=>r.engagement/50), prefix:'+' },
    { label:'Total Reach', value: totalsCurr.reach, prev: totalsPrev.reach, spark: mergedDaily.map(r=>r.reach) },
    { label:'Total Impressions', value: totalsCurr.impressions || Math.round(totalsCurr.reach*1.4), prev: totalsPrev.impressions || Math.round(totalsPrev.reach*1.4), spark: mergedDaily.map(r=>r.reach*1.4) },
    { label:'Total Engagement', value: totalsCurr.engagement, prev: totalsPrev.engagement, spark: mergedDaily.map(r=>r.engagement) },
    { label:'Engagement Rate', value: totalsCurr.engagementRate, prev: totalsPrev.engagementRate, spark: mergedDaily.map(r=>r.engagementRate), format:'pct' },
    { label:'Total Video Views', value: totalsCurr.views, prev: totalsPrev.views, spark: mergedDaily.map(r=>r.views) },
    { label:'Content Published', value: totalsCurr.contentPublished, prev: totalsPrev.contentPublished, spark: mergedDaily.map(r=>r.contentPublished) },
    { label:'Website Visitors', value: websiteVisitors, prev: Math.round(websiteVisitors*0.92), spark: mergedDaily.map(r=>r.reach*0.15) },
    { label:'Website Engagement', value: websiteEngagement, prev: Math.round(websiteEngagement*0.9), spark: mergedDaily.map(r=>r.engagement*0.15) },
  ]
  const platformShare = Object.entries(perPlatformCurr).map(([k,v]) => ({ name: labelOf(k), value: v.engagement, color: colorOf(k) }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Tren Reach & Engagement" desc="Agregat seluruh platform per hari" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mergedDaily} margin={{ top:10, right:10, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="reachG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.35} /><stop offset="100%" stopColor="#1D4ED8" stopOpacity={0} /></linearGradient>
                <linearGradient id="engG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} />
              <YAxis tick={{ fontSize: 11, fill:'#64748B' }} tickFormatter={formatNumber} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" name="Reach" dataKey="reach" stroke="#1D4ED8" strokeWidth={2} fill="url(#reachG)" />
              <Area type="monotone" name="Engagement" dataKey="engagement" stroke="#10B981" strokeWidth={2} fill="url(#engG)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Kontribusi Engagement per Platform" desc="Distribusi engagement pada periode ini">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={platformShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {platformShare.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {platformShare.map(p => {
              const total = platformShare.reduce((a,x)=>a+x.value,0)
              const pct = total>0 ? Math.round(p.value/total*100) : 0
              return <div key={p.name} className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background:p.color }} /><span className="flex-1 text-slate-600">{p.name}</span><span className="font-medium text-slate-800">{pct}%</span></div>
            })}
          </div>
        </Card>
      </div>
      <AIInsightsPanel scope="overview" context={{ periode_hari: days, total: totalsCurr, sebelumnya: totalsPrev, per_platform: perPlatformCurr }} fallback={insights} />
    </div>
  )
}

function aggregatePeriod(platforms, allSeries, days) {
  const perCurr = {}, perPrev = {}
  let mergedDaily = null
  platforms.forEach(p => {
    const s = allSeries[p.key]
    const curr = sliceByDays(s, days); const prev = s.slice(-days*2, -days)
    perCurr[p.key] = aggregate(curr); perPrev[p.key] = aggregate(prev.length ? prev : curr)
    if (!mergedDaily) mergedDaily = curr.map(r => ({ date: r.date, reach:0, engagement:0, followers:0, contentPublished:0, views:0 }))
    curr.forEach((r,i) => { mergedDaily[i].reach += r.reach; mergedDaily[i].engagement += r.engagement; mergedDaily[i].followers += r.followers; mergedDaily[i].contentPublished += r.contentPublished; mergedDaily[i].views += r.views })
  })
  const sumField = (o,f)=>Object.values(o).reduce((a,v)=>a+(v[f]||0),0)
  const t = k => ({
    followers: sumField(k,'followers'), followerGrowth: sumField(k,'followerGrowth'),
    reach: sumField(k,'reach'), impressions: sumField(k,'impressions'),
    engagement: sumField(k,'engagement'), views: sumField(k,'views'),
    contentPublished: sumField(k,'contentPublished'),
    engagementRate: sumField(k,'reach')>0 ? +(sumField(k,'engagement')/sumField(k,'reach')*100).toFixed(2) : 0,
  })
  return { perPlatformCurr: perCurr, perPlatformPrev: perPrev, totalsCurr: t(perCurr), totalsPrev: t(perPrev), mergedDaily }
}

/* =========== SOCIAL MEDIA =========== */
export function SocialMediaView({ days }) {
  const platforms = getPlatforms()
  const allSeries = getAllSeries(Math.max(days*2+5, 200))
  const { perPlatformCurr } = useMemo(() => aggregatePeriod(platforms, allSeries, days), [days, platforms, allSeries])
  const growthData = useMemo(() => {
    const dates = sliceByDays(allSeries.instagram, days).map(r => r.date)
    return dates.map((d, i) => { const row = { date: d }; platforms.forEach(p => { row[p.key] = sliceByDays(allSeries[p.key], days)[i]?.followers || 0 }); return row })
  }, [allSeries, days, platforms])
  const bars = platforms.map(p => ({ name: p.name, reach: perPlatformCurr[p.key].reach, engagement: perPlatformCurr[p.key].engagement }))
  return (
    <div className="space-y-6">
      <Card title="Perbandingan Platform" desc="Ringkasan performa seluruh kanal" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-[11px] uppercase text-slate-500 tracking-wider">
              <tr>{['Platform','Followers','Growth','Reach','Impressions','Views','Likes','Comments','Shares','Saves','Eng. Rate','Konten'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {platforms.map(p => { const v = perPlatformCurr[p.key]; return (
                <tr key={p.key} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background:p.color }} /><div><div className="font-medium text-slate-900">{p.name}</div><div className="text-[11px] text-slate-500">{p.handle}</div></div></div></td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{formatNumber(v.followers)}</td>
                  <td className="px-4 py-3.5"><div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><ArrowUpRight className="w-3.5 h-3.5" />+{formatNumber(v.followerGrowth)}</div></td>
                  <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.reach)}</td><td className="px-4 py-3.5 text-slate-700">{formatNumber(v.impressions)}</td>
                  <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.views)}</td><td className="px-4 py-3.5 text-slate-700">{formatNumber(v.likes)}</td>
                  <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.comments)}</td><td className="px-4 py-3.5 text-slate-700">{formatNumber(v.shares)}</td>
                  <td className="px-4 py-3.5 text-slate-700">{formatNumber(v.saves)}</td>
                  <td className="px-4 py-3.5"><span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">{v.engagementRate}%</span></td>
                  <td className="px-4 py-3.5 text-slate-700">{v.contentPublished}</td>
                </tr>) })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Follower Growth Antar Platform" desc="Perkembangan jumlah pengikut harian">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={22} />
              <YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} /><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize:12 }} />
              {platforms.filter(p=>p.key!=='website').map(p => <Line key={p.key} type="monotone" dataKey={p.key} name={p.name} stroke={p.color} strokeWidth={2} dot={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Reach vs Engagement" desc="Perbandingan volume total per platform">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:12, fill:'#64748B' }} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} />
              <Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize:12 }} />
              <Bar dataKey="reach" name="Reach" fill="#1D4ED8" radius={[6,6,0,0]} /><Bar dataKey="engagement" name="Engagement" fill="#10B981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

/* =========== PLATFORM DETAIL (IG/FB/YT/TT) =========== */
export function PlatformDetailView({ platformKey, days }) {
  const platform = findPlatform(platformKey)
  const allSeries = getAllSeries(Math.max(days*2+5, 200))
  const s = allSeries[platformKey]
  const curr = sliceByDays(s, days); const prev = s.slice(-days*2, -days)
  const cAgg = aggregate(curr); const pAgg = aggregate(prev.length ? prev : curr)
  const contentItems = useMemo(() => generateContentItems(days).filter(c => c.platform === platformKey), [platformKey, days])
  const top = [...contentItems].sort((a,b)=>b.score - a.score).slice(0, 5)
  const worst = [...contentItems].sort((a,b)=>a.score - b.score).slice(0, 3)
  const kpiMap = {
    instagram: [
      { label:'Followers', value: cAgg.followers, prev: pAgg.followers, spark: curr.map(r=>r.followers) },
      { label:'Follower Growth', value: cAgg.followerGrowth, prev: pAgg.followerGrowth, prefix:'+' },
      { label:'Posts', value: cAgg.contentPublished, prev: pAgg.contentPublished, spark: curr.map(r=>r.contentPublished) },
      { label:'Reach', value: cAgg.reach, prev: pAgg.reach, spark: curr.map(r=>r.reach) },
      { label:'Impressions', value: cAgg.impressions, prev: pAgg.impressions, spark: curr.map(r=>r.impressions) },
      { label:'Profile Visits', value: Math.round(cAgg.reach*0.045), prev: Math.round(pAgg.reach*0.045) },
      { label:'Website Clicks', value: Math.round(cAgg.reach*0.012), prev: Math.round(pAgg.reach*0.012) },
      { label:'Likes', value: cAgg.likes, prev: pAgg.likes, spark: curr.map(r=>r.likes) },
      { label:'Comments', value: cAgg.comments, prev: pAgg.comments },
      { label:'Shares', value: cAgg.shares, prev: pAgg.shares },
      { label:'Saves', value: cAgg.saves, prev: pAgg.saves },
      { label:'Engagement Rate', value: cAgg.engagementRate, prev: pAgg.engagementRate, format:'pct' },
    ],
    facebook: [
      { label:'Page Followers', value: cAgg.followers, prev: pAgg.followers, spark: curr.map(r=>r.followers) },
      { label:'Follower Growth', value: cAgg.followerGrowth, prev: pAgg.followerGrowth, prefix:'+' },
      { label:'Reach', value: cAgg.reach, prev: pAgg.reach, spark: curr.map(r=>r.reach) },
      { label:'Impressions', value: cAgg.impressions, prev: pAgg.impressions },
      { label:'Post Engagement', value: cAgg.engagement, prev: pAgg.engagement, spark: curr.map(r=>r.engagement) },
      { label:'Likes', value: cAgg.likes, prev: pAgg.likes },
      { label:'Comments', value: cAgg.comments, prev: pAgg.comments },
      { label:'Shares', value: cAgg.shares, prev: pAgg.shares },
      { label:'Video Views', value: cAgg.views, prev: pAgg.views, spark: curr.map(r=>r.views) },
      { label:'Link Clicks', value: Math.round(cAgg.reach*0.021), prev: Math.round(pAgg.reach*0.021) },
      { label:'Engagement Rate', value: cAgg.engagementRate, prev: pAgg.engagementRate, format:'pct' },
    ],
    youtube: [
      { label:'Subscribers', value: cAgg.followers, prev: pAgg.followers, spark: curr.map(r=>r.followers) },
      { label:'Subscriber Growth', value: cAgg.followerGrowth, prev: pAgg.followerGrowth, prefix:'+' },
      { label:'Views', value: cAgg.views, prev: pAgg.views, spark: curr.map(r=>r.views) },
      { label:'Watch Time (menit)', value: Math.round(cAgg.views*3.4), prev: Math.round(pAgg.views*3.4) },
      { label:'Avg View Duration (dt)', value: 214, prev: 198, format:'time' },
      { label:'Likes', value: cAgg.likes, prev: pAgg.likes },
      { label:'Comments', value: cAgg.comments, prev: pAgg.comments },
      { label:'Shares', value: cAgg.shares, prev: pAgg.shares },
      { label:'Impressions', value: cAgg.impressions, prev: pAgg.impressions },
      { label:'CTR', value: +(cAgg.views/cAgg.impressions*100||0).toFixed(2), prev: +(pAgg.views/pAgg.impressions*100||0).toFixed(2), format:'pct' },
      { label:'Videos Published', value: cAgg.contentPublished, prev: pAgg.contentPublished },
    ],
    tiktok: [
      { label:'Followers', value: cAgg.followers, prev: pAgg.followers, spark: curr.map(r=>r.followers) },
      { label:'Follower Growth', value: cAgg.followerGrowth, prev: pAgg.followerGrowth, prefix:'+' },
      { label:'Video Views', value: cAgg.views, prev: pAgg.views, spark: curr.map(r=>r.views) },
      { label:'Likes', value: cAgg.likes, prev: pAgg.likes, spark: curr.map(r=>r.likes) },
      { label:'Comments', value: cAgg.comments, prev: pAgg.comments },
      { label:'Shares', value: cAgg.shares, prev: pAgg.shares },
      { label:'Saves', value: cAgg.saves, prev: pAgg.saves },
      { label:'Profile Views', value: Math.round(cAgg.reach*0.038), prev: Math.round(pAgg.reach*0.038) },
      { label:'Engagement Rate', value: cAgg.engagementRate, prev: pAgg.engagementRate, format:'pct' },
    ],
  }
  const icons = { instagram: Instagram, facebook: Facebook, youtube: Youtube, tiktok: Music2 }
  const Icon = icons[platformKey] || Sparkles
  const kpis = kpiMap[platformKey]
  const insights = generateInsights(cAgg, pAgg, { [platformKey]: cAgg })
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: platform.color+'18', color: platform.color }}><Icon className="w-7 h-7" /></div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">Akun {platform.name}</div>
          <div className="text-lg font-bold text-slate-900">{platform.handle}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{kpis.map(k => <KpiCard key={k.label} {...k} />)}</div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Reach & Engagement Trend" desc="Perkembangan harian">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={curr}>
              <defs><linearGradient id={`re-${platformKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={platform.color} stopOpacity={0.35} /><stop offset="100%" stopColor={platform.color} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} /><Tooltip content={<ChartTooltip />} />
              <Area type="monotone" name="Reach" dataKey="reach" stroke={platform.color} strokeWidth={2} fill={`url(#re-${platformKey})`} />
              <Line type="monotone" name="Engagement" dataKey="engagement" stroke="#10B981" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Follower Growth" desc="Perkembangan pengikut">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={curr}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} /><Tooltip content={<ChartTooltip />} /><Line type="monotone" name="Followers" dataKey="followers" stroke={platform.color} strokeWidth={2.4} dot={false} /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Posting Frequency" desc="Jumlah konten per hari">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={curr}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="contentPublished" name="Konten" fill={platform.color} radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Top Performing Content" desc="5 konten dengan skor tertinggi">
          <div className="space-y-2.5">
            {top.map((c,i) => { const cat = scoreCategory(c.score); return (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">#{i+1}</div>
                <div className="min-w-0 flex-1"><div className="text-sm font-medium text-slate-800 truncate">{c.title}</div><div className="text-[11px] text-slate-500">{c.type} · {c.topic} · {formatNumber(c.reach)} reach · {c.engagementRate}%</div></div>
                <ScoreBadge score={c.score} category={cat} />
              </div>) })}
          </div>
        </Card>
        {platformKey === 'youtube' && (
          <Card title="Worst Performing Videos" desc="Perlu perbaikan konten/thumbnail/judul" className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {worst.map(c => { const cat = scoreCategory(c.score); return (
                <div key={c.id} className="rounded-xl border border-red-100 bg-red-50/40 p-3">
                  <div className="text-xs text-slate-500">{c.type} · {c.topic}</div>
                  <div className="text-sm font-medium text-slate-800 mt-1">{c.title}</div>
                  <div className="text-xs text-slate-500 mt-2">Reach {formatNumber(c.reach)} · Views {formatNumber(c.views)}</div>
                  <div className="mt-2"><ScoreBadge score={c.score} category={cat} /></div>
                </div>) })}
            </div>
          </Card>
        )}
      </div>
      <AIInsightsPanel scope={platformKey} context={{ platform: platform.name, handle: platform.handle, periode_hari: days, ringkasan: cAgg, sebelumnya: pAgg, top_konten: top.map(t=>({title:t.title,type:t.type,topic:t.topic,score:t.score,engagementRate:t.engagementRate})) }} fallback={insights} />
    </div>
  )
}

/* =========== WEBSITE =========== */
export function WebsiteView({ days }) {
  const w = useMemo(() => generateWebsite(days), [days])
  const wPrev = useMemo(() => generateWebsite(Math.max(days,7)), [days])
  const kpis = [
    { label:'Users', value: w.totals.users, prev: Math.round(w.totals.users*0.92), spark: w.trend.map(r=>r.users) },
    { label:'New Users', value: w.totals.newUsers, prev: Math.round(w.totals.newUsers*0.9), spark: w.trend.map(r=>r.newUsers) },
    { label:'Sessions', value: w.totals.sessions, prev: Math.round(w.totals.sessions*0.94), spark: w.trend.map(r=>r.sessions) },
    { label:'Page Views', value: w.totals.pageViews, prev: Math.round(w.totals.pageViews*0.93), spark: w.trend.map(r=>r.pageViews) },
    { label:'Avg Session (dt)', value: w.totals.avgDuration, prev: w.totals.avgDuration-8, format:'time' },
    { label:'Bounce Rate', value: w.totals.bounce, prev: w.totals.bounce+1.4, format:'pct' },
  ]
  const insights = { findings:[`Total pengunjung ${formatNumber(w.totals.users)} pada periode ini.`,`Halaman paling dikunjungi: ${w.topPages[0].title} (${formatNumber(w.topPages[0].views)} views).`], opportunities:['Sumber sosial menyumbang 24% traffic — kolaborasi cross-posting dari Instagram/TikTok dapat digandakan.'], risks:[w.totals.bounce>50?`Bounce rate ${w.totals.bounce}% relatif tinggi — audit CTA landing page.`:'Bounce rate dalam batas wajar.'], actions:['Optimasi SEO halaman pendaftaran (15% traffic).','Buat landing page khusus per campaign.'], ideas:['Artikel SEO: "Cara Memilih Kursus Bersertifikasi BNSP".'] }
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600"><Globe className="w-7 h-7" /></div>
        <div><div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">Website Resmi</div><div className="text-lg font-bold text-slate-900">kursus.kemendikdasmen.go.id</div></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">{kpis.map(k => <KpiCard key={k.label} {...k} />)}</div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Traffic Trend" desc="Pengunjung harian" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={w.trend}><defs><linearGradient id="wtG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.35} /><stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" name="Users" dataKey="users" stroke="#0EA5E9" strokeWidth={2} fill="url(#wtG)" /><Line type="monotone" name="Sessions" dataKey="sessions" stroke="#1D4ED8" strokeWidth={2} dot={false} /></AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Traffic Sources" desc="Distribusi sumber pengunjung">
          <ResponsiveContainer width="100%" height={230}><PieChart><Pie data={w.sources} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>{w.sources.map((e,i)=><Cell key={i} fill={['#1D4ED8','#0EA5E9','#10B981','#F59E0B','#8B5CF6','#EF4444'][i%6]} />)}</Pie><Tooltip content={<ChartTooltip formatter={v=>v+'%'} />} /></PieChart></ResponsiveContainer>
          <div className="space-y-1.5 mt-2">{w.sources.map((p,i)=><div key={p.name} className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background:['#1D4ED8','#0EA5E9','#10B981','#F59E0B','#8B5CF6','#EF4444'][i%6] }} /><span className="flex-1 text-slate-600">{p.name}</span><span className="font-medium text-slate-800">{p.value}%</span></div>)}</div>
        </Card>
        <Card title="Top Pages" desc="Halaman paling dikunjungi" className="xl:col-span-2">
          <div className="space-y-1.5">{w.topPages.map((p,i)=>(<div key={p.path} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50"><div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">#{i+1}</div><div className="min-w-0 flex-1"><div className="text-sm font-medium text-slate-800 truncate">{p.title}</div><div className="text-[11px] text-slate-500 font-mono">{p.path}</div></div><div className="text-sm font-semibold text-slate-800">{formatNumber(p.views)}</div></div>))}</div>
        </Card>
        <Card title="Social Referral" desc="Traffic dari sosial media">
          <ResponsiveContainer width="100%" height={230}><BarChart data={w.socialRef} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" horizontal={false} /><XAxis type="number" tick={{ fontSize:11, fill:'#64748B' }} /><YAxis dataKey="name" type="category" tick={{ fontSize:12, fill:'#64748B' }} width={80} /><Tooltip content={<ChartTooltip formatter={v=>v+'%'} />} /><Bar dataKey="value" name="Share (%)" fill="#0EA5E9" radius={[0,6,6,0]} /></BarChart></ResponsiveContainer>
        </Card>
      </div>
      <AIInsightsPanel scope="website" context={{ periode_hari: days, totals: w.totals, top_pages: w.topPages.slice(0,5), sources: w.sources, social_referral: w.socialRef }} fallback={insights} />
    </div>
  )
}

/* =========== CONTENT ANALYTICS =========== */
export function ContentView({ days }) {
  const items = useMemo(() => generateContentItems(days), [days])
  const [q, setQ] = useState(''); const [plat, setPlat] = useState('all'); const [type, setType] = useState('all'); const [topic, setTopic] = useState('all')
  const filtered = items.filter(c => (plat==='all'||c.platform===plat) && (type==='all'||c.type===type) && (topic==='all'||c.topic===topic) && (!q || c.title.toLowerCase().includes(q.toLowerCase())))
  const uniqueTypes = [...new Set(items.map(i=>i.type))]
  const uniqueTopics = [...new Set(items.map(i=>i.topic))]
  const top10 = [...filtered].sort((a,b)=>b.score-a.score).slice(0,10)
  const bot10 = [...filtered].sort((a,b)=>a.score-b.score).slice(0,10)
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari judul konten..." className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-200" /></div>
          <Select label="Platform" value={plat} onChange={setPlat} options={[{v:'all',l:'Semua Platform'},...getPlatforms().filter(p=>p.key!=='website').map(p=>({v:p.key,l:p.name}))]} />
          <Select label="Tipe" value={type} onChange={setType} options={[{v:'all',l:'Semua Tipe'},...uniqueTypes.map(t=>({v:t,l:t}))]} />
          <Select label="Topik" value={topic} onChange={setTopic} options={[{v:'all',l:'Semua Topik'},...uniqueTopics.map(t=>({v:t,l:t}))]} />
          <div className="ml-auto text-xs text-slate-500">{filtered.length} konten</div>
        </div>
      </Card>
      <Card title="Daftar Konten" desc="Semua konten pada periode ini" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-[11px] uppercase text-slate-500 tracking-wider sticky top-0"><tr>{['Tanggal','Platform','Judul','Tipe','Topik','Reach','Views','Eng.','Eng.Rate','Skor'].map(h=><th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{filtered.slice(0,80).map(c=>{ const cat = scoreCategory(c.score); return (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-4 py-2.5 text-slate-600 text-xs">{c.date}</td><td className="px-4 py-2.5"><span className="inline-flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full" style={{ background:c.platformColor }} />{c.platformName}</span></td><td className="px-4 py-2.5 max-w-md"><div className="text-slate-800 font-medium truncate">{c.title}</div>{c.campaign&&<div className="text-[10px] text-blue-600 mt-0.5">📢 {c.campaign}</div>}</td><td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{c.type}</span></td><td className="px-4 py-2.5 text-xs text-slate-600">{c.topic}</td><td className="px-4 py-2.5 text-slate-700">{formatNumber(c.reach)}</td><td className="px-4 py-2.5 text-slate-700">{formatNumber(c.views)}</td><td className="px-4 py-2.5 text-slate-700">{formatNumber(c.engagement)}</td><td className="px-4 py-2.5 text-slate-700">{c.engagementRate}%</td><td className="px-4 py-2.5"><ScoreBadge score={c.score} category={cat} /></td></tr>)})}</tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ContentList title="🏆 Top 10 Content" items={top10} />
        <ContentList title="⚠️ Bottom 10 Content" items={bot10} />
      </div>
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return <select value={value} onChange={e=>onChange(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" aria-label={label}>{options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>
}

function ContentList({ title, items }) {
  return <Card title={title}><div className="space-y-2">{items.map((c,i)=>{ const cat = scoreCategory(c.score); return (<div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50"><div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">#{i+1}</div><div className="min-w-0 flex-1"><div className="text-sm font-medium text-slate-800 truncate">{c.title}</div><div className="text-[11px] text-slate-500">{c.platformName} · {c.type} · {formatNumber(c.reach)} reach · {c.engagementRate}%</div></div><ScoreBadge score={c.score} category={cat} /></div>)})}</div></Card>
}

/* =========== AUDIENCE =========== */
export function AudienceView() {
  const a = generateAudience()
  const COLORS = ['#1D4ED8','#0EA5E9','#10B981','#F59E0B','#8B5CF6','#EF4444','#EC4899','#14B8A6','#64748B']
  const insights = { findings:['Audiens dominan pada rentang 18-34 tahun (72%) — target Gen Z & Milenial.','Perempuan mendominasi 57% audiens.','DKI Jakarta & Jawa Barat menyumbang 40% audiens.'], opportunities:['Konten karier & sertifikasi profesi cocok untuk kelompok 25-34.','Wilayah timur Indonesia berpotensi ditingkatkan dengan konten geo-lokal.'], risks:['Segmen 45+ hanya 7% — perlu adaptasi format bagi pemangku kepentingan senior.'], actions:['Jadwal posting utama pada 19.00-21.00 WIB (peak activity).','Kembangkan konten multi-bahasa daerah untuk perluas jangkauan.'], ideas:['Series "Alumni Inspiratif" per provinsi.','Konten profesi berbasis Peta Jalan Karier 25-34 tahun.'] }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card title="Distribusi Usia" desc="Persentase audiens per rentang usia"><ResponsiveContainer width="100%" height={220}><BarChart data={a.age}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="name" tick={{ fontSize:11, fill:'#64748B' }} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={v=>v+'%'} /><Tooltip content={<ChartTooltip formatter={v=>v+'%'} />} /><Bar dataKey="value" name="Audiens" fill="#1D4ED8" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></Card>
        <Card title="Distribusi Gender" desc="Persentase berdasarkan gender"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={a.gender} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>{a.gender.map((_,i)=><Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip content={<ChartTooltip formatter={v=>v+'%'} />} /></PieChart></ResponsiveContainer><div className="space-y-1 mt-2">{a.gender.map((g,i)=><div key={g.name} className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background:COLORS[i] }} /><span className="flex-1 text-slate-600">{g.name}</span><span className="font-medium text-slate-800">{g.value}%</span></div>)}</div></Card>
        <Card title="Lokasi Teratas" desc="Distribusi geografis"><ResponsiveContainer width="100%" height={220}><BarChart data={a.location} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" horizontal={false} /><XAxis type="number" tick={{ fontSize:10, fill:'#64748B' }} tickFormatter={v=>v+'%'} /><YAxis dataKey="name" type="category" tick={{ fontSize:10, fill:'#64748B' }} width={100} /><Tooltip content={<ChartTooltip formatter={v=>v+'%'} />} /><Bar dataKey="value" name="Audiens" fill="#0EA5E9" radius={[0,6,6,0]} /></BarChart></ResponsiveContainer></Card>
        <Card title="Jam Aktif Audiens" desc="Rata-rata aktivitas per jam (WIB)"><ResponsiveContainer width="100%" height={220}><AreaChart data={a.activeHours}><defs><linearGradient id="ah" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="hour" tick={{ fontSize:9, fill:'#64748B' }} interval={2} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" name="Aktivitas" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#ah)" /></AreaChart></ResponsiveContainer></Card>
      </div>
      <Card title="Minat Audiens" desc="Topik yang paling relevan"><div className="flex flex-wrap gap-2">{a.interests.map(i=><span key={i} className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">{i}</span>)}</div></Card>
      <AIInsightsPanel scope="audience" context={a} fallback={insights} />
    </div>
  )
}

/* =========== SENTIMENT =========== */
export function SentimentView({ days }) {
  const s = useMemo(() => generateSentiment(Math.min(days,60)), [days])
  const COLORS = { positive:'#10B981', neutral:'#64748B', negative:'#EF4444' }
  const insights = { findings:[`Total ${formatNumber(s.total)} komentar dianalisis. Sentimen positif dominan ${s.positivePct}%.`,`Sentimen negatif ${s.negativePct}% — terutama seputar pendaftaran dan verifikasi.`], opportunities:['Sentimen positif tinggi pada kisah alumni — konten testimonial layak diperbanyak.'], risks:[`Sentimen negatif ${s.negativePct}% berpusat pada "Layanan Pengaduan" dan "Pendaftaran" — perlu SOP respons.`], actions:['Buat FAQ pendaftaran yang lebih jelas dan cepat.','Percepat verifikasi peserta dan komunikasikan status secara berkala.'], ideas:['Konten "Behind the Scene: Tim Layanan Peserta" untuk humanisasi.'] }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Komentar" value={s.total} prev={Math.round(s.total*0.92)} />
        <KpiCard label="Positive" value={s.positivePct} prev={s.positivePct-1.5} format="pct" />
        <KpiCard label="Neutral" value={s.neutralPct} prev={s.neutralPct+0.4} format="pct" />
        <KpiCard label="Negative" value={s.negativePct} prev={s.negativePct-0.8} format="pct" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Sentiment Trend" desc="Perkembangan harian" className="xl:col-span-2"><ResponsiveContainer width="100%" height={280}><AreaChart data={s.trend}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} /><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize:12 }} /><Area type="monotone" name="Positive" dataKey="positive" stackId="1" stroke={COLORS.positive} fill={COLORS.positive} fillOpacity={0.7} /><Area type="monotone" name="Neutral" dataKey="neutral" stackId="1" stroke={COLORS.neutral} fill={COLORS.neutral} fillOpacity={0.6} /><Area type="monotone" name="Negative" dataKey="negative" stackId="1" stroke={COLORS.negative} fill={COLORS.negative} fillOpacity={0.7} /></AreaChart></ResponsiveContainer></Card>
        <Card title="Topik Yang Sering Muncul" desc="Frekuensi topik dalam komentar"><div className="space-y-2">{s.topics.map((t,i)=>(<div key={t.name} className="flex items-center gap-3"><div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-700 text-[11px] font-bold">{i+1}</div><div className="flex-1"><div className="flex items-center justify-between mb-1"><span className="text-xs text-slate-700">{t.name}</span><span className="text-xs font-semibold text-slate-800">{t.count}</span></div><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: (t.count/s.topics[0].count*100)+'%' }} /></div></div></div>))}</div></Card>
        <Card title="💚 Most Positive Comments"><div className="space-y-2">{s.samples.positive.slice(0,5).map((c,i)=><div key={i} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700">“{c}”</div>)}</div></Card>
        <Card title="⚠️ Potential Issues"><div className="space-y-2">{s.samples.negative.slice(0,5).map((c,i)=><div key={i} className="p-2.5 rounded-lg bg-red-50/60 border border-red-100 text-xs text-slate-700">“{c}”</div>)}</div></Card>
        <Card title="💬 Pertanyaan Publik"><div className="space-y-2">{s.samples.neutral.slice(0,5).map((c,i)=><div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">“{c}”</div>)}</div></Card>
      </div>
      <AIInsightsPanel scope="sentiment" context={s} fallback={insights} />
    </div>
  )
}

/* =========== ENGAGEMENT =========== */
export function EngagementView({ days }) {
  const platforms = getPlatforms()
  const allSeries = getAllSeries(Math.max(days*2+5, 200))
  const { perPlatformCurr, mergedDaily } = useMemo(() => aggregatePeriod(platforms, allSeries, days), [days, platforms, allSeries])
  const composition = platforms.map(p => ({ name: p.name, likes: perPlatformCurr[p.key].likes, comments: perPlatformCurr[p.key].comments, shares: perPlatformCurr[p.key].shares, saves: perPlatformCurr[p.key].saves }))
  const totalEng = Object.values(perPlatformCurr).reduce((a,v)=>a+v.engagement,0)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Engagement" value={totalEng} prev={Math.round(totalEng*0.92)} spark={mergedDaily.map(r=>r.engagement)} />
        <KpiCard label="Likes" value={Object.values(perPlatformCurr).reduce((a,v)=>a+v.likes,0)} prev={0} />
        <KpiCard label="Comments" value={Object.values(perPlatformCurr).reduce((a,v)=>a+v.comments,0)} prev={0} />
        <KpiCard label="Shares + Saves" value={Object.values(perPlatformCurr).reduce((a,v)=>a+v.shares+v.saves,0)} prev={0} />
      </div>
      <Card title="Komposisi Engagement per Platform" desc="Kontribusi likes/comments/shares/saves"><ResponsiveContainer width="100%" height={320}><BarChart data={composition}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="name" tick={{ fontSize:12, fill:'#64748B' }} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} /><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize:12 }} /><Bar dataKey="likes" stackId="a" name="Likes" fill="#1D4ED8" /><Bar dataKey="comments" stackId="a" name="Comments" fill="#0EA5E9" /><Bar dataKey="shares" stackId="a" name="Shares" fill="#10B981" /><Bar dataKey="saves" stackId="a" name="Saves" fill="#F59E0B" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Engagement Rate Harian" desc="Agregat seluruh platform"><ResponsiveContainer width="100%" height={260}><LineChart data={mergedDaily.map(r=>({ ...r, engagementRate: r.reach>0 ? +(r.engagement/r.reach*100).toFixed(2) : 0 }))}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={v=>v+'%'} /><Tooltip content={<ChartTooltip formatter={v=>v+'%'} />} /><Line type="monotone" name="Engagement Rate" dataKey="engagementRate" stroke="#10B981" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></Card>
    </div>
  )
}

/* =========== CAMPAIGN =========== */
export function CampaignView() {
  const camps = useMemo(() => generateCampaignMetrics(), [])
  const best = [...camps].sort((a,b)=>b.score-a.score)[0]
  const worst = [...camps].sort((a,b)=>a.score-b.score)[0]
  const insights = { findings:[`Total ${camps.length} campaign berjalan. Terbaik: "${best.name}" (skor ${best.score}).`,`Rata-rata engagement rate campaign ${(camps.reduce((a,c)=>a+c.engagementRate,0)/camps.length).toFixed(2)}%.`], opportunities:[`Campaign "${best.name}" dapat diperluas dengan format serupa di kuartal berikutnya.`], risks:[`Campaign "${worst.name}" berperforma di bawah rata-rata — perlu evaluasi target audiens.`], actions:['Alokasikan budget lebih besar ke campaign yang menunjukkan engagement > 6%.','Standarkan naming convention & tagging campaign lintas platform.'], ideas:['Campaign "Bulan Sertifikasi Nasional" — kolaborasi lintas Direktorat.'] }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="🏆 Best Campaign" className="border-emerald-200 bg-emerald-50/40"><CampaignSummary c={best} tone="emerald" /></Card>
        <Card title="⚠️ Needs Attention" className="border-amber-200 bg-amber-50/40"><CampaignSummary c={worst} tone="amber" /></Card>
      </div>
      <Card title="Daftar Campaign" desc="Perbandingan seluruh campaign" className="!p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50/70 text-[11px] uppercase text-slate-500 tracking-wider"><tr>{['Campaign','Objective','Target','Platforms','Konten','Reach','Engagement','Eng.Rate','Follower Growth','Web Traffic','Skor'].map(h=><th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{camps.map(c=>{ const cat = scoreCategory(c.score); return (<tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-4 py-3"><div className="font-medium text-slate-900">{c.name}</div><div className="text-[10px] text-slate-500">{c.startDate} → {c.endDate}</div></td><td className="px-4 py-3 text-slate-600 text-xs">{c.objective}</td><td className="px-4 py-3 text-slate-600 text-xs">{c.target}</td><td className="px-4 py-3"><div className="flex gap-1">{c.platforms.map(p=><span key={p} className="w-2 h-2 rounded-full" title={p} style={{ background: colorOf(p) }} />)}</div></td><td className="px-4 py-3 text-slate-700">{c.contentPublished}</td><td className="px-4 py-3 text-slate-700">{formatNumber(c.reach)}</td><td className="px-4 py-3 text-slate-700">{formatNumber(c.engagement)}</td><td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">{c.engagementRate}%</span></td><td className="px-4 py-3 text-emerald-600 font-medium">+{formatNumber(c.followerGrowth)}</td><td className="px-4 py-3 text-slate-700">{formatNumber(c.websiteTraffic)}</td><td className="px-4 py-3"><ScoreBadge score={c.score} category={cat} /></td></tr>)})}</tbody></table></div></Card>
      <Card title="Perbandingan Skor Campaign"><ResponsiveContainer width="100%" height={260}><BarChart data={camps.map(c=>({ name: c.name, score: c.score, engagementRate: c.engagementRate }))} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" horizontal={false} /><XAxis type="number" domain={[0,100]} tick={{ fontSize:11, fill:'#64748B' }} /><YAxis dataKey="name" type="category" tick={{ fontSize:11, fill:'#64748B' }} width={180} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="score" name="Performance Score" fill="#1D4ED8" radius={[0,6,6,0]} /></BarChart></ResponsiveContainer></Card>
      <AIInsightsPanel scope="campaign" context={{ campaigns: camps }} fallback={insights} />
    </div>
  )
}

function CampaignSummary({ c, tone }) {
  const cat = scoreCategory(c.score)
  return <div className="space-y-2"><div className="text-lg font-bold text-slate-900">{c.name}</div><div className="text-xs text-slate-500">{c.objective} · {c.startDate} → {c.endDate}</div><div className="grid grid-cols-3 gap-3 mt-3">{[['Reach',formatNumber(c.reach)],['Eng. Rate',c.engagementRate+'%'],['Follower',`+${formatNumber(c.followerGrowth)}`]].map(([k,v])=><div key={k}><div className="text-[10px] text-slate-500 uppercase">{k}</div><div className="text-base font-semibold text-slate-800">{v}</div></div>)}</div><div className="mt-2"><ScoreBadge score={c.score} category={cat} /></div></div>
}

/* =========== BEST PERFORMING CONTENT =========== */
export function BestContentView({ days }) {
  const items = useMemo(() => generateContentItems(days), [days])
  const [sort, setSort] = useState('score')
  const sorted = [...items].sort((a,b)=>b[sort]-a[sort]).slice(0,20)
  const sortOptions = [ ['score','Performance Score'],['engagementRate','Engagement Rate'],['reach','Reach'],['views','Views'],['shares','Shares'],['saves','Saves'],['comments','Comments'] ]
  return (
    <div className="space-y-6">
      <Card><div className="flex flex-wrap items-center gap-2"><span className="text-sm text-slate-600 font-medium">Urutkan berdasarkan:</span>{sortOptions.map(([v,l])=><button key={v} onClick={()=>setSort(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sort===v?'bg-[#0B2545] text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>)}</div></Card>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((c,i)=>{ const cat = scoreCategory(c.score); return (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="h-32 flex items-center justify-center text-white text-3xl font-bold relative" style={{ background: `linear-gradient(135deg, ${c.platformColor} 0%, ${c.platformColor}88 100%)` }}>
              <div className="absolute top-3 left-3 text-[10px] bg-white/20 px-2 py-0.5 rounded backdrop-blur font-medium">#{i+1}</div>
              <div className="absolute top-3 right-3 text-[10px] bg-white/20 px-2 py-0.5 rounded backdrop-blur font-medium">{c.type}</div>
              <Trophy className="w-10 h-10 opacity-40" />
            </div>
            <div className="p-4">
              <div className="text-[11px] text-slate-500">{c.platformName} · {c.date}</div>
              <div className="text-sm font-semibold text-slate-900 mt-1 line-clamp-2">{c.title}</div>
              <div className="text-xs text-slate-500 mt-1">{c.topic}</div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                {[['Views',formatNumber(c.views)],['Reach',formatNumber(c.reach)],['Eng.',formatNumber(c.engagement)],['Rate',c.engagementRate+'%']].map(([k,v])=><div key={k}><div className="text-[9px] text-slate-500 uppercase">{k}</div><div className="text-xs font-semibold text-slate-800">{v}</div></div>)}
              </div>
              <div className="mt-3"><ScoreBadge score={c.score} category={cat} /></div>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

/* =========== RECOMMENDATIONS =========== */
export function RecommendationsView({ days }) {
  const platforms = getPlatforms()
  const allSeries = getAllSeries(Math.max(days*2+5, 200))
  const { perPlatformCurr, perPlatformPrev, totalsCurr, totalsPrev } = useMemo(() => aggregatePeriod(platforms, allSeries, days), [days, platforms, allSeries])
  const items = useMemo(() => generateContentItems(days), [days])
  const insights = generateInsights(totalsCurr, totalsPrev, perPlatformCurr)
  const recs = useMemo(() => {
    const r = []
    const igChange = pctChange(perPlatformCurr.instagram.engagement, perPlatformPrev.instagram.engagement)
    if (igChange > 0) r.push({ icon: TrendingUp, tone:'emerald', title:`Engagement Instagram naik ${igChange}%`, desc:'Momentum positif — tingkatkan volume Reels edukasi minggu ini.', action:'Tambah 3 Reels/minggu' })
    const byType = {}
    items.forEach(c => { if (!byType[c.type]) byType[c.type] = { total:0, count:0 }; byType[c.type].total += c.engagementRate; byType[c.type].count++ })
    const typeAvg = Object.entries(byType).map(([t,v])=>({ type:t, avg: +(v.total/v.count).toFixed(2), count:v.count })).sort((a,b)=>b.avg-a.avg)
    if (typeAvg[0]) r.push({ icon: Play, tone:'blue', title:`Format ${typeAvg[0].type} menghasilkan engagement tertinggi (${typeAvg[0].avg}%)`, desc:`Rata-rata ${(typeAvg[0].avg/typeAvg[typeAvg.length-1].avg).toFixed(1)}x lebih tinggi dibanding format terendah.`, action:`Perbanyak konten ${typeAvg[0].type}` })
    const byTopic = {}
    items.forEach(c => { if (!byTopic[c.topic]) byTopic[c.topic] = { total:0, count:0 }; byTopic[c.topic].total += c.score; byTopic[c.topic].count++ })
    const topicRank = Object.entries(byTopic).map(([t,v])=>({ topic:t, avg: +(v.total/v.count).toFixed(1) })).sort((a,b)=>b.avg-a.avg)
    if (topicRank[0]) r.push({ icon: Award, tone:'violet', title:`Topik "${topicRank[0].topic}" berperforma terbaik`, desc:`Skor rata-rata ${topicRank[0].avg} — audiens sangat responsif pada tema ini.`, action:'Pertahankan tema ini' })
    r.push({ icon: Rocket, tone:'cyan', title:'Waktu posting terbaik: 19.00-21.00 WIB', desc:'Data audiens menunjukkan puncak aktivitas malam hari.', action:'Jadwalkan konten prime-time' })
    r.push({ icon: Users, tone:'amber', title:'Segmen 25-34 tahun dominan (38%)', desc:'Konten karier & sertifikasi profesi paling relevan bagi segmen ini.', action:'Buat pilar konten profesional' })
    return r
  }, [days, items, perPlatformCurr, perPlatformPrev])
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 flex items-start gap-3"><Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" /><div><div className="font-semibold text-blue-900">Rekomendasi Berbasis Data</div><p className="text-sm text-blue-800 mt-1">Setiap rekomendasi dihitung otomatis dari performa aktual — bukan asumsi. Klik "Generate AI Insight" pada panel bawah untuk analisis mendalam dari LLM.</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recs.map((r,i)=>{ const Ic = r.icon; const cl = { emerald:'bg-emerald-50 text-emerald-700 border-emerald-200', blue:'bg-blue-50 text-blue-700 border-blue-200', violet:'bg-violet-50 text-violet-700 border-violet-200', cyan:'bg-cyan-50 text-cyan-700 border-cyan-200', amber:'bg-amber-50 text-amber-700 border-amber-200' }[r.tone]; return (
          <div key={i} className={`rounded-2xl border p-5 ${cl}`}><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0"><Ic className="w-5 h-5" /></div><div className="min-w-0 flex-1"><div className="font-semibold">{r.title}</div><p className="text-sm mt-1.5 opacity-90">{r.desc}</p><div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 text-xs font-medium">💡 {r.action}</div></div></div></div>) })}
      </div>
      <AIInsightsPanel scope="recommendations" context={{ periode_hari: days, per_platform: perPlatformCurr, ringkasan: totalsCurr, top_types_by_engagement: (()=>{ const byType={}; items.forEach(c=>{ if(!byType[c.type])byType[c.type]={total:0,count:0}; byType[c.type].total+=c.engagementRate; byType[c.type].count++ }); return Object.entries(byType).map(([t,v])=>({type:t,avg_engagement_rate:+(v.total/v.count).toFixed(2)})).sort((a,b)=>b.avg_engagement_rate-a.avg_engagement_rate).slice(0,5) })() }} fallback={insights} />
    </div>
  )
}

/* =========== REPORTS =========== */
export function ReportsView({ days }) {
  const [type, setType] = useState('monthly')
  const [generated, setGenerated] = useState(false)
  const platforms = getPlatforms()
  const allSeries = getAllSeries(Math.max(days*2+5, 200))
  const { perPlatformCurr, perPlatformPrev, totalsCurr, totalsPrev } = useMemo(() => aggregatePeriod(platforms, allSeries, days), [days, platforms, allSeries])
  const items = useMemo(() => generateContentItems(days), [days])
  const sent = useMemo(() => generateSentiment(Math.min(days,60)), [days])
  const camps = useMemo(() => generateCampaignMetrics(), [])
  const insights = generateInsights(totalsCurr, totalsPrev, perPlatformCurr)
  const top = [...items].sort((a,b)=>b.score-a.score).slice(0,5)
  const REPORT_TYPES = [ { v:'monthly', l:'Monthly Report', i:FileText }, { v:'quarterly', l:'Quarterly Report', i:FileText }, { v:'annual', l:'Annual Report', i:FileText }, { v:'campaign', l:'Campaign Report', i:Rocket }, { v:'social', l:'Social Media Report', i:TrendingUp }, { v:'executive', l:'Executive Report', i:Building2 } ]
  function exportExcel() {
    const rows = [
      ['Metrik','Nilai','Sebelumnya','Perubahan (%)'],
      ['Total Followers', totalsCurr.followers, totalsPrev.followers, pctChange(totalsCurr.followers,totalsPrev.followers)],
      ['Follower Growth', totalsCurr.followerGrowth, totalsPrev.followerGrowth, pctChange(totalsCurr.followerGrowth,totalsPrev.followerGrowth)],
      ['Total Reach', totalsCurr.reach, totalsPrev.reach, pctChange(totalsCurr.reach,totalsPrev.reach)],
      ['Total Engagement', totalsCurr.engagement, totalsPrev.engagement, pctChange(totalsCurr.engagement,totalsPrev.engagement)],
      ['Engagement Rate (%)', totalsCurr.engagementRate, totalsPrev.engagementRate, pctChange(totalsCurr.engagementRate,totalsPrev.engagementRate)],
      ['Content Published', totalsCurr.contentPublished, totalsPrev.contentPublished, pctChange(totalsCurr.contentPublished,totalsPrev.contentPublished)],
    ]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob(["\ufeff"+csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `laporan-${type}-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <div className="space-y-6">
      <Card title="Pilih Jenis Laporan"><div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">{REPORT_TYPES.map(rt => { const Ic = rt.i; return (<button key={rt.v} onClick={()=>setType(rt.v)} className={`p-4 rounded-xl border text-left transition ${type===rt.v?'border-blue-500 bg-blue-50 shadow-sm':'border-slate-200 hover:border-slate-300'}`}><Ic className={`w-6 h-6 mb-2 ${type===rt.v?'text-blue-600':'text-slate-500'}`} /><div className={`text-sm font-semibold ${type===rt.v?'text-blue-900':'text-slate-800'}`}>{rt.l}</div></button>) })}</div><div className="flex gap-2 mt-5 flex-wrap"><button onClick={()=>setGenerated(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B2545] text-white text-sm font-medium hover:bg-[#0e2f5c]"><Sparkles className="w-4 h-4" />Generate Report</button><button onClick={()=>window.print()} disabled={!generated} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"><Printer className="w-4 h-4" />Print</button><button onClick={exportExcel} disabled={!generated} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"><Download className="w-4 h-4" />Export Excel/CSV</button><button onClick={()=>window.print()} disabled={!generated} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"><Download className="w-4 h-4" />Export PDF</button></div></Card>
      {generated && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6 print:shadow-none print:border-0">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest">Laporan Direktorat Kursus dan Pelatihan</div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{REPORT_TYPES.find(r=>r.v===type).l}</h1>
            <p className="text-sm text-slate-500 mt-1">Periode: {days} hari terakhir · Digenerate {new Date().toLocaleDateString('id-ID',{ dateStyle:'long' })}</p>
          </div>
          <section><h2 className="text-lg font-bold text-slate-900 mb-2">Executive Summary</h2><p className="text-sm text-slate-700 leading-relaxed">Selama {days} hari, kanal digital Direktorat Kursus dan Pelatihan menjangkau {formatNumber(totalsCurr.reach)} orang dengan {formatNumber(totalsCurr.engagement)} engagement (rate {totalsCurr.engagementRate}%). Follower growth gabungan mencapai +{formatNumber(totalsCurr.followerGrowth)} pengguna baru dan sebanyak {totalsCurr.contentPublished} konten dipublikasikan.</p></section>
          <section><h2 className="text-lg font-bold text-slate-900 mb-2">KPI Utama</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[['Reach',formatNumber(totalsCurr.reach)],['Engagement',formatNumber(totalsCurr.engagement)],['Eng. Rate',totalsCurr.engagementRate+'%'],['Follower Growth','+'+formatNumber(totalsCurr.followerGrowth)]].map(([k,v])=><div key={k} className="rounded-lg border border-slate-200 p-3"><div className="text-[10px] uppercase text-slate-500">{k}</div><div className="text-lg font-bold text-slate-900">{v}</div></div>)}</div></section>
          <section><h2 className="text-lg font-bold text-slate-900 mb-2">Performa per Platform</h2><table className="w-full text-sm border-t border-slate-100"><thead className="text-xs text-slate-500"><tr><th className="text-left py-2">Platform</th><th className="text-left">Followers</th><th className="text-left">Reach</th><th className="text-left">Eng. Rate</th></tr></thead><tbody>{platforms.map(p=>(<tr key={p.key} className="border-t border-slate-100"><td className="py-2">{p.name}</td><td>{formatNumber(perPlatformCurr[p.key].followers)}</td><td>{formatNumber(perPlatformCurr[p.key].reach)}</td><td>{perPlatformCurr[p.key].engagementRate}%</td></tr>))}</tbody></table></section>
          <section><h2 className="text-lg font-bold text-slate-900 mb-2">Top 5 Konten Terbaik</h2><ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">{top.map(c=><li key={c.id}><strong>{c.title}</strong> — {c.platformName}, {c.type} · Skor {c.score}</li>)}</ol></section>
          <section><h2 className="text-lg font-bold text-slate-900 mb-2">Sentiment Publik</h2><p className="text-sm text-slate-700">Dari {formatNumber(sent.total)} komentar: Positif {sent.positivePct}% · Netral {sent.neutralPct}% · Negatif {sent.negativePct}%.</p></section>
          <section><h2 className="text-lg font-bold text-slate-900 mb-2">Campaign Aktif</h2><ul className="list-disc list-inside text-sm text-slate-700 space-y-1">{camps.slice(0,4).map(c=><li key={c.id}>{c.name} — Skor {c.score}, ER {c.engagementRate}%</li>)}</ul></section>
          <section><h2 className="text-lg font-bold text-slate-900 mb-2">Key Findings</h2><ul className="list-disc list-inside text-sm text-slate-700 space-y-1">{insights.findings.map((f,i)=><li key={i}>{f}</li>)}</ul></section>
          <section><h2 className="text-lg font-bold text-slate-900 mb-2">Rekomendasi & Next Action Plan</h2><ul className="list-disc list-inside text-sm text-slate-700 space-y-1">{insights.actions.map((f,i)=><li key={i}>{f}</li>)}</ul></section>
          <div className="text-center text-xs text-slate-400 pt-6 border-t border-slate-100">Laporan digenerate oleh Dashboard Media Sosial Direktorat Kursus dan Pelatihan.</div>
        </div>
      )}
    </div>
  )
}

/* =========== SETTINGS =========== */
export function SettingsView() {
  const [tab, setTab] = useState('accounts')
  const TABS = [ ['accounts','Akun Media Sosial'], ['api','API Connections'], ['website','Website Analytics'], ['refresh','Data Refresh'], ['users','Users & Roles'], ['report','Report Settings'], ['org','Organisasi & Logo'] ]
  const accounts = [
    { platform:'Instagram', handle:'@kursuskita', status:'Mock', color:'#E1306C', icon:Instagram },
    { platform:'Facebook', handle:'KursusKita.info', status:'Mock', color:'#1877F2', icon:Facebook },
    { platform:'YouTube', handle:'@kursuskita1211', status:'Mock', color:'#FF0000', icon:Youtube },
    { platform:'TikTok', handle:'@kursuskita', status:'Mock', color:'#111827', icon:Music2 },
    { platform:'Website', handle:'kursus.kemendikdasmen.go.id', status:'Mock', color:'#0EA5E9', icon:Globe },
  ]
  const roles = [ { name:'Admin', desc:'Akses penuh dan kelola pengguna', color:'bg-red-50 text-red-700 ring-red-200' }, { name:'Analyst', desc:'Lihat data, generate laporan, tidak mengubah pengaturan', color:'bg-blue-50 text-blue-700 ring-blue-200' }, { name:'Viewer', desc:'Hanya dapat melihat dashboard', color:'bg-slate-50 text-slate-700 ring-slate-200' }, { name:'Executive', desc:'Akses Executive Summary dan Reports', color:'bg-amber-50 text-amber-700 ring-amber-200' } ]
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{TABS.map(([v,l])=><button key={v} onClick={()=>setTab(v)} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${tab===v?'bg-[#0B2545] text-white':'text-slate-600 hover:bg-slate-100'}`}>{l}</button>)}</div>
      {tab==='accounts' && (<Card title="Social Media Accounts" desc="Kelola akun media sosial Direktorat"><div className="space-y-3">{accounts.map(a=>{ const Ic = a.icon; return (<div key={a.platform} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200"><div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: a.color+'18', color: a.color }}><Ic className="w-5 h-5" /></div><div className="flex-1"><div className="font-medium text-slate-900">{a.platform}</div><div className="text-xs text-slate-500 font-mono">{a.handle}</div></div><span className="text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-200">{a.status}</span><button className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">Hubungkan API</button></div>)})}</div></Card>)}
      {tab==='api' && (<Card title="API Connections" desc="Konfigurasi kunci API untuk data aktual"><div className="space-y-3">{[['Instagram Graph API','Meta Business'],['Facebook Graph API','Meta Business'],['YouTube Data API v3','Google Cloud Console'],['TikTok Business API','TikTok for Developers'],['Google Analytics 4','Google Analytics']].map(([n,src])=>(<div key={n} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"><div className="flex-1"><div className="font-medium text-slate-900">{n}</div><div className="text-xs text-slate-500">Sumber: {src}</div></div><input type="password" placeholder="API Key..." className="text-sm px-3 py-2 rounded-lg border border-slate-200 w-64" /><button className="text-xs px-3 py-2 rounded-lg bg-blue-600 text-white">Simpan</button></div>))}</div></Card>)}
      {tab==='website' && (<Card title="Website Analytics" desc="Konfigurasi Google Analytics 4"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[['Property ID','GA-XXXXXXXXX'],['Measurement ID','G-XXXXXXXX'],['Service Account','service-account@project.iam'],['Website URL','https://kursus.kemendikdasmen.go.id']].map(([k,v])=>(<div key={k}><label className="text-xs font-medium text-slate-600">{k}</label><input placeholder={v} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>))}</div></Card>)}
      {tab==='refresh' && (<Card title="Data Refresh" desc="Interval sinkronisasi data"><div className="space-y-3">{[['Real-time','Setiap 5 menit','off'],['Sering','Setiap 15 menit','on'],['Standar','Setiap 1 jam','off'],['Hemat','Setiap 6 jam','off']].map(([n,d,s])=>(<div key={n} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"><input type="radio" name="refresh" defaultChecked={s==='on'} className="w-4 h-4" /><div className="flex-1"><div className="font-medium text-slate-900">{n}</div><div className="text-xs text-slate-500">{d}</div></div></div>))}</div></Card>)}
      {tab==='users' && (<Card title="Users & Roles" desc="Manajemen pengguna dan peran"><div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">{roles.map(r=><div key={r.name} className={`p-3 rounded-lg ring-1 ${r.color}`}><div className="font-semibold">{r.name}</div><div className="text-xs opacity-90 mt-1">{r.desc}</div></div>)}</div><table className="w-full text-sm"><thead className="text-xs text-slate-500"><tr><th className="text-left py-2">Nama</th><th className="text-left">Email</th><th className="text-left">Role</th><th className="text-left">Status</th></tr></thead><tbody>{[['Andi Prakoso','andi@kemdikdasmen.go.id','Admin','Aktif'],['Rina Setiawati','rina@kemdikdasmen.go.id','Analyst','Aktif'],['Budi Santosa','budi@kemdikdasmen.go.id','Executive','Aktif'],['Dewi Rahayu','dewi@kemdikdasmen.go.id','Viewer','Nonaktif']].map(r=>(<tr key={r[0]} className="border-t border-slate-100"><td className="py-2.5">{r[0]}</td><td className="text-slate-500 text-xs">{r[1]}</td><td>{r[2]}</td><td><span className={`text-xs px-2 py-0.5 rounded-md ${r[3]==='Aktif'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{r[3]}</span></td></tr>))}</tbody></table></Card>)}
      {tab==='report' && (<Card title="Report Settings"><div className="space-y-3">{[['Default periode laporan','30 hari terakhir'],['Kop laporan','Direktorat Kursus dan Pelatihan'],['Bahasa','Bahasa Indonesia'],['Format tanggal','DD MMMM YYYY']].map(([k,v])=><div key={k}><label className="text-xs font-medium text-slate-600">{k}</label><input defaultValue={v} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>)}</div></Card>)}
      {tab==='org' && (<Card title="Organisasi & Logo"><div className="flex items-center gap-6"><div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#1D4ED8] flex items-center justify-center text-white ring-1 ring-slate-200"><ShieldCheck className="w-16 h-16" /></div><div className="flex-1 space-y-3">{[['Nama Institusi','Direktorat Kursus dan Pelatihan'],['Kementerian','Kementerian Pendidikan Dasar dan Menengah'],['Situs Resmi','kursus.kemendikdasmen.go.id'],['Kontak Publik','humas@kursus.kemendikdasmen.go.id']].map(([k,v])=><div key={k}><label className="text-xs font-medium text-slate-600">{k}</label><input defaultValue={v} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>)}<button className="mt-2 px-4 py-2 rounded-lg bg-[#0B2545] text-white text-sm">Ganti Logo</button></div></div></Card>)}
    </div>
  )
}


/* =========== EXECUTIVE SUMMARY =========== */
export function ExecutiveSummaryView({ days }) {
  const platforms = getPlatforms()
  const allSeries = getAllSeries(Math.max(days*2+5, 200))
  const { perPlatformCurr, perPlatformPrev, totalsCurr, totalsPrev, mergedDaily } = useMemo(() => aggregatePeriod(platforms, allSeries, days), [days, platforms, allSeries])
  const w = useMemo(() => generateWebsite(days), [days])
  const items = useMemo(() => generateContentItems(days), [days])
  const [aiSummary, setAiSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  // Compute overall score (0-100) from key indicators
  const scoreParts = {
    engRate: Math.min(totalsCurr.engagementRate / 8, 1) * 30,
    reachGrowth: Math.max(0, Math.min(pctChange(totalsCurr.reach, totalsPrev.reach)/30, 1)) * 20,
    followerGrowth: Math.max(0, Math.min(pctChange(totalsCurr.followers, totalsPrev.followers)/8, 1)) * 20,
    contentVolume: Math.min(totalsCurr.contentPublished / 200, 1) * 15,
    webGrowth: Math.max(0, Math.min(pctChange(w.totals.users, Math.round(w.totals.users*0.92))/15, 1)) * 15,
  }
  const overallScore = Math.round(Object.values(scoreParts).reduce((a,v)=>a+v,0))
  const cat = scoreCategory(overallScore)

  // Auto-derive 3 best / 3 concerns / 3 recs
  const perRanked = Object.entries(perPlatformCurr).filter(([k])=>k!=='website').map(([k,v]) => ({ k, ...v, change: pctChange(v.engagement, perPlatformPrev[k].engagement) })).sort((a,b)=>b.change-a.change)
  const topContent = [...items].sort((a,b)=>b.score-a.score)[0]
  const bests = [
    perRanked[0] && `${labelOf(perRanked[0].k)} tumbuh ${perRanked[0].change>=0?'+':''}${perRanked[0].change}% engagement — kanal berperforma terbaik periode ini.`,
    topContent && `Konten "${topContent.title}" (${topContent.platformName}) meraih skor ${topContent.score}/100.`,
    totalsCurr.engagementRate >= 5 && `Engagement rate ${totalsCurr.engagementRate}% berada di atas benchmark industri (3-5%).`,
    w.totals.bounce < 50 && `Bounce rate website ${w.totals.bounce}% dalam batas sehat.`,
    totalsCurr.followerGrowth > 0 && `Follower gabungan bertambah +${formatNumber(totalsCurr.followerGrowth)} pengguna baru.`,
  ].filter(Boolean).slice(0, 3)

  const concerns = [
    perRanked[perRanked.length-1] && perRanked[perRanked.length-1].change < 0 && `${labelOf(perRanked[perRanked.length-1].k)} turun ${perRanked[perRanked.length-1].change}% — butuh evaluasi strategi.`,
    totalsCurr.engagementRate < 3 && `Engagement rate ${totalsCurr.engagementRate}% di bawah benchmark — konten belum resonan.`,
    w.totals.bounce >= 55 && `Bounce rate website ${w.totals.bounce}% cukup tinggi — audit landing page.`,
    pctChange(totalsCurr.contentPublished, totalsPrev.contentPublished) < -15 && `Frekuensi publikasi turun ${Math.abs(pctChange(totalsCurr.contentPublished, totalsPrev.contentPublished))}% — jaga kontinuitas.`,
    pctChange(totalsCurr.reach, totalsPrev.reach) < -10 && `Total reach menurun ${Math.abs(pctChange(totalsCurr.reach, totalsPrev.reach))}% — distribusi konten perlu dioptimalkan.`,
    'Ketergantungan pada 2 platform teratas cukup tinggi — perlu diversifikasi kanal.',
  ].filter(Boolean).slice(0, 3)

  const recs = [
    'Perbanyak format video pendek (Reels/Short/TikTok) 2-3x per minggu untuk mempertahankan engagement.',
    'Fokuskan tema pilar pada Sertifikasi Kompetensi, Kisah Alumni, dan Program Vokasi Prioritas.',
    'Jadwalkan posting utama pada jam 19.00-21.00 WIB — window peak audiens Indonesia.',
  ]

  async function runAI() {
    setLoading(true)
    try {
      const context = { periode_hari: days, overall_score: overallScore, category: cat.label, totals: totalsCurr, previous: totalsPrev, per_platform: perPlatformCurr, website: w.totals, top_content: topContent && { title: topContent.title, platform: topContent.platformName, score: topContent.score } }
      const r = await fetch('/api/ai-insights', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ context, scope:'executive-summary-paragraphs' }) })
      const j = await r.json()
      if (j.insights) {
        // Merge into 5 short paragraphs
        const paragraphs = []
        if (j.insights.findings?.length) paragraphs.push(j.insights.findings.slice(0,2).join(' '))
        if (j.insights.opportunities?.length) paragraphs.push(j.insights.opportunities[0])
        if (j.insights.risks?.length) paragraphs.push(j.insights.risks[0])
        if (j.insights.actions?.length) paragraphs.push(j.insights.actions.slice(0,2).join(' '))
        if (j.insights.ideas?.length) paragraphs.push('Ide konten berikutnya: ' + j.insights.ideas[0])
        setAiSummary(paragraphs.slice(0,5))
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const trend = mergedDaily.map(r => ({ ...r, engagementRate: r.reach>0 ? +(r.engagement/r.reach*100).toFixed(2) : 0 }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
        <div className="bg-gradient-to-br from-[#0B2545] via-[#123572] to-[#1D4ED8] text-white p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-blue-200/80 font-semibold">Executive Summary · Untuk Pimpinan</div>
              <h2 className="text-2xl font-bold mt-2">Performa Digital Periode Ini</h2>
              <p className="text-sm text-blue-100/80 mt-1">{days} hari terakhir · Direktorat Kursus dan Pelatihan</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-blue-200/70">Overall Score</div>
                <div className="text-6xl font-black leading-none mt-1">{overallScore}<span className="text-2xl opacity-70">/100</span></div>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: cat.color+'30', color:'#fff', border:`1px solid ${cat.color}` }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />{cat.label}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Big KPIs */}
        <div className="bg-white grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {[
            { l:'Follower Growth', v:`+${formatNumber(totalsCurr.followerGrowth)}`, c: pctChange(totalsCurr.followers, totalsPrev.followers) },
            { l:'Reach Growth', v: formatNumber(totalsCurr.reach), c: pctChange(totalsCurr.reach, totalsPrev.reach) },
            { l:'Engagement Growth', v: formatNumber(totalsCurr.engagement), c: pctChange(totalsCurr.engagement, totalsPrev.engagement) },
            { l:'Website Traffic', v: formatNumber(w.totals.users), c: pctChange(w.totals.users, Math.round(w.totals.users*0.92)) },
          ].map(k => (
            <div key={k.l} className="p-5 text-center">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{k.l}</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{k.v}</div>
              <div className={`text-xs font-semibold mt-1 ${k.c>=0?'text-emerald-600':'text-red-500'}`}>{k.c>=0?'▲ +':'▼ '}{k.c}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Three columns: Best / Concerns / Recs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-5">
          <div className="flex items-center gap-2 mb-3"><div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div><h3 className="font-bold text-emerald-900">3 Hal Terbaik</h3></div>
          <ol className="space-y-2.5">{bests.map((b,i)=><li key={i} className="text-sm text-emerald-900/90 flex gap-2"><span className="font-bold text-emerald-700">{i+1}.</span><span>{b}</span></li>)}</ol>
        </div>
        <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-3"><div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center"><XCircle className="w-5 h-5" /></div><h3 className="font-bold text-amber-900">3 Hal Perlu Diperhatikan</h3></div>
          <ol className="space-y-2.5">{concerns.map((c,i)=><li key={i} className="text-sm text-amber-900/90 flex gap-2"><span className="font-bold text-amber-700">{i+1}.</span><span>{c}</span></li>)}</ol>
        </div>
        <div className="rounded-2xl bg-blue-50/60 border border-blue-200 p-5">
          <div className="flex items-center gap-2 mb-3"><div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center"><Rocket className="w-5 h-5" /></div><h3 className="font-bold text-blue-900">3 Rekomendasi Utama</h3></div>
          <ol className="space-y-2.5">{recs.map((r,i)=><li key={i} className="text-sm text-blue-900/90 flex gap-2"><span className="font-bold text-blue-700">{i+1}.</span><span>{r}</span></li>)}</ol>
        </div>
      </div>

      {/* AI Summary paragraphs */}
      <Card title="Ringkasan AI untuk Pimpinan" desc="Analisis eksekutif maksimal 5 paragraf pendek — Bahasa Indonesia" right={<button onClick={runAI} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B2545] text-white text-xs font-medium hover:bg-[#0e2f5c] disabled:opacity-60"><Sparkles className={`w-3.5 h-3.5 ${loading?'animate-pulse':''}`} />{loading?'Menganalisis…':'Generate AI Summary'}</button>}>
        {!aiSummary && <p className="text-sm text-slate-500 italic">Klik tombol "Generate AI Summary" untuk memperoleh ringkasan naratif berbasis LLM (Claude Sonnet 4.5) untuk keperluan pimpinan.</p>}
        {aiSummary && <div className="space-y-3">{aiSummary.map((p,i)=>(<p key={i} className="text-sm text-slate-700 leading-relaxed">{p}</p>))}</div>}
      </Card>

      {/* Mini trend */}
      <Card title="Tren Engagement Rate Periode Ini" desc="Konsistensi performa harian">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trend}>
            <defs><linearGradient id="exG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.35} /><stop offset="100%" stopColor="#1D4ED8" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} />
            <YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={v=>v+'%'} />
            <Tooltip content={<ChartTooltip formatter={v=>v+'%'} />} />
            <Area type="monotone" name="Eng. Rate" dataKey="engagementRate" stroke="#1D4ED8" strokeWidth={2.4} fill="url(#exG)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
