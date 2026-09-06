# CHANGELOG

Bu dosya, projede yapılan önemli değişiklikleri kısaca kaydeder.

## 2026-09-05 — Hosting/DNS, SEO+SSR, Tasarım Yenileme

### Altyapı / Hosting
- Railway plan değerlendirmesi yapıldı — Free tier günlük ~100 kullanıcı için yeterli bulundu.
- Domain yönlendirmesi: Cloudflare DNS üzerinden `bilimdata.com` → Railway frontend servisi, `api.bilimdata.com` → Railway backend servisi (CNAME kayıtları).
- `www.bilimdata.com` → apex domain yönlendirmesi Cloudflare Redirect Rule ile yapıldı (Railway custom domain limiti aşılmadan).
- Railway frontend start command düzeltildi: eski statik dosya sunumu (`npx serve`) yerine Node SSR sunucusu (`node dist/frontend/server/server.mjs`) — `frontend/nixpacks.toml`.

### SEO + Angular SSR (branch: `feature/seo-ssr`, main'e merge edildi)
- `@angular/ssr` kuruldu; Supabase client ve YouTube IFrame API gibi browser-only kodlar SSR-güvenli hale getirildi (`isPlatformBrowser` guard'ları, Supabase realtime transport fix).
- Merkezi `SeoService` (`frontend/src/app/core/services/seo.service.ts`): route bazlı title/description/OG/Twitter/canonical/JSON-LD yönetimi.
- `structured-data.ts`: Course, BlogPosting, Organization için schema.org JSON-LD üreticileri.
- Backend'de dinamik `GET /sitemap.xml` endpoint'i (`backend/app/routers/sitemap.py`) — yayınlanmış kurs/blog sayfalarını otomatik listeler.
- `frontend/public/robots.txt` oluşturuldu (auth'lu route'lar disallow, sitemap referansı).
- `index.html`'de `lang="en"` → `lang="tr"` düzeltmesi.
- Yeni `GET /courses/stats` endpoint'i — ana sayfadaki "Eğitmen" sayacı yerine toplam yayınlanmış ders (video) sayısı gösteriliyor.
- **Google Search Console**: domain doğrulandı, sitemap gönderildi (17 sayfa, durum: Success).

### Tasarım Yenileme (branch: `feature/hero-redesign`, main'e merge edildi)
- **Ana sayfa hero**: nokta doku arka plan, yumuşak turuncu glow efekti, duyuru banner'ı (pulsing dot ile), "BilimData" pill etiketi kaldırıldı.
- **Ders oynatıcı** (`course-player`): BilimData marka başlık şeridi + turuncu gradyan alt çizgi, dış gradyan bezel çerçeve, "Tam Ekran" butonu (Fullscreen API), açılır-kapanır müfredat paneli (panel içinde "Kapat ✕", kapalıyken belirgin turuncu "☰ Müfredat" butonu).
- **Kurs detay sayfası** (`course-detail`): hero'da aynı nokta doku/glow, kart tabanlı açılır-kapanır müfredat akordeonu, yuvarlatılmış satın alma kartı.
- **Bug fix**: Kurs seviyesi rozeti (`beginner`/`intermediate`/`advanced`) `lang="tr"` + CSS `uppercase` kombinasyonu yüzünden "BEGİNNER" gibi hatalı görünüyordu (Türkçe büyük harf kuralı İngilizce kelimeye uygulanıyordu). Artık `course_detail.level_*` i18n anahtarlarıyla doğru Türkçe/İngilizce etiket gösteriliyor.

### Bilinçli tasarım kararları (SSS)
- Sitemap'te tek tek ders/video sayfaları **yok** — bunlar genelde giriş/kayıt gerektiriyor (401/403), robots.txt'de de `Disallow: /courses/*/lessons/` var. Ders içerikleri zaten kurs detay sayfasındaki müfredat listesinden indexleniyor.
- Cloudflare hesabında "AI Crawl Control" özelliği otomatik olarak GPTBot/ClaudeBot/Google-Extended gibi AI eğitim botlarını robots.txt'ye engelli olarak ekliyor (bilinçli bir Cloudflare varsayılanı, proje kodundan gelmiyor).

## 2026-09-06 — Yol Haritaları Modülü (Faz 6.5) (branch: `feature/learning-paths`)

### Yeni modül: metinsel/AI-üretimli öğrenme yolları
- Yeni tablolar: `learning_paths`, `path_articles` — kurs/bölüm/ders yapısıyla aynı iki seviyeli mantık, ama tamamen herkese açık (enrollment/üyelik gerekmez).
- Backend: public `GET /paths`, `GET /paths/{slug}`; admin CRUD (`/admin/paths`, nested `/admin/paths/{id}/articles`) + `POST .../articles/generate` (AI taslak üretimi, admin kaydetmeden önce gözden geçirir).
- Frontend: `features/paths/` (liste + sidebar'lı detay sayfası, her makale ayrı route `/paths/:slug/:articleSlug`), admin `path-editor` (rich-text içerik + "AI ile Üret" butonu).
- Ana sayfadaki "Yol Haritaları" kartı artık gerçek içeriğe bağlı.

### Makale sonu sınavları
- Mevcut kurs sınav sistemi (`quizzes`/`quiz_questions`/`quiz_attempts`) path makalelerine de bağlanabilir hale getirildi (`course_id` ve `block_index` nullable yapıldı, `path_article_id` eklendi — aynı tablolar paylaşılıyor).
- Sınav tamamen herkese açık (giriş yapmadan çözülebilir), yalnızca giriş yapan kullanıcının denemesi kaydedilir.
- **Bug fix**: AI'ın her soruda doğru cevabı hep A şıkkına koyma eğilimi tespit edildi ve düzeltildi — sunucu tarafında şıklar karıştırılıp `correct_index` buna göre güncelleniyor.

### İlerleme takibi (portal deneyimi)
- Yeni tablo: `path_article_progress` — path'te "enrollment" olmadığı için ayrı bir toplam alanı yok, yüzde her istekte canlı hesaplanıyor.
- Path detay sayfasında ilerleme çubuğu, tamamlanan makalelerde ✅ rozet, "Bu Dersi Tamamladım" butonu, path %100 olunca tebrik banner'ı.
- Dashboard'a "Yol Haritalarım" bölümü eklendi (aynı kart/progress-bar dili, "Devam Et" bir sonraki tamamlanmamış makaleye gider).
- Kapsam dışı bırakıldı: path'ler için PDF sertifika (course_id'ye bağımlı mevcut sertifika servisi nedeniyle ayrı bir iş).

### İçerik üretimi: 7 path, 64 makale
- Kullanıcının önerdiği müfredata göre 7 path yayınlandı: Python ile Veri Bilimine Giriş (11), Keşifsel Veri Analizi (9), Veri Görselleştirme (8), SQL ile Veri Analizi (8), İstatistik ve Olasılık (8), Sıfırdan Makine Öğrenmesi (12), Gerçek Projelerle Veri Bilimi (8).
- İçerik `ai_service.generate_path_article` ile üretildi, her makale admin panelinden gözden geçirilebilir/düzenlenebilir durumda (taslak akışı korunuyor).
- **Bug fix (içerik üretimi)**: İlk denemelerde AI çıktısı bazen tam bir `<html><body>` doküman iskeletiyle sarmalanıyor veya \`\`\`html kod bloğuna sarılıyordu, ayrıca "kapsamlı ve detaylı" talimatı sınır konulmadığında konuyu sürekli genişletip token limitinde yarım kesiliyordu. Prompt'a dar kapsam + hedef kelime sayısı (~800-1300) eklenip sarmalama otomatik temizlenerek çözüldü.

### Altyapı: doğrudan veritabanı migration erişimi
- `backend/.env`'e `DATABASE_URL` (doğrudan Postgres bağlantısı) eklendi, `psycopg2-binary` kuruldu — artık şema migration'ları (ALTER TABLE vb.) Supabase SQL editörüne yapıştırmadan doğrudan uygulanabiliyor. Sadece yerel tooling amaçlı, `requirements.txt`'e eklenmedi.

### Bilinçli notlar
- Yerel `.env`'de `AI_PROVIDER=openai` + `gpt-5-mini` kullanıldığında, model uzun/karmaşık promptlarda tüm token bütçesini görünmeyen "reasoning" token'larına harcayıp boş içerik dönebiliyor (`finish_reason: length`, 0 görünür çıktı). Bu proje için içerik üretimi Anthropic (Haiku) ile yapıldı; production'ın hangi sağlayıcıyı kullandığı ayrıca kontrol edilmeli.
