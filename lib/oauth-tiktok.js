// TikTok Login Kit / Display API v2 helpers (open.tiktokapis.com)
//
// - Access token TikTok hanya berlaku 24 jam; refresh token 365 hari.
//   ensureTiktokToken() di API route memakai tiktokRefreshToken() otomatis.
// - TikTok kadang membalas HTTP 200 dengan { error: { code: '...' } } yang
//   bukan 'ok', jadi status error dicek dari body juga.

const AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/'
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
const API = 'https://open.tiktokapis.com/v2'
const SCOPES = ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.list'].join(',')

export function hasTiktokCreds() {
  return !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET)
}

function apiError(j, r, fallback) {
  const code = j?.error?.code
  if (code && code !== 'ok') {
    const e = new Error(j.error.message || code)
    e.code = code
    return e
  }
  if (!r.ok) return new Error(j?.error_description || j?.error?.message || fallback)
  return null
}

export function tiktokAuthUrl(redirectUri, state) {
  const u = new URL(AUTH_URL)
  u.searchParams.set('client_key', process.env.TIKTOK_CLIENT_KEY)
  u.searchParams.set('scope', SCOPES)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('redirect_uri', redirectUri)
  u.searchParams.set('state', state)
  return u.toString()
}

async function tokenRequest(params) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    ...params,
  })
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
    body,
    cache: 'no-store',
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || !j.access_token) throw new Error(j.error_description || j.error || 'Permintaan token TikTok gagal')
  return j // { access_token, refresh_token, expires_in, refresh_expires_in, open_id, scope }
}

export function tiktokExchangeCode(code, redirectUri) {
  return tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: redirectUri })
}

export function tiktokRefreshToken(refreshToken) {
  return tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken })
}

export async function tiktokUserInfo(accessToken) {
  const fields = 'open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,follower_count,following_count,likes_count,video_count'
  const r = await fetch(`${API}/user/info/?fields=${fields}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
  const j = await r.json().catch(() => ({}))
  const err = apiError(j, r, 'Gagal mengambil profil TikTok')
  if (err) throw err
  return j.data?.user || {}
}

export async function tiktokVideoList(accessToken, cursor) {
  const body = { max_count: 20 }
  if (cursor) body.cursor = cursor
  const fields = 'id,create_time,cover_image_url,share_url,title,video_description,duration,view_count,like_count,comment_count,share_count'
  const r = await fetch(`${API}/video/list/?fields=${fields}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const j = await r.json().catch(() => ({}))
  const err = apiError(j, r, 'Gagal mengambil daftar video TikTok')
  if (err) throw err
  return j.data || {} // { videos, cursor, has_more }
}

export function summarizeTiktok(user, videos) {
  const list = videos?.videos || []
  const add = k => list.reduce((a, v) => a + (+v[k] || 0), 0)
  return {
    followers: user?.follower_count || 0,
    following: user?.following_count || 0,
    likes: user?.likes_count || 0,
    videos: user?.video_count || 0,
    views: add('view_count'),          // total views dari 20 video terbaru
    recentLikes: add('like_count'),
    recentComments: add('comment_count'),
    recentShares: add('share_count'),
    recentVideoCount: list.length,
  }
}
