import json
import re

import httpx

from ..core.config import settings

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_MODEL = "claude-haiku-4-5-20251001"
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"


async def _call_openai_compatible(
    api_url: str,
    api_key: str,
    model: str,
    messages: list[dict],
    max_tokens: int,
    system: str | None,
    timeout: float,
    tokens_param: str,
) -> str:
    """OpenAI ve DeepSeek aynı Chat Completions gövde şemasını kullanıyor;
    yalnızca token limiti parametresinin adı farklı (OpenAI'nin yeni
    modelleri `max_completion_tokens`, DeepSeek `max_tokens` bekliyor)."""
    payload_messages = messages if system is None else [{"role": "system", "content": system}, *messages]
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            api_url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "content-type": "application/json",
            },
            json={
                "model": model,
                tokens_param: max_tokens,
                "messages": payload_messages,
            },
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]


async def _call_llm(
    messages: list[dict], max_tokens: int, system: str | None = None, timeout: float = 60
) -> str:
    """`settings.ai_provider`'a göre Anthropic, OpenAI ya da DeepSeek'e tek
    tip bir sohbet çağrısı yapar ve düz metin yanıtı döndürür. messages:
    [{"role": "user"|"assistant", "content": str}, ...] (system rolü hariç)."""
    if settings.ai_provider == "openai":
        return await _call_openai_compatible(
            OPENAI_API_URL,
            settings.openai_api_key or "",
            settings.openai_model,
            messages,
            max_tokens,
            system,
            timeout,
            tokens_param="max_completion_tokens",
        )

    if settings.ai_provider == "deepseek":
        return await _call_openai_compatible(
            DEEPSEEK_API_URL,
            settings.deepseek_api_key or "",
            settings.deepseek_model,
            messages,
            max_tokens,
            system,
            timeout,
            tokens_param="max_tokens",
        )

    # Varsayılan: Anthropic. Sistem promptunu (kurs bağlamı gibi tekrar eden
    # içerik) `cache_control` ile işaretleyerek prompt caching'i etkinleştiriyoruz
    # — aynı bağlam kısa süre içinde tekrar gönderildiğinde girdi maliyeti düşer.
    async with httpx.AsyncClient(timeout=timeout) as client:
        request_body: dict = {
            "model": ANTHROPIC_MODEL,
            "max_tokens": max_tokens,
            "messages": messages,
        }
        if system is not None:
            request_body["system"] = [
                {"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}
            ]
        response = await client.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": settings.anthropic_api_key or "",
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json=request_body,
        )
        response.raise_for_status()
        blocks = response.json()["content"]
        return next(b["text"] for b in blocks if b["type"] == "text")


async def summarize_post(content: str) -> str:
    """Blog yazısının özetini AI ile üretir (Faz 7)."""
    return await _call_llm(
        messages=[
            {
                "role": "user",
                "content": f"Aşağıdaki blog yazısını 2-3 cümlede özetle:\n\n{content}",
            }
        ],
        max_tokens=300,
    )


async def generate_progress_coaching(
    course_title: str,
    completed_lessons: list[dict],
    remaining_titles: list[str],
    progress_percent: int,
    reply_language: str = "tr",
) -> str:
    """Kullanıcının bir kurstaki ilerlemesine göre kişisel bir eğitim koçu
    gibi motive edici, video bazlı konu tekrarı içeren bir değerlendirme
    üretir (Faz 8 dashboard). completed_lessons: [{"title": ..., "description": ...}].
    reply_language: "tr" | "en" — kurs dili veya kullanıcının arayüz diline göre."""
    language_instruction = (
        "Write your entire response in English."
        if reply_language == "en"
        else "Yanıtının tamamını Türkçe yaz."
    )
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
kutlamasını yaz. Toplam yanıt 200 kelimeyi geçmesin.

{language_instruction}"""

    return await _call_llm(messages=[{"role": "user", "content": prompt}], max_tokens=900)


async def generate_quiz_questions(course_title: str, block_title: str, lessons: list[dict]) -> list[dict]:
    """Bir ders bloğunun içeriğine dayanarak 10 soruluk çoktan seçmeli bir
    sınav üretir. Döndürülen her öğe: {"question", "options" (4 eleman),
    "correct_index"}. lessons: [{"title": ..., "description": ...}]."""
    lessons_block = "\n".join(
        f"- {lesson['title']}: {lesson['description'] or '(açıklama yok)'}" for lesson in lessons
    )

    prompt = f"""Sen bir eğitim içeriği uzmanısın. "{course_title}" adlı eğitimin
"{block_title}" bölümündeki aşağıdaki derslere dayanarak, öğrencinin bu dersleri ne
kadar öğrendiğini ölçen tam 10 adet çoktan seçmeli soru hazırla.

Dersler:
{lessons_block}

Kurallar:
- Her sorunun tam 4 şıkkı olsun, yalnızca bir tanesi doğru olsun.
- Sorular doğrudan yukarıdaki derslerin içeriğiyle ilgili, net ve tek doğru
  cevabı olan sorular olsun.
- Yanıtını YALNIZCA aşağıdaki JSON şemasına birebir uyan, başka hiçbir metin,
  açıklama, markdown işareti veya kod bloğu içermeyen bir JSON dizisi olarak ver:
[{{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0}}]"""

    raw_text = await _call_llm(
        messages=[{"role": "user", "content": prompt}], max_tokens=2500, timeout=90
    )

    # Claude bazen yanıtı ```json ... ``` kod bloğuna sarabiliyor; temizleyip parse ediyoruz.
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text.strip())
    questions = json.loads(cleaned)
    return questions


async def chat_with_course_assistant(
    course_context: str, history: list[dict], message: str, reply_language: str = "tr"
) -> str:
    """Bir kursun müfredat/açıklama bilgisini bağlam (RAG benzeri) olarak
    kullanan, o kursa özel soruları yanıtlayan sohbet asistanı (Faz 8 sonrası
    ek). history: [{"role": "user"|"assistant", "content": str}, ...].
    reply_language: "tr" | "en" — kurs dili veya kullanıcının arayüz diline
    göre belirlenir."""
    language_instruction = (
        "Always answer in English, regardless of the language the question was asked in."
        if reply_language == "en"
        else "Yanıtlarını her zaman Türkçe ver, soru hangi dilde sorulursa sorulsun."
    )

    system_prompt = f"""Sen BilimData eğitim platformunda bu kursa özel bir asistansın. Yalnızca
aşağıdaki kursun içeriği, müfredatı, fiyatı, kapsamı ve kime uygun olduğu
hakkındaki sorulara yanıt veriyorsun. Kısa ve net yanıt ver. {language_instruction}
Kursla ilgisi olmayan bir soru sorulursa, bunun kurs asistanı olduğunu ve
yalnızca bu eğitimle ilgili sorulara yardımcı olabileceğini kibarca belirt.
Video içeriklerinin birebir transkriptine erişimin yok; yalnızca aşağıdaki
müfredat özetine dayanarak yanıt verebilirsin, emin olmadığın ayrıntılar için
öğrenciyi ilgili dersi izlemeye yönlendir.

Yanıtını ASLA markdown (#, ##, **, -, ``` gibi) işaretleriyle biçimlendirme.
Bunun yerine, gerekiyorsa yalnızca şu yalın HTML etiketlerini kullan: <p>,
<strong>, <ul><li>. Çoğu kısa yanıt için tek bir <p> yeterlidir, sohbet
formatında kısa ve doğal yaz — uzun raporlar veya başlıklı bölümler oluşturma.

Kurs Bilgisi:
{course_context}"""

    messages = [*history, {"role": "user", "content": message}]

    return await _call_llm(messages=messages, max_tokens=500, system=system_prompt)
