from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..models.instructor import InstructorApplicationCreate, InstructorApplicationOut

router = APIRouter(prefix="/instructor-applications", tags=["instructor-applications"])


@router.post("", response_model=InstructorApplicationOut)
async def create_application(
    payload: InstructorApplicationCreate, user: CurrentUser = Depends(get_current_user)
):
    if not payload.kvkk_consent:
        raise HTTPException(status_code=400, detail="KVKK onayı gereklidir")

    supabase = get_supabase()
    existing = (
        supabase.table("instructor_applications")
        .select("id, status")
        .eq("user_id", user.id)
        .in_("status", ["pending", "approved"])
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="Zaten bir başvurunuz var")

    result = (
        supabase.table("instructor_applications")
        .insert(
            {
                "user_id": user.id,
                "title": payload.title,
                "bio": payload.bio,
                "kvkk_consent_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )
    return result.data[0]


@router.get("/me", response_model=InstructorApplicationOut | None)
async def my_application(user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("instructor_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None
