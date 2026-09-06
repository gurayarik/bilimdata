import random

from fastapi import APIRouter, Depends, HTTPException

from ..core.security import CurrentUser, get_current_user, get_current_user_optional
from ..core.supabase_client import get_supabase
from ..models.paths import (
    LearningPathDetailOut,
    LearningPathOut,
    PathArticleCompleteIn,
    PathMyProgressSummaryOut,
    PathProgressOut,
)
from ..models.quiz import QuizDetail, QuizResult, QuizSubmit
from ..services.ai_service import generate_article_quiz_questions

router = APIRouter(prefix="/paths", tags=["paths"])

PATH_SELECT = "id, title, slug, description, cover_image_url, category_id, articles:path_articles(id, title, slug, order_index)"


@router.get("", response_model=list[LearningPathOut])
async def list_paths():
    supabase = get_supabase()
    result = (
        supabase.table("learning_paths")
        .select(PATH_SELECT)
        .eq("is_published", True)
        .order("order_index")
        .execute()
    )
    for path in result.data:
        path["articles"].sort(key=lambda article: article["order_index"])
    return result.data


@router.get("/my-progress", response_model=list[PathMyProgressSummaryOut])
async def list_my_path_progress(user: CurrentUser = Depends(get_current_user)):
    """Dashboard'daki 'Yol Haritalarım' bölümü için: kullanıcının en az bir
    makalesini tamamladığı tüm path'lerin ilerleme özetini döner."""
    supabase = get_supabase()

    progress_rows = (
        supabase.table("path_article_progress")
        .select("path_article_id")
        .eq("user_id", user.id)
        .execute()
    ).data
    completed_article_ids = {row["path_article_id"] for row in progress_rows}
    if not completed_article_ids:
        return []

    completed_articles = (
        supabase.table("path_articles")
        .select("id, path_id")
        .in_("id", list(completed_article_ids))
        .execute()
    ).data
    touched_path_ids = {row["path_id"] for row in completed_articles}

    paths = (
        supabase.table("learning_paths")
        .select("id, title, slug, cover_image_url, articles:path_articles(id, slug, order_index)")
        .in_("id", list(touched_path_ids))
        .eq("is_published", True)
        .execute()
    ).data

    summaries: list[PathMyProgressSummaryOut] = []
    for path in paths:
        articles = sorted(path["articles"], key=lambda a: a["order_index"])
        completed_count = sum(1 for a in articles if a["id"] in completed_article_ids)
        next_article = next((a for a in articles if a["id"] not in completed_article_ids), None)
        summaries.append(
            PathMyProgressSummaryOut(
                title=path["title"],
                slug=path["slug"],
                cover_image_url=path.get("cover_image_url"),
                total_articles=len(articles),
                completed_count=completed_count,
                progress_percent=round(completed_count / len(articles) * 100) if articles else 0,
                next_article_slug=next_article["slug"] if next_article else None,
            )
        )
    return summaries


@router.get("/{slug}", response_model=LearningPathDetailOut)
async def get_path(slug: str):
    supabase = get_supabase()
    result = (
        supabase.table("learning_paths")
        .select(
            "id, title, slug, description, cover_image_url, category_id, "
            "articles:path_articles(id, title, slug, content, order_index, ai_generated)"
        )
        .eq("slug", slug)
        .eq("is_published", True)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Yol haritası bulunamadı")
    path = result.data[0]
    path["articles"].sort(key=lambda article: article["order_index"])
    return path


def _get_published_article(supabase, path_slug: str, article_slug: str) -> dict:
    path = (
        supabase.table("learning_paths")
        .select("id")
        .eq("slug", path_slug)
        .eq("is_published", True)
        .execute()
    )
    if not path.data:
        raise HTTPException(status_code=404, detail="Yol haritası bulunamadı")

    article = (
        supabase.table("path_articles")
        .select("id, title, content")
        .eq("path_id", path.data[0]["id"])
        .eq("slug", article_slug)
        .execute()
    )
    if not article.data:
        raise HTTPException(status_code=404, detail="Makale bulunamadı")
    return article.data[0]


def _get_published_path(supabase, path_slug: str) -> dict:
    path = (
        supabase.table("learning_paths")
        .select("id, articles:path_articles(id)")
        .eq("slug", path_slug)
        .eq("is_published", True)
        .execute()
    )
    if not path.data:
        raise HTTPException(status_code=404, detail="Yol haritası bulunamadı")
    return path.data[0]


@router.get("/{slug}/my-progress", response_model=PathProgressOut)
async def get_my_path_progress(slug: str, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    path = _get_published_path(supabase, slug)
    article_ids = [a["id"] for a in path["articles"]]

    completed_ids: list[str] = []
    if article_ids:
        progress = (
            supabase.table("path_article_progress")
            .select("path_article_id")
            .eq("user_id", user.id)
            .in_("path_article_id", article_ids)
            .execute()
        )
        completed_ids = [row["path_article_id"] for row in progress.data]

    percent = round(len(completed_ids) / len(article_ids) * 100) if article_ids else 0
    return {"completed_article_ids": completed_ids, "progress_percent": percent}


@router.post("/{path_slug}/articles/{article_slug}/complete", response_model=PathProgressOut)
async def set_article_completion(
    path_slug: str,
    article_slug: str,
    payload: PathArticleCompleteIn,
    user: CurrentUser = Depends(get_current_user),
):
    supabase = get_supabase()
    article = _get_published_article(supabase, path_slug, article_slug)

    if payload.completed:
        supabase.table("path_article_progress").upsert(
            {"user_id": user.id, "path_article_id": article["id"]},
            on_conflict="user_id,path_article_id",
        ).execute()
    else:
        supabase.table("path_article_progress").delete().eq("user_id", user.id).eq(
            "path_article_id", article["id"]
        ).execute()

    return await get_my_path_progress(path_slug, user)


@router.get("/{path_slug}/articles/{article_slug}/quiz", response_model=QuizDetail)
async def get_article_quiz(path_slug: str, article_slug: str):
    """Yol haritası içeriği tamamen herkese açık olduğu için sınav da giriş
    yapmadan çözülebilir — deneme yalnızca giriş yapan kullanıcılar için
    kaydedilir (bkz. submit_article_quiz)."""
    supabase = get_supabase()
    article = _get_published_article(supabase, path_slug, article_slug)

    existing = supabase.table("quizzes").select("id, title").eq("path_article_id", article["id"]).execute()
    if existing.data:
        quiz_id = existing.data[0]["id"]
        quiz_title = existing.data[0]["title"]
    else:
        generated = await generate_article_quiz_questions(article["title"], article["content"])
        for item in generated:
            correct_option = item["options"][item["correct_index"]]
            random.shuffle(item["options"])
            item["correct_index"] = item["options"].index(correct_option)
        quiz_insert = (
            supabase.table("quizzes")
            .insert({"path_article_id": article["id"], "title": f"{article['title']} — Sınav"})
            .execute()
        )
        quiz_id = quiz_insert.data[0]["id"]
        quiz_title = quiz_insert.data[0]["title"]
        supabase.table("quiz_questions").insert(
            [
                {
                    "quiz_id": quiz_id,
                    "question": item["question"],
                    "options": item["options"],
                    "correct_index": item["correct_index"],
                    "order_index": index,
                }
                for index, item in enumerate(generated)
            ]
        ).execute()

    questions = (
        supabase.table("quiz_questions")
        .select("id, question, options")
        .eq("quiz_id", quiz_id)
        .order("order_index")
        .execute()
    )
    return {"id": quiz_id, "title": quiz_title, "questions": questions.data}


@router.post("/{path_slug}/articles/{article_slug}/quiz/submit", response_model=QuizResult)
async def submit_article_quiz(
    path_slug: str,
    article_slug: str,
    payload: QuizSubmit,
    user: CurrentUser | None = Depends(get_current_user_optional),
):
    supabase = get_supabase()
    article = _get_published_article(supabase, path_slug, article_slug)

    quiz = supabase.table("quizzes").select("id").eq("path_article_id", article["id"]).execute()
    if not quiz.data:
        raise HTTPException(status_code=404, detail="Sınav bulunamadı")
    quiz_id = quiz.data[0]["id"]

    questions = (
        supabase.table("quiz_questions")
        .select("id, question, options, correct_index")
        .eq("quiz_id", quiz_id)
        .order("order_index")
        .execute()
    ).data
    if len(payload.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Cevap sayısı soru sayısıyla eşleşmiyor")

    results = []
    score = 0
    for question, selected_index in zip(questions, payload.answers):
        is_correct = selected_index == question["correct_index"]
        if is_correct:
            score += 1
        results.append(
            {
                "question_id": question["id"],
                "question": question["question"],
                "options": question["options"],
                "correct_index": question["correct_index"],
                "selected_index": selected_index,
                "correct": is_correct,
            }
        )

    if user is not None:
        supabase.table("quiz_attempts").insert(
            {
                "quiz_id": quiz_id,
                "user_id": user.id,
                "score": score,
                "total": len(questions),
                "answers": payload.answers,
            }
        ).execute()

    return {"score": score, "total": len(questions), "results": results}
