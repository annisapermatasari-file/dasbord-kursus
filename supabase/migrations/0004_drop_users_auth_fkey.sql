-- Patch: lepas foreign key public.users.id -> auth.users(id).
-- Aplikasi ini mengelola user & password-nya sendiri di tabel public.users
-- (belum terintegrasi dengan Supabase Auth), jadi id tidak perlu mengacu
-- ke baris auth.users yang mungkin tidak pernah dibuat.

alter table public.users drop constraint if exists users_id_auth_user_fkey;
