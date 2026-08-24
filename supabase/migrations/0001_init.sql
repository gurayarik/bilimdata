-- BilimData — İlk şema + RLS (Faz 0)
-- CLAUDE.md Bölüm 4'teki tasarımı yansıtır.

-- ============================================================
-- Tablolar
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'instructor', 'admin')),
  created_at timestamptz not null default now()
);

create table instructors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  title text,
  bio text,
  avatar_url text
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  description text
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  description text,
  cover_image_url text,
  category_id uuid references categories(id) on delete set null,
  instructor_id uuid references instructors(id) on delete set null,
  price numeric(10, 2) not null default 0,
  discount_price numeric(10, 2),
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  language text not null default 'tr',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  order_index int not null
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references course_sections(id) on delete cascade,
  title text not null,
  youtube_video_id text not null,
  duration_seconds int,
  order_index int not null,
  is_preview boolean not null default false,
  resources jsonb
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'free', 'coupon')),
  progress_percent int not null default 0,
  unique (user_id, course_id)
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed boolean not null default false,
  last_watched_second int not null default 0,
  unique (user_id, lesson_id)
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent int,
  course_id uuid references courses(id) on delete cascade,
  valid_until timestamptz,
  max_uses int,
  used_count int not null default 0
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  cover_image_url text,
  content text not null,
  excerpt text,
  ai_summary text,
  author_id uuid references profiles(id) on delete set null,
  category text,
  tags text[],
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  issued_at timestamptz not null default now(),
  pdf_url text,
  unique (user_id, course_id)
);

-- ============================================================
-- Yeni kullanıcı kaydında otomatik profil oluşturma
-- ============================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Yardımcı fonksiyon: kullanıcı bir kursa aktif kayıtlı mı?
-- ============================================================

create function public.is_enrolled(p_user_id uuid, p_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from enrollments
    where user_id = p_user_id
      and course_id = p_course_id
      and payment_status in ('paid', 'free', 'coupon')
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table instructors enable row level security;
alter table categories enable row level security;
alter table courses enable row level security;
alter table course_sections enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table coupons enable row level security;
alter table reviews enable row level security;
alter table blog_posts enable row level security;
alter table certificates enable row level security;

-- profiles: kullanıcı yalnızca kendi profilini görebilir/güncelleyebilir
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- instructors, categories: herkese açık okuma
create policy "instructors_public_read" on instructors for select using (true);
create policy "categories_public_read" on categories for select using (true);

-- courses: yayınlananlar herkese açık
create policy "courses_public_read" on courses for select using (is_published = true);

-- course_sections: bağlı kurs yayınlandıysa herkese açık
create policy "course_sections_public_read" on course_sections for select using (
  exists (select 1 from courses where courses.id = course_sections.course_id and courses.is_published = true)
);

-- lessons: önizleme herkese açık; diğerleri yalnızca kayıtlı kullanıcıya
create policy "lessons_preview_read" on lessons for select using (is_preview = true);
create policy "lessons_enrolled_read" on lessons for select using (
  is_preview = false
  and auth.uid() is not null
  and public.is_enrolled(
    auth.uid(),
    (select course_id from course_sections where course_sections.id = lessons.section_id)
  )
);

-- enrollments: kullanıcı yalnızca kendi kaydını görür/oluşturur
create policy "enrollments_select_own" on enrollments for select using (auth.uid() = user_id);
create policy "enrollments_insert_own" on enrollments for insert with check (auth.uid() = user_id);

-- lesson_progress: kullanıcı yalnızca kendi ilerlemesini görür/yazar
create policy "lesson_progress_select_own" on lesson_progress for select using (auth.uid() = user_id);
create policy "lesson_progress_upsert_own" on lesson_progress for insert with check (auth.uid() = user_id);
create policy "lesson_progress_update_own" on lesson_progress for update using (auth.uid() = user_id);

-- coupons: giriş yapmış kullanıcılar kupon kodunu doğrulayabilir
create policy "coupons_authenticated_read" on coupons for select using (auth.uid() is not null);

-- reviews: herkese açık okuma; kullanıcı yalnızca kendi yorumunu yazar/günceller
create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_insert_own" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on reviews for update using (auth.uid() = user_id);

-- blog_posts: yayınlananlar herkese açık
create policy "blog_posts_public_read" on blog_posts for select using (is_published = true);

-- certificates: kullanıcı yalnızca kendi sertifikalarını görür (yazma yalnızca service role ile)
create policy "certificates_select_own" on certificates for select using (auth.uid() = user_id);

-- Not: courses/lessons/blog_posts üzerindeki insert/update/delete (admin & instructor)
-- ve enrollments üzerindeki admin onay akışı backend'de Supabase service-role client'ı
-- ile (RLS bypass) yürütülür — bkz. backend/app/core/supabase_client.py.
