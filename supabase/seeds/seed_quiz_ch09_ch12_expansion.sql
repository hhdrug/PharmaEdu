-- ============================================================
-- seed_quiz_ch09_ch12_expansion.sql
-- CH09~CH12 개념 문제 확장 (각 10문, 총 40문)
-- ============================================================

DELETE FROM quiz_question WHERE chapter IN ('CH09','CH10','CH11','CH12') AND 'expansion' = ANY(tags);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES

-- ============================================================
-- CH09 데이터 모델 — 추가 10문
-- ============================================================

('CH09', 1, 'multiple_choice', 'CalcOptions 의 역할은?',
 '["계산 결과 담기","계산 입력 파라미터 (불변)","수가 마스터","보험요율 테이블"]'::jsonb, '1',
 'CalcOptions = 계산 입력 파라미터 모음. 계산 중 변경되지 않는 불변 객체. dosDate, insuCode, drugList, 가산플래그 등. CH09 §2.',
 ARRAY['chapter:CH09','lesson:lesson-02-prescription-components','expansion','CalcOptions','easy']),

('CH09', 2, 'multiple_choice', 'InsuPayType enum 에서 NonCovered 의 HIRA 항번호는?',
 '["01","U","W","A"]'::jsonb, '2',
 'NonCovered(비급여) = W항. Covered=01, FullSelf(100%본인)=U, Partial50(선별50%)=A. CH09 §3.',
 ARRAY['chapter:CH09','lesson:lesson-02-prescription-components','expansion','InsuPayType','medium']),

('CH09', 2, 'multiple_choice', 'InsuRate.sixAgeRate 적용 조건은?',
 '["모든 6세 미만","6세 미만 + 전액부담 아님 + 부담률 10% 초과","6세 미만 + D10","6세 미만 + 야간"]'::jsonb, '1',
 'SixAgeRate 적용 조건: 6세 미만 AND 전액부담 아님 AND 부담률 > 10% AND 값 존재 AND ≠ "0". 만족 시 insuRate ×= SixAgeRate/100. CH09 §4.',
 ARRAY['chapter:CH09','lesson:lesson-06-copayment','expansion','SixAgeRate','medium']),

('CH09', 2, 'multiple_choice', 'SectionTotals.sectionA/B/D/E 는 무엇을 나타내는가?',
 '["보험유형별 합계","선별급여 50%/80%/30%/90% 항별 합계","날짜별 합계","약품 카테고리"]'::jsonb, '1',
 'sectionA=50% 선별급여, sectionB=80%, sectionD=30%, sectionE=90%. underUser/underInsu 산출 모수. CH09 §5.',
 ARRAY['chapter:CH09','lesson:lesson-06-copayment','expansion','SectionTotals','medium']),

('CH09', 2, 'numeric', 'DrugItem 에서 PD_PRICE=100, PD_DOSE=1, PD_DNUM=3, PD_DDAY=10, PD_PACK=0. PD_SUM은? (원)',
 NULL, '3000',
 'amount = 1×3×10 = 30 (PD_PACK=0 이므로 나누기 없음). PD_SUM = (int)(30×100 + 0.5) = 3,000원.',
 ARRAY['chapter:CH09','lesson:lesson-03-drug-amount-basics','expansion','PD_SUM','medium']),

('CH09', 2, 'true_false', 'CalcOptions 와 DrugItem 은 계산 중 변경되지 않는 불변 객체이고, CalcResult 는 엔진이 채우는 가변 객체이다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. CH09 설계 원칙: 불변 입력(CalcOptions/DrugItem) vs 가변 출력(PrsBillM/CalcResult). 엔진이 결과를 채움.',
 ARRAY['chapter:CH09','lesson:lesson-02-prescription-components','expansion','설계원칙','medium']),

('CH09', 2, 'multiple_choice', 'WageListItem 의 주요 필드 5개는?',
 '["sugaCd, name, insuPay, cnt, price, sum, addType (7개)","id, desc","code, amount","chapter, num"]'::jsonb, '0',
 'WageListItem = {sugaCd, name, insuPay, cnt, price, sum, addType}. 수가(Z코드) 항목별 결과. CH09 §7.',
 ARRAY['chapter:CH09','lesson:lesson-02-prescription-components','expansion','WageList','medium']),

('CH09', 3, 'multiple_choice', 'ICalcRepository 인터페이스의 핵심 메서드가 아닌 것은?',
 '["getSugaFeeMap (수가표)","getInsuRate (보험요율)","getMediIllnessInfo (산정특례)","sendEmailToPatient (환자 이메일)"]'::jsonb, '3',
 'ICalcRepository = 데이터 조회 인터페이스. 수가/보험요율/특례 정보 등. 환자 통신 기능 없음. CH09 §10.',
 ARRAY['chapter:CH09','lesson:lesson-02-prescription-components','expansion','Repository','hard']),

('CH09', 2, 'multiple_choice', 'CalcStep 필드 중 교육 모드에서 가장 중요한 것은?',
 '["title, formula, result, unit","id, status","chapter","createdAt"]'::jsonb, '0',
 'CalcStep = {title(단계명), formula(수식), result(값), unit(단위)}. 단계별 계산 과정 시각화용.',
 ARRAY['chapter:CH09','lesson:lesson-08-rounding-precision','expansion','CalcStep','medium']),

('CH09', 2, 'matching', 'TakeType enum 값 매칭',
 NULL, '{"l1":"r1","l2":"r2","l3":"r3"}',
 'internal=내복약(01), external=외용약(02), injection=주사약(03). HIRA 목번호 매핑. CH09 §3.',
 ARRAY['chapter:CH09','lesson:lesson-02-prescription-components','expansion','TakeType','매칭','medium']),

-- ============================================================
-- CH10 계산 파이프라인 — 추가 10문
-- ============================================================

('CH10', 1, 'multiple_choice', '약제비 계산 파이프라인의 시작 단계는?',
 '["Step 0: 648 특수약품 전처리","Step 1: 약품금액","Step 2: 조제료","Step 3: 총액1"]'::jsonb, '0',
 'Step 0 = 648903860 특수약품 5일 상한 전처리. 그 후 Step 1 약품금액 계산 시작. CH10 §1.',
 ARRAY['chapter:CH10','lesson:lesson-10-integrated-practice','expansion','Step0','easy']),

('CH10', 2, 'multiple_choice', '엔진 파이프라인의 중간값(steps) 전달 방식은?',
 '["전역 변수","CalcResult 객체의 steps 배열에 push","DB 저장","로그 파일"]'::jsonb, '1',
 '각 계산 모듈은 CalcResult.steps 배열에 {title, formula, result, unit} 객체 push. 교육 모드에서 단계별 표시.',
 ARRAY['chapter:CH10','lesson:lesson-10-integrated-practice','expansion','steps','medium']),

('CH10', 2, 'multiple_choice', '10단계 파이프라인 중 "보험료율 + 산정특례 요율 결정" 은 몇 번 Step인가?',
 '["Step 2","Step 3","Step 5","Step 7"]'::jsonb, '1',
 'Step 3 = 보험료율 조회 + 산정특례 요율 결정 (determineExemptionRate). 그 후 Step 4 본인부담금. CH10 §2.',
 ARRAY['chapter:CH10','lesson:lesson-10-integrated-practice','expansion','Step3','medium']),

('CH10', 2, 'multiple_choice', 'formNumber H024 가 의미하는 서식은?',
 '["처방조제 × 건강보험","처방조제 × 의료급여","직접조제 × 건강보험","직접조제 × 의료급여"]'::jsonb, '0',
 'H024=처방조제 건강보험, H124=처방조제 의료급여, H025=직접조제 건보, H125=직접조제 의료급여. CH10 §Step1-2.',
 ARRAY['chapter:CH10','lesson:lesson-10-integrated-practice','expansion','formNumber','medium']),

('CH10', 2, 'true_false', '파이프라인은 "검증 → 로드 → 약품 → 일수 → 가산 → 조제료 → 부담금 → 배분 → 보정 → 완성" 순서로 진행된다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 10단계 외우기 요령. 이 순서를 어기면 중간값이 틀어져 최종 청구액 오류. CH10 §1.',
 ARRAY['chapter:CH10','lesson:lesson-10-integrated-practice','expansion','순서','medium']),

('CH10', 2, 'multiple_choice', '총액1 산출에 포함되지 않는 항은?',
 '["01항 급여","02항 조제료","U항 100%본인","A/B/D/E 선별급여 (별도 처리)"]'::jsonb, '2',
 '총액1 = trunc10(01항+02항). U항(100%본인)·W항(비급여)·선별급여 항별 합계는 제외. CH05 §2.',
 ARRAY['chapter:CH10','lesson:lesson-06-copayment','expansion','총액1','medium']),

('CH10', 3, 'multiple_choice', '파이프라인 Step 5/6 후처리에 해당하는 작업은?',
 '["648 5% 가산 적용, 본인부담상한제 초과 처리","약품금액 재계산","보험료율 변경","조제료 재조회"]'::jsonb, '0',
 'Step 5 = 648 특수약품 5% 가산. Step 6 = yearlyAccumulated 기반 본인부담상한제 overUserPrice 산출. CH10 §Step5-6.',
 ARRAY['chapter:CH10','lesson:lesson-10-integrated-practice','expansion','후처리','hard']),

('CH10', 2, 'ordering', '10단계 파이프라인 중 핵심 Step 5개를 올바른 순서로.',
 NULL, 'i1,i2,i3,i4,i5',
 '(1)검증→(2)약품금액→(3)조제료→(4)총액1 trunc10→(5)본인부담. CH10 §1.',
 ARRAY['chapter:CH10','lesson:lesson-10-integrated-practice','expansion','순서','hard']),

('CH10', 2, 'multiple_choice', '계산 엔진이 에러 반환하는 경우는?',
 '["약품 목록 비어있음","보험코드 누락","dosDate 형식 오류","위 모두"]'::jsonb, '3',
 '엔진 Step 0 입력검증: drugList.length=0, insuCode 누락, dosDate 형식 오류 (yyyyMMdd 8자 미달) 시 error 반환. CH10 Step 1.',
 ARRAY['chapter:CH10','lesson:lesson-09-special-cases','expansion','검증','medium']),

('CH10', 3, 'error_spot', '파이프라인 단계 순서 오류: (1) 검증 (2) 약품금액 (3) 본인부담 (4) 조제료 (5) 총액1',
 NULL, 'step3',
 '오류: Step 3 은 "조제료", Step 4 는 "총액1", Step 5 는 "본인부담"이어야 함. 본인부담이 먼저 오면 총액1 없이 계산 불가.',
 ARRAY['chapter:CH10','lesson:lesson-10-integrated-practice','expansion','순서오류','hard']),

-- ============================================================
-- CH11 테스트 시나리오 (개념/메타) — 추가 10문
-- ============================================================

('CH11', 1, 'multiple_choice', 'CH11 문서의 역할은?',
 '["사용자 가이드","약제비 계산 공식 검증용 테스트 시나리오 명세","약품 카탈로그","가격표"]'::jsonb, '1',
 'CH11 = 건강보험·의료급여·보훈 등 실제 사례 기반 계산 검증 시나리오와 기대값 목록. S01~S13 공식 시나리오.',
 ARRAY['chapter:CH11','lesson:lesson-10-integrated-practice','expansion','CH11','easy']),

('CH11', 2, 'multiple_choice', 'CH11 S01 "기본 처방" 의 핵심 검증 사항은?',
 '["1회투약량이 0.5인 경우","6세미만 + 야간 복합가산","10단계 기본 파이프라인 전체","V252 경증질환"]'::jsonb, '2',
 'S01 = C10 40세 내복 7일 기본 처방 → 10단계 전체 파이프라인 검증 기준. 기대값: 총액1 19,160 / 본인부담 5,700.',
 ARRAY['chapter:CH11','lesson:lesson-10-integrated-practice','expansion','S01','medium']),

('CH11', 2, 'multiple_choice', 'CH11 S10 "빌런 처방" 의 조건은?',
 '["단순 건보","소아 + 가루약 + 야간 + 혼합보험","의료급여 면제","보훈위탁"]'::jsonb, '1',
 'S10 = 3세 + 산제(Y) + 야간 + 혼합보험(급여/비급여/100%본인). 가장 복잡한 우선순위 판정. CH11 §3.10.',
 ARRAY['chapter:CH11','lesson:lesson-10-integrated-practice','expansion','S10','빌런','medium']),

('CH11', 2, 'true_false', 'CH11 S07 (보훈 60% 감면) 계산 시 Z1000/Z2000/Z3000 조제료는 0원으로 처리된다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 보훈감면 60% 조건에서 약국관리료/기본조제료/복약지도료 = 0 처리. Z4xxx(약품조제료)와 Z5xxx(의약품관리료)만 유지. CH11 §3.7.',
 ARRAY['chapter:CH11','lesson:lesson-07-insurance-types','expansion','보훈','medium']),

('CH11', 2, 'multiple_choice', 'CH11 S12 "의료급여 1종 면제 18세미만" 의 환자 부담 금액은?',
 '["500원","1,000원","0원","30% 정률"]'::jsonb, '2',
 'S12 = D10 10세, sbrdnType=M → CH05 §12.4 1종 면제 8종 중 #1 (18세 미만) → 본인부담 0원. 정액 Mcode 우회. CH11 §3.12.',
 ARRAY['chapter:CH11','lesson:lesson-07-insurance-types','expansion','S12','면제','medium']),

('CH11', 2, 'numeric', 'CH11 S13 V252 경증질환 (D20 45세) 총액1 29,660원. 본인부담금은? (원)',
 NULL, '880',
 'max(trunc10(29,660×3%), 500) = max(880, 500) = 880원. V252 경증 차등제. CH11 §3.13.',
 ARRAY['chapter:CH11','lesson:lesson-09-special-cases','expansion','S13','V252','medium']),

('CH11', 3, 'multiple_choice', 'CH11 공식 시나리오 13개 중 "의료급여" 관련 시나리오 번호는?',
 '["S01~S05","S06, S11, S12, S13","S07~S10","S01, S02"]'::jsonb, '1',
 'S06=의료급여 1종 정액, S11=의료급여 2종 500원, S12=1종 18세미만 면제, S13=경증질환 V252. 4개. CH11 §3.6, 3.11~13.',
 ARRAY['chapter:CH11','lesson:lesson-07-insurance-types','expansion','의료급여','hard']),

('CH11', 2, 'multiple_choice', 'webapp scenarios.ts 의 S번호 체계와 CH11 문서의 S번호 체계는?',
 '["완전히 다름","S01~S13 만 일치, S14~S22 는 webapp 확장","webapp 이 우선","CH11 이 우선"]'::jsonb, '1',
 'Phase 7 B 에서 재정렬: S01~S13 = CH11 공식, S14~S22 = webapp 학습 보조 (의료급여 확장/보훈/산재/특수). CH11 relatedScenarios = S01~S13.',
 ARRAY['chapter:CH11','lesson:lesson-10-integrated-practice','expansion','체계','medium']),

('CH11', 2, 'true_false', 'CH11 기대값은 C# 원본 엔진과 동일 결과가 나와야 한다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. CH11 시나리오 기대값 = C# 원본 엔진 결과와 일치하도록 검증. TypeScript 포팅 검증용 "Ground Truth". CH11 §1.',
 ARRAY['chapter:CH11','lesson:lesson-10-integrated-practice','expansion','ground-truth','medium']),

('CH11', 2, 'multiple_choice', 'CH11 시나리오 S08 "가루약 가산" 의 핵심 검증은?',
 '["Z4010 800원 별도행 추가","Z4107 에 30% 가산","가루약은 무과금","야간과 중복"]'::jsonb, '0',
 'S08 = 2023.11.01 이후 산제(가루약) = Z4010(800원) 별도 행으로 추가. Z4107 본 코드는 일반 유지. CH11 §3.8.',
 ARRAY['chapter:CH11','lesson:lesson-05-surcharge-rules','expansion','S08','Z4010','medium']),

-- ============================================================
-- CH12 보훈 약국 — 추가 10문
-- ============================================================

('CH12', 1, 'multiple_choice', '보훈 G10 과 G20 의 차이는?',
 '["G10=직접, G20=위탁 약국","G10=위탁, G20=직접","동일","G20=감면 크다"]'::jsonb, '0',
 'G10 = 보훈 직접(보훈병원), G20 = 보훈 위탁(일반 약국이 보훈 환자 위탁 처리). MT038 특정내역은 G20 전용. CH12 §2.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','G10','G20','easy']),

('CH12', 1, 'multiple_choice', '보훈 감면 코드 M10 의 의미는?',
 '["30% 감면","60% 감면","전액면제 (100%)","일부면제"]'::jsonb, '2',
 'M10 = 보훈 전액면제 (100%). 환자 0원, 보훈청 전액 대납. M20=일부면제, M30=30%, M50=50%, M60=60%, M90=기타. CH12 §3.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','M10','easy']),

('CH12', 2, 'multiple_choice', 'MT038 특정내역 "2" 의 의미는?',
 '["2018 이전 폐지","국비환자 타질환 조제분","60% 감면 도서벽지","해당 없음"]'::jsonb, '1',
 'MT038="2" = 국비환자 타질환 조제분 (2013.01.01 이후). "A"=60% 감면 도서벽지. "1"=2018 이전 폐지. "" = 해당없음. CH12 §5.4.',
 ARRAY['chapter:CH12','lesson:lesson-09-special-cases','expansion','MT038','medium']),

('CH12', 2, 'multiple_choice', 'isBohunHospital 플래그가 true 이면?',
 '["일반 약국","보훈병원 부설 또는 연계 요양기관 (hospCode 조건)","보훈 환자","보훈 감면"]'::jsonb, '1',
 'isBohunHospital = 요양기관기호(hospCode) 가 보훈병원 계열임을 나타냄. 3자배분/MpvaComm 계산에 영향. CH12 §6.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','isBohunHospital','medium']),

('CH12', 2, 'multiple_choice', '보훈 3자배분 항등식은?',
 '["total = userPrice + pubPrice","total = userPrice + insuPrice + mpvaPrice","total = mpvaPrice 만","total = 2 × userPrice"]'::jsonb, '1',
 'totalPrice = userPrice + insuPrice + mpvaPrice. 보훈환자 전용. 일반환자는 mpvaPrice=0 이라 2자배분. CH12 §4.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','항등식','medium']),

('CH12', 3, 'multiple_choice', 'isSimSa (심사기관) 플래그는 어느 M코드 처리에 영향을 주는가?',
 '["M10","M60","M81~M83 (보훈특례 A/B/C)","M90"]'::jsonb, '2',
 'M81/M82/M83 보훈특례에서 isSimSa 기준으로 후처리 분기. 심사기관 여부에 따라 재배분 규칙 다름. CH12 §5.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','isSimSa','hard']),

('CH12', 3, 'numeric', '총액1 15,500원, M60 (60% 감면). 보훈청구액 mpvaPrice 는?',
 NULL, '9300',
 'mpvaPrice = 15,500 × 0.60 = 9,300원. 감면율 60% → 보훈청 부담 비율.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','M60','medium']),

('CH12', 2, 'true_false', '보훈 환자가 건강보험(C10) 기반에 M코드만 추가된 경우 (예: C10+M10) 도 3자배분이 발생한다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. C10+M10: 건보 insuCode + 보훈 M 코드. 3자배분 (환자=0, 공단+보훈 분담). webapp S16 시나리오. CH12 §3.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','C10M10','medium']),

('CH12', 2, 'multiple_choice', 'MpvaComm 이 나타내는 것은?',
 '["환자 비급여 부담","보훈 비급여 감면분","공단 청구액","약국 수익"]'::jsonb, '1',
 'MpvaComm = 보훈 비급여 감면분. 보훈 환자의 비급여 약품에 대한 보훈청 부담. SumUserDrug + SumWageComm 모수. CH12 §5.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','MpvaComm','hard']),

('CH12', 2, 'matching', '보훈 M코드 감면율 매칭',
 NULL, '{"l1":"r1","l2":"r2","l3":"r3","l4":"r4"}',
 'M10=100%(전액면제), M30=30%, M60=60%, M90=기타(특례). CH12 §3.',
 ARRAY['chapter:CH12','lesson:lesson-07-insurance-types','expansion','M코드','매칭','medium']);

-- ────────────────────────────────────────
-- payload 업데이트
-- ────────────────────────────────────────

UPDATE quiz_question
SET payload = '{"left":[{"id":"l1","label":"internal"},{"id":"l2","label":"external"},{"id":"l3","label":"injection"}],"right":[{"id":"r1","label":"내복약 (HIRA 01)"},{"id":"r2","label":"외용약 (HIRA 02)"},{"id":"r3","label":"주사약 (HIRA 03)"}]}'::jsonb
WHERE question_type = 'matching' AND 'expansion' = ANY(tags) AND chapter = 'CH09' AND question LIKE 'TakeType enum%';

UPDATE quiz_question
SET payload = '{"items":[{"id":"i1","label":"Step 1 입력 검증"},{"id":"i2","label":"Step 3 약품금액 계산"},{"id":"i3","label":"Step 6 조제료 산정"},{"id":"i4","label":"Step 7 총액1 (trunc10)"},{"id":"i5","label":"Step 7 본인부담금"}]}'::jsonb
WHERE question_type = 'ordering' AND 'expansion' = ANY(tags) AND chapter = 'CH10';

UPDATE quiz_question
SET payload = '{"steps":[{"id":"step1","label":"Step1 검증"},{"id":"step2","label":"Step2 약품금액"},{"id":"step3","label":"Step3 본인부담 (??)"},{"id":"step4","label":"Step4 조제료"},{"id":"step5","label":"Step5 총액1"}]}'::jsonb
WHERE question_type = 'error_spot' AND 'expansion' = ANY(tags) AND chapter = 'CH10';

UPDATE quiz_question
SET payload = '{"left":[{"id":"l1","label":"M10"},{"id":"l2","label":"M30"},{"id":"l3","label":"M60"},{"id":"l4","label":"M90"}],"right":[{"id":"r1","label":"100% 전액면제"},{"id":"r2","label":"30% 감면"},{"id":"r3","label":"60% 감면"},{"id":"r4","label":"기타/특례"}]}'::jsonb
WHERE question_type = 'matching' AND 'expansion' = ANY(tags) AND chapter = 'CH12';
