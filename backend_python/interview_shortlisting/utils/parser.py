"""
parser.py — Resume text utilities

Two entry points:
  parse_pdf_resume(bytes)  → extract text from uploaded PDF
  build_resume_text(dict)  → build plain text from form fields
"""

import io
import re

from pdfminer.high_level import extract_text as pdfminer_extract


def parse_pdf_resume(file_bytes: bytes) -> str:
    """
    Extract plain text from a PDF resume.
    Returns empty string on failure (caller decides how to handle).
    """
    try:
        text = pdfminer_extract(io.BytesIO(file_bytes))
        # Collapse excessive whitespace that pdfminer often leaves
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()
    except Exception:
        return ""


def build_resume_text(form_data: dict) -> str:
    """
    Build a structured resume text string from form fields.

    Expected keys (all optional except at least one must be non-empty):
      education    : e.g. "B.Tech CS, XYZ University, 2024, CGPA 8.5"
      skills       : e.g. "Python, React, SQL, Docker, Machine Learning"
      projects     : multi-line description of projects
      experience   : work experience (optional — freshers leave blank)
      internships  : internship experience

    The resulting text mirrors the format the model was trained on
    (plain prose / keyword-dense, not JSON).
    """
    sections = []

    mapping = [
        ("education",   "Education"),
        ("skills",      "Skills"),
        ("projects",    "Projects"),
        ("experience",  "Work Experience"),
        ("internships", "Internships"),
    ]

    for key, heading in mapping:
        value = (form_data.get(key) or "").strip()
        if value:
            sections.append(f"{heading}:\n{value}")

    return "\n\n".join(sections)