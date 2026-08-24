import httpx

from ..core.config import settings

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3/videos"


async def get_video_meta(video_id: str) -> dict:
    """YouTube video süresi/thumbnail bilgisini çeker (kurs dersi eklerken kullanılır)."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            YOUTUBE_API_BASE,
            params={
                "id": video_id,
                "part": "contentDetails,snippet",
                "key": settings.youtube_api_key,
            },
        )
        response.raise_for_status()
        data = response.json()
        if not data.get("items"):
            raise ValueError(f"YouTube video bulunamadı: {video_id}")
        return data["items"][0]
