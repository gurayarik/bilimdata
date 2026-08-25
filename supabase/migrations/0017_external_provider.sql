-- Kurslar yalnızca Udemy değil, herhangi bir harici platformda (Coursera,
-- Patreon, kendi YouTube kanalı vb.) tanıtılabilsin diye 'udemy' provider
-- değeri genel 'external' ile değiştiriliyor; platform adı artık serbest
-- metin olarak `platform_name` alanında tutuluyor.

alter table courses add column if not exists platform_name text;

update courses set platform_name = 'Udemy' where provider = 'udemy' and platform_name is null;
update courses set provider = 'external' where provider = 'udemy';

alter table courses drop constraint if exists courses_provider_check;
alter table courses add constraint courses_provider_check check (provider in ('internal', 'external'));
