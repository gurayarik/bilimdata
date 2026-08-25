from datetime import datetime

from pydantic import BaseModel


class ContactMessageCreate(BaseModel):
    name: str
    email: str
    subject: str | None = None
    message: str


class ContactMessageOut(BaseModel):
    id: str
    user_id: str | None = None
    name: str
    email: str
    subject: str | None = None
    message: str
    status: str
    admin_reply: str | None = None
    replied_at: datetime | None = None
    created_at: datetime


class ContactReplyIn(BaseModel):
    reply: str
