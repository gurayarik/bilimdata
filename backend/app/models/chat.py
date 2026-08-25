from pydantic import BaseModel


class ChatMessageIn(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessageIn] = []
    ui_language: str | None = None


class ChatResponse(BaseModel):
    reply: str
    remaining_messages: int
