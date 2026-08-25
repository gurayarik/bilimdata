from pydantic import BaseModel


class InstructorOut(BaseModel):
    id: str
    title: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


class CourseOut(BaseModel):
    id: str
    title: str
    slug: str
    short_description: str | None = None
    description: str | None = None
    cover_image_url: str | None = None
    category_id: str | None = None
    instructor_id: str | None = None
    price: float
    discount_price: float | None = None
    level: str | None = None
    language: str = "tr"
    instructor: InstructorOut | None = None
    provider: str = "internal"
    platform_name: str | None = None
    external_url: str | None = None
    coupon_code: str | None = None


class LessonOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    order_index: int
    is_preview: bool
    duration_seconds: int | None = None
    youtube_video_id: str | None = None


class CurriculumLessonOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    order_index: int
    is_preview: bool
    duration_seconds: int | None = None


class CurriculumSectionOut(BaseModel):
    id: str
    title: str
    order_index: int
    lessons: list[CurriculumLessonOut]
