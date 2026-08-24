from pydantic import BaseModel
from fastapi import APIRouter, Depends

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    course_id: str
    rating: int
    comment: str | None = None


@router.get("/course/{course_id}")
async def list_reviews(course_id: str):
    supabase = get_supabase()
    result = supabase.table("reviews").select("*").eq("course_id", course_id).execute()
    return result.data


@router.post("")
async def create_review(payload: ReviewCreate, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("reviews")
        .insert({**payload.model_dump(), "user_id": user.id})
        .execute()
    )
    return result.data[0]
