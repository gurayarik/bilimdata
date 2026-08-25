-- Ders PDF/slayt materyalleri için Supabase Storage bucket'ı.
-- Yükleme her zaman backend service-role client'ı üzerinden yapılır.

insert into storage.buckets (id, name, public)
values ('lesson-resources', 'lesson-resources', true)
on conflict (id) do nothing;
