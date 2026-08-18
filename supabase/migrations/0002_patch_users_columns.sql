-- Patch: lengkapi kolom tabel public.users yang belum ada.
-- Aman dijalankan berkali-kali — kolom yang sudah ada otomatis dilewati,
-- tidak menghapus atau mengubah data yang sudah ada.

alter table public.users
  add column if not exists business_name text not null default '',
  add column if not exists password text not null default '',
  add column if not exists role text not null default 'Viewer',
  add column if not exists jabatan text not null default '',
  add column if not exists initial text not null default '??',
  add column if not exists active boolean not null default true,
  add column if not exists seeded boolean not null default false,
  add column if not exists reset_code text,
  add column if not exists reset_expires timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Pastikan role hanya berisi nilai yang valid (dibutuhkan oleh aplikasi).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_role_check'
  ) then
    alter table public.users
      add constraint users_role_check check (role in ('Admin', 'Analyst', 'Executive', 'Viewer'));
  end if;
end $$;

-- Pastikan email unik (dibutuhkan oleh upsert saat registrasi/`ON CONFLICT (email)`).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conrelid = 'public.users'::regclass and contype = 'u'
  ) then
    alter table public.users add constraint users_email_key unique (email);
  end if;
end $$;

create index if not exists users_email_idx on public.users (email);
create index if not exists users_role_active_idx on public.users (role, active);
create index if not exists users_created_at_idx on public.users (created_at);

alter table public.users enable row level security;
