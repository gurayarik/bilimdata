from fastapi import APIRouter, Depends

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..models.enrollments import EnrollmentCreate, EnrollmentOut

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.post("", response_model=EnrollmentOut)
async def create_enrollment(
    payload: EnrollmentCreate, user: CurrentUser = Depends(get_current_user)
):
    """v1: ödeme sağlayıcı yok — kayıt 'free' statüsüyle oluşturulur ve admin
    panelden onaylanana/kesinleştirilene kadar bu şekilde kalır."""
    supabase = get_supabase()
    result = (
        supabase.table("enrollments")
        .upsert(
            {
                "user_id": user.id,
                "course_id": payload.course_id,
                "payment_status": "free",
            },
            on_conflict="user_id,course_id",
        )
        .execute()
    )
    return result.data[0]


@router.get("/me", response_model=list[EnrollmentOut])
async def my_enrollments(user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("enrollments").select("*").eq("user_id", user.id).execute()
    return result.data
