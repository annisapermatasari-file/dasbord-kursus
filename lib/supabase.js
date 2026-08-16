import { createClient } from '@supabase/supabase-js'

let _client = null

function url() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

function key() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || ''
}

export function hasSupabase() {
  return !!url() && !!key()
}

/**
 * Server-side Supabase client memakai service role key.
 * Jangan pernah dipakai dari komponen client — key ini melewati RLS.
 */
export function supabase() {
  if (_client) return _client
  if (!url() || !key()) {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum diset pada environment variables')
  }
  _client = createClient(url(), key(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}
