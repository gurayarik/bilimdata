from pydantic import BaseModel


class EnrollmentCreate(BaseModel):
    course_id: str
    coupon_code: str | None = None


class EnrollmentOut(BaseModel):
    id: str
    user_id: str
    course_id: str
    payment_status: str
    progress_percent: int
