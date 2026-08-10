// Google (YouTube Data API + Google Analytics 4) OAuth helpers
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
  'openid','email','profile',
].join(' ')

export function googleAuthUrl(redirectUri, state) {
  const u = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  u.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID)
  u.searchParams.set('redirect_uri', redirectUri)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('scope', SCOPES)
  u.searchParams.set('access_type', 'offline')
  u.searchParams.set('prompt', 'consent')
  u.searchParams.set('include_granted_scopes', 'true')
  u.searchParams.set('state', state)
  return u.toString()
}

export async function googleExchangeCode(code, redirectUri) {
  const body = new URLSearchParams({
    code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri, grant_type: 'authorization_code',
  })
  const r = await fetch('https://oauth2.googleapis.com/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body })
  const j = await r.json()
  if (!r.ok || !j.access_token) throw new Error(j.error_description || j.error || 'Failed to exchange code')
  return j // { access_token, refresh_token, expires_in, scope, token_type, id_token }
}

export async function googleRefreshToken(refreshToken) {
  const body = new URLSearchParams({
    refresh_token: refreshToken, client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET, grant_type: 'refresh_token',
  })
  const r = await fetch('https://oauth2.googleapis.com/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body })
  const j = await r.json()
  if (!r.ok || !j.access_token) throw new Error(j.error_description || 'Failed to refresh token')
  return j
}

export async function ytListChannels(accessToken) {
  const r = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true', { headers: { Authorization: `Bearer ${accessToken}` } })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'Failed to list channels')
  return j.items || []
}

export async function ytChannelStats(accessToken, channelId) {
  const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}`, { headers: { Authorization: `Bearer ${accessToken}` } })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'Failed to get channel stats')
  return j.items?.[0] || null
}

export async function ytAnalyticsReport(accessToken, channelId, days = 30) {
  const end = new Date(); const start = new Date(); start.setDate(start.getDate() - days)
  const fmt = d => d.toISOString().slice(0,10)
  const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports')
  url.searchParams.set('ids', `channel==${channelId}`)
  url.searchParams.set('startDate', fmt(start))
  url.searchParams.set('endDate', fmt(end))
  url.searchParams.set('metrics', 'views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares,subscribersGained,subscribersLost')
  url.searchParams.set('dimensions', 'day')
  const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'Failed to get YT analytics')
  return j
}

export async function gaListProperties(accessToken) {
  const r = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', { headers: { Authorization: `Bearer ${accessToken}` } })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'Failed to list GA properties')
  const props = []
  ;(j.accountSummaries || []).forEach(a => { (a.propertySummaries || []).forEach(p => props.push({ id: p.property?.split('/').pop(), displayName: p.displayName, parent: a.displayName })) })
  return props
}

export async function ga4RunReport(accessToken, propertyId, days = 30) {
  const end = new Date(); const start = new Date(); start.setDate(start.getDate() - days)
  const fmt = d => d.toISOString().slice(0,10)
  const body = {
    dateRanges: [{ startDate: fmt(start), endDate: fmt(end) }],
    metrics: [{ name:'activeUsers' },{ name:'newUsers' },{ name:'sessions' },{ name:'screenPageViews' },{ name:'bounceRate' },{ name:'averageSessionDuration' }],
    dimensions: [{ name:'date' }],
  }
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method:'POST', headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' }, body: JSON.stringify(body)
  })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'Failed to run GA4 report')
  return j
}
