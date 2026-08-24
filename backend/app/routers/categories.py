from fastapi import APIRouter

from ..core.supabase_client import get_supabase
from ..models.categories import CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
async def list_categories():
    supabase = get_supabase()
    result = supabase.table("categories").select("*").execute()
    return result.data
