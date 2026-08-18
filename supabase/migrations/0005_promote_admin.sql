-- Sekali pakai: naikkan akun ini jadi Admin, karena instance Supabase baru
-- ini belum sempat ter-seed 4 akun preset (self-registration publik jadi
-- baris pertama di tabel, sehingga ensureSeeded() melihat tabel tidak
-- kosong dan tidak pernah menjalankan seed).

update public.users
set role = 'Admin', updated_at = now()
where email = 'ririprmtsan@gmail.com';
