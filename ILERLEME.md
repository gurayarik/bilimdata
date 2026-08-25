# BilimData Platformu — İlerleme Durumu

Bu dosya, `CLAUDE.md`'deki roadmap'e göre şu ana kadar tamamlanan işleri özetler. Her yeni faz bitiminde güncellenir.

---

## Faz 0 — Altyapı ✅

- **Frontend:** Angular 19 (standalone, strict TS) — `frontend/`. Node 20 uyumluluğu nedeniyle Angular 19 seçildi (CLAUDE.md'nin "17+" şartını karşılıyor).
- **Backend:** FastAPI iskeleti — `backend/app/` (`core/`, `routers/`, `services/`, `models/`). Proje-özel `.venv` ile çalışıyor.
- **Supabase:** `supabase/migrations/0001_init.sql` — tüm tablolar (`profiles`, `instructors`, `categories`, `courses`, `course_sections`, `lessons`, `enrollments`, `lesson_progress`, `coupons`, `reviews`, `blog_posts`, `certificates`), RLS politikaları, `on_auth_user_created` trigger'ı.
- `0002_grants.sql` — `service_role`/`authenticated`/`anon` rollerine eksik kalan tablo yetkilerini verdi (bu projede varsayılan olarak gelmemişti).
- `.env` dosyaları gerçek Supabase/YouTube/Anthropic key'leriyle dolduruldu ve doğrulandı.

## Faz 1 — Auth ✅

- Google OAuth + email/password girişi `SupabaseService` üzerinden çalışıyor.
- **Kritik düzeltme:** Bu Supabase projesi JWT'leri artık asimetrik anahtarla (ES256) imzalıyor; backend JWKS üzerinden doğrulamaya geçirildi (`backend/app/core/security.py`), legacy HS256 secret fallback olarak bırakıldı.
- **Kritik düzeltme:** Sunucu saat farkı (Supabase ile yerel makine arası ~13sn) nedeniyle PyJWT'nin `iat` kontrolü token'ları reddediyordu; `leeway=30` eklendi.
- `0003_fix_new_user_trigger.sql` — `on_auth_user_created` trigger'ı bazı projelerde sessizce oluşmadığı için idempotent şekilde yeniden garanti edildi.
- Rol kontrolü artık JWT metadata'sından değil, `profiles` tablosundan okunuyor (`GET /profiles/me`, `PATCH /profiles/me`).
- Google girişi sonrası otomatik `/dashboard` yönlendirmesi (`app.component.ts`, `authEvent$`).

## Faz 1.5 — i18n Altyapısı ✅

- `@ngx-translate/core` + `@ngx-translate/http-loader` kuruldu, TR (varsayılan) + EN.
- Dil seçici (`shared/components/language-switcher`), seçim `localStorage`'da saklanıyor.
- **Not:** Angular 19'da statik varlıklar `src/assets/` değil `public/` klasöründen sunuluyor — i18n JSON'ları `frontend/public/assets/i18n/` altına taşındı.

## Faz 2 — Anasayfa & Katalog ✅

- **Tailwind CSS v4** eklendi (`postcss.config.json`, `styles.scss` içinde `@theme` ile marka renkleri: `brand-900` lacivert, `accent-500` amber).
- Paylaşılan bileşenler: `header` (nav, dil seçici, auth-durumuna duyarlı CTA), `footer`, `course-card`, `cta-button`.
- Gerçek anasayfa: Hero, kategori kartları, "Neden Biz?", öne çıkan kurslar, öğrenci avantajları.
- `/courses` katalog sayfası + kategori filtreleme.
- Backend: `GET /categories` endpoint'i eklendi.
- `0004_seed_data.sql` — ilk (uydurma) kategori/kurs verisi (sonradan Faz 3'te gerçek verilerle değiştirildi).

## Faz 3 — Kurs Detay & Player ✅

- Kullanıcının gerçek YouTube kanalı (`@bilimdata`, YouTube Data API ile sorgulandı) temel alındı.
- 4 gerçek kurs oluşturuldu (120 ders toplam):
  - **Veri Bilimi ve Makine Öğrenmesi** (65 ders) → Giriş / NumPy / Pandas bölümleri
  - **Pandas ile Veri Analizi** (25 ders) → 9 konu bazlı bölüm
  - **JavaScript ile Web Geliştirme** (26 ders) → 5 bölüm
  - **10 Video ile Java Öğren** (4 ders) → 2 bölüm
- **AI entegrasyonu (Anthropic Claude):** Her kurs için SEO odaklı 150-250 kelimelik detaylı açıklama + kısa özet; her ders için 3-5 cümlelik özet açıklama. Video başlıkları YouTube playlist sırası yerine başlıklardaki gerçek numaralara göre AI tarafından doğru pedagojik sıraya ve mantıklı bölümlere (modüllere) ayrıldı.
- `lessons` tablosuna `description` kolonu eklendi (`0006_lesson_description.sql`).
- Migration'lar: `0005_real_courses.sql` (ilk gerçek veri, tek bölüm/yanlış sıra) → `0007_reorganize_lessons.sql` (doğru bölüm/sıra/açıklamalarla yeniden yapılandırma).
- Backend: `GET /courses/{slug}/curriculum` (bölüm+ders listesi, video ID sızdırmadan), `CourseOut`'a `instructor` nested alanı eklendi.
- Frontend: `course-detail` (müfredat, eğitmen kartı, kayıt CTA'sı), `course-player` (YouTube embed, 401/403 durumlarına göre giriş/satın-al mesajı).
- Erişim kontrolü (önizleme herkese açık, kilitli dersler yalnızca kayıtlı kullanıcıya) uçtan uca test edildi.
- **Yan düzeltme:** `ai_service.py`'de Claude'un "thinking" bloğu nedeniyle `content[0]` her zaman metin olmuyordu; `type == "text"` olan bloğu bulacak şekilde düzeltildi (hem seed script'inde hem backend'de).

## Udemy Kurs Entegrasyonu (Faz 4 öncesi ek) ✅

- Kullanıcının bazı eğitimleri Udemy'de kupon karşılığı satılıyor (bazıları ücretsiz, bazıları indirimli). Bunlar platformda kendi kurs sayfamızda (SEO değeri için) ama müfredat listelemeden gösteriliyor; CTA doğrudan Udemy'ye yönlendiriyor.
- **Şema:** `courses` tablosuna `provider` ('internal' | 'udemy'), `external_url`, `coupon_code` kolonları eklendi (`0008_udemy_courses.sql`). Udemy kursları için `course_sections`/`lessons` satırı oluşturulmuyor.
- `instructors.bio`/`title`, kullanıcının paylaştığı gerçek Udemy eğitmen profiliyle güncellendi (`0009_instructor_bio.sql`) — Dr. Güray Arık, Hacettepe Üniversitesi doktora, ~20 yıl deneyim.
- 3 gerçek Udemy kursu eklendi (`0010_udemy_courses_seed.sql`):
  - **Python Eğitimi: Sıfırdan İleri Seviyeye** — 1299₺ → 199₺ (kupon: `CP260817G2`)
  - **Güvenli Yazılım Geliştirme ve Kodlama** — ücretsiz
  - **Machine Learning Interview Refresher** — ücretsiz, İngilizce içerik
  - (Not: "HTML5 Öğren" kursu kullanıcı isteğiyle kapsam dışı bırakıldı.)
- Backend: `CourseOut`'a `provider`/`external_url`/`coupon_code` eklendi (mevcut `select("*")` sayesinde router değişikliği gerekmedi).
- Frontend: `course-card`'da Udemy rozeti + "Ücretsiz" etiketi; `course-detail`'de `provider==='udemy'` durumunda iç kayıt akışı yerine "Udemy'de Satın Al/Ücretsiz Al" CTA'sı (yeni sekmede `external_url`'e gider) + kupon notu; müfredat bölümü Udemy kurslarında (section yoksa) hiç gösterilmiyor; anasayfaya ayrı bir **"Udemy Eğitimlerimiz"** bölümü eklendi.

## Faz 4 — Erişim Kontrolü & Kayıt & Admin Paneli ✅

- **Backend:** `backend/app/models/admin.py` (Create/Update Pydantic modelleri) + `admin.py` router tamamen genişletildi:
  - Kurs: `GET/POST/PUT/DELETE /admin/courses` (Udemy alanları dahil).
  - Bölüm: `GET/POST /admin/courses/{id}/sections`, `PUT/DELETE /admin/sections/{id}`.
  - Ders: `POST /admin/sections/{id}/lessons`, `PUT/DELETE /admin/lessons/{id}`.
  - Blog: `GET/POST/PUT/DELETE /admin/blog`.
  - `GET /admin/instructors` (dropdown için).
  - Enrollment onayı (`GET /admin/enrollments/pending`, `PUT .../approve`) genişletildi — artık kurs başlığı ve kullanıcı adını da join'li döndürüyor.
  - Tüm endpoint'ler `require_admin` ile korunuyor; uçtan uca test edildi (create→list→update→delete akışı, cascade silme, 401/403 kontrolü).
- **Frontend:** `core/services/admin.service.ts`, `core/guards/admin.guard.ts` (rol kontrolü, backend zaten korunuyor — bu ikinci savunma katmanı), `features/admin/shared/admin-nav.component.ts` (sekme navigasyonu).
  - `course-editor`, `lesson-editor` (kurs seç → bölüm/ders ağacı, satır içi ekle/sil), `blog-editor`, `enrollment-approval` — hepsi gerçek CRUD işlevselliğiyle dolduruldu (placeholder'lar kaldırıldı).
- **Test için:** `arikguray@gmail.com` hesabının `profiles.role` alanı elle `'admin'` yapıldı (`d0b6f880-8301-4f17-b734-b86956dbf353`).
- **Kritik düzeltme — enrollment/erişim mantığı:** `POST /enrollments` daha önce kursun fiyatına bakmaksızın her zaman `payment_status='free'` atıyordu; `free` ise erişim kontrolünde (`lessons.py`/`deps.py`) tam erişim veren statülerden biri olduğu için **ücretli kurslara bile ödemesiz anında tam erişim** veriliyordu. Düzeltildi: kurs gerçekten ücretsizse (`price`/`discount_price` = 0) `free` statüsüyle anında erişim; ücretliyse `pending` statüsüyle oluşturulur ve admin panelden (banka havalesi vb. harici bir doğrulamayla) onaylanana kadar derslere erişim açılmaz. Tekrar kayıt denemesi mevcut statüyü geriye düşürmüyor. `GET /admin/enrollments/pending` filtresi de `free`'den `pending`'e çevrildi. Bu hata nedeniyle oluşmuş 2 test kaydı ve 4 gerçek kursun yanlış sıfırlanmış `discount_price` değeri elle düzeltildi.

## Çoklu Eğitmen Başvuru/Onay Sistemi + Ders Kaynağı Yükleme ✅

CLAUDE.md v1'de "çoklu eğitmen marketplace modeli yok" diyordu; kullanıcı bilinçli olarak bu kapsamı genişletti. Video yükleme tarafında tam otomasyon (YouTube'a relay + kanal editör daveti) teknik olarak mümkün olmadığından (YouTube Data API'de kanal yöneticisi ekleme endpoint'i yok, video upload OAuth + Google'ın "hassas kapsam" doğrulamasını gerektirir) basitleştirilmiş bir model uygulandı: eğitmen videosunu kendi YouTube Studio'sunda yükler (siz elle editör daveti gönderdikten sonra), platforma yalnızca **video ID** girilir; PDF/slayt materyalleri ise doğrudan **Supabase Storage**'a yüklenir.

- **Şema:** `instructor_applications` tablosu (`0011`) + `lesson-resources` Storage bucket'ı (`0012`).
- **Backend:** `require_instructor_or_admin` + `get_instructor_id_for_user` (`core/security.py`); `POST/GET /instructor-applications` (kullanıcı başvurusu, KVKK onayı zorunlu); admin'de `GET/PUT /admin/instructor-applications/{id}/approve|reject` (onayda `instructors` satırı otomatik oluşturulur/eşleştirilir, `profiles.role='instructor'` yapılır, yanıtta "kanala editör ekle" hatırlatması + kullanıcı e-postası döner); yeni `routers/instructor.py` — eğitmenin **yalnızca kendi** kurs/bölüm/ders'lerini yönetebildiği tam CRUD (sahiplik her yazma işleminde doğrulanıyor, başka eğitmenin kaydına 403); `services/storage_service.py` ile PDF/slayt yükleme (hem `/admin/lessons/{id}/resources` hem `/instructor/lessons/{id}/resources`).
- **Frontend:** `/become-instructor` başvuru sayfası (KVKK metni + onay kutusu + durum gösterimi), admin panelinde yeni "Eğitmen Başvuruları" sekmesi, `/instructor/courses` ve `/instructor/lessons` (kendi kurs/ders yönetimi + dosya yükleme input'u + kaynak listesi/silme), dashboard'da role göre "Eğitmen Ol" / "Eğitmen Panelim" CTA'sı.
- **Düzeltilen bug:** `instructor_applications` tablosunun `profiles`'a iki farklı FK'si olduğu için (`user_id`, `reviewed_by`) PostgREST embed sorgusu belirsizlik hatası veriyordu; `profiles!instructor_applications_user_id_fkey` ile FK adı açıkça belirtilerek çözüldü.
- Uçtan uca test edildi: başvuru → admin onayı → rol değişimi → kendi kurs oluşturma → başka eğitmenin erişememesi (403) → PDF yükleyip `lessons.resources`'a kalıcı olarak eklenmesi.

## Faz 6 — Blog Modülü ✅

- `blog.service.ts` + `blog-list`/`blog-detail` sayfaları placeholder'dan gerçek içeriğe geçirildi (kart grid, kapak görseli, kategori/etiket, tarih, tam içerik).
- Header'a "Blog" nav linki eklendi.
- Kullanıcı isteğiyle 3 gerçek, detaylı blog yazısı yazılıp yayınlandı (samimi/mentor tonunda, veri bilimi temalı): "Veri Bilimciliğe Nasıl Başlanır?", "Pandas mı NumPy mı?", "Makine Öğrenmesi Projelerinde Sık Yapılan 7 Hata".

## Faz 7 — AI Özetleme ✅

- `POST /blog/{id}/summarize` (Faz 0'dan beri var olan iskelet) uçtan uca test edildi ve 3 mevcut yazı için gerçekten çalıştırılıp `ai_summary` alanları dolduruldu.
- **Düzeltme:** `ai_service.py`'de `httpx.AsyncClient()` varsayılan timeout'u (5sn) Claude çağrıları için yetersizdi (`ReadTimeout`); `timeout=60` eklendi.
- Frontend `blog-detail`'de AI özeti, vurgulu bir kutuda gösteriliyor.
- Admin blog-editor'a "AI ile Özetle" butonu eklendi (`admin.service.ts: summarizeBlogPost`).

## Blog Etkileşimi (Yorum/Beğeni) + Kullanıcı Blog Yazıları ✅ (plan dışı ek)

Kullanıcı kararı: blog yazıları interaktif olsun (yorum + beğeni) ve **giriş yapmış herhangi bir kullanıcı** kendi yazısını gönderebilsin — ama **admin onayından geçmeden yayınlanmasın** (spam/kalite kontrolü).

- **Şema (`0013_blog_comments_likes.sql`):** `blog_comments`, `blog_likes` (`unique(post_id,user_id)` ile toggle-uyumlu) — RLS ile herkes okuyabilir, kullanıcı yalnızca kendi kaydını ekleyip silebilir.
- **Backend (`routers/blog.py` genişletmesi):** `GET/POST /blog/{post_id}/comments`, `DELETE /blog/comments/{id}` (kendi yorumu veya admin), `GET /blog/{post_id}/likes` (`{count, liked_by_me}`), `POST /blog/{post_id}/like` (toggle), `GET/POST /blog/my-posts` (kullanıcı kendi yazısını **her zaman `is_published=false`, `author_id=kendisi`** ile gönderir — payload'da ne gelirse gelsin bu iki alan zorlanıyor). `admin.py`'deki `list_blog_posts`'a yazar adı join'i eklendi.
- **Frontend:** `blog-detail`'de kalp ikonlu beğeni butonu (giriş yoksa login'e yönlendirir) + yorum listesi/formu; yeni `/blog/write` sayfası (form + "yazılarım" durum listesi); `blog-list`'te giriş yapmışsa "Yazı Yaz" linki; admin blog-editor'da yazar sütunu + "Taslak/Onay Bekliyor" rozeti.
- Uçtan uca test edildi: yorum ekle/sil (admin başkasının yorumunu silebiliyor), beğeni aç/kapa toggle, kullanıcı yazısı gönder → genel listede görünmüyor → admin onaylar → genel listede beliriyor.

## `/blog/write` Sayfası Yeniden Tasarımı ✅ (plan dışı ek)

Kullanıcı isteğiyle yazı gönderme deneyimi zenginleştirildi: kapak görseli yükleme, video linki paylaşma, ve zengin metin editörü.

- **Şema (`0014_blog_video_and_images.sql`):** `blog_posts.video_url` kolonu + `blog-images` Storage bucket'ı.
- **Backend:** `storage_service.py`'ye `upload_blog_image()` eklendi; `POST /blog/upload-image` (giriş gerektirir) endpoint'i; `UserBlogPostCreate`/`AdminBlogPostCreate`/`AdminBlogPostUpdate` modellerine `video_url` eklendi.
- **Frontend:** Harici kütüphane eklemeden, native `contenteditable` + `document.execCommand` tabanlı yeniden kullanılabilir `shared/components/rich-text-editor/` bileşeni (Bold/İtalik/H2/Liste/Link araç çubuğu, `ControlValueAccessor` ile `ngModel` uyumlu — içerik HTML olarak saklanıyor). `/blog/write` sayfası tamamen yeniden tasarlandı: kart görünümlü form, sürükle-bırak benzeri tıkla-yükle kapak görseli alanı (yüklenince önizleme + kaldır butonu), video linki alanı, zengin metin editörü. `blog-detail`'de içerik artık `[innerHTML]` ile render ediliyor (Angular'ın varsayılan sanitizer'ı XSS'e karşı koruma sağlıyor) ve `video_url` varsa YouTube linkinden otomatik ID çıkarılıp gömülü oynatıcı gösteriliyor (YouTube değilse düz "Videoyu İzle" linki). Admin blog-editor'a da `video_url` alanı eklendi (parite).
- Uçtan uca test edildi: görsel yükleme → gerçek Storage URL'i dönüyor, video linkli + HTML içerikli yazı oluşturma çalışıyor.

---

## Genel Notlar / Ortam

- Backend Python bağımlılıkları proje-özel `.venv` içinde (`backend/.venv`) — global Python'a kurulmuyor.
- Geliştirme sunucuları: `uvicorn app.main:app --port 8000` (backend), `ng serve --port 4200` (frontend).
- Supabase migration'ları sırayla (`0001` → `0014`) SQL Editor'de elle çalıştırılıyor (proje CLI kurulu değil).

## Commit Durumu

⚠️ Faz 6/7 + blog etkileşim/kullanıcı yazıları + `/blog/write` yeniden tasarımı henüz commit edilmedi. Son commit hâlâ `14f9ce7`.

## Şu Anda Neredeyiz / Sırada Ne Var

Tamamlanan: **Faz 0 → Faz 4, Faz 6, Faz 7** + dört plan dışı ek (Udemy entegrasyonu, çoklu eğitmen sistemi, blog etkileşim/kullanıcı yazıları, zengin metin editörlü `/blog/write`). CLAUDE.md roadmap'ine göre kalanlar:

- **Faz 5 — Ödeme Entegrasyonu:** v1 kapsamı dışında bırakıldı (bilinçli karar — manuel/pending onay akışı bunun yerine kullanılıyor). Gerçek Iyzico/Stripe entegrasyonu v2'de.
- **Faz 8 — Kullanıcı Paneli, Sertifika & Yorumlar:** İlerleme takibi (`lesson_progress` tablosu var ama hiç kullanılmıyor), sertifika üretimi (`certificate_service.py` iskeleti Faz 0'dan beri var, hiç tetiklenmedi/test edilmedi), **kurs** yorumları/değerlendirme (`reviews` tablosu var, backend endpoint'i var ama frontend'de hiç UI yok — blog yorumlarından farklı, kurs sayfası için).

Bir sonraki oturumda önce commit atılmalı, sonra kullanıcıyla Faz 8'e mi geçileceği netleştirilecek.
