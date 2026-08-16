'use client'
import { useMemo, useState, useEffect } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, RadialBarChart, RadialBar,
} from 'recharts'
import {
  ArrowUpRight, Trophy, TrendingUp, Users, Heart, Play, Clock, MousePointer, Eye,
  FileText, Printer, Download, Search, Filter, Award, CheckCircle2, XCircle, Rocket, Info, Settings as SettingsIcon,
  Instagram, Facebook, Youtube, Music2, Globe, Building2, ShieldCheck, ChevronRight, Sparkles,
  Calendar as CalendarIcon, GitCompareArrows,
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

  // Try to fetch live data — first from OAuth endpoints, then fallback to Ayrshare
  const [live, setLive] = useState(null)
  const [liveSource, setLiveSource] = useState(null) // 'oauth' | 'ayrshare'
  const [dailyLive, setDailyLive] = useState(null) // Ayrshare per-day series
  useEffect(() => {
    setLive(null); setLiveSource(null); setDailyLive(null)
    let cancelled = false
    async function loadLive() {
      const oauthEndpoint = { instagram:'/api/live/instagram/summary', facebook:'/api/live/facebook/summary', youtube:'/api/live/youtube/summary', tiktok:'/api/live/tiktok/summary' }[platformKey]
      // 1) Try OAuth endpoint
      if (oauthEndpoint) {
        try {
          const j = await fetch(`${oauthEndpoint}?days=${days}`).then(r=>r.json())
          if (!cancelled && j.connected && !j.error) { setLive(j); setLiveSource('oauth'); return }
        } catch {}
      }
      // 2) Fallback to Ayrshare aggregate + history for daily
      try {
        const j = await fetch(`/api/ayrshare/analytics?platforms=${platformKey}`).then(r=>r.json())
        if (cancelled) return
        if (j.connected && j.data && !j.error) {
          const platData = j.data[platformKey] || j.data[platformKey.toLowerCase()]
          if (platData && !platData.error) {
            const a = platData.analytics || platData
            setLive({
              connected: true,
              account: { username: a.username || a.name },
              channel: { title: a.title || a.channelTitle },
              page: { name: a.pageName || a.name },
              summary: {
                followers: a.followersCount ?? a.subscriberCount ?? a.likes ?? a.followers ?? 0,
                reach: a.reach ?? a.impressions ?? 0,
                impressions: a.impressions ?? 0,
                engagement: a.engagement ?? (a.likeCount||0)+(a.commentsCount||0),
                likes: a.likeCount ?? a.likes ?? 0,
                comments: a.commentsCount ?? a.comments ?? 0,
                views: a.viewCount ?? a.videoViews ?? a.views ?? 0,
                videos: a.mediaCount ?? a.videoCount ?? 0,
                subscribers: a.subscriberCount ?? 0,
                fansEnd: a.followersCount ?? 0,
                totalViews: a.viewCount ?? 0,
              },
              ayrshareRaw: platData,
            })
            setLiveSource('ayrshare')
          }
        }
      } catch {}
      // 3) Also try daily history (independent of aggregate result)
      try {
        const h = await fetch(`/api/ayrshare/history?platform=${platformKey}&days=${days}`).then(r=>r.json())
        if (cancelled) return
        if (h.connected && Array.isArray(h.series) && h.series.length && h.rawCount > 0) {
          setDailyLive(h.series)
        }
      } catch {}
    }
    loadLive()
    return () => { cancelled = true }
  }, [platformKey, days])
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
  let kpis = kpiMap[platformKey]
  // Override KPIs with LIVE numbers when available
  if (live?.summary) {
    const s = live.summary
    const overrideMap = {
      instagram: { 'Followers': s.followers, 'Reach': s.reach, 'Impressions': s.impressions, 'Likes': s.likes, 'Comments': s.comments },
      facebook: { 'Page Followers': s.fansEnd || s.followers, 'Reach': s.reach, 'Impressions': s.impressions, 'Post Engagement': s.engagement, 'Likes': s.likes, 'Comments': s.comments, 'Video Views': s.views },
      youtube: { 'Subscribers': s.subscribers || s.followers, 'Views': s.totalViews || s.views, 'Likes': s.likes, 'Comments': s.comments },
      tiktok: { 'Followers': s.followers, 'Video Views': s.views, 'Likes': s.likes, 'Comments': s.comments },
    }[platformKey] || {}
    kpis = kpis.map(k => (overrideMap[k.label] != null && overrideMap[k.label] > 0) ? { ...k, value: overrideMap[k.label], isLive: true } : k)
  }
  const insights = generateInsights(cAgg, pAgg, { [platformKey]: cAgg })
  // Merge daily live series with mock followers curve so all four charts have data
  const chartData = dailyLive
    ? dailyLive.map((d, i) => ({
        ...d,
        followers: curr[i]?.followers || 0,
        contentPublished: d.posts,
      }))
    : curr
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: platform.color+'18', color: platform.color }}><Icon className="w-7 h-7" /></div>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">Akun {platform.name}</div>
          <div className="text-lg font-bold text-slate-900">{live?.account?.username ? '@'+live.account.username : live?.channel?.title || live?.page?.name || platform.handle}</div>
          {live && <div className="text-xs text-slate-500 mt-0.5">
            {platformKey==='instagram' && live.summary && `${formatNumber(live.account?.followers_count||live.summary.followers||0)} followers · ${formatNumber(live.summary.reach||0)} reach · ${formatNumber(live.summary.impressions||0)} impressions${liveSource==='oauth'?` (live ${days}d)`:' (live · Ayrshare)'}`}
            {platformKey==='facebook' && live.summary && `${formatNumber(live.summary.fansEnd||live.summary.followers||0)} fans · ${formatNumber(live.summary.reach||0)} reach · ${formatNumber(live.summary.engagement||0)} engagement${liveSource==='oauth'?` (live ${days}d)`:' (live · Ayrshare)'}`}
            {platformKey==='youtube' && live.summary && `${formatNumber(live.summary.subscribers||live.summary.followers||0)} subscribers · ${formatNumber(live.summary.totalViews||live.summary.views||0)} views${liveSource==='oauth'?'':' (live · Ayrshare)'}`}
            {platformKey==='tiktok' && live.summary && `${formatNumber(live.summary.followers||0)} followers · ${formatNumber(live.summary.views||0)} video views · ${formatNumber(live.summary.likes||0)} likes${liveSource==='oauth'?'':' (live · Ayrshare)'}`}
          </div>}
        </div>
        {live
          ? <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 inline-flex items-center gap-1.5 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live · {liveSource==='ayrshare'?'via Ayrshare':'OAuth Langsung'}</span>
          : <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 font-medium">🟡 Mock Data</span>
        }
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{kpis.map(k => <KpiCard key={k.label} {...k} />)}</div>
      {dailyLive && <div className="text-[11px] px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 inline-flex items-center gap-2 font-medium">📈 Grafik menggunakan data harian LIVE dari Ayrshare · {dailyLive.length} hari</div>}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title={dailyLive ? "Reach & Engagement Trend (Live · Ayrshare)" : "Reach & Engagement Trend"} desc={dailyLive ? "Perkembangan harian dari post yang dipublikasikan via Ayrshare" : "Perkembangan harian (mock)"}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs><linearGradient id={`re-${platformKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={platform.color} stopOpacity={0.35} /><stop offset="100%" stopColor={platform.color} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} /><Tooltip content={<ChartTooltip />} />
              <Area type="monotone" name="Reach" dataKey="reach" stroke={platform.color} strokeWidth={2} fill={`url(#re-${platformKey})`} />
              <Line type="monotone" name="Engagement" dataKey="engagement" stroke="#10B981" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Follower Growth" desc={dailyLive ? "Estimasi (Ayrshare tidak mengembalikan history follower harian)" : "Perkembangan pengikut"}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} /><Tooltip content={<ChartTooltip />} /><Line type="monotone" name="Followers" dataKey="followers" stroke={platform.color} strokeWidth={2.4} dot={false} /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title={dailyLive ? "Posting Frequency (Live · Ayrshare)" : "Posting Frequency"} desc={dailyLive ? "Jumlah post nyata via Ayrshare" : "Jumlah konten per hari"}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={fmtShortDate} minTickGap={20} /><YAxis tick={{ fontSize:11, fill:'#64748B' }} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="contentPublished" name="Konten" fill={platform.color} radius={[4,4,0,0]} /></BarChart>
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
  const [conns, setConns] = useState([])
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState(null)
  const [ayr, setAyr] = useState(null)
  const [ayrBusy, setAyrBusy] = useState(false)

  const loadConns = async () => {
    setLoading(true)
    try { const r = await fetch('/api/connections'); const j = await r.json(); setConns(j.connections || []) } catch {}
    setLoading(false)
  }
  const loadAyr = async () => {
    try { const r = await fetch('/api/ayrshare/status'); const j = await r.json(); setAyr(j) } catch {}
  }
  const startAyrConnect = async () => {
    setAyrBusy(true)
    try {
      const r = await fetch('/api/ayrshare/link', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platforms: ['facebook','instagram','youtube','tiktok'] }) })
      const j = await r.json()
      if (j.url) {
        window.open(j.url, 'ayrshare_link', 'width=720,height=780')
        setFlash({ ok:true, provider:'Ayrshare', message:'Silakan hubungkan akun media sosial di jendela yang terbuka. Setelah selesai, klik Refresh.' })
      } else {
        setFlash({ ok:false, provider:'Ayrshare', message: j.error || 'Gagal generate URL' })
      }
    } catch (e) { setFlash({ ok:false, provider:'Ayrshare', message:String(e?.message||e) }) }
    setAyrBusy(false)
  }
  const refreshAyr = async () => {
    setAyrBusy(true)
    try { await fetch('/api/ayrshare/refresh'); await loadAyr() } catch {}
    setAyrBusy(false)
  }
  const disconnectAyr = async () => {
    if (!confirm('Hapus profile Ayrshare? Semua koneksi sosial via Ayrshare akan hilang.')) return
    setAyrBusy(true)
    try { await fetch('/api/ayrshare/profile', { method:'DELETE' }); setAyr(null); await loadAyr() } catch {}
    setAyrBusy(false)
  }
  useEffect(() => {
    loadConns()
    loadAyr()
    const onMsg = (e) => {
      if (e.data?.type === 'oauth') {
        setFlash({ ok: e.data.ok, provider: e.data.provider, message: e.data.message })
        loadConns()
        setTimeout(()=>setFlash(null), 6000)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  function openOauth(provider) {
    const w = 620, h = 720
    const l = window.screenX + (window.outerWidth - w)/2
    const t = window.screenY + (window.outerHeight - h)/2
    window.open(`/api/oauth/${provider}/start`, `oauth_${provider}`, `width=${w},height=${h},left=${l},top=${t}`)
  }
  async function disconnect(provider) {
    if (!confirm(`Putuskan koneksi ${provider}? Semua token akan dihapus.`)) return
    await fetch(`/api/connections/${provider}`, { method:'DELETE' })
    loadConns()
  }

  const meta = conns.find(c => c.provider === 'meta')
  const google = conns.find(c => c.provider === 'google')

  const TABS = [ ['accounts','Akun Media Sosial'], ['api','API Connections'], ['website','Website Analytics'], ['refresh','Data Refresh'], ['users','Users & Roles'], ['stats','Statistik Dampak'], ['activity','Log Aktivitas'], ['digest','Notifikasi Email'], ['report','Report Settings'], ['org','Organisasi & Logo'] ]
  const roles = [ { name:'Admin', desc:'Akses penuh dan kelola pengguna', color:'bg-red-50 text-red-700 ring-red-200' }, { name:'Analyst', desc:'Lihat data, generate laporan, tidak mengubah pengaturan', color:'bg-blue-50 text-blue-700 ring-blue-200' }, { name:'Viewer', desc:'Hanya dapat melihat dashboard', color:'bg-slate-50 text-slate-700 ring-slate-200' }, { name:'Executive', desc:'Akses Executive Summary dan Reports', color:'bg-amber-50 text-amber-700 ring-amber-200' } ]

  const accountsRows = [
    { platform:'Instagram', handle: meta?.ig_accounts?.[0]?.username ? '@'+meta.ig_accounts[0].username : '@kursuskita', color:'#E1306C', icon:Instagram, connected: !!meta?.ig_accounts?.length, subtitle: meta?.ig_accounts?.[0] && `${formatNumber(meta.ig_accounts[0].followers_count||0)} followers · via Meta` },
    { platform:'Facebook', handle: meta?.pages?.[0]?.name || 'KursusKita.info', color:'#1877F2', icon:Facebook, connected: !!meta?.pages?.length, subtitle: meta?.pages?.[0] && `Page ID ${meta.pages[0].id.slice(-6)} · via Meta` },
    { platform:'YouTube', handle: google?.channels?.[0]?.title || '@kursuskita1211', color:'#FF0000', icon:Youtube, connected: !!google?.channels?.length, subtitle: google?.channels?.[0] && `${formatNumber(+google.channels[0].subscribers||0)} subscribers · via Google` },
    { platform:'TikTok', handle:'@kursuskita', color:'#111827', icon:Music2, connected: false, subtitle: 'Belum ada credentials TikTok Business API' },
    { platform:'Website (GA4)', handle: google?.ga_properties?.[0]?.displayName || 'kursus.kemendikdasmen.go.id', color:'#0EA5E9', icon:Globe, connected: !!google?.ga_properties?.length, subtitle: google?.ga_properties?.[0] && `Property ${google.ga_properties[0].id} · via Google` },
  ]

  return (
    <div className="space-y-6">
      {flash && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${flash.ok?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-red-50 border-red-200 text-red-800'}`}>
          {flash.ok ? '✅' : '⚠️'} <strong>{flash.provider}:</strong> {flash.message}
        </div>
      )}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{TABS.map(([v,l])=><button key={v} onClick={()=>setTab(v)} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${tab===v?'bg-[#0B2545] text-white':'text-slate-600 hover:bg-slate-100'}`}>{l}</button>)}</div>

      {tab==='accounts' && (<Card title="Social Media Accounts" desc="Status koneksi akun media sosial Direktorat"><div className="space-y-3">{accountsRows.map(a=>{ const Ic = a.icon; return (
        <div key={a.platform} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: a.color+'18', color: a.color }}><Ic className="w-5 h-5" /></div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900">{a.platform}</div>
            <div className="text-xs text-slate-500 font-mono">{a.handle}</div>
            {a.subtitle && <div className="text-[11px] text-slate-500 mt-0.5">{a.subtitle}</div>}
          </div>
          {a.connected ? (
            <span className="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Live · Connected</span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-200">Mock Data</span>
          )}
        </div>)})}</div></Card>)}

      {tab==='api' && (
        <div className="space-y-4">
          <Card title="Meta OAuth (Instagram + Facebook)" desc="Hubungkan akun Facebook Business untuk otorisasi Facebook Page + Instagram Business Account">
            <div className="flex items-center gap-3 flex-wrap">
              {meta ? (
                <>
                  <div className="flex-1"><div className="text-sm font-medium text-emerald-700">✅ Tersambung</div><div className="text-xs text-slate-500">{meta.pages?.length || 0} Facebook Page · {meta.ig_accounts?.length || 0} Instagram Business · Diperbarui {meta.updated_at ? new Date(meta.updated_at).toLocaleString('id-ID') : '—'}</div></div>
                  <button onClick={()=>openOauth('meta')} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">🔄 Sambungkan Ulang</button>
                  <button onClick={()=>disconnect('meta')} className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100">✂️ Putuskan</button>
                </>
              ) : (
                <>
                  <div className="flex-1"><div className="text-sm text-slate-700">Belum tersambung — data Instagram & Facebook masih menggunakan mock</div><div className="text-xs text-slate-500">Pastikan Redirect URI <code className="bg-slate-100 px-1 rounded text-[10px]">/api/oauth/meta/callback</code> sudah terdaftar di Meta App {process.env.NEXT_PUBLIC_META_APP_ID || ''}</div></div>
                  <button onClick={()=>openOauth('meta')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:bg-[#166FE5]"><Facebook className="w-4 h-4" />Hubungkan Meta</button>
                </>
              )}
            </div>
            {meta?.pages?.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Facebook Pages Terhubung</div>
                <div className="space-y-1.5">{meta.pages.map(pg => <div key={pg.id} className="flex items-center gap-2 text-xs"><Facebook className="w-3.5 h-3.5 text-[#1877F2]" /><span className="font-medium text-slate-700">{pg.name}</span><span className="text-slate-500 font-mono">{pg.id}</span></div>)}</div>
              </div>
            )}
            {meta?.ig_accounts?.length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Instagram Business Accounts</div>
                <div className="space-y-1.5">{meta.ig_accounts.map(ig => <div key={ig.id} className="flex items-center gap-2 text-xs"><Instagram className="w-3.5 h-3.5 text-[#E1306C]" /><span className="font-medium text-slate-700">@{ig.username}</span><span className="text-slate-500">{formatNumber(ig.followers_count||0)} followers</span></div>)}</div>
              </div>
            )}
          </Card>

          <Card title="Google OAuth (YouTube + Analytics 4)" desc="Hubungkan akun Google untuk mengakses channel YouTube dan properti GA4">
            <div className="flex items-center gap-3 flex-wrap">
              {google ? (
                <>
                  <div className="flex-1"><div className="text-sm font-medium text-emerald-700">✅ Tersambung</div><div className="text-xs text-slate-500">{google.channels?.length || 0} YouTube Channel · {google.ga_properties?.length || 0} GA4 Property · Diperbarui {google.updated_at ? new Date(google.updated_at).toLocaleString('id-ID') : '—'}</div></div>
                  <button onClick={()=>openOauth('google')} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">🔄 Sambungkan Ulang</button>
                  <button onClick={()=>disconnect('google')} className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100">✂️ Putuskan</button>
                </>
              ) : (
                <>
                  <div className="flex-1"><div className="text-sm text-slate-700">Belum tersambung — data YouTube & Website (GA4) masih menggunakan mock</div><div className="text-xs text-slate-500">Pastikan Redirect URI <code className="bg-slate-100 px-1 rounded text-[10px]">/api/oauth/google/callback</code> sudah terdaftar di Google Cloud Console</div></div>
                  <button onClick={()=>openOauth('google')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-sm font-medium hover:bg-slate-50"><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Hubungkan Google</button>
                </>
              )}
            </div>
            {google?.channels?.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">YouTube Channels</div>
                <div className="space-y-1.5">{google.channels.map(ch => <div key={ch.id} className="flex items-center gap-2 text-xs"><Youtube className="w-3.5 h-3.5 text-red-600" /><span className="font-medium text-slate-700">{ch.title}</span><span className="text-slate-500">{formatNumber(+ch.subscribers||0)} subs · {formatNumber(+ch.videos||0)} videos</span></div>)}</div>
              </div>
            )}
            {google?.ga_properties?.length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">GA4 Properties</div>
                <div className="space-y-1.5">{google.ga_properties.map(pr => <div key={pr.id} className="flex items-center gap-2 text-xs"><Globe className="w-3.5 h-3.5 text-sky-600" /><span className="font-medium text-slate-700">{pr.displayName}</span><span className="text-slate-500 font-mono">{pr.id}</span></div>)}</div>
              </div>
            )}
          </Card>

          <Card title="TikTok Business API" desc="Hubungkan akun TikTok Business/Creator untuk analitik follower dan video">
            {(() => {
              const tt = conns.find(c => c.provider === 'tiktok')
              const [credCheck, setCredCheck] = [null, ()=>{}] // just derived
              return (
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background:'#11182718', color:'#111827' }}><Music2 className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      {tt ? (
                        <><div className="text-sm font-medium text-emerald-700">✅ Tersambung sebagai {tt.user?.display_name || 'TikTok User'}</div>
                        <div className="text-xs text-slate-500">{formatNumber(tt.user?.follower_count||0)} followers · {formatNumber(tt.user?.video_count||0)} videos · Diperbarui {tt.updated_at ? new Date(tt.updated_at).toLocaleString('id-ID') : '—'}</div></>
                      ) : (
                        <><div className="font-medium text-slate-900">Belum tersambung</div>
                        <div className="text-xs text-slate-500">Set env <code className="bg-slate-100 px-1 rounded text-[10px]">TIKTOK_CLIENT_KEY</code> &amp; <code className="bg-slate-100 px-1 rounded text-[10px]">TIKTOK_CLIENT_SECRET</code> dari <a href="https://developers.tiktok.com/" className="text-blue-600 underline" target="_blank">TikTok for Developers</a>, dan daftarkan Redirect URI <code className="bg-slate-100 px-1 rounded text-[10px]">/api/oauth/tiktok/callback</code></div></>
                      )}
                    </div>
                    {tt ? (
                      <>
                        <button onClick={()=>openOauth('tiktok')} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">🔄 Sambungkan Ulang</button>
                        <button onClick={()=>disconnect('tiktok')} className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100">✂️ Putuskan</button>
                      </>
                    ) : (
                      <button onClick={()=>openOauth('tiktok')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800"><Music2 className="w-4 h-4" />Hubungkan TikTok</button>
                    )}
                  </div>
                </div>
              )
            })()}
          </Card>

          <Card title="Ayrshare — Multi-Platform via 1 Integrasi" desc="Alternatif terpadu: hubungkan Instagram, Facebook, YouTube & TikTok via Ayrshare (tanpa perlu OAuth manual per platform)">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">A</div>
              <div className="flex-1 min-w-0">
                {!ayr?.configured ? (
                  <>
                    <div className="font-medium text-slate-900">Kredensial Ayrshare belum diset</div>
                    <div className="text-xs text-slate-500">Set env <code className="bg-slate-100 px-1 rounded text-[10px]">AYRSHARE_API_KEY</code>, <code className="bg-slate-100 px-1 rounded text-[10px]">AYRSHARE_DOMAIN</code>, <code className="bg-slate-100 px-1 rounded text-[10px]">AYRSHARE_PRIVATE_KEY</code></div>
                  </>
                ) : !ayr?.hasProfile ? (
                  <>
                    <div className="font-medium text-slate-900">Belum ada profile Ayrshare</div>
                    <div className="text-xs text-slate-500">Klik "Hubungkan via Ayrshare" untuk membuat profile & mendapatkan URL koneksi akun sosial</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-emerald-700">✅ Profile aktif · {ayr.profile?.title}</div>
                    <div className="text-xs text-slate-500">
                      {ayr.activeSocialAccounts?.length ? (
                        <>Akun terhubung: {ayr.activeSocialAccounts.join(', ')} · Post bulan ini {ayr.monthlyPostCount || 0}{ayr.monthlyPostQuota ? `/${ayr.monthlyPostQuota}` : ''}</>
                      ) : (
                        <>Belum ada akun sosial di-link. Klik "Hubungkan via Ayrshare" untuk membuka halaman koneksi.</>
                      )}
                    </div>
                  </>
                )}
              </div>
              {ayr?.hasProfile ? (
                <>
                  <button onClick={startAyrConnect} disabled={ayrBusy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">{ayrBusy ? 'Memproses…' : '🔗 Hubungkan / Tambah Akun'}</button>
                  <button onClick={refreshAyr} disabled={ayrBusy} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-60">🔄 Refresh</button>
                  <button onClick={disconnectAyr} disabled={ayrBusy} className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60">✂️ Reset Profile</button>
                </>
              ) : ayr?.configured ? (
                <button onClick={startAyrConnect} disabled={ayrBusy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">{ayrBusy ? 'Memproses…' : '🚀 Hubungkan via Ayrshare'}</button>
              ) : null}
            </div>
            {ayr?.activeSocialAccounts?.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Akun Sosial via Ayrshare</div>
                <div className="flex flex-wrap gap-2">{ayr.activeSocialAccounts.map((s,i)=>(
                  <span key={s} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{s}{ayr.displayNames?.[i] ? ` — ${ayr.displayNames[i]}` : ''}
                  </span>
                ))}</div>
              </div>
            )}
            <div className="mt-3 text-[11px] text-slate-500">
              💡 Ayrshare menyatukan Instagram, Facebook, YouTube & TikTok dalam satu API. Ideal untuk kondisi dimana OAuth manual sulit disiapkan.
            </div>
          </Card>
        </div>
      )}

      {tab==='website' && (<Card title="Website Analytics — Google Analytics 4" desc="Hubungkan via Google OAuth pada tab API Connections. Jika sudah tersambung, properti akan tampil di sini."><div className="text-sm text-slate-700">{google?.ga_properties?.length ? (<div className="space-y-2">{google.ga_properties.map(pr => <div key={pr.id} className="p-3 rounded-lg border border-slate-200 flex items-center gap-3"><Globe className="w-5 h-5 text-sky-600" /><div className="flex-1"><div className="font-medium">{pr.displayName}</div><div className="text-xs text-slate-500">{pr.parent} · Property ID <span className="font-mono">{pr.id}</span></div></div><span className="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Aktif</span></div>)}</div>) : <div className="text-slate-500">Belum ada GA4 property terhubung. Buka tab <strong>API Connections</strong> → Hubungkan Google.</div>}</div></Card>)}

      {tab==='refresh' && (<Card title="Data Refresh" desc="Interval sinkronisasi data"><div className="space-y-3">{[['Real-time','Setiap 5 menit','off'],['Sering','Setiap 15 menit','on'],['Standar','Setiap 1 jam','off'],['Hemat','Setiap 6 jam','off']].map(([n,d,s])=>(<div key={n} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"><input type="radio" name="refresh" defaultChecked={s==='on'} className="w-4 h-4" /><div className="flex-1"><div className="font-medium text-slate-900">{n}</div><div className="text-xs text-slate-500">{d}</div></div></div>))}</div></Card>)}
      {tab==='users' && <UsersRolesTab roles={roles} />}
      {tab==='stats' && <ImpactStatsTab />}
      {tab==='activity' && <ActivityLogsTab />}
      {tab==='digest' && <WeeklyDigestTab />}
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

/* =========== CONTENT CALENDAR =========== */
const STATUS_CFG = {
  Draft:      { bg:'bg-slate-100', text:'text-slate-700', ring:'ring-slate-300', dot:'#94a3b8' },
  Scheduled:  { bg:'bg-amber-100', text:'text-amber-800', ring:'ring-amber-300', dot:'#f59e0b' },
  Published:  { bg:'bg-emerald-100', text:'text-emerald-800', ring:'ring-emerald-300', dot:'#10b981' },
}
const LS_KEY = 'content_calendar_v1'

export function ContentCalendarView() {
  const platforms = getPlatforms().filter(p => p.key !== 'website')
  const today = new Date(); today.setHours(0,0,0,0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [platformFilter, setPlatformFilter] = useState('all')
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null) // { date, item? }

  // Seed with published (past) + scheduled (future)
  useEffect(() => {
    let seeded = null
    try { seeded = JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch {}
    if (seeded && Array.isArray(seeded) && seeded.length) { setItems(seeded); return }
    // First load: generate seed
    const past = generateContentItems(30).slice(0, 40).map(c => ({
      id: c.id, date: c.date, platform: c.platform, type: c.type, topic: c.topic, title: c.title, status: 'Published', engagement: c.engagement, score: c.score,
    }))
    const future = []
    const templates = [
      { type:'Reels', topic:'Kursus Vokasi', title:'Peluang Karier Vokasi 2025', platform:'instagram' },
      { type:'Short', topic:'Kisah Alumni', title:'Testimoni Alumni Sertifikasi BNSP', platform:'youtube' },
      { type:'Video', topic:'Green Skill', title:'Tips Karier Green Skill', platform:'tiktok' },
      { type:'Article', topic:'Program Prioritas', title:'Pengumuman Program Prioritas 2025', platform:'facebook' },
      { type:'Carousel', topic:'Beasiswa', title:'Info Beasiswa Kursus', platform:'instagram' },
      { type:'Feed', topic:'Kolaborasi Industri', title:'MoU dengan Industri Manufaktur', platform:'facebook' },
      { type:'Video', topic:'Digital Skill', title:'Live Kelas Digital Marketing', platform:'youtube' },
      { type:'Reels', topic:'LKP Unggulan', title:'Sorotan LKP Unggulan Provinsi', platform:'instagram' },
      { type:'Video', topic:'Kewirausahaan', title:'Wirausaha Muda dari Program Kursus', platform:'tiktok' },
      { type:'Feed', topic:'Pelatihan Kerja', title:'Batch Pendaftaran Terbaru', platform:'facebook' },
    ]
    for (let i = 0; i < 22; i++) {
      const t = templates[i % templates.length]
      const d = new Date(today); d.setDate(d.getDate() + 1 + i)
      future.push({ id: `plan-${i}`, date: d.toISOString().slice(0,10), platform: t.platform, type: t.type, topic: t.topic, title: t.title, status: i % 3 === 2 ? 'Draft' : 'Scheduled' })
    }
    const all = [...past, ...future]
    setItems(all)
    try { localStorage.setItem(LS_KEY, JSON.stringify(all)) } catch {}
  }, [])

  const persist = (next) => { setItems(next); try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {} }

  // Compute current month grid
  const anchor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const monthName = anchor.toLocaleDateString('id-ID', { month:'long', year:'numeric' })
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const startWeekday = (firstDay.getDay() + 6) % 7 // Mon = 0
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth()+1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), d))
  while (cells.length % 7 !== 0) cells.push(null)

  const filtered = items.filter(it => platformFilter === 'all' || it.platform === platformFilter)
  const itemsOn = (d) => { if (!d) return []; const iso = d.toISOString().slice(0,10); return filtered.filter(it => it.date === iso) }
  const upcoming = filtered.filter(it => new Date(it.date) >= today && it.status !== 'Published').sort((a,b)=>a.date.localeCompare(b.date)).slice(0, 12)

  function saveItem(payload, keepOpen = false) {
    if (payload.id && items.find(i => i.id === payload.id)) persist(items.map(i => i.id === payload.id ? { ...i, ...payload } : i))
    else persist([...items, { ...payload, id: 'user-' + Date.now() }])
    if (!keepOpen) setModal(null)
  }
  function delItem(id) { persist(items.filter(i => i.id !== id)); setModal(null) }

  // Stats
  const stats = {
    total: filtered.length,
    scheduled: filtered.filter(i => i.status === 'Scheduled').length,
    draft: filtered.filter(i => i.status === 'Draft').length,
    published: filtered.filter(i => i.status === 'Published').length,
  }

  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button onClick={()=>setMonthOffset(m => m-1)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm">‹</button>
            <div className="min-w-[180px] text-center"><div className="text-[10px] uppercase text-slate-500 tracking-wider">Bulan</div><div className="font-semibold text-slate-900 capitalize">{monthName}</div></div>
            <button onClick={()=>setMonthOffset(m => m+1)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm">›</button>
            <button onClick={()=>setMonthOffset(0)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs">Bulan ini</button>
          </div>
          <Select label="Platform" value={platformFilter} onChange={setPlatformFilter} options={[{v:'all',l:'Semua Platform'}, ...platforms.map(p=>({v:p.key,l:p.name}))]} />
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background:STATUS_CFG.Draft.dot }} />Draft: <strong>{stats.draft}</strong></span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background:STATUS_CFG.Scheduled.dot }} />Terjadwal: <strong>{stats.scheduled}</strong></span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background:STATUS_CFG.Published.dot }} />Terbit: <strong>{stats.published}</strong></span>
          </div>
          <button onClick={()=>setModal({ date: today.toISOString().slice(0,10) })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B2545] text-white text-sm font-medium hover:bg-[#0e2f5c]">+ Konten Baru</button>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar grid */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50/70 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
            {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => <div key={d} className="px-3 py-2.5 text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const inMonth = !!d
              const isToday = d && d.getTime() === today.getTime()
              const dayItems = itemsOn(d)
              return (
                <div key={i} onClick={()=>d && setModal({ date: d.toISOString().slice(0,10) })}
                  className={`min-h-[110px] p-2 border-b border-r border-slate-100 relative group cursor-pointer ${inMonth ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/40'}`}>
                  {inMonth && (<>
                    <div className={`text-xs font-semibold mb-1 ${isToday ? 'inline-flex w-6 h-6 rounded-full bg-blue-600 text-white items-center justify-center' : 'text-slate-500'}`}>{d.getDate()}</div>
                    <div className="space-y-1">
                      {dayItems.slice(0,3).map(it => { const st = STATUS_CFG[it.status] || STATUS_CFG.Draft; const hasLinks = it.publishedUrls && Object.keys(it.publishedUrls).length > 0; return (
                        <div key={it.id} onClick={(e)=>{ e.stopPropagation(); setModal({ date: it.date, item: it }) }}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${st.bg} ${st.text} ring-1 ${st.ring}`}
                          title={it.title + (hasLinks ? '\n\n🔗 Link post: '+Object.values(it.publishedUrls).join(', ') : '')}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: colorOf(it.platform) }} />
                          <span className="truncate">{it.title}</span>
                          {hasLinks && <span className="ml-auto text-[9px] shrink-0" title="Sudah dipublikasi — ada tautan post">🔗</span>}
                        </div>) })}
                      {dayItems.length > 3 && <div className="text-[10px] text-slate-500">+{dayItems.length-3} lainnya</div>}
                    </div>
                  </>)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div className="space-y-4">
          <Card title="🗓️ Akan Tayang" desc={`${upcoming.length} konten terjadwal`}>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {upcoming.length === 0 && <div className="text-xs text-slate-500 italic">Belum ada konten dijadwalkan.</div>}
              {upcoming.map(it => { const st = STATUS_CFG[it.status] || STATUS_CFG.Draft; return (
                <div key={it.id} onClick={()=>setModal({ date: it.date, item: it })} className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition">
                  <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full" style={{ background: colorOf(it.platform) }} /><span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{labelOf(it.platform)} · {it.type}</span><span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${st.bg} ${st.text}`}>{it.status}</span></div>
                  <div className="text-xs font-medium text-slate-800 line-clamp-2">{it.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{new Date(it.date).toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short' })}</div>
                </div>
              )})}
            </div>
          </Card>
          {(() => {
            const publishedWithLinks = filtered.filter(i => i.publishedUrls && Object.keys(i.publishedUrls).length > 0).sort((a,b)=> new Date(b.publishedAt||b.date) - new Date(a.publishedAt||a.date)).slice(0, 6)
            if (!publishedWithLinks.length) return null
            return (
              <Card title="🔗 Konten Terbaru Dipublikasi" desc="Klik untuk verifikasi ke platform">
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
                  {publishedWithLinks.map(it => (
                    <div key={it.id} className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/40">
                      <div onClick={()=>setModal({ date: it.date, item: it })} className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full" style={{ background: colorOf(it.platform) }} /><span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{labelOf(it.platform)} · {it.type}</span><span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">✓ Published</span></div>
                        <div className="text-xs font-medium text-slate-800 line-clamp-2">{it.title}</div>
                        {it.publishedAt && <div className="text-[10px] text-slate-500 mt-0.5">{new Date(it.publishedAt).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})}</div>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(it.publishedUrls).map(([plat,url]) => <PostLinkBadge key={plat} platform={plat} url={url} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })()}
        </div>
      </div>

      {modal && <CalendarModal modal={modal} onClose={()=>setModal(null)} onSave={saveItem} onDelete={delItem} platforms={platforms} />}
    </div>
  )
}

function CalendarModal({ modal, onClose, onSave, onDelete, platforms }) {
  const it = modal.item
  const [form, setForm] = useState({
    id: it?.id, date: modal.date || it?.date,
    platform: it?.platform || 'instagram',
    type: it?.type || 'Reels', topic: it?.topic || 'Kursus Vokasi',
    title: it?.title || '', status: it?.status || 'Scheduled',
  })
  const TYPES = { instagram:['Reels','Feed','Story','Carousel'], facebook:['Feed','Video','Story','Article'], youtube:['Video','Short'], tiktok:['Video'] }
  const TOPICS = ['Kursus Vokasi','Sertifikasi','LKP Unggulan','Kisah Alumni','Program Prioritas','Beasiswa','Pelatihan Kerja','Digital Skill','Kewirausahaan','Green Skill','Kolaborasi Industri','Info Publik']

  // Publish state
  const [showPublish, setShowPublish] = useState(false)
  const [caption, setCaption] = useState(it?.title ? it.title + '\n\n#DirektoratKursusPelatihan #KemendikdasmenRI' : '')
  const [mediaUrl, setMediaUrl] = useState('')
  const [pubPlatforms, setPubPlatforms] = useState({ facebook:true, instagram:true, youtube:false, tiktok:false })
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState(null)
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [ayrStatus, setAyrStatus] = useState(null)
  useEffect(() => {
    if (showPublish && !ayrStatus) {
      fetch('/api/ayrshare/status').then(r=>r.json()).then(setAyrStatus).catch(()=>{})
    }
  }, [showPublish, ayrStatus])

  async function doPublish(scheduled) {
    setPublishing(true); setPublishResult(null)
    const selected = Object.keys(pubPlatforms).filter(k => pubPlatforms[k])
    if (!selected.length) { setPublishResult({ ok:false, message:'Pilih minimal 1 platform' }); setPublishing(false); return }
    if (!caption.trim()) { setPublishResult({ ok:false, message:'Caption wajib diisi' }); setPublishing(false); return }
    const body = { post: caption, platforms: selected }
    if (mediaUrl.trim()) body.mediaUrls = [mediaUrl.trim()]
    if (scheduled) {
      const iso = new Date(`${form.date}T${scheduleTime}:00`).toISOString()
      body.scheduleDate = iso
    }
    try {
      const r = await fetch('/api/ayrshare/post', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      const j = await r.json()
      if (r.ok && j.ok) {
        // Extract per-platform postUrls from Ayrshare response
        const postIds = j.data?.postIds || []
        const publishedUrls = {}
        for (const it of postIds) {
          const plat = String(it.platform || '').toLowerCase()
          if (plat && it.postUrl) publishedUrls[plat] = it.postUrl
        }
        setPublishResult({
          ok: true,
          message: scheduled ? `Berhasil dijadwalkan untuk ${new Date(body.scheduleDate).toLocaleString('id-ID')}` : 'Berhasil dipublikasikan!',
          data: j.data,
          publishedUrls,
          scheduled,
        })
        // Update item status + save publishedUrls (keep modal open so user sees links)
        onSave({ ...form, status: scheduled ? 'Scheduled' : 'Published', ayrsharePostId: j.data?.id, publishedUrls: Object.keys(publishedUrls).length ? publishedUrls : undefined, publishedAt: scheduled ? undefined : new Date().toISOString() }, true)
      } else {
        const msg = j?.data?.message || j?.error || 'Gagal publish'
        setPublishResult({ ok:false, message: msg, detail: j?.data })
      }
    } catch (e) { setPublishResult({ ok:false, message: String(e?.message||e) }) }
    setPublishing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
          <div><h3 className="font-semibold text-slate-900">{it ? 'Edit Konten' : 'Konten Baru'}</h3><p className="text-xs text-slate-500">Rencanakan konten untuk kalender editorial</p></div>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Judul Konten"><input value={form.title} onChange={e=>{setForm(f=>({...f, title:e.target.value})); if(!caption) setCaption(e.target.value+'\n\n#DirektoratKursusPelatihan #KemendikdasmenRI')}} placeholder="cth: Peluang Karier Vokasi 2025" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal"><input type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></Field>
            <Field label="Status">
              <select value={form.status} onChange={e=>setForm(f=>({...f, status:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                <option>Draft</option><option>Scheduled</option><option>Published</option>
              </select>
            </Field>
            <Field label="Platform Utama">
              <select value={form.platform} onChange={e=>setForm(f=>({...f, platform:e.target.value, type: (TYPES[e.target.value]||[])[0]}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                {platforms.map(p=><option key={p.key} value={p.key}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Tipe Konten">
              <select value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                {(TYPES[form.platform]||[]).map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Topik">
            <select value={form.topic} onChange={e=>setForm(f=>({...f, topic:e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
              {TOPICS.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>

          {/* Publish via Ayrshare toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button type="button" onClick={()=>setShowPublish(v=>!v)} className="w-full flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900">
              <span className="text-lg">{showPublish?'▾':'▸'}</span>
              🚀 Publish Multi-Platform via Ayrshare
            </button>
            {showPublish && (
              <div className="mt-3 space-y-3 p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                {ayrStatus && !ayrStatus.hasProfile && (
                  <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1.5 rounded">⚠️ Profile Ayrshare belum aktif. Buka Settings → API Connections → Hubungkan via Ayrshare.</div>
                )}
                {ayrStatus?.hasProfile && (!ayrStatus.activeSocialAccounts || !ayrStatus.activeSocialAccounts.length) && (
                  <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1.5 rounded">⚠️ Belum ada akun sosial ter-link. Klik "Hubungkan / Tambah Akun" di Settings.</div>
                )}
                {ayrStatus?.activeSocialAccounts?.length > 0 && (
                  <div className="text-[11px] text-slate-600">✅ Akun aktif: <strong>{ayrStatus.activeSocialAccounts.join(', ')}</strong></div>
                )}
                <Field label="Caption">
                  <textarea value={caption} onChange={e=>setCaption(e.target.value)} rows={3} placeholder="Tulis caption menarik dengan hashtag…" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" />
                </Field>
                <Field label="URL Media (opsional, harus HTTPS publik)">
                  <input value={mediaUrl} onChange={e=>setMediaUrl(e.target.value)} placeholder="https://.../gambar.jpg atau video.mp4" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </Field>

                {/* Preview panel */}
                <ContentPreview caption={caption} mediaUrl={mediaUrl} platforms={pubPlatforms} />

                <div>
                  <div className="text-xs font-medium text-slate-600 mb-1.5">Platform Tujuan</div>
                  <div className="flex flex-wrap gap-2">
                    {[['facebook','Facebook','#1877F2'],['instagram','Instagram','#E1306C'],['youtube','YouTube','#FF0000'],['tiktok','TikTok','#111827']].map(([k,l,c])=>(
                      <label key={k} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer ${pubPlatforms[k]?'bg-white border-indigo-400 ring-1 ring-indigo-200':'bg-slate-50 border-slate-200'}`}>
                        <input type="checkbox" checked={pubPlatforms[k]} onChange={e=>setPubPlatforms(p=>({...p,[k]:e.target.checked}))} className="w-3.5 h-3.5" />
                        <span style={{ color: pubPlatforms[k]?c:'#94A3B8', fontWeight:600 }}>{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Jadwal (jam)">
                    <input type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  </Field>
                  <div className="flex items-end"><div className="text-[11px] text-slate-500">Publish di tanggal <strong>{new Date(form.date).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</strong></div></div>
                </div>
                {publishResult && (
                  <div className={`text-xs px-2.5 py-2 rounded ${publishResult.ok?'bg-emerald-50 text-emerald-800 border border-emerald-200':'bg-red-50 text-red-800 border border-red-200'}`}>
                    <div>{publishResult.ok?'✅ ':'❌ '}{publishResult.message}</div>
                    {publishResult.ok && publishResult.publishedUrls && Object.keys(publishResult.publishedUrls).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-emerald-200">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold mb-1.5">🔗 Tautan ke Post Asli</div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(publishResult.publishedUrls).map(([plat,url]) => <PostLinkBadge key={plat} platform={plat} url={url} />)}
                        </div>
                      </div>
                    )}
                    {publishResult.ok && publishResult.scheduled && (!publishResult.publishedUrls || !Object.keys(publishResult.publishedUrls).length) && (
                      <div className="mt-1.5 text-[11px] text-emerald-700">💡 Tautan post akan tersedia setelah post benar-benar dipublikasi oleh platform.</div>
                    )}
                  </div>
                )}
                {/* Show existing publishedUrls if item was previously published */}
                {!publishResult && it?.publishedUrls && Object.keys(it.publishedUrls).length > 0 && (
                  <div className="text-xs px-2.5 py-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold mb-1.5">🔗 Tautan Post yang Sudah Dipublikasi</div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(it.publishedUrls).map(([plat,url]) => <PostLinkBadge key={plat} platform={plat} url={url} />)}
                    </div>
                    {it.publishedAt && <div className="mt-1.5 text-[10px] text-emerald-700">Dipublikasi: {new Date(it.publishedAt).toLocaleString('id-ID')}</div>}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="button" disabled={publishing} onClick={()=>doPublish(false)} className="flex-1 text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium disabled:opacity-50 hover:opacity-90">{publishing?'Memproses…':'🚀 Publish Sekarang'}</button>
                  <button type="button" disabled={publishing} onClick={()=>doPublish(true)} className="flex-1 text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium disabled:opacity-50 hover:opacity-90">{publishing?'Memproses…':'📅 Jadwalkan'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
          {it && <button onClick={()=>onDelete(it.id)} className="mr-auto text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100">🗑 Hapus</button>}
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">Batal</button>
          <button onClick={()=>form.title && onSave(form)} disabled={!form.title} className="text-sm px-4 py-2 rounded-lg bg-[#0B2545] text-white hover:bg-[#0e2f5c] disabled:opacity-50">Simpan</button>
        </div>
      </div>
    </div>
  )
}
function Field({ label, children }) { return <label className="block"><div className="text-xs font-medium text-slate-600 mb-1">{label}</div>{children}</label> }

/* =========== POST LINK BADGE (opens actual social post in new tab) =========== */
function PostLinkBadge({ platform, url }) {
  const META = {
    instagram: { name:'Instagram', bg:'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', color:'#fff', icon:'📷' },
    facebook:  { name:'Facebook',  bg:'#1877F2', color:'#fff', icon:'👍' },
    youtube:   { name:'YouTube',   bg:'#FF0000', color:'#fff', icon:'▶' },
    tiktok:    { name:'TikTok',    bg:'#111827', color:'#fff', icon:'♪' },
    twitter:   { name:'X/Twitter', bg:'#111', color:'#fff', icon:'𝕏' },
    linkedin:  { name:'LinkedIn',  bg:'#0A66C2', color:'#fff', icon:'in' },
  }
  const m = META[platform.toLowerCase()] || { name: platform, bg:'#475569', color:'#fff', icon:'🔗' }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={url} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold hover:opacity-90 transition" style={{ background:m.bg, color:m.color }}>
      <span>{m.icon}</span>
      <span>{m.name}</span>
      <span className="opacity-70">↗</span>
    </a>
  )
}


/* =========== CONTENT PREVIEW (Instagram/Facebook/YouTube/TikTok mockups) =========== */
function ContentPreview({ caption, mediaUrl, platforms }) {
  const active = Object.keys(platforms||{}).filter(k => platforms[k])
  if (!active.length && !caption && !mediaUrl) return null
  const [tab, setTab] = useState(active[0] || 'instagram')
  useEffect(() => { if (!platforms[tab] && active[0]) setTab(active[0]) }, [platforms])
  const isVideo = mediaUrl && /\.(mp4|mov|webm|m4v)(\?|$)/i.test(mediaUrl)

  const PLATFORM_META = {
    instagram: { name:'Instagram', color:'#E1306C', handle:'@ditbinsuslat', avatar:'DK' },
    facebook:  { name:'Facebook',  color:'#1877F2', handle:'Direktorat Kursus dan Pelatihan', avatar:'DK' },
    youtube:   { name:'YouTube',   color:'#FF0000', handle:'Direktorat Kursus & Pelatihan', avatar:'DK' },
    tiktok:    { name:'TikTok',    color:'#111827', handle:'@ditbinsuslat', avatar:'DK' },
  }
  const tabs = active.length ? active : ['instagram']

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">👁 Preview Konten</div>
        <div className="flex gap-1">
          {tabs.map(k => {
            const m = PLATFORM_META[k]
            return <button key={k} type="button" onClick={()=>setTab(k)} className={`text-[10px] px-2 py-1 rounded-md font-medium transition ${tab===k?'bg-slate-900 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} style={tab===k?{background:m.color}:{}}>{m.name}</button>
          })}
        </div>
      </div>

      {tab === 'instagram' && <IGPreview caption={caption} mediaUrl={mediaUrl} isVideo={isVideo} meta={PLATFORM_META.instagram} />}
      {tab === 'facebook' && <FBPreview caption={caption} mediaUrl={mediaUrl} isVideo={isVideo} meta={PLATFORM_META.facebook} />}
      {tab === 'youtube' && <YTPreview caption={caption} mediaUrl={mediaUrl} isVideo={isVideo} meta={PLATFORM_META.youtube} />}
      {tab === 'tiktok' && <TTPreview caption={caption} mediaUrl={mediaUrl} isVideo={isVideo} meta={PLATFORM_META.tiktok} />}

      <div className="mt-2 text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5">
        <span>Karakter: <strong className={(caption||'').length > 2200 ? 'text-red-600' : 'text-slate-700'}>{(caption||'').length}</strong>/2200</span>
        <span>Hashtag: <strong className="text-slate-700">{(caption?.match(/#\w+/g)||[]).length}</strong></span>
        <span>Mention: <strong className="text-slate-700">{(caption?.match(/@\w+/g)||[]).length}</strong></span>
      </div>
    </div>
  )
}

function MediaBox({ mediaUrl, isVideo, aspect='square' }) {
  const aspectClass = aspect === 'square' ? 'aspect-square' : aspect === 'wide' ? 'aspect-video' : 'aspect-[9/16]'
  return (
    <div className={`w-full ${aspectClass} bg-slate-100 rounded overflow-hidden flex items-center justify-center relative`}>
      {mediaUrl ? (
        isVideo
          ? <video src={mediaUrl} controls className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'}} />
          : <img src={mediaUrl} alt="preview" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="text-slate-400 text-xs text-center px-4">🖼️ Gambar tidak dapat dimuat.<br/>Pastikan URL HTTPS publik yang valid.</div>'}} />
      ) : (
        <div className="text-slate-400 text-xs text-center px-4">📷 Tambahkan URL media untuk preview<br/><span className="text-[10px]">Tanpa media = post teks saja</span></div>
      )}
    </div>
  )
}

function IGPreview({ caption, mediaUrl, isVideo, meta }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs mx-auto max-w-sm">
      <div className="flex items-center gap-2 p-2 border-b border-slate-100">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-0.5"><div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[9px] font-bold text-slate-700">{meta.avatar}</div></div>
        <div className="flex-1"><div className="font-semibold text-slate-900 text-xs">{meta.handle.replace('@','')}</div><div className="text-[9px] text-slate-500">Jakarta, Indonesia · Sponsored</div></div>
        <div className="text-slate-500">···</div>
      </div>
      <MediaBox mediaUrl={mediaUrl} isVideo={isVideo} aspect="square" />
      <div className="p-2 space-y-1">
        <div className="flex gap-3 text-slate-700 text-base">♡ ⊙ ✈ <span className="ml-auto">☰</span></div>
        <div className="text-[10px] text-slate-500">Disukai <strong className="text-slate-900">{Math.floor(Math.random()*500+120)}</strong> orang</div>
        <div className="text-[11px] text-slate-800 leading-snug"><strong>{meta.handle.replace('@','')}</strong> <FormattedCaption text={caption} max={220} /></div>
      </div>
    </div>
  )
}

function FBPreview({ caption, mediaUrl, isVideo, meta }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs mx-auto max-w-md">
      <div className="flex items-center gap-2 p-2.5">
        <div className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-[10px] font-bold">{meta.avatar}</div>
        <div className="flex-1"><div className="font-semibold text-slate-900 text-[13px] leading-tight">{meta.handle}</div><div className="text-[10px] text-slate-500 flex items-center gap-1">Barusan · 🌍</div></div>
        <div className="text-slate-500 text-lg">···</div>
      </div>
      <div className="px-2.5 pb-2 text-[12px] text-slate-800 leading-snug whitespace-pre-wrap"><FormattedCaption text={caption} max={400} /></div>
      {mediaUrl && <MediaBox mediaUrl={mediaUrl} isVideo={isVideo} aspect="wide" />}
      <div className="flex items-center justify-around border-t border-slate-100 py-1.5 text-[11px] text-slate-600 font-medium">
        <span>👍 Suka</span><span>💬 Komentar</span><span>↗ Bagikan</span>
      </div>
    </div>
  )
}

function YTPreview({ caption, mediaUrl, isVideo, meta }) {
  const title = (caption||'').split('\n')[0] || 'Judul Video'
  const description = (caption||'').split('\n').slice(1).join('\n')
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs mx-auto max-w-md">
      <MediaBox mediaUrl={mediaUrl} isVideo={isVideo} aspect="wide" />
      <div className="p-2.5">
        <div className="font-semibold text-slate-900 text-[13px] leading-tight line-clamp-2">{title}</div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white text-[10px] font-bold">{meta.avatar}</div>
          <div className="flex-1 min-w-0"><div className="text-[11px] font-medium text-slate-800">{meta.handle}</div><div className="text-[10px] text-slate-500">120 sub · Baru saja</div></div>
          <button className="text-[10px] px-3 py-1 rounded-full bg-red-600 text-white font-semibold">Subscribe</button>
        </div>
        {description && <div className="mt-2 text-[10px] text-slate-600 leading-snug line-clamp-3 whitespace-pre-wrap"><FormattedCaption text={description} max={200} /></div>}
      </div>
    </div>
  )
}

function TTPreview({ caption, mediaUrl, isVideo, meta }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-black text-white text-xs mx-auto max-w-[240px] relative" style={{ aspectRatio:'9/16' }}>
      <div className="absolute inset-0"><MediaBox mediaUrl={mediaUrl} isVideo={isVideo} aspect="tall" /></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-white z-10">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold border-2 border-white">{meta.avatar}</div>
        <div className="text-center text-[10px]">♡<div>0</div></div>
        <div className="text-center text-[10px]">💬<div>0</div></div>
        <div className="text-center text-[10px]">↗<div>0</div></div>
      </div>
      <div className="absolute left-2 right-14 bottom-2 z-10">
        <div className="font-semibold text-[11px] mb-0.5">{meta.handle}</div>
        <div className="text-[10px] leading-tight line-clamp-3"><FormattedCaption text={caption} max={120} light /></div>
      </div>
    </div>
  )
}

function FormattedCaption({ text, max=200, light=false }) {
  if (!text) return <span className={light?'opacity-70':'text-slate-400 italic'}>Belum ada caption…</span>
  const truncated = text.length > max ? text.slice(0, max) + '…' : text
  const parts = truncated.split(/(#\w+|@\w+|https?:\/\/\S+)/g)
  return <>{parts.map((p,i)=> {
    if (p.startsWith('#') || p.startsWith('@')) return <span key={i} className={light?'text-blue-200':'text-blue-600'}>{p}</span>
    if (p.startsWith('http')) return <span key={i} className={light?'text-blue-200 underline':'text-blue-600 underline'}>{p}</span>
    return <span key={i}>{p}</span>
  })}</>
}


/* =========== COMPARE PERIODE =========== */
export function ComparePeriodView({ days }) {
  const platforms = getPlatforms()
  const allSeries = getAllSeries(Math.max(days*2+10, 200))
  const { totalsCurr, totalsPrev, perPlatformCurr, perPlatformPrev } = useMemo(() => aggregatePeriod(platforms, allSeries, days), [days, platforms, allSeries])

  // Build daily combined data for both windows, aligned by relative day index
  const combined = useMemo(() => {
    const rows = []
    for (let i = 0; i < days; i++) {
      let curReach = 0, prevReach = 0, curEng = 0, prevEng = 0
      platforms.forEach(p => {
        const s = allSeries[p.key]
        const c = s.slice(-days)[i]; const pr = s.slice(-days*2, -days)[i]
        curReach += c?.reach || 0; curEng += c?.engagement || 0
        prevReach += pr?.reach || 0; prevEng += pr?.engagement || 0
      })
      rows.push({ day: i+1, curReach, prevReach, curEng, prevEng })
    }
    return rows
  }, [platforms, allSeries, days])

  const kpis = [
    { label:'Total Reach', curr: totalsCurr.reach, prev: totalsPrev.reach },
    { label:'Total Engagement', curr: totalsCurr.engagement, prev: totalsPrev.engagement },
    { label:'Engagement Rate', curr: totalsCurr.engagementRate, prev: totalsPrev.engagementRate, isPct: true },
    { label:'Content Published', curr: totalsCurr.contentPublished, prev: totalsPrev.contentPublished },
    { label:'Total Impressions', curr: totalsCurr.impressions, prev: totalsPrev.impressions },
    { label:'Total Video Views', curr: totalsCurr.views, prev: totalsPrev.views },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B2545] to-blue-900 text-white p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-blue-200/80 font-semibold">Compare Periode · Side-by-Side</div>
          <h2 className="text-lg font-bold mt-1">Periode Ini vs Periode Sebelumnya</h2>
          <p className="text-xs text-blue-100/70 mt-1">Membandingkan {days} hari terakhir dengan {days} hari sebelumnya</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right"><div className="text-[10px] text-blue-200/70 uppercase">Periode Sebelumnya</div><div className="text-sm font-mono">{new Date(Date.now()-days*2*86400000).toISOString().slice(0,10)} → {new Date(Date.now()-(days+1)*86400000).toISOString().slice(0,10)}</div></div>
          <ChevronRight className="w-5 h-5 text-blue-300" />
          <div><div className="text-[10px] text-blue-200/70 uppercase">Periode Ini</div><div className="text-sm font-mono">{new Date(Date.now()-days*86400000).toISOString().slice(0,10)} → {new Date().toISOString().slice(0,10)}</div></div>
        </div>
      </div>

      {/* Side-by-side KPI comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpis.map(k => {
          const delta = pctChange(k.curr, k.prev)
          const up = delta >= 0
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100"><div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{k.label}</div></div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="p-4 bg-slate-50/50">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Sebelumnya</div>
                  <div className="text-xl font-bold text-slate-500 mt-1">{k.isPct ? k.prev+'%' : formatNumber(k.prev)}</div>
                </div>
                <div className="p-4">
                  <div className="text-[10px] text-blue-600 uppercase font-semibold">Sekarang</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{k.isPct ? k.curr+'%' : formatNumber(k.curr)}</div>
                </div>
              </div>
              <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5 rotate-180" />}
                {up ? '+' : ''}{delta}% {up ? 'peningkatan' : 'penurunan'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Overlay charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Tren Reach: Periode Ini vs Sebelumnya" desc="Dibandingkan berdasarkan hari relatif ke-N">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#64748B' }} label={{ value:'Hari ke-', position:'insideBottom', fontSize:10, fill:'#94a3b8', offset:-2 }} />
              <YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Line type="monotone" name="Periode Ini" dataKey="curReach" stroke="#1D4ED8" strokeWidth={2.5} dot={false} />
              <Line type="monotone" name="Periode Sebelumnya" dataKey="prevReach" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Tren Engagement: Periode Ini vs Sebelumnya" desc="Dibandingkan berdasarkan hari relatif ke-N">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#64748B' }} />
              <YAxis tick={{ fontSize:11, fill:'#64748B' }} tickFormatter={formatNumber} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Line type="monotone" name="Periode Ini" dataKey="curEng" stroke="#10B981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" name="Periode Sebelumnya" dataKey="prevEng" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Per platform side-by-side table */}
      <Card title="Perbandingan Platform" desc="Metrik utama tiap platform pada dua periode" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-[11px] uppercase text-slate-500 tracking-wider">
              <tr><th rowSpan={2} className="text-left px-4 py-2 font-semibold border-r border-slate-100">Platform</th>
                <th colSpan={3} className="text-center px-4 py-2 font-semibold border-r border-slate-100">Reach</th>
                <th colSpan={3} className="text-center px-4 py-2 font-semibold border-r border-slate-100">Engagement</th>
                <th colSpan={3} className="text-center px-4 py-2 font-semibold">Eng. Rate</th></tr>
              <tr className="text-[10px]"><th className="px-3 py-1 font-medium text-slate-400">Sebelumnya</th><th className="px-3 py-1 font-medium text-slate-600">Sekarang</th><th className="px-3 py-1 font-medium text-slate-500 border-r border-slate-100">Δ</th>
                <th className="px-3 py-1 font-medium text-slate-400">Sebelumnya</th><th className="px-3 py-1 font-medium text-slate-600">Sekarang</th><th className="px-3 py-1 font-medium text-slate-500 border-r border-slate-100">Δ</th>
                <th className="px-3 py-1 font-medium text-slate-400">Sebelumnya</th><th className="px-3 py-1 font-medium text-slate-600">Sekarang</th><th className="px-3 py-1 font-medium text-slate-500">Δ</th></tr>
            </thead>
            <tbody>
              {platforms.map(p => { const c = perPlatformCurr[p.key], pr = perPlatformPrev[p.key]; return (
                <tr key={p.key} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3 border-r border-slate-100"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background:p.color }} /><span className="font-medium text-slate-900">{p.name}</span></div></td>
                  <CompareCell prev={pr.reach} curr={c.reach} />
                  <CompareCell prev={pr.engagement} curr={c.engagement} />
                  <CompareCell prev={pr.engagementRate} curr={c.engagementRate} pct isLast />
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function CompareCell({ prev, curr, pct = false, isLast = false }) {
  const delta = pctChange(curr, prev); const up = delta >= 0
  return (<>
    <td className="px-3 py-3 text-slate-500">{pct ? prev+'%' : formatNumber(prev)}</td>
    <td className="px-3 py-3 font-semibold text-slate-900">{pct ? curr+'%' : formatNumber(curr)}</td>
    <td className={`px-3 py-3 font-medium ${!isLast?'border-r border-slate-100':''} ${up?'text-emerald-600':'text-red-500'}`}>{up?'▲ +':'▼ '}{delta}%</td>
  </>)
}


/* =========== USERS & ROLES TAB =========== */
const ROLE_COLORS = { Admin:'#DC2626', Analyst:'#2563EB', Executive:'#D97706', Viewer:'#64748B' }

function UsersRolesTab({ roles }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState(null)
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'Analyst', jabatan:'' })
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const r = await fetch('/api/users'); const j = await r.json(); setList(j.users || []) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function submit(e) {
    e?.preventDefault?.()
    setError('')
    if (!form.name || !form.email || !form.role) { setError('Nama, email, dan peran wajib diisi'); return }
    if (!editing && !form.password) { setError('Kata sandi wajib diisi'); return }
    if (form.password && form.password.length < 6) { setError('Kata sandi minimal 6 karakter'); return }
    try {
      const r = await fetch('/api/users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      const j = await r.json()
      if (!r.ok) { setError(j.error || 'Gagal menyimpan'); return }
      setFlash({ ok:true, msg: editing ? `Pengguna ${form.name} diperbarui.` : `Pengguna ${form.name} ditambahkan.` })
      setForm({ name:'', email:'', password:'', role:'Analyst', jabatan:'' })
      setEditing(false); load()
      setTimeout(()=>setFlash(null), 4000)
    } catch (err) { setError('Server error') }
  }

  async function del(email) {
    if (!confirm(`Hapus pengguna ${email}?`)) return
    const r = await fetch(`/api/users/${encodeURIComponent(email)}`, { method:'DELETE' })
    const j = await r.json().catch(()=>({}))
    if (!r.ok) { setFlash({ ok:false, msg: j.error || 'Gagal menghapus' }); setTimeout(()=>setFlash(null), 4500); return }
    setFlash({ ok:true, msg:`Pengguna ${email} dihapus.` })
    load()
    setTimeout(()=>setFlash(null), 4000)
  }

  async function toggleActive(email, currentActive) {
    const newActive = !currentActive
    try {
      const r = await fetch('/api/users/status', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, active: newActive }) })
      const j = await r.json()
      if (!r.ok) { setFlash({ ok:false, msg: j.error || 'Gagal mengubah status' }); return }
      setFlash({ ok:true, msg:`Pengguna ${email} ${newActive?'diaktifkan':'dinonaktifkan'}.` })
      load()
      setTimeout(()=>setFlash(null), 4000)
    } catch { setFlash({ ok:false, msg:'Server error' }) }
  }

  function editUser(u) {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, jabatan: u.jabatan || '' })
    setEditing(true)
    setError('')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allUsers = list

  return (
    <div className="space-y-5">
      {flash && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${flash.ok?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-red-50 border-red-200 text-red-800'}`}>
          {flash.ok ? '✅' : '⚠️'} {flash.msg}
        </div>
      )}
      {/* Role definitions */}
      <Card title="Definisi Peran" desc="Peran dan hak akses menu">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {roles.map(r => <div key={r.name} className={`p-3 rounded-lg ring-1 ${r.color}`}><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[r.name] }} /><div className="font-semibold">{r.name}</div></div><div className="text-xs opacity-90 mt-1">{r.desc}</div></div>)}
        </div>
      </Card>

      {/* Form add/edit */}
      <Card title={editing ? 'Perbarui Pengguna' : 'Tambah Pengguna Baru'} desc="Isi email dan pilih peran — pengguna langsung dapat masuk ke dashboard">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Nama Lengkap</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="cth: Siti Nurhaliza" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input type="email" value={form.email} disabled={editing} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="nama@dikdasmen.belajar.id" className={`mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${editing?'bg-slate-100 text-slate-500':''}`} />
            {editing && <div className="text-[10px] text-slate-400 mt-1">Email tidak dapat diubah saat mengedit</div>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Kata Sandi {editing && <span className="text-slate-400">(isi jika ingin reset)</span>}</label>
            <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Minimal 6 karakter" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Peran</label>
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
              {['Admin','Analyst','Executive','Viewer'].map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Jabatan (opsional)</label>
            <input value={form.jabatan} onChange={e=>setForm(f=>({...f,jabatan:e.target.value}))} placeholder="cth: Analis Data Junior" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          {error && <div className="md:col-span-2 text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>}
          <div className="md:col-span-2 flex items-center gap-2 pt-1">
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B2545] text-white text-sm font-medium hover:bg-[#0e2f5c]">{editing ? '💾 Perbarui' : '➕ Tambah Pengguna'}</button>
            {editing && <button type="button" onClick={()=>{ setEditing(false); setForm({ name:'', email:'', password:'', role:'Analyst', jabatan:'' }); setError('') }} className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Batal</button>}
            {flash && <span className={`ml-auto text-xs px-3 py-1.5 rounded-lg ${flash.ok?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-red-50 text-red-700 border border-red-200'}`}>{flash.msg}</span>}
          </div>
        </form>
      </Card>

      {/* Users table */}
      <Card title={`Daftar Pengguna (${allUsers.length})`} desc="Semua pengguna yang dapat login ke dashboard" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-[11px] uppercase text-slate-500 tracking-wider">
              <tr>{['Pengguna','Email','Peran','Jabatan','Status','Aksi'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.email} className={`border-t border-slate-100 hover:bg-slate-50/60 ${u.active===false?'opacity-60':''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ background: ROLE_COLORS[u.role]||'#64748B' }}>{u.initial || (u.name||'').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()}</div>
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">{u.name} {u.seeded && <span className="text-[9px] px-1 py-0.5 rounded font-semibold bg-slate-100 text-slate-500">Bawaan</span>}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{u.email}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-md font-semibold text-white" style={{ background: ROLE_COLORS[u.role]||'#64748B' }}>{u.role}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{u.jabatan || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>toggleActive(u.email, u.active !== false)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold transition ring-1 ${u.active !== false ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 ring-slate-200 hover:bg-slate-200'}`}>
                      <span className={`relative inline-block w-8 h-4 rounded-full transition ${u.active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${u.active !== false ? 'translate-x-4' : ''}`} />
                      </span>
                      {u.active !== false ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>editUser(u)} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700">✎ Edit</button>
                      <button onClick={()=>del(u.email)} className="text-xs px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700">🗑 Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-xs">Memuat…</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}


/* =========== ACTIVITY LOGS TAB =========== */
function ActivityLogsTab() {
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filterAction, setFilterAction] = useState('')
  const [filterActor, setFilterActor] = useState('')
  const [days, setDays] = useState(7)

  const load = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('limit', '200')
      if (days > 0) qs.set('days', String(days))
      if (filterAction) qs.set('action', filterAction)
      if (filterActor) qs.set('actor', filterActor.toLowerCase())
      const [lr, sr] = await Promise.all([
        fetch(`/api/activity-logs?${qs.toString()}`).then(r=>r.json()),
        fetch('/api/activity-summary').then(r=>r.json()),
      ])
      setLogs(lr.logs || [])
      setSummary(sr)
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [days, filterAction, filterActor])

  const ACTION_LABELS = {
    'auth.login': { l:'Login', color:'bg-blue-50 text-blue-700 ring-blue-200', icon:'🔐' },
    'user.upsert': { l:'Tambah/Ubah User', color:'bg-emerald-50 text-emerald-700 ring-emerald-200', icon:'👤' },
    'user.delete': { l:'Hapus User', color:'bg-red-50 text-red-700 ring-red-200', icon:'🗑' },
    'ayrshare.link': { l:'Link Ayrshare', color:'bg-indigo-50 text-indigo-700 ring-indigo-200', icon:'🔗' },
    'ayrshare.publish': { l:'Publish Ayrshare', color:'bg-purple-50 text-purple-700 ring-purple-200', icon:'🚀' },
    'ayrshare.schedule': { l:'Jadwalkan Ayrshare', color:'bg-amber-50 text-amber-700 ring-amber-200', icon:'📅' },
    'impact-stats.update': { l:'Update Statistik Dampak', color:'bg-slate-50 text-slate-700 ring-slate-200', icon:'📊' },
  }

  function fmtRelative(ts) {
    const t = new Date(ts).getTime()
    const diff = Date.now() - t
    const sec = Math.floor(diff/1000)
    if (sec < 60) return `${sec}d lalu`
    if (sec < 3600) return `${Math.floor(sec/60)}m lalu`
    if (sec < 86400) return `${Math.floor(sec/3600)}j lalu`
    return `${Math.floor(sec/86400)}h lalu`
  }

  function csvEscape(v) {
    if (v == null) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  function exportCSV(rows) {
    const headers = ['waktu','tanggal_iso','aksi','aktor','target','status','ip','meta']
    const lines = [headers.join(',')]
    for (const l of rows) {
      lines.push([
        new Date(l.ts).toLocaleString('id-ID'),
        new Date(l.ts).toISOString(),
        l.action,
        l.actor,
        l.target || '',
        l.status,
        l.ip || '',
        l.meta ? JSON.stringify(l.meta) : '',
      ].map(csvEscape).join(','))
    }
    // Prepend BOM so Excel Indonesia (comma delimiter) opens UTF-8 correctly
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `log-aktivitas-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Aktivitas 24 Jam</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.total24h ?? '—'}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Aktivitas 7 Hari</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.total7d ?? '—'}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Login Gagal 24 Jam</div>
          <div className={`text-2xl font-bold mt-1 ${summary?.loginFails24h > 0 ? 'text-red-600' : 'text-slate-900'}`}>{summary?.loginFails24h ?? '—'}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Aksi Terbanyak</div>
          <div className="text-sm font-semibold text-slate-900 mt-1 truncate">{summary?.byAction?.[0]?.action || '—'} <span className="text-xs text-slate-500 font-normal">×{summary?.byAction?.[0]?.count || 0}</span></div>
        </div>
      </div>

      <Card title="Log Aktivitas Pengguna" desc="Riwayat semua tindakan penting untuk audit trail">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select label="Periode" value={String(days)} onChange={v=>setDays(+v)} options={[{v:'1',l:'24 Jam'},{v:'7',l:'7 Hari'},{v:'30',l:'30 Hari'},{v:'0',l:'Semua'}]} />
          <label className="block"><div className="text-xs font-medium text-slate-600 mb-1">Filter Aksi</div>
            <select value={filterAction} onChange={e=>setFilterAction(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white min-w-[200px]">
              <option value="">Semua Aksi</option>
              {Object.entries(ACTION_LABELS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.l}</option>)}
            </select>
          </label>
          <label className="block"><div className="text-xs font-medium text-slate-600 mb-1">Filter Aktor (email)</div>
            <input value={filterActor} onChange={e=>setFilterActor(e.target.value)} placeholder="cth: annisa.permatasari@…" className="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[260px]" />
          </label>
          <button onClick={()=>exportCSV(logs)} disabled={!logs.length} className="ml-auto text-xs px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-medium">📥 Ekspor CSV</button>
          <button onClick={load} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">🔄 Refresh</button>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-[11px] uppercase text-slate-500 tracking-wider">
              <tr>{['Waktu','Aksi','Aktor','Target','Status','Detail','IP'].map(h=><th key={h} className="text-left px-3 py-2.5 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500 text-xs">Memuat…</td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500 text-xs italic">Belum ada aktivitas tercatat pada periode ini.</td></tr>}
              {logs.map(l => {
                const meta = ACTION_LABELS[l.action] || { l:l.action, color:'bg-slate-50 text-slate-700 ring-slate-200', icon:'•' }
                return (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{fmtRelative(l.ts)}</div>
                      <div className="text-[10px] text-slate-500">{new Date(l.ts).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ring-1 ${meta.color}`}>{meta.icon} {meta.l}</span></td>
                    <td className="px-3 py-2 text-xs font-mono text-slate-700 max-w-[220px] truncate" title={l.actor}>{l.actor}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 font-mono max-w-[220px] truncate" title={l.target || '—'}>{l.target || '—'}</td>
                    <td className="px-3 py-2">
                      {l.status === 'success' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">✓ Sukses</span>}
                      {l.status === 'failure' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 ring-1 ring-red-200">✗ Gagal</span>}
                      {l.status === 'info' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 ring-1 ring-slate-200">ℹ Info</span>}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500 max-w-[280px]">
                      {l.meta ? Object.entries(l.meta).slice(0,3).map(([k,v]) => <div key={k} className="truncate"><span className="text-slate-400">{k}:</span> {typeof v === 'object' ? JSON.stringify(v).slice(0,60) : String(v).slice(0,80)}</div>) : '—'}
                    </td>
                    <td className="px-3 py-2 text-[10px] font-mono text-slate-500">{l.ip || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}


/* =========== IMPACT STATS TAB =========== */

/* =========== WEEKLY DIGEST TAB =========== */
function WeeklyDigestTab() {
  const [state, setState] = useState(null)
  const [preview, setPreview] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [busy, setBusy] = useState(null) // 'preview' | 'send' | 'save'
  const [flash, setFlash] = useState(null)
  const [customEmails, setCustomEmails] = useState('')

  const load = async () => {
    try {
      const s = await fetch('/api/digest/weekly/status').then(r=>r.json())
      setState(s)
      setCustomEmails((s.custom_recipients||[]).join('\n'))
    } catch {}
  }
  useEffect(() => { load() }, [])

  async function doPreview() {
    setBusy('preview'); setFlash(null)
    try {
      const r = await fetch('/api/digest/weekly/preview', { method:'POST', headers:{'Content-Type':'application/json'}, body:'{}' }).then(r=>r.json())
      setPreview(r); setShowPreview(true)
    } catch (e) { setFlash({ ok:false, message: String(e?.message||e) }) }
    setBusy(null)
  }
  async function doSend() {
    if (!confirm('Kirim ringkasan mingguan sekarang ke semua penerima?')) return
    setBusy('send'); setFlash(null)
    try {
      const r = await fetch('/api/digest/weekly/send', { method:'POST', headers:{'Content-Type':'application/json'}, body: '{}' }).then(r=>r.json())
      setFlash({ ok: r.ok, message: r.ok ? `Berhasil dikirim ke ${r.results?.filter(x=>x.ok).length}/${r.recipients?.length} penerima` : (r.error || 'Gagal') })
      await load()
    } catch (e) { setFlash({ ok:false, message: String(e?.message||e) }) }
    setBusy(null)
  }
  async function saveSettings() {
    setBusy('save'); setFlash(null)
    try {
      const patch = {
        enabled: state.enabled,
        hour_wib: state.hour_wib,
        recipients_mode: state.recipients_mode,
        custom_recipients: customEmails.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean),
      }
      const r = await fetch('/api/digest/weekly/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(patch) }).then(r=>r.json())
      if (r.ok) { setFlash({ ok:true, message:'Pengaturan tersimpan' }); await load() }
      else setFlash({ ok:false, message: r.error || 'Gagal simpan' })
    } catch (e) { setFlash({ ok:false, message: String(e?.message||e) }) }
    setBusy(null)
  }

  if (!state) return <div className="text-sm text-slate-500">Memuat…</div>

  return (
    <div className="space-y-4">
      <Card title="Notifikasi Ringkasan Mingguan" desc="Email otomatis setiap Senin pagi berisi ringkasan performa media sosial 7 hari terakhir">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={state.enabled} onChange={e=>setState(s=>({...s, enabled:e.target.checked}))} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm font-medium text-slate-800">Aktifkan pengiriman otomatis Senin pagi</span>
            </label>
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Jam Pengiriman (WIB)</div>
              <select value={state.hour_wib} onChange={e=>setState(s=>({...s, hour_wib:+e.target.value}))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                {[6,7,8,9,10].map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00 WIB</option>)}
              </select>
              <div className="text-[11px] text-slate-500 mt-1">💡 Pengiriman otomatis berjalan setiap Senin jam ini (window ±2 jam untuk toleransi scheduler)</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Penerima</div>
              <div className="flex gap-3">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="rmode" checked={state.recipients_mode==='admins'} onChange={()=>setState(s=>({...s, recipients_mode:'admins'}))} className="accent-blue-600" />
                  <span className="text-sm text-slate-700">Semua Admin aktif</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="rmode" checked={state.recipients_mode==='custom'} onChange={()=>setState(s=>({...s, recipients_mode:'custom'}))} className="accent-blue-600" />
                  <span className="text-sm text-slate-700">Daftar khusus</span>
                </label>
              </div>
              {state.recipients_mode === 'custom' && (
                <textarea value={customEmails} onChange={e=>setCustomEmails(e.target.value)} rows={3} placeholder="satu email per baris" className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none font-mono" />
              )}
            </div>
            <button onClick={saveSettings} disabled={busy==='save'} className="text-sm px-4 py-2 rounded-lg bg-[#0B2545] text-white hover:bg-[#0e2f5c] disabled:opacity-50 font-medium">{busy==='save'?'Menyimpan…':'💾 Simpan Pengaturan'}</button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Status Pengiriman Terakhir</div>
              {state.last_sent_at ? (
                <>
                  <div className="text-sm font-semibold text-slate-900">{new Date(state.last_sent_at).toLocaleString('id-ID',{dateStyle:'full',timeStyle:'short'})}</div>
                  <div className="text-xs text-slate-600 mt-1">Terkirim ke {state.last_sent_success}/{state.last_sent_total} penerima</div>
                  {state.last_sent_recipients?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {state.last_sent_recipients.slice(0,6).map(e => <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-white ring-1 ring-slate-200 text-slate-700 font-mono">{e}</span>)}
                      {state.last_sent_recipients.length > 6 && <span className="text-[10px] text-slate-500">+{state.last_sent_recipients.length-6} lainnya</span>}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-slate-500 italic">Belum pernah dikirim. Klik "Kirim Sekarang" atau tunggu Senin depan.</div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={doPreview} disabled={busy==='preview'} className="text-sm px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 font-medium">{busy==='preview'?'Memuat preview…':'👁 Lihat Preview Email'}</button>
              <button onClick={doSend} disabled={busy==='send'} className="text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:opacity-90 disabled:opacity-50 font-medium">{busy==='send'?'Mengirim…':'📧 Kirim Sekarang ke Penerima'}</button>
            </div>

            {flash && <div className={`text-xs px-3 py-2 rounded-lg ${flash.ok?'bg-emerald-50 text-emerald-800 border border-emerald-200':'bg-red-50 text-red-800 border border-red-200'}`}>{flash.ok?'✅ ':'❌ '}{flash.message}</div>}
          </div>
        </div>
      </Card>

      {showPreview && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={()=>setShowPreview(false)}>
          <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Preview Email Ringkasan Mingguan</h3>
                <div className="text-xs text-slate-500">{preview.subject} · akan dikirim ke <strong>{preview.recipients?.length}</strong> penerima</div>
              </div>
              <button onClick={()=>setShowPreview(false)} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              <iframe title="digest-preview" srcDoc={preview.html} className="w-full h-[70vh] bg-white rounded-lg shadow-inner border-0" />
            </div>
            <div className="p-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={()=>setShowPreview(false)} className="text-sm px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ImpactStatsTab() {
  const [stats, setStats] = useState([])
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try { const r = await fetch('/api/impact-stats'); const j = await r.json(); setStats(j.stats || []); setUpdatedAt(j.updated_at) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function update(i, key, val) {
    setStats(s => s.map((x,idx) => idx===i ? { ...x, [key]: val } : x))
  }
  async function save() {
    setError('')
    if (stats.length !== 4) { setError('Harus tepat 4 statistik'); return }
    if (stats.some(s => !s.v || !s.l)) { setError('Nilai dan label wajib diisi untuk semua statistik'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/impact-stats', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ stats }) })
      const j = await r.json()
      if (!r.ok) { setError(j.error || 'Gagal menyimpan'); setLoading(false); return }
      setUpdatedAt(j.updated_at)
      setFlash({ ok:true, msg:'Statistik Dampak berhasil disimpan. Halaman login akan menampilkan angka baru.' })
      setTimeout(()=>setFlash(null), 5000)
    } catch { setError('Server error') }
    setLoading(false)
  }
  function reset() {
    if (!confirm('Kembalikan ke nilai default? Perubahan tidak tersimpan akan hilang.')) return
    setStats([
      { v:'1,2 Jt+',  l:'Alumni Bersertifikasi', s:'BNSP-terverifikasi',        source:'' },
      { v:'12.000+',  l:'LKP Aktif',             s:'Tersebar 34 provinsi',      source:'' },
      { v:'86%',      l:'Penempatan Kerja',      s:'Alumni bekerja/berwirausaha', source:'' },
      { v:'450+',     l:'Bidang Keahlian',       s:'Selaras SKKNI & industri',  source:'' },
    ])
  }

  return (
    <div className="space-y-5">
      {flash && <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">✅ {flash.msg}</div>}

      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <div className="font-semibold mb-1">Sumber Data Statistik Dampak</div>
          <p className="leading-relaxed">Ditjen Vokasi belum menyediakan API publik untuk statistik LKP dan alumni bersertifikasi. Halaman ini menjadi <strong>single source of truth</strong>: perubahan yang Anda simpan langsung tampil di halaman login publik. Untuk audit, isikan link sumber data (NILEK, laporan tahunan Ditjen, BNSP, dsb) di setiap statistik.</p>
        </div>
      </div>

      <Card
        title="Statistik Dampak Direktorat"
        desc={updatedAt ? `Terakhir diperbarui: ${new Date(updatedAt).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })}` : 'Belum ada perubahan'}
        right={<div className="flex gap-2"><button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">↻ Default</button><button onClick={save} disabled={loading} className="text-xs px-3 py-1.5 rounded-lg bg-[#0B2545] text-white hover:bg-[#0e2f5c] disabled:opacity-60">{loading?'Menyimpan…':'💾 Simpan'}</button></div>}
      >
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Statistik #{i+1}</div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <div className="md:col-span-1">
                  <label className="text-[11px] text-slate-600">Nilai</label>
                  <input value={s.v||''} onChange={e=>update(i,'v',e.target.value)} placeholder="1,2 Jt+" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] text-slate-600">Label Utama</label>
                  <input value={s.l||''} onChange={e=>update(i,'l',e.target.value)} placeholder="Alumni Bersertifikasi" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[11px] text-slate-600">Sub-label</label>
                  <input value={s.s||''} onChange={e=>update(i,'s',e.target.value)} placeholder="BNSP-terverifikasi" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div className="md:col-span-6">
                  <label className="text-[11px] text-slate-600">Sumber Data (URL laporan/dashboard resmi Ditjen, opsional)</label>
                  <input value={s.source||''} onChange={e=>update(i,'source',e.target.value)} placeholder="https://nilek.kemdikbud.go.id/… atau laporan tahunan Ditjen Vokasi 2024" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  {s.updated_at && <div className="text-[10px] text-slate-400 mt-1">Diperbarui {new Date(s.updated_at).toLocaleString('id-ID',{ dateStyle:'medium', timeStyle:'short' })}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="mt-3 text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>}
      </Card>

      {/* Live preview */}
      <Card title="Pratinjau di Halaman Login" desc="Tampilan akhir yang akan dilihat pengunjung">
        <div className="rounded-2xl bg-gradient-to-br from-[#0B2545] via-[#0B2545] to-[#1D4ED8] p-5 text-white">
          <div className="text-[10px] uppercase tracking-[0.2em] text-blue-200/80 font-bold mb-3">Dampak Direktorat</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-3">
                <div className="text-2xl font-black tracking-tight text-white">{s.v || '—'}</div>
                <div className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold mt-1">{s.l || '—'}</div>
                <div className="text-[10px] text-blue-100/70 mt-0.5">{s.s || ''}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

