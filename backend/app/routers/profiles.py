from fastapi import APIRouter, Depends, HTTPException

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..models.profiles import ProfileOut, ProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileOut)
async def get_my_profile(user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profil bulunamadı")
    return result.data[0]


@router.patch("/me", response_model=ProfileOut)
async def update_my_profile(
    payload: ProfileUpdate, user: CurrentUser = Depends(get_current_user)
):
    supabase = get_supabase()
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        result = supabase.table("profiles").select("*").eq("id", user.id).execute()
    else:
        result = supabase.table("profiles").update(updates).eq("id", user.id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profil bulunamadı")
    return result.data[0]
