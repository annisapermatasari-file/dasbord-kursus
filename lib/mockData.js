// Deterministic mock data generator for the dashboard.

function seeded(seed) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

const PLATFORMS = [
  { key: 'instagram', name: 'Instagram', handle: '@akunanda', color: '#E1306C', baseFollowers: 48200, baseReach: 12500, basePosts: 1.2 },
  { key: 'facebook',  name: 'Facebook',  handle: 'Halaman Bisnis Anda', color: '#1877F2', baseFollowers: 31500, baseReach: 8200, basePosts: 1.0 },
  { key: 'youtube',   name: 'YouTube',   handle: '@akunanda', color: '#FF0000', baseFollowers: 22800, baseReach: 6500, basePosts: 0.35 },
  { key: 'tiktok',    name: 'TikTok',    handle: '@akunanda', color: '#111827', baseFollowers: 18400, baseReach: 15200, basePosts: 0.9 },
  { key: 'website',   name: 'Website',   handle: 'www.bisnisanda.com', color: '#0EA5E9', baseFollowers: 0, baseReach: 4800, basePosts: 0.4 },
]

export function getPlatforms() { return PLATFORMS }
export function findPlatform(k) { return PLATFORMS.find(p=>p.key===k) }

function genPlatformSeries(platform, days) {
  const rnd = seeded(platform.key.split('').reduce((a,c)=>a+c.charCodeAt(0),0) + 7)
  const arr = []
  let followers = platform.baseFollowers
  const today = new Date(); today.setHours(0,0,0,0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const wk = d.getDay()
    const weekendBoost = (wk === 0 || wk === 6) ? 1.15 : 1.0
    const trend = 1 + (days - i) * 0.0018
    const noise = 0.75 + rnd() * 0.6
    const reach = Math.round(platform.baseReach * trend * weekendBoost * noise)
    const impressions = Math.round(reach * (1.35 + rnd() * 0.5))
    const views = ['youtube','tiktok','instagram'].includes(platform.key) ? Math.round(reach * (0.6 + rnd() * 1.4)) : Math.round(reach * 0.15)
    const likes = Math.round(reach * (0.035 + rnd() * 0.02))
    const comments = Math.round(likes * (0.06 + rnd() * 0.05))
    const shares = Math.round(likes * (0.08 + rnd() * 0.06))
    const saves = Math.round(likes * (0.10 + rnd() * 0.08))
    const followerDelta = Math.round((10 + rnd() * 40) * trend * (platform.key === 'website' ? 0 : 1))
    followers += followerDelta
    const contentPublished = rnd() < (platform.basePosts / 1.2) ? Math.max(1, Math.round(rnd() * 2 + (platform.basePosts >= 1 ? 1 : 0))) : 0
    const engagement = likes + comments + shares + saves
    const engagementRate = reach > 0 ? +(engagement / reach * 100).toFixed(2) : 0
    arr.push({ date: d.toISOString().slice(0,10), followers, followerDelta, reach, impressions, views, likes, comments, shares, saves, engagement, engagementRate, contentPublished })
  }
  return arr
}

let _cache = null
export function getAllSeries(daysNeeded = 200) {
  if (_cache && _cache.days >= daysNeeded) return _cache.data
  const data = {}
  PLATFORMS.forEach(p => { data[p.key] = genPlatformSeries(p, daysNeeded) })
  _cache = { days: daysNeeded, data }
  return data
}

export function sliceByDays(series, days) { return series.slice(-days) }

export function aggregate(series) {
  const sum = (k) => series.reduce((a,r)=>a+(r[k]||0),0)
  const lastFollowers = series.length ? series[series.length-1].followers : 0
  const firstFollowers = series.length ? series[0].followers : 0
  return {
    followers: lastFollowers, followerGrowth: lastFollowers - firstFollowers,
    reach: sum('reach'), impressions: sum('impressions'), views: sum('views'),
    likes: sum('likes'), comments: sum('comments'), shares: sum('shares'), saves: sum('saves'),
    engagement: sum('likes')+sum('comments')+sum('shares')+sum('saves'),
    engagementRate: sum('reach') > 0 ? +((sum('likes')+sum('comments')+sum('shares')+sum('saves')) / sum('reach') * 100).toFixed(2) : 0,
    contentPublished: sum('contentPublished'),
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

// ---------- CONTENT ITEMS ----------
const CONTENT_TYPES = {
  instagram: ['Reels','Feed','Story','Carousel'],
  facebook:  ['Feed','Video','Story','Article'],
  youtube:   ['Video','Short'],
  tiktok:    ['Video'],
  website:   ['Article','Campaign'],
}
const TOPICS = ['Kursus Vokasi','Sertifikasi','LKP Unggulan','Kisah Alumni','Program Prioritas','Beasiswa','Pelatihan Kerja','Digital Skill','Kewirausahaan','Green Skill','Kolaborasi Industri','Info Publik']
const TITLE_TEMPLATES = [
  '5 Alasan Ikut {topic} Tahun Ini', 'Kisah Sukses Alumni {topic}', 'Cara Daftar Program {topic}',
  'Tips Sukses Menjalani {topic}', 'Testimoni Peserta {topic}', 'Jadwal Terbaru {topic}',
  'Peluang Karier dari {topic}', 'Fakta Menarik Seputar {topic}', 'Q&A Bersama Ahli: {topic}',
  '{topic}: Panduan Lengkap Pemula', 'Kolaborasi Industri untuk {topic}', 'Rekor Peserta {topic} Tahun Ini',
  'Live Bersama Tim: {topic}', 'Highlight Acara {topic}', 'Sorotan Pekan Ini: {topic}',
]

export function generateContentItems(days = 90) {
  const rnd = seeded(2603)
  const items = []
  const today = new Date(); today.setHours(0,0,0,0)
  PLATFORMS.forEach(p => {
    if (p.key === 'website') return
    const count = Math.round(days * p.basePosts)
    for (let i = 0; i < count; i++) {
      const dayOffset = Math.floor(rnd() * days)
      const d = new Date(today); d.setDate(d.getDate() - dayOffset)
      const types = CONTENT_TYPES[p.key]
      const type = types[Math.floor(rnd()*types.length)]
      const topic = TOPICS[Math.floor(rnd()*TOPICS.length)]
      const title = TITLE_TEMPLATES[Math.floor(rnd()*TITLE_TEMPLATES.length)].replace('{topic}', topic)
      const virality = type === 'Reels' || type === 'Short' || (p.key==='tiktok') ? 1.6 + rnd()*2.4 : 0.5 + rnd()*1.2
      const reach = Math.round(p.baseReach * virality * (0.5 + rnd()))
      const impressions = Math.round(reach * (1.2 + rnd()*0.6))
      const views = ['Reels','Short','Video'].includes(type) ? Math.round(reach * (0.8+rnd()*1.5)) : Math.round(reach*0.15)
      const likes = Math.round(reach * (0.04 + rnd()*0.03))
      const comments = Math.round(likes * (0.06 + rnd()*0.05))
      const shares = Math.round(likes * (0.08 + rnd()*0.06))
      const saves = Math.round(likes * (0.10 + rnd()*0.08))
      const engagement = likes + comments + shares + saves
      const engagementRate = reach > 0 ? +(engagement/reach*100).toFixed(2) : 0
      const score = performanceScore({ reach, engagement, engagementRate, shares, comments, saves, views })
      items.push({
        id: `${p.key}-${i}-${dayOffset}`,
        date: d.toISOString().slice(0,10), platform: p.key, platformName: p.name, platformColor: p.color,
        title, type, topic, reach, impressions, views, likes, comments, shares, saves, engagement, engagementRate, score,
        campaign: rnd() < 0.35 ? CAMPAIGNS[Math.floor(rnd()*CAMPAIGNS.length)].name : null,
      })
    }
  })
  return items.sort((a,b)=>b.date.localeCompare(a.date))
}

export function performanceScore({ reach=0, engagement=0, engagementRate=0, shares=0, comments=0, saves=0, views=0 }) {
  const s1 = Math.min(reach/40000, 1) * 22
  const s2 = Math.min(engagementRate/8, 1) * 26
  const s3 = Math.min(engagement/3000, 1) * 20
  const s4 = Math.min((shares+saves)/400, 1) * 16
  const s5 = Math.min(views/25000, 1) * 10
  const s6 = Math.min(comments/300, 1) * 6
  return Math.round(s1+s2+s3+s4+s5+s6)
}

export function scoreCategory(s) {
  if (s >= 90) return { label: 'Excellent', color: '#059669', bg:'bg-emerald-50', text:'text-emerald-700', ring:'ring-emerald-200' }
  if (s >= 75) return { label: 'Very Good', color: '#0284C7', bg:'bg-sky-50', text:'text-sky-700', ring:'ring-sky-200' }
  if (s >= 60) return { label: 'Good', color: '#2563EB', bg:'bg-blue-50', text:'text-blue-700', ring:'ring-blue-200' }
  if (s >= 40) return { label: 'Needs Improvement', color: '#D97706', bg:'bg-amber-50', text:'text-amber-700', ring:'ring-amber-200' }
  return { label: 'Poor', color: '#DC2626', bg:'bg-red-50', text:'text-red-700', ring:'ring-red-200' }
}

// ---------- CAMPAIGNS ----------
export const CAMPAIGNS = [
  { id:'c1', name:'Bulan Vokasi 2025', objective:'Awareness Program Vokasi', target:'Umum 18-35', startDate:'2025-05-15', endDate:'2025-06-14', platforms:['instagram','facebook','tiktok','youtube'] },
  { id:'c2', name:'Sertifikasi Digital Skill', objective:'Registrasi Peserta', target:'Pekerja & Mahasiswa', startDate:'2025-04-01', endDate:'2025-05-31', platforms:['instagram','facebook','website'] },
  { id:'c3', name:'Kisah Alumni LKP', objective:'Storytelling & Trust', target:'Pencari Kerja', startDate:'2025-03-10', endDate:'2025-06-10', platforms:['instagram','youtube','tiktok'] },
  { id:'c4', name:'Green Skill Indonesia', objective:'Edukasi Isu Prioritas', target:'Gen Z & Milenial', startDate:'2025-05-01', endDate:'2025-06-30', platforms:['instagram','tiktok','youtube'] },
  { id:'c5', name:'Info Beasiswa Kursus', objective:'Lead Generation', target:'Pelajar SMA/SMK', startDate:'2025-04-15', endDate:'2025-05-30', platforms:['instagram','facebook','tiktok','website'] },
  { id:'c6', name:'Kolaborasi Industri', objective:'Positioning Strategis', target:'B2B & Pemangku Kepentingan', startDate:'2025-05-20', endDate:'2025-06-25', platforms:['facebook','youtube','website'] },
]

export function generateCampaignMetrics() {
  const rnd = seeded(918)
  return CAMPAIGNS.map((c, idx) => {
    const days = Math.max(1, Math.round((new Date(c.endDate) - new Date(c.startDate)) / 86400000))
    const contentPublished = Math.round(days * (0.6 + rnd()*0.8))
    const reach = Math.round(80000 + rnd()*350000)
    const impressions = Math.round(reach * (1.3 + rnd()*0.6))
    const engagement = Math.round(reach * (0.045 + rnd()*0.035))
    const engagementRate = +(engagement/reach*100).toFixed(2)
    const followerGrowth = Math.round(400 + rnd()*2200)
    const websiteTraffic = Math.round(1500 + rnd()*9500)
    const score = Math.min(98, Math.round(58 + engagementRate*4 + rnd()*8))
    return { ...c, contentPublished, reach, impressions, engagement, engagementRate, followerGrowth, websiteTraffic, score, days }
  })
}

// ---------- SENTIMENT ----------
const POS_COMMENTS = [
  'Terima kasih, program ini sangat membantu!','Saya alumni LKP dan sekarang bekerja di industri, sangat bangga.',
  'Konten edukasinya bermanfaat, teruskan kolaborasi seperti ini.','Sertifikasi ini betul-betul relevan dengan kebutuhan kerja.',
  'Kegiatan Green Skill inspiratif, ditunggu edisi berikutnya.','Live-nya jelas dan mudah dipahami. Bagus!',
  'Format video pendeknya menarik, mudah dicerna Gen Z.','Semoga programnya diperluas ke daerah-daerah 3T.',
]
const NEU_COMMENTS = [
  'Kapan pendaftaran dibuka kembali?','Bagaimana cara mengakses materi kursus?',
  'Apakah sertifikat diakui BNSP?','Kalau saya lulusan SMP, bisa ikut?',
  'Mohon informasi jadwal terbaru.','Untuk daerah timur ada kuota tidak ya?',
  'Ada kontak pengaduan yang bisa dihubungi?','Bagaimana mekanisme seleksinya?',
]
const NEG_COMMENTS = [
  'Sudah daftar tapi belum ada kabar, kecewa.','Portal daftarnya sering error, tolong dibenahi.',
  'Info kurang jelas untuk peserta luar Jawa.','Waktu pendaftarannya terlalu singkat.',
  'Verifikasi lama sekali, tolong ditingkatkan.','Sertifikat belum diterima setelah lulus, mohon ditindaklanjuti.',
]

export function generateSentiment(days = 30) {
  const rnd = seeded(5501)
  const today = new Date(); today.setHours(0,0,0,0)
  const trend = []
  let totPos=0, totNeu=0, totNeg=0
  for (let i = days-1; i>=0; i--) {
    const d = new Date(today); d.setDate(d.getDate()-i)
    const total = Math.round(60 + rnd()*180)
    const pos = Math.round(total * (0.55 + rnd()*0.15))
    const neg = Math.round(total * (0.06 + rnd()*0.08))
    const neu = total - pos - neg
    totPos += pos; totNeu += neu; totNeg += neg
    trend.push({ date: d.toISOString().slice(0,10), positive: pos, neutral: neu, negative: neg })
  }
  const total = totPos+totNeu+totNeg
  const samples = { positive: POS_COMMENTS, neutral: NEU_COMMENTS, negative: NEG_COMMENTS }
  return {
    total,
    positive: totPos, neutral: totNeu, negative: totNeg,
    positivePct: +(totPos/total*100).toFixed(1),
    neutralPct: +(totNeu/total*100).toFixed(1),
    negativePct: +(totNeg/total*100).toFixed(1),
    trend, samples,
    topics: [
      { name: 'Pendaftaran & Jadwal', count: Math.round(total*0.22) },
      { name: 'Sertifikasi BNSP', count: Math.round(total*0.17) },
      { name: 'Kisah Alumni', count: Math.round(total*0.14) },
      { name: 'Beasiswa Kursus', count: Math.round(total*0.12) },
      { name: 'Layanan Pengaduan', count: Math.round(total*0.09) },
      { name: 'Program Vokasi Daerah', count: Math.round(total*0.08) },
    ],
  }
}

// ---------- AUDIENCE ----------
export function generateAudience() {
  return {
    age: [
      { name: '13-17', value: 6 }, { name: '18-24', value: 34 }, { name: '25-34', value: 38 },
      { name: '35-44', value: 15 }, { name: '45-54', value: 5 }, { name: '55+', value: 2 },
    ],
    gender: [ { name:'Perempuan', value: 57 }, { name:'Laki-laki', value: 41 }, { name:'Lainnya', value: 2 } ],
    location: [
      { name:'DKI Jakarta', value: 22 }, { name:'Jawa Barat', value: 18 }, { name:'Jawa Timur', value: 14 },
      { name:'Jawa Tengah', value: 11 }, { name:'Sumatera Utara', value: 7 }, { name:'Sulawesi Selatan', value: 6 },
      { name:'Bali', value: 5 }, { name:'Kalimantan Timur', value: 4 }, { name:'Lainnya', value: 13 },
    ],
    activeHours: Array.from({length:24}, (_,h) => {
      const base = h>=6 && h<=22 ? 20 + Math.sin((h-6)/16*Math.PI)*45 : 8
      const peak = (h===19||h===20||h===21) ? 30 : 0
      return { hour: `${String(h).padStart(2,'0')}:00`, value: Math.round(base + peak) }
    }),
    interests: ['Pendidikan Vokasi','Sertifikasi Profesi','Karier','Wirausaha','Teknologi Digital','Kreativitas','Isu Lingkungan'],
  }
}

// ---------- WEBSITE ----------
export function generateWebsite(days = 30) {
  const rnd = seeded(3711)
  const today = new Date(); today.setHours(0,0,0,0)
  const trend = []
  for (let i = days-1; i>=0; i--) {
    const d = new Date(today); d.setDate(d.getDate()-i)
    const users = Math.round(1400 + rnd()*1800 + i*4)
    const newUsers = Math.round(users * (0.35 + rnd()*0.15))
    const sessions = Math.round(users * (1.15 + rnd()*0.25))
    const pageViews = Math.round(sessions * (1.9 + rnd()*0.8))
    const bounce = +(38 + rnd()*18).toFixed(1)
    const avgDuration = Math.round(95 + rnd()*140)
    trend.push({ date: d.toISOString().slice(0,10), users, newUsers, sessions, pageViews, bounce, avgDuration })
  }
  const sum = k => trend.reduce((a,r)=>a+r[k],0)
  const totals = {
    users: sum('users'), newUsers: sum('newUsers'), sessions: sum('sessions'), pageViews: sum('pageViews'),
    bounce: +(trend.reduce((a,r)=>a+r.bounce,0)/trend.length).toFixed(1),
    avgDuration: Math.round(trend.reduce((a,r)=>a+r.avgDuration,0)/trend.length),
  }
  const topPages = [
    { path: '/program-kursus', views: Math.round(totals.pageViews*0.19), title: 'Program Kursus & Pelatihan' },
    { path: '/pendaftaran', views: Math.round(totals.pageViews*0.15), title: 'Pendaftaran Peserta' },
    { path: '/lkp-terakreditasi', views: Math.round(totals.pageViews*0.11), title: 'LKP Terakreditasi' },
    { path: '/berita', views: Math.round(totals.pageViews*0.09), title: 'Berita Terbaru' },
    { path: '/sertifikasi', views: Math.round(totals.pageViews*0.08), title: 'Sertifikasi Kompetensi' },
    { path: '/beasiswa', views: Math.round(totals.pageViews*0.06), title: 'Beasiswa & Bantuan' },
    { path: '/tentang', views: Math.round(totals.pageViews*0.04), title: 'Tentang Kami' },
  ]
  const sources = [
    { name:'Organic Search', value: 42 }, { name:'Social Media', value: 24 }, { name:'Direct', value: 19 },
    { name:'Referral', value: 9 }, { name:'Email', value: 4 }, { name:'Lainnya', value: 2 },
  ]
  const socialRef = [
    { name:'Instagram', value: 38 }, { name:'Facebook', value: 24 }, { name:'YouTube', value: 18 },
    { name:'TikTok', value: 15 }, { name:'Lainnya', value: 5 },
  ]
  return { trend, totals, topPages, sources, socialRef }
}

// ---------- Rule-based fallback insight ----------
export function generateInsights(currAgg, prevAgg, perPlatform) {
  const findings = [], opportunities = [], risks = [], actions = [], ideas = []
  const engRateChange = pctChange(currAgg.engagementRate, prevAgg.engagementRate)
  const reachChange = pctChange(currAgg.reach, prevAgg.reach)
  const followerChange = pctChange(currAgg.followers, prevAgg.followers)
  if (engRateChange > 5) findings.push(`Engagement rate keseluruhan naik ${engRateChange}% dibanding periode sebelumnya — indikasi konten semakin relevan dengan audiens.`)
  else if (engRateChange < -5) findings.push(`Engagement rate turun ${Math.abs(engRateChange)}% — perlu evaluasi format dan waktu tayang konten.`)
  else findings.push(`Engagement rate stabil di kisaran ${currAgg.engagementRate}% — konsistensi terjaga.`)
  if (reachChange > 0) findings.push(`Total reach meningkat ${reachChange}% dengan ${formatNumber(currAgg.reach)} tayangan organik terjangkau.`)
  else findings.push(`Total reach menurun ${Math.abs(reachChange)}% — distribusi konten perlu dioptimalkan.`)
  findings.push(`Pertumbuhan follower gabungan mencapai ${formatNumber(currAgg.followerGrowth)} pengikut baru selama periode ini (${followerChange >= 0 ? '+' : ''}${followerChange}%).`)
  const ranked = Object.entries(perPlatform).filter(([k]) => k !== 'website').map(([k, v]) => ({ k, ...v })).sort((a,b)=>b.engagementRate - a.engagementRate)
  if (ranked.length) {
    const top = ranked[0], bottom = ranked[ranked.length-1]
    opportunities.push(`Platform ${labelOf(top.k)} memimpin engagement rate ${top.engagementRate}% — potensi diperbesar dengan menaikkan frekuensi posting.`)
    if (bottom.engagementRate < top.engagementRate * 0.5) risks.push(`Engagement ${labelOf(bottom.k)} tertinggal signifikan (${bottom.engagementRate}%) — perlu strategi konten khusus.`)
  }
  if (currAgg.contentPublished < prevAgg.contentPublished * 0.8) risks.push(`Frekuensi publikasi turun ${Math.abs(pctChange(currAgg.contentPublished, prevAgg.contentPublished))}% — jaga kontinuitas untuk mempertahankan momentum.`)
  const videoViews = ['youtube','tiktok','instagram'].reduce((a,k)=>a+(perPlatform[k]?.views || 0),0)
  if (videoViews > 0) opportunities.push(`Total video views mencapai ${formatNumber(videoViews)} — format video pendek berpotensi 2-3x engagement dibanding statis.`)
  actions.push('Tingkatkan frekuensi konten video pendek (Reels/Short/TikTok) 2-3 kali per minggu.')
  actions.push('Fokuskan tema pada edukasi vokasi, sertifikasi, dan kisah sukses alumni kursus.')
  actions.push('Jadwalkan posting pada jam 19.00–21.00 WIB — window engagement tertinggi audiens Indonesia.')
  if (reachChange < 0) actions.push('Aktifkan boosting konten pilar di Instagram dan Facebook untuk mengembalikan reach.')
  ideas.push('Seri video pendek "1 Menit Belajar Skill" — micro-learning berorientasi engagement.')
  ideas.push('Kolaborasi lembaga kursus (LKP) unggulan untuk konten testimonial alumni.')
  ideas.push('Infografis interaktif: Jalur karier lulusan kursus bersertifikasi.')
  ideas.push('Live Q&A pimpinan dengan tema program prioritas.')
  return { findings, opportunities, risks, actions, ideas, engRateChange, reachChange, followerChange }
}

function labelOf(k) { return { instagram:'Instagram', facebook:'Facebook', youtube:'YouTube', tiktok:'TikTok', website:'Website' }[k] || k }
