from fastapi import APIRouter, HTTPException

from ..core.supabase_client import get_supabase

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("")
async def list_posts():
    supabase = get_supabase()
    result = supabase.table("blog_posts").select("*").eq("is_published", True).execute()
    return result.data


@router.get("/{slug}")
async def get_post(slug: str):
    supabase = get_supabase()
    result = (
        supabase.table("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", True)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Yazı bulunamadı")
    return result.data[0]
