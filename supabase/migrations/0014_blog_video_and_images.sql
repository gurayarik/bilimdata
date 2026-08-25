-- Blog yazılarına video linki desteği + kapak görseli yükleme için Storage bucket'ı.

alter table blog_posts add column if not exists video_url text;

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;
