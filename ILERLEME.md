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

---

## Genel Notlar / Ortam

- Backend Python bağımlılıkları proje-özel `.venv` içinde (`backend/.venv`) — global Python'a kurulmuyor.
- Geliştirme sunucuları: `uvicorn app.main:app --port 8000` (backend), `ng serve --port 4200` (frontend).
- Supabase migration'ları sırayla (`0001` → `0010`) SQL Editor'de elle çalıştırılıyor (proje CLI kurulu değil).

## Sırada: Faz 4 — Erişim Kontrolü & Kayıt & Admin Paneli

- v1 ödeme akışı: manuel/ücretsiz kayıt (`payment_status='free'`, admin onayı).
- Angular admin modülü (`features/admin/`): kurs/ders/blog CRUD, enrollment onaylama — şu an placeholder bileşenler var, gerçek işlevsellik eklenecek. Kurs formu `provider`/`external_url`/`coupon_code` alanlarını da (Udemy kursu ekleme/düzenleme için) içerecek.
- Backend `admin.py` router'ı zaten iskelet halinde mevcut (Faz 0'da eklendi), gerçek CRUD mantığı ve admin rol kontrolü ile genişletilecek.
