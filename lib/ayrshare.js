// Ayrshare integration helper
// Docs: https://www.ayrshare.com/docs/apis
// User Profile flow: 1 API key handles multiple Ayrshare Profiles (one per app-user or one org-wide)
// Store profileKey server-side, never expose in client bundles.

import { connections, db } from '@/lib/db'

const AYR = 'https://api.ayrshare.com/api'

export function hasAyrshareCreds() {
  return !!(process.env.AYRSHARE_API_KEY && process.env.AYRSHARE_PRIVATE_KEY && process.env.AYRSHARE_DOMAIN)
}

function apiKey() {
  return process.env.AYRSHARE_API_KEY
}
export function ayrDomain() {
  return process.env.AYRSHARE_DOMAIN
}
export function ayrPrivateKey() {
  // Support both real newlines and escaped \n from .env
  return (process.env.AYRSHARE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
}

async function ayrFetch(path, { method = 'GET', body, profileKey } = {}) {
  const headers = {
    'Authorization': `Bearer ${apiKey()}`,
    'Content-Type': 'application/json',
  }
  if (profileKey) headers['Profile-Key'] = profileKey
  const res = await fetch(`${AYR}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  })
  const text = await res.text()
  let json = {}
  try { json = text ? JSON.parse(text) : {} } catch { json = { raw: text } }
  return { ok: res.ok, status: res.status, data: json }
}

/* ================= Profile management ================= */
// Creates a new Ayrshare User Profile (one per app-user OR one shared for the org)
export async function createProfile(title) {
  return ayrFetch('/profiles/profile', { method: 'POST', body: { title } })
}

// List existing profiles from Ayrshare
export async function listProfiles() {
  return ayrFetch('/profiles', { method: 'GET' })
}

// Delete a profile
export async function deleteProfile(profileKey) {
  return ayrFetch('/profiles/profile', { method: 'DELETE', body: { profileKey } })
}

// Generate a JWT + short-lived URL so the user can link their socials
// Ayrshare expects `privateKey` + `domain` + `profileKey` in the body
export async function generateJWT({ profileKey, redirect, allowedSocial, logout = false, verify = false }) {
  const body = {
    domain: ayrDomain(),
    privateKey: ayrPrivateKey(),
    profileKey,
  }
  if (redirect) body.redirect = redirect
  if (allowedSocial && Array.isArray(allowedSocial) && allowedSocial.length) body.allowedSocial = allowedSocial
  if (logout) body.logout = true
  if (verify) body.verify = true
  return ayrFetch('/profiles/generateJWT', { method: 'POST', body })
}

// Get user (linked socials info) for a given profile
export async function getUser(profileKey) {
  return ayrFetch('/user', { method: 'GET', profileKey })
}

/* ================= Analytics ================= */
export async function socialAnalytics(profileKey, platforms, opts = {}) {
  const body = {
    platforms: platforms && platforms.length ? platforms : ['facebook','instagram','youtube','tiktok'],
    ...opts,
  }
  return ayrFetch('/analytics/social', { method: 'POST', profileKey, body })
}

/* ================= Posting ================= */
export async function createPost(profileKey, payload) {
  return ayrFetch('/post', { method: 'POST', profileKey, body: payload })
}

/* ================= Local Mongo helpers ================= */
// We store ONE org-wide Ayrshare profile because this is a government dashboard
// (single "Direktorat" tenant). Key = 'default'.
export async function ayrProfileCol() {
  return (await db()).collection('ayrshare_profiles')
}

export async function getStoredProfile(key = 'default') {
  const col = await ayrProfileCol()
  return col.findOne({ key })
}

export async function upsertStoredProfile(key = 'default', data) {
  const col = await ayrProfileCol()
  await col.updateOne(
    { key },
    { $set: { ...data, key, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  )
  return col.findOne({ key })
}

export async function deleteStoredProfile(key = 'default') {
  const col = await ayrProfileCol()
  await col.deleteOne({ key })
}
