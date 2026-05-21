-- ─────────────────────────────────────────────────────────
--  Skill Gap Analyzer - MySQL Schema
-- ─────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS skill_gap_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skill_gap_db;

CREATE TABLE IF NOT EXISTS analyses (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255)  NOT NULL COMMENT 'User full name',
    job_title     VARCHAR(255)  NOT NULL COMMENT 'Job title entered by user',
    job_description TEXT                  COMMENT 'Job description entered by user',
    user_skills   TEXT          NOT NULL  COMMENT 'Comma-separated skills user knows',
    matched_skills TEXT                   COMMENT 'JSON array of matched skills',
    missing_skills TEXT                   COMMENT 'JSON array of missing skills',
    extra_skills   TEXT                   COMMENT 'JSON array of extra skills user has',
    score         FLOAT         NOT NULL  COMMENT 'Skill match score 0-100',
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name       (name),
    INDEX idx_job_title  (job_title),
    INDEX idx_score      (score),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;