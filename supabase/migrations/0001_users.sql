-- Tabel users untuk dashboard kursus.
-- Menggantikan koleksi MongoDB `users`.

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  business_name text        not null default '',
  email         text        not null unique,
  password      text        not null default '',
  role          text        not null default 'Viewer',
  jabatan       text        not null default '',
  initial       text        not null default '??',
  active        boolean     not null default true,
  seeded        boolean     not null default false,
  reset_code    text,
  reset_expires timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint users_role_check check (role in ('Admin', 'Analyst', 'Executive', 'Viewer'))
);

-- Email selalu disimpan lowercase oleh aplikasi; index ini mempercepat lookup login.
create index if not exists users_email_idx on public.users (email);
create index if not exists users_role_active_idx on public.users (role, active);
create index if not exists users_created_at_idx on public.users (created_at);

-- Semua akses berjalan lewat service role key di API route, jadi RLS dinyalakan
-- tanpa policy publik: client anon tidak bisa membaca tabel ini sama sekali.
alter table public.users enable row level security;
