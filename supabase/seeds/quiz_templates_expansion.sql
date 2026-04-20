-- ============================================================
-- quiz_templates_expansion.sql
-- 동적 퀴즈 템플릿 +70개 추가 (방안 1)
-- ============================================================
--
-- 전제: quiz_templates_seed.sql (20개) 실행 후 추가 실행.
-- 총 템플릿 수: 20 + 70 = 90개 → 매번 다른 숫자로 무한 생성.
--
-- 변수 치환: {difficultyLabel} {insuName} {insuCode} {ageDesc} {drugListText} {drugCount} {questionText}
-- answer_field: drugAmount | totalPrice | userPrice | multiStep | errorSpot | fillBlank

INSERT INTO quiz_templates
  (template_type, difficulty, scenario_label, insu_code_pool, param_schema, prompt_template, answer_field, hint_template, drug_pool_filter, enabled)
VALUES

-- ─────────────────────────────────────────────────────────
-- 난이도 1 (쉬움) — 추가 18개: 기본 약품군 전 클래스 커버
-- ─────────────────────────────────────────────────────────

('calc-drug-amount', 1, '고혈압 단독 단기 — 약품금액', ARRAY['C10'],
 '{"age":{"min":40,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 고혈압 단독 처방:\n{drugListText}\n\n{questionText}', 'drugAmount',
 '["단가 × 1회 × 1일횟수 × 총일수"]'::jsonb, '{"clinicalGroups":["hypertension_mono"]}'::jsonb, true),

('calc-drug-amount', 1, '2형 당뇨 — 약품금액', ARRAY['C10'],
 '{"age":{"min":40,"max":70},"drugCount":{"min":1,"max":1},"dayRange":{"min":14,"max":30}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 당뇨 처방:\n{drugListText}\n\n{questionText}', 'drugAmount',
 '["당뇨약은 장기처방이 흔함"]'::jsonb, '{"clinicalGroups":["diabetes_t2"]}'::jsonb, true),

('calc-drug-amount', 1, '위염/역류 — 약품금액', ARRAY['C10'],
 '{"age":{"min":25,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 위염 처방:\n{drugListText}\n\n{questionText}', 'drugAmount',
 NULL, '{"clinicalGroups":["gerd_acute"]}'::jsonb, true),

('calc-drug-amount', 1, '진통제 — 약품금액', ARRAY['C10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":1,"max":5}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 통증 처방:\n{drugListText}\n\n{questionText}', 'drugAmount',
 NULL, '{"atc_class":["analgesic","nsaid"]}'::jsonb, true),

('calc-drug-amount', 1, '진해거담 — 약품금액', ARRAY['C10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 기침/가래 처방:\n{drugListText}\n\n{questionText}', 'drugAmount',
 NULL, '{"atc_class":["antitussive","mucolytic"]}'::jsonb, true),

('calc-total', 1, '당뇨 단독 — 총액1', ARRAY['C10'],
 '{"age":{"min":45,"max":70},"drugCount":{"min":1,"max":1},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 환자 당뇨 처방:\n{drugListText}\n\n{questionText}', 'totalPrice',
 '["약품금액 + 조제료 합 후 trunc10"]'::jsonb, '{"clinicalGroups":["diabetes_t2"]}'::jsonb, true),

('calc-total', 1, '위염 단기 — 총액1', ARRAY['C10'],
 '{"age":{"min":25,"max":65},"drugCount":{"min":1,"max":2},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 위염 처방:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"clinicalGroups":["gerd_acute"]}'::jsonb, true),

('calc-total', 1, '비염 — 총액1', ARRAY['C10'],
 '{"age":{"min":20,"max":50},"drugCount":{"min":1,"max":2},"dayRange":{"min":5,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 비염 처방:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"atc_class":["antihist","decongestant","nasal_spray"]}'::jsonb, true),

('calc-total', 1, '감기 2종 — 총액1', ARRAY['C10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":2,"max":2},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 감기 2종 처방:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"clinicalGroups":["cold_adult"]}'::jsonb, true),

('calc-copay', 1, '진통제 — 본인부담', ARRAY['C10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":1,"max":1},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 통증 처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["건보 30% 정률 + trunc100"]'::jsonb, '{"atc_class":["analgesic","nsaid"]}'::jsonb, true),

('calc-copay', 1, '위장 보호 — 본인부담', ARRAY['C10'],
 '{"age":{"min":30,"max":70},"drugCount":{"min":1,"max":1},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 위장 처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"atc_class":["antacid","gastromuc"]}'::jsonb, true),

('calc-copay', 1, '만성 통증 경증 — 본인부담', ARRAY['C10'],
 '{"age":{"min":30,"max":70},"drugCount":{"min":1,"max":2},"dayRange":{"min":14,"max":30}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 만성통증 처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"clinicalGroups":["chronic_pain"]}'::jsonb, true),

('calc-copay', 1, '항생제 — 본인부담', ARRAY['C10'],
 '{"age":{"min":20,"max":60},"drugCount":{"min":1,"max":2},"dayRange":{"min":5,"max":10}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 항생제 처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"atc_class":["antibiotic"]}'::jsonb, true),

('calc-copay', 1, '노인 기억력 — 본인부담', ARRAY['C10'],
 '{"age":{"min":70,"max":90},"drugCount":{"min":1,"max":1},"dayRange":{"min":28,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 치매 처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["65세 이상 정액 분기 가능성"]'::jsonb, '{"clinicalGroups":["dementia"]}'::jsonb, true),

('calc-copay', 1, '항혈소판 — 본인부담', ARRAY['C10'],
 '{"age":{"min":55,"max":80},"drugCount":{"min":1,"max":1},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 항혈소판 장기처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"atc_class":["antiplatelet"]}'::jsonb, true),

('calc-copay', 1, '이뇨제 단독 — 본인부담', ARRAY['C10'],
 '{"age":{"min":55,"max":85},"drugCount":{"min":1,"max":1},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 이뇨제:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"atc_class":["diuretic"]}'::jsonb, true),

('calc-total', 1, '진해 단독 — 총액1', ARRAY['C10'],
 '{"age":{"min":20,"max":50},"drugCount":{"min":1,"max":1},"dayRange":{"min":3,"max":5}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 진해제:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"atc_class":["antitussive"]}'::jsonb, true),

('calc-total', 1, '경미 오피오이드 — 총액1', ARRAY['C10'],
 '{"age":{"min":40,"max":75},"drugCount":{"min":1,"max":1},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 통증 경미 오피오이드:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"atc_class":["opioid_mild"]}'::jsonb, true),

-- ─────────────────────────────────────────────────────────
-- 난이도 2 (보통) — 추가 22개: 의료급여·혼합·노인·특수 그룹
-- ─────────────────────────────────────────────────────────

('calc-copay', 2, '의료급여 1종 고혈압 장기', ARRAY['D10'],
 '{"age":{"min":40,"max":80},"drugCount":{"min":1,"max":2},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 고혈압 장기처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["D10 의료급여 1종 Mcode 정액"]'::jsonb, '{"clinicalGroups":["hypertension_mono"]}'::jsonb, true),

('calc-copay', 2, '의료급여 2종 당뇨', ARRAY['D20'],
 '{"age":{"min":40,"max":75},"drugCount":{"min":1,"max":2},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 당뇨 처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["D20 의료급여 2종 Bcode 정액"]'::jsonb, '{"clinicalGroups":["diabetes_t2"]}'::jsonb, true),

('calc-copay', 2, '의료급여 만성통증', ARRAY['D10','D20'],
 '{"age":{"min":40,"max":80},"drugCount":{"min":1,"max":2},"dayRange":{"min":14,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 만성통증 처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"clinicalGroups":["chronic_pain"]}'::jsonb, true),

('calc-copay', 2, '당뇨+고혈압 동반', ARRAY['C10','D10'],
 '{"age":{"min":50,"max":80},"drugCount":{"min":2,"max":3},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 당뇨+고혈압 복합:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["복합질환 다약제","장기처방 조제료 구간"]'::jsonb, '{"clinicalGroups":["htn_dm_combo"]}'::jsonb, true),

('calc-copay', 2, '노인 65세 FixCost', ARRAY['C10'],
 '{"age":{"min":65,"max":85},"drugCount":{"min":1,"max":1},"dayRange":{"min":3,"max":7},"priceRange":{"min":30,"max":100}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 저액 단기처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["65세 + 총액1 ≤ 10,000원 → FixCost 정액"]'::jsonb, '{"atc_class":["analgesic","antacid"]}'::jsonb, true),

('calc-total', 2, '고혈압 복합 다약제', ARRAY['C10'],
 '{"age":{"min":50,"max":80},"drugCount":{"min":3,"max":4},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 고혈압 복합:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"clinicalGroups":["hypertension_combo"]}'::jsonb, true),

('calc-total', 2, '2형 당뇨 장기', ARRAY['C10'],
 '{"age":{"min":45,"max":75},"drugCount":{"min":2,"max":3},"dayRange":{"min":60,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 당뇨 복합장기:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"clinicalGroups":["diabetes_t2"]}'::jsonb, true),

('calc-total', 2, '소아 감기 시럽', ARRAY['C10'],
 '{"age":{"min":1,"max":12},"drugCount":{"min":2,"max":3},"dayRange":{"min":3,"max":7},"doseChoices":[0.5,1]}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 소아 감기 시럽 처방:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"clinicalGroups":["cold_pediatric"]}'::jsonb, true),

('calc-total', 2, '만성통증 + 위보호', ARRAY['C10'],
 '{"age":{"min":40,"max":75},"drugCount":{"min":2,"max":3},"dayRange":{"min":14,"max":30}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} NSAID+위보호:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"clinicalGroups":["chronic_pain","gerd_acute"]}'::jsonb, true),

('multi-step', 2, '성인 감기 단계별', ARRAY['C10'],
 '{"age":{"min":25,"max":55},"drugCount":{"min":2,"max":2},"dayRange":{"min":3,"max":5}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 감기 단계별:\n{drugListText}\n\n단계값을 입력', 'multiStep',
 '["4단계: 약품금액 → 조제료 → 총액1 → 본인부담"]'::jsonb, '{"clinicalGroups":["cold_adult"]}'::jsonb, true),

('multi-step', 2, '고혈압 단독 단계별', ARRAY['C10'],
 '{"age":{"min":40,"max":60},"drugCount":{"min":1,"max":2},"dayRange":{"min":28,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 고혈압 단계별:\n{drugListText}', 'multiStep',
 NULL, '{"clinicalGroups":["hypertension_mono"]}'::jsonb, true),

('multi-step', 2, '당뇨 단독 단계별', ARRAY['C10','D10'],
 '{"age":{"min":45,"max":75},"drugCount":{"min":1,"max":2},"dayRange":{"min":30,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 당뇨 단계별:\n{drugListText}', 'multiStep',
 NULL, '{"clinicalGroups":["diabetes_t2"]}'::jsonb, true),

('calc-copay', 2, '항고혈압 이뇨 복합', ARRAY['C10','D10'],
 '{"age":{"min":55,"max":80},"drugCount":{"min":2,"max":2},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} ARB+이뇨제:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"atc_class":["antihtn","diuretic"]}'::jsonb, true),

('calc-copay', 2, '노인 다질환', ARRAY['C10','D10'],
 '{"age":{"min":70,"max":88},"drugCount":{"min":3,"max":4},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 노인 다질환 처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["65세 이상 특례 고려","다약제 조제료"]'::jsonb, '{"clinicalGroups":["elderly_polypharmacy","htn_dm_combo"]}'::jsonb, true),

('fill-blank', 2, '고혈압 단독 빈칸', ARRAY['C10'],
 '{"age":{"min":50,"max":70},"drugCount":{"min":1,"max":1},"dayRange":{"min":28,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 고혈압 처방:\n{drugListText}\n\n약품금액, 조제료, 총액1 빈칸 채우기', 'fillBlank',
 NULL, '{"clinicalGroups":["hypertension_mono"]}'::jsonb, true),

('fill-blank', 2, '노인 다약제 빈칸', ARRAY['C10'],
 '{"age":{"min":65,"max":85},"drugCount":{"min":2,"max":3},"dayRange":{"min":30,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 노인 다약제:\n{drugListText}\n\n각 단계값 빈칸 채우기', 'fillBlank',
 NULL, '{"clinicalGroups":["elderly_polypharmacy"]}'::jsonb, true),

('error-spot', 2, '소아 감기 단계 오류', ARRAY['C10'],
 '{"age":{"min":1,"max":10},"drugCount":{"min":2,"max":2},"dayRange":{"min":3,"max":5}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 소아 감기 단계별 계산 중 오류가 있는 단계를 찾으시오', 'errorSpot',
 '["각 단계 검산 → 21% 감경 여부 확인"]'::jsonb, '{"clinicalGroups":["cold_pediatric"]}'::jsonb, true),

('error-spot', 2, '고혈압+당뇨 단계 오류', ARRAY['C10','D10'],
 '{"age":{"min":50,"max":75},"drugCount":{"min":2,"max":3},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 복합질환 단계 오류 찾기', 'errorSpot',
 NULL, '{"clinicalGroups":["htn_dm_combo"]}'::jsonb, true),

('calc-copay', 2, '산재 진통제', ARRAY['E10'],
 '{"age":{"min":25,"max":55},"drugCount":{"min":1,"max":2},"dayRange":{"min":5,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 산재 통증처방:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["산재 E10 → 본인부담 0원"]'::jsonb, '{"clinicalGroups":["chronic_pain"]}'::jsonb, true),

('calc-total', 2, '자동차보험 F10', ARRAY['F10'],
 '{"age":{"min":25,"max":60},"drugCount":{"min":2,"max":3},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 자보 처방:\n{drugListText}\n\n{questionText}', 'totalPrice',
 '["자보는 전액 본인부담"]'::jsonb, '{"clinicalGroups":["chronic_pain","cold_adult"]}'::jsonb, true),

('calc-copay', 2, 'NSAID 위장 동반', ARRAY['C10'],
 '{"age":{"min":40,"max":75},"drugCount":{"min":2,"max":2},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} NSAID+PPI:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"atc_class":["nsaid","gastromuc"]}'::jsonb, true),

-- ─────────────────────────────────────────────────────────
-- 난이도 3 (어려움) — 추가 30개: 면제·보훈·자보·V252·복합
-- ─────────────────────────────────────────────────────────

('calc-copay', 3, '의료급여 1종 소아 면제', ARRAY['D10'],
 '{"age":{"min":1,"max":17},"drugCount":{"min":1,"max":2},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 의료급여 1종 18세미만:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["CH05 §12.4: D10 + 18세미만 → 0원"]'::jsonb, '{"clinicalGroups":["cold_pediatric","pediatric_uri_abx","cold_adult"]}'::jsonb, true),

('calc-copay', 3, '의료급여 1종 재학생 면제', ARRAY['D10'],
 '{"age":{"min":18,"max":19},"drugCount":{"min":1,"max":2},"dayRange":{"min":3,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 20세미만 재학생 (isStudent 플래그):\n{drugListText}\n\n{questionText}', 'userPrice',
 '["20세 미만 재학생 → 0원"]'::jsonb, '{"clinicalGroups":["cold_adult","antibiotic"]}'::jsonb, true),

('calc-copay', 3, '의료급여 2종 V252 경증', ARRAY['D20'],
 '{"age":{"min":25,"max":65},"drugCount":{"min":1,"max":2},"dayRange":{"min":7,"max":14},"priceRange":{"min":500,"max":2000}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} D20 경증질환 V252:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["max(trunc10(총액1×3%), 500원)"]'::jsonb, '{"clinicalGroups":["gerd_acute","cold_adult"]}'::jsonb, true),

('calc-copay', 3, '의료급여 B014 30% 정률', ARRAY['D10'],
 '{"age":{"min":30,"max":70},"drugCount":{"min":1,"max":2},"dayRange":{"min":14,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} D10+B014 희귀질환:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["B014 2019.01.01~ → 30% 정률"]'::jsonb, '{"clinicalGroups":["chronic_pain","diabetes_t2"]}'::jsonb, true),

('multi-step', 3, '소아 면제 단계별', ARRAY['D10'],
 '{"age":{"min":5,"max":15},"drugCount":{"min":2,"max":2},"dayRange":{"min":5,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} D10 18세미만 단계별:\n{drugListText}', 'multiStep',
 '["단계1~3 정상 계산, 단계4 본인부담=0"]'::jsonb, '{"clinicalGroups":["cold_pediatric"]}'::jsonb, true),

('multi-step', 3, '의료급여 2종 단계별', ARRAY['D20'],
 '{"age":{"min":25,"max":60},"drugCount":{"min":1,"max":2},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} D20 단계별 계산:\n{drugListText}', 'multiStep',
 NULL, '{"clinicalGroups":["hypertension_mono","diabetes_t2"]}'::jsonb, true),

('multi-step', 3, '의료급여 1종 장기 단계별', ARRAY['D10'],
 '{"age":{"min":40,"max":75},"drugCount":{"min":2,"max":3},"dayRange":{"min":28,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} D10 장기 단계별:\n{drugListText}', 'multiStep',
 NULL, '{"clinicalGroups":["hypertension_combo","htn_dm_combo"]}'::jsonb, true),

('multi-step', 3, '자보 F10 단계별', ARRAY['F10'],
 '{"age":{"min":25,"max":60},"drugCount":{"min":2,"max":3},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 자보 단계별:\n{drugListText}', 'multiStep',
 '["자보는 userPrice=총액1, pubPrice=0"]'::jsonb, '{"clinicalGroups":["chronic_pain"]}'::jsonb, true),

('multi-step', 3, '산재 E10 단계별', ARRAY['E10'],
 '{"age":{"min":25,"max":55},"drugCount":{"min":2,"max":3},"dayRange":{"min":5,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 산재 단계별:\n{drugListText}', 'multiStep',
 '["산재는 userPrice=0, 전액 공단"]'::jsonb, '{"clinicalGroups":["chronic_pain","cold_adult"]}'::jsonb, true),

('multi-step', 3, '노인 다약제 단계별', ARRAY['C10'],
 '{"age":{"min":65,"max":85},"drugCount":{"min":3,"max":5},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 노인 다약제 단계별:\n{drugListText}', 'multiStep',
 '["65세 이상 분기 주의"]'::jsonb, '{"clinicalGroups":["elderly_polypharmacy"]}'::jsonb, true),

('multi-step', 3, '고혈압복합 단계별', ARRAY['C10','D10'],
 '{"age":{"min":55,"max":80},"drugCount":{"min":2,"max":4},"dayRange":{"min":60,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 고혈압 복합제 장기:\n{drugListText}', 'multiStep',
 NULL, '{"clinicalGroups":["hypertension_combo"]}'::jsonb, true),

('multi-step', 3, '만성통증+노인', ARRAY['C10','D10'],
 '{"age":{"min":65,"max":85},"drugCount":{"min":2,"max":3},"dayRange":{"min":30,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 노인 만성통증 단계별:\n{drugListText}', 'multiStep',
 NULL, '{"clinicalGroups":["chronic_pain","elderly_polypharmacy"]}'::jsonb, true),

('error-spot', 3, '노인 다약제 오류', ARRAY['C10'],
 '{"age":{"min":65,"max":85},"drugCount":{"min":3,"max":4},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 노인 다약제 단계 오류 찾기', 'errorSpot',
 '["65세 이상 특례 고려"]'::jsonb, '{"clinicalGroups":["elderly_polypharmacy"]}'::jsonb, true),

('error-spot', 3, '의료급여 단계 오류', ARRAY['D10','D20'],
 '{"age":{"min":30,"max":75},"drugCount":{"min":2,"max":3},"dayRange":{"min":14,"max":60}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 의료급여 단계 오류 찾기', 'errorSpot',
 NULL, '{"clinicalGroups":["hypertension_combo","diabetes_t2"]}'::jsonb, true),

('error-spot', 3, '복합보험 단계 오류', ARRAY['C10','D10','G10'],
 '{"age":{"min":40,"max":80},"drugCount":{"min":2,"max":3},"dayRange":{"min":14,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 보험별 본인부담 분기 오류 찾기', 'errorSpot',
 '["보험유형별 본인부담 방식 상이"]'::jsonb, '{"clinicalGroups":["htn_dm_combo"]}'::jsonb, true),

('fill-blank', 3, '6세미만 빈칸 (21%)', ARRAY['C10'],
 '{"age":{"min":1,"max":5},"drugCount":{"min":1,"max":2},"dayRange":{"min":3,"max":7}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 6세미만 감경:\n{drugListText}\n\n약품/조제료/총액1/본인부담 빈칸', 'fillBlank',
 '["6세미만 21%"]'::jsonb, '{"clinicalGroups":["cold_pediatric"]}'::jsonb, true),

('fill-blank', 3, 'D20 V252 빈칸', ARRAY['D20'],
 '{"age":{"min":30,"max":65},"drugCount":{"min":1,"max":2},"dayRange":{"min":7,"max":14},"priceRange":{"min":500,"max":1500}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} D20 V252 빈칸:\n{drugListText}', 'fillBlank',
 NULL, '{"clinicalGroups":["gerd_acute"]}'::jsonb, true),

('calc-copay', 3, '6세미만 다약제 복합', ARRAY['C10'],
 '{"age":{"min":1,"max":5},"drugCount":{"min":3,"max":4},"dayRange":{"min":3,"max":7},"doseChoices":[0.25,0.5,1]}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 소아 다약제 복합:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["6세미만 부담률 21% = 30% × 70%"]'::jsonb, '{"clinicalGroups":["cold_pediatric","pediatric_uri_abx"]}'::jsonb, true),

('calc-copay', 3, '65세 정률 상한 경계', ARRAY['C10'],
 '{"age":{"min":65,"max":80},"drugCount":{"min":2,"max":3},"dayRange":{"min":7,"max":30},"priceRange":{"min":100,"max":500}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 65세 경계값 (10,000 근처):\n{drugListText}\n\n{questionText}', 'userPrice',
 '["총액1 10,000 초과 12,000 이하 → 20% 정률","12,000 초과 → 30% 정률"]'::jsonb, '{"clinicalGroups":["chronic_pain","hypertension_mono"]}'::jsonb, true),

('calc-copay', 3, '고혈압+당뇨+스타틴', ARRAY['C10','D10'],
 '{"age":{"min":55,"max":80},"drugCount":{"min":3,"max":4},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 혈관질환 복합:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"clinicalGroups":["htn_dm_combo","hypertension_combo"]}'::jsonb, true),

('calc-total', 3, '노인 다질환 총액', ARRAY['C10','D10'],
 '{"age":{"min":70,"max":88},"drugCount":{"min":4,"max":5},"dayRange":{"min":60,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 노인 5종 복합:\n{drugListText}\n\n{questionText}', 'totalPrice',
 NULL, '{"clinicalGroups":["elderly_polypharmacy"]}'::jsonb, true),

('calc-copay', 3, '소아 비염 만성', ARRAY['C10'],
 '{"age":{"min":3,"max":12},"drugCount":{"min":2,"max":3},"dayRange":{"min":14,"max":30},"doseChoices":[0.5,1]}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 소아 비염 장기:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"clinicalGroups":["pediatric_ent"]}'::jsonb, true),

('calc-copay', 3, '소아 상기도 항생제 고용량', ARRAY['C10'],
 '{"age":{"min":2,"max":10},"drugCount":{"min":2,"max":3},"dayRange":{"min":5,"max":10},"doseChoices":[1,1.5,2]}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 소아 항생제 고용량:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"clinicalGroups":["pediatric_uri_abx"]}'::jsonb, true),

('calc-copay', 3, '보훈 G10 기본', ARRAY['G10'],
 '{"age":{"min":50,"max":80},"drugCount":{"min":1,"max":2},"dayRange":{"min":7,"max":30}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 보훈 직접 G10:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["보훈 감면율 적용","3자배분"]'::jsonb, '{"clinicalGroups":["cold_adult","hypertension_mono"]}'::jsonb, true),

('calc-copay', 3, '차상위 C31', ARRAY['C31'],
 '{"age":{"min":30,"max":75},"drugCount":{"min":1,"max":2},"dayRange":{"min":7,"max":30}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 차상위 1종:\n{drugListText}\n\n{questionText}', 'userPrice',
 '["차상위 10% + 정액 0"]'::jsonb, '{"clinicalGroups":["hypertension_mono","diabetes_t2"]}'::jsonb, true),

('multi-step', 3, '빌런 약품 복잡', ARRAY['C10','D10'],
 '{"age":{"min":1,"max":85},"drugCount":{"min":3,"max":5},"dayRange":{"min":3,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 복합 케이스 종합:\n{drugListText}\n\n모든 단계값', 'multiStep',
 '["연령/보험/약품 수 다변","각 단계 정확히 계산"]'::jsonb, '{"clinicalGroups":["elderly_polypharmacy","hypertension_combo","htn_dm_combo","cold_pediatric"]}'::jsonb, true),

('calc-drug-amount', 3, '다약제 약품금액', ARRAY['C10'],
 '{"age":{"min":50,"max":85},"drugCount":{"min":4,"max":5},"dayRange":{"min":30,"max":90}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 5종 장기 약품금액:\n{drugListText}\n\n{questionText}', 'drugAmount',
 '["각 약품 개별 사사오입 후 합산"]'::jsonb, '{"clinicalGroups":["elderly_polypharmacy","hypertension_combo"]}'::jsonb, true),

('error-spot', 3, 'V252 경증 오류', ARRAY['D20'],
 '{"age":{"min":25,"max":65},"drugCount":{"min":1,"max":2},"dayRange":{"min":7,"max":14}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} V252 경증 단계 오류 찾기', 'errorSpot',
 '["max(3%, 500) 공식 확인"]'::jsonb, '{"clinicalGroups":["gerd_acute","cold_adult"]}'::jsonb, true),

('calc-copay', 3, '대용량 장기 만성', ARRAY['C10','D10'],
 '{"age":{"min":50,"max":80},"drugCount":{"min":3,"max":4},"dayRange":{"min":60,"max":90},"priceRange":{"min":500,"max":3000}}'::jsonb,
 E'[{difficultyLabel}] {insuName}({insuCode}) {ageDesc} 대용량 장기 만성:\n{drugListText}\n\n{questionText}', 'userPrice',
 NULL, '{"clinicalGroups":["htn_dm_combo","hypertension_combo","elderly_polypharmacy"]}'::jsonb, true);
