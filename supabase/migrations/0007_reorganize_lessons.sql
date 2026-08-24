-- Faz 3 devamı — müfredatı gerçek pedagojik sıraya göre bölümlere ayırır
-- ve her derse AI ile üretilmiş bir açıklama ekler. 0005'te oluşturulan
-- (yanlış sıralı, tek bölümlü) course_sections/lessons'ın yerini alır.

-- veri-bilimi-ve-makine-ogrenmesi
delete from course_sections where course_id = (select id from courses where slug = 'veri-bilimi-ve-makine-ogrenmesi');

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Giriş', 1
  from courses where slug = 'veri-bilimi-ve-makine-ogrenmesi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('1. Veri Bilimi ve ML Eğitimi: Giriş & Ders Tanıtımı', 'Bu ders, Veri Bilimi ve Makine Öğrenmesi eğitim serisinin açılış videosudur. Eğitim boyunca hangi konuların ele alınacağı, serinin nasıl bir yol haritası izleyeceği ve derslerin genel yapısı hakkında bilgi edineceksiniz. Yapay zeka ve veri dünyasına ilk adımı atmadan önce sizi bekleyen içerikler hakkında net bir fikir sahibi olacaksınız. Bu sayede eğitimin geri kalanını daha bilinçli ve motive bir şekilde takip edebileceksiniz.', 'PSzjuPiaLJc', 322, 1, true),
  ('2. Veri Bilimi ve Makine Öğrenmesi Nedir? Hızlı Giriş', 'Bu derste veri bilimi ve makine öğrenmesinin ne anlama geldiğini ve birbirleriyle nasıl ilişkili olduklarını öğreneceksiniz. Bu kavramların günümüz teknoloji ve iş dünyasında neden bu kadar önemli hale geldiğini örneklerle kavrayacaksınız. Alana yeni başlayanlar için tasarlanan bu hızlı giriş, temel terimleri ve büyük resmi anlamanızı sağlayacak. Ders sonunda veri bilimi ile makine öğrenmesi dünyasına adım atmak için gerekli zihinsel altyapıyı kazanmış olacaksınız.', '3BFWXswvHlc', 423, 2, false),
  ('3. Veri Bilimcisi Nasıl Çalışır? Bir Gününe Yakından Bakış', 'Bu videoda bir veri bilimcisinin günlük çalışma rutinine yakından bakıyoruz. Veri toplama, analiz etme ve modelleme gibi süreçlerde karşılaşılan zorlukları ve kullanılan araçları öğreneceksiniz. Bu meslekte başarılı olmak için gereken beceri ve yaklaşımlar hakkında gerçekçi bir perspektif kazanacaksınız. Veri bilimciliğe merak duyan veya bu kariyeri düşünen herkes için pratik ve ilham verici bir içerik sunulmaktadır.', 'LyvIWDUIE7k', 679, 3, false),
  ('4. Veri Bilimi İş Akışı: Başarıya Götüren Adımlar', 'Bu derste veri bilimi projelerinde izlenmesi gereken sistematik iş akışını öğreneceksiniz. Veri toplama, temizleme, analiz etme, modelleme ve sonuçları dağıtma adımlarının her biri detaylı biçimde ele alınmaktadır. Bu yapılandırılmış yaklaşımı öğrenerek kendi projelerinizde daha verimli ve düzenli çalışabileceksiniz. Ders, veri bilimi projelerini baştan sona başarıyla yönetmek isteyenler için pratik bir rehber niteliğindedir.', 'dwabZAieqhM', 293, 4, false),
  ('5. Makine Öğrenmesi İş Akışı: Veriden Modele Tam Rehber', 'Bu videoda makine öğrenmesi projelerinin baştan sona nasıl yürütüldüğünü öğreneceksiniz. Veri toplama, ön işleme, model seçimi, eğitim, değerlendirme ve dağıtım gibi temel aşamalar adım adım açıklanmaktadır. Bu iş akışını kavrayarak kendi ML projelerinizi daha planlı ve etkili bir şekilde yönetebileceksiniz. Ders, makine öğrenmesi sürecinin bütününü net bir şekilde görmek isteyen öğrenciler için kapsamlı bir rehber sunar.', 'Kmu1vCc1KGM', 567, 5, false),
  ('6. ML Mühendisi Kimdir? Görevleri ve Kariyer Fırsatları', 'Bu derste Makine Öğrenmesi Mühendisi (ML Engineer) kavramını ve bu mesleğin görevlerini öğreneceksiniz. ML mühendislerinin yapay zeka ve veri bilimi projelerindeki kritik rolünü, kullandıkları teknolojileri ve sektördeki kariyer fırsatlarını keşfedeceksiniz. Bu kariyer yolunu düşünen öğrenciler için sektörde beklenen beceriler ve sorumluluklar netleştirilmektedir. Ders sonunda ML mühendisliğinin veri bilimi ekosistemindeki yerini net biçimde anlamış olacaksınız.', '7aDJ4BA1FOM', 613, 6, false),
  ('7. ML ve Veri Bilimi İlk Bölüm Özeti ve Önemli Noktalar', 'Bu video, eğitim serisinin ilk bölümünde işlenen konuların genel bir özetini sunmaktadır. Veri bilimi ve makine öğrenmesine giriş niteliğindeki temel kavramlar ve önemli noktalar tekrar gözden geçirilmektedir. Bu sayede öğrendiğiniz bilgileri pekiştirerek bir sonraki bölüme daha sağlam bir temelle geçebilirsiniz. Ders, önceki konuların hafızanızda netleşmesini sağlayan kısa ama etkili bir tekrar niteliğindedir.', 'eFHuB2C9JNc', 161, 7, false),
  ('8. Veri Bilimi ve ML İçin Temel Python Kütüphanelerine Giriş', 'Bu derste veri bilimi ve makine öğrenmesinde sıkça kullanılan temel Python kütüphanelerini tanıyacaksınız. NumPy, Pandas, Matplotlib ve Scikit-learn gibi araçların ne işe yaradığı ve temel kullanım amaçları hakkında bilgi edineceksiniz. Bu kütüphanelerin veri analizi ve modelleme süreçlerindeki rolünü kavrayarak pratik çalışmalara hazırlanacaksınız. Ders, ileriki uygulamalı derslere sağlam bir temel oluşturmayı amaçlamaktadır.', 'Nyim8qrL72s', 211, 8, false),
  ('9. Veri Bilimi ve ML İçin Geliştirme Ortamları Rehberi', 'Bu videoda veri bilimi ve makine öğrenmesi projeleri için kullanılan popüler geliştirme ortamlarını öğreneceksiniz. Jupyter Notebook, VS Code ve Anaconda gibi araçların özellikleri ve kurulum süreçleri detaylı şekilde anlatılmaktadır. Doğru geliştirme ortamını seçmenin projeleriniz için neden önemli olduğunu kavrayacaksınız. Ders sonunda kendi çalışma ortamınızı kurmak için gereken bilgiye sahip olacaksınız.', 'mcXaGEk-qDk', 1320, 9, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'NumPy', 2
  from courses where slug = 'veri-bilimi-ve-makine-ogrenmesi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('10. Python Numpy Giriş: Veri Analizi İçin Temel Kütüphane', 'Bu derste Python''ın veri analizi alanındaki temel kütüphanesi NumPy''a giriş yapılmaktadır. Diziler (array) oluşturmayı, temel matematiksel işlemleri ve veri manipülasyonu tekniklerini adım adım öğreneceksiniz. Bu bilgiler, ileride yapacağınız veri bilimi ve makine öğrenmesi çalışmalarının temelini oluşturacak. Ders, NumPy''ı hiç bilmeyenler için anlaşılır bir başlangıç noktası sunmaktadır.', 'XfVlrUlLn9c', 266, 1, false),
  ('11. Python''da Numpy Neden Vazgeçilmez? Veri Bilimi Temeli', 'Bu videoda Python''da veri bilimi ve makine öğrenmesi projelerinde NumPy kullanmanın neden bu kadar kritik olduğunu öğreneceksiniz. NumPy''ın sunduğu hızlı ve etkin çok boyutlu dizi işlemleriyle performansı nasıl artırabileceğinizi keşfedeceksiniz. Matematiksel operasyonların NumPy ile nasıl daha verimli hale geldiğini örneklerle kavrayacaksınız. Ders, NumPy''ın veri bilimindeki vazgeçilmez rolünü net biçimde ortaya koymaktadır.', 'Btg-gtK65dA', 412, 2, false),
  ('12.1 Numpy Array Oluşturma Rehberi-1', 'Bu derste Python''da NumPy dizileri (array) oluşturmanın temel yöntemlerini adım adım öğreneceksiniz. Sayısal hesaplamalarda performansı artıran ve karmaşık veri yapılarını yönetmeyi kolaylaştıran NumPy''ın gücünü keşfedeceksiniz. Farklı array oluşturma tekniklerini uygulamalı örneklerle pekiştireceksiniz. Ders, NumPy ile pratik çalışmaya yeni başlayanlar için ideal bir başlangıç niteliğindedir.', 'qF2Z9tiy1GE', 707, 3, false),
  ('12.2 Numpy Array Oluşturma Rehberi-2', 'Bu derste NumPy kütüphanesinde array oluşturmanın çeşitli yöntemleri adım adım ele alınıyor. `np.array()`, `np.zeros()`, `np.ones()` ve `np.arange()` gibi temel fonksiyonların nasıl kullanıldığı örneklerle gösteriliyor. Öğrenci, farklı boyut ve içerikte diziler oluşturmayı ve bu fonksiyonların hangi durumlarda tercih edileceğini öğrenecek. Ders sonunda veri bilimi projelerinde sıkça kullanılan array oluşturma tekniklerine hakim olunması hedefleniyor.', 'qasZBQRuTrw', 926, 4, false),
  ('13. NumPy Element-Wise ve Broadcasting: Verimli Dizi İşlemleri', 'Bu videoda NumPy''ın element-wise işlemleri ve broadcasting mekanizması detaylı biçimde inceleniyor. Diziler üzerinde eleman bazında yapılan işlemlerin mantığı ve farklı boyuttaki dizilerin nasıl birlikte işlenebileceği açıklanıyor. Öğrenci, bu kavramları kullanarak kodunu nasıl daha hızlı ve verimli hale getirebileceğini öğrenecek. Veri analizi ve bilimsel hesaplamalarda performans artışı sağlayan bu teknikler pratik örneklerle pekiştiriliyor.', '3yKd3az2jXU', 717, 5, false),
  ('14-15. Numpy Dot Product: Matris Çarpımı ve Vektör İşlemlerinde Uzmanlaşın!', 'Bu derste NumPy''daki dot product (nokta çarpımı) işlemi matematiksel temelleriyle birlikte anlatılıyor. Vektör ve matris çarpımlarının nasıl hesaplandığı adım adım örneklerle gösteriliyor. Öğrenci, bu işlemlerin veri bilimi ve makine öğrenmesi projelerinde nerelerde ve nasıl kullanıldığını kavrayacak. Ders, matris cebirini pratik NumPy uygulamalarıyla birleştirerek konuyu somutlaştırıyor.', 'bLL-6RCquoA', 802, 6, false),
  ('16. Numpy ufuncs: Python''da Hızlı Hesaplamalar ve Vektörizasyon', 'Bu videoda NumPy''ın ufuncs (evrensel fonksiyonlar) özelliği ve vektörizasyon kavramı ele alınıyor. Python''da sayısal hesaplamaların döngüler yerine vektörize işlemlerle nasıl hızlandırılabileceği anlatılıyor. Öğrenci, kodunu optimize ederek performansı artırma tekniklerini öğrenecek. Ders, büyük veri kümeleriyle çalışırken hız kazandıran pratik yaklaşımları örneklerle gösteriyor.', 'iosmPAOBg2I', 617, 7, false),
  ('17. NumPy Aritmetik Ufunc''lar: Performanslı İşlemler (Bölüm 2)', 'Bu derste NumPy''ın aritmetik ufunc''ları ikinci bölümde detaylı olarak işleniyor. Element-wise aritmetik hesaplamaların nasıl yapıldığı ve performansın nasıl optimize edileceği anlatılıyor. Öğrenci, toplama, çıkarma, çarpma gibi işlemleri dizi bazında verimli şekilde uygulamayı öğrenecek. Ders, veri işleme hızını artırmaya yönelik pratik ipuçları sunuyor.', 'r1_dD1lzHPg', 221, 8, false),
  ('18. Numpy: Trigonometrik Fonksiyonları Kullanma Rehberi', 'Bu videoda NumPy''ın trigonometrik ufunc fonksiyonları tanıtılıyor. Sinüs, kosinüs, tanjant gibi trigonometrik işlemlerin NumPy ile nasıl kolayca hesaplanacağı adım adım gösteriliyor. Öğrenci, bilimsel hesaplamalarda ve veri analizinde bu fonksiyonları nasıl etkin kullanacağını öğrenecek. Ders, teorik bilgiyi pratik kod örnekleriyle destekleyerek konuyu pekiştiriyor.', 'jtdOVinvaq4', 113, 9, false),
  ('19. NumPy ile Üstel ve Logaritmik Fonksiyonlar: Ufunc''lar Detaylı Anlatım', 'Bu derste NumPy''ın üstel (exponential) ve logaritmik ufunc fonksiyonları ele alınıyor. Bu matematiksel işlemlerin NumPy ile nasıl hızlı ve verimli bir şekilde gerçekleştirilebileceği anlatılıyor. Öğrenci, veri bilimi ve mühendislik uygulamalarında sıkça karşılaşılan üstel ve logaritmik hesaplamaları uygulamalı olarak öğrenecek. Ders, temel matematiksel kavramları pratik NumPy örnekleriyle birleştiriyor.', 'g9y6QjMAzng', 169, 10, false),
  ('20. Numpy Yuvarlama Fonksiyonları: Veri İşlemede Ustalaşın', 'Bu videoda NumPy''daki yuvarlama fonksiyonları detaylı şekilde inceleniyor. Verilerin farklı yöntemlerle nasıl yuvarlanacağı ve ondalık hassasiyetin nasıl yönetileceği anlatılıyor. Öğrenci, sayısal işlemlerde sık karşılaşılan yuvarlama hatalarından nasıl kaçınacağını öğrenecek. Ders, veri analizinde doğru ve tutarlı sonuçlar elde etmeye yönelik pratik bilgiler sunuyor.', 'Ja670c7kC74', 168, 11, false),
  ('21. NumPy Ufuncs: Hızlı ve Etkili Veri Karşılaştırmaları', 'Bu derste NumPy''ın karşılaştırma ufuncs''ları ele alınarak diziler arasında eleman bazında karşılaştırma yapmanın yolları gösteriliyor. Büyük veri kümelerinin hızlı ve performanslı şekilde nasıl karşılaştırılacağı örneklerle açıklanıyor. Öğrenci, veri bilimi ve makine öğrenmesinde sıkça kullanılan bu fonksiyonları etkin biçimde kullanmayı öğrenecek. Ders, karşılaştırma işlemlerinin pratik uygulamalarını net biçimde ortaya koyuyor.', '88Tr0sji0Vk', 235, 12, false),
  ('22. Python Numpy ile AGGREGATE & UFUNCS: Veri Analizi Temelleri', 'Bu videoda NumPy''ın aggregate ve ufuncs kavramları birlikte derinlemesine inceleniyor. Toplama, ortalama alma gibi veri analizinde sık kullanılan işlemler pratik örneklerle anlatılıyor. Öğrenci, büyük veri kümeleri üzerinde özet istatistikler çıkarmayı ve bu işlemleri NumPy ile verimli şekilde gerçekleştirmeyi öğrenecek. Ders, veri işleme becerilerini geliştirmeye yönelik temel bir altyapı sunuyor.', '1F9yK4h-_7I', 541, 13, false),
  ('23. NumPy Özel Ufuncs: Fonksiyonlarınızı Hızlandırın!', 'Bu derste NumPy''da kendi özel ufunc fonksiyonlarınızı nasıl oluşturacağınız adım adım anlatılıyor. Python fonksiyonlarının NumPy''nin vektörel gücüyle nasıl birleştirilebileceği örneklerle gösteriliyor. Öğrenci, kendi ihtiyaçlarına özel hızlı ve vektörel işlemler tasarlamayı öğrenecek. Ders, standart fonksiyonların yetersiz kaldığı durumlarda esnek çözümler üretmeye yönelik pratik bilgiler sunuyor.', '2XgIGQ0nrRM', 827, 14, false),
  ('24. NumPy Ufuncs: Python''da Performansı Katlayın! Hızlı Veri İşleme', 'Bu videoda NumPy''ın Ufuncs (Universal Functions) yapısı performans odaklı olarak detaylıca inceleniyor. Python''da veri işleme performansını artıracak hızlı ve optimize kod yazma teknikleri anlatılıyor. Öğrenci, özellikle büyük veri kümeleriyle çalışırken hız kazandıran yaklaşımları öğrenecek. Ders, önceki ufuncs derslerini pekiştirerek konuyu bütünsel bir bakışla tamamlıyor.', '3nRvIQVIoLA', 315, 15, false),
  ('25. NumPy Ufuncs Cheat Sheet: Diğer Fonksiyonlar Hızlı Bakış', 'Bu derste NumPy kütüphanesinin evrensel fonksiyonları yani Ufuncs''a dair genel bir hızlı başvuru rehberi sunulur. Sık kullanılan matematiksel ve istatistiksel fonksiyonlar örneklerle özetlenerek pratik kullanım alanları gösterilir. Öğrenci, veri analizi ve bilimsel hesaplamalarda zaman kazandıracak temel fonksiyonları tek bir kaynaktan hızlıca gözden geçirme imkanı bulur. Ders sonunda, hangi fonksiyonu ne zaman kullanacağını bilen bir kullanıcı olarak NumPy''ı daha verimli kullanabilecektir.', 'VVmw8YwYHNQ', 194, 16, false),
  ('26. NumPy Indeksleme - Indexing ve Dilimleme - Slicing: Python Veri Analizi Temelleri', 'Bu derste NumPy dizilerinde indeksleme (indexing) ve dilimleme (slicing) teknikleri detaylı biçimde ele alınır. Dizilerin belirli elemanlarına nasıl erişileceği, alt kümelerin nasıl seçileceği ve seçilen kısımların nasıl değiştirileceği adım adım gösterilir. Python ile veri manipülasyonu yaparken sıkça ihtiyaç duyulan bu teknikler örneklerle pekiştirilir. Öğrenci, NumPy dizileri üzerinde esnek ve hızlı veri erişimi yapabilme becerisi kazanır.', 'b-b7pmThftM', 671, 17, false),
  ('27. Numpy: Random, Reshape ve Transpose ile Veri Manipülasyonu', 'Bu derste NumPy''ın rastgele sayı üretme (random), dizi boyutu değiştirme (reshape) ve matris transpozu alma (transpose) fonksiyonları bir arada incelenir. Her bir fonksiyonun veri bilimi ve makine öğrenmesi uygulamalarındaki önemi örneklerle açıklanır. Öğrenci, rastgele veri setleri oluşturma ve dizileri farklı formatlara dönüştürme konusunda pratik kazanır. Ders sonunda bu üç temel aracı birlikte kullanarak veri manipülasyonu yapabilecek düzeye gelir.', 'xWo2PFH0V64', 442, 18, false),
  ('28. Numpy Reshape ile Dizilerin Boyutunu Kolayca Değiştirin', 'Bu derste NumPy''ın reshape fonksiyonu detaylı şekilde ele alınarak dizilerin boyutlarının nasıl değiştirileceği öğretilir. Reshape işleminin neden gerekli olduğu ve hangi senaryolarda kullanılabileceği somut örneklerle gösterilir. Farklı boyut dönüşümlerinin veri üzerindeki etkisi adım adım açıklanır. Öğrenci, veri setlerini istediği şekle dönüştürerek analiz ve modelleme süreçlerine hazırlama becerisi kazanır.', 'OttfP9nCapQ', 193, 19, false),
  ('29. NumPy Transpose: Matrisleri Kolayca Ters Çevirin!', 'Bu derste NumPy''ın transpose fonksiyonu ile matrislerin nasıl ters çevrileceği anlatılır. Satırların sütunlara, sütunların satırlara nasıl dönüştürüldüğü adım adım örneklerle gösterilir. Bu işlemin veri analizi ve makine öğrenmesi uygulamalarındaki önemi vurgulanır. Öğrenci, matris ve dizi boyutlarını ihtiyaca göre yeniden düzenleme konusunda pratik kazanır.', 'eBZW8y-6W4o', 232, 20, false),
  ('30. NumPy İleri Dizi Manipülasyonu: Birleştirme, Bölme, Yeniden Boyutlandırma', 'Bu derste NumPy''da ileri düzey dizi manipülasyon teknikleri olan birleştirme (concatenate, hstack, vstack), bölme ve yeniden boyutlandırma işlemleri detaylı örneklerle öğretilir. Farklı dizileri bir araya getirme ve büyük dizileri parçalara ayırma yöntemleri karşılaştırmalı olarak gösterilir. Bu tekniklerin veri analizi ve makine öğrenmesi projelerinde nasıl kullanılabileceği açıklanır. Öğrenci, karmaşık veri yapıları üzerinde daha esnek işlemler yapabilme yeteneği kazanır.', 'uJAUQQqGGkY', 259, 21, false),
  ('31. Numpy Dizilerini Etkili Bölme: Veri İşlemede Ustalaşın', 'Bu derste NumPy dizilerinin etkili bir şekilde nasıl bölüneceği adım adım anlatılır. Veri setlerini alt kümelere ayırarak analiz ve işleme süreçlerinin nasıl hızlandırılabileceği örneklerle gösterilir. Yeni başlayanlardan orta seviye kullanıcılara kadar herkesin anlayabileceği pratik örnekler sunulur. Öğrenci, büyük veri setlerini parçalara bölerek daha verimli çalışma becerisi kazanır.', 'Dp-G2jTPpAs', 277, 22, false),
  ('32. Numpy ile Dizi Düzleştirme: Array Flattening Rehberi', 'Bu derste NumPy kullanarak çok boyutlu dizilerin nasıl tek boyutlu hale getirileceği yani array flattening konusu işlenir. flatten() ve ravel() metotları arasındaki farklar detaylıca karşılaştırılır ve hangi durumda hangisinin tercih edilmesi gerektiği açıklanır. Örneklerle her iki yöntemin bellek kullanımı ve performans açısından farkları gösterilir. Öğrenci, veri düzleştirme işlemlerini doğru yöntemle yapabilme becerisi kazanır.', 'Hj9hIf84ovA', 130, 23, false),
  ('33. Numpy Dizilerine Boyut Ekleme ve Çıkarma: Detaylı Anlatım', 'Bu derste NumPy dizilerine nasıl yeni boyut ekleneceği ve mevcut boyutların nasıl çıkarılacağı adım adım anlatılır. Bu işlemlerin veri manipülasyonu ve makine öğrenmesi uygulamalarındaki kritik önemi pratik örneklerle pekiştirilir. Farklı boyut ekleme ve azaltma yöntemleri karşılaştırmalı olarak gösterilir. Öğrenci, dizilerin boyut yapısını ihtiyaca göre esnek şekilde düzenleme becerisi kazanır.', 'UVuDoW90xbc', 197, 24, false),
  ('34. Numpy Dizilerini Tekrarlama: Etkili Döngü Teknikleri', 'Bu derste NumPy dizileri üzerinde etkili döngü yapma teknikleri öğretilir. Dizileri tekrarlamak için kullanılabilecek farklı yöntemler adım adım incelenir ve karşılaştırılır. Verimli kod yazımı ve hızlı veri işleme için gerekli püf noktaları örneklerle gösterilir. Öğrenci, büyük veri setleri üzerinde performanslı döngü işlemleri yapabilme becerisi kazanır.', 'ubOHMOTb4ic', 562, 25, false),
  ('35. NumPy Kopyalama: Değer ve Referans Farkını Anlama', 'Bu derste NumPy dizilerinde kopyalama işlemleri detaylı şekilde ele alınır. Değer kopyalama (view) ile referans kopyalama (copy) arasındaki temel farklar uygulamalı örneklerle açıklanır. Yanlış kopyalama yönteminin neden hatalara yol açabileceği somut senaryolarla gösterilir. Öğrenci, veri bütünlüğünü koruyarak doğru kopyalama yöntemini seçme becerisi kazanır.', '-Abdb7agjfY', 307, 26, false),
  ('36. Numpy: Koşullu Seçim ve Gelişmiş Filtreleme Teknikleri', 'Bu derste NumPy kullanarak veri setlerinde koşullu seçim ve gelişmiş filtreleme tekniklerinin nasıl yapılacağı öğretilir. Sayısal veriler üzerinde güçlü ve esnek filtreleme yöntemleri örneklerle gösterilir. Bu teknikler sayesinde büyük veri setlerinden istenen kriterlere uyan verilerin nasıl kolayca ayıklanabileceği açıklanır. Öğrenci, veri analizi süreçlerini hızlandıracak koşullu filtreleme becerisi kazanır.', 'P6Hbpwyu988', 650, 27, false),
  ('37. Numpy Dizilerini Sıralama: Verilerinizi Kolayca Düzenleyin', 'Bu derste NumPy kütüphanesi kullanılarak dizilerin nasıl sıralanacağı adım adım anlatılıyor. Farklı sıralama yöntemleri ve fonksiyonları üzerinden veri düzenleme mantığı örneklerle pekiştiriliyor. Öğrenci, tek boyutlu ve çok boyutlu dizilerde sıralama işlemlerini pratik biçimde uygulamayı öğrenecek. Bu beceri, ileride yapılacak veri analizi çalışmalarında verileri düzenli ve anlamlı hale getirmek için temel oluşturuyor.', 'tBosVHYiPYg', 281, 28, false),
  ('38. NumPy ile Lineer Cebir İşlemleri: Temel Fonksiyonlar ve Kullanım', 'Bu videoda NumPy kütüphanesi ile temel lineer cebir işlemlerinin nasıl gerçekleştirileceği anlatılıyor. Matris çarpımı, determinant hesaplama ve ters matris bulma gibi işlemler örneklerle gösteriliyor. Öğrenci, veri bilimi ve makine öğrenmesi projelerinde sıkça kullanılan bu matematiksel işlemleri Python''da nasıl kolayca uygulayacağını öğrenecek. Ders, lineer cebir bilgisini pratiğe dökmek isteyenler için sağlam bir temel sunuyor.', 'm6MZb9_a4cY', 518, 29, false),
  ('39. NumPy ile Özdeğer Hesaplama: Matris Analizine Giriş', 'Bu derste NumPy kullanılarak matrislerin özdeğer ve özvektörlerinin nasıl hesaplanacağı öğretiliyor. Lineer cebirin bu önemli kavramları, pratik kod örnekleriyle adım adım açıklanıyor. Öğrenci, matris analizi yaparken özdeğer hesaplamalarının veri bilimi projelerindeki rolünü kavrayacak. Ders sonunda, bu hesaplamaları kendi projelerinde uygulayabilecek düzeye gelecek.', 'FO6LIt3lppo', 294, 30, false),
  ('40. Numpy Dosya İşlemleri: Verileri Kolayca Kaydetme ve Yükleme', 'Bu videoda NumPy kütüphanesi ile dosya işlemlerinin nasıl yapılacağı detaylı biçimde ele alınıyor. np.save ve np.load fonksiyonları kullanılarak veri setlerinin diske nasıl kaydedileceği ve tekrar nasıl yükleneceği gösteriliyor. Farklı dosya formatlarıyla çalışma yöntemleri de örneklerle açıklanıyor. Öğrenci, veri bilimi projelerinde büyük veri setlerini verimli şekilde saklamayı ve yönetmeyi öğrenecek.', 'z9nI_LIxYKE', 603, 31, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Pandas', 3
  from courses where slug = 'veri-bilimi-ve-makine-ogrenmesi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('50. Pandas Başlangıç Rehberi: Veri Analizi Temelleri (Yeni Başlayanlar İçin)', 'Bu ders, Pandas kütüphanesine sıfırdan başlangıç yapmak isteyenler için hazırlanmış kapsamlı bir giriş niteliğinde. Pandas Series ve DataFrame gibi temel veri yapıları tanıtılıyor ve temel veri manipülasyon işlemleri anlatılıyor. Öğrenci, Python ile veri analizi dünyasına ilk adımını sağlam bir şekilde atacak. Bu bölüm, sonraki Pandas derslerinin temelini oluşturuyor.', 'TLRCG6vi-AM', 536, 1, false),
  ('51. Python Pandas Dataframe ve Series Oluşturma: Adım Adım Rehber', 'Bu videoda Pandas kütüphanesinin temel veri yapıları olan DataFrame ve Series''in nasıl oluşturulacağı adım adım gösteriliyor. NumPy dizilerinden, listelerden ve sözlüklerden bu yapıların nasıl elde edileceği örneklerle açıklanıyor. Öğrenci, veri analizi sürecinde ilk adım olan veri yapılarını oluşturmayı öğrenecek. Ders, Pandas''a yeni başlayanlar için pratik ve anlaşılır bir rehber niteliği taşıyor.', 'WaCgYulRC3E', 387, 2, false),
  ('52. Pandas Dataframe ve Series: Python Kod Açıklaması (52)', 'Bu derste Pandas kütüphanesinin temel yapı taşları olan DataFrame ve Series üzerine yazılan kodlar detaylı biçimde açıklanıyor. Önceki derste oluşturulan yapılar, kod satırı satırı incelenerek pekiştiriliyor. Öğrenci, bu temel veri yapılarının arka planda nasıl çalıştığını daha iyi kavrayacak. Başlangıç seviyesindeki veri bilimcilere yönelik pratik bir uygulama dersi sunuluyor.', 'CkKDZF4jNdM', 610, 3, false),
  ('53. Pandas Veri Yükleme ve Temel İşlemler', 'Bu videoda Pandas kullanılarak veri setlerinin projeye nasıl dahil edileceği ve temel analiz işlemlerinin nasıl yapılacağı anlatılıyor. Veri yükleme, ön izleme ve istatistiksel özet çıkarma gibi işlemler örneklerle gösteriliyor. Öğrenci, bir veri bilimi projesine başlarken izlenmesi gereken temel adımları öğrenecek. Bu ders, veri analizi sürecinin ilk ve en kritik aşamalarını kapsıyor.', 'zrgJBGK7mMY', 637, 4, false),
  ('54. Pandas: SQL Veritabanından Veri Okuma ve Analiz Temelleri', 'Bu derste Pandas kütüphanesi kullanılarak SQL veritabanlarından veri okuma işlemleri anlatılıyor. SQL sorguları yardımıyla verilerin DataFrame yapısına nasıl aktarılacağı adım adım gösteriliyor. Öğrenci, veritabanı kaynaklarından gelen verileri analiz için nasıl hazırlayacağını öğrenecek. Bu beceri, gerçek dünya veri bilimi projelerinde sıkça karşılaşılan bir ihtiyacı karşılıyor.', 'r4FfvVTeHrQ', 330, 5, false),
  ('55. Pandas ile Veri Giriş Çıkışı: Dosya İşlemleri', 'Bu videoda Pandas kütüphanesi ile farklı dosya formatlarından veri okuma ve yazma işlemleri ele alınıyor. CSV, Excel, SQL ve JSON gibi formatlarla veri giriş çıkışı yapmanın yolları detaylı örneklerle gösteriliyor. Öğrenci, farklı veri kaynaklarıyla çalışabilme becerisi kazanacak. Bu ders, veri bilimi projelerinde esnek veri yönetimi için gerekli pratik bilgileri sunuyor.', 'oGldWOIk6K0', 164, 6, false),
  ('56. Kaggle ile Gerçek Dünya Veri Bilimi Örnekleri', 'Bu derste Kaggle platformundaki gerçek dünya veri bilimi projeleri ve uygulama örnekleri inceleniyor. Veri analizi, makine öğrenmesi ve yapay zeka alanlarında kullanılan pratik çözümler öğrenciye tanıtılıyor. Bu sayede öğrenci, teorik bilgilerin gerçek projelerde nasıl uygulandığını görme fırsatı buluyor. Ders, kendi projeleri için ilham almak isteyenlere yol gösterici bir kaynak sunuyor.', 'fNFwOUHctf8', 560, 7, false),
  ('57. Kaggle & Colab Entegrasyonu: Veri Bilimi Akışınızı Güçlendirin', 'Bu videoda Kaggle veri setlerinin ve yarışmalarının Google Colab ortamıyla nasıl entegre edileceği anlatılıyor. Kaggle üzerindeki kodların doğrudan Colab''de çalıştırılması için gerekli adımlar gösteriliyor. Öğrenci, veri bilimi projelerinde kesintisiz ve verimli bir çalışma akışı oluşturmayı öğrenecek. Bu ders, bulut tabanlı araçları etkin kullanarak projelere hız kazandırmayı hedefliyor.', 'a1xirUsreU8', 624, 8, false),
  ('58. Pandas ile Veri Keşfi: head(), tail(), info(), describe() ile Temel Analiz', 'Bu derste, Pandas kütüphanesinin veri keşfi için sunduğu temel fonksiyonları öğreneceksiniz. head() ve tail() ile veri setinin ilk ve son satırlarını görüntülemeyi, info() ile veri tiplerini ve eksik değerleri kontrol etmeyi, describe() ile de sayısal sütunların özet istatistiklerini çıkarmayı öğreneceksiniz. Böylece elinizdeki veri setinin genel yapısını hızlıca kavrayabilecek ve analiz sürecine sağlam bir başlangıç yapabileceksiniz.', 'oSoUByXVD-Y', 685, 9, false),
  ('59. Pandas ile Veri Keşfi: Adım Adım Uygulama Rehberi', 'Bu derste, bir önceki videoda öğrendiğiniz veri keşfi yöntemlerini gerçek bir veri seti üzerinde adım adım uygulayacaksınız. Veri setinin yapısını inceleme, temel istatistikleri yorumlama ve ilk analiz çıkarımlarını yapma sürecini pratik bir uygulamayla pekiştireceksiniz. Amaç, teorik bilgiyi uygulamaya dökerek veri keşfi becerinizi güçlendirmektir.', 'NkurqOBzfgQ', 1086, 10, false),
  ('60. Pandas''ta Veri Filtreleme ve Seçimi: loc ile iloc Farkı', 'Bu videoda Pandas''ta veri seçimi ve filtreleme için kullanılan loc ve iloc metotlarını detaylıca öğreneceksiniz. loc''un etiket bazlı, iloc''un ise konum bazlı seçim yaptığını örneklerle görecek ve aralarındaki temel farkları kavrayacaksınız. Ders sonunda, veri çerçevelerinde istediğiniz satır ve sütunlara doğru yöntemle nasıl erişeceğinizi öğrenmiş olacaksınız.', '_0Uv4s4PcAA', 545, 11, false),
  ('61. Pandas Veri Seçimi ve Filtreleme: Pratik Uygulamalarla Öğrenin', 'Bu derste, Pandas DataFrame''lerinde veri seçimi ve filtreleme konusunu pratik uygulamalarla pekiştireceksiniz. loc ve iloc metotlarının yanı sıra koşullu filtreleme tekniklerini de öğrenerek, veri setinizden belirli kriterlere uyan kayıtları nasıl seçeceğinizi kavrayacaksınız. Bu sayede veri analizi projelerinizde ihtiyaç duyduğunuz verilere hızlı ve doğru şekilde ulaşabileceksiniz.', '4MNCvBcX7tM', 742, 12, false),
  ('62. Pandas''ta Veri Filtreleme: Adım Adım Rehber!', 'Bu videoda Pandas ile veri filtreleme işlemlerini adım adım öğreneceksiniz. Koşullu seçimler, çoklu filtre uygulamaları ile loc ve iloc kullanımını kapsamlı örneklerle inceleyeceksiniz. Ders sonunda, karmaşık filtreleme senaryolarını kendi veri setlerinize uygulayabilecek düzeye geleceksiniz.', 'uKAlNLPjo7w', 336, 13, false),
  ('63. Pandas ile Veri Temizleme ve Hazırlama Teknikleri', 'Bu derste, Pandas kullanarak veri temizleme ve hazırlama tekniklerini öğreneceksiniz. Eksik değerlerin nasıl tespit edilip yönetileceğini, hatalı verilerin nasıl düzeltileceğini ve veri setinin analiz için nasıl hazır hale getirileceğini gerçek örneklerle göreceksiniz. Bu sayede veri kalitesini artırarak daha güvenilir analizler yapabileceksiniz.', 'Vd-dsy2t4f4', 827, 14, false),
  ('64. Pandas ile Veri Temizliği: dropna ve fillna ile Eksik Veri Yönetimi', 'Bu videoda Pandas''ın dropna ve fillna fonksiyonlarını kullanarak eksik veri yönetimini öğreneceksiniz. dropna ile eksik değer içeren satır veya sütunları nasıl kaldıracağınızı, fillna ile de eksik değerleri farklı stratejilerle nasıl dolduracağınızı uygulamalı olarak göreceksiniz. Ders sonunda veri setinizdeki eksik verileri etkili bir şekilde yönetebileceksiniz.', 'sB099S2Ez1I', 721, 15, false),
  ('65. Pandas ile Veri Temizliği: Tekrar Eden Satırları Kolayca Silme', 'Bu derste, veri analizinde sıkça karşılaşılan tekrar eden satır problemini nasıl çözeceğinizi öğreneceksiniz. Pandas''ın drop_duplicates() fonksiyonunu kullanarak veri setinizdeki mükerrer kayıtları hızlı ve etkili bir şekilde tespit edip temizlemeyi göreceksiniz. Bu teknik sayesinde analizlerinizin doğruluğunu ve güvenilirliğini artırabileceksiniz.', 'uqljj8aLRN0', 511, 16, false),
  ('66. Pandas Veri Tipi Dönüşümleri: Etkili ve Hızlı Yöntemler', 'Bu videoda Pandas ile veri tipi dönüşümlerinin nasıl yapıldığını öğreneceksiniz. Sayısal, kategorik ve metinsel verileri doğru veri tiplerine dönüştürmenin veri temizleme ve analiz süreçlerindeki önemini kavrayacaksınız. Pratik örneklerle, veri tipi hatalarını nasıl tespit edip düzelteceğinizi öğreneceksiniz.', 'ZqwZKZCVBgA', 887, 17, false),
  ('67. Pandas Tarih Saat Veri Tipi Dönüşümü ve Uygulamaları - to_datetime', 'Bu derste, Pandas''ın to_datetime fonksiyonu ile tarih ve saat verilerinin nasıl dönüştürüleceğini detaylı bir şekilde öğreneceksiniz. Metin formatındaki tarihleri doğru tarih-saat tipine çevirerek, veri analizi ve makine öğrenmesi projelerinde zaman bazlı verileri doğru şekilde işlemeyi göreceksiniz. Bu beceri, tarih içeren veri setleriyle çalışırken sıkça karşılaşacağınız sorunları çözmenize yardımcı olacaktır.', 'bMzAgk4wslM', 602, 18, false),
  ('68. Veri Birleştirme ve Gruplama: Concat ile Verilerinizi Yönetin!', 'Bu videoda, birden fazla veri setini birleştirme ve gruplama tekniklerini öğreneceksiniz. Özellikle concat fonksiyonunu kullanarak veri setlerini nasıl etkili bir şekilde bir araya getireceğinizi ve gruplama işlemleriyle analiz için nasıl hazırlayacağınızı adım adım göreceksiniz. Bu teknikler, dağınık veri kaynaklarını tek bir yapıda toplamanızı sağlayacak.', 'sM4LeZXIES4', 673, 19, false),
  ('69. Titanic Veri Seti: Pandas Concat ile Veri Birleştirme ve Gruplama', 'Bu derste, Titanic veri seti üzerinden Pandas''ın concat fonksiyonunu kullanarak veri birleştirme ve gruplama işlemlerini pratik olarak öğreneceksiniz. Farklı veri parçalarını nasıl bir araya getireceğinizi ve birleştirilmiş veri üzerinde nasıl gruplama analizleri yapacağınızı adım adım göreceksiniz. Gerçek bir veri seti üzerinde çalışarak öğrendiklerinizi pekiştirme fırsatı bulacaksınız.', 'DjEsBHCUpGU', 398, 20, false),
  ('70. Pandas pd.merge() ile İlişkisel Veri Birleştirme: Kapsamlı Rehber', 'Bu derste Pandas kütüphanesinin pd.merge() fonksiyonu ile iki farklı DataFrame''in nasıl ilişkisel olarak birleştirileceğini öğreneceksiniz. Inner, outer, left ve right join gibi birleştirme türlerinin mantığını ve aralarındaki farkları pratik örneklerle kavrayacaksınız. Gerçek veri setleri üzerinden uygulamalar yaparak, farklı kaynaklardan gelen verileri anlamlı şekilde bir araya getirmeyi öğreneceksiniz. Ders sonunda, veri analizi projelerinizde ilişkisel veri birleştirme işlemlerini rahatlıkla uygulayabilecek seviyeye geleceksiniz.', 'jp2ogGk-5nk', 523, 21, false),
  ('71. Python Pandas: groupby() ile Veri Gruplama ve Agregasyon', 'Bu videoda Pandas''ın groupby() fonksiyonunu kullanarak verileri nasıl gruplandıracağınızı ve gruplar üzerinde toplamsal (agregasyon) işlemler yapacağınızı öğreneceksiniz. Karmaşık veri setlerini kategorilere ayırarak özetlemenin ve anlamlı istatistikler çıkarmanın yollarını adım adım göreceksiniz. Sum, mean, count gibi temel agregasyon fonksiyonlarının groupby ile birlikte nasıl kullanıldığını pratik örneklerle pekiştireceksiniz. Bu sayede büyük veri setlerinden hızlıca içgörü elde etme becerisi kazanacaksınız.', 'qMRFrvVcM7g', 1047, 22, false),
  ('72. Pandas Titanic Veri Seti ile Gruplama ve Toplamsal İşlemler Analizi', 'Bu derste, bilinen Titanic veri seti üzerinden groupby ve toplamsal işlemlerin gerçek bir uygulamasını göreceksiniz. Yolcuların hayatta kalma durumlarına göre gruplanarak, cinsiyet, yaş ve sınıf gibi değişkenler arasındaki gizli ilişkiler keşfedilecek. Veri bilimi tekniklerini kullanarak ham veriden anlamlı sonuçlar çıkarma sürecini adım adım öğreneceksiniz. Bu uygulamalı örnekle, önceki derslerde öğrendiğiniz gruplama mantığını gerçek bir veri seti üzerinde pekiştireceksiniz.', 'wfOypo6u-Rk', 584, 23, false),
  ('73. Excel''de ve Google Sheet ile Pivot Tablo ve Crosstab: Veri Analizine Giriş Rehberi', 'Bu videoda Excel ve Google Sheets kullanarak pivot tablo ve crosstab oluşturmanın temellerini öğreneceksiniz. Büyük veri setlerini özetleyerek anlamlı hale getirmek için bu araçların nasıl kullanılacağını adım adım göreceksiniz. Veri analizi yeteneklerinizi geliştirecek pratik teknikler ve uygulamalı örneklerle konuyu pekiştireceksiniz. Programlama bilmeden de güçlü veri analizleri yapabilmenin yollarını keşfedeceksiniz.', '0wIjebFTdgk', 552, 24, false),
  ('74. Pandas Pivot Tablolar: Veri Analizi İçin Kapsamlı Uygulama', 'Bu derste Pandas kütüphanesi ile pivot tabloların nasıl oluşturulacağını adım adım öğreneceksiniz. Veri setlerini farklı boyutlardan gruplandırma, özetleme ve analiz etme tekniklerini gerçek dünya örnekleriyle uygulayacaksınız. Excel''deki pivot tablo mantığının Python''da nasıl hayata geçirildiğini görerek, kod tabanlı veri analizi becerilerinizi geliştireceksiniz. Ders sonunda karmaşık veri setlerini pivot tablolarla hızlıca özetleyebilecek seviyeye geleceksiniz.', 'V7QRavl5ljc', 430, 25, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

-- pandas-ile-veri-analizi
delete from course_sections where course_id = (select id from courses where slug = 'pandas-ile-veri-analizi');

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Pandas''a Giriş', 1
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('50. Pandas Başlangıç Rehberi: Veri Analizi Temelleri (Yeni Başlayanlar İçin)', 'Bu derste Pandas kütüphanesine sıfırdan giriş yaparak veri analizi yolculuğunuza başlıyorsunuz. Python ile veri biliminin temel taşları olan Series ve DataFrame yapılarını tanıyacak, bu yapılarla temel veri manipülasyonu işlemlerinin nasıl yapıldığını öğreneceksiniz. Ders boyunca, ileride karşılaşacağınız daha karmaşık konulara sağlam bir temel oluşturacak kavramlar ele alınıyor. Yeni başlayanlar için tasarlanan bu bölüm, veri analizi dünyasına güvenli adımlarla girmenizi sağlıyor.', 'TLRCG6vi-AM', 536, 1, true),
  ('51. Python Pandas Dataframe ve Series Oluşturma: Adım Adım Rehber', 'Bu derste Pandas''ın iki temel veri yapısı olan DataFrame ve Series''i adım adım oluşturmayı öğreniyorsunuz. NumPy dizileri, Python listeleri ve sözlükler gibi farklı veri kaynaklarından bu yapıları nasıl kolayca inşa edebileceğinizi pratik örneklerle göreceksiniz. Ders, veri analizine sağlam bir başlangıç yapmanız için gerekli ilk adımları net biçimde anlatıyor. Sonunda, kendi verilerinizi Pandas yapılarına dönüştürebilecek beceriyi kazanmış olacaksınız.', 'WaCgYulRC3E', 387, 2, false),
  ('52. Pandas Dataframe ve Series: Python Kod Açıklaması (52)', 'Bu derste, Pandas kütüphanesinin temel yapı taşları olan DataFrame ve Series üzerine yazılan kodların satır satır açıklamasını buluyorsunuz. Örnekler üzerinden ilerleyerek bu yapıların nasıl çalıştığını ve pratikte nasıl kullanıldığını daha iyi kavrayacaksınız. Özellikle veri bilimine yeni başlayanlar için hazırlanan bu anlatım, teorik bilgiyi uygulamayla pekiştirmenizi sağlıyor. Ders sonunda, DataFrame ve Series kodlarını daha rahat okuyup yazabilir hale geleceksiniz.', 'CkKDZF4jNdM', 610, 3, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Veri Yükleme ve Dosya İşlemleri', 2
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('53. Pandas Veri Yükleme ve Temel İşlemler', 'Bu derste Pandas kullanarak veri setlerini projenize nasıl dahil edeceğinizi ve üzerinde temel analiz işlemlerini nasıl gerçekleştireceğinizi öğreniyorsunuz. Veri yükleme, ilk ön izleme ve istatistiksel özet çıkarma gibi veri bilimi çalışmalarının başlangıç adımları detaylı biçimde ele alınıyor. Böylece bir veri setiyle çalışmaya başlarken izlemeniz gereken temel akışı kavramış olacaksınız. Bu bilgiler, ileride yapacağınız daha derin analizler için sağlam bir zemin oluşturuyor.', 'zrgJBGK7mMY', 637, 1, false),
  ('54. Pandas: SQL Veritabanından Veri Okuma ve Analiz Temelleri', 'Bu derste Pandas kullanarak SQL veritabanlarından veri okuma işlemini adım adım öğreniyorsunuz. SQL sorguları yardımıyla verileri doğrudan DataFrame''lere nasıl aktaracağınızı ve analiz öncesi ön hazırlık sürecini nasıl yürüteceğinizi göreceksiniz. Bu ders, farklı veri kaynaklarıyla çalışabilme becerinizi geliştirerek veri analizi yolculuğunuzda önemli bir adım atmanızı sağlıyor. Sonunda, veritabanı tabanlı verilerle rahatça çalışabilecek bilgiye sahip olacaksınız.', 'r4FfvVTeHrQ', 330, 2, false),
  ('55. Pandas ile Veri Giriş Çıkışı: Dosya İşlemleri', 'Bu derste Pandas ile farklı dosya formatlarından veri okuma ve veri kaydetme işlemlerini öğreniyorsunuz. CSV, Excel, SQL ve JSON gibi yaygın kullanılan formatlarla veri giriş çıkışı işlemlerinin nasıl yapıldığını adım adım göreceksiniz. Bu sayede farklı kaynaklardan gelen verileri projelerinize kolayca entegre edebilecek, analiz sonuçlarınızı da istediğiniz formatta kaydedebileceksiniz. Ders, gerçek dünya projelerinde sıkça ihtiyaç duyulan pratik veri işleme becerilerini kazandırıyor.', 'oGldWOIk6K0', 164, 3, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Kaggle ve Colab Entegrasyonu', 3
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('56. Kaggle ile Gerçek Dünya Veri Bilimi Örnekleri', 'Bu derste Kaggle platformundaki gerçek dünya veri bilimi projelerini inceleyerek pratik uygulama örnekleri görüyorsunuz. Veri analizi, makine öğrenmesi ve yapay zeka alanlarında kullanılan çözümlerin nasıl kurgulandığını keşfedeceksiniz. Bu örnekler, kendi projelerinizi geliştirirken size ilham kaynağı olacak ve gerçek veri setleriyle çalışma tecrübesi kazandıracak. Ders sonunda, Kaggle gibi platformlardan nasıl faydalanabileceğinizi daha net anlamış olacaksınız.', 'fNFwOUHctf8', 560, 1, false),
  ('57. Kaggle & Colab Entegrasyonu: Veri Bilimi Akışınızı Güçlendirin', 'Bu derste Kaggle veri setlerini ve yarışmalarını Google Colab ortamıyla nasıl entegre edeceğinizi öğreniyorsunuz. Kaggle üzerindeki kodları doğrudan Colab''da çalıştırarak veri bilimi iş akışınızı nasıl kesintisiz hale getirebileceğinizi göreceksiniz. Bu entegrasyon sayesinde, veri setlerine erişim ve proje geliştirme sürecinizi çok daha verimli yönetebileceksiniz. Ders, pratik bir iş akışı kurmanıza yardımcı olacak önemli ipuçları sunuyor.', 'a1xirUsreU8', 624, 2, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Veri Keşfi', 4
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('58. Pandas ile Veri Keşfi: head(), tail(), info(), describe() ile Temel Analiz', 'Bu derste Pandas''ın head(), tail(), info() ve describe() gibi temel keşif metotlarını kullanarak veri setlerini hızlıca analiz etmeyi öğreniyorsunuz. Bir veri çerçevesinin yapısını anlamak, veri tiplerini kontrol etmek ve özet istatistiklere ulaşmak için bu metotların nasıl kullanılacağını pratik örneklerle göreceksiniz. Bu temel keşif adımları, herhangi bir veri setiyle çalışmaya başlamadan önce atmanız gereken ilk kritik adımları oluşturuyor. Ders sonunda, veri setlerini hızlıca tanıyıp değerlendirebilecek beceriye sahip olacaksınız.', 'oSoUByXVD-Y', 685, 1, false),
  ('59. Pandas ile Veri Keşfi: Adım Adım Uygulama Rehberi', 'Bu derste, Pandas kullanarak yapılan veri keşfinin temel adımlarını örnek bir uygulama üzerinden uçtan uca görüyorsunuz. Bir veri setini anlamak, ilk temizleme işlemlerini yapmak ve başlangıç analizlerini gerçekleştirmek için gereken pratik bilgileri öğreneceksiniz. Bu uygulamalı yaklaşım, teorik bilgiyi gerçek bir senaryo üzerinde pekiştirmenizi sağlıyor. Ders sonunda, kendi veri setlerinizde benzer bir keşif sürecini rahatlıkla uygulayabileceksiniz.', 'NkurqOBzfgQ', 1086, 2, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Veri Seçimi ve Filtreleme', 5
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('60. Pandas''ta Veri Filtreleme ve Seçimi: loc ile iloc Farkı', 'Bu derste Pandas''ta veri filtreleme ve seçim işlemleri için kullanılan loc ve iloc metotlarını detaylıca öğreniyorsunuz. Bu iki metot arasındaki temel farkları anlayacak ve pratik örneklerle hangi durumda hangisini kullanmanız gerektiğini kavrayacaksınız. Ders, veri setlerinizden istediğiniz satır ve sütunları etkili biçimde seçebilme becerinizi geliştirmenizi hedefliyor. Sonunda, veri filtreleme konusunda daha güvenli ve doğru kararlar verebileceksiniz.', '_0Uv4s4PcAA', 545, 1, false),
  ('61. Pandas Veri Seçimi ve Filtreleme: Pratik Uygulamalarla Öğrenin', 'Bu derste DataFrame''ler üzerinde etkili veri seçimi ve filtreleme yapmayı pratik uygulamalarla öğreniyorsunuz. loc ve iloc metotlarının yanı sıra koşullu filtreleme gibi temel tekniklerin nasıl kullanılacağını örnekler üzerinden göreceksiniz. Bu ders, önceki konuda öğrendiğiniz bilgileri pekiştirerek gerçek veri setleri üzerinde uygulama yapmanızı sağlıyor. Sonunda, ihtiyacınız olan verileri hızlı ve doğru şekilde seçip filtreleyebilecek beceriyi kazanacaksınız.', '4MNCvBcX7tM', 742, 2, false),
  ('62. Pandas''ta Veri Filtreleme: Adım Adım Rehber!', 'Bu derste Pandas kütüphanesi kullanılarak veri çerçevelerinde filtreleme işlemlerinin nasıl yapıldığı adım adım anlatılır. Koşullu seçimler oluşturma, birden fazla koşulu bir arada kullanarak çoklu filtreler uygulama gibi teknikler öğretilir. Ayrıca .loc ve .iloc yapıları arasındaki farklar ve kullanım alanları pratik örneklerle gösterilir. Bu dersin sonunda öğrenci, büyük veri setlerinden istediği kriterlere uygun verileri hızlı ve doğru şekilde seçebilecek beceriyi kazanır.', 'uKAlNLPjo7w', 336, 3, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Veri Temizleme', 6
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('63. Pandas ile Veri Temizleme ve Hazırlama Teknikleri', 'Bu ders, Pandas ile veri temizleme ve analiz öncesi hazırlık sürecine odaklanır. Veri setlerindeki eksik değerlerin nasıl tespit edilip yönetileceği ve hatalı verilerin nasıl düzeltileceği gerçek dünya örnekleriyle anlatılır. Öğrenci, ham verileri analiz için uygun hale getirme sürecinin temel adımlarını kavrar. Ders sonunda, veri kalitesini artırmaya yönelik pratik teknikler edinilmiş olur.', 'Vd-dsy2t4f4', 827, 1, false),
  ('64. Pandas ile Veri Temizliği: dropna ve fillna ile Eksik Veri Yönetimi', 'Bu videoda Pandas''ın dropna ve fillna fonksiyonları kullanılarak eksik verilerin nasıl yönetileceği detaylı biçimde açıklanır. Eksik verilerin satır ya da sütun bazında silinmesi ile belirli değerlerle doldurulması yöntemleri uygulamalı örneklerle gösterilir. Öğrenci, veri kalitesini artırmak için hangi durumda hangi yöntemin tercih edilmesi gerektiğini öğrenir. Bu sayede analiz öncesi veri setleri daha güvenilir hale getirilir.', 'sB099S2Ez1I', 721, 2, false),
  ('65. Pandas ile Veri Temizliği: Tekrar Eden Satırları Kolayca Silme', 'Bu derste veri analizinde sıkça karşılaşılan tekrar eden satır sorunu ele alınır ve bu sorunun Pandas ile nasıl çözüleceği anlatılır. drop_duplicates() fonksiyonunun kullanımı adım adım örneklerle gösterilerek veri setlerindeki mükerrer kayıtların nasıl tespit edilip temizleneceği öğretilir. Öğrenci, bu fonksiyonun farklı parametrelerle nasıl özelleştirilebileceğini de kavrar. Ders sonunda, daha güvenilir ve tutarlı veri setleri oluşturma becerisi kazanılır.', 'uqljj8aLRN0', 511, 3, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Veri Tipi Dönüşümleri', 7
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('66. Pandas Veri Tipi Dönüşümleri: Etkili ve Hızlı Yöntemler', 'Bu ders, Pandas kütüphanesinde veri tiplerinin nasıl dönüştürüleceğini kapsamlı biçimde ele alır. Sayısal, kategorik ve metinsel verilerin doğru veri tiplerine nasıl çevrileceği pratik örneklerle gösterilir. Veri temizleme ve analiz süreçlerinde uygun veri tipi seçiminin neden kritik olduğu vurgulanır. Öğrenci, veri tipi dönüşümlerini etkili ve hızlı biçimde uygulama becerisi kazanır.', 'ZqwZKZCVBgA', 887, 1, false),
  ('67. Pandas Tarih Saat Veri Tipi Dönüşümü ve Uygulamaları - to_datetime', 'Bu derste Pandas''ın to_datetime fonksiyonu kullanılarak tarih ve saat verilerinin dönüşümü detaylı şekilde anlatılır. Farklı formatlardaki tarih verilerinin standart bir tarih-saat tipine nasıl çevrileceği adım adım gösterilir. Veri analizi ve makine öğrenmesi projelerinde tarih verilerinin doğru işlenmesinin önemi vurgulanır. Öğrenci, tarih temelli verilerle çalışırken karşılaşabileceği sorunları çözme becerisi kazanır.', 'bMzAgk4wslM', 602, 2, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Veri Birleştirme ve Gruplama', 8
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('68. Veri Birleştirme ve Gruplama: Concat ile Verilerinizi Yönetin!', 'Bu ders, birden fazla veri setinin concat fonksiyonu ile nasıl birleştirileceğini ve ardından bu verilerin nasıl gruplanacağını öğretir. Veri birleştirme ve gruplama tekniklerinin analiz süreçlerindeki önemi adım adım açıklanır. Öğrenci, farklı kaynaklardan gelen verileri tek bir yapıda toplayarak anlamlı analizler yapmayı öğrenir. Ders sonunda, çoklu veri setleriyle çalışma becerisi pekiştirilir.', 'sM4LeZXIES4', 673, 1, false),
  ('69. Titanic Veri Seti: Pandas Concat ile Veri Birleştirme ve Gruplama', 'Bu derste Titanic veri seti üzerinden Pandas''ın concat fonksiyonu kullanılarak veri birleştirme ve gruplama işlemleri uygulamalı olarak gösterilir. Farklı veri parçalarının nasıl bir araya getirileceği ve birleştirilen verilerin nasıl gruplanacağı somut bir örnek üzerinden anlatılır. Öğrenci, teorik bilgiyi gerçek bir veri seti üzerinde uygulama fırsatı bulur. Bu sayede veri birleştirme ve gruplama konularındaki püf noktaları pekiştirilmiş olur.', 'DjEsBHCUpGU', 398, 2, false),
  ('70. Pandas pd.merge() ile İlişkisel Veri Birleştirme: Kapsamlı Rehber', 'Bu ders, Pandas''ın pd.merge() fonksiyonu ile iki veri çerçevesinin ilişkisel olarak nasıl birleştirileceğini kapsamlı şekilde ele alır. Inner, outer, left ve right join gibi birleştirme türlerinin farkları ve kullanım senaryoları pratik örneklerle açıklanır. Öğrenci, farklı tablolar arasındaki ilişkileri kullanarak veri birleştirme mantığını kavrar. Ders sonunda, veri analizi projelerinde ilişkisel veri birleştirme becerisi kazanılmış olur.', 'jp2ogGk-5nk', 523, 3, false),
  ('71. Python Pandas: groupby() ile Veri Gruplama ve Agregasyon', 'Bu derste Pandas''ın groupby() fonksiyonu kullanılarak verilerin nasıl gruplandırılacağı ve gruplar üzerinde toplamsal işlemlerin nasıl yapılacağı öğretilir. Karmaşık veri setlerini özetleme ve anlamlı sonuçlar çıkarma sürecine odaklanılır. Öğrenci, veriyi belirli kategorilere göre gruplayarak istatistiksel özetler elde etmeyi öğrenir. Bu sayede büyük veri setlerinden hızlı ve etkili çıkarımlar yapma becerisi kazanılır.', 'qMRFrvVcM7g', 1047, 4, false),
  ('72. Pandas Titanic Veri Seti ile Gruplama ve Toplamsal İşlemler Analizi', 'Bu ders, ünlü Titanic veri seti üzerinden gruplama analizinin nasıl yapılacağını uygulamalı olarak gösterir. Hayatta kalan ve kaybolan yolcular arasındaki kalıpların groupby ve toplamsal işlemlerle nasıl ortaya çıkarılacağı adım adım anlatılır. Öğrenci, teorik gruplama bilgisini gerçek bir veri seti üzerinde pekiştirme fırsatı bulur. Ders sonunda, veri içindeki gizli örüntüleri keşfetme becerisi geliştirilmiş olur.', 'wfOypo6u-Rk', 584, 5, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Pivot Tablolar', 9
  from courses where slug = 'pandas-ile-veri-analizi'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('73. Excel''de ve Google Sheet ile Pivot Tablo ve Crosstab: Veri Analizine Giriş Rehberi', 'Bu ders, Excel ve Google Sheets üzerinde pivot tablo ve crosstab oluşturmanın temel adımlarını detaylı biçimde ele alır. Büyük veri setlerini anlamlandırmak için bu araçların nasıl kullanılacağı adım adım gösterilir. Öğrenci, veriyi farklı boyutlarda özetleyerek hızlı analizler yapmayı öğrenir. Bu ders, veri analizine giriş niteliğinde pratik bir temel oluşturur.', '0wIjebFTdgk', 552, 1, false),
  ('74. Pandas Pivot Tablolar: Veri Analizi İçin Kapsamlı Uygulama', 'Bu derste Pandas kütüphanesi ile pivot tablo oluşturma mantığı baştan sona uygulamalı olarak anlatılıyor. Veri setlerini farklı kırılımlara göre gruplandırmayı, özetlemeyi ve çoklu boyutlarla analiz etmeyi öğreneceksiniz. Pivot_table fonksiyonunun parametreleri üzerinden satır, sütun ve değer alanlarının nasıl belirlendiği örneklerle gösteriliyor. Gerçek veri setleri üzerinden yapılan uygulamalarla, karmaşık verileri anlamlı ve okunabilir tablolara dönüştürme becerisi kazanacaksınız. Ders sonunda pivot tabloları kendi veri analizi projelerinizde etkin biçimde kullanabilecek düzeye geleceksiniz.', 'V7QRavl5ljc', 430, 2, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

-- javascript-ile-web-gelistirme
delete from course_sections where course_id = (select id from courses where slug = 'javascript-ile-web-gelistirme');

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Giriş', 1
  from courses where slug = 'javascript-ile-web-gelistirme'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('1. JavaScript Intro - Why should we learn JS?', 'Bu derste JavaScript dünyasına ilk adımı atıyoruz. JavaScript''in ne olduğunu ve web geliştirme sürecinde neden bu kadar önemli bir dil olduğunu öğreniyoruz. Öğrenci, JavaScript''i öğrenmenin kariyerine ve proje geliştirme becerilerine ne gibi katkılar sağlayacağını kavrayacak. Bu giriş dersi, kursun geri kalanına sağlam bir temel oluşturuyor.', 'tEsF8Jk1g4w', 489, 1, true),
  ('2. JavaScript History And How JS Works', 'Bu derste JavaScript''in ortaya çıkış hikayesini ve zaman içindeki gelişimini inceliyoruz. Ayrıca JavaScript motorunun arka planda nasıl çalıştığını, kodun tarayıcı tarafından nasıl yorumlandığını öğreniyoruz. Öğrenci, dilin çalışma mantığını kavrayarak sonraki konulara daha bilinçli bir şekilde hazırlanacak.', 'lcmpWHLkwgc', 955, 2, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Değişkenler', 2
  from courses where slug = 'javascript-ile-web-gelistirme'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('4. JavaScript Variables   Değişken Kavramı', 'Bu derste JavaScript''te değişken kavramını detaylı şekilde ele alıyoruz. Değişkenlerin nasıl tanımlandığını ve bilgisayar belleğinde nasıl saklandığını öğreniyoruz. Stack ve heap bellek yapıları arasındaki farkları örneklerle açıklıyoruz. Öğrenci, bu dersin sonunda değişkenlerin bellekteki davranışını net şekilde anlayacak.', 'cPLU7lT39O8', 535, 1, false),
  ('5. Javascript Variables - Değişken Tanımlama Yöntemleri', 'Bu derste JavaScript''te değişken tanımlamak için kullanılan farklı yöntemleri öğreniyoruz. var, let ve const gibi anahtar kelimelerin temel kullanım şekillerine değiniyoruz. Öğrenci, hangi durumda hangi tanımlama yönteminin tercih edilebileceğine dair pratik bilgi edinecek. Bu ders, değişkenlerle çalışırken doğru alışkanlıklar kazandırmayı amaçlıyor.', 'bInNtOiemBQ', 410, 2, false),
  ('6. JS Variable Rules - Değişken Tanımlama Kuralları', 'Bu derste JavaScript''te değişken tanımlarken uyulması gereken kuralları öğreniyoruz. Geçerli ve geçersiz değişken isimlendirmelerini örneklerle inceliyoruz. Öğrenci, hatasız ve okunabilir kod yazabilmek için gerekli isimlendirme standartlarını öğrenecek. Bu bilgiler, ileride yazılacak tüm JavaScript kodlarının temelini oluşturuyor.', 'M51iySsyDnw', 739, 3, false),
  ('7. JavaScript let and var differences - let ve var kullanımında farklılıklar', 'Bu derste JavaScript''te değişken tanımlamada kullanılan let ve var anahtar kelimeleri arasındaki farkları teorik olarak inceliyoruz. Block scope ve global scope kavramlarının ne anlama geldiğini öğreniyoruz. Ayrıca hoisting kavramına da kısaca değiniyoruz. Öğrenci, bu ders sonunda değişken kapsamlarını doğru şekilde ayırt edebilecek.', 'O0gmA92zGiY', 581, 4, false),
  ('8. JavaScript var, let and  hoisting - Örnek uygulama', 'Bu derste bir önceki derste teorik olarak anlatılan let ve var farklarını uygulamalı örneklerle pekiştiriyoruz. Block scope ve global scope kavramlarını canlı kod örnekleriyle gösteriyoruz. Hoisting kavramının pratikte nasıl işlediğini de örnekler üzerinden inceliyoruz. Öğrenci, teorik bilgiyi kod yazarak deneyimleme fırsatı bulacak.', 'Vf5u2L7Scig', 505, 5, false),
  ('9. JavaScript const variable - Const nedir?', 'Bu derste JavaScript''teki const anahtar kelimesinin ne işe yaradığını ve temel kullanım kurallarını öğreniyoruz. Const ile tanımlanan değişkenlerin diğer değişken türlerinden farkını kavrıyoruz. Öğrenci, sabit değerleri tanımlarken const kullanımının önemini anlayacak. Bu bilgi, güvenli ve öngörülebilir kod yazımı için önemli bir temel oluşturuyor.', 'luOmB-M3gQA', 388, 6, false),
  ('10. JavaScript const example - Const örneği', 'Bu derste bir önceki derste öğrenilen const anahtar kelimesinin kullanımını örnek bir uygulama üzerinden pekiştiriyoruz. Const ile tanımlanan değişkenlerin pratikte nasıl davrandığını görüyoruz. Öğrenci, teorik bilgiyi uygulamalı örnekle destekleyerek daha kalıcı öğrenme sağlayacak. Bu ders, const kullanımını gerçek kod senaryolarında pekiştirmeyi amaçlıyor.', 'JYFlW66xi2I', 384, 7, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Veri Tipleri ve Operatörler', 3
  from courses where slug = 'javascript-ile-web-gelistirme'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('11. JavaScript Data Types - Veri Tipleri', 'Bu derste JavaScript programlama dilindeki temel veri tiplerini öğreniyoruz. String, number, boolean gibi veri tiplerinin özelliklerini ve kullanım alanlarını inceliyoruz. Öğrenci, farklı veri tiplerini tanıyarak değişkenlere doğru değer atamayı öğrenecek. Bu konu, JavaScript''te sağlam bir programlama temeli oluşturmak için kritik öneme sahiptir.', 'bs2pkWo2bLk', 1500, 1, false),
  ('12. JavaScript Operators  - JS Operatörler', 'Bu derste JavaScript''te kullanılan operatörleri öğreniyoruz. Aritmetik, atama, karşılaştırma ve mantıksal operatörlerin ne işe yaradığını inceliyoruz. Öğrenci, bu operatörlerin diğer programlama dillerindeki karşılıklarını da görerek genel bir bakış açısı kazanacak. Bu ders, kod içinde hesaplama ve karşılaştırma işlemleri yapabilmek için temel oluşturuyor.', '6tFF6dapJvY', 507, 2, false),
  ('13. JavaScript Operator Examples - Operatör Kullanımı Örnek', 'Bu derste bir önceki derste öğrenilen JavaScript operatörlerini örnek uygulamalarla pekiştiriyoruz. Aritmetik, karşılaştırma ve mantıksal operatörlerin kod içinde nasıl kullanıldığını görüyoruz. Öğrenci, teorik bilgiyi pratiğe dökerek operatörleri daha iyi kavrayacak. Bu ders, JavaScript''te işlem yapma becerisini güçlendirmeyi amaçlıyor.', 'teVaeqfA5_A', 1059, 3, false),
  ('14. JavaScript Operator Precedence - Operatör Önceliği', 'Bu derste JavaScript''te operatör önceliği (operator precedence) kavramı ele alınıyor. Birden fazla operatörün bir arada kullanıldığı ifadelerde hangi işlemin önce yapılacağını belirleyen kurallar açıklanıyor. Öğrenci, karmaşık ifadelerin JavaScript motoru tarafından nasıl sırayla değerlendirildiğini kavrayarak beklenmedik sonuçlardan kaçınmayı öğrenir. Bu bilgi, doğru ve hatasız kod yazabilmek için temel bir gerekliliktir.', 'uY2OGbcQoBU', 572, 4, false),
  ('15. JavaScript Template Literals - String Literals', 'Bu derste JavaScript''in ES6 ile gelen Template Literals (Şablon Dizgeleri) özelliği anlatılıyor. Geleneksel string birleştirme yöntemlerine kıyasla daha okunabilir ve pratik bir yazım şekli olan bu yapının kullanımı örneklerle gösteriliyor. Değişkenlerin string içine gömülmesi (string interpolation) ve çok satırlı metinlerin nasıl kolayca oluşturulacağı öğretiliyor. Ders sonunda öğrenci, modern JavaScript''te string işlemlerini daha verimli yapabilecek hale gelir.', 'z_WjjVgrzdU', 579, 5, false),
  ('16. JavaScript Type Conversion and Coercion - Tip Dönüşümleri', 'Bu derste JavaScript''teki tip dönüşümü (type conversion) ve tip zorlama (type coercion) kavramları inceleniyor. Bir veri tipinin başka bir veri tipine nasıl açık veya örtük şekilde dönüştürüldüğü örneklerle açıklanıyor. Öğrenci, JavaScript''in arka planda otomatik olarak yaptığı dönüşümleri fark ederek kod davranışını daha iyi öngörebilir hale gelir. Bu konu, tip hatalarından kaynaklanan yaygın hataların önüne geçmek için oldukça önemlidir.', 'x66mD8wdaco', 411, 6, false),
  ('17. Javascript Trutht and Falsy Values And Booelan Logic - Doğru ve Yanlış Kavramı, Boolean Mantığı', 'Bu derste JavaScript''te doğru (truthy) ve yanlış (falsy) değerler kavramı ile Boolean mantığı ele alınıyor. Hangi değerlerin koşul ifadelerinde doğru, hangilerinin yanlış olarak değerlendirildiği örneklerle gösteriliyor. Öğrenci, bu mantığı kavrayarak koşullu ifadeleri daha bilinçli bir şekilde yazabilir hale gelir. Bu bilgi, hataları önlemek ve kod akışını doğru yönetmek için kritik öneme sahiptir.', 'fC0WrolnLD4', 805, 7, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Koşullu İfadeler', 4
  from courses where slug = 'javascript-ile-web-gelistirme'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('18. JavaScript Statements and Expressions - İfadeler', 'Bu derste JavaScript programlamada temel bir ayrım olan Statements (İfadeler) ve Expressions (Deyimler) kavramları öğretiliyor. Bir kod parçasının ne zaman bir işlem gerçekleştiren ifade, ne zaman ise bir değer üreten deyim olduğu açıklanıyor. Öğrenci, bu ayrımı öğrenerek kodun yapısını daha iyi anlayabilir ve doğru sözdizimi kullanabilir hale gelir. Bu kavramlar, ileri seviye JavaScript konularını anlamak için sağlam bir temel oluşturur.', '6y3_WdYEMZg', 247, 1, false),
  ('19. JavaScript Conditional Statements - Koşullu İfadeler', 'Bu derste JavaScript''teki koşullu ifadeler konusu; if-else, ternary operatör ve switch yapıları üzerinden anlatılıyor. Programın farklı koşullara göre farklı davranışlar sergilemesini sağlayan bu yapıların kullanım şekilleri örneklerle gösteriliyor. Öğrenci, hangi durumda hangi koşul yapısının tercih edilmesi gerektiğini öğrenir. Bu ders, akış kontrolü mantığını kavramak açısından oldukça önemlidir.', 'LsTaNXgsUEE', 534, 2, false),
  ('20. JavaScript If Else and Ternary Example - Örnek Uygulama', 'Bu derste bir önceki derste öğrenilen if-else ve ternary operatör konuları pratik bir uygulama üzerinden pekiştiriliyor. Gerçek bir örnek üzerinden koşullu ifadelerin nasıl kullanılacağı adım adım gösteriliyor. Öğrenci, teorik bilgiyi uygulamaya dökerek konuyu daha kalıcı şekilde öğrenir. Bu uygulama, koşullu mantığı gerçek senaryolarda kullanma becerisi kazandırır.', 'tz-mZzbU2SE', 653, 3, false),
  ('21. JavaScript Switch Case Statement - Örnek Uygulama', 'Bu derste JavaScript''in switch case yapısı örnek bir uygulama üzerinden anlatılıyor. Birden fazla koşulu kontrol etmek için switch yapısının nasıl pratik şekilde kullanılacağı gösteriliyor. Öğrenci, if-else zincirlerine alternatif olarak switch case yapısını ne zaman ve nasıl kullanacağını öğrenir. Bu uygulama, kod okunabilirliğini artıran alternatif çözümler geliştirme becerisi kazandırır.', '5PnASNaLQx4', 1339, 4, false),
  ('22 . JavaScript Use Strict', 'Bu derste JavaScript''e ES5 ile eklenen ''use strict'' modu tanıtılıyor. Bu modun kodun daha güvenli ve hatasız yazılmasını nasıl sağladığı, hangi yaygın hataları engellediği açıklanıyor. Öğrenci, modern JavaScript geliştirme pratiklerinden biri olan strict mode''u projelerinde nasıl aktif edeceğini öğrenir. Bu bilgi, daha temiz ve güvenilir kod yazma alışkanlığı kazandırır.', 'G7Lv83QHegg', 562, 5, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Fonksiyonlar', 5
  from courses where slug = 'javascript-ile-web-gelistirme'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('23. JavaScript Functions - Fonksiyonlar', 'Bu derste JavaScript''in en temel ve önemli konularından biri olan fonksiyonlar (functions) kavramı anlatılıyor. Fonksiyonların nasıl tanımlandığı, parametre alıp değer döndürdüğü ve kod tekrarını önlemede nasıl kullanıldığı açıklanıyor. Öğrenci, kodu modüler ve yeniden kullanılabilir parçalara ayırmayı öğrenir. Bu konu, JavaScript''te ileri seviye yapılar öğrenmeden önce mutlaka kavranması gereken bir temeldir.', 'hxaGN1M7c7E', 483, 1, false),
  ('24. JavaScript Functions 2 - Fonksiyonlar Uygulama', 'Bu derste önceki derste öğrenilen fonksiyon kavramı pratik bir uygulama ile pekiştiriliyor. Gerçek örnekler üzerinden fonksiyonların nasıl tanımlanıp çağrılacağı adım adım gösteriliyor. Öğrenci, teorik bilgiyi uygulamaya geçirerek fonksiyon kullanımını daha iyi kavrar. Bu uygulama, fonksiyonlarla ilgili öğrenilenleri gerçek senaryolarda pekiştirme fırsatı sunar.', 'VcOKcw7Wf2U', 979, 2, false),
  ('25. JavaScript Function Declaration vs  Expressions', 'Bu derste JavaScript''te fonksiyon tanımlamanın iki farklı yolu olan Function Declaration ve Function Expression kavramları karşılaştırmalı olarak anlatılıyor. Bu iki yapı arasındaki syntax ve davranış farkları örneklerle gösteriliyor. Öğrenci, hangi durumda hangi yöntemi tercih etmesi gerektiğini anlayarak daha bilinçli kod yazabilir hale gelir. Bu konu, JavaScript''te fonksiyonların derinlemesine anlaşılması için önemli bir adımdır.', 'RwcuKSms__w', 754, 3, false),
  ('26. JavaScript Arrow Functions - Ok Fonksiyonu', 'Bu derste JavaScript''in ES6 sürümüyle birlikte gelen önemli bir özelliği olan Arrow Function yani ok fonksiyonu kavramını öğreniyoruz. Klasik fonksiyon tanımlama yöntemleriyle ok fonksiyonları arasındaki farkları inceleyerek, bu yeni sözdiziminin kod yazımını nasıl daha kısa ve okunaklı hale getirdiğini görüyoruz. Ayrıca ok fonksiyonlarının hangi durumlarda tercih edildiğini ve temel kullanım mantığını adım adım ele alıyoruz. Ders sonunda, modern JavaScript kodlarında sıkça karşılaşacağınız bu yapıyı rahatlıkla tanıyıp kullanabilecek seviyeye geleceksiniz.', 'g6IcxG7qVc8', 1034, 4, false),
  ('27. JavaScript Arrow Functions Example - Örnek Uygulama', 'Bu derste bir önceki videoda öğrendiğimiz Arrow Function yapısını pekiştirmek amacıyla pratik bir örnek üzerinden çalışıyoruz. Ok fonksiyonlarının gerçek bir uygulamada nasıl yazıldığını ve kullanıldığını canlı kod örnekleriyle adım adım gösteriyoruz. Bu sayede teorik bilgiyi uygulamaya dökerek, ok fonksiyonlarının söz dizimini daha iyi kavramanızı sağlıyoruz. Dersin sonunda kendi projelerinizde Arrow Function''ları özgüvenle kullanabilecek pratik deneyimi kazanmış olacaksınız.', 'C04bVo5f9EE', 591, 5, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

-- 10-video-ile-java-ogren
delete from course_sections where course_id = (select id from courses where slug = '10-video-ile-java-ogren');

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Giriş', 1
  from courses where slug = '10-video-ile-java-ogren'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('1. Java Nedir ve Nasıl Çalışır?', 'Bu derste Java programlama dilinin ne olduğunu ve temel çalışma prensiplerini öğreniyoruz. Java''nın neden bu kadar yaygın kullanıldığını ve diğer dillerden farklarını ele alıyoruz. Ayrıca Java''nın platform bağımsızlığını sağlayan JVM (Java Virtual Machine) kavramına giriş yapıyoruz. Bu video, Java dünyasına adım atacaklar için sağlam bir temel oluşturuyor.', 'wsHCD4QYuts', 550, 1, true),
  ('2 . Java Çalışma Mantığı', 'Bu derste bir Java kaynak kod dosyasının derleyici tarafından nasıl işlendiğini adım adım uygulamalı olarak inceliyoruz. Kodun yazılmasından çalıştırılmasına kadar geçen süreci, yani derleme (compile) ve çalıştırma (run) aşamalarını görüyoruz. Java derleyicisinin kaynak kodu byte code''a nasıl dönüştürdüğünü öğreniyoruz. Bu sayede Java programlarının arka planda nasıl işlediğini kavramış oluyoruz.', 'pnQb0aJrd9A', 1450, 2, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);

with new_section as (
  insert into course_sections (id, course_id, title, order_index)
  select gen_random_uuid(), id, 'Java Temelleri', 2
  from courses where slug = '10-video-ile-java-ogren'
  returning id
)
insert into lessons (section_id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)
select ns.id, v.title, v.description, v.youtube_video_id, v.duration_seconds, v.order_index, v.is_preview
from new_section ns,
(
  values
  ('3. Java Versiyonları ve Kod Yapısı', 'Bu derste Java''nın farklı versiyonlarını ve zaman içindeki gelişimini inceliyoruz. Java kodunun temel yapı taşlarını ve bir Java programının nasıl organize edildiğini öğreniyoruz. Sınıf yapısı, main metodu gibi temel kod bileşenlerine değiniyoruz. Bu bilgiler, ileride yazacağımız Java programlarının temelini oluşturacak.', 'MD6L2D_pAxQ', 1656, 1, false),
  ('4. Java Veri Tipleri', 'Bu derste Java''da kullanılan veri tiplerini detaylı şekilde öğreniyoruz. Tamsayı, ondalıklı sayı, karakter ve mantıksal (boolean) gibi temel veri tiplerinin özelliklerini ve kullanım alanlarını inceliyoruz. Her veri tipinin bellekte nasıl yer kapladığını ve hangi durumlarda tercih edilmesi gerektiğini kavrıyoruz. Bu ders, Java''da değişken tanımlama ve veri yönetimi konularına sağlam bir temel oluşturuyor.', 'iLt2-liNMu8', 625, 2, false)
) as v(title, description, youtube_video_id, duration_seconds, order_index, is_preview);
