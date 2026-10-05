// Google (YouTube Data API + Google Analytics 4) OAuth helpers
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
  'openid','email','profile',
].join(' ')

export function hasGoogleCreds() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

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
  if (!r.ok || !j.access_token) {
    const e = new Error(j.error_description || j.error || 'Failed to refresh token')
    e.code = j.error // 'invalid_grant' = refresh token dicabut / kedaluwarsa
    throw e
  }
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
  const r = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', { headers: { Authorization: `Bearer ${accessToken}` } })
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

/* ============ Data tambahan untuk dashboard ============ */
const ymd = d => d.toISOString().slice(0, 10)
function dateRange(days) {
  const end = new Date(); const start = new Date(); start.setDate(start.getDate() - Math.max(1, days) + 1)
  return { startDate: ymd(start), endDate: ymd(end) }
}

/** Video dengan views terbanyak di periode ini (YouTube Analytics + Data API untuk judul). */
export async function ytTopVideos(accessToken, channelId, days = 30, max = 10) {
  const { startDate, endDate } = dateRange(days)
  const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports')
  url.searchParams.set('ids', `channel==${channelId}`)
  url.searchParams.set('startDate', startDate)
  url.searchParams.set('endDate', endDate)
  url.searchParams.set('metrics', 'views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares')
  url.searchParams.set('dimensions', 'video')
  url.searchParams.set('sort', '-views')
  url.searchParams.set('maxResults', String(max))
  const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'Failed to get top videos')
  const cols = (j.columnHeaders || []).map(c => c.name)
  const rows = (j.rows || []).map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])))
  if (!rows.length) return []
  const vr = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${rows.map(x => x.video).join(',')}`, { headers: { Authorization: `Bearer ${accessToken}` } })
  const vj = await vr.json().catch(() => ({}))
  const meta = Object.fromEntries((vj.items || []).map(v => [v.id, v.snippet]))
  return rows.map(x => ({
    id: x.video,
    title: meta[x.video]?.title || x.video,
    publishedAt: meta[x.video]?.publishedAt || null,
    thumbnail: meta[x.video]?.thumbnails?.medium?.url || null,
    url: `https://www.youtube.com/watch?v=${x.video}`,
    views: +x.views || 0, minutes: +x.estimatedMinutesWatched || 0, avgDuration: +x.averageViewDuration || 0,
    likes: +x.likes || 0, comments: +x.comments || 0, shares: +x.shares || 0,
  }))
}

/** Laporan GA4 lengkap: tren harian, halaman teratas, sumber traffic, rujukan media sosial. */
export async function ga4Detailed(accessToken, propertyId, days = 30) {
  const range = dateRange(days)
  const body = {
    requests: [
      { dateRanges: [range], dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }], orderBys: [{ dimension: { dimensionName: 'date' } }] },
      { dateRanges: [range], dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }], metrics: [{ name: 'screenPageViews' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 8 },
      { dateRanges: [range], dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 8 },
      { dateRanges: [range], dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'sessions' }], dimensionFilter: { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Social' } } }, orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 6 },
    ],
  }
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
    method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'Failed to run GA4 reports')
  const [daily, pages, channels, social] = j.reports || []
  const num = v => +v?.value || 0
  const trend = (daily?.rows || []).map(row => {
    const d = row.dimensionValues[0].value
    return { date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, users: num(row.metricValues[0]), newUsers: num(row.metricValues[1]), sessions: num(row.metricValues[2]), pageViews: num(row.metricValues[3]), bounce: num(row.metricValues[4]), duration: num(row.metricValues[5]) }
  })
  const sum = k => trend.reduce((a, x) => a + x[k], 0)
  const sessions = sum('sessions')
  const weighted = k => sessions ? trend.reduce((a, x) => a + x[k] * x.sessions, 0) / sessions : 0
  const toShare = rows => { const total = rows.reduce((a, x) => a + num(x.metricValues[0]), 0) || 1; return rows.map(x => ({ name: x.dimensionValues[0].value || '(tidak diketahui)', value: Math.round(num(x.metricValues[0]) / total * 1000) / 10, sessions: num(x.metricValues[0]) })) }
  return {
    totals: { users: sum('users'), newUsers: sum('newUsers'), sessions, pageViews: sum('pageViews'), bounce: Math.round(weighted('bounce') * 1000) / 10, avgDuration: Math.round(weighted('duration')) },
    trend,
    topPages: (pages?.rows || []).map(x => ({ path: x.dimensionValues[0].value, title: x.dimensionValues[1].value || x.dimensionValues[0].value, views: num(x.metricValues[0]) })),
    sources: toShare(channels?.rows || []),
    socialRef: toShare(social?.rows || []),
  }
}
