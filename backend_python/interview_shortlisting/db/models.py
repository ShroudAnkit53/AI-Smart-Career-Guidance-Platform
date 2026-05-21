from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100))
    email      = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    analyses = db.relationship("Analysis", backref="user", lazy=True)


class Analysis(db.Model):
    __tablename__ = "analyses"

    id                = db.Column(db.Integer, primary_key=True)
    user_id           = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    resume_text       = db.Column(db.Text)
    jd_text           = db.Column(db.Text)
    probability_score = db.Column(db.Float)

    # Stores "No Fit" | "Potential Fit" | "Good Fit"
    # (matches the actual label values in both training datasets)
    verdict_label     = db.Column(db.String(20))

    # JSON-encoded list of tip dicts
    tips              = db.Column(db.Text)

    created_at        = db.Column(db.DateTime, default=datetime.utcnow)