# CLAUDE.md — BilimData Tarzı Online Eğitim Platformu

Bu dosya, Claude Code (veya bu projede çalışan herhangi bir AI ajanı) için proje bağlamını, mimariyi, kuralları ve öncelikleri tanımlar. Kod yazmadan önce bu dosyayı oku.

---

## 1. Proje Özeti

**Ne inşa ediyoruz:** Udemy tarzında, tek eğitmenli/kurumsal bir online eğitim platformu. Kullanıcılar:
- Üye olmadan eğitim kataloğunu ve **ücretsiz önizleme derslerini** izleyebilir.
- Üye olmadan eğitime **tam erişemez** (satın almadan/kaydolmadan kilitli).
- Google ile veya e-posta/şifre ile üye olabilir, giriş yapabilir.
- Ücretli eğitimlere kayıt olup tüm dersleri izleyebilir.
- Blog bölümünü okuyabilir (üyelik gerektirmez).

**Tasarım referansı:** `bilimdata.com` — sade, profesyonel, kurumsal eğitim sitesi hissi.
- Header: Logo | Programlar | Uzman Kadro | Fırsatlar | İletişim | **Hemen Kayıt Ol** (CTA buton)
- Hero: Büyük başlık + alt açıklama + 2 CTA buton ("Programları Keşfet", "Ücretsiz Fırsatlar")
- "Kapsamlı Uzmanlık Alanları" → kategori kartları (ikon + başlık + kısa açıklama)
- "Neden Biz?" → mentörlük/değer önerisi bölümü (madde listeli + görsel/ikon)
- "Öğrenci Avantajları" → 4'lü kart grid (Kuponlar, Portal, Yol Haritaları, İletişim)
- Footer: Telif + Gizlilik + Kullanım Koşulları linkleri
- Renk paleti ve tipografi: sade, kurumsal (koyu lacivert/siyah + tek vurgu rengi). Kesin hex kodları için tasarım aşamasında ekran görüntüsü/canlı site incelenip Tailwind config'e işlenecek.

**Bizim platformda ek olarak (bilimdata.com'da olmayan):**
- Eğitim kataloğu + fiyatlandırma + "Sepete Ekle / Satın Al" akışı
- Kurs detay sayfası (müfredat, video listesi, eğitmen, yorumlar, ücretsiz önizleme dersi işaretli)
- Kullanıcı paneli (Kayıtlı Eğitimlerim, İlerleme, Sertifikalar — ileride)
- Blog modülü (kategori, etiket, AI özet alanı için hazır şema)
- Auth (Google OAuth + email/password, Supabase Auth üzerinden)

---

## 2. Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Not |
|---|---|---|
| Frontend | **Angular** (standalone components, Angular 17+) | Kullanıcının bildiği framework. TypeScript kullanılacak. |
| Backend / API | **FastAPI** (Python) | Kullanıcının güçlü olduğu backend. İş mantığı, ödeme, YouTube API entegrasyonu, AI özetleme burada. |
| Veritabanı & Auth | **Supabase** (PostgreSQL + Supabase Auth + Row Level Security) | Google OAuth Supabase Auth üzerinden yönetilecek. |
| Video Barındırma | **YouTube (embed)** | Kendi video sunucumuz YOK. Sadece YouTube video ID saklanır, `<iframe>` embed ile gösterilir. |
| Dosya/Görsel Depolama | **Supabase Storage** | Kurs kapak görselleri, blog kapak görselleri, eğitmen fotoğrafları. |
| Ödeme | TBD (Iyzico / Stripe — Türkiye için Iyzico önerilir) | v1'de "manuel onay" veya sandbox ile başlanabilir. |
| Hosting | Frontend: Vercel/Netlify · Backend: Railway/Render/Fly.io · DB: Supabase Cloud | |

**Mimari ilişki:** Angular (SPA) → FastAPI (REST API, iş mantığı + yetki kontrolü) → Supabase (Postgres + Auth + Storage). Angular, Supabase Auth'a (Google login dahil) doğrudan `@supabase/supabase-js` ile bağlanabilir; ama **veri okuma/yazma işlemleri mümkün olduğunca FastAPI üzerinden** yapılmalı ki iş kuralları (kayıt kontrolü, ücretsiz/ücretli erişim mantığı, kupon doğrulama vb.) tek yerde, backend'de dursun. Supabase RLS ayrıca ikinci savunma katmanı olarak aktif tutulmalı.

---

## 3. Kimlik Doğrulama (Auth) Akışı

1. Supabase Auth kullanılacak: **Google OAuth provider** + email/password.
2. Angular tarafında `@supabase/supabase-js` ile `supabase.auth.signInWithOAuth({ provider: 'google' })`.
3. Supabase, giriş sonrası JWT üretir. Bu JWT, FastAPI'ye her istekte `Authorization: Bearer <token>` header'ı ile gönderilir.
4. FastAPI, Supabase'in public JWKS/secret'ı ile token'ı doğrular (`python-jose` veya `pyjwt` + Supabase JWT secret).
5. Kullanıcı `profiles` tablosunda otomatik oluşturulur (Supabase trigger: `on_auth_user_created`).
6. **Misafir kullanıcı (auth yok):**
   - Kurs kataloğunu görebilir.
   - Kurs detay sayfasını görebilir.
   - Yalnızca `is_preview = true` işaretli dersleri izleyebilir.
   - Blog'u okuyabilir.
   - Satın alma / kayıt olma denediğinde login modalına yönlendirilir.
7. **Üye ama kayıtlı olmadığı kurs:** Kurs detayını görür, önizlemeyi izler, kilitli derslerde "Bu eğitime kayıtlı değilsiniz" + satın al CTA'sı görür.
8. **Kayıtlı kullanıcı:** Tüm dersleri izler, ilerleme kaydedilir (v2).

---

## 4. Veritabanı Şeması (Supabase / PostgreSQL) — Taslak

```sql
-- Kullanıcı profili (Supabase auth.users ile 1-1 ilişkili)
profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  avatar_url text,
  role text default 'student', -- 'student' | 'instructor' | 'admin'
  created_at timestamptz default now()
)

-- Eğitmenler
instructors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  title text,           -- "Kıdemli Veri Bilimci" vb.
  bio text,
  avatar_url text
)

-- Kategoriler (Python, Makine Öğrenmesi, Veri Bilimi, Yazılım Geliştirme...)
categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  description text
)

-- Eğitimler / Kurslar
courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  description text,
  cover_image_url text,
  category_id uuid references categories(id),
  instructor_id uuid references instructors(id),
  price numeric(10,2) not null default 0,
  discount_price numeric(10,2),
  level text, -- 'beginner' | 'intermediate' | 'advanced'
  language text default 'tr',
  is_published boolean default false,
  created_at timestamptz default now()
)

-- Müfredat bölümleri (Section / Module)
course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  order_index int not null
)

-- Dersler (Video = YouTube embed)
lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references course_sections(id) on delete cascade,
  title text not null,
  youtube_video_id text not null,   -- sadece YouTube video ID, örn "dQw4w9WgXcQ"
  duration_seconds int,
  order_index int not null,
  is_preview boolean default false,  -- true ise üye olmadan izlenebilir
  resources jsonb                    -- ek dosya/link listesi (opsiyonel)
)

-- Kayıtlar / Satın almalar
enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  enrolled_at timestamptz default now(),
  payment_status text default 'pending', -- 'pending' | 'paid' | 'free' | 'coupon'
  progress_percent int default 0,
  unique (user_id, course_id)
)

-- İzleme ilerlemesi (v2)
lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  lesson_id uuid references lessons(id),
  completed boolean default false,
  last_watched_second int default 0,
  unique (user_id, lesson_id)
)

-- Kuponlar
coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent int,
  course_id uuid references courses(id), -- null ise tüm kurslarda geçerli
  valid_until timestamptz,
  max_uses int,
  used_count int default 0
)

-- Yorumlar / Değerlendirmeler
reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  user_id uuid references profiles(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
)

-- Blog
blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  cover_image_url text,
  content text not null,          -- markdown veya rich text
  excerpt text,
  ai_summary text,                -- ileride AI ile üretilecek özet
  author_id uuid references profiles(id),
  category text,
  tags text[],
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
)

-- Sertifikalar (kurs %100 tamamlanınca üretilir)
certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  issued_at timestamptz default now(),
  pdf_url text,                   -- Supabase Storage'a yüklenen PDF sertifikanın URL'i
  unique (user_id, course_id)
)
```

**Row Level Security (RLS) prensipleri:**
- `courses`, `categories`, `blog_posts`: herkes `select` yapabilir (yalnızca `is_published = true` olanlar).
- `lessons`: `is_preview = true` olanlar herkese açık; diğerleri yalnızca `enrollments` tablosunda ilgili `course_id` için kaydı olan `user_id` tarafından okunabilir (bir Postgres fonksiyonu/policy ile kontrol edilecek).
- `enrollments`, `lesson_progress`: kullanıcı yalnızca kendi kaydını görebilir/yazabilir.
- `certificates`: kullanıcı yalnızca kendi sertifikalarını görebilir; yazma yalnızca backend (service role) tarafından yapılır.
- Yazma işlemleri (`insert/update` kurslar, dersler, blog) yalnızca `role = 'admin'` veya `role = 'instructor'` (kendi kursu için) profillerine açık.

---

## 5. FastAPI Backend — Modül Yapısı

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py          # env değişkenleri, Supabase URL/keys
│   │   ├── security.py        # Supabase JWT doğrulama, dependency injection
│   │   └── supabase_client.py
│   ├── models/                # Pydantic şemaları (request/response)
│   ├── routers/
│   │   ├── auth.py            # (opsiyonel, çoğu Supabase'de client-side)
│   │   ├── courses.py         # GET /courses, GET /courses/{slug}
│   │   ├── lessons.py         # GET /lessons/{id} — erişim kontrolü burada!
│   │   ├── enrollments.py     # POST /enrollments (satın alma/kayıt)
│   │   ├── payments.py        # ödeme sağlayıcı webhook + init
│   │   ├── coupons.py
│   │   ├── reviews.py
│   │   ├── blog.py            # GET /blog, GET /blog/{slug}
│   │   ├── admin.py           # kurs/ders/blog CRUD + enrollment onayı (role='admin')
│   │   ├── certificates.py    # GET /certificates, POST /certificates/{course_id}/issue
│   │   └── ai.py              # ileride: POST /blog/{id}/summarize
│   ├── services/
│   │   ├── youtube.py         # YouTube video meta çekme (süre, thumbnail)
│   │   ├── payment_provider.py
│   │   ├── certificate_service.py  # PDF sertifika üretimi (reportlab/weasyprint) + Storage'a yükleme
│   │   └── ai_service.py      # Anthropic/OpenAI API çağrıları (özet çıkarma vb.)
│   └── deps.py                 # get_current_user, require_enrollment, require_admin vb.
├── requirements.txt
└── .env.example
```

**Kritik iş kuralı — erişim kontrolü:**
`GET /lessons/{id}` endpoint'i şu sırayla kontrol yapmalı:
1. Ders `is_preview = true` mu? → herkese aç.
2. Değilse, request'te geçerli bir kullanıcı var mı? Yoksa 401.
3. Kullanıcı bu kursa `enrollments` tablosunda kayıtlı mı (`payment_status in ('paid','free','coupon')`)? Değilse 403.
4. Tüm şartlar sağlanıyorsa YouTube video ID'sini döndür (frontend embed eder).

Bu kontrol **Angular tarafında değil, mutlaka FastAPI tarafında** yapılmalı — client-side kontrol kolayca bypass edilir.

---

## 6. Angular Frontend — Modül Yapısı

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── supabase.service.ts   # supabase-js client, auth state
│   │   │   │   ├── api.service.ts        # FastAPI HTTP client wrapper
│   │   │   │   └── auth.guard.ts
│   │   ├── features/
│   │   │   ├── home/                     # bilimdata.com tarzı anasayfa
│   │   │   ├── courses/
│   │   │   │   ├── course-list/          # katalog + filtre (kategori, seviye, fiyat)
│   │   │   │   ├── course-detail/        # müfredat, eğitmen, yorumlar, satın al
│   │   │   │   └── course-player/        # YouTube iframe player + ders listesi
│   │   │   ├── blog/
│   │   │   │   ├── blog-list/
│   │   │   │   └── blog-detail/          # AI özet alanı burada gösterilecek
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/                # "Eğitimlerim" + sertifikalarım (kayıtlı kullanıcı paneli)
│   │   │   ├── admin/                    # admin CRUD paneli (role='admin' guard'lı)
│   │   │   │   ├── course-editor/
│   │   │   │   ├── lesson-editor/
│   │   │   │   ├── blog-editor/
│   │   │   │   └── enrollment-approval/  # manuel enrollment onayı (v1 ödeme akışı)
│   │   │   └── checkout/                 # v1: ücretsiz kayıt talebi; v2: ödeme/kupon akışı
│   │   ├── shared/
│   │   │   ├── components/               # header, footer, course-card, cta-button
│   │   │   └── pipes/
│   │   └── app.routes.ts
│   └── assets/
│       └── i18n/
│           ├── tr.json                   # varsayılan dil
│           └── en.json
```

**i18n:** v1'den itibaren TR + EN altyapısı kurulur (Angular built-in i18n yerine `@ngx-translate/core` önerilir — derleme zamanı değil çalışma zamanı dil değişimi sağlar). Tüm sabit metinler `assets/i18n/tr.json` ve `en.json` üzerinden okunur; içerik (kurs/blog) v1'de yalnızca TR girilir, `courses.language`/`blog_posts` alanları ileride çoklu dil içeriğe genişleyebilir.

**Anasayfa bölümleri (bilimdata.com referanslı):**
1. Header (sticky, logo + nav + "Hemen Kayıt Ol" CTA)
2. Hero (başlık + alt metin + 2 CTA)
3. Kategori kartları (dinamik, `categories` tablosundan)
4. "Neden Biz?" değer önerisi bölümü
5. Öne çıkan/popüler kurslar grid'i (Udemy'den farkımız — bilimdata.com'da yok ama gerekli)
6. Öğrenci avantajları (Kuponlar, Portal, Yol Haritaları, İletişim) — kart grid
7. Footer

**YouTube embed player notu:** `course-player` bileşeninde `youtube-player` (npm) veya doğrudan `<iframe src="https://www.youtube.com/embed/{videoId}?rel=0&modestbranding=1">` kullanılacak. Video ID backend'den yalnızca erişim yetkisi varsa gelmeli.

---

## 7. Blog Modülü ve İleride AI Entegrasyonu

- v1: Basit CRUD blog (admin panelden veya doğrudan Supabase Studio'dan yazı girişi).
- v2: `ai_service.py` içinde bir fonksiyon: `summarize_post(content: str) -> str`. Anthropic API (Claude) ile blog yazısının özetini çıkarıp `blog_posts.ai_summary` alanına yazacak. Endpoint: `POST /blog/{id}/summarize` (admin tetikler veya yazı yayınlandığında otomatik tetiklenir).
- İleri aşama fikirleri (backlog, şimdi yapılmayacak): kurs açıklamalarından otomatik SSS üretimi, öğrenci sorularına AI destekli yanıt, video transkript özetleme (YouTube captions API ile).

---

## 8. Ücretsiz İzleme / Ücretli Erişim Mantığı (Özet Kural Seti)

| Kullanıcı Durumu | Katalog | Kurs Detayı | Önizleme Dersi | Kilitli Ders | Blog |
|---|---|---|---|---|---|
| Misafir (giriş yok) | ✅ | ✅ | ✅ | ❌ (login'e yönlendir) | ✅ |
| Üye, kursa kayıtlı değil | ✅ | ✅ | ✅ | ❌ (satın al CTA) | ✅ |
| Üye, kursa kayıtlı (paid/free/coupon) | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 9. Geliştirme Öncelik Sırası (Roadmap)

1. **Faz 0 — Altyapı:** Supabase proje kurulumu, tablo/RLS oluşturma (`certificates` dahil), Google OAuth ayarları, FastAPI + Angular iskeleti, ortam değişkenleri.
2. **Faz 1 — Auth:** Google + email login, profil oluşturma.
3. **Faz 1.5 — i18n Altyapısı:** `@ngx-translate/core` kurulumu, `tr.json`/`en.json` iskeleti, dil seçici komponenti.
4. **Faz 2 — Anasayfa & Katalog:** bilimdata.com tarzı anasayfa, kurs listeleme, kategori filtreleme.
5. **Faz 3 — Kurs Detay & Player:** Müfredat görünümü, YouTube embed, önizleme mantığı.
6. **Faz 4 — Erişim Kontrolü & Kayıt & Admin Paneli:** Enrollment akışı v1'de **manuel/ücretsiz kayıt** (`payment_status='free'`, admin onayı); erişim kuralları; Angular admin modülü (kurs/ders/blog CRUD + enrollment onaylama).
7. **Faz 5 — Ödeme Entegrasyonu (v2, ertelendi):** Iyzico/Stripe, kupon sistemi. v1 kapsamı dışında; manuel kayıt akışı yeterli görülüyor.
8. **Faz 6 — Blog Modülü:** CRUD (admin panelden), listeleme, detay sayfası.
9. **Faz 7 — AI Özetleme:** Blog için AI özet entegrasyonu.
10. **Faz 8 — Kullanıcı Paneli, Sertifika & Yorumlar:** İlerleme takibi, kurs %100 tamamlanınca **PDF sertifika üretimi** (`certificate_service.py`) ve kullanıcı panelinden indirme, değerlendirme sistemi.

---

## 10. Yapılmayacaklar / Kapsam Dışı (Explicit Non-Goals)

- **Kendi video hosting altyapımız YOK.** Tüm videolar YouTube'dan embed edilecek; video dosyası upload özelliği geliştirilmeyecek.
- v1'de canlı ders / webinar özelliği yok.
- v1'de mobil uygulama yok (yalnızca responsive web).
- v1'de çoklu eğitmen marketplace modeli yok (tek kurum/marka olarak başlıyoruz; instructor tablosu ileride marketplace'e genişleyebilir şekilde tasarlandı).

---

## 11. Kod Standartları

- **Angular:** Standalone components, strict TypeScript, RxJS ile reaktif state (NgRx v1'de gerekli değil, basit servis + BehaviorSubject yeterli).
- **FastAPI:** Pydantic v2 modelleri, async endpoint'ler, dependency injection ile auth kontrolü, tüm route'larda tip belirtimi.
- **Supabase:** Migration dosyaları `supabase/migrations/` altında tutulmalı (Supabase CLI ile).
- **Commit mesajları:** Conventional Commits (`feat:`, `fix:`, `chore:` ...).
- **Ortam değişkenleri:** `.env` dosyaları asla commit edilmeyecek; `.env.example` ile dokümante edilecek.

---

## 12. Kapsam Kararları (netleşti)

- **Ödeme:** v1'de manuel/ücretsiz kayıt. Enrollment `payment_status='free'` ile oluşturulur, admin panelden onaylanır. Iyzico/Stripe entegrasyonu Faz 5 (v2) olarak backlog'da.
- **Sertifika:** v1 kapsamında. Kurs %100 tamamlanınca `certificate_service.py` PDF üretir, `certificates` tablosuna ve Supabase Storage'a yazılır.
- **Admin paneli:** Supabase Studio değil, ayrı bir Angular admin modülü (`features/admin/`) + FastAPI `admin.py` router'ı ile yönetilecek.
- **Çoklu dil:** v1'den itibaren TR + EN i18n altyapısı (`@ngx-translate/core`) kurulacak; içerik başlangıçta yalnızca TR girilecek.
