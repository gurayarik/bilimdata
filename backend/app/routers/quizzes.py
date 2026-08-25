from fastapi import APIRouter, Depends, HTTPException

from ..core.security import CurrentUser, get_current_user
from ..core.supabase_client import get_supabase
from ..models.quiz import QuizBlockSummary, QuizDetail, QuizSubmit, QuizResult
from ..services.ai_service import generate_quiz_questions

router = APIRouter(prefix="/courses", tags=["quizzes"])

BLOCK_SIZE = 20
_ACTIVE_STATUSES = ("paid", "free", "coupon")


def _get_ordered_lessons(supabase, course_id: str) -> list[dict]:
    sections = (
        supabase.table("course_sections")
        .select("id, order_index, lessons(id, title, description, order_index)")
        .eq("course_id", course_id)
        .order("order_index")
        .execute()
    )
    ordered_lessons: list[dict] = []
    for section in sorted(sections.data, key=lambda s: s["order_index"]):
        for lesson in sorted(section["lessons"], key=lambda lesson: lesson["order_index"]):
            ordered_lessons.append(lesson)
    return ordered_lessons


def _require_enrollment(supabase, user_id: str, course_id: str) -> None:
    enrollment = (
        supabase.table("enrollments")
        .select("payment_status")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .execute()
    )
    is_enrolled = any(row["payment_status"] in _ACTIVE_STATUSES for row in enrollment.data)
    if not is_enrolled:
        raise HTTPException(status_code=403, detail="Bu eğitime kayıtlı değilsiniz")


@router.get("/{slug}/quizzes", response_model=list[QuizBlockSummary])
async def list_quiz_blocks(slug: str, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    course = supabase.table("courses").select("id").eq("slug", slug).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    course_id = course.data[0]["id"]

    _require_enrollment(supabase, user.id, course_id)

    ordered_lessons = _get_ordered_lessons(supabase, course_id)
    lesson_ids = [lesson["id"] for lesson in ordered_lessons]

    completed_ids: set[str] = set()
    if lesson_ids:
        progress = (
            supabase.table("lesson_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("completed", True)
            .in_("lesson_id", lesson_ids)
            .execute()
        )
        completed_ids = {row["lesson_id"] for row in progress.data}

    existing_quizzes = supabase.table("quizzes").select("id, block_index, title").eq("course_id", course_id).execute()
    quizzes_by_block = {row["block_index"]: row for row in existing_quizzes.data}

    summaries: list[QuizBlockSummary] = []
    total_blocks = (len(ordered_lessons) + BLOCK_SIZE - 1) // BLOCK_SIZE
    for block_index in range(total_blocks):
        block_lessons = ordered_lessons[block_index * BLOCK_SIZE : (block_index + 1) * BLOCK_SIZE]
        unlocked = all(lesson["id"] in completed_ids for lesson in block_lessons) and len(block_lessons) > 0
        quiz_row = quizzes_by_block.get(block_index)

        best_score = None
        attempts_count = 0
        if quiz_row:
            attempts = (
                supabase.table("quiz_attempts")
                .select("score, total")
                .eq("quiz_id", quiz_row["id"])
                .eq("user_id", user.id)
                .execute()
            )
            attempts_count = len(attempts.data)
            if attempts.data:
                best_score = max(row["score"] for row in attempts.data)

        summaries.append(
            QuizBlockSummary(
                block_index=block_index,
                title=quiz_row["title"] if quiz_row else f"{block_index * BLOCK_SIZE + 1}-{block_index * BLOCK_SIZE + len(block_lessons)}. Dersler Sınavı",
                total_lessons=len(block_lessons),
                unlocked=unlocked,
                generated=quiz_row is not None,
                best_score=best_score,
                attempts_count=attempts_count,
            )
        )
    return summaries


@router.get("/{slug}/quizzes/{block_index}", response_model=QuizDetail)
async def get_quiz(slug: str, block_index: int, user: CurrentUser = Depends(get_current_user)):
    supabase = get_supabase()
    course = supabase.table("courses").select("id, title").eq("slug", slug).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    course_id = course.data[0]["id"]
    course_title = course.data[0]["title"]

    _require_enrollment(supabase, user.id, course_id)

    ordered_lessons = _get_ordered_lessons(supabase, course_id)
    block_lessons = ordered_lessons[block_index * BLOCK_SIZE : (block_index + 1) * BLOCK_SIZE]
    if not block_lessons:
        raise HTTPException(status_code=404, detail="Bu blok için ders bulunamadı")

    lesson_ids = [lesson["id"] for lesson in block_lessons]
    progress = (
        supabase.table("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", True)
        .in_("lesson_id", lesson_ids)
        .execute()
    )
    completed_ids = {row["lesson_id"] for row in progress.data}
    if not all(lesson_id in completed_ids for lesson_id in lesson_ids):
        raise HTTPException(
            status_code=403, detail="Bu sınava erişmek için önce bu bloktaki tüm dersleri tamamlamalısın"
        )

    existing = supabase.table("quizzes").select("id, title").eq("course_id", course_id).eq("block_index", block_index).execute()
    if existing.data:
        quiz_id = existing.data[0]["id"]
        quiz_title = existing.data[0]["title"]
    else:
        title = f"{block_index * BLOCK_SIZE + 1}-{block_index * BLOCK_SIZE + len(block_lessons)}. Dersler Sınavı"
        generated = await generate_quiz_questions(course_title, title, block_lessons)
        quiz_insert = (
            supabase.table("quizzes")
            .insert({"course_id": course_id, "block_index": block_index, "title": title})
            .execute()
        )
        quiz_id = quiz_insert.data[0]["id"]
        quiz_title = title
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


@router.post("/{slug}/quizzes/{block_index}/submit", response_model=QuizResult)
async def submit_quiz(
    slug: str, block_index: int, payload: QuizSubmit, user: CurrentUser = Depends(get_current_user)
):
    supabase = get_supabase()
    course = supabase.table("courses").select("id").eq("slug", slug).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Kurs bulunamadı")
    course_id = course.data[0]["id"]

    _require_enrollment(supabase, user.id, course_id)

    quiz = supabase.table("quizzes").select("id").eq("course_id", course_id).eq("block_index", block_index).execute()
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
