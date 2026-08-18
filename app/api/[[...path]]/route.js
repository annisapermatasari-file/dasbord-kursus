import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { connections, db } from '@/lib/db'
import {
  findUserByEmail,
  listUsers as listUsersRows,
  countUsers,
  countOtherActiveAdmins,
  seedUsers,
  upsertUser,
  setUserActive,
  deleteUserByEmail,
  setResetCode,
  updatePassword,
} from '@/lib/users-repo'
import { metaAuthUrl, metaExchangeCode, metaLongLived, metaGetPages, metaGetIgAccount, metaGetIgInsights, metaGetPageInsights } from '@/lib/oauth-meta'
import { googleAuthUrl, googleExchangeCode, googleRefreshToken, ytListChannels, ytChannelStats, ytAnalyticsReport, gaListProperties, ga4RunReport } from '@/lib/oauth-google'
import { hasTiktokCreds, tiktokAuthUrl, tiktokExchangeCode, tiktokUserInfo, tiktokVideoList } from '@/lib/oauth-tiktok'
import { hasAyrshareCreds, createProfile, listProfiles, deleteProfile, generateJWT, getUser, socialAnalytics, createPost, history, getStoredProfile, upsertStoredProfile, deleteStoredProfile } from '@/lib/ayrshare'
import { hasSmtp, sendMail, otpEmail } from '@/lib/mailer'
import { logActivity, reqContext, listActivity, activitySummary } from '@/lib/activity'
import { sendWeeklyDigest, getDigestState, setDigestState, shouldAutoSend } from '@/lib/digest'

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

    if (path === 'ayrshare/status') return ayrStatus()
    if (path === 'ayrshare/analytics') return ayrAnalytics(request)
    if (path === 'ayrshare/refresh') return ayrRefresh()
    if (path === 'ayrshare/history') return ayrHistory(request)
    if (path === 'digest/weekly/status') return digestStatus()
    if (path === 'activity-logs') return getActivityLogs(request)
    if (path === 'activity-summary') return getActivitySummary()

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
    if (path === 'ayrshare/link') return ayrLink(request)
    if (path === 'ayrshare/post') return ayrPost(request)
    if (path === 'digest/weekly/send') return digestSend(request)
    if (path === 'digest/weekly/preview') return digestPreview(request)
    if (path === 'digest/weekly/settings') return digestSaveSettings(request)
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
    if (path === 'ayrshare/profile') {
      const stored = await getStoredProfile()
      if (stored?.profileKey) {
        try { await deleteProfile(stored.profileKey) } catch {}
      }
      await deleteStoredProfile()
      return NextResponse.json({ ok: true })
    }
    if (path.startsWith('users/')) {
      const email = decodeURIComponent(path.slice('users/'.length))
      const err = await ensureNotLastActiveAdmin(email.toLowerCase())
      if (err) return NextResponse.json({ error: err }, { status: 400 })
      await deleteUserByEmail(email.toLowerCase())
      await logActivity({ action:'user.delete', actor: request.headers.get('x-actor-email') || 'admin', target: email.toLowerCase(), status:'success', ...reqContext(request) })
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
const PLAN_ALLOWED = ['starter','business','agency']

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
  const count = await countUsers()
  if (count === 0) {
    await seedUsers(SEED_USERS.map(u => ({ ...u, initial: initialsOf(u.name) })))
  }
  _seeded = true
}

async function ensureNotLastActiveAdmin(email) {
  const target = await findUserByEmail(email)
  if (!target || target.role !== 'Admin') return null
  const otherActiveAdmins = await countOtherActiveAdmins(email)
  if (otherActiveAdmins === 0) return 'Tidak dapat menghapus/menonaktifkan Admin terakhir. Tambah Admin lain terlebih dulu.'
  return null
}

async function listUsers() {
  try {
    await ensureSeeded()
    const docs = await listUsersRows()
    return NextResponse.json({ users: docs.map(d => ({ name: d.name, email: d.email, role: d.role, plan: d.plan || 'starter', jabatan: d.jabatan, initial: d.initial, active: d.active !== false, seeded: !!d.seeded, created_at: d.created_at })) })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Gagal memuat daftar user' }, { status: 500 })
  }
}

async function createUser(request) {
  const body = await request.json().catch(() => ({}))

  const name = String(body.name || '').trim()
  const businessName = String(body.businessName || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const role = String(body.role || 'Viewer').trim()
  const jabatan = String(body.jabatan || '').trim()
  const planInput = body.plan ? String(body.plan).trim().toLowerCase() : ''

  if (!name || !email || !role) {
    return NextResponse.json(
      { error: 'Nama, email, dan peran wajib diisi' },
      { status: 400 }
    )
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Format email tidak valid' },
      { status: 400 }
    )
  }

  if (!ROLE_ALLOWED.includes(role)) {
    return NextResponse.json(
      { error: `Peran harus salah satu dari: ${ROLE_ALLOWED.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const existing = email ? await findUserByEmail(email) : null
    const passwordValue = password || existing?.password || ''

    if (!existing && !passwordValue) {
      return NextResponse.json(
        { error: 'Nama, email, kata sandi, dan peran wajib diisi' },
        { status: 400 }
      )
    }

    if (passwordValue && passwordValue.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi minimal 6 karakter' },
        { status: 400 }
      )
    }

    const plan = PLAN_ALLOWED.includes(planInput) ? planInput : (existing?.plan || 'starter')

    if (plan !== 'agency' && role !== 'Admin') {
      return NextResponse.json(
        { error: 'Paket Starter & Business hanya mendukung peran Admin. Upgrade ke Agency untuk peran lain.' },
        { status: 400 }
      )
    }

    const doc = {
      name,
      businessName,
      email,
      password: passwordValue,
      role,
      plan,
      jabatan,
      initial: initialsOf(name),
      active: existing?.active ?? true,
    }

    await upsertUser(doc)

    await logActivity({
      action: 'user.upsert',
      actor: request.headers.get('x-actor-email') || 'admin',
      target: email,
      status: 'success',
      meta: {
        role,
        jabatan,
        businessName,
        plan,
      },
      ...reqContext(request),
    })

    return NextResponse.json({
      ok: true,
      user: {
        name,
        businessName,
        email,
        role,
        jabatan,
        plan,
        initial: doc.initial,
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || 'Gagal menyimpan user' },
      { status: 500 }
    )
  }
}

async function authLogin(request) {
  try {
    await ensureSeeded()
    const body = await request.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const ctx = reqContext(request)
    if (!email || !password) {
      await logActivity({ action:'auth.login', actor: email||'anonymous', status:'failure', meta:{ reason:'missing-fields' }, ...ctx })
      return NextResponse.json({ error: 'Email & kata sandi wajib diisi' }, { status: 400 })
    }
    const doc = await findUserByEmail(email)
    if (!doc || doc.password !== password) {
      await logActivity({ action:'auth.login', actor: email, status:'failure', meta:{ reason: doc ? 'wrong-password' : 'unknown-email' }, ...ctx })
      return NextResponse.json({ error: 'Email atau kata sandi salah' }, { status: 401 })
    }
    if (doc.active === false) {
      await logActivity({ action:'auth.login', actor: email, status:'failure', meta:{ reason:'inactive' }, ...ctx })
      return NextResponse.json({ error: 'Akun Anda dinonaktifkan. Hubungi admin.' }, { status: 403 })
    }
    await logActivity({ action:'auth.login', actor: email, status:'success', meta:{ role: doc.role }, ...ctx })
    return NextResponse.json({ user: { name: doc.name, email: doc.email, role: doc.role, plan: doc.plan || 'starter', jabatan: doc.jabatan, initial: doc.initial } })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Gagal memproses login' }, { status: 500 })
  }
}

async function toggleUserStatus(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    const active = !!body.active
    if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    const existing = await findUserByEmail(email)
    if (!existing) return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    if (!active) {
      const err = await ensureNotLastActiveAdmin(email)
      if (err) return NextResponse.json({ error: err }, { status: 400 })
    }
    const updated = await setUserActive(email, active)
    if (!updated) return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    await logActivity({
      action: 'user.status',
      actor: request.headers.get('x-actor-email') || 'admin',
      target: email,
      status: 'success',
      meta: { active, role: existing.role, previousActive: existing.active !== false },
      ...reqContext(request),
    })
    return NextResponse.json({ ok: true, email, active })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Gagal mengubah status user' }, { status: 500 })
  }
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function forgotPassword(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    const doc = await findUserByEmail(email)
    if (!doc) {
      // Do not reveal user existence — return success but with a hint dev_code=null
      return NextResponse.json({ ok: true, message: 'Jika email terdaftar, kode verifikasi telah dikirim.', dev_code: null, delivery: 'demo' })
    }
    if (doc.active === false) return NextResponse.json({ error: 'Akun Anda dinonaktifkan. Hubungi admin.' }, { status: 403 })
    const code = generateResetCode()
    const expires = new Date(Date.now() + 15*60*1000) // 15 minutes
    await setResetCode(email, code, expires)
    // Kirim email OTP via SMTP (nodemailer) jika terkonfigurasi
    let delivery = 'demo'
    let dev_code = code
    let email_error = null
    if (hasSmtp()) {
      const tpl = otpEmail({ code, expiresMinutes: 15, name: doc.name || '' })
      const result = await sendMail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text })
      if (result.ok) { delivery = 'email'; dev_code = null }
      else { email_error = result.error || 'SMTP gagal' }
    }
    return NextResponse.json({
      ok: true,
      message: delivery === 'email'
        ? `Kode verifikasi telah dikirim ke ${email.replace(/^(.{2}).*@/, '$1***@')}. Cek inbox/spam. Berlaku 15 menit.`
        : 'Kode verifikasi telah dibuat. Berlaku 15 menit.',
      dev_code,
      delivery,
      email_error,
      masked_email: email.replace(/^(.{2}).*@/, '$1***@'),
    })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Gagal memproses permintaan reset kata sandi' }, { status: 500 })
  }
}

async function resetPassword(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    const code = String(body.code || '').trim()
    const newPassword = String(body.new_password || '')
    if (!email || !code || !newPassword) return NextResponse.json({ error: 'Email, kode, dan kata sandi baru wajib diisi' }, { status: 400 })
    if (newPassword.length < 6) return NextResponse.json({ error: 'Kata sandi baru minimal 6 karakter' }, { status: 400 })
    const doc = await findUserByEmail(email)
    if (!doc || !doc.reset_code || doc.reset_code !== code) return NextResponse.json({ error: 'Kode verifikasi salah' }, { status: 400 })
    if (!doc.reset_expires || new Date(doc.reset_expires) < new Date()) return NextResponse.json({ error: 'Kode verifikasi telah kedaluwarsa. Minta kode baru.' }, { status: 400 })
    await updatePassword(email, newPassword)
    return NextResponse.json({ ok: true, message: 'Kata sandi berhasil direset. Silakan masuk dengan kata sandi baru.' })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Gagal reset kata sandi' }, { status: 500 })
  }
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
  await logActivity({ action:'impact-stats.update', actor: request.headers.get('x-actor-email') || 'admin', status:'success', meta:{ count: cleaned.length }, ...reqContext(request) })
  return NextResponse.json({ ok: true, stats: cleaned, updated_at: now })
}

/* ============ ACTIVITY LOGS ============ */
async function getActivityLogs(request) {
  const url = new URL(request.url)
  const limit = +(url.searchParams.get('limit') || 100)
  const actor = url.searchParams.get('actor') || undefined
  const action = url.searchParams.get('action') || undefined
  const status = url.searchParams.get('status') || undefined
  const days = +(url.searchParams.get('days') || 0)
  const since = days > 0 ? new Date(Date.now() - days*86400000) : undefined
  const logs = await listActivity({ limit, actor, action, status, since })
  return NextResponse.json({ logs })
}

async function getActivitySummary() {
  const s = await activitySummary()
  return NextResponse.json(s)
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


/* ============ AYRSHARE ============ */
async function ayrStatus() {
  if (!hasAyrshareCreds()) return NextResponse.json({ configured: false })
  const stored = await getStoredProfile()
  if (!stored?.profileKey) return NextResponse.json({ configured: true, hasProfile: false })
  // Ambil status akun sosial yang sudah terhubung dari Ayrshare
  const { ok, data } = await getUser(stored.profileKey)
  if (!ok) return NextResponse.json({ configured: true, hasProfile: true, profile: { title: stored.title, refId: stored.refId }, error: data?.message || 'Gagal fetch user' })
  return NextResponse.json({
    configured: true,
    hasProfile: true,
    profile: { title: stored.title, refId: stored.refId, createdAt: stored.created_at },
    activeSocialAccounts: data?.activeSocialAccounts || [],
    displayNames: data?.displayNames || [],
    monthlyPostCount: data?.monthlyPostCount,
    monthlyPostQuota: data?.monthlyPostQuota,
  })
}

async function ayrLink(request) {
  if (!hasAyrshareCreds()) return NextResponse.json({ error: 'Kredensial Ayrshare belum dikonfigurasi' }, { status: 400 })
  const body = await request.json().catch(()=>({}))
  const platforms = body.platforms || ['facebook','instagram','youtube','tiktok']
  const ctx = reqContext(request)
  const actor = request.headers.get('x-actor-email') || 'admin'

  // Pastikan ada profile — jika belum, buat baru
  let stored = await getStoredProfile()
  if (!stored?.profileKey) {
    const title = body.title || `Direktorat Kursus & Pelatihan ${new Date().getFullYear()}`
    const created = await createProfile(title)
    if (!created.ok) {
      return NextResponse.json({ error: 'Gagal membuat Ayrshare profile', detail: created.data }, { status: 502 })
    }
    stored = await upsertStoredProfile('default', {
      title: created.data?.title || title,
      refId: created.data?.refId,
      profileKey: created.data?.profileKey,
    })
  }

  // Generate JWT URL
  const redirect = (process.env.NEXT_PUBLIC_BASE_URL || '') + '/?ayrshare=done'
  const jwt = await generateJWT({
    profileKey: stored.profileKey,
    redirect,
    allowedSocial: platforms,
    verify: false,
  })
  if (!jwt.ok) {
    await logActivity({ action:'ayrshare.link', actor, status:'failure', meta:{ detail: jwt.data }, ...ctx })
    return NextResponse.json({ error: 'Gagal generate JWT', detail: jwt.data }, { status: 502 })
  }
  await logActivity({ action:'ayrshare.link', actor, status:'success', meta:{ platforms }, ...ctx })
  return NextResponse.json({
    ok: true,
    url: jwt.data?.url,
    title: stored.title,
    profileKey: undefined, // never leak client-side
  })
}

async function ayrRefresh() {
  const stored = await getStoredProfile()
  if (!stored?.profileKey) return NextResponse.json({ error: 'Profile belum dibuat' }, { status: 404 })
  const { ok, data } = await getUser(stored.profileKey)
  if (!ok) return NextResponse.json({ error: 'Gagal fetch', detail: data }, { status: 502 })
  await upsertStoredProfile('default', {
    title: stored.title, refId: stored.refId, profileKey: stored.profileKey,
    lastUser: data, last_synced_at: new Date(),
  })
  return NextResponse.json({ ok: true, user: data })
}

async function ayrAnalytics(request) {
  const stored = await getStoredProfile()
  if (!stored?.profileKey) return NextResponse.json({ connected: false, error: 'Profile belum dibuat' })
  const url = new URL(request.url)
  const platformsParam = url.searchParams.get('platforms')
  const platforms = platformsParam ? platformsParam.split(',') : ['facebook','instagram','youtube','tiktok']
  const { ok, data } = await socialAnalytics(stored.profileKey, platforms)
  if (!ok) return NextResponse.json({ connected: true, platforms, error: data?.message || 'Gagal', detail: data }, { status: 200 })
  return NextResponse.json({ connected: true, platforms, data })
}

/**
 * ayrHistory: fetch published posts via /history and aggregate per-day metrics
 * per platform to build a daily time-series usable by the area charts.
 * Query params: platform=instagram|facebook|youtube|tiktok, days=30
 */
async function ayrHistory(request) {
  const stored = await getStoredProfile()
  if (!stored?.profileKey) return NextResponse.json({ connected: false, error: 'Profile belum dibuat' })
  const url = new URL(request.url)
  const platform = (url.searchParams.get('platform') || '').toLowerCase() || null
  const days = Math.max(1, Math.min(365, +(url.searchParams.get('days') || 30)))
  const { ok, data } = await history(stored.profileKey, { lastDays: days, lastRecords: 500 })
  if (!ok) return NextResponse.json({ connected: true, error: data?.message || 'Gagal', detail: data }, { status: 200 })

  // Ayrshare returns { posts: [...] } typically. Support both shapes.
  const posts = Array.isArray(data) ? data : (data?.posts || data?.history || [])
  // Build days axis
  const today = new Date(); today.setUTCHours(0,0,0,0)
  const axis = []
  for (let i = days-1; i >= 0; i--) {
    const d = new Date(today); d.setUTCDate(d.getUTCDate() - i)
    axis.push(d.toISOString().slice(0,10))
  }
  const zero = () => Object.fromEntries(axis.map(d => [d, { date:d, posts:0, likes:0, comments:0, shares:0, views:0, reach:0, impressions:0, engagement:0 }]))
  const per = { instagram: zero(), facebook: zero(), youtube: zero(), tiktok: zero() }
  for (const p of posts) {
    const created = p.created || p.publishedAt || p.scheduleDate || p.date
    if (!created) continue
    const d = new Date(created).toISOString().slice(0,10)
    // Ayrshare returns postIds keyed by platform; metrics under `analytics` per platform
    const analytics = p.postIds ? {} : (p.analytics || {})
    // Newer shape: p.postIds is array of { platform, id, analytics }
    const pi = Array.isArray(p.postIds) ? p.postIds : (p.postIds && typeof p.postIds === 'object' ? Object.entries(p.postIds).map(([k,v]) => ({ platform:k, ...(v||{}) })) : [])
    for (const item of pi) {
      const plat = String(item.platform || '').toLowerCase()
      if (!per[plat] || !per[plat][d]) continue
      const a = item.analytics || item
      const bucket = per[plat][d]
      bucket.posts += 1
      bucket.likes += +(a.likeCount || a.likes || 0)
      bucket.comments += +(a.commentsCount || a.comments || 0)
      bucket.shares += +(a.shareCount || a.shares || 0)
      bucket.views += +(a.viewCount || a.videoViews || a.views || 0)
      bucket.reach += +(a.reach || 0)
      bucket.impressions += +(a.impressions || 0)
      bucket.engagement += +(a.engagement || (a.likeCount||0)+(a.commentsCount||0)+(a.shareCount||0))
    }
    // Fallback for simpler shape: platform + analytics on the post itself
    if (!pi.length && p.platform && per[p.platform.toLowerCase()]) {
      const bucket = per[p.platform.toLowerCase()][d]
      bucket.posts += 1
      const a = p.analytics || {}
      bucket.likes += +(a.likeCount||a.likes||0)
      bucket.comments += +(a.commentsCount||a.comments||0)
      bucket.shares += +(a.shareCount||a.shares||0)
      bucket.views += +(a.viewCount||a.views||0)
      bucket.engagement += +(a.engagement||0)
    }
  }
  // If a specific platform was requested, return just that array
  if (platform && per[platform]) {
    return NextResponse.json({ connected:true, platform, days, series: axis.map(d => per[platform][d]), rawCount: posts.length })
  }
  return NextResponse.json({ connected:true, days, series: Object.fromEntries(Object.entries(per).map(([k,v]) => [k, axis.map(d=>v[d])])), rawCount: posts.length })
}

async function ayrPost(request) {
  const stored = await getStoredProfile()
  const ctx = reqContext(request)
  const actor = request.headers.get('x-actor-email') || 'admin'
  if (!stored?.profileKey) return NextResponse.json({ error: 'Profile belum dibuat' }, { status: 400 })
  const body = await request.json().catch(()=>({}))
  if (!body.post) return NextResponse.json({ error: 'post (caption) wajib diisi' }, { status: 400 })
  if (!body.platforms || !body.platforms.length) return NextResponse.json({ error: 'platforms wajib' }, { status: 400 })
  const { ok, data, status } = await createPost(stored.profileKey, body)
  await logActivity({
    action: body.scheduleDate ? 'ayrshare.schedule' : 'ayrshare.publish',
    actor,
    status: ok ? 'success' : 'failure',
    meta: { platforms: body.platforms, scheduleDate: body.scheduleDate || null, caption: (body.post || '').slice(0, 140), hasMedia: !!(body.mediaUrls && body.mediaUrls.length), postId: data?.id, error: !ok ? (data?.message || 'failed') : undefined },
    ...ctx,
  })
  return NextResponse.json({ ok, data }, { status: ok ? 200 : status })
}

/* ============ WEEKLY DIGEST ============ */
async function digestStatus() {
  const state = await getDigestState()
  return NextResponse.json({
    enabled: state.enabled !== false,
    hour_wib: state.hour_wib || 8,
    recipients_mode: state.recipients_mode || 'admins',
    custom_recipients: state.custom_recipients || [],
    last_sent_at: state.last_sent_at || null,
    last_sent_recipients: state.last_sent_recipients || [],
    last_sent_success: state.last_sent_success || 0,
    last_sent_total: state.last_sent_total || 0,
  })
}

async function digestSend(request) {
  const body = await request.json().catch(()=>({}))
  const recipients = Array.isArray(body.recipients) && body.recipients.length ? body.recipients : null
  const r = await sendWeeklyDigest({ recipients })
  await logActivity({
    action:'digest.weekly.send',
    actor: request.headers.get('x-actor-email') || 'admin',
    status: r.ok ? 'success' : 'failure',
    meta: { recipients: r.recipients, success: r.results?.filter(x=>x.ok).length, total: r.recipients?.length, error: r.error },
    ...reqContext(request),
  })
  return NextResponse.json(r, { status: r.ok ? 200 : 500 })
}

async function digestPreview(request) {
  const body = await request.json().catch(()=>({}))
  const recipients = Array.isArray(body.recipients) && body.recipients.length ? body.recipients : null
  const r = await sendWeeklyDigest({ preview: true, recipients })
  return NextResponse.json(r)
}

async function digestSaveSettings(request) {
  const body = await request.json().catch(()=>({}))
  const patch = {}
  if (typeof body.enabled === 'boolean') patch.enabled = body.enabled
  if (Number.isFinite(+body.hour_wib)) patch.hour_wib = Math.min(23, Math.max(0, +body.hour_wib))
  if (body.recipients_mode === 'admins' || body.recipients_mode === 'custom') patch.recipients_mode = body.recipients_mode
  if (Array.isArray(body.custom_recipients)) patch.custom_recipients = body.custom_recipients.map(String).map(s=>s.trim().toLowerCase()).filter(e=>/@/.test(e))
  const state = await setDigestState(patch)
  await logActivity({ action:'digest.settings.update', actor: request.headers.get('x-actor-email') || 'admin', status:'success', meta: patch, ...reqContext(request) })
  return NextResponse.json({ ok: true, state })
}

/* ============ IN-PROCESS WEEKLY DIGEST SCHEDULER ============ */
// Runs a lightweight interval that fires every 20 minutes. On Monday morning
// (WIB) within the configured hour window, it triggers the digest send. The
// send helper enforces a 6-day cooldown so we send at most once per week.
if (typeof globalThis !== 'undefined' && !globalThis.__DIGEST_SCHEDULER__) {
  globalThis.__DIGEST_SCHEDULER__ = setInterval(async () => {
    try {
      const should = await shouldAutoSend()
      if (should) {
        console.log('[digest] Auto-triggering weekly digest at', new Date().toISOString())
        const r = await sendWeeklyDigest({})
        console.log('[digest] Auto-send result:', r.ok, 'recipients:', r.recipients?.length)
        await logActivity({ action:'digest.weekly.send', actor: 'system', status: r.ok ? 'success' : 'failure', meta: { auto: true, recipients: r.recipients, error: r.error } })
      }
    } catch (e) {
      console.warn('[digest] scheduler error:', e?.message)
    }
  }, 20 * 60 * 1000) // every 20 minutes
  console.log('[digest] In-process scheduler initialized')
}

