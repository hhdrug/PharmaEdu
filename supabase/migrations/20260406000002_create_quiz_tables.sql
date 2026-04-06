-- ============================================================
-- Migration: 20260406000002_create_quiz_tables.sql
-- 퀴즈 시스템 테이블 생성 (Quiz Team)
-- Created: 2026-04-06
-- ============================================================

-- ── 퀴즈 카테고리 ──────────────────────────────────────────────
CREATE TABLE quiz_category (
  id          BIGSERIAL PRIMARY KEY,
  slug        VARCHAR(50) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  icon        VARCHAR(20),
  order_idx   SMALLINT DEFAULT 0
);

-- ── 퀴즈 문제 ──────────────────────────────────────────────────
CREATE TABLE quiz_question (
  id             BIGSERIAL PRIMARY KEY,
  chapter        VARCHAR(10) NOT NULL,     -- 'CH01', 'CH05' 등
  difficulty     SMALLINT NOT NULL,        -- 1=쉬움, 2=보통, 3=어려움
  question_type  VARCHAR(20) NOT NULL,     -- 'multiple_choice', 'numeric', 'true_false'
  question       TEXT NOT NULL,
  choices        JSONB,                    -- MC: string[] / numeric: null
  correct_answer TEXT NOT NULL,            -- MC: "0"~"3" (0-indexed) / numeric: 숫자 문자열
  explanation    TEXT NOT NULL,
  tags           TEXT[],
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS 설정 ───────────────────────────────────────────────────
ALTER TABLE quiz_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 읽기" ON quiz_question FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON quiz_category FOR SELECT USING (true);

-- ── 인덱스 ─────────────────────────────────────────────────────
CREATE INDEX idx_quiz_question_chapter    ON quiz_question (chapter);
CREATE INDEX idx_quiz_question_difficulty ON quiz_question (difficulty);
CREATE INDEX idx_quiz_category_slug       ON quiz_category (slug);
