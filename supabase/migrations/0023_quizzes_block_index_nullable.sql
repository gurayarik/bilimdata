-- 0020'de course_id nullable yapılmıştı ama block_index (yalnızca kurs
-- bloklarında anlamlı bir alan) NOT NULL kalmıştı — path makalesi sınavları
-- oluşturulurken bu kısıt ihlal ediliyordu. block_index de nullable yapılır.

alter table quizzes alter column block_index drop not null;
