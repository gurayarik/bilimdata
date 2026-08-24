# BilimData Tarzı Eğitim Platformu — Uygulama Planı

## Context

Repo şu an tamamen boş (yalnızca `CLAUDE.md`, `LICENSE`, `.gitignore` var) — bu bir greenfield kurulum. `CLAUDE.md` mimariyi, şemayı ve yol haritasını (Faz 0–8) zaten tanımlıyor. Bölüm 12'deki açık sorular kullanıcıyla netleştirildi:

- **Ödeme:** v1'de manuel/ücretsiz kayıt (gerçek ödeme sağlayıcı entegrasyonu yok, `enrollments.payment_status = 'free'` + admin onayı). Iyzico/Stripe entegrasyonu v2'ye (Faz 5) ertelendi.
- **Sertifika:** v1 kapsamına alındı (kurs %100 tamamlanınca PDF sertifika üretimi + kullanıcı panelinden indirme).
- **Admin paneli:** Supabase Studio değil, ayrı bir Angular admin modülü (FastAPI CRUD endpoint'leri ile) geliştirilecek.
- **Çoklu dil:** v1'den itibaren TR + EN i18n altyapısı kurulacak (içerik başlangıçta TR olsa da yapı hazır olacak).

Bu değişiklikler `CLAUDE.md`'yi güncellemeyi gerektiriyor (roadmap, DB şeması, modül yapısı) ve ardından Faz 0 (altyapı) için somut bir kurulum planı gerektiriyor. Kod tabanı boş olduğu için kod keşfi gerekmiyor; bu tamamen yeni bir iskelet kurulumu.

## 1. CLAUDE.md Güncellemeleri

Aşağıdaki bölümler kullanıcı kararlarını yansıtacak şekilde güncellenecek:

- **Bölüm 4 (DB Şeması):**
  - `certificates` tablosu eklenecek: `id, user_id, course_id, issued_at, pdf_url, unique(user_id, course_id)`.
  - `profiles.role` enum'una admin panel erişimi netleştirilecek not eklenecek.
- **Bölüm 6 (Angular modül yapısı):** `features/admin/` modülü eklenecek (course-editor, lesson-editor, blog-editor, enrollment-approval). `i18n/` config notu eklenecek (`assets/i18n/tr.json`, `en.json`).
- **Bölüm 5 (FastAPI modül yapısı):** `routers/admin.py`, `routers/certificates.py` eklenecek; `services/certificate_service.py` (PDF üretimi, örn. `reportlab` veya `weasyprint`) eklenecek.
- **Bölüm 9 (Roadmap):** Faz 4'e "manuel enrollment onayı + admin paneli" netleştirmesi, Faz 5 açıklaması "v2'ye ertelendi" olarak güncellenecek, Faz 8'e sertifika üretimi net şekilde dahil edilecek, yeni bir "Faz 1.5 — i18n altyapısı" notu eklenecek.
- **Bölüm 12 (Açık sorular):** Kapatıldı olarak işaretlenecek, kararlar özetlenecek.

## 2. Faz 0 — Altyapı Kurulumu (bir sonraki somut adım)

Kullanıcı onayı sonrası uygulanacak iskelet:

```
bilimdata/
├── CLAUDE.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/{config.py, security.py, supabase_client.py}
│   │   ├── models/
│   │   ├── routers/{courses.py, lessons.py, enrollments.py, coupons.py,
│   │   │            reviews.py, blog.py, admin.py, certificates.py, ai.py}
│   │   ├── services/{youtube.py, ai_service.py, certificate_service.py}
│   │   └── deps.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/app/{core, features/{home,courses,blog,auth,dashboard,admin,checkout}, shared}
│       + assets/i18n/{tr.json, en.json}
└── supabase/
    └── migrations/  (0001_init.sql — profiles, instructors, categories, courses,
                       course_sections, lessons, enrollments, lesson_progress,
                       coupons, reviews, blog_posts, certificates + RLS policyleri)
```

Kurulum adımları:
1. `frontend/`: `ng new` (standalone, strict TS, routing) + `@supabase/supabase-js` + i18n paketi kurulumu.
2. `backend/`: FastAPI iskeleti, `requirements.txt` (fastapi, uvicorn, pydantic v2, python-jose/pyjwt, supabase-py, reportlab/weasyprint).
3. `supabase/migrations/0001_init.sql`: CLAUDE.md Bölüm 4'teki tüm tabloları + `certificates` tablosunu + RLS policy'lerini içerecek.
4. Kök `.env.example` dosyaları (frontend ve backend için ayrı ayrı): Supabase URL/anon key/service key, JWT secret placeholder'ları.
5. `.gitignore` içeriği kontrol edilip `node_modules`, `.env`, `__pycache__`, `dist/` gibi girişlerin var olduğu doğrulanacak (mevcut dosya zaten var, gözden geçirilecek).

## 3. Doğrulama

- `CLAUDE.md` güncellemesi sonrası dosya tekrar okunup tutarlılık kontrol edilecek (şema/modül/roadmap referansları birbiriyle çelişmemeli).
- Faz 0 iskeleti oluşturulduktan sonra: `ng build` (frontend derlenebiliyor mu), `uvicorn app.main:app --reload` ile backend ayağa kalkıyor mu, Supabase migration'ı `supabase db push` veya Studio SQL editor ile hatasız çalışıyor mu kontrol edilecek.

## Sıradaki Adım

Bu plan onaylandıktan sonra önce `CLAUDE.md` yukarıdaki kararlara göre güncellenecek, ardından Faz 0 iskeleti (frontend/backend/supabase dizinleri + temel dosyalar) oluşturulacak. Faz 1 ve sonrası (gerçek auth entegrasyonu, sayfa implementasyonları vb.) bu planın kapsamı dışında — ayrı görevler olarak ele alınacak.
