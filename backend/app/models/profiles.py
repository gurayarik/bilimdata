from pydantic import BaseModel


class ProfileOut(BaseModel):
    id: str
    full_name: str | None = None
    avatar_url: str | None = None
    role: str


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
