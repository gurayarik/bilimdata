import io

from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas

from ..core.supabase_client import get_supabase

CERTIFICATES_BUCKET = "certificates"


def _render_pdf(student_name: str, course_title: str) -> bytes:
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)

    pdf.setFont("Helvetica-Bold", 28)
    pdf.drawCentredString(width / 2, height - 150, "Başarı Sertifikası")
    pdf.setFont("Helvetica", 18)
    pdf.drawCentredString(width / 2, height - 220, student_name)
    pdf.setFont("Helvetica", 14)
    pdf.drawCentredString(width / 2, height - 260, f'"{course_title}" eğitimini başarıyla tamamlamıştır.')
    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer.read()


def issue_certificate(user_id: str, course_id: str, student_name: str, course_title: str) -> str:
    """Kurs %100 tamamlanınca çağrılır: PDF üretir, Storage'a yükler,
    certificates tablosuna kaydeder ve public URL döner."""
    supabase = get_supabase()

    pdf_bytes = _render_pdf(student_name, course_title)
    storage_path = f"{user_id}/{course_id}.pdf"
    supabase.storage.from_(CERTIFICATES_BUCKET).upload(
        storage_path, pdf_bytes, {"content-type": "application/pdf", "upsert": "true"}
    )
    pdf_url = supabase.storage.from_(CERTIFICATES_BUCKET).get_public_url(storage_path)

    supabase.table("certificates").upsert(
        {"user_id": user_id, "course_id": course_id, "pdf_url": pdf_url},
        on_conflict="user_id,course_id",
    ).execute()

    return pdf_url
