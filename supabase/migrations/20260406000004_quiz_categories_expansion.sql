-- ============================================================
-- Migration: 20260406000004_quiz_categories_expansion.sql
-- Purpose : CH09~CH12 퀴즈 카테고리 4개 추가
-- Created : 2026-04-06  (Phase 6, Team B-12)
-- ============================================================

INSERT INTO quiz_category (slug, name, description, icon, chapter, order_idx) VALUES
  ('data-model',      '데이터 모델',       '약제비 계산 엔진의 데이터 구조',    '📊', 'CH09', 6),
  ('pipeline',        '계산 파이프라인',   '10단계 실행 순서',                  '⚙️', 'CH10', 7),
  ('test-scenarios',  '테스트 시나리오',   'S01~S10 검증 케이스',               '✅', 'CH11', 8),
  ('veteran-claim',   '보훈 청구',         '보훈 약국 약제비 청구 실무',        '🎖️', 'CH12', 9)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  chapter     = EXCLUDED.chapter;
