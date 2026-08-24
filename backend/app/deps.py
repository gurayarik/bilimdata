from fastapi import Depends, HTTPException, status

from .core.security import CurrentUser, get_current_user, get_current_user_optional, require_admin
from .core.supabase_client import get_supabase

__all__ = [
    "CurrentUser",
    "get_current_user",
    "get_current_user_optional",
    "require_admin",
    "require_enrollment",
]

_ACTIVE_STATUSES = ("paid", "free", "coupon")


async def require_enrollment(course_id: str, user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    supabase = get_supabase()
    result = (
        supabase.table("enrollments")
        .select("id, payment_status")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .execute()
    )
    rows = [row for row in result.data if row["payment_status"] in _ACTIVE_STATUSES]
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Bu eğitime kayıtlı değilsiniz"
        )
    return user
