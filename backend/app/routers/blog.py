from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..core.security import CurrentUser, get_current_user, get_current_user_optional
from ..core.supabase_client import get_supabase
from ..models.blog import BlogCommentCreate, UserBlogPostCreate
from ..services.storage_service import upload_blog_image

router = APIRouter(prefix="/blog", tags=["blog"])


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), user: CurrentUser = Depends(get_current_user)):
    url = await upload_blog_image(file, user.id)
    return {"url": url}


@router.get("")
async def list_posts():
    supabase = get_supabase()
    result = supabase.table("blog_posts").select("*").eq("is_published", True).execute()
    return result.data


@router.get("/my-posts")
async def my_posts(user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("blog_posts")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/my-posts")
async def create_my_post(payload: UserBlogPostCreate, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    data = payload.model_dump()
    data["author_id"] = user.id
    data["is_published"] = False
    result = supabase.table("blog_posts").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Yazı gönderilemedi")
    return result.data[0]


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


@router.get("/{post_id}/comments")
async def list_comments(post_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("blog_comments")
        .select("id, content, created_at, user_id, author:profiles(full_name, avatar_url)")
        .eq("post_id", post_id)
        .order("created_at")
        .execute()
    )
    return result.data


@router.post("/{post_id}/comments")
async def create_comment(
    post_id: str, payload: BlogCommentCreate, user: CurrentUser = Depends(get_current_user)
):
    supabase = get_supabase()
    result = (
        supabase.table("blog_comments")
        .insert({"post_id": post_id, "user_id": user.id, "content": payload.content})
        .execute()
    )
    return result.data[0]


@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    comment = supabase.table("blog_comments").select("user_id").eq("id", comment_id).execute()
    if not comment.data:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    if comment.data[0]["user_id"] != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Bu yorumu silemezsiniz")
    supabase.table("blog_comments").delete().eq("id", comment_id).execute()
    return {"ok": True}


@router.get("/{post_id}/likes")
async def get_likes(post_id: str, user: CurrentUser | None = Depends(get_current_user_optional)):
    supabase = get_supabase()
    result = supabase.table("blog_likes").select("user_id").eq("post_id", post_id).execute()
    liked_by_me = bool(user) and any(row["user_id"] == user.id for row in result.data)
    return {"count": len(result.data), "liked_by_me": liked_by_me}


@router.post("/{post_id}/like")
async def toggle_like(post_id: str, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    existing = (
        supabase.table("blog_likes")
        .select("id")
        .eq("post_id", post_id)
        .eq("user_id", user.id)
        .execute()
    )
    if existing.data:
        supabase.table("blog_likes").delete().eq("id", existing.data[0]["id"]).execute()
        liked = False
    else:
        supabase.table("blog_likes").insert({"post_id": post_id, "user_id": user.id}).execute()
        liked = True

    count = supabase.table("blog_likes").select("id").eq("post_id", post_id).execute()
    return {"liked": liked, "count": len(count.data)}
