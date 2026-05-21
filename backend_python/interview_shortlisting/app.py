"""
app.py — Flask backend for Interview Shortlisting Probability

Endpoints:
  POST /api/analyze   → score resume vs JD
  GET  /api/history   → last 20 analyses from DB
  GET  /api/health    → health check
"""

import json
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from db.models import Analysis, db
from model.predict import predict
from utils.parser import build_resume_text, parse_pdf_resume

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# ── Database config ──────────────────────────────────────────────────────────
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://"
    f"{os.getenv('DB_USER', 'root')}:"
    f"{os.getenv('DB_PASS', '')}@"
    f"{os.getenv('DB_HOST', 'localhost')}/"
    f"{os.getenv('DB_NAME', 'interview_shortlist')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

with app.app_context():
    db.create_all()


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "loaded"})


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Accepts two formats:

    1) multipart/form-data  (PDF upload)
       Fields: jd_text (str), resume_pdf (file)
       OR fields: jd_text, education, skills, projects, experience, internships

    2) application/json  (form data)
       Body: { jd_text, resume: { education, skills, projects, experience, internships } }
    """
    jd_text     = ""
    resume_text = ""

    try:
        ct = request.content_type or ""

        if "multipart/form-data" in ct:
            jd_text   = (request.form.get("jd_text") or "").strip()
            pdf_file  = request.files.get("resume_pdf")

            if pdf_file and pdf_file.filename:
                resume_text = parse_pdf_resume(pdf_file.read())
                if not resume_text:
                    return jsonify({"error": "Could not extract text from PDF. "
                                             "Try a text-based PDF or use the form instead."}), 422
            else:
                form_data = {
                    k: (request.form.get(k) or "")
                    for k in ["education", "skills", "projects",
                               "experience", "internships"]
                }
                resume_text = build_resume_text(form_data)

        else:  # JSON
            data        = request.get_json(force=True) or {}
            jd_text     = (data.get("jd_text") or "").strip()
            resume_text = build_resume_text(data.get("resume") or {})

        # ── Validate ─────────────────────────────────────────────────────────
        if not jd_text:
            return jsonify({"error": "Job description (jd_text) is required."}), 400
        if not resume_text or len(resume_text.strip()) < 30:
            return jsonify({"error": "Resume content is too short or empty."}), 400

        # ── Predict ──────────────────────────────────────────────────────────
        result = predict(resume_text, jd_text)

        # ── Persist to DB ─────────────────────────────────────────────────────
        try:
            row = Analysis(
                resume_text       = resume_text[:5000],
                jd_text           = jd_text[:3000],
                probability_score = result["probability"],
                verdict_label     = result["verdict"]["label"],
                tips              = json.dumps(result["tips"]),
            )
            db.session.add(row)
            db.session.commit()
            result["analysis_id"] = row.id
        except Exception as db_err:
            # DB errors shouldn't fail the API response
            app.logger.warning(f"DB write failed: {db_err}")

        return jsonify(result)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        app.logger.error(f"Analyze error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error. Check Flask logs."}), 500


@app.route("/api/history", methods=["GET"])
def history():
    """Return last 20 analyses (lightweight — no full resume/JD text)."""
    try:
        records = (
            Analysis.query
            .order_by(Analysis.created_at.desc())
            .limit(20)
            .all()
        )
        return jsonify([
            {
                "id":           r.id,
                "score":        r.probability_score,
                "verdict":      r.verdict_label,
                "created_at":   r.created_at.isoformat(),
            }
            for r in records
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)