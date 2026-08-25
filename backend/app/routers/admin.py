from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..core.security import require_admin
from ..core.supabase_client import get_supabase
from ..models.admin import (
    AdminBlogPostCreate,
    AdminBlogPostUpdate,
    AdminCourseCreate,
    AdminCourseUpdate,
    AdminLessonCreate,
    AdminLessonUpdate,
    AdminSectionCreate,
    AdminSectionUpdate,
)
from ..models.contact import ContactReplyIn
from ..services.storage_service import delete_lesson_resource, upload_lesson_resource

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

ADMIN_COURSE_SELECT = "*, instructor:instructors(id, title), category:categories(id, name)"


def _first_or_404(result, detail: str):
    if not result.data:
        raise HTTPException(status_code=404, detail=detail)
    return result.data[0]


# --- Kurslar ---------------------------------------------------------------


@router.get("/courses")
async def list_courses():
    supabase = get_supabase()
    result = supabase.table("courses").select(ADMIN_COURSE_SELECT).order("created_at").execute()
    return result.data


@router.post("/courses")
async def create_course(payload: AdminCourseCreate):
    supabase = get_supabase()
    result = supabase.table("courses").insert(payload.model_dump()).execute()
    return _first_or_404(result, "Kurs oluşturulamadı")


@router.put("/courses/{course_id}")
async def update_course(course_id: str, payload: AdminCourseUpdate):
    supabase = get_supabase()
    updates = payload.model_dump(exclude_unset=True)
    result = supabase.table("courses").update(updates).eq("id", course_id).execute()
    return _first_or_404(result, "Kurs bulunamadı")


@router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    supabase = get_supabase()
    supabase.table("courses").delete().eq("id", course_id).execute()
    return {"ok": True}


# --- Bölümler ----------------------------------------------------------------


@router.get("/courses/{course_id}/sections")
async def list_sections(course_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("course_sections")
        .select(
            "id, title, order_index, "
            "lessons(id, title, description, youtube_video_id, duration_seconds, order_index, is_preview)"
        )
        .eq("course_id", course_id)
        .order("order_index")
        .execute()
    )
    for section in result.data:
        section["lessons"].sort(key=lambda lesson: lesson["order_index"])
    return result.data


@router.post("/courses/{course_id}/sections")
async def create_section(course_id: str, payload: AdminSectionCreate):
    supabase = get_supabase()
    result = (
        supabase.table("course_sections")
        .insert({**payload.model_dump(), "course_id": course_id})
        .execute()
    )
    return _first_or_404(result, "Bölüm oluşturulamadı")


@router.put("/sections/{section_id}")
async def update_section(section_id: str, payload: AdminSectionUpdate):
    supabase = get_supabase()
    updates = payload.model_dump(exclude_unset=True)
    result = supabase.table("course_sections").update(updates).eq("id", section_id).execute()
    return _first_or_404(result, "Bölüm bulunamadı")


@router.delete("/sections/{section_id}")
async def delete_section(section_id: str):
    supabase = get_supabase()
    supabase.table("course_sections").delete().eq("id", section_id).execute()
    return {"ok": True}


# --- Dersler -----------------------------------------------------------------


@router.post("/sections/{section_id}/lessons")
async def create_lesson(section_id: str, payload: AdminLessonCreate):
    supabase = get_supabase()
    result = (
        supabase.table("lessons")
        .insert({**payload.model_dump(), "section_id": section_id})
        .execute()
    )
    return _first_or_404(result, "Ders oluşturulamadı")


@router.put("/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, payload: AdminLessonUpdate):
    supabase = get_supabase()
    updates = payload.model_dump(exclude_unset=True)
    result = supabase.table("lessons").update(updates).eq("id", lesson_id).execute()
    return _first_or_404(result, "Ders bulunamadı")


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str):
    supabase = get_supabase()
    supabase.table("lessons").delete().eq("id", lesson_id).execute()
    return {"ok": True}


@router.post("/lessons/{lesson_id}/resources")
async def upload_lesson_resource_admin(lesson_id: str, file: UploadFile = File(...)):
    return await upload_lesson_resource(file, lesson_id)


@router.delete("/lessons/{lesson_id}/resources/{index}")
async def delete_lesson_resource_admin(lesson_id: str, index: int):
    resources = delete_lesson_resource(lesson_id, index)
    return {"resources": resources}


# --- Blog ----------------------------------------------------------------


@router.get("/blog")
async def list_blog_posts():
    supabase = get_supabase()
    result = (
        supabase.table("blog_posts")
        .select("*, author:profiles(full_name)")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/blog")
async def create_blog_post(payload: AdminBlogPostCreate):
    supabase = get_supabase()
    result = supabase.table("blog_posts").insert(payload.model_dump()).execute()
    return _first_or_404(result, "Yazı oluşturulamadı")


@router.put("/blog/{post_id}")
async def update_blog_post(post_id: str, payload: AdminBlogPostUpdate):
    supabase = get_supabase()
    updates = payload.model_dump(exclude_unset=True)
    result = supabase.table("blog_posts").update(updates).eq("id", post_id).execute()
    return _first_or_404(result, "Yazı bulunamadı")


@router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str):
    supabase = get_supabase()
    supabase.table("blog_posts").delete().eq("id", post_id).execute()
    return {"ok": True}


# --- Eğitmenler (dropdown için) --------------------------------------------


@router.get("/instructors")
async def list_instructors():
    supabase = get_supabase()
    result = supabase.table("instructors").select("id, title").execute()
    return result.data


# --- Enrollment onayı --------------------------------------------------------


@router.get("/enrollments/pending")
async def list_pending_enrollments():
    """Yalnızca ücretli kurslara yapılan ve ödemesi henüz doğrulanmamış
    ('pending') kayıtlar listelenir. 'free' statüsündeki kayıtlar zaten
    gerçekten ücretsiz kurslar için anında tam erişim kazanmıştır, onay
    gerektirmez."""
    supabase = get_supabase()
    result = (
        supabase.table("enrollments")
        .select("*, course:courses(title), user:profiles(full_name)")
        .eq("payment_status", "pending")
        .execute()
    )
    return result.data


@router.put("/enrollments/{enrollment_id}/approve")
async def approve_enrollment(enrollment_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("enrollments")
        .update({"payment_status": "paid"})
        .eq("id", enrollment_id)
        .execute()
    )
    return _first_or_404(result, "Kayıt bulunamadı")


# --- Eğitmen başvuruları -----------------------------------------------------


@router.get("/instructor-applications")
async def list_instructor_applications(status_filter: str = "pending"):
    supabase = get_supabase()
    result = (
        supabase.table("instructor_applications")
        .select(
            "*, applicant:profiles!instructor_applications_user_id_fkey(full_name, avatar_url)"
        )
        .eq("status", status_filter)
        .order("created_at")
        .execute()
    )
    return result.data


@router.put("/instructor-applications/{application_id}/approve")
async def approve_instructor_application(application_id: str):
    supabase = get_supabase()
    application = (
        supabase.table("instructor_applications").select("*").eq("id", application_id).execute()
    )
    app_row = _first_or_404(application, "Başvuru bulunamadı")

    existing_instructor = (
        supabase.table("instructors")
        .select("id")
        .eq("profile_id", app_row["user_id"])
        .execute()
    )
    if not existing_instructor.data:
        profile = (
            supabase.table("profiles")
            .select("avatar_url")
            .eq("id", app_row["user_id"])
            .execute()
        )
        avatar_url = profile.data[0]["avatar_url"] if profile.data else None
        supabase.table("instructors").insert(
            {
                "profile_id": app_row["user_id"],
                "title": app_row["title"],
                "bio": app_row["bio"],
                "avatar_url": avatar_url,
            }
        ).execute()

    supabase.table("profiles").update({"role": "instructor"}).eq(
        "id", app_row["user_id"]
    ).execute()

    supabase.table("instructor_applications").update(
        {"status": "approved", "reviewed_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", application_id).execute()

    auth_user = supabase.auth.admin.get_user_by_id(app_row["user_id"])
    return {
        "ok": True,
        "reminder": "Bu kullanıcıyı YouTube Studio > Ayarlar > İzinler'den kanala editör olarak eklemeyi unutmayın.",
        "user_email": auth_user.user.email if auth_user and auth_user.user else None,
    }


@router.put("/instructor-applications/{application_id}/reject")
async def reject_instructor_application(application_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("instructor_applications")
        .update({"status": "rejected", "reviewed_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", application_id)
        .execute()
    )
    return _first_or_404(result, "Başvuru bulunamadı")


# --- İletişim mesajları -------------------------------------------------------


@router.get("/contact-messages")
async def list_contact_messages(status_filter: str | None = None):
    """status_filter verilmezse tüm mesajlar (en yeni önce) döner."""
    supabase = get_supabase()
    query = supabase.table("contact_messages").select("*").order("created_at", desc=True)
    if status_filter:
        query = query.eq("status", status_filter)
    result = query.execute()
    return result.data


@router.put("/contact-messages/{message_id}/reply")
async def reply_contact_message(message_id: str, payload: ContactReplyIn):
    """Yanıt yalnızca sistemde kaydedilir; kullanıcıya e-posta gönderimi
    yapılmaz — admin, mesajdaki e-posta adresi üzerinden kullanıcıya ayrıca
    dönüş yapmalıdır."""
    supabase = get_supabase()
    result = (
        supabase.table("contact_messages")
        .update(
            {
                "admin_reply": payload.reply,
                "status": "answered",
                "replied_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("id", message_id)
        .execute()
    )
    return _first_or_404(result, "Mesaj bulunamadı")
