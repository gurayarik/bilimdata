-- Faz 3 — Gerçek YouTube içeriğiyle kurslar (bilimdata kanalı).
-- Faz 2'nin placeholder kurslarının yerini alır.

insert into instructors (id, title, bio, avatar_url)
select gen_random_uuid(), 'Kurucu Eğitmen', 'Merhaba, bilimdata kanalına hoş geldiniz. Bu kanalda yazılım dünyası, yapay zeka ve veri bilimi üzerine hazırlanan eğitici içeriklerle bilgi birikiminizi geliştirmenize katkı sağlamayı hedefliyorum.', 'https://yt3.ggpht.com/iJgnr4vyxZHi11XFbq_zxMG4bUMUq4hsN2JCaPFLIR4prXeeYG5QfPHXBnpbbHw6PjW-kYRRbWc=s240-c-k-c0x00ffffff-no-rj'
where not exists (select 1 from instructors where title = 'Kurucu Eğitmen');

delete from courses where slug in ('sifirdan-python-programlama', 'veri-bilimi-ile-kariyer', 'makine-ogrenmesi-temelleri', 'derin-ogrenme-ile-goruntu-isleme');

-- Veri Bilimi ve Makine Öğrenmesi (65 ders)
insert into courses (title, slug, short_description, description, cover_image_url,
  category_id, instructor_id, price, discount_price, level, language, is_published)
select 'Veri Bilimi ve Makine Öğrenmesi', 'veri-bilimi-ve-makine-ogrenmesi',
  'Python NumPy ve Pandas ile veri analizi, temizleme, gruplama ve pivot tablo tekniklerini uygulamalı örneklerle öğrenin.', 'Veri Bilimi ve Makine Öğrenmesi kursu, Python programlama dilinde veri analizinin iki temel kütüphanesi olan NumPy ve Pandas''ı sıfırdan ileri seviyeye kadar kapsamlı şekilde öğretir. NumPy bölümünde dizi indeksleme, slicing, reshape, transpose, lineer cebir işlemleri, özdeğer hesaplama, dizi birleştirme ve bölme gibi konularla matris manipülasyonunda ustalaşırsınız. Pandas bölümünde ise DataFrame ve Series yapılarından başlayarak veri okuma-yazma, SQL entegrasyonu, veri keşfi (head, tail, info, describe), loc ve iloc ile filtreleme, eksik veri yönetimi (dropna, fillna), tekrar eden satırların temizlenmesi, veri tipi dönüşümleri, tarih-saat işlemleri, concat ve merge ile veri birleştirme, groupby ile gruplama ve pivot tablo oluşturma gibi veri bilimi projelerinin olmazsa olmaz tekniklerini öğrenirsiniz. Ayrıca Kaggle ve Google Colab entegrasyonu ile gerçek dünya veri setleri üzerinde uygulamalı deneyim kazanır, Titanic veri seti gibi popüler örneklerle pratik yaparsınız. Excel ve Google Sheets üzerinde pivot tablo ve crosstab oluşturma konuları da kursa dahildir. Bu kurs; veri bilimine yeni başlayanlar, Python ile veri analizi yapmak isteyen öğrenciler, mühendisler, analistler ve makine öğrenmesine hazırlanan herkes için idealdir. Kurs sonunda gerçek veri setleri üzerinde temizleme, dönüştürme, gruplama ve analiz yapabilecek pratik becerilere sahip olacaksınız.',
  'https://i.ytimg.com/vi/qMRFrvVcM7g/hqdefault.jpg', c.id, i.id, 3499.0, 2499.0, 'intermediate', 'tr', true
from categories c, instructors i
where c.slug = 'makine-ogrenmesi'
limit 1
on conflict (slug) do nothing;

insert into course_sections (id, course_id, title, order_index)
select gen_random_uuid(), co.id, 'Ders Videoları', 1
from courses co
where co.slug = 'veri-bilimi-ve-makine-ogrenmesi'
  and not exists (select 1 from course_sections cs where cs.course_id = co.id);

insert into lessons (section_id, title, youtube_video_id, duration_seconds, order_index, is_preview)
select sec.id, v.title, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from (
  select cs.id
  from course_sections cs
  join courses co on co.id = cs.course_id
  where co.slug = 'veri-bilimi-ve-makine-ogrenmesi'
  limit 1
) sec(id),
(
  values
  ('71. Python Pandas: groupby() ile Veri Gruplama ve Agregasyon', 'qMRFrvVcM7g', 1047, 1, true),
  ('74. Pandas Pivot Tablolar: Veri Analizi İçin Kapsamlı Uygulama', 'V7QRavl5ljc', 430, 2, false),
  ('73. Excel''de ve Google Sheet ile Pivot Tablo ve Crosstab: Veri Analizine Giriş Rehberi', '0wIjebFTdgk', 552, 3, false),
  ('72. Pandas Titanic Veri Seti ile Gruplama ve Toplamsal İşlemler Analizi', 'wfOypo6u-Rk', 584, 4, false),
  ('69. Titanic Veri Seti: Pandas Concat ile Veri Birleştirme ve Gruplama', 'DjEsBHCUpGU', 398, 5, false),
  ('70. Pandas pd.merge() ile İlişkisel Veri Birleştirme: Kapsamlı Rehber', 'jp2ogGk-5nk', 523, 6, false),
  ('67. Pandas Tarih Saat Veri Tipi Dönüşümü ve Uygulamaları - to_datetime', 'bMzAgk4wslM', 602, 7, false),
  ('66. Pandas Veri Tipi Dönüşümleri: Etkili ve Hızlı Yöntemler', 'ZqwZKZCVBgA', 887, 8, false),
  ('68. Veri Birleştirme ve Gruplama: Concat ile Verilerinizi Yönetin!', 'sM4LeZXIES4', 673, 9, false),
  ('65. Pandas ile Veri Temizliği: Tekrar Eden Satırları Kolayca Silme', 'uqljj8aLRN0', 511, 10, false),
  ('64. Pandas ile Veri Temizliği: dropna ve fillna ile Eksik Veri Yönetimi', 'sB099S2Ez1I', 721, 11, false),
  ('63. Pandas ile Veri Temizleme ve Hazırlama Teknikleri', 'Vd-dsy2t4f4', 827, 12, false),
  ('62. Pandas''ta Veri Filtreleme: Adım Adım Rehber!', 'uKAlNLPjo7w', 336, 13, false),
  ('61. Pandas Veri Seçimi ve Filtreleme: Pratik Uygulamalarla Öğrenin', '4MNCvBcX7tM', 742, 14, false),
  ('60. Pandas''ta Veri Filtreleme ve Seçimi: loc ile iloc Farkı', '_0Uv4s4PcAA', 545, 15, false),
  ('59. Pandas ile Veri Keşfi: Adım Adım Uygulama Rehberi', 'NkurqOBzfgQ', 1086, 16, false),
  ('58. Pandas ile Veri Keşfi: head(), tail(), info(), describe() ile Temel Analiz', 'oSoUByXVD-Y', 685, 17, false),
  ('57. Kaggle & Colab Entegrasyonu: Veri Bilimi Akışınızı Güçlendirin', 'a1xirUsreU8', 624, 18, false),
  ('56. Kaggle ile Gerçek Dünya Veri Bilimi Örnekleri', 'fNFwOUHctf8', 560, 19, false),
  ('55. Pandas ile Veri Giriş Çıkışı: Dosya İşlemleri', 'oGldWOIk6K0', 164, 20, false),
  ('54. Pandas: SQL Veritabanından Veri Okuma ve Analiz Temelleri', 'r4FfvVTeHrQ', 330, 21, false),
  ('53. Pandas Veri Yükleme ve Temel İşlemler', 'zrgJBGK7mMY', 637, 22, false),
  ('52. Pandas Dataframe ve Series: Python Kod Açıklaması (52)', 'CkKDZF4jNdM', 610, 23, false),
  ('51. Python Pandas Dataframe ve Series Oluşturma: Adım Adım Rehber', 'WaCgYulRC3E', 387, 24, false),
  ('50. Pandas Başlangıç Rehberi: Veri Analizi Temelleri (Yeni Başlayanlar İçin)', 'TLRCG6vi-AM', 536, 25, false),
  ('40. Numpy Dosya İşlemleri: Verileri Kolayca Kaydetme ve Yükleme', 'z9nI_LIxYKE', 603, 26, false),
  ('39. NumPy ile Özdeğer Hesaplama: Matris Analizine Giriş', 'FO6LIt3lppo', 294, 27, false),
  ('38. NumPy ile Lineer Cebir İşlemleri: Temel Fonksiyonlar ve Kullanım', 'm6MZb9_a4cY', 518, 28, false),
  ('37. Numpy Dizilerini Sıralama: Verilerinizi Kolayca Düzenleyin', 'tBosVHYiPYg', 281, 29, false),
  ('36. Numpy: Koşullu Seçim ve Gelişmiş Filtreleme Teknikleri', 'P6Hbpwyu988', 650, 30, false),
  ('35. NumPy Kopyalama: Değer ve Referans Farkını Anlama', '-Abdb7agjfY', 307, 31, false),
  ('34. Numpy Dizilerini Tekrarlama: Etkili Döngü Teknikleri', 'ubOHMOTb4ic', 562, 32, false),
  ('33. Numpy Dizilerine Boyut Ekleme ve Çıkarma: Detaylı Anlatım', 'UVuDoW90xbc', 197, 33, false),
  ('32. Numpy ile Dizi Düzleştirme: Array Flattening Rehberi', 'Hj9hIf84ovA', 130, 34, false),
  ('31. Numpy Dizilerini Etkili Bölme: Veri İşlemede Ustalaşın', 'Dp-G2jTPpAs', 277, 35, false),
  ('30. NumPy İleri Dizi Manipülasyonu: Birleştirme, Bölme, Yeniden Boyutlandırma', 'uJAUQQqGGkY', 259, 36, false),
  ('29. NumPy Transpose: Matrisleri Kolayca Ters Çevirin!', 'eBZW8y-6W4o', 232, 37, false),
  ('28. Numpy Reshape ile Dizilerin Boyutunu Kolayca Değiştirin', 'OttfP9nCapQ', 193, 38, false),
  ('27. Numpy: Random, Reshape ve Transpose ile Veri Manipülasyonu', 'xWo2PFH0V64', 442, 39, false),
  ('26. NumPy Indeksleme - Indexing ve Dilimleme - Slicing: Python Veri Analizi Temelleri', 'b-b7pmThftM', 671, 40, false),
  ('25. NumPy Ufuncs Cheat Sheet: Diğer Fonksiyonlar Hızlı Bakış', 'VVmw8YwYHNQ', 194, 41, false),
  ('24. NumPy Ufuncs: Python''da Performansı Katlayın! Hızlı Veri İşleme', '3nRvIQVIoLA', 315, 42, false),
  ('23. NumPy Özel Ufuncs: Fonksiyonlarınızı Hızlandırın!', '2XgIGQ0nrRM', 827, 43, false),
  ('22. Python Numpy ile AGGREGATE & UFUNCS: Veri Analizi Temelleri', '1F9yK4h-_7I', 541, 44, false),
  ('21. NumPy Ufuncs: Hızlı ve Etkili Veri Karşılaştırmaları', '88Tr0sji0Vk', 235, 45, false),
  ('14-15. Numpy Dot Product: Matris Çarpımı ve Vektör İşlemlerinde Uzmanlaşın!', 'bLL-6RCquoA', 802, 46, false),
  ('18. Numpy: Trigonometrik Fonksiyonları Kullanma Rehberi', 'jtdOVinvaq4', 113, 47, false),
  ('19. NumPy ile Üstel ve Logaritmik Fonksiyonlar: Ufunc''lar Detaylı Anlatım', 'g9y6QjMAzng', 169, 48, false),
  ('20. Numpy Yuvarlama Fonksiyonları: Veri İşlemede Ustalaşın', 'Ja670c7kC74', 168, 49, false),
  ('17. NumPy Aritmetik Ufunc''lar: Performanslı İşlemler (Bölüm 2)', 'r1_dD1lzHPg', 221, 50, false),
  ('16. Numpy ufuncs: Python''da Hızlı Hesaplamalar ve Vektörizasyon', 'iosmPAOBg2I', 617, 51, false),
  ('13. NumPy Element-Wise ve Broadcasting: Verimli Dizi İşlemleri', '3yKd3az2jXU', 717, 52, false),
  ('7. ML ve Veri Bilimi İlk Bölüm Özeti ve Önemli Noktalar', 'eFHuB2C9JNc', 161, 53, false),
  ('12.2 Numpy Array Oluşturma Rehberi-2', 'qasZBQRuTrw', 926, 54, false),
  ('12.1 Numpy Array Oluşturma Rehberi-1', 'qF2Z9tiy1GE', 707, 55, false),
  ('11. Python''da Numpy Neden Vazgeçilmez? Veri Bilimi Temeli', 'Btg-gtK65dA', 412, 56, false),
  ('10. Python Numpy Giriş: Veri Analizi İçin Temel Kütüphane', 'XfVlrUlLn9c', 266, 57, false),
  ('9. Veri Bilimi ve ML İçin Geliştirme Ortamları Rehberi', 'mcXaGEk-qDk', 1320, 58, false),
  ('8. Veri Bilimi ve ML İçin Temel Python Kütüphanelerine Giriş', 'Nyim8qrL72s', 211, 59, false),
  ('6. ML Mühendisi Kimdir? Görevleri ve Kariyer Fırsatları', '7aDJ4BA1FOM', 613, 60, false),
  ('5. Makine Öğrenmesi İş Akışı: Veriden Modele Tam Rehber', 'Kmu1vCc1KGM', 567, 61, false),
  ('4. Veri Bilimi İş Akışı: Başarıya Götüren Adımlar', 'dwabZAieqhM', 293, 62, false),
  ('3. Veri Bilimcisi Nasıl Çalışır? Bir Gününe Yakından Bakış', 'LyvIWDUIE7k', 679, 63, false),
  ('2. Veri Bilimi ve Makine Öğrenmesi Nedir? Hızlı Giriş', '3BFWXswvHlc', 423, 64, false),
  ('1. Veri Bilimi ve ML Eğitimi: Giriş & Ders Tanıtımı', 'PSzjuPiaLJc', 322, 65, false)
) as v(title, youtube_video_id, duration_seconds, order_index, is_preview)
where not exists (select 1 from lessons l where l.section_id = sec.id);

-- Pandas ile Veri Analizi (25 ders)
insert into courses (title, slug, short_description, description, cover_image_url,
  category_id, instructor_id, price, discount_price, level, language, is_published)
select 'Pandas ile Veri Analizi', 'pandas-ile-veri-analizi',
  'Python Pandas kütüphanesiyle veri analizi, temizleme, gruplama ve birleştirme tekniklerini gerçek veri setleriyle öğreten kapsamlı bir eğitim serisi.', 'Pandas ile Veri Analizi kursu, Python''ın en güçlü veri analizi kütüphanesi olan Pandas''ı sıfırdan ileri seviyeye taşıyan kapsamlı bir eğitim programıdır. Kursta Pandas DataFrame ve Series yapılarının oluşturulmasından başlayarak, veri yükleme, SQL veritabanı bağlantıları, Kaggle ve Google Colab entegrasyonu gibi pratik konular ele alınır. Veri keşfi için head, tail, info ve describe gibi temel fonksiyonlar detaylıca anlatılırken, loc ve iloc ile veri filtreleme ve seçim teknikleri örneklerle pekiştirilir. Eksik veri yönetimi (dropna, fillna), tekrar eden satırların temizlenmesi ve veri tipi dönüşümleri gibi veri temizleme süreçleri de kursun önemli bir bölümünü oluşturur. Titanic veri seti üzerinden gerçek dünya uygulamalarıyla concat ve merge fonksiyonları kullanılarak veri birleştirme teknikleri öğretilir. Ayrıca groupby() ile veri gruplama, agregasyon işlemleri, pivot tablolar ve crosstab kullanımı Excel, Google Sheets ve Pandas üzerinden karşılaştırmalı olarak sunulur. Bu kurs; veri bilimi, veri analitiği, makine öğrenimi veya Python programlama alanında kariyer yapmak isteyen yeni başlayanlar ile bilgilerini pekiştirmek isteyen orta seviye kullanıcılar için idealdir. Kurs sonunda öğrenciler, gerçek veri setleri üzerinde bağımsız analiz yapabilecek, veri temizleme ve dönüştürme becerilerini profesyonel düzeyde kullanabilecek yetkinliğe ulaşacaktır.',
  'https://i.ytimg.com/vi/qMRFrvVcM7g/hqdefault.jpg', c.id, i.id, 1799.0, 1299.0, 'beginner', 'tr', true
from categories c, instructors i
where c.slug = 'veri-bilimi'
limit 1
on conflict (slug) do nothing;

insert into course_sections (id, course_id, title, order_index)
select gen_random_uuid(), co.id, 'Ders Videoları', 1
from courses co
where co.slug = 'pandas-ile-veri-analizi'
  and not exists (select 1 from course_sections cs where cs.course_id = co.id);

insert into lessons (section_id, title, youtube_video_id, duration_seconds, order_index, is_preview)
select sec.id, v.title, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from (
  select cs.id
  from course_sections cs
  join courses co on co.id = cs.course_id
  where co.slug = 'pandas-ile-veri-analizi'
  limit 1
) sec(id),
(
  values
  ('71. Python Pandas: groupby() ile Veri Gruplama ve Agregasyon', 'qMRFrvVcM7g', 1047, 1, true),
  ('74. Pandas Pivot Tablolar: Veri Analizi İçin Kapsamlı Uygulama', 'V7QRavl5ljc', 430, 2, false),
  ('73. Excel''de ve Google Sheet ile Pivot Tablo ve Crosstab: Veri Analizine Giriş Rehberi', '0wIjebFTdgk', 552, 3, false),
  ('72. Pandas Titanic Veri Seti ile Gruplama ve Toplamsal İşlemler Analizi', 'wfOypo6u-Rk', 584, 4, false),
  ('69. Titanic Veri Seti: Pandas Concat ile Veri Birleştirme ve Gruplama', 'DjEsBHCUpGU', 398, 5, false),
  ('70. Pandas pd.merge() ile İlişkisel Veri Birleştirme: Kapsamlı Rehber', 'jp2ogGk-5nk', 523, 6, false),
  ('67. Pandas Tarih Saat Veri Tipi Dönüşümü ve Uygulamaları - to_datetime', 'bMzAgk4wslM', 602, 7, false),
  ('66. Pandas Veri Tipi Dönüşümleri: Etkili ve Hızlı Yöntemler', 'ZqwZKZCVBgA', 887, 8, false),
  ('68. Veri Birleştirme ve Gruplama: Concat ile Verilerinizi Yönetin!', 'sM4LeZXIES4', 673, 9, false),
  ('65. Pandas ile Veri Temizliği: Tekrar Eden Satırları Kolayca Silme', 'uqljj8aLRN0', 511, 10, false),
  ('64. Pandas ile Veri Temizliği: dropna ve fillna ile Eksik Veri Yönetimi', 'sB099S2Ez1I', 721, 11, false),
  ('63. Pandas ile Veri Temizleme ve Hazırlama Teknikleri', 'Vd-dsy2t4f4', 827, 12, false),
  ('62. Pandas''ta Veri Filtreleme: Adım Adım Rehber!', 'uKAlNLPjo7w', 336, 13, false),
  ('61. Pandas Veri Seçimi ve Filtreleme: Pratik Uygulamalarla Öğrenin', '4MNCvBcX7tM', 742, 14, false),
  ('60. Pandas''ta Veri Filtreleme ve Seçimi: loc ile iloc Farkı', '_0Uv4s4PcAA', 545, 15, false),
  ('59. Pandas ile Veri Keşfi: Adım Adım Uygulama Rehberi', 'NkurqOBzfgQ', 1086, 16, false),
  ('58. Pandas ile Veri Keşfi: head(), tail(), info(), describe() ile Temel Analiz', 'oSoUByXVD-Y', 685, 17, false),
  ('57. Kaggle & Colab Entegrasyonu: Veri Bilimi Akışınızı Güçlendirin', 'a1xirUsreU8', 624, 18, false),
  ('56. Kaggle ile Gerçek Dünya Veri Bilimi Örnekleri', 'fNFwOUHctf8', 560, 19, false),
  ('55. Pandas ile Veri Giriş Çıkışı: Dosya İşlemleri', 'oGldWOIk6K0', 164, 20, false),
  ('54. Pandas: SQL Veritabanından Veri Okuma ve Analiz Temelleri', 'r4FfvVTeHrQ', 330, 21, false),
  ('53. Pandas Veri Yükleme ve Temel İşlemler', 'zrgJBGK7mMY', 637, 22, false),
  ('52. Pandas Dataframe ve Series: Python Kod Açıklaması (52)', 'CkKDZF4jNdM', 610, 23, false),
  ('51. Python Pandas Dataframe ve Series Oluşturma: Adım Adım Rehber', 'WaCgYulRC3E', 387, 24, false),
  ('50. Pandas Başlangıç Rehberi: Veri Analizi Temelleri (Yeni Başlayanlar İçin)', 'TLRCG6vi-AM', 536, 25, false)
) as v(title, youtube_video_id, duration_seconds, order_index, is_preview)
where not exists (select 1 from lessons l where l.section_id = sec.id);

-- JavaScript ile Web Geliştirme (26 ders)
insert into courses (title, slug, short_description, description, cover_image_url,
  category_id, instructor_id, price, discount_price, level, language, is_published)
select 'JavaScript ile Web Geliştirme', 'javascript-ile-web-gelistirme',
  'JavaScript''in temellerini, değişkenleri, fonksiyonları ve operatörleri örneklerle öğreten kapsamlı, sıfırdan ileri seviye web geliştirme kursu.', 'JavaScript ile Web Geliştirme kursu, sıfırdan ileri seviyeye JavaScript öğrenmek isteyenler için hazırlanmış kapsamlı bir eğitim programıdır. Bu kursta JavaScript''in tarihçesinden başlayarak, değişken tanımlama yöntemleri, let, var ve const kullanımı, hoisting kavramı, veri tipleri ve operatörler gibi temel konuları detaylıca öğreneceksiniz. Ayrıca template literals, tip dönüşümleri (type conversion ve coercion), truthy-falsy değerler ve boolean mantığı gibi JavaScript''in önemli yapı taşlarını uygulamalı örneklerle pekiştireceksiniz. Kurs içerisinde koşullu ifadeler (if-else, ternary operator, switch case), statements ve expressions kavramları ile use strict modunun kullanımı da ayrıntılı biçimde ele alınmaktadır. Fonksiyonlar konusuna geniş yer verilen kursta, function declaration ve expression farkları, arrow function kullanımı ve ES6 yenilikleri örnek uygulamalarla anlatılmaktadır. Yazılım geliştirmeye yeni başlayanlar, web geliştirme kariyerine adım atmak isteyenler veya JavaScript bilgisini sağlam temellere oturtmak isteyen herkes için idealdir. Teorik bilgilerin yanı sıra bol miktarda pratik uygulama içeren bu kurs sayesinde, modern JavaScript programlama mantığını kavrayacak ve gerçek projelerde kullanabileceğiniz sağlam bir altyapı kazanacaksınız. Frontend geliştirme yolculuğunuzda emin adımlarla ilerlemek için bu JavaScript eğitimi tam size göre.',
  'https://i.ytimg.com/vi/lcmpWHLkwgc/hqdefault.jpg', c.id, i.id, 1999.0, 1499.0, 'beginner', 'tr', true
from categories c, instructors i
where c.slug = 'yazilim-gelistirme'
limit 1
on conflict (slug) do nothing;

insert into course_sections (id, course_id, title, order_index)
select gen_random_uuid(), co.id, 'Ders Videoları', 1
from courses co
where co.slug = 'javascript-ile-web-gelistirme'
  and not exists (select 1 from course_sections cs where cs.course_id = co.id);

insert into lessons (section_id, title, youtube_video_id, duration_seconds, order_index, is_preview)
select sec.id, v.title, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from (
  select cs.id
  from course_sections cs
  join courses co on co.id = cs.course_id
  where co.slug = 'javascript-ile-web-gelistirme'
  limit 1
) sec(id),
(
  values
  ('2. JavaScript History And How JS Works', 'lcmpWHLkwgc', 955, 1, true),
  ('4. JavaScript Variables   Değişken Kavramı', 'cPLU7lT39O8', 535, 2, false),
  ('5. Javascript Variables - Değişken Tanımlama Yöntemleri', 'bInNtOiemBQ', 410, 3, false),
  ('6. JS Variable Rules - Değişken Tanımlama Kuralları', 'M51iySsyDnw', 739, 4, false),
  ('7. JavaScript let and var differences - let ve var kullanımında farklılıklar', 'O0gmA92zGiY', 581, 5, false),
  ('8. JavaScript var, let and  hoisting - Örnek uygulama', 'Vf5u2L7Scig', 505, 6, false),
  ('1. JavaScript Intro - Why should we learn JS?', 'tEsF8Jk1g4w', 489, 7, false),
  ('9. JavaScript const variable - Const nedir?', 'luOmB-M3gQA', 388, 8, false),
  ('10. JavaScript const example - Const örneği', 'JYFlW66xi2I', 384, 9, false),
  ('11. JavaScript Data Types - Veri Tipleri', 'bs2pkWo2bLk', 1500, 10, false),
  ('12. JavaScript Operators  - JS Operatörler', '6tFF6dapJvY', 507, 11, false),
  ('13. JavaScript Operator Examples - Operatör Kullanımı Örnek', 'teVaeqfA5_A', 1059, 12, false),
  ('14. JavaScript Operator Precedence - Operatör Önceliği', 'uY2OGbcQoBU', 572, 13, false),
  ('15. JavaScript Template Literals - String Literals', 'z_WjjVgrzdU', 579, 14, false),
  ('16. JavaScript Type Conversion and Coercion - Tip Dönüşümleri', 'x66mD8wdaco', 411, 15, false),
  ('17. Javascript Trutht and Falsy Values And Booelan Logic - Doğru ve Yanlış Kavramı, Boolean Mantığı', 'fC0WrolnLD4', 805, 16, false),
  ('18. JavaScript Statements and Expressions - İfadeler', '6y3_WdYEMZg', 247, 17, false),
  ('19. JavaScript Conditional Statements - Koşullu İfadeler', 'LsTaNXgsUEE', 534, 18, false),
  ('20. JavaScript If Else and Ternary Example - Örnek Uygulama', 'tz-mZzbU2SE', 653, 19, false),
  ('21. JavaScript Switch Case Statement - Örnek Uygulama', '5PnASNaLQx4', 1339, 20, false),
  ('22 . JavaScript Use Strict', 'G7Lv83QHegg', 562, 21, false),
  ('23. JavaScript Functions - Fonksiyonlar', 'hxaGN1M7c7E', 483, 22, false),
  ('25. JavaScript Function Declaration vs  Expressions', 'RwcuKSms__w', 754, 23, false),
  ('24. JavaScript Functions 2 - Fonksiyonlar Uygulama', 'VcOKcw7Wf2U', 979, 24, false),
  ('26. JavaScript Arrow Functions - Ok Fonksiyonu', 'g6IcxG7qVc8', 1034, 25, false),
  ('27. JavaScript Arrow Functions Example - Örnek Uygulama', 'C04bVo5f9EE', 591, 26, false)
) as v(title, youtube_video_id, duration_seconds, order_index, is_preview)
where not exists (select 1 from lessons l where l.section_id = sec.id);

-- 10 Video ile Java Öğren (4 ders)
insert into courses (title, slug, short_description, description, cover_image_url,
  category_id, instructor_id, price, discount_price, level, language, is_published)
select '10 Video ile Java Öğren', '10-video-ile-java-ogren',
  'Java programlamaya sıfırdan başlayanlar için temel kavramları ve veri tiplerini uygulamalı anlatan kapsamlı 10 video eğitim serisi.', 'Java programlama diline sıfırdan başlamak isteyenler için hazırlanan ''10 Video ile Java Öğren'' kursu, temel Java kavramlarını sade ve anlaşılır bir dille anlatmaktadır. Kurs boyunca Java nedir, nasıl çalışır, Java derleyicisinin kaynak kod dosyalarını nasıl işlediği, güncel Java versiyonları, kod yapısı ve Java veri tipleri gibi temel konular uygulamalı örneklerle ele alınmaktadır. Yazılım geliştirmeye yeni başlayanlar, üniversite öğrencileri, kendi kendine programlama öğrenmek isteyenler ve Java diline giriş yapmak isteyen herkes için ideal bir kaynaktır. Ön bilgi gerektirmeyen bu Java eğitim serisi sayesinde katılımcılar, Java''nın çalışma mantığını kavrayacak, derleme sürecini anlayacak ve Java''da kullanılan temel veri tiplerini etkin biçimde kullanabilecek düzeye gelecektir. Kurs, teorik bilgilerin yanı sıra pratik uygulamalarla desteklenerek öğrenmeyi kalıcı hale getirmeyi amaçlamaktadır. Java programlama dilinde kariyer yapmak isteyenler için sağlam bir temel oluşturan bu eğitim, nesne yönelimli programlamaya geçiş öncesi gerekli altyapıyı kazandırır. Adım adım ilerleyen anlatım tarzı sayesinde karmaşık kavramlar bile kolayca özümsenebilir. Java öğrenmeye bu kapsamlı ve ücretsiz video serisiyle başlayarak yazılım geliştirme yolculuğunuza sağlam adımlarla ilerleyebilirsiniz.',
  'https://i.ytimg.com/vi/wsHCD4QYuts/hqdefault.jpg', c.id, i.id, 999.0, null, 'beginner', 'tr', true
from categories c, instructors i
where c.slug = 'yazilim-gelistirme'
limit 1
on conflict (slug) do nothing;

insert into course_sections (id, course_id, title, order_index)
select gen_random_uuid(), co.id, 'Ders Videoları', 1
from courses co
where co.slug = '10-video-ile-java-ogren'
  and not exists (select 1 from course_sections cs where cs.course_id = co.id);

insert into lessons (section_id, title, youtube_video_id, duration_seconds, order_index, is_preview)
select sec.id, v.title, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from (
  select cs.id
  from course_sections cs
  join courses co on co.id = cs.course_id
  where co.slug = '10-video-ile-java-ogren'
  limit 1
) sec(id),
(
  values
  ('1. Java Nedir ve Nasıl Çalışır?', 'wsHCD4QYuts', 550, 1, true),
  ('2 . Java Çalışma Mantığı', 'pnQb0aJrd9A', 1450, 2, false),
  ('3. Java Versiyonları ve Kod Yapısı', 'MD6L2D_pAxQ', 1656, 3, false),
  ('4. Java Veri Tipleri', 'iLt2-liNMu8', 625, 4, false)
) as v(title, youtube_video_id, duration_seconds, order_index, is_preview)
where not exists (select 1 from lessons l where l.section_id = sec.id);
