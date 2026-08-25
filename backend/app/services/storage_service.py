import uuid

from fastapi import UploadFile

from ..core.supabase_client import get_supabase

LESSON_RESOURCES_BUCKET = "lesson-resources"

_SLIDE_EXTENSIONS = {".ppt", ".pptx", ".key", ".odp"}


def _resource_type(filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return "pdf"
    if any(lower.endswith(ext) for ext in _SLIDE_EXTENSIONS):
        return "slide"
    return "file"


async def upload_lesson_resource(file: UploadFile, lesson_id: str) -> dict:
    """Dosyayı Storage'a yükler ve lessons.resources jsonb dizisine ekler."""
    supabase = get_supabase()

    content = await file.read()
    filename = file.filename or "dosya"
    storage_path = f"{lesson_id}/{uuid.uuid4().hex}-{filename}"

    supabase.storage.from_(LESSON_RESOURCES_BUCKET).upload(
        storage_path,
        content,
        {"content-type": file.content_type or "application/octet-stream"},
    )
    url = supabase.storage.from_(LESSON_RESOURCES_BUCKET).get_public_url(storage_path)

    resource = {"type": _resource_type(filename), "name": filename, "url": url}

    lesson = supabase.table("lessons").select("resources").eq("id", lesson_id).execute()
    current = (lesson.data[0]["resources"] if lesson.data and lesson.data[0]["resources"] else []) or []
    updated = [*current, resource]
    supabase.table("lessons").update({"resources": updated}).eq("id", lesson_id).execute()

    return resource


def delete_lesson_resource(lesson_id: str, index: int) -> list[dict]:
    supabase = get_supabase()
    lesson = supabase.table("lessons").select("resources").eq("id", lesson_id).execute()
    current = (lesson.data[0]["resources"] if lesson.data and lesson.data[0]["resources"] else []) or []
    if 0 <= index < len(current):
        current.pop(index)
    supabase.table("lessons").update({"resources": current}).eq("id", lesson_id).execute()
    return current
