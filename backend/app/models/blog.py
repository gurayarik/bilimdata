from pydantic import BaseModel


class BlogCommentCreate(BaseModel):
    content: str


class UserBlogPostCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: str | None = None
    cover_image_url: str | None = None
    video_url: str | None = None
    category: str | None = None
    tags: list[str] | None = None
