-- Yol Haritası makale tamamlama takibi. Path'lerde "enrollment" kavramı
-- olmadığı için (tamamen herkese açık içerik) `enrollments.progress_percent`
-- benzeri ayrı bir toplam alanı tutmuyoruz — path yüzdesi her istekte bu
-- tablodan canlı hesaplanır. Bir satırın varlığı "tamamlandı" demektir;
-- geri almak için satır silinir (toggle mantığı).

create table path_article_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  path_article_id uuid not null references path_articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, path_article_id)
);

alter table path_article_progress enable row level security;

create policy "path_article_progress_select_own" on path_article_progress for select using (auth.uid() = user_id);
create policy "path_article_progress_insert_own" on path_article_progress for insert with check (auth.uid() = user_id);
create policy "path_article_progress_delete_own" on path_article_progress for delete using (auth.uid() = user_id);
