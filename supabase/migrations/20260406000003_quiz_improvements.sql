-- ============================================================
-- 20260406000003_quiz_improvements.sql
-- quiz_category에 chapter 컬럼 추가 → DB-driven 매핑
-- quiz_question 인덱스 추가 → 랜덤 쿼리 성능 개선
-- ============================================================

-- 1. quiz_category에 chapter 컬럼 추가
ALTER TABLE quiz_category ADD COLUMN IF NOT EXISTS chapter VARCHAR(10);

-- 2. 기존 카테고리에 chapter 값 세팅 (mismatch 수정 포함)
UPDATE quiz_category SET chapter = 'CH01' WHERE slug = 'basic-calc';
UPDATE quiz_category SET chapter = 'CH05' WHERE slug = 'copayment';
UPDATE quiz_category SET chapter = 'CH07' WHERE slug = 'rounding';
UPDATE quiz_category SET chapter = 'CH06' WHERE slug = 'insu-type';      -- 기존 CH05에서 수정
UPDATE quiz_category SET chapter = 'CH08' WHERE slug = 'special-case';   -- 기존 CH05에서 수정

-- 3. 인덱스 추가 (랜덤 쿼리 & 필터 성능 개선)
CREATE INDEX IF NOT EXISTS idx_quiz_question_chapter    ON quiz_question(chapter);
CREATE INDEX IF NOT EXISTS idx_quiz_question_difficulty ON quiz_question(difficulty);

-- 4. get_random_questions RPC (서버사이드 랜덤 샘플)
CREATE OR REPLACE FUNCTION get_random_questions(n integer)
RETURNS SETOF quiz_question
LANGUAGE sql STABLE
AS $$
  SELECT * FROM quiz_question
  ORDER BY random()
  LIMIT n;
$$;

-- 5. get_random_questions_by_chapter RPC (챕터 필터 + 랜덤)
CREATE OR REPLACE FUNCTION get_random_questions_by_chapter(p_chapter text, n integer)
RETURNS SETOF quiz_question
LANGUAGE sql STABLE
AS $$
  SELECT * FROM quiz_question
  WHERE chapter = p_chapter
  ORDER BY random()
  LIMIT n;
$$;
