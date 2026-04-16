-- ============================================================
-- quiz_templates_seed.sql
-- 동적 퀴즈 템플릿 — quiz_templates 테이블 초기 시드
-- 실행 전제: 마이그레이션 20260408000001_quiz_redesign.sql + seeds/quiz_redesign.sql (drug_master 포함)
-- ============================================================
--
-- 이 시드는 /api/quiz/generate?source=template 이 동작하기 위한 핵심.
-- 난이도 × 템플릿타입 × 임상그룹의 20종 조합으로 구성.
-- 각 템플릿은 template-generator.ts 의 파라미터/변수 규약을 준수한다:
--   - 치환 변수: {difficultyLabel} {insuName} {insuCode} {ageDesc} {drugListText} {drugCount} {questionText}
--   - answer_field: drugAmount | totalPrice | userPrice | multiStep | errorSpot | fillBlank
--   - template_type: calc-drug-amount | calc-total | calc-copay | multi-step | error-spot | fill-blank
--
-- 재실행 안전: 기존 행을 지우고 재삽입.

DELETE FROM quiz_templates;

INSERT INTO quiz_templates
  (template_type, difficulty, scenario_label, insu_code_pool, param_schema, prompt_template, answer_field, hint_template, drug_pool_filter, enabled)
VALUES

-- ─────────────────────────────────────────────────────────
-- 난이도 1 (쉬움) — 6개
-- 성인/고혈압 단독/진통 단일, 단일 약품, 단기 처방, 건강보험
-- ─────────────────────────────────────────────────────────

-- [1-1] calc-drug-amount × cold_adult × C10
('calc-drug-amount', 1, '성인 감기 — 약품금액',
 ARRAY['C10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":1,"max":5}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자의 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'drugAmount',
 '["약품금액 = 단가 × 1회투약량 × 1일투여횟수 × 총투여일수","각 약품별로 계산 후 합산","원 미만은 사사오입"]'::jsonb,
 '{"clinicalGroups":["cold_adult"]}'::jsonb,
 true),

-- [1-2] calc-total × cold_adult × C10
('calc-total', 1, '성인 감기 — 총액1',
 ARRAY['C10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":1,"max":2},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자의 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'totalPrice',
 '["약품금액 합계를 먼저 구합니다","조제료를 더합니다","총액1은 10원 미만 절사"]'::jsonb,
 '{"clinicalGroups":["cold_adult"]}'::jsonb,
 true),

-- [1-3] calc-copay × cold_adult × C10
('calc-copay', 1, '성인 감기 — 본인부담금',
 ARRAY['C10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":1,"max":2},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자의 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["건강보험 본인부담률은 30%","100원 미만 절사","총액1 × 0.30 후 버림"]'::jsonb,
 '{"clinicalGroups":["cold_adult"]}'::jsonb,
 true),

-- [1-4] calc-copay × hypertension_mono × C10 (장기)
('calc-copay', 1, '고혈압 단독 — 본인부담금',
 ARRAY['C10'],
 '{"age":{"min":40,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":30,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자가 고혈압 약을 처방받았습니다:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["장기처방이므로 조제료 코드가 달라집니다","투약일수별 Z코드 구간 확인","건보 30% 본인부담"]'::jsonb,
 '{"clinicalGroups":["hypertension_mono"]}'::jsonb,
 true),

-- [1-5] calc-drug-amount × analgesic × C10
('calc-drug-amount', 1, '진통제 단독 — 약품금액',
 ARRAY['C10'],
 '{"age":{"min":18,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":1,"max":3}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'drugAmount',
 '["단순 단일 약품 계산","공식: 단가 × 투약량 × 횟수 × 일수"]'::jsonb,
 '{"atc_class":["analgesic","nsaid"]}'::jsonb,
 true),

-- [1-6] calc-total × hypertension_mono × C10
('calc-total', 1, '고혈압 단독 — 총액1',
 ARRAY['C10'],
 '{"age":{"min":45,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":14,"max":30}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'totalPrice',
 '["약품금액 + 조제료","10원 미만 절사"]'::jsonb,
 '{"clinicalGroups":["hypertension_mono"]}'::jsonb,
 true),

-- ─────────────────────────────────────────────────────────
-- 난이도 2 (보통) — 8개
-- 다약제 복합, 65세 포함, 의료급여, multi-step
-- ─────────────────────────────────────────────────────────

-- [2-1] calc-copay × cold_adult × C10/D10
('calc-copay', 2, '성인 감기 — 건보/의료급여 혼합',
 ARRAY['C10','D10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":2,"max":3},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 처방 ({drugCount}개 약품):\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["보험유형에 따라 본인부담률이 다릅니다","의료급여는 정액/정률 분기","건보는 Trunc100, 의료급여는 Trunc10"]'::jsonb,
 '{"clinicalGroups":["cold_adult"]}'::jsonb,
 true),

-- [2-2] calc-copay × hypertension_combo × C10/D10
('calc-copay', 2, '고혈압 복합 — 본인부담금',
 ARRAY['C10','D10'],
 '{"age":{"min":40,"max":80},"drugCount":{"min":2,"max":3},"dayRange":{"min":14,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자가 고혈압 복합제 장기처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["복합제는 약품금액 합계 증가","장기처방 조제료 구간 확인","보험유형별 본인부담 분기"]'::jsonb,
 '{"clinicalGroups":["hypertension_combo","hypertension_mono"]}'::jsonb,
 true),

-- [2-3] calc-total × hypertension_mono × C10 (65세)
('calc-total', 2, '노인 고혈압 — 총액1',
 ARRAY['C10'],
 '{"age":{"min":65,"max":80},"drugCount":{"min":1,"max":2},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자의 장기처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'totalPrice',
 '["65세 이상 가산 반영","투약일수별 Z코드"]'::jsonb,
 '{"clinicalGroups":["hypertension_mono"]}'::jsonb,
 true),

-- [2-4] calc-drug-amount × pediatric_uri_abx × C10
('calc-drug-amount', 2, '소아 항생제 — 약품금액',
 ARRAY['C10'],
 '{"age":{"min":3,"max":12},"drugCount":{"min":2,"max":3},"dayRange":{"min":5,"max":10},"doseChoices":[0.5,1]}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'drugAmount',
 '["소아는 0.5정 처방이 흔합니다","약품별 사사오입 후 합산"]'::jsonb,
 '{"clinicalGroups":["pediatric_uri_abx","cold_pediatric"]}'::jsonb,
 true),

-- [2-5] multi-step × cold_adult × C10
('multi-step', 2, '성인 감기 — 4단계 계산',
 ARRAY['C10'],
 '{"age":{"min":25,"max":55},"drugCount":{"min":2,"max":2},"dayRange":{"min":3,"max":5}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 처방:\n{drugListText}\n\n각 단계 값을 모두 계산하세요. (단위: 원, 정수)',
 'multiStep',
 '["(1) 약품별 금액 합","(2) 조제료 합","(3) 총액1 = 절사(합계)","(4) 본인부담금 = trunc100(총액1 × 0.30)"]'::jsonb,
 '{"clinicalGroups":["cold_adult"]}'::jsonb,
 true),

-- [2-6] calc-copay × diabetes_t2 × C10/D10
('calc-copay', 2, '당뇨 2형 — 본인부담금',
 ARRAY['C10','D10'],
 '{"age":{"min":40,"max":75},"drugCount":{"min":1,"max":2},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자가 당뇨약 장기처방을 받았습니다:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["만성질환 장기처방","조제료 구간 주의","보험별 본인부담 분기"]'::jsonb,
 '{"clinicalGroups":["diabetes_t2","htn_dm_combo"]}'::jsonb,
 true),

-- [2-7] calc-copay × gerd_acute × C10
('calc-copay', 2, '위염/역류 단기 — 본인부담금',
 ARRAY['C10'],
 '{"age":{"min":25,"max":65},"drugCount":{"min":1,"max":2},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["약품금액 + 조제료 합","건보 30% 본인부담"]'::jsonb,
 '{"clinicalGroups":["gerd_acute"]}'::jsonb,
 true),

-- [2-8] calc-total × elderly_polypharmacy × C10
('calc-total', 2, '노인 다약제 — 총액1',
 ARRAY['C10'],
 '{"age":{"min":70,"max":85},"drugCount":{"min":3,"max":4},"dayRange":{"min":28,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자의 다약제 처방 ({drugCount}종):\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'totalPrice',
 '["여러 약품 합산 시 각각 사사오입","장기 처방 조제료"]'::jsonb,
 '{"clinicalGroups":["elderly_polypharmacy","hypertension_combo","htn_dm_combo"]}'::jsonb,
 true),

-- ─────────────────────────────────────────────────────────
-- 난이도 3 (어려움) — 6개
-- 6세미만, 보훈, 다단계, 오류찾기, 빈칸
-- ─────────────────────────────────────────────────────────

-- [3-1] calc-copay × cold_pediatric × C10 (6세 미만)
('calc-copay', 3, '6세 미만 감기 — 본인부담금',
 ARRAY['C10'],
 '{"age":{"min":1,"max":5},"drugCount":{"min":2,"max":3},"dayRange":{"min":3,"max":5},"doseChoices":[0.5,1]}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 소아 환자 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["6세 미만은 본인부담률 감경","건보 30% × 70% = 21%","trunc100 적용"]'::jsonb,
 '{"clinicalGroups":["cold_pediatric","pediatric_uri_abx"]}'::jsonb,
 true),

-- [3-2] calc-copay × elderly_polypharmacy × C10/D10
('calc-copay', 3, '노인 다약제 — 복합 본인부담',
 ARRAY['C10','D10'],
 '{"age":{"min":65,"max":85},"drugCount":{"min":3,"max":5},"dayRange":{"min":60,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자의 다약제 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["여러 약품 금액 집계","장기 조제료","보험별 부담률 분기","65세 이상 저액 정액 분기 주의"]'::jsonb,
 '{"clinicalGroups":["elderly_polypharmacy","htn_dm_combo"]}'::jsonb,
 true),

-- [3-3] multi-step × hypertension_combo × 혼합
('multi-step', 3, '고혈압 복합 — 4단계 추적',
 ARRAY['C10','D10','G10'],
 '{"age":{"min":45,"max":80},"drugCount":{"min":2,"max":3},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자의 복합 처방:\n{drugListText}\n\n각 단계 값을 모두 계산하세요. (단위: 원, 정수)',
 'multiStep',
 '["단계별로 계산 진행","(1) 약품금액 (2) 조제료 (3) 총액1 (4) 본인부담","보험유형에 따라 4단계 부담 산출 방식 다름"]'::jsonb,
 '{"clinicalGroups":["hypertension_combo","htn_dm_combo"]}'::jsonb,
 true),

-- [3-4] calc-copay × cold_adult × G10 (보훈)
('calc-copay', 3, '보훈 감기 — 본인부담금',
 ARRAY['G10'],
 '{"age":{"min":60,"max":80},"drugCount":{"min":1,"max":2},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 보훈 환자 처방:\n{drugListText}\n\n{questionText}\n(단위: 원, 정수로 입력)',
 'userPrice',
 '["보훈은 기본 감면율 적용","M코드 없이 G계열 단독","공단/환자/보훈 3자배분 개념"]'::jsonb,
 '{"clinicalGroups":["cold_adult","hypertension_mono"]}'::jsonb,
 true),

-- [3-5] error-spot × cold_adult × C10
('error-spot', 3, '오류 찾기 — 계산 단계',
 ARRAY['C10'],
 '{"age":{"min":30,"max":60},"drugCount":{"min":2,"max":2},"dayRange":{"min":3,"max":5}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 처방:\n{drugListText}\n\n{questionText}',
 'errorSpot',
 '["각 단계 검산","약품금액 → 조제료 → 총액1 → 본인부담","단계별 반올림 방식 확인 (trunc10/trunc100/사사오입)"]'::jsonb,
 '{"clinicalGroups":["cold_adult"]}'::jsonb,
 true),

-- [3-6] fill-blank × cold_adult × C10
('fill-blank', 3, '빈칸 채우기 — 계산식',
 ARRAY['C10'],
 '{"age":{"min":30,"max":60},"drugCount":{"min":1,"max":2},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 처방:\n{drugListText}\n\n{questionText}\n(각 빈칸은 원 단위 정수)',
 'fillBlank',
 '["빈칸 3개: 약품금액·조제료·총액1","각각 단계별로 계산","총액1 = trunc10(약품금액 + 조제료)"]'::jsonb,
 '{"clinicalGroups":["cold_adult"]}'::jsonb,
 true);
