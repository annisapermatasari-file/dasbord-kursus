// TikTok OAuth v2 helpers (open.tiktokapis.com)
const AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/'
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
const API = 'https://open.tiktokapis.com/v2'
const SCOPES = ['user.info.basic','user.info.profile','user.info.stats','video.list'].join(',')

export function hasTiktokCreds() {
  return !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET)
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

export async function tiktokExchangeCode(code, redirectUri) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    code, grant_type: 'authorization_code', redirect_uri: redirectUri,
  })
  const r = await fetch(TOKEN_URL, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body })
  const j = await r.json()
  if (!r.ok || !j.access_token) throw new Error(j.error_description || j.error || 'TikTok token exchange failed')
  return j // { access_token, refresh_token, expires_in, open_id }
}

export async function tiktokUserInfo(accessToken) {
  const fields = 'open_id,union_id,avatar_url,display_name,bio_description,follower_count,following_count,likes_count,video_count'
  const r = await fetch(`${API}/user/info/?fields=${fields}`, { headers:{ Authorization:`Bearer ${accessToken}` } })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'TikTok user info failed')
  return j.data?.user || j.data || j
}

export async function tiktokVideoList(accessToken, cursor = 0) {
  const body = { max_count: 20, cursor }
  const fields = 'id,create_time,cover_image_url,title,video_description,duration,view_count,like_count,comment_count,share_count'
  const r = await fetch(`${API}/video/list/?fields=${fields}`, { method:'POST', headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' }, body: JSON.stringify(body) })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'TikTok video list failed')
  return j.data || {}
}
