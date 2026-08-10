// Deterministic mock data generator for the dashboard.
// Generates 90+ days of realistic data across 5 platforms.

function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const PLATFORMS = [
  { key: 'instagram', name: 'Instagram', handle: '@kursuskita', color: '#E1306C', baseFollowers: 48200, baseReach: 12500, basePosts: 1.2 },
  { key: 'facebook',  name: 'Facebook',  handle: 'KursusKita.info', color: '#1877F2', baseFollowers: 31500, baseReach: 8200, basePosts: 1.0 },
  { key: 'youtube',   name: 'YouTube',   handle: '@kursuskita1211', color: '#FF0000', baseFollowers: 22800, baseReach: 6500, basePosts: 0.35 },
  { key: 'tiktok',    name: 'TikTok',    handle: '@kursuskita', color: '#111827', baseFollowers: 18400, baseReach: 15200, basePosts: 0.9 },
  { key: 'website',   name: 'Website',   handle: 'kursus.kemendikdasmen.go.id', color: '#0EA5E9', baseFollowers: 0, baseReach: 4800, basePosts: 0.4 },
]

export function getPlatforms() { return PLATFORMS }

function genPlatformSeries(platform, days) {
  const rnd = seeded(platform.key.split('').reduce((a,c)=>a+c.charCodeAt(0),0) + 7)
  const arr = []
  let followers = platform.baseFollowers
  const today = new Date()
  today.setHours(0,0,0,0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const weekday = d.getDay()
    const weekendBoost = (weekday === 0 || weekday === 6) ? 1.15 : 1.0
    const trend = 1 + (days - i) * 0.0018 // slight upward trend
    const noise = 0.75 + rnd() * 0.6

    const reach = Math.round(platform.baseReach * trend * weekendBoost * noise)
    const impressions = Math.round(reach * (1.35 + rnd() * 0.5))
    const views = platform.key === 'youtube' || platform.key === 'tiktok' || platform.key === 'instagram'
      ? Math.round(reach * (0.6 + rnd() * 1.4))
      : Math.round(reach * 0.15)
    const likes = Math.round(reach * (0.035 + rnd() * 0.02))
    const comments = Math.round(likes * (0.06 + rnd() * 0.05))
    const shares = Math.round(likes * (0.08 + rnd() * 0.06))
    const saves = Math.round(likes * (0.10 + rnd() * 0.08))
    const followerDelta = Math.round((10 + rnd() * 40) * trend * (platform.key === 'website' ? 0 : 1))
    followers += followerDelta
    const contentPublished = rnd() < (platform.basePosts / 1.2) ? Math.max(1, Math.round(rnd() * 2 + (platform.basePosts >= 1 ? 1 : 0))) : 0
    const engagement = likes + comments + shares + saves
    const engagementRate = reach > 0 ? +(engagement / reach * 100).toFixed(2) : 0

    arr.push({
      date: d.toISOString().slice(0,10),
      followers,
      followerDelta,
      reach,
      impressions,
      views,
      likes,
      comments,
      shares,
      saves,
      engagement,
      engagementRate,
      contentPublished,
    })
  }
  return arr
}

let _cache = null
export function getAllSeries(daysNeeded = 120) {
  if (_cache && _cache.days >= daysNeeded) return _cache.data
  const data = {}
  PLATFORMS.forEach(p => { data[p.key] = genPlatformSeries(p, daysNeeded) })
  _cache = { days: daysNeeded, data }
  return data
}

export function sliceByDays(series, days) {
  return series.slice(-days)
}

export function aggregate(series) {
  const sum = (k) => series.reduce((a,r)=>a+(r[k]||0),0)
  const lastFollowers = series.length ? series[series.length-1].followers : 0
  const firstFollowers = series.length ? series[0].followers : 0
  const followerGrowth = lastFollowers - firstFollowers
  const reach = sum('reach')
  const impressions = sum('impressions')
  const views = sum('views')
  const likes = sum('likes')
  const comments = sum('comments')
  const shares = sum('shares')
  const saves = sum('saves')
  const engagement = sum('engagement')
  const contentPublished = sum('contentPublished')
  const engagementRate = reach > 0 ? +(engagement / reach * 100).toFixed(2) : 0
  return {
    followers: lastFollowers, followerGrowth,
    reach, impressions, views, likes, comments, shares, saves,
    engagement, engagementRate, contentPublished,
  }
}

export function pctChange(curr, prev) {
  if (!prev) return curr > 0 ? 100 : 0
  return +(((curr - prev) / prev) * 100).toFixed(1)
}

export function formatNumber(n) {
  if (n === null || n === undefined) return '-'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,'') + ' Jt'
  if (abs >= 1_000) return (n/1_000).toFixed(1).replace(/\.0$/,'') + ' Rb'
  return n.toLocaleString('id-ID')
}

// AI-like insight generator from aggregated data
export function generateInsights(currAgg, prevAgg, perPlatform) {
  const findings = []
  const opportunities = []
  const risks = []
  const actions = []
  const ideas = []

  const engRateChange = pctChange(currAgg.engagementRate, prevAgg.engagementRate)
  const reachChange = pctChange(currAgg.reach, prevAgg.reach)
  const followerChange = pctChange(currAgg.followers, prevAgg.followers)

  if (engRateChange > 5) findings.push(`Engagement rate keseluruhan naik ${engRateChange}% dibanding periode sebelumnya — indikasi konten semakin relevan dengan audiens.`)
  else if (engRateChange < -5) findings.push(`Engagement rate turun ${Math.abs(engRateChange)}% — perlu evaluasi format dan waktu tayang konten.`)
  else findings.push(`Engagement rate stabil di kisaran ${currAgg.engagementRate}% — konsistensi terjaga.`)

  if (reachChange > 0) findings.push(`Total reach meningkat ${reachChange}% dengan ${formatNumber(currAgg.reach)} tayangan organik terjangkau.`)
  else findings.push(`Total reach menurun ${Math.abs(reachChange)}% — distribusi konten perlu dioptimalkan.`)

  findings.push(`Pertumbuhan follower gabungan mencapai ${formatNumber(currAgg.followerGrowth)} pengikut baru selama periode ini (${followerChange >= 0 ? '+' : ''}${followerChange}%).`)

  // Rank platforms by engagement rate
  const ranked = Object.entries(perPlatform)
    .filter(([k]) => k !== 'website')
    .map(([k, v]) => ({ k, ...v }))
    .sort((a,b)=>b.engagementRate - a.engagementRate)

  if (ranked.length) {
    const top = ranked[0]
    const bottom = ranked[ranked.length-1]
    opportunities.push(`Platform ${labelOf(top.k)} memimpin engagement rate ${top.engagementRate}% — potensi diperbesar dengan menaikkan frekuensi posting.`)
    if (bottom.engagementRate < top.engagementRate * 0.5) {
      risks.push(`Engagement ${labelOf(bottom.k)} tertinggal signifikan (${bottom.engagementRate}%) — perlu strategi konten khusus.`)
    }
  }

  // Content publishing insight
  if (currAgg.contentPublished < prevAgg.contentPublished * 0.8) {
    risks.push(`Frekuensi publikasi turun ${Math.abs(pctChange(currAgg.contentPublished, prevAgg.contentPublished))}% — jaga kontinuitas untuk mempertahankan momentum.`)
  }

  // Video insight
  const videoPlatforms = ['youtube','tiktok','instagram']
  const videoViews = videoPlatforms.reduce((a,k)=>a+(perPlatform[k]?.views || 0),0)
  if (videoViews > 0) {
    opportunities.push(`Total video views mencapai ${formatNumber(videoViews)} — format video pendek berpotensi 2-3x engagement dibanding statis.`)
  }

  actions.push('Tingkatkan frekuensi konten video pendek (Reels/Short/TikTok) 2-3 kali per minggu.')
  actions.push('Fokuskan tema pada edukasi vokasi, sertifikasi, dan kisah sukses alumni kursus.')
  actions.push('Jadwalkan posting pada jam 19.00–21.00 WIB — window engagement tertinggi audiens Indonesia.')
  if (reachChange < 0) actions.push('Aktifkan boosting konten pilar di Instagram dan Facebook untuk mengembalikan reach.')

  ideas.push('Seri video pendek "1 Menit Belajar Skill" — micro-learning berorientasi engagement.')
  ideas.push('Kolaborasi lembaga kursus (LKP) unggulan untuk konten testimonial alumni.')
  ideas.push('Infografis interaktif: Jalur karier lulusan kursus bersertifikasi.')
  ideas.push('Live Q&A pimpinan Direktorat dengan tema program prioritas.')

  return { findings, opportunities, risks, actions, ideas, engRateChange, reachChange, followerChange }
}

function labelOf(k) {
  return { instagram:'Instagram', facebook:'Facebook', youtube:'YouTube', tiktok:'TikTok', website:'Website' }[k] || k
}
