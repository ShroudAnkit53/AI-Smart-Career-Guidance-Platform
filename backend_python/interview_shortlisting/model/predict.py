"""
predict.py — Score a resume against a job description.

Pipeline:
  Step 1: TF-IDF vectorize resume + JD
  Step 2: Extract 4 features
            cosine_similarity,
            resume_length,
            resume_keyword_density,
            jd_keyword_density
  Step 3: StandardScaler normalize features
  Step 4: Linear Regression  → ATS score
  Step 5: Logistic Regression → verdict label
  Step 6: Rule-based tip generation

IMPORTANT:
  - Features MUST exactly match train.py
  - scaler.pkl MUST be used before BOTH models
"""

import os
import pickle
import re

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


# ──────────────────────────────────────────────────────────────────────────────
# Load Artifacts
# ──────────────────────────────────────────────────────────────────────────────

_ARTIFACTS = os.path.join(os.path.dirname(__file__), "artifacts")


def _load(name: str):
    path = os.path.join(_ARTIFACTS, name)

    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Artifact '{name}' not found at:\n{path}\n"
            f"Run: python model/train.py"
        )

    with open(path, "rb") as f:
        return pickle.load(f)


vectorizer = _load("tfidf_vectorizer.pkl")
calibrator = _load("calibrator.pkl")
classifier = _load("classifier.pkl")
scaler     = _load("scaler.pkl")


# ──────────────────────────────────────────────────────────────────────────────
# Skill Keywords
# MUST MATCH train.py EXACTLY
# ──────────────────────────────────────────────────────────────────────────────

SKILL_KEYWORDS = {
    "python", "java", "javascript", "typescript", "react", "angular", "vue",
    "node", "nodejs", "django", "flask", "spring", "sql", "mysql", "postgresql",
    "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "gcp",
    "git", "github", "html", "css", "php", "ruby", "swift", "kotlin",
    "tensorflow", "pytorch", "sklearn", "pandas", "numpy", "machine learning",
    "deep learning", "nlp", "api", "rest", "graphql", "linux", "agile",
    "scrum", "ci", "cd", "devops", "microservices", "hadoop", "spark",
    "tableau", "powerbi", "excel", "c++", "c#", "scala", "golang",
}


# ──────────────────────────────────────────────────────────────────────────────
# Feature Extraction
# MUST MATCH train.py EXACTLY
# ──────────────────────────────────────────────────────────────────────────────

def _extract_skills(text: str) -> set:
    text_lower = text.lower()

    return {
        skill for skill in SKILL_KEYWORDS
        if re.search(r"\b" + re.escape(skill) + r"\b", text_lower)
    }


def _keyword_density(text: str) -> float:
    """
    Skills per 100 words.
    """
    words = text.split()
    skills = _extract_skills(text)

    if len(words) == 0:
        return 0.0

    return (len(skills) / len(words)) * 100


def _extract_features(
    resume: str,
    jd: str,
    r_vec,
    j_vec,
) -> list:
    """
    Extract 4 features.

    Feature 1: cosine_similarity
    Feature 2: resume_length
    Feature 3: resume_keyword_density
    Feature 4: jd_keyword_density
    """

    # Feature 1 — cosine similarity
    cos_sim = float(cosine_similarity(r_vec, j_vec)[0][0])

    # Feature 2 — resume word count
    resume_length = len(resume.split())

    # Feature 3 — resume keyword density
    resume_density = _keyword_density(resume)

    # Feature 4 — JD keyword density
    jd_density = _keyword_density(jd)

    return [
        cos_sim,
        resume_length,
        resume_density,
        jd_density,
    ]


# ──────────────────────────────────────────────────────────────────────────────
# Verdict Builder
# ──────────────────────────────────────────────────────────────────────────────

_VERDICT_CONFIG = {
    "Good Fit": {
        "emoji":   "🟢",
        "color":   "green",
        "message": "Strong match! Your profile aligns well with this JD.",
    },

    "Potential Fit": {
        "emoji":   "🟡",
        "color":   "yellow",
        "message": "Moderate match. Targeted improvements can boost your chances.",
    },

    "No Fit": {
        "emoji":   "🔴",
        "color":   "red",
        "message": "Low match. Consider tailoring your resume significantly.",
    },
}


def _build_verdict(label: str, probs: np.ndarray) -> dict:

    confidence = round(float(max(probs)) * 100, 1)

    cfg = _VERDICT_CONFIG.get(
        label,
        _VERDICT_CONFIG["Potential Fit"]
    )

    return {
        "label":      label,
        "emoji":      cfg["emoji"],
        "color":      cfg["color"],
        "message":    cfg["message"],
        "confidence": confidence,
    }


def _score_to_label_fallback(score: float) -> str:

    if score >= 70:
        return "Good Fit"

    elif score >= 40:
        return "Potential Fit"

    return "No Fit"


# ──────────────────────────────────────────────────────────────────────────────
# Tip Generation
# ──────────────────────────────────────────────────────────────────────────────

_SECTION_CHECKS = {
    "education": [
        "bachelor",
        "master",
        "b.tech",
        "mba",
        "degree",
        "university",
        "college",
    ],

    "certifications": [
        "certified",
        "aws certified",
        "google certified",
        "coursera",
    ],

    "action_verbs": [
        "developed",
        "built",
        "designed",
        "implemented",
        "optimized",
        "managed",
        "created",
    ],
}


_QUANTIFY_PATTERNS = [
    r"\d+\s*%",
    r"\d+\+?\s+years?",
    r"increased\s+by",
    r"reduced\s+by",
    r"\$\s*\d+",
]


def _extract_jd_keywords(jd: str) -> list:

    tokens = re.findall(
        r"\b[a-zA-Z][a-zA-Z0-9\+\#\.]{2,}\b",
        jd.lower()
    )

    stopwords = {
        "the", "and", "for", "with", "that",
        "this", "are", "you", "have", "will",
        "from", "your", "skills", "experience",
        "knowledge", "required", "minimum",
        "years", "team", "work",
    }

    return [
        token for token in set(tokens)
        if token not in stopwords and 3 <= len(token) <= 25
    ]


def _generate_tips(
    resume: str,
    jd: str,
    score: float,
    verdict_label: str
) -> list:

    tips = []

    resume_lower = resume.lower()
    jd_lower     = jd.lower()

    # ── Missing Keywords ─────────────────────────────────────────────

    jd_keywords = _extract_jd_keywords(jd_lower)

    missing = [
        kw for kw in jd_keywords
        if kw not in resume_lower
    ]

    missing_top = sorted(
        missing,
        key=len,
        reverse=True
    )[:8]

    if missing_top:
        tips.append({
            "type":  "keyword_gap",
            "title": "Missing Keywords",
            "detail":
                "These JD keywords are missing from your resume: "
                + ", ".join(missing_top[:6])
        })

    # ── Education ────────────────────────────────────────────────────

    if not any(
        kw in resume_lower
        for kw in _SECTION_CHECKS["education"]
    ):

        tips.append({
            "type":  "section",
            "title": "Add Education Section",
            "detail":
                "Clearly mention degree, institution and graduation year."
        })

    # ── Action Verbs ─────────────────────────────────────────────────

    verbs_found = [
        v for v in _SECTION_CHECKS["action_verbs"]
        if v in resume_lower
    ]

    if len(verbs_found) < 3:

        tips.append({
            "type":  "writing",
            "title": "Use Strong Action Verbs",
            "detail":
                "Use verbs like Developed, Built, Implemented, Optimized."
        })

    # ── Quantification ───────────────────────────────────────────────

    has_numbers = any(
        re.search(pattern, resume_lower)
        for pattern in _QUANTIFY_PATTERNS
    )

    if not has_numbers:

        tips.append({
            "type":  "impact",
            "title": "Quantify Achievements",
            "detail":
                "Add measurable impact like 'Improved speed by 40%'."
        })

    # ── Certifications ───────────────────────────────────────────────

    has_cert = any(
        kw in resume_lower
        for kw in _SECTION_CHECKS["certifications"]
    )

    if not has_cert and score < 55:

        tips.append({
            "type":  "enhancement",
            "title": "Add Certifications",
            "detail":
                "Consider adding AWS, Azure or Google Cloud certifications."
        })

    # ── Verdict Specific ─────────────────────────────────────────────

    if verdict_label == "No Fit":

        tips.append({
            "type":  "critical",
            "title": "Major Resume Tailoring Needed",
            "detail":
                "Your resume has low alignment with this job description."
        })

    elif verdict_label == "Potential Fit":

        tips.append({
            "type":  "warning",
            "title": "Needs Better Targeting",
            "detail":
                "Mirror exact JD skills and prioritize relevant experience."
        })

    else:

        tips.append({
            "type":  "success",
            "title": "Strong Match",
            "detail":
                "Your resume aligns well. Do final proofreading."
        })

    return tips


# ──────────────────────────────────────────────────────────────────────────────
# Public Predict Function
# ──────────────────────────────────────────────────────────────────────────────

def predict(
    resume_text: str,
    jd_text: str
) -> dict:
    """
    Score a resume against a JD.
    """

    if not resume_text.strip():
        raise ValueError("resume_text cannot be empty.")

    if not jd_text.strip():
        raise ValueError("jd_text cannot be empty.")

    # ──────────────────────────────────────────────────────────────
    # Step 1 — TF-IDF vectors
    # ──────────────────────────────────────────────────────────────

    r_vec = vectorizer.transform([resume_text])
    j_vec = vectorizer.transform([jd_text])

    # ──────────────────────────────────────────────────────────────
    # Step 2 — Raw cosine similarity
    # ──────────────────────────────────────────────────────────────

    raw_similarity = float(
        cosine_similarity(r_vec, j_vec)[0][0]
    )

    # ──────────────────────────────────────────────────────────────
    # Step 3 — Extract SAME 4 FEATURES used in training
    # ──────────────────────────────────────────────────────────────

    features = _extract_features(
        resume_text,
        jd_text,
        r_vec,
        j_vec
    )

    features_array = np.array(features).reshape(1, -1)

    # ──────────────────────────────────────────────────────────────
    # Step 4 — Scale features
    # MUST use same scaler from training
    # ──────────────────────────────────────────────────────────────

    features_scaled = scaler.transform(features_array)

    # ──────────────────────────────────────────────────────────────
    # Step 5 — Linear Regression → ATS Score
    # ──────────────────────────────────────────────────────────────

    score = float(
        calibrator.predict(features_scaled)[0]
    )

    score = round(
        max(0.0, min(100.0, score)),
        1
    )

    # ──────────────────────────────────────────────────────────────
    # Step 6 — Logistic Regression → Verdict
    # ──────────────────────────────────────────────────────────────

    try:

        pred_label = classifier.predict(
            features_scaled
        )[0]

        probs = classifier.predict_proba(
            features_scaled
        )[0]

    except Exception as e:

        print("⚠️ Classifier failed:", str(e))

        pred_label = _score_to_label_fallback(score)

        probs = np.array([0.33, 0.33, 0.34])

    verdict = _build_verdict(
        pred_label,
        probs
    )

    # ──────────────────────────────────────────────────────────────
    # Step 7 — Generate Tips
    # ──────────────────────────────────────────────────────────────

    tips = _generate_tips(
        resume_text,
        jd_text,
        score,
        pred_label
    )

    # ──────────────────────────────────────────────────────────────
    # Final Response
    # ──────────────────────────────────────────────────────────────

    return {

        "probability": score,

        "raw_similarity": round(
            raw_similarity * 100,
            2
        ),

        "verdict": verdict,

        "tips": tips,
    }