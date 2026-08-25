-- Udemy'ye ek olarak kurslar başka harici platformlarda (Coursera, Patreon,
-- kendi YouTube kanalı vb.) da tanıtılabilsin diye yeni bir 'external'
-- provider değeri ekleniyor. 'udemy' değeri KORUNUYOR (BilimData'nın kendi
-- Udemy kursları ile eğitmenlerin kendi Udemy kurslarını ayırt etmek hâlâ
-- gerekiyor); yalnızca "diğer platform" durumu için serbest metin
-- `platform_name` alanı ekleniyor.

alter table courses add column if not exists platform_name text;

alter table courses drop constraint if exists courses_provider_check;
alter table courses add constraint courses_provider_check check (provider in ('internal', 'udemy', 'external'));
