from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase

router = APIRouter(prefix="/reviews", tags=["reviews"])

_ACTIVE_STATUSES = ("paid", "free", "coupon")


class ReviewCreate(BaseModel):
    course_id: str
    rating: int
    comment: str | None = None


@router.get("/course/{course_id}")
async def list_reviews(course_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("reviews")
        .select("*, author:profiles(full_name)")
        .eq("course_id", course_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/course/{course_id}/summary")
async def review_summary(course_id: str):
    supabase = get_supabase()
    result = supabase.table("reviews").select("rating").eq("course_id", course_id).execute()
    ratings = [row["rating"] for row in result.data]
    if not ratings:
        return {"average": 0, "count": 0}
    return {"average": round(sum(ratings) / len(ratings), 1), "count": len(ratings)}


@router.post("")
async def create_review(payload: ReviewCreate, user: CurrentUser = Depends(get_current_user)):
    if not 1 <= payload.rating <= 5:
        raise HTTPException(status_code=400, detail="Puan 1-5 arasında olmalı")

    supabase = get_supabase()

    enrollment = (
        supabase.table("enrollments")
        .select("payment_status")
        .eq("user_id", user.id)
        .eq("course_id", payload.course_id)
        .execute()
    )
    is_enrolled = any(row["payment_status"] in _ACTIVE_STATUSES for row in enrollment.data)
    if not is_enrolled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Yalnızca kayıtlı olduğunuz eğitimleri değerlendirebilirsiniz",
        )

    existing = (
        supabase.table("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", payload.course_id)
        .execute()
    )
    if existing.data:
        result = (
            supabase.table("reviews")
            .update({"rating": payload.rating, "comment": payload.comment})
            .eq("id", existing.data[0]["id"])
            .execute()
        )
        return result.data[0]

    result = (
        supabase.table("reviews")
        .insert({**payload.model_dump(), "user_id": user.id})
        .execute()
    )
    return result.data[0]


@router.delete("/{review_id}")
async def delete_review(review_id: str, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    review = supabase.table("reviews").select("user_id").eq("id", review_id).execute()
    if not review.data:
        raise HTTPException(status_code=404, detail="Değerlendirme bulunamadı")
    if review.data[0]["user_id"] != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Bu değerlendirmeyi silme yetkiniz yok")
    supabase.table("reviews").delete().eq("id", review_id).execute()
    return {"ok": True}
