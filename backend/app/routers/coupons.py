from fastapi import APIRouter, Depends, HTTPException

from ..core.security import require_admin
from ..core.supabase_client import get_supabase

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.get("/validate/{code}")
async def validate_coupon(code: str):
    supabase = get_supabase()
    result = supabase.table("coupons").select("*").eq("code", code).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Kupon bulunamadı")
    return result.data[0]


@router.post("", dependencies=[Depends(require_admin)])
async def create_coupon(payload: dict):
    supabase = get_supabase()
    result = supabase.table("coupons").insert(payload).execute()
    return result.data[0]
