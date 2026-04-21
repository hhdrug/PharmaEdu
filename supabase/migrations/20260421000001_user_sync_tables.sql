-- ====================================================================
-- 20260421000001_user_sync_tables.sql
-- 사용자별 학습 데이터 동기화 테이블 (localStorage ↔ Supabase)
-- ====================================================================
-- 3개 테이블:
--   user_wrong_notes     — 오답 노트 (SM-2 간격 반복 상태 포함)
--   user_quiz_history    — 퀴즈 세션 기록
--   user_learning_state  — 레슨 진도 + 북마크 (단일 jsonb doc)
--
-- 인증: Supabase Auth (auth.users) 사용. 모든 테이블에 RLS 적용하여
-- 본인 데이터만 읽기/쓰기 가능.
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 1. user_wrong_notes
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_wrong_notes (
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id    bigint      NOT NULL,
  question       text        NOT NULL,
  correct_answer text        NOT NULL,
  user_answer    text        NOT NULL,
  explanation    text        NOT NULL DEFAULT '',
  chapter        text        NOT NULL,
  difficulty     smallint    NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  attempts       int         NOT NULL DEFAULT 1,
  resolved       boolean     NOT NULL DEFAULT false,
  -- SM-2 Lite
  next_review_at timestamptz,
  interval_days  int         NOT NULL DEFAULT 1,
  easiness       numeric(3,2) NOT NULL DEFAULT 2.5,
  review_count   int         NOT NULL DEFAULT 0,
  -- 원본 생성 시각 (localStorage timestamp 와 매핑)
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wrong_notes_user_due
  ON user_wrong_notes(user_id, next_review_at)
  WHERE resolved = false;

-- ────────────────────────────────────────────────────────────────────
-- 2. user_quiz_history
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_quiz_history (
  id             bigserial   PRIMARY KEY,
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 클라이언트측 id (localStorage entry id, dedupe용)
  client_id      text,
  category       text        NOT NULL,
  category_label text        NOT NULL,
  score          int         NOT NULL,
  total          int         NOT NULL,
  pct            int         NOT NULL,
  played_at      timestamptz NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quiz_history_user_played
  ON user_quiz_history(user_id, played_at DESC);

-- ────────────────────────────────────────────────────────────────────
-- 3. user_learning_state — 레슨 진도 + 북마크 (단일 doc)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_learning_state (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- RLS 정책
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE user_wrong_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_state  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_wrong_notes_rw ON user_wrong_notes;
CREATE POLICY user_wrong_notes_rw ON user_wrong_notes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_quiz_history_rw ON user_quiz_history;
CREATE POLICY user_quiz_history_rw ON user_quiz_history
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_learning_state_rw ON user_learning_state;
CREATE POLICY user_learning_state_rw ON user_learning_state
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────
-- updated_at 자동 갱신 트리거
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_wrong_notes_touch ON user_wrong_notes;
CREATE TRIGGER trg_user_wrong_notes_touch
  BEFORE UPDATE ON user_wrong_notes
  FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();

DROP TRIGGER IF EXISTS trg_user_learning_state_touch ON user_learning_state;
CREATE TRIGGER trg_user_learning_state_touch
  BEFORE UPDATE ON user_learning_state
  FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();
