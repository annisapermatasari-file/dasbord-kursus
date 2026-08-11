import { MongoClient } from 'mongodb'

let _promise = null
function client() {
  if (_promise) return _promise
  const uri = process.env.MONGO_URL
  if (!uri) throw new Error('MONGO_URL not set')
  const c = new MongoClient(uri, { maxPoolSize: 10 })
  _promise = c.connect()
  return _promise
}

export async function db() {
  const c = await client()
  return c.db(process.env.DB_NAME_APP || 'dashboard_medsos_direktorat')
}

export async function connections() {
  return (await db()).collection('oauth_connections')
}

export async function users() {
  const col = (await db()).collection('users')
  try { await col.createIndex({ email: 1 }, { unique: true }) } catch {}
  return col
}
