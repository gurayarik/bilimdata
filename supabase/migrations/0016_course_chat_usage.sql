-- Kurs sohbet asistanı için günlük kullanım sayacı (kullanıcı başına
-- günde en fazla 40 mesaj — kötüye kullanımı önlemek için).

create table ai_chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  usage_date date not null default current_date,
  message_count int not null default 0,
  unique (user_id, usage_date)
);

alter table ai_chat_usage enable row level security;

-- Yalnızca kendi kullanım kaydını görebilir; yazma yalnızca backend
-- (service role) tarafından yapılır, bu yüzden insert/update policy'si yok.
create policy "ai_chat_usage_select_own" on ai_chat_usage for select using (auth.uid() = user_id);
