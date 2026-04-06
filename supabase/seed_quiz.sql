-- ============================================================
-- seed_quiz.sql — 퀴즈 카테고리 5개 + 문제 25개
-- Supabase SQL Editor에서 실행 (migration 적용 후)
-- ============================================================

-- ── 카테고리 ───────────────────────────────────────────────────
INSERT INTO quiz_category (slug, name, description, icon, order_idx) VALUES
  ('basic-calc',    '기본 계산',    '약품금액·조제료 기본 계산 원리를 묻는 문제',       '🔢', 1),
  ('copayment',     '본인부담금',   '보험유형별 본인부담율과 정액/정률 계산 문제',       '💰', 2),
  ('rounding',      '반올림·절사',  '사사오입·10원절사·100원절사 규칙을 확인하는 문제', '📐', 3),
  ('insu-type',     '보험 유형',    '건강보험/의료급여/보훈 등 보험코드 식별 문제',      '🏥', 4),
  ('special-case',  '특수 케이스',  '65세 이상·6세 미만·야간가산 등 특수 규칙 문제',   '⭐', 5);

-- ── 문제 ───────────────────────────────────────────────────────
-- [기본 계산] CH01 ─────────────────────────────────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH01', 1, 'multiple_choice',
 '약품금액 계산의 기본 공식으로 올바른 것은?',
 '["단가 × 1일투여횟수 × 총투여일수", "단가 × 1회투약량 × 총투여일수", "단가 × 1회투약량 × 1일투여횟수 × 총투여일수", "단가 × 투여총량"]'::jsonb,
 '2',
 '약품금액 = 단가 × 1회투약량 × 1일투여횟수 × 총투여일수 (원미만 4사5입). 4개 소스(비즈팜·공단·유팜·EDB) 모두 동일 공식을 사용합니다.',
 ARRAY['약품금액', '계산공식', 'CH01']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH01', 1, 'numeric',
 '단가 500원, 1회투약량 1정, 1일투여횟수 3회, 총투여일수 7일인 내복약의 약품금액(원)은?',
 NULL,
 '10500',
 '500 × 1 × 3 × 7 = 10,500원. 소수점이 없으므로 반올림 없이 10,500원입니다.',
 ARRAY['약품금액', '계산실습', 'CH01']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH01', 2, 'multiple_choice',
 '단가 173원짜리 약을 1회 0.5정씩 1일 2회, 5일간 투여할 때 약품금액(원미만 4사5입)은?',
 '["865원", "866원", "867원", "870원"]'::jsonb,
 '0',
 '173 × 0.5 × 2 × 5 = 865.0원. 원미만이 없으므로 4사5입 결과는 865원입니다.',
 ARRAY['약품금액', '소수투약량', '반올림', 'CH01']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH01', 2, 'multiple_choice',
 '1회투약량의 유효 소수점 자리수는 몇 자리인가?',
 '["소수 2자리", "소수 4자리", "소수 6자리", "제한 없음"]'::jsonb,
 '1',
 '1회투약량은 소수점 4자리까지 유효하며, 소수점 5자리에서 4사5입합니다. 1일투여횟수는 소수점 2자리까지입니다.',
 ARRAY['소수점정밀도', '약품금액', 'CH01']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH01', 3, 'numeric',
 '단가 210원, 1회투약량 0.33333정(5자리 원본값), 1일3회, 7일 처방. 1회투약량을 4자리로 정규화 후 약품금액(원)은?',
 NULL,
 '1470',
 '1회투약량 0.33333 → 4자리 반올림 = 0.3333. 약품금액 = 210 × 0.3333 × 3 × 7 = 210 × 6.9993 = 1,469.853 → 4사5입 = 1,470원.',
 ARRAY['소수점정밀도', '약품금액', '사사오입', 'CH01']);

-- [본인부담금] CH05 ────────────────────────────────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 1, 'multiple_choice',
 '건강보험 일반(C10) 환자의 본인부담율은?',
 '["10%", "20%", "30%", "40%"]'::jsonb,
 '2',
 '건강보험 일반(C10)의 본인부담율은 30%입니다. 본인일부부담금 = trunc100(총약제비 × 30%)로 계산합니다.',
 ARRAY['본인부담금', '건강보험', 'C10', 'CH05']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 1, 'numeric',
 '총약제비(요양급여비용총액1) = 19,160원, 건강보험 C10. 본인부담금(100원 절사)은 얼마인가?',
 NULL,
 '5700',
 '19,160 × 0.30 = 5,748원 → 100원 미만 절사 → 5,700원.',
 ARRAY['본인부담금', '건강보험', '100원절사', 'CH05']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 2, 'multiple_choice',
 '의료급여 1종(D10) 본인부담금 계산에서 정액 기준값(Mcode)은 얼마인가?',
 '["500원", "1,000원", "1,500원", "2,000원"]'::jsonb,
 '1',
 '의료급여 1종(D10)의 M코드 기준값은 1,000원입니다. B코드(외래용) 기준값은 1,500원입니다.',
 ARRAY['의료급여', 'D10', '정액', 'CH05']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 2, 'multiple_choice',
 '65세 이상 건강보험 환자의 총약제비가 8,000원일 때 적용되는 본인부담 방식은?',
 '["30% 정률", "20% 정률", "정액 1,000원", "면제"]'::jsonb,
 '2',
 '65세 이상이며 총약제비가 10,000원 이하이면 정액 1,000원을 적용합니다 (2018-01-01 시행). 단, 산정특례 해당자는 제외.',
 ARRAY['65세이상', '정액', '건강보험', 'CH05']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 3, 'multiple_choice',
 '65세 이상 건강보험 환자, 총약제비 11,000원. 적용 본인부담율은?',
 '["30%", "20%", "정액 1,000원", "정액 1,500원"]'::jsonb,
 '1',
 '65세 이상 2구간: 10,000원 초과 ~ 12,000원 이하는 20% 정률 (2018-01-01 시행). 11,000원 × 20% = 2,200 → trunc100 = 2,200원.',
 ARRAY['65세이상', '2구간', '20%', 'CH05']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 2, 'multiple_choice',
 '6세 미만 소아의 건강보험 본인부담율은?',
 '["30%", "21%", "10%", "0%"]'::jsonb,
 '1',
 '6세 미만은 성인 부담(30%)의 70%를 적용합니다. 30% × 70% = 21%. 약국에서는 1세 미만과 6세 미만을 구분하지 않고 동일하게 21%를 적용합니다.',
 ARRAY['6세미만', '소아', '본인부담금', 'CH05']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 1, 'true_false',
 '차상위 1종(C31) 환자의 처방조제 본인부담금은 0원이다.',
 '["참", "거짓"]'::jsonb,
 '0',
 '차상위 1종(C31)은 본인부담이 면제되어 0원입니다. 차상위 2종(C32)은 정액 500원을 부담합니다.',
 ARRAY['차상위', 'C31', '면제', 'CH05']);

-- [반올림·절사] CH07 ───────────────────────────────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH07', 1, 'multiple_choice',
 '건강보험(C10) 본인부담금의 절사 단위는?',
 '["10원 절사", "100원 절사", "1,000원 절사", "절사 없음"]'::jsonb,
 '1',
 '건강보험 일반(C10)의 본인부담금은 100원 미만을 절사합니다. trunc100(총약제비 × 30%)로 계산합니다.',
 ARRAY['절사', '본인부담금', '건강보험', 'CH07']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH07', 1, 'multiple_choice',
 '요양급여비용총액1(01항+02항)을 산출할 때 적용하는 절사 방식은?',
 '["원미만 4사5입", "10원 미만 절사", "100원 미만 절사", "절사 없음"]'::jsonb,
 '1',
 '요양급여비용총액1 = trunc10(01항 합계 + 02항 합계). 10원 미만을 절사합니다. 4개 소스 모두 일치.',
 ARRAY['요양급여비용총액1', '10원절사', 'CH07']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH07', 2, 'multiple_choice',
 '의료급여(D) 본인부담금의 절사 방식은?',
 '["절사 없음", "원미만 4사5입", "10원 미만 절사", "100원 미만 절사"]'::jsonb,
 '2',
 '의료급여(D)의 본인부담금은 10원 미만 절사입니다. 건강보험(C)의 100원 절사와 다른 중요한 차이점입니다.',
 ARRAY['의료급여', '10원절사', '절사', 'CH07']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH07', 2, 'numeric',
 '총약제비 19,160원에서 C10 본인부담금을 계산하면? trunc100(19160 × 0.30) = ?',
 NULL,
 '5700',
 '19,160 × 0.30 = 5,748. trunc100(5748) = 5,700원. 100원 미만(48원)을 절사합니다.',
 ARRAY['100원절사', '건강보험', '계산실습', 'CH07']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH07', 3, 'multiple_choice',
 '약품금액 계산 시 사용하는 반올림 방식은?',
 '["은행원 반올림(ToEven)", "4사5입(AwayFromZero)", "무조건 올림(Ceiling)", "무조건 내림(Floor)"]'::jsonb,
 '1',
 '약품금액은 4사5입(MidpointRounding.AwayFromZero)을 사용합니다. 0.5는 올림 처리합니다. 은행원 반올림(ToEven)과 0.5 처리가 다르므로 주의가 필요합니다.',
 ARRAY['사사오입', '반올림', 'AwayFromZero', 'CH07']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH07', 2, 'numeric',
 'trunc10(약가 10,503원 + 조제료 8,659원)을 계산하면?',
 NULL,
 '19160',
 '10,503 + 8,659 = 19,162원. trunc10(19162) = 19,160원 (10원 미만 2원 절사).',
 ARRAY['10원절사', '요양급여비용총액1', '계산실습', 'CH07']);

-- [보험 유형] CH05/인수유형 ────────────────────────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 1, 'multiple_choice',
 '보훈 100/100(G10) 환자의 본인부담금은?',
 '["총약제비의 10%", "총약제비의 30%", "정액 1,000원", "0원 (전액 국비)"]'::jsonb,
 '3',
 '보훈 100/100(G10)은 국비로 전액 지원되어 환자 본인부담금이 0원입니다. 전 소스 코드에서 일치 확인.',
 ARRAY['보훈', 'G10', '국비', '본인부담금']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 2, 'multiple_choice',
 '자동차보험(F코드) 처방조제의 환자 본인부담금은?',
 '["30%", "20%", "10%", "0원 (전액 보험사 부담)"]'::jsonb,
 '3',
 '자동차보험(F코드) 및 산재는 자동차손해배상보장법에 따라 보험사가 전액 부담합니다. 환자 본인부담금 0원.',
 ARRAY['자동차보험', '산재', '본인부담금']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 1, 'multiple_choice',
 '건강보험 직접조제(의분예외) 본인부담율은?',
 '["20%", "30%", "40%", "50%"]'::jsonb,
 '2',
 '건강보험 처방조제는 30%이지만, 직접조제(의분예외)는 40%입니다. 절사 방식은 동일하게 100원 미만 절사.',
 ARRAY['직접조제', '40%', '건강보험', 'CH05']);

-- [특수 케이스] CH03/CH04/특수규칙 ────────────────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 2, 'multiple_choice',
 '야간(평일 18시 이후) 기본조제료는 일반 기본조제료(1,720원) 대비 어떻게 달라지는가?',
 '["동일하다", "야간 전용 Z2000010 단가 2,240원을 적용한다", "1,720원에 30% 가산한다", "1,720원에 50% 가산한다"]'::jsonb,
 '1',
 '야간에는 Z2000010(기본조제료 야간) 단가 2,240원을 사용합니다. 별도 Z코드가 존재하므로 퍼센트 가산이 아닌 단가 자체가 다릅니다.',
 ARRAY['야간가산', 'Z2000010', '기본조제료', '특수케이스']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH01', 3, 'multiple_choice',
 '청구액(공단 청구액) 계산 시 절사 처리는?',
 '["10원 미만 절사", "100원 미만 절사", "절사 없음 (그대로 적용)", "원미만 4사5입"]'::jsonb,
 '2',
 '청구액 = 요양급여비용총액1 - 본인일부부담금. 청구액 자체에는 추가 절사가 없습니다. 총액1과 본인부담금에서 이미 절사가 적용되었기 때문입니다.',
 ARRAY['청구액', '절사없음', 'CH07']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH05', 3, 'numeric',
 '총약제비 19,160원, 건강보험 C10, 40세 환자. 청구액(공단 청구액)은 얼마인가? (본인부담금: 5,700원)',
 NULL,
 '13460',
 '청구액 = 총약제비 - 본인부담금 = 19,160 - 5,700 = 13,460원. 추가 절사 없음.',
 ARRAY['청구액', '건강보험', '계산실습', 'CH05']);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH07', 3, 'multiple_choice',
 '보훈 감면(30~90%) 환자의 본인부담금 절사 방식은?',
 '["절사 없음", "원미만 4사5입", "100원 미만 절사", "10원 미만 절사"]'::jsonb,
 '3',
 '보훈 감면 케이스는 10원 미만 절사(trunc10)를 적용합니다. 보훈 일반(<100% 감면)은 100원 절사이며 경우에 따라 다르므로 주의가 필요합니다.',
 ARRAY['보훈', '10원절사', '감면', 'CH07']);
