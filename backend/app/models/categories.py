from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    icon: str | None = None
    description: str | None = None
