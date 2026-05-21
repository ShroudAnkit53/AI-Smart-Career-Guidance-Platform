"""
Train TF-IDF + Cosine Similarity model using local CSV files:

Dataset 1: resume-job-description-fit.csv
  Columns: resume_text | job_description_text | label
  Labels:  No Fit / Potential Fit / Good Fit
  Rows:    6241

Dataset 2: resume-ats-score-v1-en.csv
  Columns: text (resume SEP jd) | ats_score | original_label
  Scores:  No Fit ~25 | Potential Fit ~55 | Good Fit ~85
  Rows:    5099

Usage:
  python model/train.py \
    --ds1 path/to/resume-job-description-fit.csv \
    --ds2 path/to/resume-ats-score-v1-en.csv
"""

import argparse
import os
import pickle
import re

import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LinearRegression, LogisticRegression

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


# ──────────────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────────────

LABEL_TO_SCORE = {
    "Good Fit": 85.0,
    "Potential Fit": 55.0,
    "No Fit": 25.0,
}

CLASS_LABELS = [
    "No Fit",
    "Potential Fit",
    "Good Fit",
]

BASE_DIR = os.path.dirname(__file__)

ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")

DATA_DIR = os.path.join(BASE_DIR, "..", "data")

DEFAULT_DS1 = os.path.join(
    DATA_DIR,
    "resume-job-description-fit.csv"
)

DEFAULT_DS2 = os.path.join(
    DATA_DIR,
    "resume-ats-score-v1-en.csv"
)

# ── Skill keyword bank for keyword density feature ────────────────────────────
# Common technical skills — used to count how skill-rich a text is
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
# Helper Functions
# ──────────────────────────────────────────────────────────────────────────────

def score_to_label(score: float) -> str:
    if score >= 70:
        return "Good Fit"
    elif score >= 40:
        return "Potential Fit"
    return "No Fit"

def extract_skills(text: str) -> set:
    """Find all skill keywords present in text."""
    text_lower = text.lower()
    return {
        skill for skill in SKILL_KEYWORDS
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower)
    }


def keyword_density(text: str) -> float:
    """
    Skills per 100 words — how skill-rich is this text.

    Formula:
      density = (number of skill keywords found / total words) x 100

    Example:
      Resume = "Python developer React SQL Node experience"
      Skills found = {python, react, sql, node} = 4
      Total words  = 6
      Density       = (4/6) x 100 = 66.67

    Why useful:
      A skill-dense resume vs a generic JD -> likely low match
      A skill-dense resume vs a skill-dense JD -> likely high match
    """
    words  = text.split()
    skills = extract_skills(text)
    if len(words) == 0:
        return 0.0
    return (len(skills) / len(words)) * 100

# ──────────────────────────────────────────────────────────────────────────────
# Dataset Loaders
# ──────────────────────────────────────────────────────────────────────────────

def load_dataset1(path: str) -> pd.DataFrame:

    df = pd.read_csv(path)

    required = {
        "resume_text",
        "job_description_text",
        "label",
    }

    if not required.issubset(df.columns):
        raise ValueError(
            f"Dataset 1 missing columns.\n"
            f"Found: {df.columns.tolist()}"
        )

    df = df.dropna(
        subset=[
            "resume_text",
            "job_description_text",
            "label",
        ]
    )

    df["score"] = df["label"].map(LABEL_TO_SCORE)

    df = df.rename(columns={
        "resume_text": "resume",
        "job_description_text": "jd",
        "label": "true_label",
    })

    return df[
        ["resume", "jd", "score", "true_label"]
    ]


def load_dataset2(path: str) -> pd.DataFrame:

    df = pd.read_csv(path)

    required = {"text", "ats_score"}

    if not required.issubset(df.columns):
        raise ValueError(
            f"Dataset 2 missing columns.\n"
            f"Found: {df.columns.tolist()}"
        )

    df = df.dropna(subset=["text", "ats_score"])

    split = df["text"].str.split(
        " SEP ",
        n=1,
        expand=True
    )

    df["resume"] = split[0].str.strip()
    df["jd"] = split[1].str.strip()

    df["score"] = df["ats_score"].astype(float)

    df["true_label"] = df["score"].apply(
        score_to_label
    )

    return df[
        ["resume", "jd", "score", "true_label"]
    ]


# ──────────────────────────────────────────────────────────────────────────────
# Corpus Builder
# ──────────────────────────────────────────────────────────────────────────────

def build_corpus(df: pd.DataFrame) -> pd.DataFrame:

    df = df.dropna(
        subset=["resume", "jd", "score"]
    )

    df = df[
        df["resume"].str.len() > 20
    ]

    df = df[
        df["jd"].str.len() > 20
    ]

    df = df.drop_duplicates(
        subset=["resume", "jd"]
    )

    df = df.reset_index(drop=True)

    print("\n Combined Corpus")
    print("Rows :", len(df))

    return df


# ──────────────────────────────────────────────────────────────────────────────
# TF-IDF
# ──────────────────────────────────────────────────────────────────────────────

def train_vectorizer(
    combined: pd.DataFrame
) -> TfidfVectorizer:

    all_texts = (
        list(combined["resume"]) +
        list(combined["jd"])
    )

    vectorizer = TfidfVectorizer(
        max_features=10_000,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=2,
        sublinear_tf=True,
    )

    vectorizer.fit(all_texts)

    print("\n TF-IDF")
    print(
        "Vocabulary size :",
        len(vectorizer.vocabulary_)
    )

    return vectorizer


# ──────────────────────────────────────────────────────────────────────────────
# Feature Engineering  ← KEY CHANGE
# ──────────────────────────────────────────────────────────────────────────────

def build_feature_matrix(
    df: pd.DataFrame,
    vectorizer: TfidfVectorizer
) -> np.ndarray:
    """
    Build feature matrix of shape (n_samples, 4).

    Feature 1: cosine_similarity
      Raw TF-IDF cosine between resume vector and JD vector.
      Measures keyword overlap between resume and JD.
      Range: 0.0 – 1.0

    Feature 2: resume_length
      Total word count of the resume.
      Why: Longer resumes typically contain more skills and
           experience details -> tend to match detailed JDs better.
      Range: 0 – ~800 words typically

    Feature 3: resume_keyword_density
      Number of skill keywords per 100 words in resume.
      Formula: (skill_count / word_count) x 100
      Why: A skill-dense resume signals technical depth.
           High density + high cosine -> strong Good Fit signal.
      Range: 0 – ~50

    Feature 4: jd_keyword_density
      Number of skill keywords per 100 words in JD.
      Formula: (skill_count / word_count) x 100
      Why: Skill-heavy JDs require specific matches.
           If JD has high density but resume has low density
           -> likely No Fit even if cosine is moderate.
      Range: 0 – ~50

    WHY StandardScaler is needed:
      Feature scales are very different:
        cosine:                0.00 – 0.40   (small decimals)
        resume_length:         50  – 800     (large integers)
        resume_keyword_density: 0  – 50      (medium)
        jd_keyword_density:     0  – 50      (medium)

      Without scaling, resume_length dominates because
      its values are 100x larger than cosine.
      StandardScaler normalizes all to mean=0, std=1.
    """
    print(f"  Building features for {len(df)} pairs...")

    r_vecs = vectorizer.transform(df["resume"].tolist())
    j_vecs = vectorizer.transform(df["jd"].tolist())

    # Fast vectorized cosine (dot product since TF-IDF is L2-normalized)
    cosine_scores = np.sum(
        r_vecs.multiply(j_vecs),
        axis=1
    ).A1   # shape: (n,)

    feature_rows = []

    for i in range(len(df)):
        resume = df["resume"].iloc[i]
        jd     = df["jd"].iloc[i]

        # Feature 1 — cosine similarity
        cos_sim = float(cosine_scores[i])

        # Feature 2 — resume length (word count)
        res_len = len(resume.split())

        # Feature 3 — resume keyword density
        res_density = keyword_density(resume)

        # Feature 4 — JD keyword density
        jd_density = keyword_density(jd)

        feature_rows.append([
            cos_sim,
            res_len,
            res_density,
            jd_density,
        ])

    X = np.array(feature_rows)   # shape: (n, 4)

    print(f"  Feature matrix shape : {X.shape}")
    print(f"  Feature means  : cosine={X[:,0].mean():.4f} | "
          f"res_len={X[:,1].mean():.1f} | "
          f"res_density={X[:,2].mean():.2f} | "
          f"jd_density={X[:,3].mean():.2f}")
    print(f"  Feature ranges :")
    print(f"    cosine_similarity      : {X[:,0].min():.4f} – {X[:,0].max():.4f}")
    print(f"    resume_length          : {X[:,1].min():.0f} – {X[:,1].max():.0f}")
    print(f"    resume_keyword_density : {X[:,2].min():.2f} – {X[:,2].max():.2f}")
    print(f"    jd_keyword_density     : {X[:,3].min():.2f} – {X[:,3].max():.2f}")

    return X


# ──────────────────────────────────────────────────────────────────────────────
# Linear Regression
# ──────────────────────────────────────────────────────────────────────────────

# ──────────────────────────────────────────────────────────────────────────────
# Linear Regression  (cosine only — keeps score equation simple)
# ──────────────────────────────────────────────────────────────────────────────

def train_calibrator(
    df: pd.DataFrame,
    vectorizer: TfidfVectorizer
) -> LinearRegression:
    """
    Linear Regression using ALL 4 features.
    """

    print("\n Training Linear Regression (4 features)")

    # Build same 4-feature matrix used by classifier
    X = build_feature_matrix(df, vectorizer)

    y = df["score"].values

    print("Feature shape :", X.shape)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.1,
        random_state=42,
    )

    # Scale features
    scaler = StandardScaler()

    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    # Train regression
    reg = LinearRegression()
    reg.fit(X_train_s, y_train)

    # Evaluation
    r2 = reg.score(X_test_s, y_test)

    print("\n Linear Regression Metrics")
    print("R² Score :", round(r2, 4))

    print("\n Feature Coefficients")
    print(f"  m1 (cosine_similarity)      = {reg.coef_[0]:.4f}")
    print(f"  m2 (resume_length)          = {reg.coef_[1]:.4f}")
    print(f"  m3 (resume_keyword_density) = {reg.coef_[2]:.4f}")
    print(f"  m4 (jd_keyword_density)     = {reg.coef_[3]:.4f}")

    print(f"\nIntercept (c) = {reg.intercept_:.4f}")

    print("\n📐 Regression Equation")
    print(
        f"ATS = "
        f"({reg.coef_[0]:.4f} × cosine_similarity) + "
        f"({reg.coef_[1]:.4f} × resume_length) + "
        f"({reg.coef_[2]:.4f} × resume_keyword_density) + "
        f"({reg.coef_[3]:.4f} × jd_keyword_density) + "
        f"{reg.intercept_:.4f}"
    )

    return reg


# ──────────────────────────────────────────────────────────────────────────────
# Logistic Regression
# ──────────────────────────────────────────────────────────────────────────────

# ──────────────────────────────────────────────────────────────────────────────
# Logistic Regression  (4 features -> better accuracy)
# ──────────────────────────────────────────────────────────────────────────────

def train_classifier(
    df: pd.DataFrame,
    vectorizer: TfidfVectorizer
) -> tuple:
    """
    Logistic Regression with 4 features.

    Returns (classifier, scaler) — both must be saved and used together.

    WHY StandardScaler:
      resume_length can be 50–800 words
      cosine is 0.00–0.40
      Without scaling, large resume_length values dominate
      Scaler normalizes all features to mean=0, std=1
      Logistic Regression converges properly with normalized features

    WHY class_weight=balanced:
      No Fit:        2565 rows (50%)  ← dominant
      Potential Fit: 1273 rows (25%)
      Good Fit:      1261 rows (25%)
      Without balanced -> model predicts No Fit for everything
      balanced -> minority classes get proportionally higher weight
    """
    print("\n Training Logistic Regression  (4 features)")

    # Build 4-feature matrix
    X = build_feature_matrix(df, vectorizer)
    y = df["true_label"].values

    print("\nClass distribution:")
    unique, counts = np.unique(y, return_counts=True)
    for label, count in zip(unique, counts):
        print(f"  {label:20s} -> {count} rows")

    # Stratified split — preserves class ratio in both sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.1,
        random_state=42,
        stratify=y,
    )

    # Scale features — CRITICAL for Logistic Regression with mixed-scale features
    scaler   = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    print(f"\nTrain size : {X_train_s.shape[0]} | Test size : {X_test_s.shape[0]}")

    clf = LogisticRegression(
        max_iter     = 1000,
        random_state = 42,
        class_weight = "balanced",
    )
    clf.fit(X_train_s, y_train)

    print("\n Classifier trained")
    print("Features expected :", clf.n_features_in_)

    # ── Evaluation ────────────────────────────────────────────────────────────
    y_pred = clf.predict(X_test_s)

    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall    = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1        = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print("\n Classification Metrics  (4 features)")
    print("═" * 50)
    print("Accuracy  :", round(accuracy  * 100, 2), "%")
    print("Precision :", round(precision * 100, 2), "%")
    print("Recall    :", round(recall    * 100, 2), "%")
    print("F1 Score  :", round(f1        * 100, 2), "%")
    print("═" * 50)

    print("\n Classification Report")
    print(classification_report(
        y_test, y_pred,
        labels=CLASS_LABELS,
        zero_division=0,
    ))

    cm = confusion_matrix(y_test, y_pred, labels=CLASS_LABELS)
    print("\n Confusion Matrix")
    print(f"  {'':20s} {'No Fit':>10} {'Potential':>12} {'Good Fit':>10}")
    print("  " + "─" * 55)
    for i, label in enumerate(CLASS_LABELS):
        print(f"  True:{label:18s}  {cm[i][0]:>10}  {cm[i][1]:>11}  {cm[i][2]:>9}")

    return clf, scaler


# ──────────────────────────────────────────────────────────────────────────────
# Save Artifacts
# ──────────────────────────────────────────────────────────────────────────────

def save_artifacts(vectorizer, calibrator, classifier, scaler):
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    artifacts = {
        "tfidf_vectorizer.pkl": vectorizer,
        "calibrator.pkl":       calibrator,
        "classifier.pkl":       classifier,
        "scaler.pkl":           scaler,
    }

    for fname, obj in artifacts.items():
        path = os.path.join(ARTIFACTS_DIR, fname)
        with open(path, "wb") as f:
            pickle.dump(obj, f)

    print("\n Artifacts Saved")
    print("  tfidf_vectorizer.pkl -> TF-IDF vocabulary (10,000 words)")
    print("  calibrator.pkl       -> Linear Regression (ATS score, 4 features)")
    print("  classifier.pkl       -> Logistic Regression (verdict label, 4 features)")
    print("  scaler.pkl           -> StandardScaler (normalizes 4 features)")
    print("  Saved to ->", ARTIFACTS_DIR)

# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():

    parser = argparse.ArgumentParser(
        description="Train ATS Resume Matching Model"
    )

    parser.add_argument(
        "--ds1",
        default=DEFAULT_DS1,
    )

    parser.add_argument(
        "--ds2",
        default=DEFAULT_DS2,
    )

    args = parser.parse_args()

    # ──────────────────────────────────────────────────────────────────
    # Validate Files
    # ──────────────────────────────────────────────────────────────────

    for name, path in [
        ("Dataset 1", args.ds1),
        ("Dataset 2", args.ds2),
    ]:

        if not os.path.exists(path):
            raise FileNotFoundError(
                f"{name} not found:\n{path}"
            )

    # ──────────────────────────────────────────────────────────────────
    # Load Datasets
    # ──────────────────────────────────────────────────────────────────

    print("\n Loading datasets...")

    df1 = load_dataset1(args.ds1)

    print(
        "Dataset 1 rows :",
        len(df1)
    )

    df2 = load_dataset2(args.ds2)

    print(
        "Dataset 2 rows :",
        len(df2)
    )

    # ──────────────────────────────────────────────────────────────────
    # Combine
    # ──────────────────────────────────────────────────────────────────

    combined = build_corpus(
        pd.concat(
            [df1, df2],
            ignore_index=True
        )
    )

   # Load
    print("\n Loading datasets...")
    df1 = load_dataset1(args.ds1)
    print("Dataset 1 rows :", len(df1))
    df2 = load_dataset2(args.ds2)
    print("Dataset 2 rows :", len(df2))

    # Combine for TF-IDF vocabulary
    combined = build_corpus(pd.concat([df1, df2], ignore_index=True))

    # TF-IDF (both datasets)
    vectorizer = train_vectorizer(combined)

    # Linear Regression (Dataset 2, cosine only)
    calibrator = train_calibrator(df2, vectorizer)

    # Logistic Regression (Dataset 2, 4 features)
    classifier, scaler = train_classifier(df2, vectorizer)

    # Save all 4 artifacts
    save_artifacts(vectorizer, calibrator, classifier, scaler)

    print("\n Training Complete!")
    print("Next step -> python app.py")


if __name__ == "__main__":
    main()
