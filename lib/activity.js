// Activity/audit log helper
import { db } from '@/lib/db'

export async function activityCol() {
  const col = (await db()).collection('activity_logs')
  try {
    await col.createIndex({ ts: -1 })
    await col.createIndex({ actor: 1, ts: -1 })
    await col.createIndex({ action: 1, ts: -1 })
  } catch {}
  return col
}

/**
 * Log an activity/audit event.
 * @param {Object} opts
 * @param {string} opts.action    e.g. 'auth.login', 'user.create'
 * @param {string} opts.actor     email of the acting user, or 'system'/'anonymous'
 * @param {string} [opts.target]  optional target entity (email, resource id)
 * @param {'success'|'failure'|'info'} [opts.status]
 * @param {Object} [opts.meta]    extra JSON metadata
 * @param {string} [opts.ip]
 * @param {string} [opts.userAgent]
 */
export async function logActivity({ action, actor = 'anonymous', target = null, status = 'success', meta = null, ip = null, userAgent = null }) {
  try {
    const col = await activityCol()
    await col.insertOne({
      action,
      actor: String(actor || 'anonymous').toLowerCase(),
      target: target ? String(target).toLowerCase() : null,
      status,
      meta: meta || null,
      ip,
      userAgent,
      ts: new Date(),
    })
  } catch (e) {
    console.warn('logActivity failed:', e?.message)
  }
}

// Extract IP + UA from a Next.js Request-like object
export function reqContext(request) {
  try {
    const h = request?.headers
    return {
      ip: (h?.get?.('x-forwarded-for') || '').split(',')[0].trim() || h?.get?.('x-real-ip') || null,
      userAgent: h?.get?.('user-agent') || null,
    }
  } catch { return { ip: null, userAgent: null } }
}

/**
 * Query recent activity logs.
 * @param {Object} q
 * @param {number} [q.limit=100]
 * @param {string} [q.actor]
 * @param {string} [q.action]
 * @param {string} [q.status]
 * @param {Date}   [q.since]
 */
export async function listActivity(q = {}) {
  const col = await activityCol()
  const filter = {}
  if (q.actor) filter.actor = String(q.actor).toLowerCase()
  if (q.action) filter.action = q.action
  if (q.status) filter.status = q.status
  if (q.since) filter.ts = { $gte: q.since }
  const limit = Math.min(+(q.limit || 100), 500)
  const docs = await col.find(filter).sort({ ts: -1 }).limit(limit).toArray()
  return docs.map(d => ({
    id: String(d._id),
    action: d.action,
    actor: d.actor,
    target: d.target,
    status: d.status,
    meta: d.meta,
    ip: d.ip,
    ts: d.ts,
  }))
}

export async function activitySummary() {
  const col = await activityCol()
  const now = new Date()
  const since24h = new Date(now.getTime() - 24 * 3600 * 1000)
  const since7d = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
  const [total24h, total7d, loginFails24h, byAction] = await Promise.all([
    col.countDocuments({ ts: { $gte: since24h } }),
    col.countDocuments({ ts: { $gte: since7d } }),
    col.countDocuments({ action: 'auth.login', status: 'failure', ts: { $gte: since24h } }),
    col.aggregate([
      { $match: { ts: { $gte: since7d } } },
      { $group: { _id: '$action', c: { $sum: 1 } } },
      { $sort: { c: -1 } }, { $limit: 8 },
    ]).toArray(),
  ])
  return { total24h, total7d, loginFails24h, byAction: byAction.map(x => ({ action: x._id, count: x.c })) }
}
