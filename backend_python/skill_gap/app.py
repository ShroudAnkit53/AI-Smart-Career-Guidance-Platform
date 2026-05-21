from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import mysql.connector
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle, os, json, traceback, requests
from courses import get_courses_for_skills
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# ─── CONFIG ───────────────────────────────────────────────────────────────────
DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "skill_gap_db"),
}
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
DATASET_PATH = os.getenv("DATASET_PATH", os.path.join(os.path.dirname(__file__), "JobsDatasetProcessed.csv"))
MODEL_PATH   = os.getenv("MODEL_PATH",   os.path.join(os.path.dirname(__file__), "model.pkl"))

# ─── DATABASE ─────────────────────────────────────────────────────────────────
def get_db():
    return mysql.connector.connect(**DB_CONFIG)

def init_db():
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                name            VARCHAR(255)  NOT NULL,
                job_title       VARCHAR(255)  NOT NULL,
                job_description TEXT,
                user_skills     TEXT          NOT NULL,
                matched_it      TEXT,
                missing_it      TEXT,
                matched_soft    TEXT,
                missing_soft    TEXT,
                extra_skills    TEXT,
                it_score        FLOAT         NOT NULL,
                soft_score      FLOAT         NOT NULL,
                created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit(); cur.close(); conn.close()
        print(" Database ready")
    except Exception as e:
        print(f" DB init error: {e}"); traceback.print_exc()

# ─── DATASET ─────────────────────────────────────────────────────────────────
_df: pd.DataFrame = None

def load_dataset() -> pd.DataFrame:
    """
    Load JobsDatasetProcessed.csv.
    Columns used: Job Title, Description, IT Skills, Soft Skills
    Strategy for duplicates: merge all IT/Soft skills for same Job Title
    so every unique title has a rich, combined skill set.
    """
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: '{DATASET_PATH}'. "
            "Place JobsDatasetProcessed.csv next to app.py."
        )

    df = pd.read_csv(DATASET_PATH)

    # Strip column name spaces
    df.columns = [c.strip() for c in df.columns]

    # Keep only needed columns
    df = df[["Job Title", "Description", "IT Skills", "Soft Skills"]].copy()

    # Fill nulls
    df["IT Skills"]   = df["IT Skills"].fillna("")
    df["Soft Skills"] = df["Soft Skills"].fillna("")
    df["Description"] = df["Description"].fillna("")
    df["Job Title"]   = df["Job Title"].str.strip().str.upper()

    # ── Deduplicate: group by Job Title, union all skills ──────────────────
    # This gives us one rich row per unique title with combined skill set
    def merge_skills(series):
        all_skills = []
        for s in series:
            all_skills += [x.strip() for x in str(s).split(",") if x.strip()]
        # Deduplicate preserving order
        seen = set()
        unique = []
        for sk in all_skills:
            key = sk.lower()
            if key not in seen:
                seen.add(key)
                unique.append(sk)
        return ", ".join(unique)

    def pick_longest(series):
        return max(series, key=len)

    df_grouped = df.groupby("Job Title", as_index=False).agg(
        Description=("Description", pick_longest),
        IT_Skills  =("IT Skills",   merge_skills),
        Soft_Skills=("Soft Skills", merge_skills),
    )

    df_grouped = df_grouped.rename(columns={
        "IT_Skills":   "IT Skills",
        "Soft_Skills": "Soft Skills",
    })

    print(f" Dataset: {len(df)} raw rows → {len(df_grouped)} unique job titles")
    return df_grouped

# ─── MODEL TRAINING ───────────────────────────────────────────────────────────
_vectorizer   = None
_tfidf_matrix = None

def train_model(force: bool = False):
    """
    Corpus = Job Title + Description + IT Skills + Soft Skills
    Trained once, saved to model.pkl for fast restarts.
    """
    global _vectorizer, _tfidf_matrix, _df

    _df = load_dataset()

    if not force and os.path.exists(MODEL_PATH):
        print(f" Loading cached model from '{MODEL_PATH}' ...")
        with open(MODEL_PATH, "rb") as f:
            saved = pickle.load(f)
        _vectorizer   = saved["vectorizer"]
        _tfidf_matrix = saved["tfidf_matrix"]
        print(f" Model ready  |  {len(_df)} unique roles  |  vocab={len(_vectorizer.vocabulary_)}")
        return

    print(f"  Training TF-IDF on {len(_df)} unique job roles ...")
    corpus = (
        _df["Job Title"]   + " " +
        _df["Description"] + " " +
        _df["IT Skills"]   + " " +
        _df["Soft Skills"]
    ).tolist()

    _vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),    # unigrams + bigrams
        max_features=15000,    # larger vocab for 3000-row dataset
        sublinear_tf=True,     # log-normalise term frequency
        min_df=1,
    )
    _tfidf_matrix = _vectorizer.fit_transform(corpus)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"vectorizer": _vectorizer, "tfidf_matrix": _tfidf_matrix}, f)
    print(f" Model trained & saved → '{MODEL_PATH}'  |  vocab={len(_vectorizer.vocabulary_)}")

# ─── INFERENCE ────────────────────────────────────────────────────────────────
def find_best_job(job_title: str, job_description: str):
    query = f"{job_title} {job_description}".lower()
    q_vec = _vectorizer.transform([query])
    sims  = cosine_similarity(q_vec, _tfidf_matrix).flatten()
    idx   = int(np.argmax(sims))
    return _df.iloc[idx], float(sims[idx])

# ─── SKILL GAP ────────────────────────────────────────────────────────────────
def parse_skills(raw: str) -> list:
    return [s.strip().lower() for s in str(raw).split(",") if s.strip()]

def analyze_gap(user_raw: str, required_raw: str) -> dict:
    """
    Fuzzy substring matching:
    'python' matches 'python developer', 'aws' matches 'aws services'
    """
    user_set = set(parse_skills(user_raw))
    req_set  = set(parse_skills(required_raw))

    if not req_set:
        return {"matched": [], "missing": [], "extra": sorted(user_set), "score": 0.0}

    matched, missing = set(), set()
    for req in req_set:
        if any(u in req or req in u or u == req for u in user_set):
            matched.add(req)
        else:
            missing.add(req)

    extra = user_set - matched
    score = round(len(matched) / len(req_set) * 100, 1)
    return {
        "matched": sorted(matched),
        "missing": sorted(missing),
        "extra":   sorted(extra),
        "score":   score,
    }

# ─── YOUTUBE ──────────────────────────────────────────────────────────────────
def get_youtube(skills: list) -> dict:
    resources = {}
    for skill in skills[:8]:
        fallback = {
            "title":     f"Learn {skill}",
            "channel":   "YouTube",
            "thumbnail": None,
            "url":  f"https://www.youtube.com/results?search_query={skill.replace(' ', '+')}+tutorial",
            "video_id":  None,
        }
        if not YOUTUBE_API_KEY:
            resources[skill] = fallback
            continue
        try:
            r = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": f"{skill} tutorial for beginners",
                    "type": "video", "maxResults": 1,
                    "key": YOUTUBE_API_KEY,
                    "relevanceLanguage": "en",
                    "videoDuration": "medium",
                },
                timeout=8,
            )
            d = r.json()
            if d.get("items"):
                item = d["items"][0]
                vid  = item["id"]["videoId"]
                resources[skill] = {
                    "title":     item["snippet"]["title"],
                    "channel":   item["snippet"]["channelTitle"],
                    "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                    "url":       f"https://www.youtube.com/watch?v={vid}",
                    "video_id":  vid,
                }
            else:
                resources[skill] = fallback
        except Exception as e:
            print(f"  YouTube '{skill}': {e}")
            resources[skill] = fallback
    return resources

# ─── ROUTES ───────────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({
        "status":       "ok",
        "model_ready":  _vectorizer is not None,
        "dataset_size": len(_df) if _df is not None else 0,
        "vocab_size":   len(_vectorizer.vocabulary_) if _vectorizer else 0,
        "timestamp":    datetime.now().isoformat(),
    })

@app.route("/api/job-titles")
def job_titles():
    df = load_dataset()
    return jsonify({"titles": sorted(df["Job Title"].unique().tolist())})

@app.route("/api/categories")
def categories():
    """Return the 25 job categories from the Query column."""
    df = pd.read_csv(DATASET_PATH)
    cats = sorted(df["Query"].dropna().unique().tolist())
    return jsonify({"categories": cats})

@app.route("/api/retrain", methods=["POST"])
def retrain():
    """Force re-read CSV and retrain (deletes model.pkl cache)."""
    try:
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        train_model(force=True)
        return jsonify({
            "status":       "retrained",
            "dataset_size": len(_df),
            "vocab_size":   len(_vectorizer.vocabulary_),
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/analyze", methods=["POST"])
def analyze():
    try:
        body = request.get_json(force=True, silent=True)
        if not body:
            return jsonify({"error": "Invalid or missing JSON body"}), 400

        name             = body.get("name", "").strip()
        user_it_skills   = body.get("skills", "").strip()        # IT skills from form
        user_soft_skills = body.get("softSkills", "").strip()    # Soft skills from form
        job_title        = body.get("jobTitle", "").strip()
        job_desc         = body.get("jobDescription", "").strip()

        if not name or not user_it_skills or not job_title:
            return jsonify({"error": "Name, IT skills, and job title are required."}), 400

        if _vectorizer is None:
            return jsonify({"error": "Model not ready. Please restart the server."}), 503

        # ── Find best matching role ──────────────────────────────────────────
        matched_job, similarity = find_best_job(job_title, job_desc)
        req_it_str    = str(matched_job["IT Skills"])
        req_soft_str  = str(matched_job["Soft Skills"])
        matched_title = str(matched_job["Job Title"])
        matched_desc  = str(matched_job["Description"])[:500]

        # ── IT gap: user IT skills vs required IT skills ─────────────────────
        it_gap = analyze_gap(user_it_skills, req_it_str)

        # ── Soft gap: user soft skills vs required soft skills ───────────────
        soft_gap = analyze_gap(user_soft_skills, req_soft_str)

        # ── YouTube: top 4 missing IT + top 4 missing Soft ───────────────────
        all_missing = list(dict.fromkeys(it_gap["missing"][:4] + soft_gap["missing"][:4]))
        youtube = get_youtube(all_missing)

        # ── Course recommendations (Coursera / Udemy / LinkedIn) ──
        course_skills = list(dict.fromkeys(
            it_gap["missing"][:3] + soft_gap["missing"][:3]
        ))
        courses = get_courses_for_skills(course_skills)

        # ── Save to DB ───────────────────────────────────────────────────────
        analysis_id = None
        try:
            conn = get_db(); cur = conn.cursor()
            cur.execute("""
                INSERT INTO analyses
                  (name, job_title, job_description, user_skills,
                   matched_it, missing_it, matched_soft, missing_soft,
                   extra_skills, it_score, soft_score)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                name, job_title, job_desc,
                user_it_skills + " | soft: " + user_soft_skills,
                json.dumps(it_gap["matched"]),
                json.dumps(it_gap["missing"]),
                json.dumps(soft_gap["matched"]),
                json.dumps(soft_gap["missing"]),
                json.dumps(it_gap["extra"]),
                it_gap["score"],
                soft_gap["score"],
            ))
            conn.commit()
            analysis_id = cur.lastrowid
            cur.close(); conn.close()
        except Exception as db_err:
            print(f"  DB save skipped: {db_err}")

        return jsonify({
            "id":                    analysis_id,
            "name":                  name,
            "inputJobTitle":         job_title,
            "matchedJobTitle":       matched_title,
            "matchedJobDescription": matched_desc,
            "jobSimilarity":         round(similarity * 100, 1),

            # Skills from dataset
            "requiredITSkills":      parse_skills(req_it_str),
            "requiredSoftSkills":    parse_skills(req_soft_str),
            "userITSkills":          parse_skills(user_it_skills),
            "userSoftSkills":        parse_skills(user_soft_skills),

            # IT gap
            "matchedITSkills":       it_gap["matched"],
            "missingITSkills":       it_gap["missing"],
            "itScore":               it_gap["score"],

            # Soft gap
            "matchedSoftSkills":     soft_gap["matched"],
            "missingSoftSkills":     soft_gap["missing"],
            "softScore":             soft_gap["score"],

            # Extra IT skills user has beyond requirements
            "extraSkills":           it_gap["extra"],

            # YouTube resources
            "youtubeResources":      youtube,
            "courseResources": courses,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/history")
def history():
    try:
        conn = get_db(); cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM analyses ORDER BY created_at DESC LIMIT 20")
        rows = cur.fetchall(); cur.close(); conn.close()
        for r in rows:
            if r.get("created_at"):
                r["created_at"] = r["created_at"].isoformat()
        return jsonify({"analyses": rows})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ─── BOOT ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    train_model()
    app.run(debug=True, port=5000)
