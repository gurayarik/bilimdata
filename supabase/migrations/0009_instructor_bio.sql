-- Eğitmen bio'su, Udemy eğitmen profilindeki gerçek bilgilerle güncellenir.

update instructors
set
  title = 'Dr. Güray Arık',
  bio = 'Dr. Güray Arık, yazılım geliştirme ve makine öğrenmesi alanlarında yaklaşık 20 yıllık deneyime sahip bir uzmandır. Hacettepe Üniversitesi''nden Bilgisayar ve Öğretim Teknolojileri alanında doktora derecesine sahiptir. Bir vakıf üniversitesinde yazılım programlama, veritabanı ve makine öğrenmesi dersleri vermekte, öğrencilerin teknoloji sektöründe ihtiyaç duyacağı temel becerileri kazanmalarına katkı sağlamayı hedeflemektedir.'
where title = 'Kurucu Eğitmen';
