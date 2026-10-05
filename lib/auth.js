// Autentikasi server-side: hash kata sandi + sesi bertanda tangan.
//
// Sebelumnya server mempercayai header `x-actor-email` dari browser, sehingga
// siapa pun bisa mengaku sebagai user lain hanya dengan mengganti header itu.
// Sekarang identitas berasal dari cookie HttpOnly `sp_session` yang
// ditandatangani HMAC di server dan tidak bisa dibaca/diubah JavaScript.

import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(scryptCb)

export const SESSION_COOKIE = 'sp_session'
const SESSION_TTL_SEC = 7 * 24 * 60 * 60 // 7 hari

function rootSecret() {
  const s = process.env.SESSION_SECRET || process.env.OAUTH_STATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error('SESSION_SECRET belum diset di environment server')
  return s
}

/** Kunci turunan per keperluan, supaya token sesi tidak bisa dipakai sebagai state OAuth (dan sebaliknya). */
export function hmac(purpose, data) {
  return createHmac('sha256', `${purpose}:${rootSecret()}`).update(data).digest('base64url')
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? '')); const y = Buffer.from(String(b ?? ''))
  return x.length === y.length && timingSafeEqual(x, y)
}

/* ============ Kata sandi (scrypt) ============ */
const N = 16384, R = 8, P = 1, KEYLEN = 64

export async function hashPassword(plain) {
  const salt = randomBytes(16)
  const key = await scrypt(String(plain), salt, KEYLEN, { N, r: R, p: P })
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64url')}$${Buffer.from(key).toString('base64url')}`
}

export function isHashed(stored) {
  return typeof stored === 'string' && stored.startsWith('scrypt$')
}

/**
 * @returns {Promise<{ ok: boolean, needsRehash: boolean }>}
 * needsRehash = true bila kata sandi lama masih tersimpan polos; pemanggil
 * sebaiknya langsung menyimpan versi hash-nya (migrasi otomatis saat login).
 */
export async function verifyPassword(plain, stored) {
  if (!stored) return { ok: false, needsRehash: false }
  if (!isHashed(stored)) return { ok: safeEqual(plain, stored), needsRehash: true }
  const [, n, r, p, saltB64, keyB64] = stored.split('$')
  const expected = Buffer.from(keyB64, 'base64url')
  const key = await scrypt(String(plain), Buffer.from(saltB64, 'base64url'), expected.length, { N: +n, r: +r, p: +p })
  return { ok: timingSafeEqual(Buffer.from(key), expected), needsRehash: false }
}

/* ============ Sesi ============ */
// `pv` = sidik jari hash kata sandi; sesi lama otomatis tidak berlaku setelah ganti kata sandi.
function passwordFingerprint(storedPassword) {
  return hmac('pv', String(storedPassword || '')).slice(0, 12)
}

export function createSessionToken(user) {
  const payload = Buffer.from(JSON.stringify({
    e: user.email,
    pv: passwordFingerprint(user.password),
    x: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
  })).toString('base64url')
  return `${payload}.${hmac('session', payload)}`
}

/** Validasi token; kembalikan email bila tanda tangan & masa berlaku cocok. */
export function readSessionToken(token) {
  const [payload, sig] = String(token || '').split('.')
  if (!payload || !sig || !safeEqual(sig, hmac('session', payload))) return null
  try {
    const d = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!d?.e || !d.x || d.x < Math.floor(Date.now() / 1000)) return null
    return { email: String(d.e).toLowerCase(), pv: d.pv }
  } catch { return null }
}

export function sessionMatchesUser(session, user) {
  return !!session && !!user && safeEqual(session.pv, passwordFingerprint(user.password))
}

export function getCookie(request, name) {
  const raw = request.headers.get('cookie') || ''
  for (const part of raw.split(';')) {
    const i = part.indexOf('=')
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim())
  }
  return null
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  }
}
