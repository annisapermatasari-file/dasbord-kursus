// OAuth `state` bertanda tangan (HMAC-SHA256) + kedaluwarsa.
//
// Sebelumnya state hanya base64 JSON berisi email workspace yang dikirim
// lewat query `?owner=` — siapa pun bisa memalsukannya dan menautkan akun
// medsos ke workspace orang lain. Sekarang state dibuat di server setelah
// workspace diverifikasi, ditandatangani, dan hanya berlaku 10 menit.

import { createHmac, randomUUID, timingSafeEqual } from 'crypto'

const TTL_MS = 10 * 60 * 1000

function secret() {
  const s = process.env.OAUTH_STATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error('OAUTH_STATE_SECRET belum diset di environment server')
  return s
}

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function createOauthState(owner, provider) {
  const payload = Buffer.from(JSON.stringify({
    o: owner, p: provider, n: randomUUID(), e: Date.now() + TTL_MS,
  })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** @returns {{ owner: string } | { error: string }} */
export function verifyOauthState(state, provider) {
  const [payload, sig] = String(state || '').split('.')
  if (!payload || !sig) return { error: 'State OAuth tidak valid' }
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { error: 'Tanda tangan state OAuth tidak cocok' }
  let data
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) } catch { return { error: 'State OAuth rusak' } }
  if (!data?.o) return { error: 'State OAuth tanpa workspace' }
  if (data.p !== provider) return { error: 'State OAuth untuk provider lain' }
  if (!data.e || Date.now() > data.e) return { error: 'Sesi otorisasi kedaluwarsa (lebih dari 10 menit). Silakan ulangi dari Settings.' }
  return { owner: data.o }
}
