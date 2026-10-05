// Meta (Facebook + Instagram) OAuth & Insights helpers
//
// Catatan perubahan API Meta yang ditangani di sini:
// - Graph API v19 sudah kedaluwarsa. Default sekarang v25.0 (rilis Feb 2026),
//   bisa dioverride lewat env META_GRAPH_VERSION.
// - Metrik Page lama dihentikan Meta (Jun & Nov 2025):
//     page_impressions        -> page_media_view
//     page_impressions_unique -> page_total_media_view_unique
//     page_fans               -> page_follows
// - Metrik Instagram `impressions` dihentikan (Apr 2025) -> `views`.
//   profile_views / website_clicks / views wajib memakai metric_type=total_value.
// - Satu metrik invalid membuat seluruh request insights gagal, jadi setiap
//   metrik diminta terpisah dan kegagalan per-metrik diabaikan.

export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v25.0'
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`

const SCOPES = [
  'public_profile',
  'pages_show_list', 'pages_read_engagement', 'pages_read_user_content',
  'instagram_basic', 'instagram_manage_insights',
  'read_insights', 'business_management',
].join(',')

export function hasMetaCreds() {
  return !!(process.env.META_APP_ID && process.env.META_APP_SECRET)
}

async function graphGet(path, params = {}) {
  const u = new URL(`${GRAPH}/${path.replace(/^\//, '')}`)
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) u.searchParams.set(k, String(v)) })
  const r = await fetch(u.toString(), { cache: 'no-store' })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || j.error) {
    const err = new Error(j.error?.message || `Meta API error (${r.status})`)
    err.code = j.error?.code
    throw err
  }
  return j
}

export function metaAuthUrl(redirectUri, state) {
  const u = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`)
  u.searchParams.set('client_id', process.env.META_APP_ID)
  u.searchParams.set('redirect_uri', redirectUri)
  u.searchParams.set('scope', SCOPES)
  u.searchParams.set('state', state)
  u.searchParams.set('response_type', 'code')
  // Paksa dialog izin muncul lagi saat "Sambungkan Ulang" agar Page/IG baru bisa dipilih
  u.searchParams.set('auth_type', 'rerequest')
  return u.toString()
}

export async function metaExchangeCode(code, redirectUri) {
  const j = await graphGet('oauth/access_token', {
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    redirect_uri: redirectUri,
    code,
  })
  if (!j.access_token) throw new Error('Gagal menukar kode otorisasi Meta')
  return j // { access_token, token_type, expires_in }
}

export async function metaLongLived(shortToken) {
  const j = await graphGet('oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    fb_exchange_token: shortToken,
  })
  if (!j.access_token) throw new Error('Gagal mendapatkan long-lived token Meta')
  return j
}

// Ambil semua Page (dengan pagination). Page token yang diturunkan dari
// long-lived user token tidak kedaluwarsa, sehingga dipakai untuk semua
// panggilan Page & Instagram selanjutnya.
export async function metaGetPages(userToken) {
  const fields = 'id,name,access_token,category,instagram_business_account{id,username,name,followers_count,media_count,profile_picture_url}'
  let out = []
  let j = await graphGet('me/accounts', { fields, limit: 100, access_token: userToken })
  out = out.concat(j.data || [])
  let guard = 0
  while (j.paging?.next && guard++ < 10) {
    const r = await fetch(j.paging.next, { cache: 'no-store' })
    j = await r.json().catch(() => ({}))
    if (!r.ok || j.error) break
    out = out.concat(j.data || [])
  }
  return out
}

function range(days) {
  const until = Math.floor(Date.now() / 1000)
  const since = until - Math.max(1, Math.min(90, days)) * 86400
  return { since, until }
}

// Minta beberapa metrik satu per satu; metrik yang ditolak Meta dicatat di
// `skipped` alih-alih menggagalkan seluruh ringkasan.
async function tolerantInsights(objectId, token, metrics, extra) {
  const results = await Promise.allSettled(metrics.map(m =>
    graphGet(`${objectId}/insights`, { metric: m, access_token: token, ...extra })
  ))
  const data = []
  const skipped = []
  results.forEach((res, i) => {
    if (res.status === 'fulfilled') data.push(...(res.value.data || []))
    else skipped.push({ metric: metrics[i], reason: res.reason?.message })
  })
  // Jika semua metrik gagal karena token (code 190), lempar agar UI tahu harus sambung ulang
  if (!data.length && skipped.length) {
    const authFail = results.find(r => r.status === 'rejected' && r.reason?.code === 190)
    if (authFail) throw authFail.reason
    throw new Error(skipped[0].reason || 'Tidak ada metrik yang tersedia')
  }
  return { data, skipped }
}

const PAGE_METRICS = [
  'page_media_view',              // pengganti page_impressions
  'page_total_media_view_unique', // pengganti page_impressions_unique (reach)
  'page_post_engagements',
  'page_follows',                 // pengganti page_fans
  'page_daily_follows_unique',
  'page_video_views',
  'page_actions_post_reactions_total',
]

export async function metaGetPageInsights(pageId, pageToken, days = 30) {
  const { since, until } = range(days)
  return tolerantInsights(pageId, pageToken, PAGE_METRICS, { period: 'day', since, until })
}

export async function metaGetPageInfo(pageId, pageToken) {
  return graphGet(pageId, { fields: 'id,name,followers_count,fan_count,link,picture{url}', access_token: pageToken })
}

// Instagram: metrik time-series (period=day) dan metrik total (metric_type=total_value)
const IG_SERIES_METRICS = ['reach', 'follower_count']
const IG_TOTAL_METRICS = ['views', 'profile_views', 'website_clicks', 'accounts_engaged', 'total_interactions', 'likes', 'comments', 'shares', 'saves']

export async function metaGetIgInsights(igId, token, days = 30) {
  // IG membatasi rentang user insights maksimal 30 hari
  const { since, until } = range(Math.min(30, days))
  const [series, totals] = await Promise.all([
    tolerantInsights(igId, token, IG_SERIES_METRICS, { period: 'day', since, until }).catch(e => ({ data: [], skipped: [{ metric: 'series', reason: e.message }], error: e })),
    tolerantInsights(igId, token, IG_TOTAL_METRICS, { period: 'day', metric_type: 'total_value', since, until }).catch(e => ({ data: [], skipped: [{ metric: 'totals', reason: e.message }], error: e })),
  ])
  if (!series.data.length && !totals.data.length) throw (series.error || totals.error || new Error('Insights Instagram tidak tersedia'))
  return { data: [...series.data, ...totals.data], skipped: [...series.skipped, ...totals.skipped] }
}

export async function metaGetIgAccount(igId, token) {
  return graphGet(igId, {
    fields: 'username,name,followers_count,follows_count,media_count,profile_picture_url,biography',
    access_token: token,
  })
}

/* ============ Ringkasan ============ */
function seriesOf(data, name) {
  const m = data.find(x => x.name === name)
  return (m?.values || []).map(v => (typeof v.value === 'object' && v.value !== null)
    ? Object.values(v.value).reduce((a, b) => a + (+b || 0), 0)
    : (+v.value || 0))
}
function totalOf(data, name) {
  const m = data.find(x => x.name === name)
  if (!m) return undefined
  if (m.total_value) return +m.total_value.value || 0
  return seriesOf(data, name).reduce((a, b) => a + b, 0)
}
const sum = arr => arr.reduce((a, b) => a + b, 0)

export function summarizePageInsights(data, info) {
  const follows = seriesOf(data, 'page_follows')
  const views = totalOf(data, 'page_media_view') || 0
  return {
    impressions: views, // alias lama untuk UI
    views,
    reach: totalOf(data, 'page_total_media_view_unique') || 0,
    engagement: totalOf(data, 'page_post_engagements') || 0,
    reactions: totalOf(data, 'page_actions_post_reactions_total') || 0,
    videoViews: totalOf(data, 'page_video_views') || 0,
    newFollows: totalOf(data, 'page_daily_follows_unique') || 0,
    fansEnd: info?.followers_count ?? follows.slice(-1)[0] ?? info?.fan_count ?? 0,
    fansStart: follows[0] || 0,
    followers: info?.followers_count ?? info?.fan_count ?? follows.slice(-1)[0] ?? 0,
  }
}

export function summarizeIgInsights(data, account) {
  const followerSeries = seriesOf(data, 'follower_count')
  const views = totalOf(data, 'views') || 0
  return {
    reach: sum(seriesOf(data, 'reach')),
    views,
    impressions: views, // alias lama untuk UI
    profileViews: totalOf(data, 'profile_views') || 0,
    websiteClicks: totalOf(data, 'website_clicks') || 0,
    accountsEngaged: totalOf(data, 'accounts_engaged') || 0,
    interactions: totalOf(data, 'total_interactions') || 0,
    likes: totalOf(data, 'likes') || 0,
    comments: totalOf(data, 'comments') || 0,
    shares: totalOf(data, 'shares') || 0,
    saves: totalOf(data, 'saves') || 0,
    newFollowers: sum(followerSeries),
    followers: account?.followers_count || 0,
    followerCountEnd: account?.followers_count || 0,
  }
}
