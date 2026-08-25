-- Blog yazılarına yorum ve beğeni desteği.

create table blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references blog_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table blog_comments enable row level security;

create policy "blog_comments_public_read" on blog_comments for select using (true);
create policy "blog_comments_insert_own" on blog_comments for insert with check (auth.uid() = user_id);
create policy "blog_comments_delete_own" on blog_comments for delete using (auth.uid() = user_id);

create table blog_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references blog_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table blog_likes enable row level security;

create policy "blog_likes_public_read" on blog_likes for select using (true);
create policy "blog_likes_insert_own" on blog_likes for insert with check (auth.uid() = user_id);
create policy "blog_likes_delete_own" on blog_likes for delete using (auth.uid() = user_id);
