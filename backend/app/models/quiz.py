from pydantic import BaseModel


class QuizBlockSummary(BaseModel):
    block_index: int
    title: str
    total_lessons: int
    unlocked: bool
    generated: bool
    best_score: int | None = None
    attempts_count: int = 0


class QuizQuestionOut(BaseModel):
    id: str
    question: str
    options: list[str]


class QuizDetail(BaseModel):
    id: str
    title: str
    questions: list[QuizQuestionOut]


class QuizSubmit(BaseModel):
    answers: list[int]


class QuizResultItem(BaseModel):
    question_id: str
    question: str
    options: list[str]
    correct_index: int
    selected_index: int
    correct: bool


class QuizResult(BaseModel):
    score: int
    total: int
    results: list[QuizResultItem]
