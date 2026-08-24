-- Ders bazlı AI özetleri için `lessons` tablosuna açıklama kolonu eklenir.
alter table lessons add column if not exists description text;
