from pydantic import BaseModel


class InstructorApplicationCreate(BaseModel):
    title: str | None = None
    bio: str | None = None
    kvkk_consent: bool


class InstructorApplicationOut(BaseModel):
    id: str
    user_id: str
    title: str | None = None
    bio: str | None = None
    status: str
    created_at: str
