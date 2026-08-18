import { createClient } from '@supabase/supabase-js'

let _client = null

function url() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
}

function key() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '').trim()
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

  const supabaseUrl = url()
  const supabaseKey = key()

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum diset pada environment variables')
  }

  let parsed
  try {
    parsed = new URL(supabaseUrl)
  } catch {
    throw new Error(
      `SUPABASE_URL tidak valid: "${supabaseUrl}". Harus berupa URL project Supabase, contoh: https://xxxxxxxx.supabase.co (bukan URL dashboard, tanpa spasi/baris baru di akhir).`
    )
  }
  if (!/\.supabase\.co$/i.test(parsed.hostname) || parsed.pathname !== '/') {
    throw new Error(
      `SUPABASE_URL tampak salah: "${supabaseUrl}". Harus persis URL Project (Settings > API > Project URL), contoh: https://xxxxxxxx.supabase.co — bukan link dashboard.`
    )
  }

  _client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}
