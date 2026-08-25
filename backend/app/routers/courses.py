from fastapi import APIRouter, Depends, HTTPException

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..models.courses import CourseOut, CurriculumSectionOut
from ..services.ai_service import generate_progress_coaching

router = APIRouter(prefix="/courses", tags=["courses"])

COURSE_SELECT = "*, instructor:instructors(id, title, bio, avatar_url, profile_id)"


def _mark_official_instructor(course: dict) -> dict:
    """`instructors.profile_id` gerçek bir kullanıcı hesabına bağlı değilse
    (None ise) bu, BilimData'nın kendi resmi eğitmen kimliğidir — kullanıcıların
    kendi başvurup onaylanarak edindiği eğitmen hesaplarından ayırt etmek için
    kullanılıyor (ör. "Udemy Eğitimlerimiz" bölümünde yalnızca bizim kendi
    kurslarımızı göstermek için)."""
    instructor = course.get("instructor")
    if instructor:
        instructor["is_platform_official"] = instructor.get("profile_id") is None
    return course


@router.get("", response_model=list[CourseOut])
async def list_courses(category_id: str | None = None):
    supabase = get_supabase()
    query = supabase.table("courses").select(COURSE_SELECT).eq("is_published", True)
    if category_id:
        query = query.eq("category_id", category_id)
    result = query.execute()
    return [_mark_official_instructor(course) for course in result.data]


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
    return _mark_official_instructor(result.data[0])


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


@router.get("/{slug}/coach")
async def get_progress_coaching(
    slug: str, ui_language: str | None = None, user: CurrentUser = Depends(get_current_user)
):
    """Kullanıcının bu kurstaki ilerlemesine göre yapay zeka destekli,
    kişisel eğitim koçu tonunda bir değerlendirme üretir (Faz 8 dashboard)."""
    supabase = get_supabase()
    course = supabase.table("courses").select("id, title, language").eq("slug", slug).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    course_id = course.data[0]["id"]
    course_title = course.data[0]["title"]
    reply_language = "en" if course.data[0].get("language") == "en" or ui_language == "en" else "tr"

    sections = (
        supabase.table("course_sections")
        .select("id, order_index, lessons(id, title, description, order_index)")
        .eq("course_id", course_id)
        .order("order_index")
        .execute()
    )
    ordered_lessons = []
    for section in sorted(sections.data, key=lambda s: s["order_index"]):
        for lesson in sorted(section["lessons"], key=lambda lesson: lesson["order_index"]):
            ordered_lessons.append(lesson)
    lesson_ids = [lesson["id"] for lesson in ordered_lessons]

    completed_ids: set[str] = set()
    if lesson_ids:
        progress = (
            supabase.table("lesson_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("completed", True)
            .in_("lesson_id", lesson_ids)
            .execute()
        )
        completed_ids = {row["lesson_id"] for row in progress.data}

    completed_lessons = [
        {"title": lesson["title"], "description": lesson["description"]}
        for lesson in ordered_lessons
        if lesson["id"] in completed_ids
    ][-20:]  # Prompt boyutunu sınırlamak için en fazla en son tamamlanan 20 ders.
    remaining_titles = [lesson["title"] for lesson in ordered_lessons if lesson["id"] not in completed_ids]

    enrollment = (
        supabase.table("enrollments")
        .select("progress_percent")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .execute()
    )
    progress_percent = enrollment.data[0]["progress_percent"] if enrollment.data else 0

    message = await generate_progress_coaching(
        course_title, completed_lessons, remaining_titles, progress_percent, reply_language
    )
    return {"message": message}
