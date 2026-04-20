-- ============================================================
-- seed_quiz_ch01_ch04_expansion.sql
-- CH01~CH04 개념 문제 확장 (각 15문, 총 60문)
-- ============================================================
--
-- 기존 seed_quiz_ch01_ch04.sql 의 24문(각 6문)에 추가로 60문 보강.
-- 원본 CH 문서 (src/content/chapters/ch01~ch04) 의 개념/엣지케이스 기반.
-- 태그 'expansion' 으로 재실행 시 대체 가능.

DELETE FROM quiz_question WHERE chapter IN ('CH01','CH02','CH03','CH04') AND 'expansion' = ANY(tags);

INSERT INTO quiz_question (chapter, difficulty, question_type, question, choices, correct_answer, explanation, tags) VALUES

-- ============================================================
-- CH01 약품금액 계산 로직 — 추가 15문
-- ============================================================

('CH01', 1, 'multiple_choice',
 'DrugItem 의 PD_DOSE 필드가 저장하는 값은?',
 '["1회 투약량","1일 투여횟수","총 투여일수","약품 단가"]'::jsonb, '0',
 'PD_DOSE = 1회 투약량(소수 4자리 허용). 0.5정=0.5 저장. CH01 §4.',
 ARRAY['chapter:CH01','lesson:lesson-02-prescription-components','expansion','DrugItem','필드','easy']),

('CH01', 1, 'multiple_choice',
 '약품 단가를 저장하는 필드 명은?',
 '["PD_DOSE","PD_DNUM","PD_DDAY","PD_PRICE"]'::jsonb, '3',
 'PD_PRICE = 약품 단가 (원 단위). 보험급여상 고시가 또는 실거래가. CH01 §4.',
 ARRAY['chapter:CH01','lesson:lesson-02-prescription-components','expansion','필드','easy']),

('CH01', 2, 'multiple_choice',
 'PD_SUM (약품합계금액) 자동계산 공식은?',
 '["PD_PRICE × PD_DDAY","PD_DOSE × PD_DNUM × PD_DDAY ÷ PD_PACK × PD_PRICE (4사5입)","PD_DOSE × PD_PRICE","PD_DNUM × PD_DDAY"]'::jsonb, '1',
 'PD_SUM = (int)(PD_DOSE × PD_DNUM × PD_DDAY × PD_PRICE + 0.5). PD_PACK>0 시 amount/PD_PACK. 원미만 4사5입. CH01 §5.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','PD_SUM','공식','medium']),

('CH01', 2, 'numeric',
 '단가 1000원, 1회 2정, 1일 2회, 5일, PD_PACK=4. PD_SUM은? (원, 정수)',
 NULL, '5000',
 'amount = 2×2×5 = 20. PD_PACK>0 → 20/4 = 5. PD_SUM = (int)(5 × 1000 + 0.5) = 5,000원. CH01 §5.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','PD_PACK','medium']),

('CH01', 2, 'numeric',
 '단가 150원, 1회 0.5정, 1일 4회, 6일. 원미만 사사오입 후 약품금액? (원, 정수)',
 NULL, '1800',
 'amount = 0.5 × 4 × 6 = 12. 약품금액 = (int)(12 × 150 + 0.5) = 1,800원. 정수 곱셈이므로 사사오입 영향 없음. CH01 §5.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','분할투여','medium']),

('CH01', 2, 'multiple_choice',
 '급여(covered) 약품은 어느 항으로 분류되는가?',
 '["01항 (sumInsuDrug)","U항 (100%본인)","W항 (비급여)","A항 (선별급여 50%)"]'::jsonb, '0',
 '급여 약품 = 01항 (sumInsuDrug). 100%본인=U, 비급여=W, 선별급여=A/B/D/E (50%/80%/30%/90% 분담률). CH01 §6, CH05 §8.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','항분류','medium']),

('CH01', 2, 'true_false',
 '비급여 약품과 100%본인부담 약품은 요양급여비용총액1 에 포함된다. (O/X)',
 '["O","X"]'::jsonb, '1',
 'X. 총액1 = trunc10(01항+02항) 만. U항(100%본인)과 W항(비급여)은 제외. 총액2 에만 U항이 추가 반영 (전자청구용). CH05 §8.',
 ARRAY['chapter:CH05','lesson:lesson-06-copayment','expansion','총액','medium']),

('CH01', 3, 'numeric',
 '다약제: A(500×1×3×7), B(300×0.5×2×5), C(250×1×4×3). 각 원미만 사사오입 후 합계 약품금액?',
 NULL, '15000',
 'A=10,500 / B=(0.5×2×5)×300=1,500 / C=(1×4×3)×250=3,000. 합=10,500+1,500+3,000 = 15,000원. CH01 §5.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','다약제','hard']),

('CH01', 1, 'multiple_choice',
 '처방전에서 보험급여 여부(insuPay)의 값 종류 중 급여 기본은?',
 '["covered","nonCovered","fullSelf","partial50"]'::jsonb, '0',
 'covered=급여(01항), nonCovered=비급여(W), fullSelf=100%본인부담(U), partial50=선별급여 50%(A). CH09 §2.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','insuPay','easy']),

('CH01', 2, 'multiple_choice',
 '외용약(external) 의 항번호 분류는?',
 '["01항(내복과 동일 분류)","02항(조제료와 동일)","별도 03항","투약일수 무관"]'::jsonb, '0',
 '외용약·내복약·주사약 모두 01항(급여)으로 분류. 복용구분(take)만 다르지 항번호는 동일. 외용+내복 병용 시 Z코드만 다름. CH01 §6.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','외용','medium']),

('CH01', 3, 'multiple_choice',
 '장려금(incentiveSum) 이 본인부담 계산에 반영되는 방식은?',
 '["총약제비에 더해진다","본인부담 기준액에서 차감된다","공단청구액에 가산된다","계산에 반영 안됨"]'::jsonb, '1',
 '장려금(저가대체약가장려금 등) = 본인부담 기준액에서 차감 후 본인부담률 적용. 총약제비 자체는 변경 없음. CH05 §1.1.',
 ARRAY['chapter:CH01','lesson:lesson-06-copayment','expansion','장려금','hard']),

('CH01', 2, 'multiple_choice',
 '약품금액 산출 시 사사오입을 "각 약품 단위"로 적용하는 이유는?',
 '["성능 최적화","합산 후 한번만 해도 동일","반올림 누적오차 방지 (법정 기준)","DB 저장 제약"]'::jsonb, '2',
 '각 약품 단위 사사오입은 법정 기준. 합산 후 한 번만 하면 누적 오차(각 약품의 반올림 누적)가 발생해 정확성 저하. CH01 §5.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','사사오입','medium']),

('CH01', 1, 'numeric',
 '단가 75원, 1회 1정, 1일 4회, 7일. 약품금액은? (원)',
 NULL, '2100',
 '75 × 1 × 4 × 7 = 2,100원. 정수 연산.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','easy']),

('CH01', 2, 'true_false',
 'PD_PACK=0 이면 포장단위 나눗셈을 적용하지 않고 원본 소모량 그대로 단가를 곱한다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. PD_PACK>0 일 때만 amount/PD_PACK 나눗셈. 0이면 건너뛰고 amount × PD_PRICE. CH01 §5.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','PD_PACK','medium']),

('CH01', 3, 'error_spot',
 '약품 3종 처방. 각 약품금액 계산 중 잘못된 단계: (1) A: 300×1×3×5 = 4,500 (2) B: 200×0.5×2×5 = 1,000 (3) C: 150×1×3×7 = 3,300 (4) 합계 8,800',
 NULL, 'step3',
 'C 재계산: 150 × 1 × 3 × 7 = 3,150 (✗ 3,300 오류). 합계 정정: 4,500 + 1,000 + 3,150 = 8,650. CH01 §5.',
 ARRAY['chapter:CH01','lesson:lesson-03-drug-amount-basics','expansion','오류찾기','hard']),

-- ============================================================
-- CH02 조제료 Z코드 체계 — 추가 15문
-- ============================================================

('CH02', 1, 'multiple_choice', 'Z1000 이 나타내는 것은?',
 '["약국관리료","조제기본료","복약지도료","의약품관리료"]'::jsonb, '0',
 'Z1000 = 약국관리료 (방문당 정액). CH02 §3-1.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z1000','easy']),

('CH02', 1, 'multiple_choice', 'Z3000 의 역할은?',
 '["약품조제료","복약지도료","약국관리료","의약품관리료"]'::jsonb, '1',
 'Z3000 = 복약지도료 (방문당 정액). 주사제만 자가투여 아닐 때 미산정.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z3000','easy']),

('CH02', 2, 'multiple_choice', 'Z코드 접미사 "000" 과 "010" 의 차이는?',
 '["000=일반, 010=야간·공휴","000=일반, 010=토요 가산","동일 (표기만 다름)","000=외용, 010=내복"]'::jsonb, '0',
 '접미사 "000"=일반, "010"=야간/공휴 복합코드, "030"=토요 별도행, "050"=공휴 단독, "600"=6세미만, "610"=6세미만+야간, "800"=외래·특수. CH02 §2.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','접미사','medium']),

('CH02', 2, 'multiple_choice', 'Z7001 이 나타내는 것은?',
 '["자가주사 Z4130","달빛어린이·복약상담료 가산","직접조제","산제 가산"]'::jsonb, '1',
 'Z7001 = 달빛어린이약국 복약상담료(심야·공휴 소아). 별도 행. CH02 §3-7.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z7001','medium']),

('CH02', 2, 'multiple_choice', '직접조제(isDirectDispensing) 시 사용되는 Z코드 계열은?',
 '["Z4xxx (일반 약품조제료)","Z4200 / Z4201 (직접조제 전용)","Z7xxx","Z5xxx"]'::jsonb, '1',
 'Z4200(내복 직접조제), Z4201(외용 직접조제), Z4220(1일), Z4221(외용 1일). 의사 직접조제 시 사용. CH02 §3-5.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','직접조제','Z4200','medium']),

('CH02', 2, 'multiple_choice', 'Z4130 이 활성화되는 조건은?',
 '["모든 주사제","자가주사제 (selfInjYN=Y)","내복약","외용약"]'::jsonb, '1',
 'Z4130 = 자가주사제 약품조제료. selfInjYN=Y 일 때만 산정. 비자가 주사제는 약품조제료 없음.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z4130','자가주사','medium']),

('CH02', 2, 'multiple_choice', '내복약+외용약 병용 처방의 약품조제료 코드 패턴은?',
 '["Z4107 (내복 단독)","Z4121 (내복+외용 병용)","Z4201 (외용 단독)","Z4103 + Z4121 중복"]'::jsonb, '1',
 'Z4121 = 내복+외용 병용 약품조제료. 내복 단독 Z41DD (DD=일수), 외용 단독 Z42xx.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z4121','medium']),

('CH02', 1, 'multiple_choice', '의약품관리료(Z5xxx) 기본 4코드 중 마약 포함 시 쓰는 코드는?',
 '["Z5000","Z5001","Z5010","Z5011"]'::jsonb, '1',
 'Z5000=일반, Z5001=마약/향정, Z5010=외용약 일수가산, Z5011=병팩. CH02 §3-4 (2026-04 정정판).',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z5001','마약','easy']),

('CH02', 2, 'multiple_choice', '외용약만 처방된 경우 의약품관리료 처리는?',
 '["Z5000 기본료만","Z5011 병팩만","Z5010 (외용 일수가산 전용)","미산정"]'::jsonb, '2',
 '외용약만일 경우 Z5010 단독 산정 (외용 일수가산 전용 코드). Z5000/Z5001 기본료 미산정.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z5010','외용','medium']),

('CH02', 2, 'numeric', '1일치 내복약 처방의 약품조제료 Z코드 번호는? (숫자만, 예: 4101)',
 NULL, '4101',
 'Z4101 = 1일 내복약조제료. Z41DD 패턴 (DD=01~15).',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z4101','medium']),

('CH02', 2, 'numeric', '10일치 내복약 처방의 약품조제료 Z코드 번호는?',
 NULL, '4110',
 'Z4110 = 10일치 내복약.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z4110','easy']),

('CH02', 3, 'multiple_choice', '30일치 내복약은 어떤 구간 코드를 사용하는가?',
 '["Z4130 (자가주사와 혼동 금지)","Z4316","Z4326 (26~30일 구간)","Z4330"]'::jsonb, '2',
 'Z4326 = 26~30일 구간. 16~20=Z4316, 21~25=Z4321, 26~30=Z4326, 31~40=Z4331, 41~50=Z4341, 51~60=Z4351, 61~70=Z4361, 71~80=Z4371, 81~90=Z4381, 91+=Z4391.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z4326','구간','hard']),

('CH02', 2, 'true_false', 'Z5xxx 의약품관리료 중 병팩(Z5011) 은 모든 급여 내복약이 pack 단위로 처방될 때만 적용된다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 모든 급여 내복약이 pack>1 인 경우 Z5011 단독 산정 후 return. 일부라도 pack=0 이면 Z5000/Z5001 기본 분기. CH02 §3-4.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z5011','병팩','medium']),

('CH02', 1, 'multiple_choice', 'Z2000 의 산정 단위는?',
 '["약품 1종당 1회","처방전 1건당 1회 (정액)","일수별 가산","무관"]'::jsonb, '1',
 'Z2000 = 조제기본료. 처방전 1건당 1회 정액 산정. 일수/품목 수 무관.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','Z2000','정액','easy']),

('CH02', 3, 'matching', 'Z코드 5개의 역할을 매칭하세요.',
 NULL, '{"l1":"r1","l2":"r2","l3":"r3","l4":"r4","l5":"r5"}',
 'Z1000=약국관리료, Z2000=조제기본료, Z3000=복약지도료, Z4xxx=약품조제료, Z5000=의약품관리료. CH02 §3.',
 ARRAY['chapter:CH02','lesson:lesson-04-dispensing-fees','expansion','매칭','hard']),

-- ============================================================
-- CH03 조제료 수가 계산 로직 — 추가 15문
-- ============================================================

('CH03', 1, 'multiple_choice', '2026년 적용 환산지수는?',
 '["99원","104.8원","105.5원","110원"]'::jsonb, '2',
 '2026년 환산지수 = 105.5원 (보건복지부 고시). 2025년은 104.8원이었음. Z코드 금액 = 점수 × 환산지수, 원미만 사사오입.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','환산지수','easy']),

('CH03', 2, 'multiple_choice', 'suga_fee 테이블의 핵심 필드는?',
 '["year, code, price, name","id, desc","chapter, num","name, rate"]'::jsonb, '0',
 'suga_fee: (apply_year, code, name, price, category) — 연도별 Z코드 단가. CH03 §2.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','suga_fee','medium']),

('CH03', 1, 'numeric', 'Z1000 약국관리료 금액이 790원. 10건의 처방 총합은? (원)',
 NULL, '7900',
 '단순 곱셈 790 × 10 = 7,900원 (방문당 정액 가정).',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','Z1000','easy']),

('CH03', 2, 'numeric', 'Z4107 점수가 41점, 환산지수 105.5일 때 금액은? (원, 사사오입)',
 NULL, '4326',
 '41 × 105.5 = 4,325.5원. 원미만 사사오입 = 4,326원. (실제 DB 에는 4,320원 등재도 있음; 문제는 공식 적용 기준)',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','사사오입','medium']),

('CH03', 2, 'multiple_choice', '주사제만 처방 + 자가투여 아닌 경우 산정되는 수가 항목은?',
 '["Z1000~Z5000 전부","약품조제료만","약가(01항)만, 조제료 모두 미산정","Z3000 복약지도료만"]'::jsonb, '2',
 '주사제만 + 비자가투여 = 조제료 전체 미산정 (Z1000~Z5000 모두). 약가(01항) 만 발생. CH03 §4.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','주사제','medium']),

('CH03', 1, 'true_false', '조제료는 처방전 1건당 정액으로 모두 동일하다. (O/X)',
 '["O","X"]'::jsonb, '1',
 'X. Z1000/Z2000/Z3000/Z5000 은 방문당 정액이나 Z4xxx(약품조제료) 는 투약일수별 변동. Z4010(산제) 등 가산도 변동.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','medium']),

('CH03', 2, 'numeric', '조제료 합: Z1000(790) + Z2000(1720) + Z3000(1150) + Z4103(2680) + Z5000(680). 합계? (원)',
 NULL, '7020',
 '790 + 1,720 + 1,150 + 2,680 + 680 = 7,020원. 3일치 내복 표준.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','합산','medium']),

('CH03', 2, 'multiple_choice', 'Z2000610 (6세미만+야간 복합) 과 Z2000 기본 사이 가산 비율은 대략?',
 '["10%","30% 수준","60% 이상 증가","2배"]'::jsonb, '2',
 'Z2000=1,720원, Z2000610=3,150원 → 1,430원 증가 ≈ 83% 증액. 6세미만+야간 복합 가산은 단일 야간보다 큰 가산 폭.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','6세미만','야간','hard']),

('CH03', 2, 'multiple_choice', '비대면 조제 (isNonFace) 시 달라지는 수가는?',
 '["Z1000 약국관리료 증액","Z3000 복약지도료 변경/감액","Z5000 변경","변화 없음"]'::jsonb, '1',
 '비대면 조제 시 Z3000 복약지도료 항목이 별도 코드(Z300x) 또는 감액 적용 가능. 상세는 환경설정에 따라. CH03 §5.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','비대면','medium']),

('CH03', 3, 'numeric', 'Z2000 점수 17점, 환산지수 105.5원. 원미만 사사오입 금액?',
 NULL, '1794',
 '17 × 105.5 = 1,793.5 → round1 → 1,794원.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','hard']),

('CH03', 2, 'multiple_choice', '조제일자 2024-07-01 고시 변경의 주요 영향은?',
 '["환산지수 일괄 인상","일부 Z코드 점수/분기 조건 변경","조제료 전면 폐지","보험유형 신설"]'::jsonb, '1',
 '2024.07.01 고시: 일부 Z코드 점수 및 특정 조건 분기 조정. 엔진은 dosDate 기준 분기. CH08 날짜분기.',
 ARRAY['chapter:CH03','lesson:lesson-09-special-cases','expansion','2024-07-01','medium']),

('CH03', 1, 'true_false', '환산지수(점수 × 원)는 매년 변경될 수 있다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 환산지수는 보건복지부 고시로 매년 조정. 2025=104.8원, 2026=105.5원 (예시 값). suga_fee 테이블의 apply_year 기준 조회.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','easy']),

('CH03', 3, 'multiple_choice', '7일치 처방에 야간 가산 적용 시 Z4xxx 코드는?',
 '["Z4107","Z4107010","Z4107030","Z4110010"]'::jsonb, '1',
 'Z4107(7일) + 010(야간) = Z4107010. 030=토요, 050=공휴, 610=6세미만+야간. CH02 §2.',
 ARRAY['chapter:CH03','lesson:lesson-04-dispensing-fees','expansion','Z4107010','hard']),

('CH03', 2, 'numeric', '달빛어린이약국 + 소아 야간 조제. Z7001(복약상담료 800원) + Z2000610(3,150원) 합? (원)',
 NULL, '3950',
 '달빛어린이 특수: Z7001 800 + Z2000610 3,150 = 3,950원. 일반 조제료와 별도 가산.',
 ARRAY['chapter:CH03','lesson:lesson-09-special-cases','expansion','달빛','hard']),

('CH03', 2, 'multiple_choice', '환산지수 × 점수 후 사사오입이 적용되는 단위는?',
 '["10원","1원 (원미만)","100원","절사 없음"]'::jsonb, '1',
 '원미만 4사5입 (Round1). 예: 11 × 105.5 = 1,160.5 → 1,161원. CH03 §2.',
 ARRAY['chapter:CH03','lesson:lesson-08-rounding-precision','expansion','Round1','medium']),

-- ============================================================
-- CH04 가산 로직 — 추가 15문
-- ============================================================

('CH04', 1, 'multiple_choice', '평일 야간 가산 적용 시간대는?',
 '["09~18시","18시~익일 09시","0~6시","22시~익일 09시"]'::jsonb, '1',
 '평일 야간 = 18시 ~ 익일 09시. 단 6세미만은 22시~09시가 별도 소아심야가산. CH04 §4-1.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','야간','easy']),

('CH04', 1, 'multiple_choice', '6세 미만 소아심야 가산 시간대는?',
 '["18~22시","22시~익일 09시 (6세 미만)","0~6시","09~18시"]'::jsonb, '1',
 '소아심야 = 22시~익일 09시 (6세 미만 한정). 일반 야간(18~익일09)과 별개이며 6세미만+야간은 복합코드 Z2000610.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','소아심야','easy']),

('CH04', 2, 'multiple_choice', '토요가산 적용 시간은?',
 '["토요일 전일 (0~24시)","토요 09~13시 (오전만)","토요 18시 이후만","토요+평일 구분 없음"]'::jsonb, '1',
 '토요가산은 토요일 09~13시 오전 조제 별도 행(접미사 030). 13시 이후는 야간 처리. CH04 §4-3.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','토요','medium']),

('CH04', 1, 'multiple_choice', '8종 기본 가산 중 "가루약(산제) 가산" 의 특징은?',
 '["1순위 (다른 가산 모두 배제)","마지막 가산","50% 증액","야간과 중복 적용"]'::jsonb, '0',
 '가루약(산제) 가산은 가산 우선순위 1순위. 다른 모든 가산(야간·토요·공휴·6세미만 소아) 을 배제. 별도 행 Z4010.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','산제','1순위','easy']),

('CH04', 2, 'multiple_choice', '가산 우선순위(1순위 → 4순위) 를 올바른 순서로 나열한 것은?',
 '["산제→소아심야→토요→야간","야간→토요→소아심야→산제","산제→야간→토요→소아심야","토요→야간→산제→소아심야"]'::jsonb, '0',
 '1위 산제 → 2위 소아심야(야간 대체) → 3위 토요 → 4위 야간. 상위가 적용되면 하위는 배제. CH04 §2.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','우선순위','medium']),

('CH04', 2, 'true_false', '공휴일 가산과 야간 가산은 동시 적용(복합코드) 될 수 있다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 공휴일+야간 동시 가산은 복합 접미사 "010" 사용 (공휴/야간 공용 코드). CH04 §4-1, §4-2.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','공휴','medium']),

('CH04', 2, 'multiple_choice', '달빛어린이약국 가산 조건은?',
 '["24시간 운영 약국","야간·공휴일 소아 조제 가능 약국","65세 이상 전용","보훈 전용"]'::jsonb, '1',
 '달빛어린이약국 = 야간·공휴일 소아 대응 약국. Z7001(복약상담) + Z2000610(6세미만+야간) 조합. CH04 §4-6.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','달빛','medium']),

('CH04', 2, 'multiple_choice', '명절 가산 Z코드는?',
 '["ZE100","ZH001","ZE010","ZE030"]'::jsonb, '0',
 'ZE100 = 명절가산 전용 코드. 설·추석 당일 및 고시된 명절기간. CH04 §4-7, CH08.',
 ARRAY['chapter:CH04','lesson:lesson-09-special-cases','expansion','명절','ZE100','medium']),

('CH04', 2, 'true_false', '6세미만 환자의 본인부담률 21%(=30%×70%) 는 가산과 별개로 항상 적용된다. (O/X)',
 '["O","X"]'::jsonb, '0',
 'O. 6세미만 부담률 경감(21%)은 보험료율 규칙으로, 조제료 가산(산제 등)이 배제되어도 본인부담률은 유지. CH05 §3.',
 ARRAY['chapter:CH04','lesson:lesson-06-copayment','expansion','6세미만','21%','medium']),

('CH04', 3, 'multiple_choice', '자동차보험(F10) M_AddRat 할증 계산식은?',
 '["Round1(totalPrice × addRat/100)","Math.floor(totalPrice × addRat/100) (int 절사)","totalPrice × addRat","addRat 원 고정"]'::jsonb, '1',
 'CH04 §4-9 M_AddRat: premium = floor(totalPrice × addRat / 100). int 절사, round1(사사오입) 아님. Phase 7 A3 정정.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','M_AddRat','자보','hard']),

('CH04', 3, 'numeric', '자보 F10 총액 12,345원, addRat=20%. 할증액(premium)은? (원)',
 NULL, '2469',
 'floor(12,345 × 20 / 100) = floor(2,469) = 2,469원. CH04 §4-9.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','M_AddRat','hard']),

('CH04', 2, 'multiple_choice', '직접조제(isDirectDispensing) 시 변경되는 조제료 구성은?',
 '["Z4xxx → Z4200/Z4201 (직접조제 전용)","모든 조제료 50% 감액","가산 불가","전액 면제"]'::jsonb, '0',
 '직접조제 시 Z4xxx(일반 약품조제료) → Z4200/Z4201(직접조제 전용). 약국관리료·복약지도료는 미산정. CH04 §4-5.',
 ARRAY['chapter:CH04','lesson:lesson-09-special-cases','expansion','직접조제','medium']),

('CH04', 3, 'error_spot', '가산 판정 순서 중 오류: (1) 산제=Y → 가루약 적용 (2) 야간+6세미만 → Z2000610 (3) 토요+야간 → 둘 다 적용 (4) 산제+야간 → 산제만 적용',
 NULL, 'step3',
 'Step 3 오류: 토요+야간 동시 발생 시 우선순위 높은 토요가산만 적용. 둘 다 적용 X. CH04 §2.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','우선순위','hard']),

('CH04', 1, 'multiple_choice', '공휴일 여부 판정 데이터 소스는?',
 '["Z코드 자체","holiday 테이블 (DB 조회)","하드코딩된 상수","조제시간 분석"]'::jsonb, '1',
 'holiday 테이블에서 해당 dosDate 가 공휴일/명절 여부 조회. CH04 §4-2.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','holiday','easy']),

('CH04', 2, 'matching', '가산 유형과 Z코드 접미사 매칭',
 NULL, '{"l1":"r1","l2":"r2","l3":"r3","l4":"r4"}',
 '야간/공휴=010, 토요=030, 공휴단독=050, 6세미만+야간=610. 기본=000.',
 ARRAY['chapter:CH04','lesson:lesson-05-surcharge-rules','expansion','매칭','접미사','medium']);

-- ────────────────────────────────────────
-- payload 업데이트 (matching / error_spot / ordering)
-- ────────────────────────────────────────

UPDATE quiz_question
SET payload = '{"left":[{"id":"l1","label":"Z1000"},{"id":"l2","label":"Z2000"},{"id":"l3","label":"Z3000"},{"id":"l4","label":"Z4xxx"},{"id":"l5","label":"Z5000"}],"right":[{"id":"r1","label":"약국관리료"},{"id":"r2","label":"조제기본료"},{"id":"r3","label":"복약지도료"},{"id":"r4","label":"약품조제료(일수별)"},{"id":"r5","label":"의약품관리료"}]}'::jsonb
WHERE question_type = 'matching' AND 'expansion' = ANY(tags) AND chapter = 'CH02' AND question LIKE 'Z코드 5개의 역할%';

UPDATE quiz_question
SET payload = '{"left":[{"id":"l1","label":"야간/공휴 복합"},{"id":"l2","label":"토요가산 별도행"},{"id":"l3","label":"공휴일 단독"},{"id":"l4","label":"6세미만 + 야간"}],"right":[{"id":"r1","label":"010"},{"id":"r2","label":"030"},{"id":"r3","label":"050"},{"id":"r4","label":"610"}]}'::jsonb
WHERE question_type = 'matching' AND 'expansion' = ANY(tags) AND chapter = 'CH04' AND question LIKE '가산 유형과%';

UPDATE quiz_question
SET payload = '{"steps":[{"id":"step1","label":"약품A","value":"4,500원"},{"id":"step2","label":"약품B","value":"1,000원"},{"id":"step3","label":"약품C","value":"3,300원 (오류 가능)"},{"id":"step4","label":"합계","value":"8,800원"}]}'::jsonb
WHERE question_type = 'error_spot' AND 'expansion' = ANY(tags) AND chapter = 'CH01' AND question LIKE '약품 3종 처방%';

UPDATE quiz_question
SET payload = '{"steps":[{"id":"step1","label":"산제=Y → 가루약","value":"OK"},{"id":"step2","label":"야간+6세미만 → Z2000610","value":"OK"},{"id":"step3","label":"토요+야간 → 둘 다","value":"검산"},{"id":"step4","label":"산제+야간 → 산제만","value":"OK"}]}'::jsonb
WHERE question_type = 'error_spot' AND 'expansion' = ANY(tags) AND chapter = 'CH04' AND question LIKE '가산 판정 순서%';
