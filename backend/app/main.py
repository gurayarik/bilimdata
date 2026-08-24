from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .routers import (
    admin,
    ai,
    blog,
    categories,
    certificates,
    coupons,
    courses,
    enrollments,
    lessons,
    profiles,
    reviews,
)

app = FastAPI(title="BilimData API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profiles.router)
app.include_router(categories.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(enrollments.router)
app.include_router(coupons.router)
app.include_router(reviews.router)
app.include_router(blog.router)
app.include_router(admin.router)
app.include_router(certificates.router)
app.include_router(ai.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
