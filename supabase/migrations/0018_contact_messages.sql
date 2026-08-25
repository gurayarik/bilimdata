-- İletişim formu üzerinden gönderilen soru/şikayet mesajları. Herkes (üye
-- olsun olmasın) gönderebilir; admin panelinden görüntülenip yanıtlanır.

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new', -- 'new' | 'answered'
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz default now()
);

alter table contact_messages enable row level security;

-- Herkes (misafir dahil) bir mesaj gönderebilir.
create policy "contact_messages_insert_anyone" on contact_messages for insert to anon, authenticated with check (true);

-- Kullanıcı yalnızca kendi gönderdiği mesajları görebilir; admin panel listesi
-- ve yanıtlama işlemleri backend'de service role ile yapılır.
create policy "contact_messages_select_own" on contact_messages for select using (auth.uid() = user_id);
