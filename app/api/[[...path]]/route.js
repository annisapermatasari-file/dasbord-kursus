import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { connections, users, db } from '@/lib/db'
import { metaAuthUrl, metaExchangeCode, metaLongLived, metaGetPages, metaGetIgAccount, metaGetIgInsights, metaGetPageInsights } from '@/lib/oauth-meta'
import { googleAuthUrl, googleExchangeCode, googleRefreshToken, ytListChannels, ytChannelStats, ytAnalyticsReport, gaListProperties, ga4RunReport } from '@/lib/oauth-google'
import { hasTiktokCreds, tiktokAuthUrl, tiktokExchangeCode, tiktokUserInfo, tiktokVideoList } from '@/lib/oauth-tiktok'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function baseUrl(request) {
  return process.env.NEXT_PUBLIC_BASE_URL || `${request.headers.get('x-forwarded-proto')||'https'}://${request.headers.get('host')}`
}
function metaRedirect(request) { return baseUrl(request) + '/api/oauth/meta/callback' }
function googleRedirect(request) { return baseUrl(request) + '/api/oauth/google/callback' }
function tiktokRedirect(request) { return baseUrl(request) + '/api/oauth/tiktok/callback' }

function popupResponse({ ok, provider, message }) {
  const isRedirectErr = message && /redirect|whitelist|redirect_uri|not.*allowed|url.*blocked/i.test(message)
  const helpHtml = isRedirectErr ? `
    <div style="margin-top:16px;padding:12px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:6px;text-align:left;font-size:12px;color:#78350F">
      <strong>Redirect URI belum didaftarkan.</strong><br>
      Tambahkan URL berikut di console app ${provider}, tepat pada kolom OAuth Redirect URIs:<br>
      <code style="display:block;margin-top:6px;padding:6px;background:#fff;border:1px solid #FCD34D;border-radius:4px;font-size:11px;word-break:break-all">${(process.env.NEXT_PUBLIC_BASE_URL||'').replace(/'/g,'')}/api/oauth/${provider.toLowerCase()}/callback</code>
      Atau gunakan opsi <strong>"Paste Access Token Manual"</strong> di Settings sebagai workaround.
    </div>` : ''
  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;max-width:520px;margin:0 auto;">
    <h2 style="color:${ok?'#059669':'#DC2626'};margin:0 0 8px">${ok?'✅ Berhasil Terhubung ':'⚠️ Gagal Menghubungkan '}${provider}</h2>
    <p style="color:#64748B;font-size:13px">${message || ''}</p>
    ${helpHtml}
    <p style="color:#94A3B8;font-size:11px;margin-top:20px">${ok?'Jendela ini akan tertutup otomatis…':'Anda dapat menutup jendela ini.'}</p>
    <script>try { window.opener && window.opener.postMessage({ type:'oauth', ok:${ok?'true':'false'}, provider:'${provider}', message:${JSON.stringify(message||'')} }, '*') } catch(e){}
    ${ok ? 'setTimeout(()=>window.close(), 1500)' : ''}</script></body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function GET(request, { params }) {
  const p = await params
  const path = (p?.path || []).join('/')
  try {
    if (path === '' || path === 'health') return NextResponse.json({ status: 'ok' })

    if (path === 'oauth/meta/start') {
      const state = randomUUID()
      return NextResponse.redirect(metaAuthUrl(metaRedirect(request), state))
    }
    if (path === 'oauth/google/start') {
      const state = randomUUID()
      return NextResponse.redirect(googleAuthUrl(googleRedirect(request), state))
    }
    if (path === 'oauth/tiktok/start') {
      if (!hasTiktokCreds()) return new NextResponse('<html><body style="font-family:system-ui;padding:40px"><h2 style="color:#DC2626">TikTok credentials belum diset</h2><p>Admin belum mengisi TIKTOK_CLIENT_KEY dan TIKTOK_CLIENT_SECRET pada environment variables server.</p></body></html>', { status: 400, headers:{'Content-Type':'text/html'} })
      const state = randomUUID()
      return NextResponse.redirect(tiktokAuthUrl(tiktokRedirect(request), state))
    }
    if (path === 'oauth/meta/callback') return metaCallback(request)
    if (path === 'oauth/google/callback') return googleCallback(request)
    if (path === 'oauth/tiktok/callback') return tiktokCallback(request)

    if (path === 'connections') return listConnections()
    if (path === 'users') return listUsers()
    if (path === 'impact-stats') return getImpactStats()
    if (path === 'live/facebook/summary') return liveFacebook(request)
    if (path === 'live/instagram/summary') return liveInstagram(request)
    if (path === 'live/youtube/summary') return liveYoutube(request)
    if (path === 'live/tiktok/summary') return liveTiktok(request)
    if (path === 'live/ga4/summary') return liveGa4(request)

    return NextResponse.json({ error: 'Not found', path }, { status: 404 })
  } catch (e) {
    console.error('GET error', path, e)
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const p = await params
  const path = (p?.path || []).join('/')
  try {
    if (path === 'ai-insights') return aiInsights(request)
    if (path === 'users') return createUser(request)
    if (path === 'users/status') return toggleUserStatus(request)
    if (path === 'auth/login') return authLogin(request)
    if (path === 'auth/forgot-password') return forgotPassword(request)
    if (path === 'auth/reset-password') return resetPassword(request)
    if (path === 'impact-stats') return saveImpactStats(request)
    return NextResponse.json({ error: 'Not found', path }, { status: 404 })
  } catch (e) {
    console.error('POST error', path, e)
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const p = await params
  const path = (p?.path || []).join('/')
  try {
    if (path.startsWith('connections/')) {
      const provider = path.split('/')[1]
      const col = await connections()
      await col.deleteMany({ provider })
      return NextResponse.json({ ok: true })
    }
    if (path.startsWith('users/')) {
      const email = decodeURIComponent(path.slice('users/'.length))
      const col = await users()
      const err = await ensureNotLastActiveAdmin(col, email.toLowerCase())
      if (err) return NextResponse.json({ error: err }, { status: 400 })
      await col.deleteOne({ email: email.toLowerCase() })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

/* ================= OAUTH ================= */
async function metaCallback(request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error_description') || url.searchParams.get('error')
    if (error) return popupResponse({ ok:false, provider:'Meta', message: error })
    if (!code) return popupResponse({ ok:false, provider:'Meta', message: 'No code' })
    const short = await metaExchangeCode(code, metaRedirect(request))
    const long = await metaLongLived(short.access_token)
    const pages = await metaGetPages(long.access_token)
    const igAccounts = []
    pages.forEach(pg => { if (pg.instagram_business_account) igAccounts.push({ ...pg.instagram_business_account, page_id: pg.id, page_name: pg.name }) })
    const col = await connections()
    await col.updateOne(
      { provider: 'meta' },
      { $set: {
        provider: 'meta',
        user_access_token: long.access_token,
        expires_at: long.expires_in ? new Date(Date.now() + long.expires_in*1000) : null,
        pages: pages.map(pg => ({ id: pg.id, name: pg.name, access_token: pg.access_token, category: pg.category })),
        ig_accounts: igAccounts,
        updated_at: new Date(),
        created_at: new Date(),
      } },
      { upsert: true }
    )
    return popupResponse({ ok:true, provider:'Meta', message: `${pages.length} Page & ${igAccounts.length} Instagram Business tersambung` })
  } catch (e) {
    return popupResponse({ ok:false, provider:'Meta', message: String(e?.message || e) })
  }
}

async function googleCallback(request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error_description') || url.searchParams.get('error')
    if (error) return popupResponse({ ok:false, provider:'Google', message: error })
    if (!code) return popupResponse({ ok:false, provider:'Google', message: 'No code' })
    const t = await googleExchangeCode(code, googleRedirect(request))
    let channels = [], gaProperties = []
    try { channels = await ytListChannels(t.access_token) } catch (e) { console.warn('yt list', e.message) }
    try { gaProperties = await gaListProperties(t.access_token) } catch (e) { console.warn('ga list', e.message) }
    const col = await connections()
    await col.updateOne(
      { provider: 'google' },
      { $set: {
        provider: 'google',
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        expires_at: t.expires_in ? new Date(Date.now() + t.expires_in*1000) : null,
        channels: channels.map(c => ({ id: c.id, title: c.snippet?.title, subscribers: c.statistics?.subscriberCount, videos: c.statistics?.videoCount, views: c.statistics?.viewCount })),
        ga_properties: gaProperties,
        updated_at: new Date(),
        created_at: new Date(),
      } },
      { upsert: true }
    )
    return popupResponse({ ok:true, provider:'Google', message: `${channels.length} YouTube channel & ${gaProperties.length} GA4 property terdeteksi` })
  } catch (e) {
    return popupResponse({ ok:false, provider:'Google', message: String(e?.message || e) })
  }
}

async function tiktokCallback(request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error_description') || url.searchParams.get('error')
    if (error) return popupResponse({ ok:false, provider:'TikTok', message: error })
    if (!code) return popupResponse({ ok:false, provider:'TikTok', message: 'No code' })
    const t = await tiktokExchangeCode(code, tiktokRedirect(request))
    let user = null
    try { user = await tiktokUserInfo(t.access_token) } catch (e) { console.warn('tt user', e.message) }
    const col = await connections()
    await col.updateOne(
      { provider: 'tiktok' },
      { $set: {
        provider: 'tiktok',
        access_token: t.access_token, refresh_token: t.refresh_token,
        open_id: t.open_id || user?.open_id,
        expires_at: t.expires_in ? new Date(Date.now() + t.expires_in*1000) : null,
        user, updated_at: new Date(), created_at: new Date(),
      } },
      { upsert: true }
    )
    return popupResponse({ ok:true, provider:'TikTok', message: user?.display_name ? `Terhubung sebagai ${user.display_name} (${user.follower_count||0} followers)` : 'Terhubung' })
  } catch (e) {
    return popupResponse({ ok:false, provider:'TikTok', message: String(e?.message || e) })
  }
}

async function listConnections() {
  const col = await connections()
  const docs = await col.find({}).toArray()
  return NextResponse.json({ connections: docs.map(d => ({
    provider: d.provider,
    connected: true,
    updated_at: d.updated_at,
    expires_at: d.expires_at,
    pages: (d.pages || []).map(p => ({ id: p.id, name: p.name, category: p.category })),
    ig_accounts: (d.ig_accounts || []).map(a => ({ id: a.id, username: a.username, name: a.name, followers_count: a.followers_count })),
    channels: (d.channels || []).map(c => ({ id: c.id, title: c.title, subscribers: c.subscribers, videos: c.videos, views: c.views })),
    ga_properties: (d.ga_properties || []).map(p => ({ id: p.id, displayName: p.displayName, parent: p.parent })),
    user: d.user ? { display_name: d.user.display_name, follower_count: d.user.follower_count, following_count: d.user.following_count, likes_count: d.user.likes_count, video_count: d.user.video_count, avatar_url: d.user.avatar_url } : null,
  })) })
}

/* ============ LIVE DATA ============ */
async function ensureGoogleToken(doc) {
  if (!doc.expires_at || new Date(doc.expires_at) > new Date(Date.now() + 60000)) return doc.access_token
  if (!doc.refresh_token) return doc.access_token
  try {
    const t = await googleRefreshToken(doc.refresh_token)
    const col = await connections()
    await col.updateOne({ provider:'google' }, { $set: { access_token: t.access_token, expires_at: new Date(Date.now() + t.expires_in*1000), updated_at: new Date() } })
    return t.access_token
  } catch { return doc.access_token }
}

async function liveFacebook(request) {
  const col = await connections()
  const doc = await col.findOne({ provider: 'meta' })
  if (!doc || !doc.pages?.length) return NextResponse.json({ connected: false })
  const url = new URL(request.url); const days = +(url.searchParams.get('days') || 30)
  const pageId = url.searchParams.get('page_id') || doc.pages[0].id
  const page = doc.pages.find(p => p.id === pageId) || doc.pages[0]
  try {
    const data = await metaGetPageInsights(page.id, page.access_token, days)
    return NextResponse.json({ connected: true, page: { id: page.id, name: page.name }, days, raw: data, summary: summarizePageInsights(data) })
  } catch (e) {
    return NextResponse.json({ connected: true, error: e.message, page: { id: page.id, name: page.name } }, { status: 200 })
  }
}

async function liveInstagram(request) {
  const col = await connections()
  const doc = await col.findOne({ provider: 'meta' })
  if (!doc || !doc.ig_accounts?.length) return NextResponse.json({ connected: false })
  const url = new URL(request.url); const days = +(url.searchParams.get('days') || 30)
  const ig = doc.ig_accounts[0]
  try {
    const account = await metaGetIgAccount(ig.id, doc.user_access_token)
    const insights = await metaGetIgInsights(ig.id, doc.user_access_token, days)
    return NextResponse.json({ connected: true, account, days, raw: insights, summary: summarizeIgInsights(insights) })
  } catch (e) {
    return NextResponse.json({ connected: true, error: e.message }, { status: 200 })
  }
}

async function liveYoutube(request) {
  const col = await connections()
  const doc = await col.findOne({ provider: 'google' })
  if (!doc || !doc.channels?.length) return NextResponse.json({ connected: false })
  const url = new URL(request.url); const days = +(url.searchParams.get('days') || 30)
  const ch = doc.channels[0]
  const token = await ensureGoogleToken(doc)
  try {
    const stats = await ytChannelStats(token, ch.id)
    let analytics = null
    try { analytics = await ytAnalyticsReport(token, ch.id, days) } catch (e) { /* Analytics scope may not be granted */ }
    return NextResponse.json({ connected: true, channel: { id: ch.id, title: ch.title }, days, stats, analytics, summary: summarizeYt(stats, analytics) })
  } catch (e) {
    return NextResponse.json({ connected: true, error: e.message }, { status: 200 })
  }
}

async function liveTiktok(request) {
  const col = await connections()
  const doc = await col.findOne({ provider: 'tiktok' })
  if (!doc) return NextResponse.json({ connected: false })
  try {
    let user = doc.user
    try { user = await tiktokUserInfo(doc.access_token) } catch {}
    let videos = null
    try { videos = await tiktokVideoList(doc.access_token) } catch {}
    return NextResponse.json({ connected: true, user, videos, summary: {
      followers: user?.follower_count || 0, following: user?.following_count || 0,
      likes: user?.likes_count || 0, videos: user?.video_count || 0,
    } })
  } catch (e) {
    return NextResponse.json({ connected: true, error: e.message }, { status: 200 })
  }
}

async function liveGa4(request) {
  const col = await connections()
  const doc = await col.findOne({ provider: 'google' })
  if (!doc || !doc.ga_properties?.length) return NextResponse.json({ connected: false })
  const url = new URL(request.url); const days = +(url.searchParams.get('days') || 30)
  const propId = url.searchParams.get('property_id') || doc.ga_properties[0].id
  const token = await ensureGoogleToken(doc)
  try {
    const report = await ga4RunReport(token, propId, days)
    return NextResponse.json({ connected: true, property_id: propId, days, raw: report, summary: summarizeGa4(report) })
  } catch (e) {
    return NextResponse.json({ connected: true, error: e.message }, { status: 200 })
  }
}

/* ============ SUMMARIZERS ============ */
function summarizePageInsights(data) {
  const byName = {}
  data.forEach(m => { byName[m.name] = (m.values || []).map(v => v.value) })
  const sum = arr => (arr||[]).reduce((a,b)=>a+(+b||0),0)
  return {
    impressions: sum(byName.page_impressions),
    reach: sum(byName.page_impressions_unique),
    engagement: sum(byName.page_post_engagements),
    videoViews: sum(byName.page_video_views),
    fansEnd: (byName.page_fans || []).slice(-1)[0] || 0,
    fansStart: (byName.page_fans || [])[0] || 0,
  }
}
function summarizeIgInsights(data) {
  const byName = {}
  data.forEach(m => { byName[m.name] = (m.values || []).map(v => v.value) })
  const sum = arr => (arr||[]).reduce((a,b)=>a+(+b||0),0)
  return {
    reach: sum(byName.reach),
    impressions: sum(byName.impressions),
    profileViews: sum(byName.profile_views),
    websiteClicks: sum(byName.website_clicks),
    followerCountEnd: (byName.follower_count || []).slice(-1)[0] || 0,
  }
}
function summarizeYt(stats, analytics) {
  const s = stats?.statistics || {}
  const result = {
    subscribers: +s.subscriberCount || 0,
    totalViews: +s.viewCount || 0,
    videos: +s.videoCount || 0,
  }
  if (analytics?.rows) {
    const cols = analytics.columnHeaders.map(c => c.name)
    const sumCol = k => { const i = cols.indexOf(k); return analytics.rows.reduce((a,r)=>a+(+r[i]||0), 0) }
    result.periodViews = sumCol('views')
    result.watchTimeMin = sumCol('estimatedMinutesWatched')
    result.likes = sumCol('likes')
    result.comments = sumCol('comments')
    result.shares = sumCol('shares')
    result.subscribersGained = sumCol('subscribersGained')
    result.subscribersLost = sumCol('subscribersLost')
  }
  return result
}
function summarizeGa4(report) {
  const rows = report?.rows || []
  const sum = i => rows.reduce((a,r)=>a+(+r.metricValues?.[i]?.value || 0), 0)
  const avg = i => rows.length ? sum(i)/rows.length : 0
  return {
    users: sum(0), newUsers: sum(1), sessions: sum(2), pageViews: sum(3),
    bounceRate: +(avg(4)*100).toFixed(2), avgSessionDuration: Math.round(avg(5)),
  }
}

/* ============ USERS ============ */
const ROLE_ALLOWED = ['Admin','Analyst','Executive','Viewer']

function initialsOf(name) { return (name||'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase() || '??' }

const SEED_USERS = [
  { name:'Annisa Permatasari', email:'annisa.permatasari@dikdasmen.belajar.id', password:'Admin@2026',     role:'Admin',     jabatan:'Kepala Sub-Bagian Humas' },
  { name:'Rina Setiawati',     email:'rina.setiawati@dikdasmen.belajar.id',     password:'Analyst@2026',   role:'Analyst',   jabatan:'Analis Komunikasi Digital' },
  { name:'Budi Santosa',       email:'budi.santosa@dikdasmen.belajar.id',       password:'Executive@2026', role:'Executive', jabatan:'Direktur Kursus dan Pelatihan' },
  { name:'Dewi Rahayu',        email:'dewi.rahayu@dikdasmen.belajar.id',        password:'Viewer@2026',    role:'Viewer',    jabatan:'Staf Publikasi' },
]
let _seeded = false
async function ensureSeeded() {
  if (_seeded) return
  const col = await users()
  const count = await col.countDocuments()
  if (count === 0) {
    const now = new Date()
    await col.insertMany(SEED_USERS.map(u => ({ ...u, initial: initialsOf(u.name), active: true, created_at: now, updated_at: now, seeded: true })))
  }
  _seeded = true
}

async function ensureNotLastActiveAdmin(col, email) {
  const target = await col.findOne({ email })
  if (!target || target.role !== 'Admin') return null
  const otherActiveAdmins = await col.countDocuments({ role:'Admin', active: { $ne: false }, email: { $ne: email } })
  if (otherActiveAdmins === 0) return 'Tidak dapat menghapus/menonaktifkan Admin terakhir. Tambah Admin lain terlebih dulu.'
  return null
}

async function listUsers() {
  await ensureSeeded()
  const col = await users()
  const docs = await col.find({}, { projection: { password: 0, reset_code: 0, reset_expires: 0 } }).sort({ created_at: 1 }).toArray()
  return NextResponse.json({ users: docs.map(d => ({ name: d.name, email: d.email, role: d.role, jabatan: d.jabatan, initial: d.initial, active: d.active !== false, seeded: !!d.seeded, created_at: d.created_at })) })
}

async function createUser(request) {
  const body = await request.json().catch(() => ({}))
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const role = String(body.role || '').trim()
  const jabatan = String(body.jabatan || '').trim()
  if (!name || !email || !password || !role) return NextResponse.json({ error: 'Nama, email, kata sandi, dan peran wajib diisi' }, { status: 400 })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
  if (!ROLE_ALLOWED.includes(role)) return NextResponse.json({ error: `Peran harus salah satu dari: ${ROLE_ALLOWED.join(', ')}` }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Kata sandi minimal 6 karakter' }, { status: 400 })
  const col = await users()
  const now = new Date()
  const doc = { name, email, password, role, jabatan, initial: initialsOf(name), active: true, updated_at: now }
  try {
    await col.updateOne({ email }, { $set: doc, $setOnInsert: { created_at: now } }, { upsert: true })
    return NextResponse.json({ ok: true, user: { name, email, role, jabatan, initial: doc.initial } })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Gagal menyimpan user' }, { status: 500 })
  }
}

async function authLogin(request) {
  await ensureSeeded()
  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) return NextResponse.json({ error: 'Email & kata sandi wajib diisi' }, { status: 400 })
  const col = await users()
  const doc = await col.findOne({ email })
  if (!doc || doc.password !== password) return NextResponse.json({ error: 'Email atau kata sandi salah' }, { status: 401 })
  if (doc.active === false) return NextResponse.json({ error: 'Akun Anda dinonaktifkan. Hubungi admin.' }, { status: 403 })
  return NextResponse.json({ user: { name: doc.name, email: doc.email, role: doc.role, jabatan: doc.jabatan, initial: doc.initial } })
}

async function toggleUserStatus(request) {
  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const active = !!body.active
  if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
  const col = await users()
  if (!active) {
    const err = await ensureNotLastActiveAdmin(col, email)
    if (err) return NextResponse.json({ error: err }, { status: 400 })
  }
  const r = await col.updateOne({ email }, { $set: { active, updated_at: new Date() } })
  if (!r.matchedCount) return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ ok: true, email, active })
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function forgotPassword(request) {
  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
  const col = await users()
  const doc = await col.findOne({ email })
  if (!doc) {
    // Do not reveal user existence — return success but with a hint dev_code=null
    return NextResponse.json({ ok: true, message: 'Jika email terdaftar, kode verifikasi telah dikirim.', dev_code: null, delivery: 'demo' })
  }
  if (doc.active === false) return NextResponse.json({ error: 'Akun Anda dinonaktifkan. Hubungi admin.' }, { status: 403 })
  const code = generateResetCode()
  const expires = new Date(Date.now() + 15*60*1000) // 15 minutes
  await col.updateOne({ email }, { $set: { reset_code: code, reset_expires: expires, updated_at: new Date() } })
  // NOTE: In production, send email here (SendGrid/SES/SMTP). For demo, return dev_code.
  return NextResponse.json({
    ok: true,
    message: 'Kode verifikasi telah dibuat. Berlaku 15 menit.',
    dev_code: code,
    delivery: 'demo', // will become 'email' once email service is wired
    masked_email: email.replace(/^(.{2}).*@/, '$1***@'),
  })
}

async function resetPassword(request) {
  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const code = String(body.code || '').trim()
  const newPassword = String(body.new_password || '')
  if (!email || !code || !newPassword) return NextResponse.json({ error: 'Email, kode, dan kata sandi baru wajib diisi' }, { status: 400 })
  if (newPassword.length < 6) return NextResponse.json({ error: 'Kata sandi baru minimal 6 karakter' }, { status: 400 })
  const col = await users()
  const doc = await col.findOne({ email })
  if (!doc || !doc.reset_code || doc.reset_code !== code) return NextResponse.json({ error: 'Kode verifikasi salah' }, { status: 400 })
  if (!doc.reset_expires || new Date(doc.reset_expires) < new Date()) return NextResponse.json({ error: 'Kode verifikasi telah kedaluwarsa. Minta kode baru.' }, { status: 400 })
  await col.updateOne({ email }, { $set: { password: newPassword, updated_at: new Date() }, $unset: { reset_code: '', reset_expires: '' } })
  return NextResponse.json({ ok: true, message: 'Kata sandi berhasil direset. Silakan masuk dengan kata sandi baru.' })
}

/* ============ IMPACT STATS ============ */
const DEFAULT_STATS = [
  { v:'1,2 Jt+',  l:'Alumni Bersertifikasi', s:'BNSP-terverifikasi',       source:'' },
  { v:'12.000+',  l:'LKP Aktif',             s:'Tersebar 34 provinsi',     source:'' },
  { v:'86%',      l:'Penempatan Kerja',      s:'Alumni bekerja/berwirausaha', source:'' },
  { v:'450+',     l:'Bidang Keahlian',       s:'Selaras SKKNI & industri', source:'' },
]
async function impactStatsCol() { return (await db()).collection('impact_stats') }
async function getImpactStats() {
  const col = await impactStatsCol()
  let doc = await col.findOne({ _id: 'main' })
  if (!doc) {
    const now = new Date()
    doc = { _id: 'main', stats: DEFAULT_STATS.map(s => ({ ...s, updated_at: now })), updated_at: now }
    try { await col.insertOne(doc) } catch {}
  }
  return NextResponse.json({ stats: doc.stats, updated_at: doc.updated_at })
}
async function saveImpactStats(request) {
  const body = await request.json().catch(() => ({}))
  const incoming = Array.isArray(body.stats) ? body.stats.slice(0,4) : []
  if (incoming.length !== 4) return NextResponse.json({ error: 'Harus tepat 4 statistik' }, { status: 400 })
  const now = new Date()
  const cleaned = incoming.map(s => ({
    v: String(s.v || '').trim().slice(0,20),
    l: String(s.l || '').trim().slice(0,60),
    s: String(s.s || '').trim().slice(0,120),
    source: String(s.source || '').trim().slice(0,300),
    updated_at: now,
  }))
  if (cleaned.some(s => !s.v || !s.l)) return NextResponse.json({ error: 'Nilai dan label wajib diisi untuk semua statistik' }, { status: 400 })
  const col = await impactStatsCol()
  await col.updateOne({ _id: 'main' }, { $set: { stats: cleaned, updated_at: now } }, { upsert: true })
  return NextResponse.json({ ok: true, stats: cleaned, updated_at: now })
}

/* ============ AI INSIGHTS ============ */
async function aiInsights(request) {
  try {
    const apiKey = process.env.EMERGENT_LLM_KEY
    if (!apiKey) return NextResponse.json({ error: 'EMERGENT_LLM_KEY belum dikonfigurasi' }, { status: 500 })
    const body = await request.json().catch(()=>({}))
    const { context = {}, scope = 'overview' } = body
    const { LlmChat, UserMessage } = await import('emergentintegrations')
    const systemPrompt = `Anda adalah analis komunikasi digital senior untuk Direktorat Kursus dan Pelatihan (Kementerian Pendidikan Dasar dan Menengah Republik Indonesia).
Analisis data JSON dan hasilkan insight Bahasa Indonesia yang jelas untuk pimpinan.
KELUARKAN JSON VALID dengan struktur:
{
  "findings": [ ...3-5 poin "What happened?"/"Why?" berbasis data... ],
  "opportunities": [ ...2-4 peluang komunikasi... ],
  "risks": [ ...1-3 risiko atau isu perlu perhatian... ],
  "actions": [ ...3-5 rekomendasi tindakan konkret... ],
  "ideas": [ ...3-5 ide konten kreatif berikutnya... ]
}
ATURAN: Item singkat 1-2 kalimat, sebutkan angka data jika relevan. Bahasa Indonesia formal. Jangan mengarang angka. Hanya keluarkan JSON, tanpa markdown fence.`
    const chat = new LlmChat(apiKey, `medsos-${scope}-${Date.now()}`, systemPrompt)
      .withModel('anthropic','claude-sonnet-4-5')
      .withParams({ temperature: 0.3, max_tokens: 2000 })
    const userText = `Konteks: ${scope}\n\nData:\n${JSON.stringify(context).slice(0, 8000)}`
    const reply = await chat.sendMessage(new UserMessage({ text: userText }))
    const raw = typeof reply === 'string' ? reply : String(reply)
    let clean = raw.replace(/```(?:json)?/gi,'').trim()
    let parsed = null
    try { parsed = JSON.parse(clean) } catch {}
    if (!parsed) { const m = clean.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]) } catch {} } }
    if (!parsed) return NextResponse.json({ error: 'Parse gagal', raw: raw.slice(0,800) }, { status: 502 })
    return NextResponse.json({ insights: parsed })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 })
  }
}
