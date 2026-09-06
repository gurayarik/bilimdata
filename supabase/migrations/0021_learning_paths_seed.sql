-- Veri Bilimi müfredatının ilk 7 "güçlü eğitim" path iskeleti. Taslak olarak
-- (is_published=false) eklenir; içerikleri admin panelinden makale makale
-- (AI destekli) doldurulup her path kendi başına yayına alınır.

insert into learning_paths (title, slug, description, is_published, order_index) values
  ('Python ile Veri Bilimine Giriş', 'python-ile-veri-bilimine-giris', 'NumPy, Pandas, Matplotlib/Seaborn, Jupyter Notebook ve veri bilimi için temel Python araçları.', false, 0),
  ('Keşifsel Veri Analizi (EDA)', 'kesifsel-veri-analizi', 'Elindeki veriyi anlamlandırma: veri kalitesi, eksik veri, aykırı değerler, dağılımlar ve korelasyonlar.', false, 1),
  ('Veri Görselleştirme', 'veri-gorsellestirme', 'Matplotlib, Seaborn ve Plotly ile doğru grafiği seçme ve veriyle hikaye anlatma.', false, 2),
  ('SQL ile Veri Analizi', 'sql-ile-veri-analizi', 'SELECT''ten window function''lara, veri bilimcinin günlük kullandığı SQL becerileri.', false, 3),
  ('Veri Bilimi için İstatistik ve Olasılık', 'veri-bilimi-icin-istatistik-ve-olasilik', 'Merkezi limit teoremi, hipotez testleri, güven aralıkları ve A/B testi — gerçek problemler üzerinden.', false, 4),
  ('Sıfırdan Makine Öğrenmesi', 'sifirdan-makine-ogrenmesi', 'Supervised/unsupervised öğrenme, model değerlendirme ve feature engineering temelleri.', false, 5),
  ('Gerçek Projelerle Veri Bilimi', 'gercek-projelerle-veri-bilimi', 'Uçtan uca veri bilimi projeleri: problem tanımından iş yorumuna kadar.', false, 6)
on conflict (slug) do nothing;
