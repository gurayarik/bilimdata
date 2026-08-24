import httpx

from ..core.config import settings

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"


async def summarize_post(content: str) -> str:
    """Blog yazısının özetini Claude ile üretir (Faz 7)."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": settings.anthropic_api_key or "",
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-5",
                "max_tokens": 300,
                "messages": [
                    {
                        "role": "user",
                        "content": f"Aşağıdaki blog yazısını 2-3 cümlede özetle:\n\n{content}",
                    }
                ],
            },
        )
        response.raise_for_status()
        blocks = response.json()["content"]
        return next(b["text"] for b in blocks if b["type"] == "text")
