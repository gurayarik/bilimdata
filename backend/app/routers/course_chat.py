import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..models.chat import ChatRequest, ChatResponse
from ..services.ai_service import chat_with_course_assistant

router = APIRouter(prefix="/courses", tags=["course-chat"])

DAILY_MESSAGE_LIMIT = 40
MAX_HISTORY_TURNS = 10  # Prompt boyutunu sınırlamak için yalnızca son N mesaj gönderilir.


def _check_and_increment_usage(supabase, user_id: str) -> int:
    """Kullanıcının bugünkü mesaj sayısını kontrol edip artırır. Limit
    aşıldıysa 429 fırlatır, aksi halde kalan hakkı döner."""
    today = datetime.date.today().isoformat()
    existing = (
        supabase.table("ai_chat_usage")
        .select("id, message_count")
        .eq("user_id", user_id)
        .eq("usage_date", today)
        .execute()
    )
    if existing.data:
        row = existing.data[0]
        if row["message_count"] >= DAILY_MESSAGE_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Günlük soru limitine ({DAILY_MESSAGE_LIMIT}) ulaştın, yarın tekrar deneyebilirsin.",
            )
        new_count = row["message_count"] + 1
        supabase.table("ai_chat_usage").update({"message_count": new_count}).eq("id", row["id"]).execute()
    else:
        new_count = 1
        supabase.table("ai_chat_usage").insert(
            {"user_id": user_id, "usage_date": today, "message_count": new_count}
        ).execute()
    return DAILY_MESSAGE_LIMIT - new_count


def _build_course_context(supabase, course_id: str, course: dict) -> str:
    sections = (
        supabase.table("course_sections")
        .select("title, order_index, lessons(title, description, order_index)")
        .eq("course_id", course_id)
        .order("order_index")
        .execute()
    )
    price = course.get("price") or 0
    discount_price = course.get("discount_price")
    effective_price = discount_price if discount_price is not None else price
    if effective_price == 0:
        price_line = "Bu eğitim tamamen ücretsizdir."
    elif discount_price is not None:
        price_line = f"Normal fiyatı {price} TL, indirimli fiyatı {discount_price} TL."
    else:
        price_line = f"Fiyatı {price} TL."

    provider = course.get("provider")
    if provider in ("udemy", "external"):
        platform = "Udemy" if provider == "udemy" else (course.get("platform_name") or "harici bir platform")
        price_line += f" Bu eğitim {platform} üzerinden satın alınıyor (platform dışı satış)."
        if course.get("coupon_code"):
            price_line += " Kupon kodu ile indirimli alınabilir."

    lines = [
        f"Başlık: {course['title']}",
        f"Seviye: {course.get('level') or 'belirtilmemiş'}",
        f"Fiyat: {price_line}",
        f"Kısa açıklama: {course.get('short_description') or '-'}",
        f"Açıklama: {course.get('description') or '-'}",
        "Müfredat:",
    ]
    for section in sorted(sections.data, key=lambda s: s["order_index"]):
        lines.append(f"- Bölüm: {section['title']}")
        for lesson in sorted(section["lessons"], key=lambda lesson: lesson["order_index"]):
            description = (lesson["description"] or "").strip()
            if len(description) > 200:
                description = description[:200] + "…"
            lines.append(f"  - {lesson['title']}: {description or '(açıklama yok)'}")
    return "\n".join(lines)


@router.post("/{slug}/chat", response_model=ChatResponse)
async def chat_with_course(slug: str, payload: ChatRequest, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    course = supabase.table("courses").select("*").eq("slug", slug).eq("is_published", True).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    course_row = course.data[0]

    remaining = _check_and_increment_usage(supabase, user.id)

    context = _build_course_context(supabase, course_row["id"], course_row)
    history = [{"role": m.role, "content": m.content} for m in payload.history[-MAX_HISTORY_TURNS:]]
    reply_language = "en" if course_row.get("language") == "en" or payload.ui_language == "en" else "tr"
    reply = await chat_with_course_assistant(context, history, payload.message, reply_language)

    return {"reply": reply, "remaining_messages": remaining}
