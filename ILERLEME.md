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

## Faz 8 — Kullanıcı Paneli, Sertifika & Kurs Değerlendirmeleri

Şema/servis iskeleti (`lesson_progress`, `reviews`, `certificates` tabloları + `certificate_service.py`) Faz 0'dan beri vardı ama hiç uçtan uca bağlanmamıştı. Bu fazda:

- **Backend — İlerleme takibi:** `POST /lessons/{lesson_id}/progress` (`backend/app/routers/lessons.py`) eklendi — aynı erişim kontrolünü (preview/login/enrollment) uygulayıp `lesson_progress` tablosuna upsert yapıyor, ardından kursun toplam ders sayısına göre `enrollments.progress_percent`'i yeniden hesaplayıp güncelliyor. `GET /courses/{slug}/my-progress` (`routers/courses.py`) eklendi — giriş yapmış kullanıcı için tamamlanan ders ID'leri + yüzde döner (course-player ve dashboard için tek kaynak).
- **Backend — Enrollment:** `GET /enrollments/me` artık `courses(title, slug, cover_image_url)` embed ediyor (`EnrollmentOut.course` alanı) — dashboard'da kurs kartları için ayrı bir istek gerekmiyor.
- **Backend — Reviews:** `reviews.py` yeniden yazıldı: `POST /reviews` artık kullanıcının kursa kayıtlı (paid/free/coupon) olmasını zorunlu kılıyor ve zaten bir değerlendirmesi varsa günceller (tablo düzeyinde unique constraint yok, uygulama katmanında kontrol ediliyor); `GET /reviews/course/{id}/summary` (ortalama puan + adet), `DELETE /reviews/{id}` (kendi veya admin) eklendi.
- **Sertifika:** Mevcut `certificate_service.py` (reportlab ile PDF üretimi) ve `POST /certificates/{course_id}/issue` (%100 tamamlanmadan reddediyor) ilk kez frontend'den tetiklenebilir hale getirildi.
- **Frontend — yeni model/servisler:** `core/models/{review,certificate,course-progress}.model.ts`, `core/services/{review,certificate}.service.ts`; `lesson.service.ts`'e `updateProgress()`, `course.service.ts`'e `getMyProgress()` eklendi; `enrollment.model.ts`'e opsiyonel `course` alanı eklendi.
- **Frontend — Dashboard (`features/dashboard/`):** "Eğitimlerim" bölümü — kayıtlı (pending olmayan) her kurs için ilerleme çubuğu + yüzde; %100'e ulaşınca "Sertifika Al" butonu, alındıktan sonra PDF'e giden "Sertifikayı Görüntüle" linki.
- **Frontend — Kurs Detay (`features/courses/course-detail/`):** "Değerlendirmeler" bölümü — ortalama puan/adet özeti, kayıtlı kullanıcı için yıldızlı puan + yorum formu (var olan değerlendirmeyi günceller), tüm değerlendirmelerin listesi.
- **Frontend — Course Player (`features/courses/course-player/`):** Sidebar'da genel ilerleme çubuğu + tamamlanan derslerde ✅ işareti; video altında "Dersi Tamamladım Olarak İşaretle" butonu (tıklanınca `lesson_progress` güncellenir, yüzde anında yenilenir).
- Doğrulama: `backend/.venv/Scripts/python.exe -c "from app.main import app"` ile router'lar temiz yükleniyor; `npx ng build --configuration development` hatasız tamamlandı (yalnızca ilgisiz, önceden var olan Sass `@import` deprecation uyarısı var).

Migration gerekmedi — üç tablo da `0001_init.sql`'de zaten tam şema + RLS ile mevcuttu.

## Faz 8 Sonrası Düzeltme — Video Bitince Otomatik İlerleme + Sonraki Derse Geçiş

Kullanıcı geri bildirimi: (1) dashboard'da kurs kartlarında başlık yerine "Eğitim" yazısı ve admin "Kayıt Onayları" sayfasında kurs isimlerinin boş görünmesi, (2) video izlendikten sonra ilerlemenin manuel işaretlenmesi yerine otomatik algılanıp bir sonraki derse geçilmesi gerektiği.

- **Doğrulama:** `/enrollments/me` ve `/admin/enrollments/pending` uçları FastAPI `TestClient` + gerçek Supabase verisiyle uçtan uca test edildi — her ikisi de kurs başlığını (`course.title`) doğru şekilde döndürüyor. Sorun backend'de değil; ekran görüntüsündeki `ng serve`/`uvicorn` süreçlerinin bu oturumdaki Faz 8 değişikliklerinden önce başlatılmış olması (bkz. süreç başlangıç saatleri) — dev sunucularının yeniden başlatılması ve tarayıcının sert yenilenmesi (Ctrl+Shift+R) gerekiyor.
- **`course-player.component.ts` yeniden yazıldı:** İlk versiyonda YouTube JS API için boş bir `<div>` kullanılıp içeriği yalnızca API yüklendikten sonra dolduruluyordu — API gecikirse/engellenirse ekran tamamen siyah kalıyor, video hiç oynamıyor, `ENDED` event'i tetiklenmediği için ilerleme hep %0'da kalıyordu (kullanıcı geri bildirimiyle tespit edildi). Düzeltme: her zaman görünen gerçek bir `<iframe id="yt-player" [src]="...&enablejsapi=1&origin=...">` kullanılıyor, YouTube IFrame Player API (`https://www.youtube.com/iframe_api`, tek seferlik yükleniyor) bu mevcut iframe'e `new YT.Player('yt-player', {...})` ile *sonradan bağlanıyor* — API yüklenemese bile video düz iframe olarak görünmeye devam ediyor. Video `ENDED` durumuna geçtiğinde otomatik `markComplete()` tetikleniyor ve müfredattaki bir sonraki derse "Sonraki derse geçiliyor…" göstergesiyle 1.5 saniye sonra yönlendiriliyor.
- **Sidebar netliği:** Aktif ders artık sol kenarlıkla (accent renk) + hafif arka plan + kalın yazı + "(şu an izliyorsun)" etiketiyle belirgin şekilde işaretleniyor. İkon mantığı `lessonIcon()` metoduna taşındı: tamamlanan derste ✅, aktif derste (tamamlanmamış olsa bile erişimi olduğu için) ▶, önizleme dersinde ▶, diğerlerinde 🔒 — önceden aktif/izlenmekte olan ders de kilitli görünüyordu, bu karışıklığı gideriyor.
- Doğrulama: `npx ng build --configuration development` hatasız tamamlandı.

**Devam eden geri bildirim:** İframe artık görünüyor ve aktif ders net ("şu an izliyorsun" etiketi), ancak video sonuna kadar izlendiğinde tamamlandı işaretlenmiyordu. Sebep: YouTube'un `postMessage` tabanlı `ended` olayı, gömülü videonun paylaşım/gizlilik ayarlarına göre bazı videolarda güvenilir tetiklenmeyebiliyor (özellikle özel/kısıtlı paylaşılan eğitmen videolarında). Yedek mekanizma eklendi: oynatıcı hazır olduğunda (`onReady`) 3 saniyede bir `getDuration()`/`getCurrentTime()` ile süre kontrolü yapılıyor, kalan süre ≤1.5 saniyeye düştüğünde de tamamlandı sayılıyor (`checkNearEnd()`), `endedHandled` bayrağıyla çift tetiklenme engelleniyor. Bu, `ended` event'i çalışmasa bile videoyu gerçekten sonuna kadar izleyen kullanıcı için tamamlanmayı yakalar. Not: Bu da JS API köprüsü tamamen kurulamayan (ör. embed'i tümüyle engelleyen) videolarda çalışmayabilir — böyle bir durumda tek güvenilir yol "Dersi Tamamladım Olarak İşaretle" butonu.

## Course Player — Profesyonel Sayfa Düzeni

Kullanıcı isteği: oynatıcı sayfasının etrafı (video hariç, YouTube ToS izin vermiyor) daha profesyonel olsun.

- Üstte kırılabilir bir üst çubuk: "← {{kurs başlığı}}" ile kursa dönüş linki + sağda "X / Y ders tamamlandı · %Z" özeti.
- Video kartının altına, mevcut "Dersi Tamamladım" butonunun yanına **"‹ Önceki Ders" / "Sonraki Ders ›"** butonları eklendi (müfredattaki sıraya göre devre dışı bırakılıyor — ilk derste "Önceki", son derste "Sonraki" pasif).
- Sidebar: her bölüm başlığının yanına o bölümün tamamlanma oranı (`sectionCompletedCount()`, ör. "2/5"), her ders satırının sağına süresi (`formatDuration()`) eklendi; liste `max-h-[70vh] overflow-y-auto` ile uzun müfredatlarda taşmıyor; sidebar `md:sticky md:top-24` ile kaydırırken sabit kalıyor.
- `flatLessons`/`totalLessons`/`completedCount`/`previousLesson`/`nextLesson` getter'ları eklendi; kurs başlığı için `courseService.getBySlug()` bir kez (slug değişmedikçe tekrar çağrılmadan) çekiliyor.
- Doğrulama: `npx ng build --configuration development` hatasız tamamlandı.

**İki ek düzeltme (kullanıcı geri bildirimi, 26 derslik uzun bir kursta test edilerek):**
1. Sidebar'daki iç `max-h-[70vh] overflow-y-auto` kaydırma kutusu kullanıcılar tarafından fark edilmiyordu ("diğer dersleri göremiyorum" hissi veriyordu) — kaldırıldı, liste artık normal sayfa akışıyla kayıyor; sadece başlık + genel ilerleme çubuğu `md:sticky md:top-16` ile sabit kalıyor (opak `bg-white` arka planla, altından kayan ders satırlarının üstüne bindiği görsel hata da giderildi).
2. Bölümler artık **akordeon (açılır/kapanır)** — `expandedSectionId` state'i, bölüm başlığına tıklayınca `toggleSection()` ile açılıp kapanıyor; sayfa yüklendiğinde veya bir sonraki/önceki derse geçildiğinde `expandActiveSection()` otomatik olarak yalnızca **izlenmekte olan dersin bulunduğu bölümü** açık getiriyor, diğerleri kapalı — uzun kurslarda (ör. 26 ders/7+ bölüm) sayfa daha az kalabalık görünüyor.

## Dashboard — İstatistikler ve Yapay Zeka Destekli İlerleme Koçu

Kullanıcı isteği: dashboard'da hangi eğitimlerin bitirildiğine dair ayrı bir istatistik bölümü + Claude destekli, bir eğitim koçu gibi motive edici, "şu ana kadar ne öğrendin / sırada ne var" özetleyen bir bölüm.

- **Backend — `ai_service.py`:** `generate_progress_coaching(course_title, completed_titles, remaining_titles, progress_percent)` eklendi — Claude'a "deneyimli, sıcak, motive edici bir eğitim koçusun" promptuyla, tamamlanan/kalan ders başlıklarını ve yüzdeyi vererek 3-4 cümlelik akıcı bir Türkçe değerlendirme ürettiriyor (madde işareti yok, doğrudan "sen" diliyle hitap).
- **Backend — `routers/courses.py`:** `GET /courses/{slug}/coach` (giriş gerektirir) eklendi — müfredattaki dersleri sıralı çekip kullanıcının `lesson_progress`'ine göre tamamlanan/kalan başlıklara ayırıyor, `generate_progress_coaching()`'i çağırıp `{message}` döndürüyor. Gerçek veriyle uçtan uca test edildi (Claude'dan gerçek, doğru tonlu bir yanıt alındı).
- **Frontend — `course.service.ts`:** `getCoach(slug)` eklendi.
- **Frontend — `dashboard.component.ts`:** 
  - Üstte 4'lü istatistik kartı: Kayıtlı Eğitim / Tamamlanan / Ortalama İlerleme / Sertifika sayısı (tamamen mevcut `activeEnrollments`+`certificates` verisinden client-side hesaplanıyor, yeni backend gerekmedi).
  - "Tamamladığım Eğitimler" ayrı bölümü — yalnızca %100 tamamlanan kurslar, sertifika linkiyle birlikte.
  - Her "Eğitimlerim" kartına **"🤖 İlerleme Koçun"** butonu — tıklanınca (lazy, sayfa yüklenişinde otomatik AI çağrısı yapılmıyor — admin blog özetleme ile aynı "manuel tetikleme" konvansiyonu) `getCoach()` çağrılıp sonuç kart içinde turuncu vurgulu bir kutuda gösteriliyor; tekrar tıklamak gizliyor/gösteriyor (sonuç cache'leniyor, ikinci açılışta tekrar AI çağrısı yapılmıyor).
- Doğrulama: `npx ng build --configuration development` hatasız; backend `TestClient` ile gerçek kullanıcı/kurs verisine karşı `/courses/{slug}/coach` denendi, 200 + anlamlı mesaj döndü.

## İlerleme Koçu — Zengin Biçimlendirme ve Video Bazlı Konu Tekrarı

Kullanıcı geri bildirimi: koç mesajı çok kısa/düz metindi; video bazlı gerçek konu tekrarı yapmalı ve daha "şık" (biçimlendirilmiş) görünmeli.

- **`generate_progress_coaching()` güncellendi:** Artık yalnızca ders başlıkları değil, tamamlanan derslerin `description` alanı da prompta veriliyor ("video başlığı: video içeriğinin açıklaması" formatında, prompt boyutunu sınırlamak için en fazla en son tamamlanan 20 ders — `routers/courses.py`'de `[-20:]`). Claude'dan düz metin yerine sınırlı, güvenli HTML etiketleriyle (`<h4>`, `<p>`, `<ul><li>`, `<strong>`) yanıt vermesi isteniyor: kısa başlık → "Konu Tekrarı" altında **her tamamlanan video için ayrı madde, o videonun açıklamasından gerçek içerik özetiyle** (yalnızca başlığı tekrarlamıyor) → "Sırada Ne Var" → motive edici kapanış. Harici markdown kütüphanesi eklemek yerine (proje konvansiyonuna uygun, bkz. native rich-text-editor) doğrudan HTML üretimi tercih edildi.
- **Frontend:** `dashboard.component.ts`'de koç mesajı artık `{{ }}` interpolasyonu yerine `[innerHTML]` ile basılıyor (Angular'ın varsayılan sanitizer'ı güvenliği sağlıyor, blog içerik render deseniyle aynı). Yeni paylaşılan `.rich-content` CSS sınıfı (`styles.scss`) eklendi — Tailwind'in preflight resetinin sıfırladığı `h1-h4`/`ul`/`li`/`strong`/`a` stillerini geri kazandırıyor; bu sınıf hem koç mesajına hem de (tutarlılık için) `blog-detail.component.ts`'deki blog içeriğine uygulandı (önceden kurulu olmayan `@tailwindcss/typography` eklentisine ihtiyaç olmadan).
- Doğrulama: Gerçek kullanıcı/kurs verisiyle uçtan uca test edildi — Claude, her tamamlanan video için gerçek ve doğru bir konu tekrarı (ör. "stack ve heap yapıları arasındaki farkı kavradın") üreterek doğru HTML yapısında yanıt verdi. `npx ng build --configuration development` hatasız.

## Sınav Modülü (Plan Dışı Ek)

Kullanıcı isteği: her 20 video için, öğrendiklerini ölçen 10 soruluk bir test. Kapsam kararları kullanıcıyla netleştirildi: **sorular yapay zeka ile otomatik üretilecek**, sınav sonucu **yalnızca bilgilendirici** (sonraki derslere erişimi engellemiyor — mevcut basit erişim modeliyle tutarlı), **sınırsız tekrar deneme** hakkı var.

- **Yeni migration `0015_quizzes.sql`** (kullanıcı tarafından Supabase SQL Editor'de manuel çalıştırılması gerekiyor — henüz uygulanmadı): `quizzes` (course_id, block_index, title — `unique(course_id, block_index)` ile bir kurs+blok için sınav yalnızca bir kez üretilip önbelleğe alınıyor), `quiz_questions` (question, options jsonb, correct_index, order_index), `quiz_attempts` (score, total, answers jsonb, user_id). RLS: quiz/soru içeriği herkese okunabilir (gizli değil, asıl kilit FastAPI'de), denemeler yalnızca kendi kaydı.
- **`ai_service.py` — `generate_quiz_questions(course_title, block_title, lessons)`:** Bir bloktaki derslerin başlık+açıklamalarına dayanarak Claude'dan tam 10 soruluk, 4 şıklı, tek doğru cevaplı bir sınav istiyor; yanıtı yalnızca JSON dizisi olarak almasını zorunlu kılıyor (` ```json ` kod bloğuna sarılırsa regex ile temizlenip `json.loads` ile parse ediliyor).
- **`routers/quizzes.py`** (yeni, `/courses` prefix'i altında `courses.py` ile paylaşımlı): 
  - `GET /courses/{slug}/quizzes` — kurstaki her 20'lik blok için özet döner (`unlocked`: bloktaki TÜM dersler tamamlanmış mı, `generated`: sınav zaten üretilmiş mi, `best_score`, `attempts_count`).
  - `GET /courses/{slug}/quizzes/{block_index}` — blok kilitliyse (o bloktaki tüm dersler tamamlanmamışsa) 403; sınav ilk kez isteniyorsa AI ile üretilip DB'ye yazılıyor (bir daha üretilmiyor, aynı sorular kalıcı), sorular **doğru cevap gizlenerek** dönüyor.
  - `POST /courses/{slug}/quizzes/{block_index}/submit` — cevapları doğru cevaplarla karşılaştırıp puanlıyor, `quiz_attempts`'e kaydediyor, doğru/yanlış detayını (artık doğru cevap dahil) geri döndürüyor.
- **Frontend:** `core/models/quiz.model.ts`, `core/services/quiz.service.ts`; yeni sayfa `features/courses/course-quiz/course-quiz.component.ts` (rota: `/courses/:slug/quizzes/:blockIndex`) — soruları tıklanabilir şık kartlar olarak gösterip cevaplattırıyor, gönderince skor + her soru için doğru/yanlış + doğru cevap gösteriliyor, "Sınavı Tekrar Çöz" ile sıfırlanabiliyor. `course-player.component.ts` sidebar'ına **"🏆 Sınavlar"** bölümü eklendi — kilitli bloklar 🔒 ile pasif görünüyor, açık olanlar tıklanabilir + varsa en iyi skor gösteriliyor; bir ders tamamlandığında (`markComplete()` sonrası) liste otomatik yenileniyor (yeni açılan sınav anında görünür).
- Doğrulama: Backend `TestClient` ile route kaydı doğrulandı, `npx ng build --configuration development` hatasız (yeni `course-quiz-component` chunk'ı oluştu). **Uçtan uca (gerçek AI soru üretimi + puanlama) test edilemedi çünkü migration `0015` henüz veritabanına uygulanmadı** — kullanıcının SQL Editor'de çalıştırması bekleniyor.

## Kurs Sohbet Asistanı (RAG Tarzı, Plan Dışı Ek)

Kullanıcı isteği: kurs detay sayfasında (fiyat kartının altında), giriş yapmış kullanıcıların o kursun içeriği hakkında soru sorabileceği bir chatbot; günlük 40 soru limiti (kötüye kullanımı önlemek için). Kapsam varsayımı (kullanıcıya açıkça belirtildi): "sisteme kayıt yapmış kullanıcı" = platforma üye olan herhangi biri (o kursa özel kayıtlı/enrolled olması şart değil — potansiyel öğrenciye de "eğitim hakkında bilgi" verebiliyor). Sohbet geçmişi v1'de yalnızca istemci tarafında tutuluyor (sayfa yenilenince kaybolur); yalnızca günlük kullanım sayacı DB'de kalıcı.

- **Migration `0016_course_chat_usage.sql`:** `ai_chat_usage` (user_id, usage_date, message_count, `unique(user_id, usage_date)`) — yalnızca kendi kaydını okuyabilir, yazma yalnızca backend (service role).
- **`ai_service.py` — `chat_with_course_assistant(course_context, history, message, reply_language)`:** Anthropic Messages API'nin `system` alanında kurs bağlamını (başlık, seviye, **fiyat** — normal/indirimli/ücretsiz/Udemy+kupon durumu dahil, açıklamalar, tüm müfredat: bölüm+ders başlığı+açıklama) veriyor, `messages` alanında gerçek sohbet geçmişi + yeni soru gidiyor (gerçek çok turlu konuşma). Markdown yerine yalın HTML (`<p>`, `<strong>`, `<ul><li>`) istiyor. `reply_language` parametresiyle Türkçe/İngilizce yanıt zorunlu kılınabiliyor.
- **`routers/course_chat.py`** (yeni): `POST /courses/{slug}/chat` — `_check_and_increment_usage()` ile günlük sayaç kontrolü (limit aşılırsa 429 + dostane mesaj), `_build_course_context()` ile kurs+müfredat bilgisini (ders açıklamaları 200 karakterle sınırlı) derliyor, yanıt dili = kurs `language` alanı `'en'` ise **veya** istekteki `ui_language` `'en'` ise İngilizce, aksi halde Türkçe. Geçmiş, prompt boyutunu sınırlamak için son 10 turla sınırlı (`MAX_HISTORY_TURNS`).
- **Frontend:** `core/models/chat.model.ts`, `core/services/chat.service.ts` (`ui_language`'ı `TranslateService.currentLang()`'den gönderiyor); `course-detail.component.ts`'ye fiyat kartının hemen altına modern bir sohbet widget'ı eklendi — gradyan başlıklı kart, rol bazlı avatarlar (🙂/🤖), kullanıcı balonu dolu accent renginde sağa hizalı, asistan balonu `[innerHTML]` + paylaşılan `.rich-content` sınıfıyla (HTML güvenli şekilde render ediliyor, markdown ham göstermiyor) sola hizalı, kalan hak göstergesi ("X/40"), giriş yapmamış kullanıcıya login CTA'sı.
- Doğrulama: Gerçek kullanıcı/kurs verisiyle uçtan uca test edildi — müfredat sorularına doğru ve HTML biçimli yanıt, fiyat sorusuna doğru yanıt ("tamamen ücretsiz"), `ui_language: 'en'` ile İngilizce yanıt, günlük sayaç doğru artıyor/`remaining_messages` doğru dönüyor. `npx ng build --configuration development` hatasız.

## i18n Boşlukları — Sohbet Widget'ı ve Dashboard

Kullanıcı geri bildirimi: (1) dil İngilizce'ye çevrildiğinde kurs sohbet asistanının başlık/placeholder gibi sabit arayüz metinleri Türkçe kalıyordu, (2) `/dashboard` sayfası "yarı İngilizce yarı Türkçe" görünüyordu (Faz 8'de eklenen istatistik kartları, "Eğitimlerim" listesi, sertifika/koç butonları hiç i18n'e bağlanmamıştı — hardcoded Türkçe).

- `public/assets/i18n/{tr,en}.json`'a yeni `course_chat` bölümü (title, subtitle, empty_state, placeholder, typing, login_required) ve `dashboard` bölümüne eksik anahtarlar eklendi (instructor_prompt, become_instructor_cta, instructor_panel_cta, stat_enrolled/completed/avg_progress/certificates, completed_courses_title, course_fallback, certificate_short/get/view, coach_show/hide/loading/label). `dashboard.progress_placeholder` metni de güncellendi (artık gerçek duruma uygun: "Henüz kayıtlı bir eğitimin yok.").
- `course-detail.component.ts` ve `dashboard.component.ts`'deki tüm hardcoded Türkçe arayüz metinleri `| translate` pipe'ına bağlandı.
- **AI içerikli metinlerin dili de düzeltildi:** Hem kurs sohbet asistanı hem de ilerleme koçu artık `ui_language` parametresi alıyor (`TranslateService.currentLang()`'den gönderiliyor) — kurs `language` alanı `'en'` **veya** kullanıcının seçili arayüz dili `'en'` ise yanıt İngilizce, aksi halde Türkçe üretiliyor (`generate_progress_coaching()` ve `chat_with_course_assistant()`'a `reply_language` parametresi eklendi, `GET /courses/{slug}/coach` artık `ui_language` query param'ı kabul ediyor).
- Doğrulama: `ui_language=en` ile hem `/courses/{slug}/coach` hem `/courses/{slug}/chat` İngilizce, HTML biçimli yanıt döndürdüğü doğrulandı. `npx ng build --configuration development` hatasız.

## Dashboard Yeniden Tasarımı

Kullanıcı geri bildirimi: dashboard çok sade kalıyordu, daha kullanışlı/görsel bir tasarım istendi.

- **Hero banner:** Koyu lacivert gradyan (`brand-900` → `brand-800`) kart; kullanıcının baş harflerinden oluşan bir avatar rozeti (`initials` getter — isim yoksa 👤), başlık/karşılama metni, sağda "Çıkış Yap" (artık sayfa sonunda değil, üstte kompakt bir buton). Eğitmen ol / eğitmen paneli CTA'ları banner içine, yarı saydam bir kutuya taşındı.
- **İstatistik kartları:** İkon eklendi (📚/✅/📈/🎓), beyaz kart + gölge ile daha belirgin.
- **"Tamamladığım Eğitimler"** artık yatay, yuvarlak "chip" listesi (kompakt, sertifika linkiyle).
- **"Eğitimlerim"** artık düz liste değil, **kapak görselli kart grid'i** (`sm:grid-cols-2`): her kartta kurs kapak görseli (`enrollment.course?.cover_image_url` — yoksa 📘 placeholder), %100 tamamlanan kurslarda görsel üzerinde "✅ Tamamlanan" rozeti, ilerleme çubuğu, ve üç yuvarlak (pill) aksiyon butonu: **"Devam Et"/"Başla"** (ilerlemeye göre metin değişiyor) + sertifika + ilerleme koçu.
- **Boş durum:** Artık düz bir cümle değil, ikon + açıklama + "Eğitimleri Keşfet" CTA'sı olan kesikli çerçeveli bir kart.
- Yeni i18n anahtarları: `dashboard.continue_cta`, `dashboard.start_cta`, `dashboard.browse_courses_cta` (tr/en).
- Doğrulama: `npx ng build --configuration development` hatasız (yalnızca zararsız bir Angular "gereksiz optional chaining" uyarısı var, hata değil).

## Eğitmen Paneli Yeniden Tasarımı

Kullanıcı geri bildirimi: `/instructor/courses` ve `/instructor/lessons` sayfaları da dashboard'daki gibi düz tablo/form görünümündeydi, tasarım olarak zayıftı.

- **`my-courses.component.ts`:** Aynı hero banner deseni (gradyan + kurs sayısı özeti + "Ders Yönetimi"/"Yeni Kurs" pill butonları). Düz tablo yerine kapak görselli kart grid'i (`sm:grid-cols-2`) — Yayında/Taslak rozeti, indirimli/normal fiyat, "✏️ Düzenle"/"🗑️ Sil" pill butonları. Form artık her zaman açık değil — "+ Yeni Kurs" veya "Düzenle" tıklanınca `showForm` ile açılan bir kart, "✕ Kapat" ile gizlenebiliyor.
- **`my-lessons.component.ts`:** Hero banner içine gömülü, beyaz arka planlı kurs seçici. Bölümler kart olarak, her ders satırında sıra numarası rozeti (dairesel), önizleme etiketi, kaynak dosyaları artık liste yerine küçük "chip" rozetleri. Bölüm/ders silme butonları kırmızı pill'e dönüştürüldü, "+ Ders Ekle"/"+ Bölüm Ekle" turuncu/kesikli-çerçeve vurgusuyla belirginleşti. Kurs seçilmeden önce davetkar bir boş durum ekranı eklendi.
- Doğrulama: `npx ng build --configuration development` hatasız.

## Eğitmenler de Udemy Kursu Tanıtabilir

Kullanıcı isteği: eğitmenler kendi platformumuzda yayınladıkları kurslara ek olarak, Udemy'de sattıkları bir kursun tanıtımını da yapabilsin (link + kupon kodu ile) — önceden bu yalnızca admin panelinden mümkündü.

- **`routers/instructor.py` — `create_my_course`:** Eğitmen kursu oluştururken `provider`/`external_url`/`coupon_code` alanlarını zorla `'internal'`/`None`/`None`'a sıfırlayan 3 satır kaldırıldı — artık admin ile aynı şekilde bu alanları kendisi belirleyebiliyor (`update_my_course` zaten bu kısıtlamayı hiç uygulamıyordu, tutarsızlık giderildi).
- **`my-courses.component.ts`:** Forma admin'deki ile aynı desende "Kurs Nerede Satılıyor?" seçici (Platformumuzda / Udemy'de) + Udemy seçilince görünen link+kupon kodu alanları eklendi. Kart grid'inde Udemy kursları mor "🔗 Udemy" rozetiyle ve fiyat yerine kupon koduyla gösteriliyor.
- Doğrulama: `npx ng build --configuration development` hatasız. (Canlı uçtan uca test edilmedi — mevcut seed instructor kayıtlarının hiçbiri gerçek bir kullanıcı profiline bağlı değil; kod yolu admin'in zaten kullandığı, test edilmiş mantıkla birebir aynı.)

## Sadece Udemy Değil, Herhangi Bir Harici Platform — ve BilimData'nın Kendi Udemy Kursları vs. Eğitmenlerin Tanıtımları

Kullanıcı isteği (iki aşamalı): önce "kurslar yalnızca Udemy'de değil başka platformlarda da tanıtılabilsin" dendi; ilk uygulamada yanlışlıkla `'udemy'` değeri genel `'external'`e dönüştürüldü, kullanıcı bunun **hata olduğunu** belirtti — asıl istenen `'udemy'`nin ayrı bir değer olarak KALMASI, buna ek olarak yeni bir `'external'` (diğer platformlar) seçeneğinin eklenmesiydi. Ayrıca **BilimData'nın kendi Udemy kursları** ile **eğitmenlerin kendi tanıttığı Udemy/diğer platform kursları**nın da ayırt edilmesi istendi.

- **Migration `0017_external_provider.sql`** (düzeltilmiş hali): `courses.provider` constraint'i artık **üç** değeri kabul ediyor: `'internal' | 'udemy' | 'external'`. Yeni `platform_name text` kolonu yalnızca `'external'` durumunda kullanılıyor (serbest metin, ör. "Coursera", "Patreon"); `'udemy'` için platform adı zaten sabit olduğundan gerekmiyor. Var olan veriye dokunulmuyor (önceki hatalı sürümün aksine `'udemy'` satırları taşınmıyor).
- **"BilimData'nın kendi kursu mu, eğitmenin mi?" ayrımı — yeni alan gerekmedi, var olan veriden türetildi:** `instructors.profile_id` gerçek bir kullanıcı hesabına bağlıysa (başvurup admin onayından geçmiş bir eğitmense) bu bir "gerçek eğitmen"dir; `profile_id is None` ise bu, platformun kendi resmi eğitmen kimliğidir (v1'in tek-kurum tasarımından kalma, tüm mevcut kurslar bu kimliğe bağlı). `routers/courses.py`'de `COURSE_SELECT` artık `instructors.profile_id`'yi de çekiyor, `_mark_official_instructor()` bunu `instructor.is_platform_official: bool` alanına çeviriyor (`InstructorOut` modeline eklendi); ham `profile_id` yanıtta hiç yer almıyor (Pydantic tarafından otomatik düşürülüyor).
- **Backend:** `course_chat.py`'deki bağlam metni artık `provider in ('udemy','external')` için ayrı platform etiketi üretiyor (`'udemy'` → sabit "Udemy", `'external'` → `platform_name`).
- **Frontend:** `Course.provider`/`AdminCourse.provider` → `'internal' | 'udemy' | 'external'`; `Instructor` tipine `is_platform_official: boolean` eklendi. `course-card`, `course-detail` (CTA'da `externalPlatformLabel()` yardımcı metodu — udemy için sabit "Udemy", external için `platform_name`), admin `course-editor` ve eğitmen `my-courses` formlarının sağlayıcı seçicisi artık **3 seçenekli** (Platform / Udemy / Başka Bir Platform), yalnızca "Başka Bir Platform" seçilince "Platform Adı" alanı görünüyor.
- **Ana sayfa (`home.component.ts`) artık iki ayrı bölüm gösteriyor:** "Udemy Eğitimlerimiz" (`udemyCourses` — yalnızca `provider==='udemy' && instructor.is_platform_official`, yani BilimData'nın kendi Udemy kursları) ve "Eğitmenlerimizin Diğer Programları" (`instructorExternalCourses` — `(provider==='udemy' || provider==='external') && !instructor.is_platform_official`, yani eğitmenlerin kendi tanıttığı kurslar, platform fark etmeksizin).
- Doğrulama: `npx ng build --configuration development` hatasız. Backend `TestClient` ile `/courses` uçtan uca test edildi — migration henüz uygulanmadan bile (yeni alanlar opsiyonel/varsayılanlı olduğu için) tüm mevcut kurslar doğru şekilde `is_platform_official: true` döndü.
- **Migration `0017` kullanıcı tarafından uygulandı ve doğrulandı** — `courses.platform_name` kolonu mevcut, veri kaybı yok.

**Kök neden bulunan ek hata — Angular Router'da anchor scrolling hiç etkin değildi:** Kullanıcı "Fırsatlar" linkinin hâlâ eski davranışta olduğunu bildirdi. Sebep, `#advantages` anchor'ının konumuyla ilgili değildi — `app.config.ts`'de `provideRouter(routes)` çağrısına `withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })` hiç eklenmemişti, yani **hiçbir** `fragment` linki (Fırsatlar/Uzman Kadro/İletişim) gerçekte sayfa içi kaydırma yapmıyordu — bu, yeni eklenen bölümlere özgü değil, projenin başından beri var olan bir eksiklikti. Eklenince tüm `fragment` linkleri düzgün çalışmaya başladı.

**Ek düzenleme:** Header'daki "Fırsatlar" nav linki (`fragment="advantages"`) artık genel "Öğrenci Avantajları" kart bölümüne değil, doğrudan yeni eklenen kurs bölümlerine (önce "Udemy Eğitimlerimiz", sonra "Eğitmenlerimizin Diğer Programları") kaydırıyor — `id="advantages"` sabit bir `<div>` çapası olarak bu iki `@if` bloğunun hemen üstüne taşındı (diziler boşken bile çapa her zaman DOM'da var olsun diye). Eski "Öğrenci Avantajları" bölümü içerik olarak aynı kaldı, yalnızca id'si çakışmasın diye `id="student-benefits"` oldu (başka hiçbir yerden referans edilmiyordu).

## Ana Sayfa Yeniden Tasarımı

Kullanıcı geri bildirimi: ana sayfa çok sade kalıyordu, daha profesyonel görünmeli.

- **Hero:** Arka planda yumuşak, dekoratif blur daireler eklendi; başlık büyütüldü, üstte "BilimData" rozeti. Altına **gerçek verilerden hesaplanan** bir istatistik şeridi eklendi (uydurma sayı yok): toplam yayında kurs sayısı, kategori sayısı, `courses` verisinden `instructor.id`'ye göre `Set` ile hesaplanan benzersiz eğitmen sayısı.
- **Kategori kartları:** Artık gerçekten tıklanabilir — `/courses?category={id}` linkine gidiyor (`course-list.component.ts`'ye `ActivatedRoute` üzerinden `?category=` query param okuma desteği eklendi, önceden bu filtre yalnızca sayfa içi buton tıklamasıyla çalışıyordu). İkon artık renkli dairesel rozet içinde, hover'da hafif yukarı kalkma + gölge efekti.
- **"Neden Biz?" bölümü:** Düz onay işaretli liste yerine, her maddeye özel emoji ikonlu (👨‍🏫🛠️🎯⏱️) kart grid'i.
- **"Öne Çıkan Eğitimler" başlığına** "Tümünü Gör →" linki eklendi.
- **"Öğrenci Avantajları"** kartlarına da ikon eklendi (🎟️🖥️🗺️📞), hover gölgesiyle.
- Yeni i18n anahtarları: `hero.stat_courses/stat_categories/stat_instructors`, `courses_section.view_all` (tr/en).
- Doğrulama: `npx ng build --configuration development` hatasız.

## Özel "Fırsatlar" Sayfası (Plan Dışı Ek)

Kullanıcı geri bildirimi: ana sayfada "Fırsatlar" tıklanınca yalnızca aynı sayfada bir bölüme kayması yetersizdi; kupon kodlarını öne çıkaran, yaratıcı, ayrı bir sayfa istendi.

- **Yeni sayfa `features/deals/deals.component.ts`** (rota: `/deals`): Gradyanlı, "🎉 Fırsatlar" başlıklı bir hero banner; altında iki bölüm — "Udemy Eğitimlerimiz" (BilimData'nın resmi Udemy kursları) ve "Eğitmenlerimizin Diğer Programları" (eğitmenlerin kendi tanıttığı Udemy/harici kurslar), `is_platform_official` ayrımı korunarak. Her fırsat, standart küçük `course-card` yerine **geniş, yatay bir "deal card"** olarak gösteriliyor: kapak görseli + platform rozeti, başlık/açıklama, orijinal/indirimli/ücretsiz fiyat, ve varsa **tıklanınca panoya kopyalanan bir kupon kodu rozeti** (`navigator.clipboard.writeText`, 1.5 saniyeliğine 📋 ikonunun ✅'ye dönüşmesiyle geri bildirim veriyor) + harici linke giden "Fırsatı Kap →" butonu.
- **Header:** "Fırsatlar" nav linki artık `fragment="advantages"` ile aynı sayfada kaydırma yerine doğrudan `routerLink="/deals"`e gidiyor.
- **Ana sayfa sadeleştirildi:** Daha önce ana sayfada tekrar gösterilen Udemy/eğitmen kurs grid'leri kaldırıldı (tekrarı önlemek için); yerine, yalnızca gerçekten bir fırsat varsa (`hasDeals`) görünen, `/deals`'a yönlendiren **tek, dikkat çekici bir gradyan banner** ("🎉 Kaçırılmayacak Fırsatlar" + CTA) eklendi — `id="advantages"` çapası bu banner'ın hemen üstünde kalmaya devam ediyor.
- Yeni i18n anahtarları: `deals_page.*` (title/subtitle/loading/empty/get_deal), `deals_teaser.*` (title/subtitle/cta) — tr/en.
- Doğrulama: `npx ng build --configuration development` hatasız (yeni `deals-component` chunk'ı oluştu).

## Giriş / Kayıt Sayfaları Yeniden Tasarımı

Kullanıcı isteği: `/auth/login` ve `/auth/register` sayfaları da ikonlu ve modern olsun.

- **Split ekran düzeni** (md ve üstü): solda gradyanlı (`brand-900`→`brand-800`) marka paneli — logo, karşılama emojisi (👋 giriş / 🚀 kayıt), başlık/alt metin, telif hakkı; sağda beyaz form kartı. Mobilde yalnızca form paneli gösteriliyor.
- **Google butonu:** Artık gerçek, 4 renkli resmi Google "G" logosunu inline SVG olarak kullanıyor (emoji değil, marka doğruluğu için).
- **Form alanları:** E-posta (📧), şifre (🔒), ad-soyad (🙂) ikonları input içine gömülü (relative/absolute konumlandırma), focus durumunda accent renkli halka.
- **"veya" ayırıcı** iki form yöntemi arasına eklendi; gönder butonunda yükleniyor durumunda dönen bir spinner var.
- Hata/bilgi mesajları artık düz metin değil, ikonlu (⚠️/✅) renkli kutular.
- Yeni i18n anahtarları: `auth.login_subtitle`, `auth.register_subtitle`, `auth.welcome_back_title/subtitle`, `auth.welcome_new_title/subtitle`, `auth.or_divider` (tr/en).
- **Ek:** Kayıt formuna "Şifre (Tekrar)" alanı eklendi; gönderilmeden önce istemci tarafında eşleşme kontrolü yapılıyor, uyuşmuyorsa `auth.password_mismatch` mesajıyla (aynı ⚠️ kutusunda) engelliyor, Supabase'e hiç istek gitmiyor.
- **Gerçek logo:** Düz "BilimData" metni yerine yeniden kullanılabilir `shared/components/logo/logo.component.ts` eklendi — turuncu (accent-500) yuvarlatılmış kare rozet içinde artan yükseklikte 3 çubuk + tepede bir nokta (yükselen veri/büyüme motifi, lacivert brand-900 renginde), yanında "Bilim" (beyaz) + "Data" (turuncu) iki tonlu wordmark. Header, login ve register sayfalarındaki düz metin logo bu bileşenle değiştirildi.
- Doğrulama: `npx ng build --configuration development` hatasız.

## Commit Durumu

Faz 8 + video-bitince-otomatik-ilerleme kodu tamamlandı, henüz commit edilmedi (bir sonraki adım commit).

## Şu Anda Neredeyiz / Sırada Ne Var

Tamamlanan: **Faz 0 → Faz 4, Faz 6, Faz 7, Faz 8** + dört plan dışı ek (Udemy entegrasyonu, çoklu eğitmen sistemi, blog etkileşim/kullanıcı yazıları, zengin metin editörlü `/blog/write`).

- **Faz 5 — Ödeme Entegrasyonu:** v1 kapsamı dışında bırakıldı (bilinçli karar — manuel/pending onay akışı bunun yerine kullanılıyor). Gerçek Iyzico/Stripe entegrasyonu v2'de.

CLAUDE.md roadmap'inin geri kalanı (Faz 5 hariç) tamamlandı. Bir sonraki oturumda önce commit atılmalı, sonra kullanıcıyla yeni yön (ör. ödeme entegrasyonu, ek iyileştirmeler) netleştirilecek.
