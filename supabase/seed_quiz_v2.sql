-- ============================================================
-- seed_quiz_v2.sql — 추가 문제 15개 (기존 seed_quiz.sql 25문제에 추가)
-- 실행 순서: 20260406000003_quiz_improvements.sql 먼저 실행 후 이 파일 실행
-- ============================================================
-- CH06: 3자배분/보훈/공비 × 6문제  (easy×2, medium×2, hard×2)
-- CH08: 특수케이스            × 6문제  (easy×2, medium×3, hard×1)
-- CH02: Z코드 접미사          × 2문제  (easy×1, medium×1)
-- CH04: 가산 우선순위         × 1문제  (medium×1)
-- 합계: easy=5, medium=7, hard=3 → 총 40문제(기존25+신규15)
-- ============================================================

-- ── CH06: 3자배분 / 보훈 / 공비 ──────────────────────────────

-- [CH06-1] easy: 3자배분 항등식
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH06', 1, 'multiple_choice',
 '약제비(요양급여비용총액1)의 3자배분 항등식으로 올바른 것은?',
 '["총액 = 환자부담금 + 공단청구액", "총액 = 환자부담금 + 보훈청구액", "총액 = 환자부담금 + 공단청구액 + 보훈청구액", "총액 = 공단청구액 + 보훈청구액"]'::jsonb,
 '2',
 '3자배분 항등식: 요양급여비용총액1 = UserPrice(환자) + InsuPrice(공단) + MpvaPrice(보훈). 보훈 환자가 아닌 경우 MpvaPrice=0이므로 총액 = 환자 + 공단이 됩니다.',
 ARRAY['3자배분', '항등식', 'CH06']);

-- [CH06-2] easy: M10 보훈국비100% 본인부담금
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH06', 1, 'multiple_choice',
 '보훈 M10(국비 100% 감면) 환자가 약국에서 납부하는 본인부담금은?',
 '["총액의 30%", "총액의 10%", "정액 1,000원", "0원"]'::jsonb,
 '3',
 'M10은 보훈 국비 100% 감면으로, 환자의 보훈청구액 = 총약제비 전액이 됩니다. 따라서 환자 본인부담금은 0원입니다. 100% 미만 약품(A/B/D/E)도 전부 보훈으로 전환됩니다.',
 ARRAY['보훈', 'M10', '국비100%', '본인부담금', 'CH06']);

-- [CH06-3] medium: 보훈 감면율별 3자배분 계산
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH06', 2, 'multiple_choice',
 '총약제비 20,000원, 보훈 M50(50% 감면), 건강보험 본인부담율 30%일 때 보훈청구액은? (trunc10 적용)',
 '["6,000원", "10,000원", "10,010원", "14,000원"]'::jsonb,
 '1',
 '보훈청구액 = trunc10(총액 × 감면율) = trunc10(20,000 × 50%) = trunc10(10,000) = 10,000원. M50 감면율은 50%입니다. 이후 본인부담기준액 = 20,000 - 10,000 = 10,000원, 본인부담 = trunc100(10,000 × 30%) = 3,000원, 공단청구 = 7,000원.',
 ARRAY['보훈', 'M50', '3자배분', '감면율', 'CH06']);

-- [CH06-4] medium: 공비(PubPrice) 적용 대상
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH06', 2, 'multiple_choice',
 '공비(PubPrice)가 환자부담금 전액으로 설정되는 경우가 아닌 것은?',
 '["희귀질환 환자 (본인부담율 비전액)", "G타입(긴급복지) 환자", "건강보험 C10 일반 환자", "건강보험 C타입 + 특수공비(N/102 제외)"]'::jsonb,
 '2',
 '공비(PubPrice)는 환자가 직접 부담해야 할 금액을 제3기관이 대신 납부하는 금액입니다. 건강보험 C10 일반 환자는 특별한 조건 없이는 공비 적용 대상이 아닙니다. 희귀질환, 긴급복지(G타입), 차상위 특수공비 등이 해당됩니다.',
 ARRAY['공비', 'PubPrice', '희귀질환', '긴급복지', 'CH06']);

-- [CH06-5] hard: 보훈 M30 3자배분 수치 계산
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH06', 3, 'numeric',
 '총약제비 20,000원, 보훈 M30(30% 감면), 본인부담율 30%. 공단청구액(InsuPrice)은 얼마인가? (보훈청구액=trunc10, 본인부담=trunc100)',
 NULL,
 '9800',
 '① 보훈청구액 = trunc10(20,000 × 30%) = trunc10(6,000) = 6,000원 ② 본인부담기준액 = 20,000 - 6,000 = 14,000원 ③ 본인부담금 = trunc100(14,000 × 30%) = trunc100(4,200) = 4,200원 ④ 공단청구액 = 20,000 - 6,000 - 4,200 = 9,800원',
 ARRAY['보훈', 'M30', '3자배분', '공단청구액', 'CH06']);

-- [CH06-6] hard: 특수공비 302 C타입
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH06', 3, 'multiple_choice',
 '건강보험(C타입) 특수공비 "302"가 설정되고 비급여미적용(NPay=N)인 경우 처리 방식으로 옳은 것은?',
 '["SumUser 전액을 Pub100Price로 전환", "100%약품(SumInsuDrug_100)을 Pub100Price로 전환하고 SumUser에서 차감", "SumUser를 InsuPrice에 추가", "처리 없음(pass)"]'::jsonb,
 '1',
 '특수공비 302 + C타입 + NPay=N: Pub100Price = SumInsuDrug_100(100%약품 금액), SumUser -= SumInsuDrug_100. NPay=Y이면 Pub100Price = SumUser 전액, SumUser = 0. "102"는 미처리(pass)입니다.',
 ARRAY['특수공비', '302', 'C타입', 'Pub100Price', 'CH06']);

-- ── CH08: 특수케이스 ──────────────────────────────────────────

-- [CH08-1] easy: 명절가산 ZE100 적용 시기
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH08', 1, 'multiple_choice',
 '명절가산 ZE100(추석조제지원금)은 어느 해 추석에 처음 사용된 수가코드인가?',
 '["2022년", "2023년", "2024년", "2025년"]'::jsonb,
 '2',
 'ZE100은 2024년 추석(2024.09.14~09.18)에 적용된 추석조제지원금 코드입니다. 2025년부터는 ZE101(연휴 당일 외)/ZE102(추석 당일)로 세분화되었습니다.',
 ARRAY['명절가산', 'ZE100', '추석', 'CH08']);

-- [CH08-2] easy: 본인부담상한제 개요
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH08', 1, 'true_false',
 '본인부담상한제는 환자의 연간 본인부담금 누적액이 상한액을 초과하면 초과분을 보험사가 부담하는 제도이다.',
 '["참", "거짓"]'::jsonb,
 '1',
 '거짓입니다. 본인부담상한제에서 초과분을 부담하는 주체는 보험사가 아니라 건강보험공단입니다. 옵션 M_OverUserPriceYN="Y"일 때 발동되며, 초과분(PbOverUserPrice)이 환자부담에서 공단부담으로 전환됩니다.',
 ARRAY['본인부담상한제', 'OverUserPrice', '공단', 'CH08']);

-- [CH08-3] medium: 특수약품 648903860 투약일수 제한
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH08', 2, 'multiple_choice',
 '코로나19 치료제 648903860의 처방 투약일수가 7일로 기재되어 있을 때, 약제비 산정 시 실제 적용되는 투약일수는?',
 '["7일 (처방 그대로)", "5일 (상한 적용)", "3일 (절반 적용)", "1일 (최솟값)"]'::jsonb,
 '1',
 '648903860은 급여 투약일수 상한이 5일로 하드코딩되어 있습니다. 조건: 급여(PD_INSUPAY=1) 약품 존재 시 투약일수 = min(처방투약일수, 5). 따라서 7일 처방도 5일로 제한됩니다.',
 ARRAY['648903860', '코로나치료제', '투약일수', '5일상한', 'CH08']);

-- [CH08-4] medium: 특수약품 648903860 5% 가산 시작일
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH08', 2, 'multiple_choice',
 '약품코드 648903860에 대한 5% 본인부담 가산이 시작된 날짜는?',
 '["2023.01.01", "2024.01.01", "2024.10.25", "2025.01.01"]'::jsonb,
 '2',
 '648903860 약품의 5% 가산은 2024년 10월 25일(조제일자 >= 20241025)부터 적용됩니다. 이전에는 일반 요율로 계산합니다. 보훈 M10, M83, M82는 가산에서 제외됩니다.',
 ARRAY['648903860', '5%가산', '2024-10-25', 'CH08']);

-- [CH08-5] medium: 명절가산 당일 총 금액
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH08', 2, 'numeric',
 '2025년 추석 당일(2025.10.06) 조제 시 적용되는 명절가산 총액(원)은? ZE101 + ZE102 합산.',
 NULL,
 '3000',
 '2025년 추석 당일에는 ZE101(연휴 기본 1,000원) + ZE102(당일 추가 2,000원) = 총 3,000원이 적용됩니다. 당일 가산 구조: m_TDay_Price = 3,000원, m_wageAllPrice에는 2,000원만 추가(기본 1,000원은 이미 누적).',
 ARRAY['명절가산', 'ZE101', 'ZE102', '추석당일', '3000원', 'CH08']);

-- [CH08-6] hard: 보훈병원 하드코딩 요양기관기호
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH08', 3, 'multiple_choice',
 '소스코드에 하드코딩된 보훈병원 목록의 요양기관기호 수는 총 몇 개인가?',
 '["3개", "4개", "5개", "6개"]'::jsonb,
 '3',
 '보훈병원 하드코딩 목록은 총 6개입니다: 11100231, 21100292, 37100220, 36100137, 34100237, 31210961. 해당 기관 처방전 + 보훈코드 존재 시 M_isBohunHospigtal=true로 설정됩니다. (필드명에 오타 Hospigtal이 있으나 원본 호환을 위해 유지)',
 ARRAY['보훈병원', '하드코딩', '요양기관기호', 'CH08']);

-- ── CH02: Z코드 접미사 ───────────────────────────────────────

-- [CH02-1] easy: 접미사 구조
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH02', 1, 'multiple_choice',
 'Z코드 최종 청구코드 "Z4107610"에서 접미사 "610"의 의미는?',
 '["6세미만 + 야간", "공휴일 + 야간", "토요 + 차등수가해당", "6세미만 + 토요"]'::jsonb,
 '0',
 '접미사 3자리 구조: text(연령/의미I) + text2(시간/의미II) + text3(차등). "610" = text="6"(6세미만) + text2="1"(야간) + text3="0"(차등수가 해당). Z4107는 7일분 내복조제료 기본코드입니다.',
 ARRAY['Z코드', '접미사', '6세미만', '야간', 'CH02']);

-- [CH02-2] medium: 접미사 생성 규칙
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH02', 2, 'multiple_choice',
 '토요일 오전 10시에 6세 미만 아동이 내복약 5일분 조제를 받았다. 내복조제료(Z4105) 최종 청구코드는? (차등수가 해당, 가루약 없음)',
 '["Z4105030", "Z4105630", "Z4105010", "Z4105610"]'::jsonb,
 '1',
 '토요일 09~13시는 토요 가산(text2="3"). 6세 미만은 소아 가산(text="6"). 차등수가 해당(text3="0"). 접미사 = "6"+"3"+"0" = "630". 최종코드: Z4105630. 소아가산은 토요가산과 중복 적용 가능합니다.',
 ARRAY['Z코드', 'Z4105', '토요가산', '소아가산', '접미사', 'CH02']);

-- ── CH04: 가산 우선순위 ──────────────────────────────────────

-- [CH04-1] medium: 가산 우선순위 배타적 체인
INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH04', 2, 'multiple_choice',
 '가루약 가산이 적용될 때 동시에 적용이 불가능한 가산을 모두 고른 것은?',
 '["야간·공휴·토요 (시간 관련 가산만)", "소아 가산만", "야간·공휴·소아심야·토요·소아 가산 전부", "어떤 가산도 제한 없음"]'::jsonb,
 '2',
 '가루약 가산은 1순위로, 적용 시 야간/공휴/소아심야/토요/소아 가산 전부를 배제합니다. 유팜 소스: 가루약 블록과 else 블록이 완전 분리되어 소아 가산도 진입 불가. (단, 소아+가루약 동시 해당 시 소아 가산 미적용은 Check소아가산_조제료()에서 명시적으로 처리)',
 ARRAY['가산우선순위', '가루약가산', '배타적체인', 'CH04']);
