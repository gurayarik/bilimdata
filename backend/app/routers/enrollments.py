from fastapi import APIRouter, Depends, HTTPException

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..models.enrollments import EnrollmentCreate, EnrollmentOut

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.post("", response_model=EnrollmentOut)
async def create_enrollment(
    payload: EnrollmentCreate, user: CurrentUser = Depends(get_current_user)
):
    """v1'de ödeme sağlayıcı yok. Kurs gerçekten ücretsizse (fiyat 0) kayıt
    anında 'free' statüsüyle tam erişim kazanır. Ücretliyse kayıt 'pending'
    olarak oluşturulur; admin panelden ödeme harici bir yolla (banka
    havalesi vb.) doğrulanıp onaylanana kadar derslere erişim açılmaz."""
    supabase = get_supabase()

    course = (
        supabase.table("courses")
        .select("price, discount_price")
        .eq("id", payload.course_id)
        .execute()
    )
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")

    existing = (
        supabase.table("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", payload.course_id)
        .execute()
    )
    if existing.data:
        # Zaten bir kaydı var — durumunu geriye (ör. paid -> pending) düşürmemek
        # için olduğu gibi döndürülür.
        return existing.data[0]

    row = course.data[0]
    effective_price = row["discount_price"] if row["discount_price"] is not None else row["price"]
    initial_status = "free" if effective_price == 0 else "pending"

    result = (
        supabase.table("enrollments")
        .insert(
            {
                "user_id": user.id,
                "course_id": payload.course_id,
                "payment_status": initial_status,
            }
        )
        .execute()
    )
    return result.data[0]


@router.get("/me", response_model=list[EnrollmentOut])
async def my_enrollments(user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("enrollments").select("*").eq("user_id", user.id).execute()
    return result.data
