-- Udemy üzerinden kupon karşılığı sunulan kurslar (müfredat listelenmez,
-- kart + "Udemy'de Satın Al/Ücretsiz Al" yönlendirmesi ile gösterilir).

insert into courses (
  title, slug, short_description, description, cover_image_url,
  category_id, instructor_id, price, discount_price, level, language,
  is_published, provider, external_url, coupon_code
)
select
  'Python Eğitimi: Sıfırdan İleri Seviyeye',
  'python-egitimi-sifirdan-ileri-seviyeye',
  'Hiç kod yazmamış olsanız bile Python''a sıfırdan başlayıp ileri seviyeye taşıyan, uygulamalı bir Udemy eğitimi.',
  'Bu kurs, Python programlama diline hiç deneyimi olmayan öğrencileri sıfırdan alıp ileri seviye konulara kadar taşıyan kapsamlı bir eğitim programıdır. Değişkenler, veri tipleri ve kontrol yapıları gibi temel konulardan başlayarak fonksiyonlar, nesne yönelimli programlama ve gerçek dünya proje uygulamalarına kadar geniş bir yelpazeyi kapsar. Yaklaşık 20 yıllık yazılım ve eğitim deneyimine sahip Dr. Güray Arık tarafından hazırlanan kurs, teorik bilgiyi bol miktarda uygulamalı örnekle pekiştirir. Python''u kariyer hedefleri doğrultusunda öğrenmek isteyen yazılım geliştirici adayları, veri bilimiyle ilgilenenler ve programlamaya yeni başlayan herkes için idealdir. Kurs sonunda Python ile bağımsız projeler geliştirebilecek düzeyde sağlam bir temele sahip olacaksınız.',
  'https://placehold.co/640x360?text=Python+Egitimi',
  c.id, i.id, 1299.00, 199.00, 'beginner', 'tr', true,
  'udemy',
  'https://www.udemy.com/course/python-egitimi-sifirdan-ileri-seviyeye/?src=sac&kw=python+yaz%C4%B1l%C4%B1m&couponCode=CP260817G2',
  'CP260817G2'
from categories c, instructors i
where c.slug = 'python'
limit 1
on conflict (slug) do nothing;

insert into courses (
  title, slug, short_description, description, cover_image_url,
  category_id, instructor_id, price, discount_price, level, language,
  is_published, provider, external_url, coupon_code
)
select
  'Güvenli Yazılım Geliştirme ve Kodlama',
  'guvenli-yazilim-gelistirme-ve-kodlama',
  'Güvenli yazılım geliştirme, OWASP Top 10 ve secure coding tekniklerini gerçek kod örnekleriyle öğreten ücretsiz Udemy eğitimi.',
  'Bu kurs, yazılım geliştiricilerin güvenlik açıklarından korunan, sağlam ve güvenilir uygulamalar yazabilmesi için gereken bilgi ve becerileri kazandırır. OWASP Top 10 güvenlik açıkları başta olmak üzere, güvenli kodlama prensipleri gerçek kod örnekleri üzerinden uygulamalı olarak anlatılır. SQL injection, XSS, kimlik doğrulama zafiyetleri gibi yaygın güvenlik sorunlarının nasıl önleneceği somut senaryolarla gösterilir. Yazılım geliştiricilerin, güvenlik ekiplerinin ve bu alanda kariyer yapmak isteyen herkesin faydalanabileceği bu eğitim, 4,7/5 öğrenci puanıyla değerlendirilmektedir. Kurs sonunda, yazdığınız kodun güvenlik açısından nelere dikkat etmesi gerektiğini bilen bir geliştirici olacaksınız.',
  'https://placehold.co/640x360?text=Guvenli+Yazilim',
  c.id, i.id, 0, null, 'intermediate', 'tr', true,
  'udemy',
  'https://www.udemy.com/course/guvenli-yazilim-gelistirme-ve-kodlama/',
  null
from categories c, instructors i
where c.slug = 'yazilim-gelistirme'
limit 1
on conflict (slug) do nothing;

insert into courses (
  title, slug, short_description, description, cover_image_url,
  category_id, instructor_id, price, discount_price, level, language,
  is_published, provider, external_url, coupon_code
)
select
  'Machine Learning Interview Refresher: Theory, Logic & Interview Prep',
  'machine-learning-interview-refresher',
  'Master the ''why'' behind the code: a comprehensive guide to ML logic, lifecycle, and data science interview success.',
  'This free course is designed for those who already have some machine learning background and want to refresh and solidify their understanding before technical interviews. It focuses on the reasoning and logic behind core ML concepts rather than just syntax, covering the full machine learning lifecycle from data preparation to model deployment. Common interview questions and the thinking process behind strong answers are explored in depth, helping learners communicate their ML knowledge clearly and confidently. Rated 4.1/5 by students, this course is ideal for data science and ML candidates preparing for job interviews or looking to strengthen their conceptual foundation. By the end of the course, you will be able to explain key ML concepts with clarity and approach interview questions with a structured, confident mindset.',
  'https://placehold.co/640x360?text=ML+Interview+Refresher',
  c.id, i.id, 0, null, 'intermediate', 'en', true,
  'udemy',
  'https://www.udemy.com/course/machine-learning-interview-refresher-theory-to-deployment/',
  null
from categories c, instructors i
where c.slug = 'makine-ogrenmesi'
limit 1
on conflict (slug) do nothing;
