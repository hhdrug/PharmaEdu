-- ============================================================
-- seed_quiz_ch11.sql — CH11 테스트 시나리오 기반 퀴즈 15문제
-- 난이도: easy×3, medium×8, hard×4
-- 유형: multiple_choice×10, numeric×4, true_false×1
-- 시나리오 커버: S01~S10 전체
-- ============================================================

-- ── [CH11-01] easy / multiple_choice — S01 약품금액 공식 ──────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 1, 'multiple_choice',
 '약품금액 사사오입 공식으로 올바른 것은? (C# 기준)',
 '["(int)(소모량 * 단가)", "Math.Round(소모량 * 단가, 0)", "(int)(소모량 * 단가 + 0.5)", "Math.Ceiling(소모량 * 단가)"]'::jsonb,
 '2',
 '약품금액은 「(int)(소모량 × 단가 + 0.5)」 공식으로 계산합니다. C#의 (int) 캐스트는 소수부를 절사(truncation)하므로, +0.5를 더한 뒤 절사하면 사사오입(반올림) 효과가 납니다. Math.Round의 기본값은 은행가 반올림(MidpointRounding.ToEven)이라 다를 수 있습니다.',
 ARRAY['S01', '약품금액', '사사오입', 'CH11']);

-- ── [CH11-02] easy / multiple_choice — S01 조제료 Z코드 선택 ─────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 1, 'multiple_choice',
 'S01 시나리오(내복약 7일 처방, 평일 주간)에서 내복약조제료에 해당하는 Z코드는?',
 '["Z4103", "Z4107", "Z4107010", "Z4120"]'::jsonb,
 '1',
 'Z4107은 내복약조제료(7일) 일반 코드입니다. Z4103은 3일, Z4107010은 7일+야간, Z4120은 외용약조제료입니다. 7일 평일 주간 처방에는 Z4107(4,320원)을 사용합니다.',
 ARRAY['S01', 'Z코드', '내복약조제료', 'Z4107', 'CH11']);

-- ── [CH11-03] easy / true_false — S04 U항·W항 총액1 포함 여부 ───────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 1, 'true_false',
 '비급여(W항) 약품금액과 100% 본인부담(U항) 약품금액은 요양급여비용총액1에 포함된다.',
 '["참", "거짓"]'::jsonb,
 '1',
 '거짓입니다. 요양급여비용총액1은 급여 약품금액(01항)과 급여 조제료(02항)의 합계에만 적용됩니다. U항(100% 본인부담)은 100/100본인부담금총액으로, W항(비급여)은 별도 비급여 합계로 관리됩니다. 총액2 = 총액1 + 100/100본인부담금총액(U항)이며, W항은 총액2에도 포함되지 않습니다.',
 ARRAY['S04', '항번호', '총액1', 'U항', 'W항', 'CH11']);

-- ── [CH11-04] medium / numeric — S01 총액1 계산 ──────────────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 2, 'numeric',
 'S01 기준: 건강보험 C10, 40세, 약품금액 10,500원, 조제료 합계 8,660원일 때 요양급여비용총액1(원)은?',
 NULL,
 '19160',
 '요양급여비용총액1 = trunc10(01항 + 02항) = trunc10(10,500 + 8,660) = trunc10(19,160) = 19,160원. 19,160은 이미 10원 단위이므로 절사 효과 없음.',
 ARRAY['S01', '총액1', 'trunc10', 'CH11']);

-- ── [CH11-05] medium / multiple_choice — S01 본인부담금 계산 ────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 2, 'multiple_choice',
 'S01 기준: 요양급여비용총액1이 19,160원, 건강보험 C10(Rate=30%)일 때 본인일부부담금으로 올바른 것은?',
 '["5,748원", "5,700원", "5,800원", "5,760원"]'::jsonb,
 '1',
 '본인부담금 = trunc100(19,160 × 0.30) = trunc100(5,748) = 5,700원. 건강보험 본인부담금은 100원 미만을 절사(trunc100)합니다. 5,748원에서 100원 미만(48원)을 버리면 5,700원이 됩니다.',
 ARRAY['S01', '본인부담금', 'trunc100', 'CH11']);

-- ── [CH11-06] medium / multiple_choice — S02 사사오입 경계값 ─────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 2, 'multiple_choice',
 'S02 시나리오에서 단가 10원, 1회투약량 0.5정, 1일 2회, 3일 처방 시 약품금액은?',
 '["25원", "30원", "31원", "35원"]'::jsonb,
 '1',
 '소모량 = 0.5 × 2 × 3 = 3.0, 약품금액 = (int)(3.0 × 10 + 0.5) = (int)(30.5) = 30원. C#의 (int) 캐스트는 소수부를 절사하므로 30.5 → 30이 됩니다. 사사오입이더라도 정수 경계에서는 원래 값과 동일합니다.',
 ARRAY['S02', '사사오입', '0.5정', '경계값', 'CH11']);

-- ── [CH11-07] medium / multiple_choice — S03 6세미만+야간 Z코드 ──────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 2, 'multiple_choice',
 'S03 시나리오(3세 + 야간)에서 기본조제료에 사용해야 할 Z코드와 단가로 올바른 것은?',
 '["Z2000(1,720원) + Z2000010(야간 가산)", "Z2000600(6세미만, 2,420원)", "Z2000610(6세미만+야간, 3,150원)", "Z2000(1,720원) 단독"]'::jsonb,
 '2',
 '6세미만 + 야간이 동시에 해당하면 기본조제료는 복합코드 Z2000610(3,150원)을 사용합니다. 복약지도료는 야간 코드 Z3000010(1,500원), 내복약조제료도 야간 코드 Z4107010(5,620원)을 사용합니다. 소아 가산이 6세미만 코드에 이미 포함되어 있으므로 별도 중복 적용하지 않습니다.',
 ARRAY['S03', '6세미만', '야간', 'Z2000610', 'CH11']);

-- ── [CH11-08] medium / multiple_choice — S03 6세미만 본인부담률 ──────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 2, 'multiple_choice',
 'S03 시나리오에서 약국 6세미만 본인부담률(법령 기준)은? (건강보험 C10, 성인 부담률 30%)',
 '["30%", "21%", "15%", "10%"]'::jsonb,
 '1',
 '약국 6세미만 본인부담률(법령 기준) = 성인 부담률 × 70% = 30% × 70% = 21%입니다. EDB Mock의 SixAgeRate=50(50% 경감)을 적용하면 30% × 50% = 15%가 되나, 이는 의료기관 공통 설정값으로 약국 법령 기준(21%)과 다릅니다. 테스트 시 법령 기준 21%가 권장값입니다.',
 ARRAY['S03', '6세미만', '본인부담률', '21%', '법령', 'CH11']);

-- ── [CH11-09] medium / multiple_choice — S03 조제료 합계 확인 ──────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 2, 'multiple_choice',
 'S03 시나리오(3세, 야간, 내복약 7일)에서 조제료 합계 금액은?',
 '["8,660원", "10,660원", "11,740원", "12,500원"]'::jsonb,
 '2',
 'Z1000(790) + Z2000610(3,150) + Z3000010(1,500) + Z4107010(5,620) + Z5000(680) = 11,740원. 6세미만+야간 복합 시 기본조제료는 Z2000610(3,150원), 복약지도료는 야간 Z3000010(1,500원), 내복약조제료는 야간 Z4107010(5,620원)이 적용됩니다.',
 ARRAY['S03', '6세미만', '야간', '조제료합계', 'CH11']);

-- ── [CH11-10] medium / multiple_choice — S05 65세 정액 분기 조건 ──────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 2, 'multiple_choice',
 'S05 시나리오(70세, 총액1=7,320원)에서 본인부담 계산 방식은?',
 '["정률 30% 적용 (trunc100(7,320 × 0.30))", "정액 1,500원 (EDB FixCost)", "정액 1,000원 (법령 기준)", "정률 20% 적용 (10,000원 초과 12,000원 이하 구간)"]'::jsonb,
 '1',
 '65세 이상이고 총액1(7,320원) ≤ 10,000원이면 정액 본인부담이 적용됩니다. EDB Mock 기준 FixCost=1,500원이 사용됩니다(법령 기준은 1,000원이지만 EDB Mock 기준으로 1,500원). 정률 30%가 아닌 정액 분기로 진입해야 합니다.',
 ARRAY['S05', '65세이상', '정액', 'FixCost', 'CH11']);

-- ── [CH11-11] medium / numeric — S06 의료급여 1종 청구액 ─────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 2, 'numeric',
 'S06 기준: D10 의료급여 1종(sbrdnType="M"), 총액1=19,160원, Mcode=1,000원일 때 청구액(원)은?',
 NULL,
 '18160',
 '의료급여 1종 + sbrdnType="M" → 본인부담금 = Mcode 정액 1,000원. 청구액 = 총액1 - 본인부담금 = 19,160 - 1,000 = 18,160원. 항등식: 19,160 = 1,000 + 18,160 ✓. Rate=0%이지만 Mcode 정액이 존재하므로 본인부담 > 0원임에 주의합니다.',
 ARRAY['S06', '의료급여1종', 'D10', 'Mcode', '청구액', 'CH11']);

-- ── [CH11-12] hard / numeric — S07 보훈 청구액 계산 ─────────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 3, 'numeric',
 'S07 기준: G10 보훈(감면율 60%), 보훈감면 후 조제료=5,000원, 약품금액=10,500원일 때 건보 공단 청구액(원)은? (총액1→보훈청구→본인부담→청구 순으로 계산)',
 NULL,
 '4400',
 '① 총액1 = trunc10(10,500 + 5,000) = 15,500원 ② 보훈청구액 = 15,500 × 60% = 9,300원 ③ 본인부담기준액 = 15,500 - 9,300 = 6,200원 ④ 본인부담금 = trunc100(6,200 × 30%) = trunc100(1,860) = 1,800원 ⑤ 건보청구액 = 15,500 - 9,300 - 1,800 = 4,400원. 항등식: 15,500 = 9,300 + 1,800 + 4,400 ✓',
 ARRAY['S07', '보훈', '60%감면', '청구액', '3자배분', 'CH11']);

-- ── [CH11-13] hard / multiple_choice — S08 가루약 가산 규칙 ─────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 3, 'multiple_choice',
 'S08 시나리오(산제=Y, 2026-04-03)에서 가루약 가산의 처리 방법으로 올바른 것은?',
 '["Z4107을 Z4107산제 코드로 교체한다", "Z4010(800원)을 별도 행으로 추가하고, 내복약조제료는 일반 코드(Z4107) 유지", "야간 코드를 먼저 적용하고 추가로 Z4010을 더한다", "조제료 합계에 800원을 단순 더한다(별도 행 없음)"]'::jsonb,
 '1',
 '2023.11.01 이후 가루약 가산은 Z4010(800원)을 별도 행으로 추가하며, 내복약조제료는 일반 코드(Z4107)를 그대로 유지합니다. 가루약 가산은 1순위로, 야간/공휴/토요/소아 등 모든 다른 가산을 배제합니다. 단순 합산이 아닌 독립된 행으로 계상해야 합니다.',
 ARRAY['S08', '가루약가산', 'Z4010', '2023.11.01', '별도행', 'CH11']);

-- ── [CH11-14] hard / multiple_choice — S09 토요가산 vs 야간가산 차이 ──────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 3, 'multiple_choice',
 'S09 토요가산과 S03 야간가산의 Z코드 적용 방식 차이로 올바른 것은?',
 '["토요가산은 기본 코드를 030 코드로 교체하고, 야간가산은 기본 코드와 별도 행으로 분리한다", "야간가산은 기본 코드를 010 코드로 교체하고, 토요가산은 기본 코드와 별도 행(030)으로 분리한다", "둘 다 기본 코드를 가산 코드로 교체하는 방식이다", "둘 다 기본 코드와 가산 코드를 별도 행으로 분리하는 방식이다"]'::jsonb,
 '1',
 '야간가산은 기본 Z코드를 야간 코드(접미사 010)로 교체합니다(예: Z2000 → Z2000010). 반면 토요가산은 기본 코드 행(Z2000)을 유지하면서 토요가산 코드(Z2000030)를 별도 행으로 추가합니다. 이 차이로 인해 토요일에는 2개 행이 생성되고, 약국관리료(Z1000)와 의약품관리료(Z5000)에는 토요가산이 없습니다.',
 ARRAY['S09', '토요가산', '야간가산', 'Z코드교체', '별도행', 'CH11']);

-- ── [CH11-15] hard / numeric — S10 복합케이스 총액2 계산 ─────────────────

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES
('CH11', 3, 'numeric',
 'S10 빌런 처방(3세, 가루약, 야간, 혼합보험): 01항=10,500원, 02항=9,460원, U항=2,800원, W항=4,200원일 때 요양급여비용총액2(원)는?',
 NULL,
 '22760',
 '총액1 = trunc10(10,500 + 9,460) = trunc10(19,960) = 19,960원. 100/100본인부담금총액 = trunc10(U항) = trunc10(2,800) = 2,800원. 총액2 = trunc10(19,960 + 2,800) = 22,760원. W항(비급여 4,200원)은 총액1·총액2 어디에도 포함되지 않습니다. 환자 실부담 = 4,100(본인부담) + 2,800(U항) + 4,200(W항) = 11,100원.',
 ARRAY['S10', '복합케이스', '총액2', '혼합보험', 'U항', 'CH11']);
