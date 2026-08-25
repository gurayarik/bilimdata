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
    completed_titles: list[str],
    remaining_titles: list[str],
    progress_percent: int,
) -> str:
    """Kullanıcının bir kurstaki ilerlemesine göre kişisel bir eğitim koçu
    gibi motive edici, Türkçe bir özet üretir (Faz 8 dashboard)."""
    completed_list = "\n".join(f"- {title}" for title in completed_titles) or "(henüz yok)"
    remaining_list = "\n".join(f"- {title}" for title in remaining_titles[:8]) or "(kalan ders yok, kurs tamamlandı)"

    prompt = f"""Sen deneyimli, sıcak ve motive edici bir eğitim koçusun. Bir öğrencinin
"{course_title}" adlı eğitimdeki ilerlemesini değerlendiriyorsun. Öğrenci şu ana kadar
%{progress_percent} tamamladı.

Tamamladığı dersler:
{completed_list}

Henüz izlemediği (sıradaki) dersler:
{remaining_list}

Öğrenciye doğrudan hitap ederek (sen dili ile), 3-4 cümlelik, samimi ve motive edici bir
Türkçe değerlendirme yaz. Şu ana kadar öğrendiği konuları kısaca özetle, sırada onu neyin
beklediğini belirt ve devam etmesi için motive edici bir kapanış cümlesi kur. Liste veya
madde işareti kullanma, akıcı bir paragraf yaz."""

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
                "max_tokens": 400,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        response.raise_for_status()
        blocks = response.json()["content"]
        return next(b["text"] for b in blocks if b["type"] == "text")
