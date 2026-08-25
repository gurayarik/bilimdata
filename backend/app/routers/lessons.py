from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status

from ..core.security import CurrentUser, get_current_user, get_current_user_optional
from ..core.supabase_client import get_supabase
from ..models.courses import LessonOut

router = APIRouter(prefix="/lessons", tags=["lessons"])

_ACTIVE_STATUSES = ("paid", "free", "coupon")


class LessonProgressUpdate(BaseModel):
    completed: bool
    last_watched_second: int = 0


def _recalculate_course_progress(supabase, user_id: str, course_id: str) -> int:
    sections = supabase.table("course_sections").select("id").eq("course_id", course_id).execute()
    section_ids = [row["id"] for row in sections.data]
    if not section_ids:
        return 0

    lessons = supabase.table("lessons").select("id").in_("section_id", section_ids).execute()
    lesson_ids = [row["id"] for row in lessons.data]
    if not lesson_ids:
        return 0

    completed = (
        supabase.table("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user_id)
        .eq("completed", True)
        .in_("lesson_id", lesson_ids)
        .execute()
    )
    percent = round(len(completed.data) / len(lesson_ids) * 100)
    supabase.table("enrollments").update({"progress_percent": percent}).eq(
        "user_id", user_id
    ).eq("course_id", course_id).execute()
    return percent


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


@router.post("/{lesson_id}/progress")
async def update_lesson_progress(
    lesson_id: str,
    payload: LessonProgressUpdate,
    user: CurrentUser = Depends(get_current_user),
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
    course_id = lesson["course_sections"]["course_id"]

    if not lesson["is_preview"]:
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

    supabase.table("lesson_progress").upsert(
        {
            "user_id": user.id,
            "lesson_id": lesson_id,
            "completed": payload.completed,
            "last_watched_second": payload.last_watched_second,
        },
        on_conflict="user_id,lesson_id",
    ).execute()

    progress_percent = _recalculate_course_progress(supabase, user.id, course_id)
    return {"progress_percent": progress_percent}
