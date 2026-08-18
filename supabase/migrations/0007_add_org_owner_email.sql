-- Menambahkan org_owner_email supaya user & koneksi media sosial bisa
-- diisolasi per workspace/tenant (satu Admin yang self-register + tim yang
-- ia undang). Sebelumnya SettingsView (Users & Roles, Akun Media Sosial,
-- API Connections) tidak difilter sama sekali, jadi Admin client A bisa
-- melihat dan mengubah data milik client B.

alter table public.users
  add column if not exists org_owner_email text;

-- Backfill: akun yang sudah ada dianggap pemilik workspace-nya sendiri.
-- Grouping tim yang sudah dibuat sebelumnya tidak bisa direkonstruksi
-- otomatis karena belum ada data pemilik/pembuat yang tersimpan.
update public.users
set org_owner_email = email
where org_owner_email is null;
