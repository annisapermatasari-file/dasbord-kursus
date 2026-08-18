-- Simpan paket (starter/business/agency) yang dipilih saat registrasi,
-- dipakai untuk membatasi menu dashboard sesuai paket berlangganan.

alter table public.users
  add column if not exists plan text not null default 'starter';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_plan_check') then
    alter table public.users
      add constraint users_plan_check check (plan in ('starter', 'business', 'agency'));
  end if;
end $$;

-- Akun preset (seed) & yang sudah lebih dulu ada dianggap akses penuh.
update public.users set plan = 'agency' where seeded = true;
