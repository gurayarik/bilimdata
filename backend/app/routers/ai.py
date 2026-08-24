from fastapi import APIRouter, Depends, HTTPException

from ..core.security import require_admin
from ..core.supabase_client import get_supabase
from ..services.ai_service import summarize_post

router = APIRouter(prefix="/blog", tags=["ai"], dependencies=[Depends(require_admin)])


@router.post("/{post_id}/summarize")
async def summarize_blog_post(post_id: str):
    supabase = get_supabase()
    post = supabase.table("blog_posts").select("content").eq("id", post_id).execute()
    if not post.data:
        raise HTTPException(status_code=404, detail="Yazı bulunamadı")

    summary = await summarize_post(post.data[0]["content"])
    supabase.table("blog_posts").update({"ai_summary": summary}).eq("id", post_id).execute()
    return {"ai_summary": summary}
