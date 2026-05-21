"""
backend_python/main.py
======================
Unified Python gateway for CareerAI platform.

URL routing:
  http://localhost:8000/skill-gap/*              → skill_gap/app.py
  http://localhost:8000/interview-shortlisting/* → interview_shortlisting/app.py

Run:
  python main.py

Gunicorn (production):
  gunicorn "main:application" --bind 0.0.0.0:8000 --workers 2
"""

import sys, os, subprocess, importlib.util

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── sys.path: each sub-app needs its own root so its relative imports work ──
sys.path.insert(0, os.path.join(BASE_DIR, "skill_gap"))
sys.path.insert(0, os.path.join(BASE_DIR, "interview_shortlisting"))

# ── Env defaults ──────────────────────────────────────────────────────────────
os.environ.setdefault("DATASET_PATH",
    os.path.join(BASE_DIR, "skill_gap", "JobsDatasetProcessed.csv"))
os.environ.setdefault("MODEL_PATH",
    os.path.join(BASE_DIR, "skill_gap", "model.pkl"))
# Interview shortlisting DB name (override in .env if needed)
os.environ.setdefault("DB_NAME", "interview_shortlist")

# ── Helper: load a Flask app from a file path ─────────────────────────────────
def load_flask_app(filepath: str, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, filepath)
    mod  = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod

# ── 1. Skill Gap Analysis ─────────────────────────────────────────────────────
print("Loading Skill Gap Analysis service ...")
skill_gap_module = load_flask_app(
    os.path.join(BASE_DIR, "skill_gap", "app.py"),
    "skill_gap_module"
)
skill_gap_app = skill_gap_module.app
with skill_gap_app.app_context():
    try:
        for fn_name in ["init_db", "train_model"]:
            fn = getattr(skill_gap_module, fn_name, None)
            if callable(fn):
                fn()
    except Exception as e:
        print(f"  ⚠️  Skill Gap boot warning: {e}")

# ── 2. Interview Shortlisting ─────────────────────────────────────────────────
# Auto-train model artifacts on first run (takes ~60s)
ARTIFACTS_DIR = os.path.join(BASE_DIR, "interview_shortlisting", "model", "artifacts")
if not os.path.exists(os.path.join(ARTIFACTS_DIR, "tfidf_vectorizer.pkl")):
    print("🔧 Interview model artifacts missing — auto-training (~60s) ...")
    result = subprocess.run(
        [sys.executable, "model/train.py"],
        cwd=os.path.join(BASE_DIR, "interview_shortlisting"),
    )
    if result.returncode == 0:
        print("✅ Interview model trained and saved.")
    else:
        print("⚠️  Auto-training failed. Run manually:")
        print("   cd interview_shortlisting && python model/train.py")

print("Loading Interview Shortlisting service ...")
interview_shortlisting_module = load_flask_app(
    os.path.join(BASE_DIR, "interview_shortlisting", "app.py"),
    "interview_shortlisting_module"
)
interview_app = interview_shortlisting_module.app

# ── 3. Root gateway app ───────────────────────────────────────────────────────
from flask import Flask, jsonify
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.serving import run_simple

root_app = Flask("gateway")

@root_app.route("/")
def index():
    return jsonify({
        "service": "CareerAI Python Gateway",
        "status":  "ok",
        "routes": {
            "/skill-gap":              "Skill Gap Analysis",
            "/interview-shortlisting": "Interview Shortlisting Probability",
        },
    })

# ── 4. Compose the dispatcher ─────────────────────────────────────────────────
application = DispatcherMiddleware(root_app, {
    "/skill-gap":              skill_gap_app,
    "/interview-shortlisting": interview_app,
})

# ── Dev server ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    PORT = int(os.getenv("PYTHON_GATEWAY_PORT", 8000))
    print(f"""
╔══════════════════════════════════════════════════════╗
║  CareerAI Python Gateway  —  port {PORT}               ║
╠══════════════════════════════════════════════════════╣
║  GET  /                                              ║
║  ANY  /skill-gap/*                                   ║
║  ANY  /interview-shortlisting/*                      ║
╚══════════════════════════════════════════════════════╝
""")
    run_simple("0.0.0.0", PORT, application,
               use_reloader=False, use_debugger=True, threaded=True)
