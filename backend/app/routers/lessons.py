from fastapi import APIRouter, Depends, HTTPException, status

from ..core.security import CurrentUser, get_current_user_optional
from ..core.supabase_client import get_supabase
from ..models.courses import LessonOut

router = APIRouter(prefix="/lessons", tags=["lessons"])

_ACTIVE_STATUSES = ("paid", "free", "coupon")


@router.get("/{lesson_id}", response_model=LessonOut)
async def get_lesson(
    lesson_id: str, user: CurrentUser | None = Depends(get_current_user_optional)
):
    supabase = get_supabase()

    lesson_result = (
        supabase.table("lessons")
        .select("*, course_sections(course_id)")
        .eq("id", lesson_id)
        .execute()
    )
    if not lesson_result.data:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    lesson = lesson_result.data[0]

    # 1. Önizleme dersi mi? Herkese açık.
    if lesson["is_preview"]:
        return lesson

    # 2. Giriş yapılmış mı?
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Giriş gerekli")

    # 3. Kullanıcı bu kursa kayıtlı mı?
    course_id = lesson["course_sections"]["course_id"]
    enrollment_result = (
        supabase.table("enrollments")
        .select("payment_status")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .execute()
    )
    is_enrolled = any(
        row["payment_status"] in _ACTIVE_STATUSES for row in enrollment_result.data
    )
    if not is_enrolled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Bu eğitime kayıtlı değilsiniz"
        )

    # 4. Erişim onaylandı — video ID döndürülür.
    return lesson
