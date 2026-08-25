from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..core.security import (
    CurrentUser,
    get_instructor_id_for_user,
    require_instructor_or_admin,
)
from ..core.supabase_client import get_supabase
from ..models.admin import (
    AdminCourseCreate,
    AdminCourseUpdate,
    AdminLessonCreate,
    AdminLessonUpdate,
    AdminSectionCreate,
    AdminSectionUpdate,
)
from ..services.storage_service import delete_lesson_resource, upload_lesson_resource

router = APIRouter(
    prefix="/instructor", tags=["instructor"], dependencies=[Depends(require_instructor_or_admin)]
)


def _first_or_404(result, detail: str):
    if not result.data:
        raise HTTPException(status_code=404, detail=detail)
    return result.data[0]


def _resolve_instructor_id(user: CurrentUser) -> str | None:
    """Admin için None (kısıtlama yok anlamına gelir), eğitmen için kendi instructor.id'si."""
    if user.role == "admin":
        return None
    instructor_id = get_instructor_id_for_user(user.id)
    if instructor_id is None:
        raise HTTPException(status_code=403, detail="Eğitmen kaydınız bulunamadı")
    return instructor_id


def _assert_owns_course(supabase, course_id: str, instructor_id: str | None):
    if instructor_id is None:
        return
    course = supabase.table("courses").select("instructor_id").eq("id", course_id).execute()
    row = _first_or_404(course, "Kurs bulunamadı")
    if row["instructor_id"] != instructor_id:
        raise HTTPException(status_code=403, detail="Bu kurs size ait değil")


def _assert_owns_section(supabase, section_id: str, instructor_id: str | None):
    if instructor_id is None:
        return
    section = (
        supabase.table("course_sections")
        .select("course_id, courses(instructor_id)")
        .eq("id", section_id)
        .execute()
    )
    row = _first_or_404(section, "Bölüm bulunamadı")
    if row["courses"]["instructor_id"] != instructor_id:
        raise HTTPException(status_code=403, detail="Bu bölüm size ait değil")


def _assert_owns_lesson(supabase, lesson_id: str, instructor_id: str | None):
    if instructor_id is None:
        return
    lesson = (
        supabase.table("lessons")
        .select("section_id, course_sections(course_id, courses(instructor_id))")
        .eq("id", lesson_id)
        .execute()
    )
    row = _first_or_404(lesson, "Ders bulunamadı")
    if row["course_sections"]["courses"]["instructor_id"] != instructor_id:
        raise HTTPException(status_code=403, detail="Bu ders size ait değil")


# --- Kurslar -----------------------------------------------------------------


@router.get("/courses")
async def list_my_courses(user: CurrentUser = Depends(require_instructor_or_admin)):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    query = supabase.table("courses").select("*, category:categories(id, name)")
    if instructor_id is not None:
        query = query.eq("instructor_id", instructor_id)
    result = query.order("created_at").execute()
    return result.data


@router.post("/courses")
async def create_my_course(
    payload: AdminCourseCreate, user: CurrentUser = Depends(require_instructor_or_admin)
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    data = payload.model_dump()
    if instructor_id is not None:
        data["instructor_id"] = instructor_id
        data["provider"] = "internal"
        data["external_url"] = None
        data["coupon_code"] = None
    result = supabase.table("courses").insert(data).execute()
    return _first_or_404(result, "Kurs oluşturulamadı")


@router.put("/courses/{course_id}")
async def update_my_course(
    course_id: str,
    payload: AdminCourseUpdate,
    user: CurrentUser = Depends(require_instructor_or_admin),
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_course(supabase, course_id, instructor_id)
    updates = payload.model_dump(exclude_unset=True)
    updates.pop("instructor_id", None)
    result = supabase.table("courses").update(updates).eq("id", course_id).execute()
    return _first_or_404(result, "Kurs bulunamadı")


@router.delete("/courses/{course_id}")
async def delete_my_course(
    course_id: str, user: CurrentUser = Depends(require_instructor_or_admin)
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_course(supabase, course_id, instructor_id)
    supabase.table("courses").delete().eq("id", course_id).execute()
    return {"ok": True}


# --- Bölümler ------------------------------------------------------------------


@router.get("/courses/{course_id}/sections")
async def list_my_sections(
    course_id: str, user: CurrentUser = Depends(require_instructor_or_admin)
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_course(supabase, course_id, instructor_id)
    result = (
        supabase.table("course_sections")
        .select(
            "id, title, order_index, "
            "lessons(id, title, description, youtube_video_id, duration_seconds, "
            "order_index, is_preview, resources)"
        )
        .eq("course_id", course_id)
        .order("order_index")
        .execute()
    )
    for section in result.data:
        section["lessons"].sort(key=lambda lesson: lesson["order_index"])
    return result.data


@router.post("/courses/{course_id}/sections")
async def create_my_section(
    course_id: str,
    payload: AdminSectionCreate,
    user: CurrentUser = Depends(require_instructor_or_admin),
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_course(supabase, course_id, instructor_id)
    result = (
        supabase.table("course_sections")
        .insert({**payload.model_dump(), "course_id": course_id})
        .execute()
    )
    return _first_or_404(result, "Bölüm oluşturulamadı")


@router.put("/sections/{section_id}")
async def update_my_section(
    section_id: str,
    payload: AdminSectionUpdate,
    user: CurrentUser = Depends(require_instructor_or_admin),
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_section(supabase, section_id, instructor_id)
    updates = payload.model_dump(exclude_unset=True)
    result = supabase.table("course_sections").update(updates).eq("id", section_id).execute()
    return _first_or_404(result, "Bölüm bulunamadı")


@router.delete("/sections/{section_id}")
async def delete_my_section(
    section_id: str, user: CurrentUser = Depends(require_instructor_or_admin)
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_section(supabase, section_id, instructor_id)
    supabase.table("course_sections").delete().eq("id", section_id).execute()
    return {"ok": True}


# --- Dersler -------------------------------------------------------------------


@router.post("/sections/{section_id}/lessons")
async def create_my_lesson(
    section_id: str,
    payload: AdminLessonCreate,
    user: CurrentUser = Depends(require_instructor_or_admin),
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_section(supabase, section_id, instructor_id)
    result = (
        supabase.table("lessons")
        .insert({**payload.model_dump(), "section_id": section_id})
        .execute()
    )
    return _first_or_404(result, "Ders oluşturulamadı")


@router.put("/lessons/{lesson_id}")
async def update_my_lesson(
    lesson_id: str,
    payload: AdminLessonUpdate,
    user: CurrentUser = Depends(require_instructor_or_admin),
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_lesson(supabase, lesson_id, instructor_id)
    updates = payload.model_dump(exclude_unset=True)
    result = supabase.table("lessons").update(updates).eq("id", lesson_id).execute()
    return _first_or_404(result, "Ders bulunamadı")


@router.delete("/lessons/{lesson_id}")
async def delete_my_lesson(
    lesson_id: str, user: CurrentUser = Depends(require_instructor_or_admin)
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_lesson(supabase, lesson_id, instructor_id)
    supabase.table("lessons").delete().eq("id", lesson_id).execute()
    return {"ok": True}


# --- Ders kaynakları (PDF/slayt) ------------------------------------------------


@router.post("/lessons/{lesson_id}/resources")
async def upload_my_lesson_resource(
    lesson_id: str,
    file: UploadFile = File(...),
    user: CurrentUser = Depends(require_instructor_or_admin),
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_lesson(supabase, lesson_id, instructor_id)
    return await upload_lesson_resource(file, lesson_id)


@router.delete("/lessons/{lesson_id}/resources/{index}")
async def delete_my_lesson_resource(
    lesson_id: str, index: int, user: CurrentUser = Depends(require_instructor_or_admin)
):
    supabase = get_supabase()
    instructor_id = _resolve_instructor_id(user)
    _assert_owns_lesson(supabase, lesson_id, instructor_id)
    resources = delete_lesson_resource(lesson_id, index)
    return {"resources": resources}
