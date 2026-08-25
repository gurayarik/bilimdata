import httpx

from ..core.config import settings

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"


async def summarize_post(content: str) -> str:
    """Blog yazısının özetini Claude ile üretir (Faz 7)."""
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": settings.anthropic_api_key or "",
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-5",
                "max_tokens": 300,
                "messages": [
                    {
                        "role": "user",
                        "content": f"Aşağıdaki blog yazısını 2-3 cümlede özetle:\n\n{content}",
                    }
                ],
            },
        )
        response.raise_for_status()
        blocks = response.json()["content"]
        return next(b["text"] for b in blocks if b["type"] == "text")


async def generate_progress_coaching(
    course_title: str,
    completed_lessons: list[dict],
    remaining_titles: list[str],
    progress_percent: int,
) -> str:
    """Kullanıcının bir kurstaki ilerlemesine göre kişisel bir eğitim koçu
    gibi motive edici, video bazlı konu tekrarı içeren bir değerlendirme
    üretir (Faz 8 dashboard). completed_lessons: [{"title": ..., "description": ...}]."""
    completed_block = (
        "\n".join(
            f"- {lesson['title']}: {lesson['description'] or '(açıklama yok)'}"
            for lesson in completed_lessons
        )
        or "(henüz tamamlanan ders yok)"
    )
    remaining_list = "\n".join(f"- {title}" for title in remaining_titles[:8]) or "(kalan ders yok, kurs tamamlandı)"

    prompt = f"""Sen deneyimli, sıcak ve motive edici bir eğitim koçusun. Bir öğrencinin
"{course_title}" adlı eğitimdeki ilerlemesini değerlendiriyorsun. Öğrenci şu ana kadar
%{progress_percent} tamamladı.

Tamamladığı dersler (video başlığı: video içeriğinin açıklaması):
{completed_block}

Henüz izlemediği (sıradaki) dersler:
{remaining_list}

Öğrenciye doğrudan hitap ederek (sen dili ile), yanıtını şu YALIN HTML etiketleriyle
biçimlendir (başka hiçbir etiket, markdown işareti veya kod bloğu kullanma, düz
metinle HTML'e başla):
- <h4> ile kısa bir başlık
- <p> ile 1-2 cümlelik genel motive edici giriş
- <h4>Konu Tekrarı</h4> altında <ul><li> ile tamamladığı HER video için, o videoda
  öğrendiği somut konuyu 1 cümlede video bazlı özetleyen bir madde (video başlığını
  <strong> ile vurgula, ardından o dersten öğrendiği asıl bilgiyi tekrar ettir —
  yalnızca başlığı tekrar etme, açıklamadaki içeriği kullanarak gerçek bir konu
  tekrarı yap)
- <h4>Sırada Ne Var</h4> altında <p> ile sıradaki 1-2 konudan bahseden kısa bir
  paragraf
- En sonda <p><strong>...</strong></p> ile kısa, motive edici bir kapanış cümlesi

Kalan ders yoksa (kurs tamamlandıysa) "Sırada Ne Var" yerine kursu bitirmiş olmanın
kutlamasını yaz. Toplam yanıt 200 kelimeyi geçmesin."""

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": settings.anthropic_api_key or "",
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-5",
                "max_tokens": 900,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        response.raise_for_status()
        blocks = response.json()["content"]
        return next(b["text"] for b in blocks if b["type"] == "text")
