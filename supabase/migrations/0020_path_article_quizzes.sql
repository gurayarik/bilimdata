-- Yol haritası makalelerinin sonunda da kurs bloklarındaki gibi AI üretimli
-- sınavlar olsun diye mevcut `quizzes` tablosunu path_articles'a da bağlanabilir
-- hale getiriyoruz (kurs sınavlarıyla aynı `quiz_questions`/`quiz_attempts`
-- tablolarını paylaşır, ayrı bir tablo seti gerekmiyor).

alter table quizzes alter column course_id drop not null;
alter table quizzes add column path_article_id uuid references path_articles(id) on delete cascade;

alter table quizzes add constraint quizzes_target_check check (
  (course_id is not null and path_article_id is null) or
  (course_id is null and path_article_id is not null)
);

create unique index quizzes_path_article_unique on quizzes (path_article_id) where path_article_id is not null;
