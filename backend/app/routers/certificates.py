from fastapi import APIRouter, Depends, HTTPException

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..services.certificate_service import issue_certificate

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.get("/me")
async def my_certificates(user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("certificates").select("*").eq("user_id", user.id).execute()
    return result.data


@router.post("/{course_id}/issue")
async def issue_my_certificate(course_id: str, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()

    enrollment = (
        supabase.table("enrollments")
        .select("progress_percent")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .execute()
    )
    if not enrollment.data or enrollment.data[0]["progress_percent"] < 100:
        raise HTTPException(status_code=400, detail="Kurs henüz tamamlanmadı")

    course = supabase.table("courses").select("title").eq("id", course_id).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    pdf_url = issue_certificate(
        user_id=user.id,
        course_id=course_id,
        student_name=user.email or user.id,
        course_title=course.data[0]["title"],
    )
    return {"pdf_url": pdf_url}
