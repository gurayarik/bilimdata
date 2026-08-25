from fastapi import APIRouter, Depends

from ..core.security import CurrentUser, get_current_user_optional
from ..core.supabase_client import get_supabase
from ..models.contact import ContactMessageCreate

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=201)
async def submit_contact_message(
    payload: ContactMessageCreate,
    user: CurrentUser | None = Depends(get_current_user_optional),
):
    """Herkes (üye olsun olmasın) bir soru/şikayet gönderebilir. Kullanıcı
    giriş yapmışsa mesaj hesabıyla ilişkilendirilir."""
    supabase = get_supabase()
    result = (
        supabase.table("contact_messages")
        .insert(
            {
                "user_id": user.id if user else None,
                "name": payload.name,
                "email": payload.email,
                "subject": payload.subject,
                "message": payload.message,
            }
        )
        .execute()
    )
    return result.data[0]
