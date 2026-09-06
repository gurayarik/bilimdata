from pydantic import BaseModel


class PathArticleOut(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    order_index: int
    ai_generated: bool = False


class PathArticleSummaryOut(BaseModel):
    id: str
    title: str
    slug: str
    order_index: int


class LearningPathOut(BaseModel):
    id: str
    title: str
    slug: str
    description: str | None = None
    cover_image_url: str | None = None
    category_id: str | None = None
    articles: list[PathArticleSummaryOut] = []


class LearningPathDetailOut(BaseModel):
    id: str
    title: str
    slug: str
    description: str | None = None
    cover_image_url: str | None = None
    category_id: str | None = None
    articles: list[PathArticleOut] = []


class PathArticleCompleteIn(BaseModel):
    completed: bool = True


class PathProgressOut(BaseModel):
    completed_article_ids: list[str]
    progress_percent: int


class PathMyProgressSummaryOut(BaseModel):
    title: str
    slug: str
    cover_image_url: str | None = None
    total_articles: int
    completed_count: int
    progress_percent: int
    next_article_slug: str | None = None
