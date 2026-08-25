-- Her 20 derslik blok için yapay zeka ile üretilen, 10 soruluk çoktan
-- seçmeli sınavlar (Faz 8 sonrası ek: ilerleme koçu + sınav modülü).

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  block_index int not null,
  title text not null,
  created_at timestamptz not null default now(),
  unique (course_id, block_index)
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index int not null,
  order_index int not null
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  score int not null,
  total int not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;

-- Sınav ve sorular herkese görünür olabilir (soru içeriği gizli değil,
-- erişim/kilit kontrolü zaten FastAPI tarafında yapılıyor).
create policy "quizzes_public_read" on quizzes for select using (true);
create policy "quiz_questions_public_read" on quiz_questions for select using (true);

-- Denemeler yalnızca kendi kaydını görebilir/oluşturabilir.
create policy "quiz_attempts_select_own" on quiz_attempts for select using (auth.uid() = user_id);
create policy "quiz_attempts_insert_own" on quiz_attempts for insert with check (auth.uid() = user_id);
