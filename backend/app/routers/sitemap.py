from xml.etree.ElementTree import Element, SubElement, tostring

from fastapi import APIRouter, Response

from ..core.config import settings
from ..core.supabase_client import get_supabase

router = APIRouter(tags=["sitemap"])

STATIC_PATHS = ["", "/courses", "/deals", "/contact", "/privacy", "/terms", "/blog", "/paths"]

SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


def _add_url(urlset: Element, loc: str, lastmod: str | None = None) -> None:
    url_el = SubElement(urlset, "url")
    loc_el = SubElement(url_el, "loc")
    loc_el.text = loc
    if lastmod:
        lastmod_el = SubElement(url_el, "lastmod")
        lastmod_el.text = lastmod


@router.get("/sitemap.xml")
async def get_sitemap():
    supabase = get_supabase()
    base = settings.site_base_url.rstrip("/")

    urlset = Element("urlset", xmlns=SITEMAP_NS)

    for path in STATIC_PATHS:
        _add_url(urlset, f"{base}{path}")

    courses = (
        supabase.table("courses")
        .select("slug, created_at")
        .eq("is_published", True)
        .execute()
    )
    for course in courses.data:
        _add_url(urlset, f"{base}/courses/{course['slug']}", course.get("created_at"))

    posts = (
        supabase.table("blog_posts")
        .select("slug, created_at")
        .eq("is_published", True)
        .execute()
    )
    for post in posts.data:
        _add_url(urlset, f"{base}/blog/{post['slug']}", post.get("created_at"))

    paths = (
        supabase.table("learning_paths")
        .select("slug, created_at, path_articles(slug, created_at)")
        .eq("is_published", True)
        .execute()
    )
    for path in paths.data:
        _add_url(urlset, f"{base}/paths/{path['slug']}", path.get("created_at"))
        for article in path.get("path_articles") or []:
            _add_url(
                urlset,
                f"{base}/paths/{path['slug']}/{article['slug']}",
                article.get("created_at"),
            )

    xml_bytes = tostring(urlset, encoding="utf-8", xml_declaration=True)
    return Response(content=xml_bytes, media_type="application/xml")
