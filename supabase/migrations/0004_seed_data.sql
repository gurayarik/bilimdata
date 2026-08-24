-- Faz 2 — Anasayfa/katalog test edilebilsin diye örnek kategori ve kurs verisi.
-- Gerçek veriler Faz 4'teki admin panelinden girilene kadar bu veriler kullanılacak.

insert into categories (name, slug, icon, description) values
  ('Python', 'python', '🐍', 'Sıfırdan ileri seviyeye Python programlama.'),
  ('Veri Bilimi', 'veri-bilimi', '📊', 'Veri analizi, istatistik ve görselleştirme.'),
  ('Makine Öğrenmesi', 'makine-ogrenmesi', '🤖', 'Denetimli/denetimsiz öğrenme algoritmaları.'),
  ('Yapay Zeka', 'yapay-zeka', '🧠', 'Derin öğrenme ve modern yapay zeka teknikleri.'),
  ('Yazılım Geliştirme', 'yazilim-gelistirme', '💻', 'Web ve backend geliştirme pratikleri.')
on conflict (slug) do nothing;

insert into courses (title, slug, short_description, description, cover_image_url, category_id, price, discount_price, level, language, is_published)
select
  v.title, v.slug, v.short_description, v.description, v.cover_image_url,
  c.id, v.price, v.discount_price, v.level, 'tr', true
from (
  values
    (
      'Sıfırdan Python Programlama',
      'sifirdan-python-programlama',
      'Hiç kod yazmamış olsanız bile Python''a sıfırdan başlayın.',
      'Bu eğitimde Python temellerini, veri yapılarını ve fonksiyonları uygulamalı örneklerle öğreneceksiniz.',
      'https://placehold.co/640x360?text=Python',
      'python',
      1499.00,
      999.00,
      'beginner'
    ),
    (
      'Veri Bilimi ile Kariyer',
      'veri-bilimi-ile-kariyer',
      'Veri bilimci olmak için gereken tüm temel becerileri kazanın.',
      'Pandas, NumPy ve veri görselleştirme araçlarıyla gerçek veri setleri üzerinde çalışacaksınız.',
      'https://placehold.co/640x360?text=Veri+Bilimi',
      'veri-bilimi',
      1999.00,
      1499.00,
      'intermediate'
    ),
    (
      'Makine Öğrenmesi Temelleri',
      'makine-ogrenmesi-temelleri',
      'Denetimli ve denetimsiz öğrenme algoritmalarını uygulamalı öğrenin.',
      'Regresyon, sınıflandırma ve kümeleme algoritmalarını scikit-learn ile uygulayacaksınız.',
      'https://placehold.co/640x360?text=Makine+Ogrenmesi',
      'makine-ogrenmesi',
      2499.00,
      null,
      'intermediate'
    ),
    (
      'Derin Öğrenme ile Görüntü İşleme',
      'derin-ogrenme-ile-goruntu-isleme',
      'Evrişimli sinir ağlarıyla görüntü sınıflandırma projeleri geliştirin.',
      'TensorFlow/Keras kullanarak uçtan uca bir görüntü sınıflandırma modeli inşa edeceksiniz.',
      'https://placehold.co/640x360?text=Derin+Ogrenme',
      'yapay-zeka',
      2999.00,
      2199.00,
      'advanced'
    )
) as v(title, slug, short_description, description, cover_image_url, category_slug, price, discount_price, level)
join categories c on c.slug = v.category_slug
on conflict (slug) do nothing;
