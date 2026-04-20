-- ============================================================
-- seed_quiz_ch05_ch08_expansion.sql
-- CH05~CH08 개념 문제 확장 (각 15문, 총 60문)
-- ============================================================

DELETE FROM quiz_question WHERE chapter IN ('CH05','CH06','CH07','CH08') AND 'expansion' = ANY(tags);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES

-- ============================================================
-- CH05 본인부담금 — 추가 15문
-- ============================================================

('CH05', 1, 'multiple_choice', '요양급여비용총액1 계산 공식은?',
 '["01항 + 02항 (반올림 없음)","trunc10(01항 + 02항)","trunc100(01항 + 02항)","round(01항 + 02항)"]'::jsonb, '1',
 '총액1 = trunc10(약품금액 01항 + 조제료 02항). U/W항 제외. CH05 §2.',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','expansion','총액1','easy']),

('CH05', 1, 'multiple_choice', 'C31(차상위 1종) 환자의 본인부담률은?',
 '["30%","10%","14%","0%"]'::jsonb, '1',
 'C31 차상위 1종 = 10% 정률. C32 차상위 2종도 10%. 일반 건보보다 낮은 부담. CH05 §3.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','차상위','medium']),

('CH05', 1, 'multiple_choice', 'C90 코드의 의미는?',
 '["건강보험 기타","전액 본인부담 (비보험 등)","의료급여","보훈"]'::jsonb, '1',
 'C90 = 전액 본인부담(비보험, 미용 시술 등 급여 적용 안되는 경우). 요율 100%. CH05 §3.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','C90','medium']),

('CH05', 2, 'multiple_choice', '65세 이상 환자의 본인부담 결정 분기는?',
 '["총액1 ≤ 10,000원 → FixCost 정액","총액1 ≤ 10,000원 → 20% 정률","10,000 < 총액1 ≤ 12,000 → 20% 정률","12,000 초과 → 30% 정률 (일반과 동일)"]'::jsonb, '0',
 '65세 이상 C10: (1) 총액1 ≤ 10,000 → FixCost 정액 (2) 10,000~12,000 → 20% 정률 (3) 12,000 초과 → 30% 일반. CH05 §3.',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','expansion','65세','3단계','medium']),

('CH05', 2, 'numeric', '65세 환자, 총액1 11,500원. 본인부담금은? (20% 정률 적용)',
 NULL, '2300',
 'trunc100(11,500 × 0.20) = trunc100(2,300) = 2,300원. 10,000~12,000 구간 20%. CH05 §3.',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','expansion','65세','20%','medium']),

('CH05', 2, 'numeric', '65세 환자, 총액1 9,000원, FixCost 1,500원. 본인부담금은?',
 NULL, '1500',
 '총액1 ≤ 10,000 → FixCost 정액 1,500원 (EDB Mock). 법령 기준은 1,000원. CH05 §3.',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','expansion','FixCost','medium']),

('CH05', 2, 'multiple_choice', 'sbrdnType "B014" 의 의미는?',
 '["의료급여 1종 정액 Mcode","의료급여 희귀질환 30% 정률","전액 면제","산재 B001"]'::jsonb, '1',
 'B014 = 의료급여 희귀·난치질환 30% 정률 (2019.01.01~). 10원 절사 적용. CH05 §4.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','B014','medium']),

('CH05', 2, 'multiple_choice', 'sbrdnType "B030" 은 무엇을 면제해주는가?',
 '["65세 저액 정액","잠복결핵 치료 관련 외래 본인부담","행려 D80","6세미만 소아"]'::jsonb, '1',
 'B030 = 잠복결핵 치료 관련 외래진료(1·2종) 전액면제 (2022.03.22~). CH05 §4.3 (2026-04 정정).',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','B030','medium']),

('CH05', 3, 'multiple_choice', '의료급여 1종 면제 8종 (CH05 §12.4) 에 포함되지 않는 것은?',
 '["가정간호 대상자","선택의료급여기관 이용자","결핵·희귀난치·중증질환","65세 이상"]'::jsonb, '3',
 '8종: 18세미만, 20세미만재학생, 임산부, 가정간호, 선택기관, 행려/노숙인, 결핵·희귀·중증질환, 등록장애인. 65세 이상은 건보 특례. CH05 §12.4.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','면제8종','hard']),

('CH05', 2, 'true_false', '공상(공무상 재해) 은 C21 코드와 동일한 의미이다. (O/X)',
 '["O","X"]'::jsonb, '1',
 'X. CH05 §3.6 정정: C21 은 "지역가입자 세대주" 건강보험 코드. 공상은 별도 플래그 isTreatmentDisaster. 과거 C21=공상 매핑은 오인이었음.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','공상','C21','medium']),

('CH05', 2, 'numeric', 'D10 1종 sbrdnType=M, 총액1 20,000원 (Mcode 1,000원 Mock 기준). 본인부담금?',
 NULL, '1000',
 'D10 1종 Mcode 정액 = 1,000원 (EDB Mock). 법령 500원. 총액1 무관 정액. CH05 §4.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','D10','Mcode','easy']),

('CH05', 2, 'multiple_choice', 'F10 자동차보험 환자의 공단청구액(insuPrice)은?',
 '["총액1의 70%","0원 (공단 청구 없음)","총액1 전액","addRat × totalPrice"]'::jsonb, '1',
 '자보 F10: userPrice=trunc10(totalPrice) 전액본인, insuPrice=0 공단청구 없음, pubPrice=0. 할증 premium 별도. CH05 §6.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','F10','medium']),

('CH05', 3, 'numeric', '자보 F10, totalPrice 15,000원, addRat 20%. userPrice + premium 합은? (원)',
 NULL, '18000',
 'userPrice = trunc10(15,000) = 15,000. premium = floor(15,000 × 20/100) = 3,000. 합 = 18,000원. CH05 §6 + CH04 §4-9.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','자보','할증','hard']),

('CH05', 3, 'error_spot', '건강보험 40세 처방 계산 단계 오류: (1)01항 10,500 (2)02항 8,660 (3)총액1 19,160 (4)본인부담 5,750 (5)청구액 13,410',
 NULL, 'step4',
 '건보 C10 30% 적용 후 trunc100: trunc100(19,160 × 0.30) = trunc100(5,748) = 5,700원. 5,750 아님. 5,700이 맞으며 청구=13,460. CH05 §3.1.',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','expansion','trunc100','hard']),

('CH05', 2, 'true_false', '산재(E10/E20) 환자는 본인부담금이 0원이며 전액 공단(근로복지)이 부담한다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 산재 E10(요양급여)/E20(후유증) 모두 userPrice=0, 전액 pubPrice=totalPrice. CH05 §7.',
 ARRAY['chapter:CH05','lesson:lesson-07-insurance-types','expansion','산재','easy']),

-- ============================================================
-- CH06 3자배분 — 추가 15문
-- ============================================================

('CH06', 1, 'multiple_choice', 'mpvaPrice 필드가 나타내는 것은?',
 '["환자 본인부담","공단 청구액","보훈청(보훈국비) 청구액","약국 공비"]'::jsonb, '2',
 'mpvaPrice = 보훈청(보훈국비) 청구액. 보훈 환자에만 > 0. 일반 환자는 0. CH06 §2.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','mpvaPrice','easy']),

('CH06', 1, 'multiple_choice', '3자배분이 발생하는 환자 유형은?',
 '["일반 건강보험 (C10)","의료급여 1종","보훈 (G10/G20, M10~M90)","산재 (E10)"]'::jsonb, '2',
 '보훈(G계열) 또는 건보+M코드(C10+M10 등) 환자에서만 3자배분 (환자/공단/보훈청). 일반은 2자배분. CH06 §1.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','3자배분','easy']),

('CH06', 2, 'multiple_choice', 'M10(전액면제) 환자의 3자배분 결과는?',
 '["userPrice=0, mpvaPrice=totalPrice","userPrice=totalPrice, mpvaPrice=0","userPrice=30%, insuPrice=70%","모두 1/3씩"]'::jsonb, '0',
 'M10 전액면제: userPrice=0, mpvaPrice=totalPrice (건보 환자의 본인부담 전액을 보훈청이 대신 부담). pubPrice=0 또는 insuPrice가 다른 보험 청구. CH06 §3.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','M10','medium']),

('CH06', 2, 'multiple_choice', 'M60(60% 감면) 환자의 본인부담 계산 순서는?',
 '["30% → 60% 곱셈","감면 후 남은 금액 × 30%","60% × 감면율","60% 단일 정률"]'::jsonb, '1',
 'M60: 보훈청구액 = totalPrice × 0.60. 잔액(totalPrice-보훈청구액) × 30% → 본인부담. CH06 §4.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','M60','medium']),

('CH06', 3, 'numeric', '총액1 15,500원, M60. 보훈청구액과 본인부담금의 합은? (원)',
 NULL, '11100',
 '보훈청구 = 15,500 × 0.60 = 9,300. 잔액 = 6,200 × 0.30 → trunc100(1,860) = 1,800. 합 = 9,300 + 1,800 = 11,100원. CH11 §3.7.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','M60','hard']),

('CH06', 2, 'true_false', 'pubPrice 와 insuPrice 는 보훈 환자가 아닐 때 항상 동일한 값이다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 일반 환자 (mpvaPrice=0) 인 경우 pubPrice = insuPrice = totalPrice - userPrice. 보훈 환자에서는 분리. CH06 §2.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','pubPrice','medium']),

('CH06', 2, 'multiple_choice', '보훈 G20(위탁 약국) 환자의 insuPrice 는?',
 '["일반 건보와 동일 70%","0원 (보훈청 전액 처리)","약국 실수납금","M코드 감면율에 따라"]'::jsonb, '3',
 'G20+Mxx: insuPrice 는 보훈 감면율 및 M코드 조합에 따라 계산. M10 전액면제는 insuPrice=0, mpvaPrice=total. M60은 잔액 분담. CH12.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','G20','medium']),

('CH06', 2, 'numeric', '총액 32,810원, M10 전액면제. mpvaPrice? (원)',
 NULL, '9800',
 'M10: 원래 본인부담 = trunc100(32,810 × 0.30) = 9,800원. M10 이 이를 전액 부담 → mpvaPrice = 9,800. 실제 환자=0. CH06 §3.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','M10','medium']),

('CH06', 1, 'multiple_choice', 'realPrice 가 나타내는 것은?',
 '["실제 청구액","userPrice - pubPrice","보훈 감면분","총액의 10%"]'::jsonb, '1',
 'realPrice = userPrice - pubPrice. 일반 환자는 pubPrice가 0 이라 realPrice=userPrice. 특수 경우(상한제/보훈)에 차이. CH06 §5.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','realPrice','medium']),

('CH06', 1, 'multiple_choice', 'sumUser 는 무엇을 나타내는가?',
 '["본인부담금 총액","최종 환자 수납액 (비급여 포함 전체)","공단 청구액","보훈 청구액"]'::jsonb, '1',
 'sumUser = 최종 환자 수납액. userPrice + U항 + W항 (비급여/100%본인). 환자가 실제 카운터에서 지불하는 금액. CH06 §5.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','sumUser','medium']),

('CH06', 2, 'true_false', '보훈 환자가 아닌 경우에도 mpvaPrice 필드가 totalPrice 의 일부 값을 가질 수 있다. (O/X)',
 '["O","X"]'::jsonb, '1',
 'X. 일반(비보훈) 환자는 mpvaPrice = 0 또는 undefined. 보훈 M코드가 있을 때만 > 0. CH06 §2.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','medium']),

('CH06', 3, 'multi_step', 'G10+M60 60세, 총액1 15,500원. 3자배분 값',
 NULL, '{"mpvaPrice":9300,"userPrice":1800,"pub":4400}',
 '보훈 = 15,500×0.60 = 9,300 / 잔액 6,200×30% trunc100 = 1,800 / 공단 = 15,500-9,300-1,800 = 4,400. CH11 §3.7.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','3자배분','hard']),

('CH06', 2, 'multiple_choice', '보훈 M81~M83 (보훈특례 A/B/C) 의 특징은?',
 '["무조건 전액면제","심사기관(isSimSa) 여부에 따라 분기","M10과 동일","M90과 동일"]'::jsonb, '1',
 'M81/M82/M83 = 보훈특례 A/B/C. 심사기관 여부(isSimSa) 에 따라 3자배분 후처리 분기. CH12 §5.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','보훈특례','hard']),

('CH06', 2, 'numeric', '총액 20,000원, M30(30% 감면). 보훈청구액은? (원)',
 NULL, '6000',
 'M30: 보훈청구 = totalPrice × 0.30 = 20,000 × 0.30 = 6,000원. 잔액 14,000원에 대해 본인부담률 적용. CH06 §4.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','M30','hard']),

('CH06', 1, 'matching', '3자배분 필드 매칭',
 NULL, '{"l1":"r1","l2":"r2","l3":"r3","l4":"r4"}',
 'userPrice=환자, insuPrice=공단, mpvaPrice=보훈청, pubPrice=공비(공단+보훈). CH06 §2.',
 ARRAY['chapter:CH06','lesson:lesson-07-insurance-types','expansion','매칭','medium']),

-- ============================================================
-- CH07 반올림·절사 — 추가 15문
-- ============================================================

('CH07', 1, 'multiple_choice', 'Round1 함수의 동작은?',
 '["원미만 사사오입","원미만 올림","10원 미만 절사","100원 미만 절사"]'::jsonb, '0',
 'Round1 = 원미만 사사오입 (x + 0.5 → int). 약품금액/Z코드 산출에 사용. CH07 §2.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Round1','easy']),

('CH07', 1, 'multiple_choice', 'Trunc10 의 동작은?',
 '["10원 미만 사사오입","10원 미만 절사(버림)","100원 미만 절사","사사오입 없음"]'::jsonb, '1',
 'Trunc10 = Math.floor(x/10)*10. 10원 미만 버림. 총액1·의료급여 본인부담 산출에 사용. CH07 §3.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Trunc10','easy']),

('CH07', 1, 'multiple_choice', 'Trunc100 의 용도는?',
 '["약품금액 단위","총액1 단위","건보 본인부담금 (100원 절사)","10원 절사"]'::jsonb, '2',
 'Trunc100 = 100원 미만 절사. 건강보험 본인부담금 최종 산출에 적용. 환자 부담 최소화. CH07 §4.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Trunc100','easy']),

('CH07', 2, 'numeric', '값 12,345원에 Trunc10 적용 결과? (원)',
 NULL, '12340',
 'floor(12,345/10)*10 = 1,234 * 10 = 12,340원.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Trunc10','easy']),

('CH07', 2, 'numeric', '값 5,749원에 Trunc100 적용 결과?',
 NULL, '5700',
 'floor(5,749/100)*100 = 57 * 100 = 5,700원.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Trunc100','easy']),

('CH07', 2, 'numeric', '값 1,795.5 에 Round1 적용 결과? (원)',
 NULL, '1796',
 'Math.round(1,795.5) or (int)(1,795.5 + 0.5) = (int)(1,796) = 1,796원.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Round1','medium']),

('CH07', 2, 'multiple_choice', 'Round10 의 동작은?',
 '["10원 미만 절사","10원 미만 사사오입","100원 미만 사사오입","올림"]'::jsonb, '1',
 'Round10 = 10원 미만 사사오입. Math.round(x/10)*10. 일부 비급여 반올림에 사용. CH07 §3.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Round10','medium']),

('CH07', 2, 'numeric', '값 1,745 에 Round100 적용 결과?',
 NULL, '1700',
 'Math.round(1,745/100)*100 = 17 * 100 = 1,700원. 사사오입 경계: 1,750 → 1,800.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Round100','medium']),

('CH07', 2, 'numeric', '값 1,750 에 Round100 적용 결과?',
 NULL, '1800',
 'Math.round(1,750/100)*100 = Math.round(17.5)*100 = 18*100 = 1,800원. (사사오입)',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','medium']),

('CH07', 2, 'multiple_choice', 'Ceil10 과 Ceil100 의 차이는?',
 '["Ceil10=10원 올림, Ceil100=100원 올림","둘 다 동일","Ceil10=반올림","Ceil100=내림"]'::jsonb, '0',
 'Ceil10 = Math.ceil(x/10)*10 (10원 올림), Ceil100 = Math.ceil(x/100)*100 (100원 올림). 거의 사용 안 되는 예외적 반올림 유형.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','Ceil','medium']),

('CH07', 2, 'multiple_choice', '의료급여 본인부담금 산출 시 최종 반올림은?',
 '["Trunc10","Trunc100","Round1","Round100"]'::jsonb, '0',
 '의료급여(D계열) 본인부담 정액/정률 최종 → Trunc10. 건강보험은 Trunc100. CH07 §4.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','medium']),

('CH07', 3, 'multiple_choice', 'V252 경증질환 3% 본인부담 공식: max(trunc10(total × 3%), ?). 최저 보장액은?',
 '["100원","500원","1,000원","1,500원"]'::jsonb, '1',
 'V252 경증: max(trunc10(총액 × 0.03), 500). 최저 500원 보장. CH05 §12.1.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','V252','medium']),

('CH07', 3, 'numeric', '값 889.8 에 Trunc10, 그 후 max(_, 500) 적용. 최종 값?',
 NULL, '880',
 'trunc10(889.8) = floor(88.98)*10 = 88*10 = 880. max(880, 500) = 880. V252 공식 적용 예 (S13).',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','V252','hard']),

('CH07', 2, 'matching', '계산 단계별 반올림 함수 매칭',
 NULL, '{"l1":"r1","l2":"r2","l3":"r3","l4":"r4","l5":"r2"}',
 '약품금액(Round1) / Z코드 단가(Round1) / 총액1(Trunc10) / 건보 본인부담(Trunc100) / 의료급여 본인부담(Trunc10). CH07 단계별 일람.',
 ARRAY['chapter:CH07','lesson:lesson-08-rounding-precision','expansion','매칭','hard']),

('CH07', 2, 'true_false', '약품금액 단계의 사사오입은 각 약품마다 개별 적용 후 합산한다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 각 약품별 (단가×투약량×횟수×일수) 결과에 Round1 적용 후 합산. 합산 후 한 번에 하면 누적오차 발생. CH01 §5.',
 ARRAY['chapter:CH07','lesson:lesson-03-drug-amount-basics','expansion','medium']),

-- ============================================================
-- CH08 특수케이스 — 추가 15문
-- ============================================================

('CH08', 1, 'multiple_choice', '648903860 특수약품의 주요 규정은?',
 '["투약일수 최대 5일 + 5% 가산","비급여 처리","100% 본인부담","자가주사 전용"]'::jsonb, '0',
 '648903860 (팍스로비드 추정): 투약일수 5일 상한, 본인부담률 5% (2024.10.25~). CH01 §7-2, CH08.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','648903860','medium']),

('CH08', 2, 'multiple_choice', '본인부담상한제의 작동 방식은?',
 '["매월 상한 적용","연간 누적 본인부담이 상한 초과 시 공단 환급","약국 청구액에 적용","비급여만"]'::jsonb, '1',
 '본인부담상한제: yearlyAccumulated + 현 부담이 소득분위별 상한 초과 시, 초과분을 overUserPrice 로 공단 환급. CH08 §safety-net.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','상한제','medium']),

('CH08', 1, 'multiple_choice', '명절가산(ZE100) 의 적용 기간은?',
 '["설 당일","설·추석 당일 + 고시 명절기간","1월 전체","공휴일 전체"]'::jsonb, '1',
 'ZE100 명절가산: 설·추석 당일 + 고시 명절기간(전일/익일 포함 가능). holiday 테이블의 명절구분으로 판정. CH08.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','명절','easy']),

('CH08', 2, 'multiple_choice', '직접조제(isDirectDispensing) 의 약품조제료 Z코드는?',
 '["Z4107","Z4200/Z4201","Z7001","Z4130"]'::jsonb, '1',
 '직접조제: 내복 Z4200, 외용 Z4201 (일반 Z4xxx 대체). 약국관리료·복약지도료 미산정. CH04 §4-5, CH08.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','직접조제','medium']),

('CH08', 2, 'multiple_choice', '2024-07-01 고시 변경이 계산 로직에 반영되는 방식은?',
 '["소스코드에 하드코딩","모든 처방에 일괄 적용","dosDate 기준 분기 처리","2024년 전체만"]'::jsonb, '2',
 '엔진은 CalcOptions.dosDate 를 기준으로 변경 시점 이전/이후를 분기. 과거 처방은 과거 요율, 최신은 신규 요율. CH08 날짜분기.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','dosDate','medium']),

('CH08', 2, 'multiple_choice', '달빛어린이약국의 특수 조건은?',
 '["24시간 운영 소아 대응","일반 약국과 동일","주말 전용","보훈 전용"]'::jsonb, '0',
 '달빛어린이약국 = 야간·공휴·심야 소아 대응 가능 약국. Z7001 복약상담료 + Z2000610 (6세미만+야간) 별도 산정. CH08.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','달빛','easy']),

('CH08', 3, 'multiple_choice', 'specialPub=302 의 의미는?',
 '["행려 D80","100% 본인부담약품 공비 전환","B014 희귀","V252 경증"]'::jsonb, '1',
 'specialPub=302 = 100% 본인부담약품(U항)을 공비로 전환 재배분. 특수 정책에 따라 환자부담 0, 공단 전환. CH08 §B-5.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','specialPub','302','hard']),

('CH08', 2, 'multiple_choice', 'D80 (행려 8종) 환자의 본인부담금은?',
 '["30% 정률","정액 1,000원","0원 (전액면제)","50%"]'::jsonb, '2',
 'D80 행려 8종 = 전액면제. userPrice=0. 의료급여 특수 분류. CH05 §4, CH08.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','D80','easy']),

('CH08', 3, 'multiple_choice', 'hgGrade="5" (의료급여 5등급) 처리는?',
 '["일반 정률","정액 500원","0원 (전액면제, 해석 미확정)","B014와 동일"]'::jsonb, '2',
 'hgGrade=5 → 본인부담 0원. CH05 §4.5 미확정 사항으로 표기. EDB 코드 분기 보존. CH08.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','hgGrade','hard']),

('CH08', 2, 'multiple_choice', 'MT038 특정내역의 용도는?',
 '["모든 보험","보훈위탁 G20 약국 전용 특정내역","산재 전용","건보 일반"]'::jsonb, '1',
 'MT038 = 보훈위탁(G20) 약국 전용. "2"=국비환자 타질환, "A"=도서벽지 60% 감면, "1"=2018 이전 폐지. CH12 §5.4.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','MT038','hard']),

('CH08', 2, 'true_false', '산제 가산은 2023.11.01 이전엔 Z4xxx 본 코드에 가산했고 이후엔 Z4010 별도 행으로 변경되었다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 2023.11.01 이전 Z4xxx 내 산제 가산, 이후 Z4010(800원) 별도 행 청구. 엔진은 dosDate 기준 분기. CH04 §4-4.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','산제','2023','medium']),

('CH08', 2, 'multiple_choice', '코로나19 치료제 (2024.05.01~2024.10.24) 관련 규정은?',
 '["약가 고정 50,000원","건강보험 급여화 완료 (2024.10.25~)","비급여","100% 본인부담"]'::jsonb, '1',
 '2024.05.01 약가 50,000원 정액 → 2024.10.25 건강보험 급여화. 이후 일반 규칙 적용. CH01 §7-1.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','코로나19','medium']),

('CH08', 2, 'multiple_choice', 'V252, V352, V452 중 경증질환 정률 대상은?',
 '["V252만","V252 + V352","V452만","모두 대상"]'::jsonb, '3',
 'V252/V352/V452 시리즈 모두 경증질환 차등제 대상. D20 은 무조건, D10 은 sbrdnType=B/M 인 경우만 3% 정률. CH05 §12.1.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','V252','V352','hard']),

('CH08', 3, 'multiple_choice', '자가투여 주사제(selfInjYN=Y) 의 특이 처리는?',
 '["조제료 전액 미산정","Z4130 약품조제료 추가 산정","비급여 처리","상한 5일"]'::jsonb, '1',
 'selfInjYN=Y → Z4130 자가주사제 약품조제료 산정 활성. 비자가 주사제는 조제료 모두 미산정(약가만). CH02 §3-5, CH08.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','자가주사','medium']),

('CH08', 3, 'error_spot', '특수케이스 판정 오류: (1) D80 → 0원 ✓ (2) V103 → 0원 ✓ (3) B030 2022.03.22 이후 → 0원 ✓ (4) hgGrade=5 → 정액 500원',
 NULL, 'step4',
 'hgGrade=5 → 0원 (전액면제). 정액 500원 아님. CH05 §4.5, CH08.',
 ARRAY['chapter:CH08','lesson:lesson-09-special-cases','expansion','hgGrade','hard']);

-- ────────────────────────────────────────
-- payload 업데이트
-- ────────────────────────────────────────

UPDATE quiz_question
SET payload = '{"left":[{"id":"l1","label":"userPrice"},{"id":"l2","label":"insuPrice"},{"id":"l3","label":"mpvaPrice"},{"id":"l4","label":"pubPrice"}],"right":[{"id":"r1","label":"환자 본인부담"},{"id":"r2","label":"공단 청구액"},{"id":"r3","label":"보훈청 청구액"},{"id":"r4","label":"공비 (공단+보훈)"}]}'::jsonb
WHERE question_type = 'matching' AND 'expansion' = ANY(tags) AND chapter = 'CH06' AND question LIKE '3자배분 필드%';

UPDATE quiz_question
SET payload = '{"left":[{"id":"l1","label":"약품금액"},{"id":"l2","label":"Z코드 금액"},{"id":"l3","label":"총액1"},{"id":"l4","label":"건보 본인부담"},{"id":"l5","label":"의료급여 본인부담"}],"right":[{"id":"r1","label":"Round1"},{"id":"r2","label":"Trunc10"},{"id":"r3","label":"Trunc10"},{"id":"r4","label":"Trunc100"}]}'::jsonb
WHERE question_type = 'matching' AND 'expansion' = ANY(tags) AND chapter = 'CH07';

UPDATE quiz_question
SET payload = '{"steps":[{"id":"step1","label":"01항","value":"10,500원"},{"id":"step2","label":"02항","value":"8,660원"},{"id":"step3","label":"총액1","value":"19,160원"},{"id":"step4","label":"본인부담 30%","value":"5,750원 (검산)"},{"id":"step5","label":"청구","value":"13,410원"}]}'::jsonb
WHERE question_type = 'error_spot' AND 'expansion' = ANY(tags) AND chapter = 'CH05';

UPDATE quiz_question
SET payload = '{"steps":[{"id":"step1","label":"D80","value":"0원"},{"id":"step2","label":"V103","value":"0원"},{"id":"step3","label":"B030","value":"0원"},{"id":"step4","label":"hgGrade=5","value":"500원"}]}'::jsonb
WHERE question_type = 'error_spot' AND 'expansion' = ANY(tags) AND chapter = 'CH08';
