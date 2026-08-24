-- 0001_init.sql içindeki on_auth_user_created trigger'ı bazı Supabase
-- projelerinde auth.users üzerinde trigger oluşturma yetkisi kısıtlı
-- olduğu için sessizce oluşmamış olabilir. Bu migration idempotent'tir
-- (güvenle tekrar çalıştırılabilir) ve trigger'ı garanti eder.

drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
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
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
