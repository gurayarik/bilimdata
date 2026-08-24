from fastapi import APIRouter, Depends

from ..core.security import require_admin
from ..core.supabase_client import get_supabase

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/courses")
async def create_course(payload: dict):
    supabase = get_supabase()
    result = supabase.table("courses").insert(payload).execute()
    return result.data[0]


@router.put("/courses/{course_id}")
async def update_course(course_id: str, payload: dict):
    supabase = get_supabase()
    result = supabase.table("courses").update(payload).eq("id", course_id).execute()
    return result.data[0]


@router.post("/lessons")
async def create_lesson(payload: dict):
    supabase = get_supabase()
    result = supabase.table("lessons").insert(payload).execute()
    return result.data[0]


@router.post("/blog")
async def create_blog_post(payload: dict):
    supabase = get_supabase()
    result = supabase.table("blog_posts").insert(payload).execute()
    return result.data[0]


@router.get("/enrollments/pending")
async def list_pending_enrollments():
    supabase = get_supabase()
    result = supabase.table("enrollments").select("*").eq("payment_status", "free").execute()
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
    return result.data[0]
