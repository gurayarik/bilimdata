from fastapi import APIRouter, Depends, HTTPException

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..models.courses import CourseOut, CurriculumSectionOut

router = APIRouter(prefix="/courses", tags=["courses"])

COURSE_SELECT = "*, instructor:instructors(id, title, bio, avatar_url)"


@router.get("", response_model=list[CourseOut])
async def list_courses(category_id: str | None = None):
    supabase = get_supabase()
    query = supabase.table("courses").select(COURSE_SELECT).eq("is_published", True)
    if category_id:
        query = query.eq("category_id", category_id)
    result = query.execute()
    return result.data


@router.get("/{slug}", response_model=CourseOut)
async def get_course(slug: str):
    supabase = get_supabase()
    result = (
        supabase.table("courses")
        .select(COURSE_SELECT)
        .eq("slug", slug)
        .eq("is_published", True)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    return result.data[0]


@router.get("/{slug}/curriculum", response_model=list[CurriculumSectionOut])
async def get_course_curriculum(slug: str):
    supabase = get_supabase()
    course = (
        supabase.table("courses")
        .select("id")
        .eq("slug", slug)
        .eq("is_published", True)
        .execute()
    )
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    sections = (
        supabase.table("course_sections")
        .select(
            "id, title, order_index, "
            "lessons(id, title, description, order_index, is_preview, duration_seconds)"
        )
        .eq("course_id", course.data[0]["id"])
        .order("order_index")
        .execute()
    )
    for section in sections.data:
        section["lessons"].sort(key=lambda lesson: lesson["order_index"])
    return sections.data


@router.get("/{slug}/my-progress")
async def get_my_course_progress(slug: str, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    course = supabase.table("courses").select("id").eq("slug", slug).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    course_id = course.data[0]["id"]

    sections = supabase.table("course_sections").select("id").eq("course_id", course_id).execute()
    section_ids = [row["id"] for row in sections.data]

    lesson_ids: list[str] = []
    if section_ids:
        lessons = supabase.table("lessons").select("id").in_("section_id", section_ids).execute()
        lesson_ids = [row["id"] for row in lessons.data]

    completed_ids: list[str] = []
    if lesson_ids:
        progress = (
            supabase.table("lesson_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("completed", True)
            .in_("lesson_id", lesson_ids)
            .execute()
        )
        completed_ids = [row["lesson_id"] for row in progress.data]

    enrollment = (
        supabase.table("enrollments")
        .select("progress_percent")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .execute()
    )
    progress_percent = enrollment.data[0]["progress_percent"] if enrollment.data else 0

    return {"completed_lesson_ids": completed_ids, "progress_percent": progress_percent}
