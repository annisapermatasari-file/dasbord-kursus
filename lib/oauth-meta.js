// Meta (Facebook + Instagram) OAuth helpers
const GRAPH = 'https://graph.facebook.com/v19.0'
const SCOPES = [
  'public_profile',
  'pages_show_list','pages_read_engagement','pages_read_user_content',
  'instagram_basic','instagram_manage_insights',
  'read_insights','business_management',
].join(',')

export function metaAuthUrl(redirectUri, state) {
  const u = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  u.searchParams.set('client_id', process.env.META_APP_ID)
  u.searchParams.set('redirect_uri', redirectUri)
  u.searchParams.set('scope', SCOPES)
  u.searchParams.set('state', state)
  u.searchParams.set('response_type', 'code')
  return u.toString()
}

export async function metaExchangeCode(code, redirectUri) {
  const u = new URL(`${GRAPH}/oauth/access_token`)
  u.searchParams.set('client_id', process.env.META_APP_ID)
  u.searchParams.set('client_secret', process.env.META_APP_SECRET)
  u.searchParams.set('redirect_uri', redirectUri)
  u.searchParams.set('code', code)
  const r = await fetch(u.toString()); const j = await r.json()
  if (!r.ok || !j.access_token) throw new Error(j.error?.message || 'Failed to exchange code')
  return j // { access_token, token_type, expires_in }
}

export async function metaLongLived(shortToken) {
  const u = new URL(`${GRAPH}/oauth/access_token`)
  u.searchParams.set('grant_type', 'fb_exchange_token')
  u.searchParams.set('client_id', process.env.META_APP_ID)
  u.searchParams.set('client_secret', process.env.META_APP_SECRET)
  u.searchParams.set('fb_exchange_token', shortToken)
  const r = await fetch(u.toString()); const j = await r.json()
  if (!r.ok || !j.access_token) throw new Error(j.error?.message || 'Failed to get long-lived token')
  return j
}

export async function metaGetPages(userToken) {
  const r = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username,name,followers_count,media_count,profile_picture_url}&access_token=${encodeURIComponent(userToken)}`)
  const j = await r.json()
  if (!r.ok) throw new Error(j.error?.message || 'Failed to get pages')
  return j.data || []
}

export async function metaGetPageInsights(pageId, pageToken, days = 30) {
  const until = Math.floor(Date.now()/1000)
  const since = until - days*86400
  const metrics = ['page_impressions','page_impressions_unique','page_post_engagements','page_fans','page_video_views','page_actions_post_reactions_total']
  const url = `${GRAPH}/${pageId}/insights?metric=${metrics.join(',')}&period=day&since=${since}&until=${until}&access_token=${encodeURIComponent(pageToken)}`
  const r = await fetch(url); const j = await r.json()
  if (!r.ok) throw new Error(j.error?.message || 'Failed to get page insights')
  return j.data || []
}

export async function metaGetIgInsights(igId, userToken, days = 30) {
  const until = Math.floor(Date.now()/1000)
  const since = until - days*86400
  const metrics = ['reach','impressions','profile_views','follower_count','website_clicks']
  const url = `${GRAPH}/${igId}/insights?metric=${metrics.join(',')}&period=day&since=${since}&until=${until}&access_token=${encodeURIComponent(userToken)}`
  const r = await fetch(url); const j = await r.json()
  if (!r.ok) throw new Error(j.error?.message || 'Failed to get IG insights')
  return j.data || []
}

export async function metaGetIgAccount(igId, userToken) {
  const url = `${GRAPH}/${igId}?fields=username,name,followers_count,follows_count,media_count,profile_picture_url,biography&access_token=${encodeURIComponent(userToken)}`
  const r = await fetch(url); const j = await r.json()
  if (!r.ok) throw new Error(j.error?.message || 'Failed to get IG account')
  return j
}
