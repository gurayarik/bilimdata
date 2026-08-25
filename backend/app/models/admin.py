from pydantic import BaseModel


class AdminCourseCreate(BaseModel):
    title: str
    slug: str
    short_description: str | None = None
    description: str | None = None
    cover_image_url: str | None = None
    category_id: str | None = None
    instructor_id: str | None = None
    price: float = 0
    discount_price: float | None = None
    level: str | None = None
    language: str = "tr"
    is_published: bool = False
    provider: str = "internal"
    platform_name: str | None = None
    external_url: str | None = None
    coupon_code: str | None = None


class AdminCourseUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    short_description: str | None = None
    description: str | None = None
    cover_image_url: str | None = None
    category_id: str | None = None
    instructor_id: str | None = None
    price: float | None = None
    discount_price: float | None = None
    level: str | None = None
    language: str | None = None
    is_published: bool | None = None
    provider: str | None = None
    platform_name: str | None = None
    external_url: str | None = None
    coupon_code: str | None = None


class AdminSectionCreate(BaseModel):
    title: str
    order_index: int


class AdminSectionUpdate(BaseModel):
    title: str | None = None
    order_index: int | None = None


class AdminLessonCreate(BaseModel):
    title: str
    description: str | None = None
    youtube_video_id: str
    duration_seconds: int | None = None
    order_index: int
    is_preview: bool = False


class AdminLessonUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    youtube_video_id: str | None = None
    duration_seconds: int | None = None
    order_index: int | None = None
    is_preview: bool | None = None


class AdminBlogPostCreate(BaseModel):
    title: str
    slug: str
    cover_image_url: str | None = None
    video_url: str | None = None
    content: str
    excerpt: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_published: bool = False


class AdminBlogPostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    cover_image_url: str | None = None
    video_url: str | None = None
    content: str | None = None
    excerpt: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_published: bool | None = None
