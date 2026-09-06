-- Yol Haritaları modülü: video yerine metinsel/AI üretimli içerikten oluşan
-- sıralı öğrenme yolları. Kurs/bölüm/ders yapısıyla aynı iki seviyeli
-- (path -> article) mantığı kullanır, ama tamamen herkese açıktır (kayıt/
-- enrollment gerekmez) — SEO değeri için sitemap'e de dahil edilir.

create table learning_paths (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  category_id uuid references categories(id),
  is_published boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz default now()
);

create table path_articles (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references learning_paths(id) on delete cascade,
  title text not null,
  slug text not null,
  content text not null,
  order_index int not null,
  ai_generated boolean not null default false,
  created_at timestamptz default now(),
  unique (path_id, slug)
);

alter table learning_paths enable row level security;
alter table path_articles enable row level security;

-- Yazma işlemleri yalnızca backend'de service role ile (admin.py) yapılır;
-- burada courses/blog_posts ile aynı şekilde yalnızca public select policy'si var.
create policy "learning_paths_public_read" on learning_paths for select using (is_published = true);

create policy "path_articles_public_read" on path_articles for select using (
  path_id in (select id from learning_paths where is_published = true)
);
