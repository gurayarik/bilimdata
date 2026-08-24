-- Udemy üzerinden kupon karşılığı satılan kurslar için destek.
-- Bu kurslarda müfredat (course_sections/lessons) tutulmaz; sadece kurs kartı +
-- Udemy'ye yönlendirme yapılır.

alter table courses add column if not exists provider text not null default 'internal'
  check (provider in ('internal', 'udemy'));
alter table courses add column if not exists external_url text;
alter table courses add column if not exists coupon_code text;
