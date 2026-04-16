-- ============================================================
-- seed_quiz_ch05_ch08.sql
-- CH05 ~ CH08 정적 문제 (24문항)
--   CH05 보험유형별 본인부담금   (6문)
--   CH06 3자배분 및 공비 로직    (6문)
--   CH07 반올림·절사 규칙        (6문)
--   CH08 특수케이스              (6문)
-- ============================================================

DELETE FROM quiz_question WHERE chapter IN ('CH05','CH06','CH07','CH08');

-- ============================================================
-- CH05 보험유형별 본인부담금
-- ============================================================

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES

('CH05', 1, 'multiple_choice',
 '건강보험(C10) 일반 외래 약국의 본인부담률은?',
 '["10%","20%","30%","50%"]'::jsonb,
 '2',
 'C10 건강보험 일반 외래 약국의 본인부담률은 30%입니다. 본인부담금 = trunc100(총액1 × 0.30).',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','lesson:lesson-07-insurance-types','scenario:S01','본인부담','C10','easy']),

('CH05', 1, 'numeric',
 '총액1 = 16,370원인 건강보험(C10) 환자의 본인부담금은? (원, 정수)',
 NULL,
 '4900',
 '본인부담금 = trunc100(16,370 × 0.30) = trunc100(4,911) = 4,900원. 건보는 100원 미만 절사.',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','scenario:S01','본인부담','계산','easy']),

('CH05', 2, 'multiple_choice',
 '의료급여 1종(D10) 일반 외래 약국에서 적용되는 본인부담 방식은?',
 '["건보와 동일한 30% 정률","정액 본인부담 (기본)","50% 정률","전액 면제"]'::jsonb,
 '1',
 'D10 의료급여 1종은 기본 정액 본인부담(소액)을 적용합니다. 단, sbrdnType(B014 등) 특수 코드가 붙으면 정률로 분기될 수 있습니다.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','scenario:S06','본인부담','D10','medium']),

('CH05', 2, 'multiple_choice',
 '산재보험(E10) 환자의 외래 약국 본인부담금으로 올바른 것은?',
 '["30% 정률","0원 (전액 면제)","50%","정액 1,500원"]'::jsonb,
 '1',
 'E10 산재보험은 요양급여비용 전액을 공단이 부담하므로 환자 본인부담금은 0원입니다. userPrice=0, pubPrice=totalPrice.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','scenario:S09','본인부담','E10','medium']),

('CH05', 3, 'numeric',
 '총액1 = 10,000원인 6세 미만 환자(건강보험). 본인부담률 30% × 70% 감경이 적용될 때 본인부담금은? (원, 정수)',
 NULL,
 '2100',
 '6세 미만 감경: insuRate = 30% × 70% = 21%. 본인부담금 = trunc100(10,000 × 0.21) = trunc100(2,100) = 2,100원.',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','scenario:S05','본인부담','6세미만','hard']),

('CH05', 3, 'multiple_choice',
 '자동차보험(F10) 환자의 외래 약국 본인부담과 공단부담 비율은?',
 '["본인 30% / 공단 70%","본인 50% / 공단 50%","본인 100% / 공단 0% (약국 청구분)","본인 0% / 공단 100%"]'::jsonb,
 '2',
 'F10 자동차보험의 약국 처방은 전액 본인부담이며 공단청구액(pubPrice)은 0입니다. 실제 환자 부담은 추후 보험사로부터 보상받게 됩니다.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','scenario:S10','본인부담','F10','hard']),

-- ============================================================
-- CH06 3자배분 및 공비 로직
-- ============================================================

('CH06', 1, 'multiple_choice',
 '3자배분에서 "3자"가 의미하는 부담 주체로 올바른 것은?',
 '["병원·약국·환자","환자·공단·보훈(국가)","환자·공단·약국","환자·국가·지자체"]'::jsonb,
 '1',
 '3자배분: 환자(userPrice) + 공단(insuPrice) + 보훈 또는 국가(mpvaPrice) = totalPrice. 보훈 환자가 아닐 때는 mpvaPrice=0으로 2자배분과 동일.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','3자배분','구조','easy']),

('CH06', 1, 'true_false',
 '보훈 환자가 아닌 경우 mpvaPrice는 0이며, userPrice + insuPrice = totalPrice 관계가 성립한다. (O/X)',
 '["O","X"]'::jsonb,
 '0',
 'O. 일반 환자는 mpvaPrice=0이므로 totalPrice = userPrice + insuPrice (또는 공비 pubPrice)로 2자배분이 됩니다.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','3자배분','기본관계','easy']),

('CH06', 2, 'multiple_choice',
 '보훈 M10(전액면제) 환자의 3자배분 결과로 올바른 것은?',
 '["userPrice=totalPrice, insuPrice=0","userPrice=0, mpvaPrice=totalPrice","insuPrice=totalPrice, 나머지=0","모두 1/3씩"]'::jsonb,
 '1',
 'M10은 보훈 전액면제 코드로 환자 부담 0원, 보훈이 전액 부담합니다. userPrice=0, mpvaPrice=totalPrice, insuPrice=0.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','scenario:S07','3자배분','M10','medium']),

('CH06', 2, 'multiple_choice',
 '보훈 M60(60% 감면) 환자에서 감면된 금액은 누가 부담하는가?',
 '["환자 본인","공단","보훈(국가)","약국"]'::jsonb,
 '2',
 'M60 환자는 원래 본인부담의 60%를 감면받고 그만큼은 보훈(mpvaPrice)이 부담합니다. 나머지 40%가 실제 환자 부담(userPrice).',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','scenario:S15','3자배분','M60','medium']),

('CH06', 3, 'numeric',
 '총액1 10,000원, M60(60% 감면) 보훈 환자. 원래 본인부담률 30% 적용 시 mpvaPrice(보훈 부담)는? (원, 정수 추정 trunc100 미적용)',
 NULL,
 '1800',
 '원래 본인부담 = 10,000 × 0.30 = 3,000원. M60 감면 60% = 3,000 × 0.60 = 1,800원이 보훈 부담. 실제 환자 부담 = 3,000 - 1,800 = 1,200원 (trunc100 미적용 기준값).',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','scenario:S15','3자배분','M60','hard']),

('CH06', 3, 'true_false',
 '공비(pubPrice)는 공단부담금(insuPrice)과 동일한 의미이며, 계산 결과값도 같다. (O/X)',
 '["O","X"]'::jsonb,
 '1',
 'X. pubPrice = totalPrice - userPrice 로 "공단+보훈" 합산 청구액을 의미할 수 있고, insuPrice는 순수 공단 부담. 보훈 환자가 아니면 같지만, 보훈 환자에서는 pubPrice = insuPrice + mpvaPrice로 달라집니다.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','3자배분','용어','hard']),

-- ============================================================
-- CH07 반올림·절사 규칙
-- ============================================================

('CH07', 1, 'multiple_choice',
 '약품금액 계산 시 약품 단위의 반올림 방식은?',
 '["원 미만 사사오입 (Round1)","10원 미만 절사 (Trunc10)","100원 미만 절사 (Trunc100)","반올림 없음"]'::jsonb,
 '0',
 '약품금액은 각 약품마다 (단가 × 투약량 × 횟수 × 일수) 결과를 원 미만 사사오입(Round1)합니다. Trunc10/100은 이후 단계에 적용.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','반올림','Round1','easy']),

('CH07', 1, 'numeric',
 '12,345원을 10원 미만 절사(Trunc10)하면? (원, 정수)',
 NULL,
 '12340',
 'Trunc10은 10원 미만을 버립니다 (사사오입 아님). 12,345 → 12,340원.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','반올림','Trunc10','easy']),

('CH07', 2, 'multiple_choice',
 '요양급여비용총액1(totalPrice) 산출 시 적용되는 반올림은?',
 '["Round1 (원미만 사사오입)","Round10 (10원미만 사사오입)","Trunc10 (10원미만 절사)","Trunc100 (100원미만 절사)"]'::jsonb,
 '2',
 'totalPrice = trunc10(약품금액합 + 조제료합). 10원 미만을 버림(절사)합니다. 사사오입이 아님에 주의.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','scenario:S01','반올림','Trunc10','medium']),

('CH07', 2, 'multiple_choice',
 '건강보험(C10) 본인부담금 산출 시 적용되는 최종 반올림은?',
 '["Trunc10","Trunc100","Round10","Round100"]'::jsonb,
 '1',
 '건보는 환자 부담 완화를 위해 100원 미만을 절사(trunc100)합니다. 예: 4,911 → 4,900원. 의료급여는 Trunc10을 씁니다.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','lesson:lesson-06-copayment','scenario:S01','반올림','Trunc100','medium']),

('CH07', 3, 'matching',
 '계산 단계별 적용되는 반올림 함수를 매칭하세요.',
 NULL,
 '{"l1":"r1","l2":"r2","l3":"r2","l4":"r3"}',
 '약품금액 = Round1(원미만 사사오입). 조제료 Z코드 산출 = Round1. 총액1 = Trunc10(10원미만 절사). 건보 본인부담 = Trunc100(100원미만 절사).',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','반올림','매칭','hard']),

('CH07', 3, 'numeric',
 '총액1 = 7,850원인 의료급여 1종 D10 환자(정액 1,500원 적용). 본인부담금 Trunc10 적용 시? (원, 정수)',
 NULL,
 '1500',
 '의료급여 정액 본인부담은 고정 1,500원. Trunc10을 적용해도 1,500원 그대로입니다 (이미 10원 단위).',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','scenario:S06','반올림','정액','hard']),

-- ============================================================
-- CH08 특수케이스
-- ============================================================

('CH08', 1, 'multiple_choice',
 '직접조제(isDirectDispensing=true) 시 사용되는 특수 코드는?',
 '["Z2000","Z4200","Z7001","Z5100"]'::jsonb,
 '1',
 '의사가 직접 조제하는 경우 일반 약국 조제 코드 대신 Z4200 계열 직접조제 코드를 사용합니다. 약국관리료·복약지도료는 산정하지 않습니다.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','scenario:S13','특수','직접조제','easy']),

('CH08', 1, 'true_false',
 '달빛어린이약국은 6세 미만 야간/공휴일 조제 시 Z7001 특수 코드를 추가로 산정할 수 있다. (O/X)',
 '["O","X"]'::jsonb,
 '0',
 'O. 달빛어린이약국은 심야·공휴일 소아 조제에 특수 코드 Z7001 + Z2000610(조제기본료 가산)을 별도 산정합니다.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','scenario:S14','특수','달빛','easy']),

('CH08', 2, 'multiple_choice',
 '하드코딩 특수약품 648903860(희귀의약품류)에 대한 규칙으로 올바른 것은?',
 '["제한 없음","투약일수 최대 5일 상한","공단 부담 100%","비급여 처리"]'::jsonb,
 '1',
 '648903860 특수약품은 투약일수 5일 상한 규칙이 적용됩니다. 처방이 5일 초과로 들어와도 엔진이 5일로 절사 후 계산합니다 (Step 0 전처리).',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','특수','648903860','medium']),

('CH08', 2, 'multiple_choice',
 '2024-07-01 고시 변경이 계산 로직에 미친 영향은?',
 '["환산지수 일괄 인상","본인부담률 전면 조정","일부 Z코드 점수/분기 규칙 변경","모든 특례 폐지"]'::jsonb,
 '2',
 '2024-07-01 고시에서는 일부 Z코드 점수 및 특정 조건 분기 규칙이 변경됐습니다. 엔진은 dosDate 기준으로 해당 날짜 이전/이후를 분기합니다.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','특수','날짜분기','medium']),

('CH08', 3, 'multiple_choice',
 '본인부담상한제가 약제비 계산에 미치는 영향은?',
 '["본인부담금이 연간 상한 초과 시 초과분 환급","본인부담률 인상","조제료 면제","공단 부담금 감소"]'::jsonb,
 '0',
 '본인부담상한제: 연간 누적 본인부담이 소득분위별 상한을 초과하면 초과분을 공단이 환급합니다. 엔진에서 yearlyAccumulated 정보가 제공되면 Step 6 후처리가 이를 반영합니다.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','특수','상한제','hard']),

('CH08', 3, 'true_false',
 '명절가산은 설·추석 당일에만 적용되며, 명절 전후 3일간은 일반 야간/토요 가산 규칙이 적용된다. (O/X)',
 '["O","X"]'::jsonb,
 '1',
 'X. 명절가산은 설·추석 당일뿐 아니라 고시된 명절기간 전후 일부 일자에도 적용됩니다. holiday 테이블에 명시된 명절기간 규정에 따라 판단합니다.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','특수','명절','hard']);

-- matching 문제의 payload 추가
UPDATE quiz_question
SET payload = '{"left":[{"id":"l1","label":"약품금액 (각 약품)"},{"id":"l2","label":"조제료 Z코드 금액"},{"id":"l3","label":"요양급여비용총액1"},{"id":"l4","label":"건강보험 본인부담금"}],"right":[{"id":"r1","label":"Round1 (원미만 사사오입)"},{"id":"r2","label":"Trunc10 (10원미만 절사)"},{"id":"r3","label":"Trunc100 (100원미만 절사)"}]}'::jsonb
WHERE chapter = 'CH07' AND question_type = 'matching' AND question LIKE '%계산 단계별%';
