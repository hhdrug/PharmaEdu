-- CH09 데이터모델 퀴즈 15문제
-- 유형: multiple_choice(12), numeric(2), true_false(1)
-- 난이도: easy(5), medium(7), hard(3)

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES

-- ================================================================
-- EASY (5문제) — 필드 정의, 단순 enum 값
-- ================================================================

('CH09', 1, 'multiple_choice',
 'DrugItem의 PD_DOSE 필드는 어떤 값을 저장하나요?',
 '["1회 투약량", "1일 투여횟수", "총 투여일수", "약품 단가"]'::jsonb,
 '0',
 'PD_DOSE는 1회 투약량(소수 4자리까지 허용)을 저장합니다. 예를 들어 0.5정 복용 시 PD_DOSE=0.5입니다. 1일 투여횟수는 PD_DNUM, 총 투여일수는 PD_DDAY, 단가는 PD_PRICE입니다.',
 ARRAY['DrugItem', '필드정의', 'easy']),

('CH09', 1, 'multiple_choice',
 'TakeType enum에서 값 2(Injection)가 나타내는 약품 복용 구분은 무엇인가요?',
 '["내복약", "외용약", "주사약", "산제"]'::jsonb,
 '2',
 'TakeType은 0=Internal(내복약), 1=External(외용약), 2=Injection(주사약)으로 정의됩니다. HIRA 전자문서의 목번호로는 01(내복), 02(외용), 03(주사)에 대응합니다.',
 ARRAY['TakeType', 'Enum', '필드정의', 'easy']),

('CH09', 1, 'multiple_choice',
 'CalcOptions의 총 필드 수는 몇 개인가요?',
 '["19개", "39개", "44개", "48개"]'::jsonb,
 '2',
 'CalcOptions는 EDB PrsBillCalcOptions 44개 필드를 기준으로, 4개 소스(BIZ, HIRA, UPH, EDB)의 합집합으로 구성됩니다. DrugList 포함 총 44개 필드입니다.',
 ARRAY['CalcOptions', '필드정의', 'easy']),

('CH09', 1, 'multiple_choice',
 'InsuPayType enum에서 NonCovered(비급여)의 HIRA 항번호는 무엇인가요?',
 '["01", "U", "W", "A"]'::jsonb,
 '2',
 'InsuPayType.NonCovered(값=0, 비급여)의 HIRA 항번호는 W입니다. 01은 급여(Covered), U는 100% 본인부담(FullSelf), A는 50% 본인부담(Partial50)에 해당합니다.',
 ARRAY['InsuPayType', 'Enum', 'HIRA', 'easy']),

('CH09', 1, 'multiple_choice',
 'ICostCalcRepository 인터페이스의 총 메서드 수는 몇 개인가요?',
 '["5개", "7개", "9개", "11개"]'::jsonb,
 '2',
 'ICostCalcRepository는 EDB NewEPharm.CostCalc.Data.ICostCalcRepository 기준 9개 메서드를 정의합니다. 마스터 조회 3개, 약국 설정 2개, 이력 조회 2개, 참조 데이터 2개로 구성됩니다.',
 ARRAY['ICostCalcRepository', 'Repository패턴', 'easy']),

-- ================================================================
-- MEDIUM (7문제) — 필드 간 관계, 자동계산 공식
-- ================================================================

('CH09', 2, 'multiple_choice',
 'DrugItem.PD_SUM(약품합계금액) 자동계산 공식으로 올바른 것은?',
 '["PD_PRICE × PD_DOSE × PD_DNUM × PD_DDAY (원미만 4사5입)", "PD_DOSE × PD_DNUM × PD_DDAY ÷ PD_PACK × PD_PRICE (원미만 4사5입)", "PD_PRICE × PD_DDAY (원미만 절사)", "PD_DOSE × PD_PRICE (원미만 올림)"]'::jsonb,
 '1',
 'PD_SUM 공식: amount = PD_DOSE × PD_DNUM × PD_DDAY, PD_PACK > 0이면 amount ÷ PD_PACK, PD_SUM = (int)(amount × PD_PRICE + 0.5) 로 원미만 4사5입 처리합니다. HIRA 규격의 "금액 = 단가 × 1회투약량 × 1일투여량 × 총투여일수 (원미만 4사5입)"과 일치합니다.',
 ARRAY['DrugItem', 'PD_SUM', '자동계산', 'medium']),

('CH09', 2, 'multiple_choice',
 'InsuRateInfo의 SixAgeRate가 실제로 적용되기 위한 조건을 모두 만족해야 합니다. 다음 중 적용 조건에 포함되지 않는 것은?',
 '["6세 미만", "전액부담 아님", "부담률 10% 초과", "조제일자 2018년 이후"]'::jsonb,
 '3',
 'SixAgeRate 적용 조건: 6세 미만 AND 전액부담 아님 AND 부담률 10% 초과 AND 값 존재 AND 값 != "0"일 때 insuRate *= SixAgeRate / 100 을 적용합니다. 조제일자 2018년 이후 조건은 Age65_12000Less(65세 이상 경감률)에 해당하는 조건이며 SixAgeRate와는 무관합니다.',
 ARRAY['InsuRateInfo', 'SixAgeRate', '적용조건', 'medium']),

('CH09', 2, 'multiple_choice',
 'MediIllnessInfo(산정특례)에서 V252 질병코드의 SeSickNoType이 "0" 또는 "4"인 경우 적용되는 InsuRateInfo 필드는?',
 '["Rate", "SixAgeRate", "V2520", "V2521"]'::jsonb,
 '2',
 'V252 중증질환 분기 로직: SeSickNoType이 "0" 또는 "4"이면 InsuRateM.V2520을 적용하고, "1"이면 InsuRateM.V2521을 적용합니다. V2520은 중증질환 등급 0/4의 본인부담률, V2521은 등급 1의 본인부담률입니다.',
 ARRAY['MediIllnessInfo', 'InsuRateInfo', 'V2520', 'V2521', 'medium']),

('CH09', 2, 'multiple_choice',
 'PrsWageListM의 AddType 필드에서 "S" 값의 의미는 무엇인가요?',
 '["심사 가산", "토요일 가산", "소아 가산", "야간 가산"]'::jsonb,
 '1',
 'PrsWageListM.AddType은 가산 유형을 나타내며, 빈 문자열("")은 일반 수가, "S"는 토요가산(Saturday)을 의미합니다. 이 필드를 통해 토요일 가산 항목을 일반 항목과 구분하여 관리합니다.',
 ARRAY['PrsWageListM', 'AddType', '수가리스트', 'medium']),

('CH09', 2, 'multiple_choice',
 '설계 원칙 중 "불변 입력 / 가변 출력" 원칙에 따라 계산 중 불변으로 유지되어야 하는 모델은?',
 '["PrsBillM, CalcResult", "CalcOptions, DrugItem", "InsuRateM, MediIllnessM", "PrsWageListM, PrsBillM"]'::jsonb,
 '1',
 'CH09 설계 원칙에서 "CalcOptions + DrugItem은 계산 중 불변, PrsBillM + CalcResult는 계산 엔진이 채운다"고 명시합니다. 입력 모델은 불변(immutable)으로 처리하고, 출력 모델은 엔진이 값을 채우는 가변 객체입니다.',
 ARRAY['설계원칙', 'CalcOptions', 'DrugItem', 'medium']),

('CH09', 2, 'multiple_choice',
 'BohunCode M50의 의미와 HIRA 공상등구분 코드가 올바르게 연결된 것은?',
 '["보훈감면 30% / 코드 3", "보훈국비 (건보/의료급여) / 코드 4", "보훈감면 60% / 코드 6", "보훈감면 90% / 코드 J"]'::jsonb,
 '1',
 'BohunCodes enum에서 M50은 보훈국비(건보/의료급여)를 의미하며 HIRA 공상등구분 코드는 4입니다. M10=감면30%/코드3, M30=감면60%/코드6, M90=감면90%/코드J입니다.',
 ARRAY['BohunCode', 'Enum', 'HIRA', 'medium']),

('CH09', 2, 'true_false',
 'CalcOptions의 InsuDose와 RealDose는 EDB 원본에서 string 타입으로 저장되지만, CH09 통합 설계 권고에서는 타입 안전성을 위해 int로 변환할 것을 권장한다.',
 '[]'::jsonb,
 'true',
 'CH09 통합 설계 권고에서 "InsuDose/RealDose를 EDB처럼 string이 아닌 int로 변경하여 타입 안전성을 확보한다"고 명시합니다. Age 필드도 int 변환을 권장하되, 6세 미만 판별 등에서 월 단위가 필요한 경우 string 유지를 허용합니다.',
 ARRAY['CalcOptions', 'InsuDose', '타입안전성', 'medium']),

-- ================================================================
-- HARD (3문제) — 실제 케이스 해석, 버그 상황 판별
-- ================================================================

('CH09', 3, 'multiple_choice',
 '다음 케이스를 해석하시오. 환자 나이 4세, 보험코드 C10(건강보험), InsuRateM.Rate=30(30%), SixAgeRate=80, 전액부담 아님, PD_SUM=10000원. 최종 본인부담률(insuRate) 계산 결과로 올바른 것은?',
 '["30%", "24%", "8%", "80%"]'::jsonb,
 '1',
 'SixAgeRate 적용 조건(6세 미만 AND 전액부담 아님 AND 부담률 10% 초과 AND SixAgeRate 값 존재 AND 값 != "0")을 모두 만족합니다. insuRate = Rate × SixAgeRate / 100 = 30 × 80 / 100 = 24%. 따라서 최종 본인부담률은 24%입니다.',
 ARRAY['InsuRateInfo', 'SixAgeRate', '케이스계산', 'hard']),

('CH09', 3, 'numeric',
 'DrugItem의 값이 다음과 같을 때 PD_SUM(원)을 계산하시오. PD_PRICE=500, PD_DOSE=1.5, PD_DNUM=3, PD_DDAY=7, PD_PACK=0 (포장단위 미적용). 원미만 4사5입 적용.',
 '[]'::jsonb,
 '15750',
 'PD_PACK=0이므로 포장단위 나눗셈 없이 계산합니다. amount = PD_DOSE × PD_DNUM × PD_DDAY = 1.5 × 3 × 7 = 31.5. PD_SUM = (int)(31.5 × 500 + 0.5) = (int)(15750.5) = 15750원. 원미만 4사5입 후 15750원이 됩니다.',
 ARRAY['DrugItem', 'PD_SUM', '자동계산', '케이스계산', 'hard']),

('CH09', 3, 'numeric',
 'DrugItem.PD_SUM 계산 시 PD_PACK > 0이면 수량 합계를 PD_PACK으로 나눕니다. PD_PRICE=1000, PD_DOSE=2, PD_DNUM=2, PD_DDAY=5, PD_PACK=4 일 때 PD_SUM(원)을 계산하시오.',
 '[]'::jsonb,
 '5000',
 'amount = PD_DOSE × PD_DNUM × PD_DDAY = 2 × 2 × 5 = 20. PD_PACK=4 > 0이므로 amount = 20 ÷ 4 = 5. PD_SUM = (int)(5 × 1000 + 0.5) = 5000원. 포장단위(PD_PACK)는 앰플, 바이알 등 포장 단위 약품에서 실제 사용량을 보정하는 데 사용됩니다.',
 ARRAY['DrugItem', 'PD_SUM', 'PD_PACK', '자동계산', 'hard'])

;
