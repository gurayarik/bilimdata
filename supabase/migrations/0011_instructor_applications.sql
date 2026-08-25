-- Eğitmen olmak isteyen kullanıcıların başvuru/onay akışı.

create table instructor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  bio text,
  kvkk_consent_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table instructor_applications enable row level security;

create policy "instructor_applications_select_own" on instructor_applications
  for select using (auth.uid() = user_id);

create policy "instructor_applications_insert_own" on instructor_applications
  for insert with check (auth.uid() = user_id);
