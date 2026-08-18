// Repositori user di Supabase (menggantikan koleksi MongoDB `users`).
// Semua query tabel `users` dikumpulkan di sini supaya handler API tidak
// perlu tahu bentuk kolomnya.
import { supabase } from '@/lib/supabase'

const TABLE = 'users'

// Kolom aman untuk dikirim ke client — tanpa password & kredensial reset.
const PUBLIC_COLUMNS = 'name, business_name, email, role, plan, jabatan, initial, active, seeded, created_at'
const ALL_COLUMNS = `${PUBLIC_COLUMNS}, password, reset_code, reset_expires, updated_at`

/** Ubah baris Supabase menjadi bentuk dokumen yang dipakai handler. */
function toDoc(row) {
  if (!row) return null
  return {
    name: row.name,
    businessName: row.business_name || '',
    email: row.email,
    password: row.password,
    role: row.role,
    plan: row.plan || 'starter',
    jabatan: row.jabatan || '',
    initial: row.initial,
    active: row.active !== false,
    seeded: !!row.seeded,
    reset_code: row.reset_code ?? null,
    reset_expires: row.reset_expires ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function fail(context, error) {
  throw new Error(`${context}: ${error.message || error}`)
}

export async function findUserByEmail(email) {
  const { data, error } = await supabase()
    .from(TABLE)
    .select(ALL_COLUMNS)
    .eq('email', email)
    .maybeSingle()
  if (error) fail('Gagal membaca user', error)
  return toDoc(data)
}

export async function listUsers() {
  const { data, error } = await supabase()
    .from(TABLE)
    .select(PUBLIC_COLUMNS)
    .order('created_at', { ascending: true })
  if (error) fail('Gagal memuat daftar user', error)
  return (data || []).map(toDoc)
}

export async function countUsers() {
  const { count, error } = await supabase()
    .from(TABLE)
    .select('email', { count: 'exact', head: true })
  if (error) fail('Gagal menghitung user', error)
  return count || 0
}

/** Jumlah Admin aktif selain `email` — dipakai untuk menjaga Admin terakhir. */
export async function countOtherActiveAdmins(email) {
  const { count, error } = await supabase()
    .from(TABLE)
    .select('email', { count: 'exact', head: true })
    .eq('role', 'Admin')
    .eq('active', true)
    .neq('email', email)
  if (error) fail('Gagal menghitung admin aktif', error)
  return count || 0
}

/**
 * Insert user awal, melewati email yang sudah ada.
 * `rows` memakai bentuk dokumen aplikasi (businessName, dst).
 */
export async function seedUsers(rows) {
  const payload = rows.map(u => ({
    name: u.name,
    business_name: u.businessName || '',
    email: u.email,
    password: u.password,
    role: u.role,
    jabatan: u.jabatan || '',
    initial: u.initial,
    active: true,
    seeded: true,
  }))
  const { error } = await supabase()
    .from(TABLE)
    .upsert(payload, { onConflict: 'email', ignoreDuplicates: true })
  if (error) fail('Gagal seed user', error)
}

/**
 * Buat user baru atau perbarui yang sudah ada, dicocokkan lewat email.
 * `created_at` sengaja tidak dikirim supaya nilai aslinya tidak tertimpa saat update.
 */
export async function upsertUser({ name, businessName, email, password, role, plan, jabatan, initial, active }) {
  const { data, error } = await supabase()
    .from(TABLE)
    .upsert(
      {
        name,
        business_name: businessName || '',
        email,
        password,
        role,
        plan: plan || 'starter',
        jabatan: jabatan || '',
        initial,
        active,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select(PUBLIC_COLUMNS)
    .single()
  if (error) fail('Gagal menyimpan user', error)
  return toDoc(data)
}

/** Ubah status aktif. Mengembalikan null bila email tidak ditemukan. */
export async function setUserActive(email, active) {
  const { data, error } = await supabase()
    .from(TABLE)
    .update({ active, updated_at: new Date().toISOString() })
    .eq('email', email)
    .select(PUBLIC_COLUMNS)
    .maybeSingle()
  if (error) fail('Gagal mengubah status user', error)
  return toDoc(data)
}

export async function deleteUserByEmail(email) {
  const { error } = await supabase().from(TABLE).delete().eq('email', email)
  if (error) fail('Gagal menghapus user', error)
}

export async function setResetCode(email, code, expires) {
  const { error } = await supabase()
    .from(TABLE)
    .update({
      reset_code: code,
      reset_expires: expires instanceof Date ? expires.toISOString() : expires,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)
  if (error) fail('Gagal menyimpan kode reset', error)
}

/** Set password baru sekaligus menghapus kode reset yang sudah terpakai. */
export async function updatePassword(email, password) {
  const { error } = await supabase()
    .from(TABLE)
    .update({
      password,
      reset_code: null,
      reset_expires: null,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)
  if (error) fail('Gagal memperbarui kata sandi', error)
}

export async function listActiveAdminEmails() {
  const { data, error } = await supabase()
    .from(TABLE)
    .select('email')
    .eq('role', 'Admin')
    .eq('active', true)
  if (error) fail('Gagal memuat admin aktif', error)
  return (data || []).map(r => r.email).filter(Boolean)
}
