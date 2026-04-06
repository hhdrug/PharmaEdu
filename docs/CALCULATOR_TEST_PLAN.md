# CALCULATOR_TEST_PLAN.md
# 팜에듀 계산 엔진 — Phase 4 QA 테스트 플랜

> **작성**: QA Planner (Phase 5, Expert #2)
> **작성일**: 2026-04-06
> **대상**: Phase 4 QA 전담 팀
> **참조 문서**:
> - `CH11_테스트_시나리오.md` — 10개 시나리오 상세 계산 (S01~S10)
> - `YakjaebiCalc.TestApp/MainWindow.xaml.cs` — 19개 시나리오 WPF 정의 (실제 입력값)
> - `docs/CALCULATOR_ARCHITECTURE.md` — Phase 5 확장 아키텍처

---

## 1. 테스트 전략 개요

### 1-1. 테스트 레이어 구분

| 레이어 | 종류 | 도구 | 책임 영역 |
|--------|------|------|----------|
| 단위 테스트 (Unit Test) | 모듈별 함수 독립 검증 | Vitest | `rounding.ts`, `drug-amount.ts`, 각 보험모듈 |
| 통합 테스트 (Integration Test) | calculate() 전체 파이프라인 | Vitest + Mock Repo | S01~S19 시나리오 전수 검증 |
| E2E 테스트 | UI → 계산 → 화면 출력 | Playwright (선택) | `/learn/ch11` 계산기 페이지 |
| 회귀 테스트 (Regression) | 기존 동작 불변 확인 | Vitest | S01 고정값 + 13개 챕터 + 퀴즈 |

### 1-2. 검증 기준 (합격 조건)

1. **1원 단위 일치**: 모든 금액 필드(sumInsuDrug, sumWage, totalPrice, userPrice, insuPrice, mpvaPrice)가 기대값과 1원 단위까지 정확히 일치해야 한다.
2. **합계 항등식 성립**: 아래 등식이 반드시 성립해야 한다.
   - 일반 처방: `totalPrice = userPrice + insuPrice`
   - 보훈감면 처방: `totalPrice = mpvaPrice + userPrice + insuPrice`
   - 혼합보험 처방: `totalPrice2 = totalPrice + sumInsuDrug100`
3. **반올림 규칙 일치**: CH07 규칙(사사오입, trunc10, trunc100)이 각 단계에서 정확히 적용되어야 한다.
4. **WageList 구조 검증**: 조제료 명세의 Z코드, 수량, 단가, 합계가 기대 구조와 일치해야 한다.

### 1-3. 기준 데이터 (2026년 EDB Mock 수가)

**조제료 수가 단가 (점수 × 105.5원 → 10원 단위 사사오입)**

| Z코드 | 단가(원) | 명칭 |
|-------|---------|------|
| Z1000 | 790 | 약국관리료 |
| Z2000 | 1,720 | 기본조제료 |
| Z2000010 | 2,240 | 기본조제료(야간) |
| Z2000030 | 520 | 기본조제료(토요가산) |
| Z2000600 | 2,420 | 기본조제료(6세미만) |
| Z2000610 | 3,150 | 기본조제료(6세미만+야간) |
| Z3000 | 1,150 | 복약지도료 |
| Z3000010 | 1,500 | 복약지도료(야간) |
| Z3000030 | 340 | 복약지도료(토요가산) |
| Z4103 | 2,680 | 내복약조제료(3일) |
| Z4103030 | 800 | 내복약조제료(3일+토요가산) |
| Z4107 | 4,320 | 내복약조제료(7일) |
| Z4107010 | 5,620 | 내복약조제료(7일+야간) |
| Z4107030 | 1,300 | 내복약조제료(7일+토요가산) |
| Z4010 | 800 | 산제가산 |
| Z4120 | 1,710 | 외용약조제료(단독) |
| Z4121 | 640 | 외용약조제료(내복병용) |
| Z5000 | 680 | 의약품관리료 |
| Z7001 | 별도 조회 | 복약상담료(달빛어린이) |

> **주의**: WPF TestApp 기준 S01 조제료 합계는 **9,210원** (CH11 문서의 8,660원과 다름). 이는 WPF가 실제 EDB Mock DB를 참조하고 CH11은 일부 수가를 단순화한 것이다. Phase 4 QA는 WPF 실행 결과를 1차 기준값으로 삼고, CH11 계산 결과를 로직 검증용으로 병행 참조한다.

**보험요율 파라미터**

| 코드 | Rate(%) | SixAgeRate(%) | FixCost(원) | Mcode(원) | Bcode(원) |
|------|:-------:|:-------------:|:-----------:|:---------:|:---------:|
| C10 | 30 | 50 | 1,500 | 0 | 0 |
| D10 | 0 | 0 | 0 | 1,000 | 1,500 |
| D20 | 15 | 0 | 500 | 0 | 0 |
| G10 | 0 | 0 | 0 | 0 | 0 |

---

## 2. 알려진 법령/EDB 불일치 사항 (테스트 시 유의)

| # | 항목 | EDB Mock 값 | 법령 기준 | 관련 시나리오 | 엔진 채택 기준 |
|---|------|------------|----------|-------------|--------------|
| 1 | 65세 정액 | FixCost = 1,500원 | 1,000원 (시행령 별표2) | S04 | DB 파라미터 우선 |
| 2 | 6세미만 부담률 | SixAgeRate=50 → 15% | 약국 21% (시행령 별표2 다목3) | S03, S05, S10 | 법령 기준(21%) 권장 |
| 3 | 의료급여1종 정액 | Mcode = 1,000원 | 500원 (의료급여법 시행령 별표1) | S06 | DB 파라미터 우선 |

> QA 담당자는 위 불일치 시나리오에서 **양쪽 값 모두** 기록하고, 엔진이 채택한 기준을 명시하여 Pass/Fail을 판정한다.

---

## 3. 시나리오 상세 명세 (S01 ~ S19)

---

### S01 — 일반 건보 내복약 3일 (C10, 45세)

**목적**: 기본 파이프라인 전체 흐름 검증. 약품금액 → 조제료 → 총액 → 본인부담 → 청구액의 정확한 연산과 trunc10/trunc100 적용 순서 확인.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| 조제일자 (dosDate) | 20260403 |
| 보험코드 (insuCode) | C10 |
| 보훈코드 (bohunCode) | (없음) |
| 나이 (age) | 45 |
| 성별 | 무관 |
| isNight | false |
| isSaturday | false |
| isHolyDay | false |
| isMidNight | false |
| isDirectJoje | false |
| moonYn | "0" |
| powderYn | "N" |
| sbrdnType | (없음) |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType | element |
|------|-------|------|------|------|----------|----------|---------|
| 648901070 | 500 | 1 | 3 | 3 | true | Internal | "       ATB" |
| 648902080 | 300 | 1 | 3 | 3 | true | Internal | "" |

**기대 결과 (WPF 기준)**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug (약품금액 01항) | 7,200원 | (500×1×3×3)+(300×1×3×3) |
| sumWage (조제료 02항) | 9,210원 | WPF EDB Mock 실측 |
| totalPrice (요양급여비용총액1) | 계산값 | trunc10(sumInsuDrug + sumWage) |
| userPrice (본인일부부담금) | 계산값 | trunc100(totalPrice × 0.30) |
| insuPrice (청구액) | 계산값 | totalPrice - userPrice |

> **CH11 참조 기대값** (단일약품 500원 7일 기준): sumInsuDrug=10,500 / sumWage=8,660 / totalPrice=19,160 / userPrice=5,700 / insuPrice=13,460. WPF 2약품 3일 기준과 약품 구성이 다르므로 직접 비교 불가.

**검증 포인트**

- [ ] 약품금액 = `(int)(dose × dnum × dday × price + 0.5)` 정수 연산 오류 없는지
- [ ] Z4103(3일) 코드 선택 (Z4107 아님)
- [ ] trunc10 적용: 총액1 10원 미만 절사
- [ ] trunc100 적용: 본인부담 100원 미만 절사
- [ ] 합계 항등식: totalPrice = userPrice + insuPrice

**관련 모듈**: `drug-amount.ts`, `dispensing-fee.ts`, `copayment.ts`

---

### S02 — 7일 내복+외용 복합 (C10, 35세)

**목적**: 내복약+외용약 혼합 처방에서 외용약 조제료 코드(Z4121 내복병용) 선택과 조제료 합산 로직 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| 조제일자 | 20260403 |
| insuCode | C10 |
| age | 35 |
| 모든 가산 플래그 | false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 800 | 1 | 3 | 7 | true | Internal |
| 648902080 | 450 | 1 | 3 | 7 | true | Internal |
| 670400020 | 1200 | 1 | 1 | 7 | true | External |

**기대 결과**

| 필드 | 기대값 (WPF 실행 기준) | 비고 |
|------|----------------------|------|
| sumInsuDrug | 26,100원 | (800+450)×3×7 + 1200×1×7 |
| sumWage | 실행 후 기록 | Z4107+Z4121+Z1000+Z2000+Z3000+Z5000 |
| totalPrice | 실행 후 기록 | trunc10(sumInsuDrug + sumWage) |
| userPrice | 실행 후 기록 | trunc100(totalPrice × 0.30) |
| insuPrice | 실행 후 기록 | totalPrice - userPrice |

**검증 포인트**

- [ ] 내복약+외용약 동시 → Z4121(내복병용 외용약 조제료 640원) 사용
- [ ] Z4120(외용약 단독, 1,710원)이 아닌 Z4121 선택 확인
- [ ] 내복약 일수(7일) 기준 Z4107 선택
- [ ] 합계 항등식 성립

**관련 모듈**: `drug-amount.ts`, `dispensing-fee.ts`, `copayment.ts`

---

### S03 — 급여+비급여 혼합 (C10, 40세)

**목적**: 급여(01항)와 비급여(W항)가 혼합될 때 항번호 분리, 총액1 산정(비급여 제외), 환자 실부담 합계 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | C10 |
| age | 40 |
| 모든 가산 플래그 | false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | insuPay | takeType |
|------|-------|------|------|------|----------|---------|----------|
| 648901070 | 500 | 1 | 3 | 5 | true | Covered | Internal |
| 999900001 | 3000 | 1 | 1 | 5 | false | NonCovered | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug (01항) | 7,500원 | 500×1×3×5 |
| sumUserDrug (W항 비급여) | 15,000원 | 3000×1×1×5 |
| sumWage (02항) | 실행 후 기록 | 급여 기준 조제료 |
| totalPrice | 실행 후 기록 | trunc10(01항 + 02항) — W항 제외 |
| userPrice | 실행 후 기록 | trunc100(totalPrice × 0.30) |
| insuPrice | 실행 후 기록 | totalPrice - userPrice |

**검증 포인트**

- [ ] W항(비급여) 금액이 totalPrice(총액1) 산정에서 **제외**
- [ ] 비급여 조제료 처리 방식 확인 (차액 없으면 0원)
- [ ] 환자 실부담 = userPrice + sumUserDrug
- [ ] 합계 항등식: totalPrice = userPrice + insuPrice

**관련 모듈**: `drug-amount.ts`, `dispensing-fee.ts`, `copayment.ts`

---

### S04 — 65세 이상 저액 정액 (C10, 72세)

**목적**: 65세 이상 + 총액1 ≤ 10,000원 조건에서 정액(FixCost) 분기 진입 검증. 정률(30%) 적용 오류 방지.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | C10 |
| age | 72 |
| 모든 가산 플래그 | false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 200 | 1 | 2 | 3 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 1,200원 | 200×1×2×3 |
| sumWage | 실행 후 기록 | Z4103+Z1000+Z2000+Z3000+Z5000 |
| totalPrice | 실행 후 기록 | 예상 ~8,200원 (≤10,000 조건 충족) |
| userPrice | **1,500원** (EDB) / 1,000원 (법령) | FixCost 정액 |
| insuPrice | totalPrice - userPrice | |

**검증 포인트**

- [ ] 72세 ≥ 65 AND totalPrice ≤ 10,000원 → **정액 분기** 진입 (Rate 30% 아님)
- [ ] FixCost 값이 DB 파라미터에서 조회되는지 (하드코딩 아님)
- [ ] 총액1이 10,000~12,000원 사이라면 → 20% 정률 분기 별도 테스트
- [ ] 총액1이 12,000원 초과라면 → 30% 정률 분기 별도 테스트
- [ ] 합계 항등식 성립

**관련 모듈**: `copayment.ts`

---

### S05 — 6세미만 소아 (C10, 3세)

**목적**: 6세미만 기본조제료(Z2000600) 코드 선택, 소아 본인부담률(21% 법령 / 15% EDB) 경감 분기 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | C10 |
| age | 3 |
| isNight | false |
| 기타 가산 | false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 400 | 0.5 | 3 | 3 | true | Internal |
| 648902080 | 300 | 0.5 | 3 | 3 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 1,050원 | (400×0.5+300×0.5)×3×3 = (200+150)×9 |
| sumWage | 실행 후 기록 | Z2000600 포함 |
| totalPrice | 실행 후 기록 | |
| userPrice | trunc100(totalPrice×0.21) | 법령 21% 기준 |
| insuPrice | totalPrice - userPrice | |

**검증 포인트**

- [ ] 3세 → Z2000600(기본조제료 6세미만, 2,420원) 선택 (Z2000(1,720) 아님)
- [ ] 0.5정 사사오입: `(int)(0.5×3×3×400 + 0.5) = (int)(1800.5) = 1800` ← 정수이므로 변화 없음
- [ ] 본인부담률 21% 분기 진입 (30% 아님)
- [ ] 합계 항등식 성립

**관련 모듈**: `drug-amount.ts`, `dispensing-fee.ts`, `copayment.ts`

---

### S06 — 의료급여 1종 (D10, 55세)

**목적**: 의료급여 1종 + sbrdnType 미지정(기본 M코드) → Mcode 정액 본인부담 분기. Rate=0%이지만 본인부담 > 0인 케이스.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | D10 |
| age | 55 |
| sbrdnType | (기본 — 빈 문자열, M코드 적용) |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 600 | 1 | 3 | 5 | true | Internal |
| 648902080 | 350 | 1 | 3 | 5 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 14,250원 | (600+350)×3×5 |
| sumWage | 실행 후 기록 | 5일 내복약 조제료 |
| totalPrice | 실행 후 기록 | |
| userPrice | **1,000원** (Mcode, EDB) / 500원 (법령) | 정액 |
| insuPrice | totalPrice - userPrice | |

**검증 포인트**

- [ ] D10 + sbrdnType="" → Mcode 정액 분기 진입
- [ ] Rate=0%이지만 정액 Mcode 적용으로 본인부담 > 0
- [ ] 의료급여 정액이므로 trunc100이 아닌 정액 그대로 사용
- [ ] sbrdnType="B" 케이스 → Bcode(1,500원) 별도 테스트 권장
- [ ] 합계 항등식 성립

**관련 모듈**: `copayment.ts` (현재), `insurance/medical-aid.ts` (Phase 5 확장)

---

### S07 — 보훈 M10 전액면제 (C10+M10, 70세)

**목적**: 보훈코드 M10(전액면제) 적용 시 userPrice=0, mpvaPrice=totalPrice인 3자배분 로직 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | C10 |
| bohunCode | M10 |
| age | 70 |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 800 | 1 | 3 | 7 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 16,800원 | 800×1×3×7 |
| sumWage | 실행 후 기록 | 7일 내복 조제료 |
| totalPrice | 실행 후 기록 | |
| userPrice | **0원** | M10 전액면제 |
| mpvaPrice | totalPrice | 보훈청 전액 청구 |
| insuPrice | 0원 | |

**검증 포인트**

- [ ] M10 코드 → 전액면제 분기 (userPrice=0)
- [ ] mpvaPrice = totalPrice (보훈청이 전액 부담)
- [ ] 70세이지만 65세 정액 분기가 보훈 분기보다 우선 적용되지 않는지 확인
- [ ] 보훈감면 적용 시 Z1000/Z2000/Z3000 → 0원 처리 여부 (M10 전액면제 시 해당 없음, M60 감면 시 적용)
- [ ] 합계 항등식: totalPrice = mpvaPrice + userPrice + insuPrice

**관련 모듈**: `insurance/veteran.ts` (Phase 5 신규)

---

### S08 — 야간+토요 가산 (C10, 45세)

**목적**: 야간 가산과 토요 가산이 동시에 적용될 때 코드 선택 로직 (야간 우선 vs. 토요 별도 행 분리) 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | C10 |
| age | 45 |
| isNight | **true** |
| isSaturday | **true** |
| 기타 가산 | false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 500 | 1 | 3 | 3 | true | Internal |
| 648902080 | 300 | 1 | 3 | 3 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 7,200원 | (500+300)×3×3 |
| sumWage | 실행 후 기록 | 야간+토요 복합 가산 |
| totalPrice | 실행 후 기록 | |
| userPrice | trunc100(totalPrice×0.30) | |
| insuPrice | totalPrice - userPrice | |

**WageList 기대 구조** (야간 우선 적용 시):

| Z코드 | 역할 |
|-------|------|
| Z1000 | 약국관리료 |
| Z2000010 | 기본조제료(야간) — 야간 코드 대체 |
| Z2000030 | 기본조제료(토요가산) — 별도 행 |
| Z3000010 | 복약지도료(야간) |
| Z3000030 | 복약지도료(토요가산) — 별도 행 |
| Z4103010 또는 Z4103 | 내복약조제료(3일) |
| Z4103030 | 내복약조제료(토요가산) — 별도 행 |
| Z5000 | 의약품관리료 |

**검증 포인트**

- [ ] 야간+토요 동시 → 기본코드는 야간 코드(010 접미사)로 대체
- [ ] 토요가산(030 접미사)은 별도 행으로 추가 (코드 대체가 아님)
- [ ] Z1000, Z5000에는 토요가산 없음
- [ ] 합계 항등식 성립

**관련 모듈**: `dispensing-fee.ts`, `surcharges/saturday-split.ts` (Phase 5)

---

### S09 — 산재 요양급여 (E10, 40세)

**목적**: 산재보험 E10 코드에서 본인부담 = 0원(전액 공단 부담) 로직 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | E10 |
| age | 40 |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 500 | 1 | 3 | 5 | true | Internal |
| 648902080 | 300 | 1 | 3 | 5 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 12,000원 | (500+300)×3×5 |
| sumWage | 실행 후 기록 | 5일 내복 조제료 |
| totalPrice | 실행 후 기록 | |
| userPrice | **0원** | 산재 전액 면제 |
| insuPrice | totalPrice | |

**검증 포인트**

- [ ] E10 코드 → userPrice = 0 분기 진입
- [ ] 조제료 계산은 건강보험과 동일하게 수행
- [ ] insuPrice = totalPrice (전액 청구)
- [ ] 합계 항등식 성립

**관련 모듈**: `insurance/workers-comp.ts` (Phase 5 신규)

---

### S10 — 자동차보험 (F10, 35세)

**목적**: 자동차보험 F10 코드에서 전액 본인부담(환자 직접 납부) 또는 할증 적용 로직 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | F10 |
| age | 35 |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 800 | 1 | 3 | 7 | true | Internal |
| 648902080 | 450 | 1 | 3 | 7 | true | Internal |
| 648903090 | 300 | 1 | 3 | 7 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 32,550원 | (800+450+300)×3×7 |
| sumWage | 실행 후 기록 | 7일 내복 조제료 |
| totalPrice | 실행 후 기록 | |
| userPrice | **totalPrice** | 자동차보험 전액 본인부담 |
| insuPrice | **0원** | 공단 청구 없음 |

**검증 포인트**

- [ ] F10 코드 → 전액 본인부담 분기 (userPrice = totalPrice)
- [ ] insuPrice = 0 확인
- [ ] 할증율(addRat) > 0인 경우 premium 계산 별도 테스트
- [ ] 합계 항등식 성립

**관련 모듈**: `insurance/auto-insurance.ts` (Phase 5 신규)

---

### S11 — 산재 후유증 (E20, 50세)

**목적**: 산재보험 E20(후유증) 코드에서도 E10과 동일하게 본인부담 = 0원임을 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | E20 |
| age | 50 |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 600 | 1 | 3 | 3 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 5,400원 | 600×1×3×3 |
| sumWage | 실행 후 기록 | 3일 내복 조제료 |
| userPrice | **0원** | E계열 전액 면제 |
| insuPrice | totalPrice | |

**검증 포인트**

- [ ] E20도 E10과 동일하게 workers-comp 분기 적용
- [ ] 합계 항등식 성립

**관련 모듈**: `insurance/workers-comp.ts` (Phase 5 신규)

---

### S12 — 보훈위탁 G20+M10 (75세)

**목적**: G20(보훈위탁 요양기관) + M10(전액면제) 조합에서 전액 보훈청 부담 로직 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | G20 |
| bohunCode | M10 |
| age | 75 |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 800 | 1 | 3 | 7 | true | Internal |
| 648902080 | 350 | 1 | 3 | 7 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 24,150원 | (800+350)×3×7 |
| sumWage | 실행 후 기록 | |
| userPrice | **0원** | M10 전액면제 |
| mpvaPrice | totalPrice | 보훈청 전액 부담 |
| insuPrice | **0원** | |

**검증 포인트**

- [ ] G20 + M10 → 보훈 전액면제 분기
- [ ] G계열은 Rate 조회 로직이 C계열과 다른지 확인
- [ ] 75세 이상이지만 보훈 분기가 우선 적용되는지 확인
- [ ] 합계 항등식: totalPrice = mpvaPrice + 0 + 0

**관련 모듈**: `insurance/veteran.ts` (Phase 5 신규)

---

### S13 — 직접조제 (C10, 45세)

**목적**: 직접조제(isDirectJoje=true) 시 Z4200/Z4201 코드 사용 및 일수 배수 계산 로직 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | C10 |
| age | 45 |
| isDirectJoje | **true** |
| 기타 가산 | false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 500 | 1 | 3 | 3 | true | Internal |
| 648902080 | 300 | 1 | 3 | 3 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 7,200원 | (500+300)×3×3 |
| sumWage | 실행 후 기록 | Z4200 계열 |
| userPrice | trunc100(totalPrice×0.30) | C10 30% |
| insuPrice | totalPrice - userPrice | |

**WageList 기대 구조**:

| Z코드 | 역할 |
|-------|------|
| Z1000 | 약국관리료 |
| Z2000 | 기본조제료 |
| Z3000 | 복약지도료 |
| Z4200 | **직접조제 내복약** (Z4103 대체) |
| Z5000 | 의약품관리료 |

**검증 포인트**

- [ ] isDirectJoje=true → Z4103/Z4107이 아닌 Z4200 계열 사용
- [ ] 직접조제 일수 배수(일수 × 단가) 계산 정확성
- [ ] 외용약 직접조제 시 Z4201 사용 (별도 테스트)
- [ ] 합계 항등식 성립

**관련 모듈**: `modes/direct-dispensing.ts` (Phase 5 신규)

---

### S14 — 달빛어린이 (C10, 5세, 야간)

**목적**: 달빛어린이약국(moonYn="1") + 야간 조건에서 Z7001(복약상담료) 추가 및 야간 6세미만 가산 적용 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | C10 |
| age | 5 |
| isNight | **true** |
| moonYn | **"1"** |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 400 | 0.5 | 3 | 3 | true | Internal |
| 648902080 | 300 | 0.5 | 3 | 3 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 1,050원 | (400×0.5+300×0.5)×3×3 |
| sumWage | 실행 후 기록 | Z2000610 + Z7001 포함 |
| userPrice | trunc100(totalPrice×0.21) | 6세미만 21% |
| insuPrice | totalPrice - userPrice | |

**WageList 기대 추가 항목**:
- Z7001 (복약상담료) 행이 추가되어야 함
- Z2000610 (기본조제료 6세미만+야간) 사용

**검증 포인트**

- [ ] moonYn="1" + isNight=true → Z7001 추가 행 생성
- [ ] 5세 + 야간 → Z2000610(6세미만+야간 복합) 선택
- [ ] Z7001 단가는 DB에서 조회 (하드코딩 아님)
- [ ] 합계 항등식 성립

**관련 모듈**: `modes/counseling.ts` (Phase 5 신규), `dispensing-fee.ts`

---

### S15 — 보훈 M60+야간 (G10, 60세)

**목적**: G10(보훈 직접) + M60(60% 감면) + 야간 가산 복합 적용. 보훈감면 조제료 처리와 야간 가산의 상호작용 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | G10 |
| bohunCode | M60 |
| age | 60 |
| isNight | **true** |
| 기타 가산 | false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 800 | 1 | 3 | 7 | true | Internal |
| 648902080 | 350 | 1 | 3 | 7 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 24,150원 | (800+350)×3×7 |
| sumWage | 실행 후 기록 | 야간가산 적용 + Z1/Z2/Z3 → 0원 처리 |
| totalPrice | 실행 후 기록 | |
| mpvaPrice | totalPrice × 0.60 | 보훈청 60% 부담 |
| userPrice | trunc100((totalPrice - mpvaPrice) × 0.30) | 잔여액의 30% |
| insuPrice | totalPrice - mpvaPrice - userPrice | |

**CH11 유사 계산 참조 (S07 기준 60% 감면)**:
- Z1000/Z2000/Z3000 → 0원 (보훈감면 적용)
- Z4107010(야간 내복) + Z5000은 유지
- 총액1 계산 후 60% 감면 → 3자 배분

**검증 포인트**

- [ ] M60 → 60% 감면율 적용
- [ ] 보훈감면 시 Z1000/Z2000/Z3000 → 0원, Z4107/Z5000 유지
- [ ] 야간 가산이 보훈감면 이후에도 Z4107010으로 적용되는지
- [ ] 3자 배분 항등식: totalPrice = mpvaPrice + userPrice + insuPrice

**관련 모듈**: `insurance/veteran.ts` (Phase 5 신규)

---

### S16 — 의료급여 2종+65세 (D20, 70세)

**목적**: 의료급여 2종(D20)에서 65세 정액 조건이 건강보험과 다르게 처리되는지, D20 Rate(15%) 정률과 정액 중 어떤 분기가 적용되는지 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | D20 |
| age | 70 |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 500 | 1 | 3 | 3 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 4,500원 | 500×1×3×3 |
| sumWage | 실행 후 기록 | 3일 내복 조제료 |
| totalPrice | 실행 후 기록 | 예상 ~13,700원 |
| userPrice | 500원 (FixCost, EDB) 또는 trunc10(totalPrice×0.15) | D20 규칙 확인 필요 |
| insuPrice | totalPrice - userPrice | |

**검증 포인트**

- [ ] D20 + 70세 → 의료급여 65세 정액(FixCost=500원) vs. 15% 정률 분기 결정
- [ ] D20의 FixCost=500원 파라미터가 C10의 1,500원과 별도 설정인지
- [ ] 의료급여 본인부담은 trunc10(10원 절사) 적용
- [ ] 합계 항등식 성립

**관련 모듈**: `insurance/medical-aid.ts` (Phase 5 신규)

---

### S17 — 의료급여 B014 30% 정률 (D10, 50세)

**목적**: 의료급여 1종이지만 sbrdnType="B014"(희귀질환 등 특정 수급권자)인 경우 30% 정률 적용 분기 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | D10 |
| age | 50 |
| sbrdnType | **"B014"** |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 600 | 1 | 3 | 5 | true | Internal |
| 648902080 | 350 | 1 | 3 | 5 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 14,250원 | (600+350)×3×5 |
| sumWage | 실행 후 기록 | 5일 내복 조제료 |
| totalPrice | 실행 후 기록 | |
| userPrice | trunc10(totalPrice × 0.30) | B014 → 30% 정률, 의료급여 절사 trunc10 |
| insuPrice | totalPrice - userPrice | |

**검증 포인트**

- [ ] D10 + sbrdnType="B014" → 정률 30% 분기 (Mcode 정액 아님)
- [ ] 의료급여 본인부담 절사는 trunc10 (건보 trunc100과 다름)
- [ ] B014 외 다른 특정 sbrdnType(B030, V103 등) 분기 구분
- [ ] 합계 항등식 성립

**관련 모듈**: `insurance/medical-aid.ts` (Phase 5 신규)

---

### S18 — 행려 8종 D80 (D80, 40세)

**목적**: 행려환자(의료급여종별 8종, D80) 코드에서 본인부담 = 0원(전액 국가 부담) 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | D80 |
| age | 40 |
| 가산 플래그 | 모두 false |
| powderYn | "N" |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType |
|------|-------|------|------|------|----------|----------|
| 648901070 | 500 | 1 | 3 | 3 | true | Internal |
| 648902080 | 300 | 1 | 3 | 3 | true | Internal |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 7,200원 | (500+300)×3×3 |
| sumWage | 실행 후 기록 | 3일 내복 조제료 |
| userPrice | **0원** | 행려 전액 면제 |
| insuPrice | totalPrice | |

**검증 포인트**

- [ ] D80 → userPrice = 0 (행려 전액면제)
- [ ] D계열이지만 Mcode/Bcode 적용 안 되는 예외 분기
- [ ] 합계 항등식 성립

**관련 모듈**: `insurance/medical-aid.ts` (Phase 5 신규)

---

### S19 — 산제 가루약 ATB (C10, 8세)

**목적**: 산제여부(powderYn="Y") + ATB 성분 + 8세 조건에서 Z4010 산제가산 별도 행 추가, 다른 가산 배제 로직 검증.

**입력 (CalcOptions)**

| 파라미터 | 값 |
|---------|-----|
| insuCode | C10 |
| age | 8 |
| powderYn | **"Y"** |
| 가산 플래그 | 모두 false |

**약품 리스트**

| code | price | dose | dnum | dday | insuDrug | takeType | isPowder | element |
|------|-------|------|------|------|----------|----------|----------|---------|
| 648901070 | 600 | 1 | 3 | 3 | true | Internal | "1" | "      ATB" |
| 648902080 | 400 | 1 | 3 | 3 | true | Internal | "1" | "" |

**기대 결과**

| 필드 | 기대값 | 비고 |
|------|--------|------|
| sumInsuDrug | 9,000원 | (600+400)×1×3×3 |
| sumWage | 실행 후 기록 | Z4010(800원) 포함 |
| userPrice | trunc100(totalPrice × 0.30) | 8세 → 일반 30% |
| insuPrice | totalPrice - userPrice | |

**WageList 기대 구조**:

| Z코드 | 역할 |
|-------|------|
| Z1000 | 약국관리료 |
| Z2000 | 기본조제료(일반 — 야간/6세미만 코드 아님) |
| Z3000 | 복약지도료(일반) |
| Z4103 | 내복약조제료(3일, 일반) |
| **Z4010** | **산제가산 — 별도 행** |
| Z5000 | 의약품관리료 |

**검증 포인트**

- [ ] powderYn="Y" → Z4010(800원) 별도 행 추가
- [ ] 산제 가산 시 내복약조제료는 일반 코드 Z4103 유지 (야간 코드 대체 아님)
- [ ] 8세는 6세 이상이므로 Z2000600 아닌 Z2000 사용
- [ ] ATB 성분 표시(element) 처리 확인
- [ ] 합계 항등식 성립

**관련 모듈**: `surcharges/powder.ts` (Phase 5 신규)

---

## 4. 시나리오 목록 요약 (19개)

| ID | 제목 | 보험코드 | 나이 | 핵심 검증 로직 | 기대값 출처 |
|----|------|---------|------|--------------|-----------|
| S01 | 일반 3일 내복약 | C10 | 45 | 기본 파이프라인 전체 | WPF 실행값 (9,210/19,710/5,900) |
| S02 | 7일 내복+외용 복합 | C10 | 35 | Z4121 코드 선택 | WPF 입력 기반 계산 |
| S03 | 비급여 포함 혼합 | C10 | 40 | 항번호 분리(01항/W항) | WPF 입력 기반 계산 |
| S04 | 65세 저액 정액 | C10 | 72 | FixCost 정액 분기 | WPF 입력 기반 계산 |
| S05 | 6세미만 소아 | C10 | 3 | Z2000600 + 21% 경감 | WPF 입력 기반 계산 |
| S06 | 의료급여 1종 | D10 | 55 | Mcode 정액 분기 | WPF 입력 기반 계산 |
| S07 | 보훈 M10 전액면제 | C10+M10 | 70 | mpvaPrice=totalPrice | WPF 입력 기반 계산 |
| S08 | 야간+토요 가산 | C10 | 45 | 야간 코드 + 토요 별도 행 | WPF 입력 기반 계산 |
| S09 | 산재 요양급여 | E10 | 40 | userPrice=0 (E계열) | WPF 입력 기반 계산 |
| S10 | 자동차보험 | F10 | 35 | 전액 본인부담 | WPF 입력 기반 계산 |
| S11 | 산재 후유증 | E20 | 50 | userPrice=0 (E20) | WPF 입력 기반 계산 |
| S12 | 보훈위탁 G20+M10 | G20+M10 | 75 | 전액 보훈부담 | WPF 입력 기반 계산 |
| S13 | 직접조제 | C10 | 45 | Z4200 코드 사용 | WPF 입력 기반 계산 |
| S14 | 달빛어린이 야간 | C10 | 5 | Z7001 + Z2000610 | WPF 입력 기반 계산 |
| S15 | 보훈 M60+야간 | G10+M60 | 60 | 60% 감면 + 3자배분 | WPF 입력 기반 계산 |
| S16 | 의료급여 2종+65세 | D20 | 70 | D20 15%/정액 분기 | WPF 입력 기반 계산 |
| S17 | 의료급여 B014 30% | D10 | 50 | sbrdnType B014 정률 | WPF 입력 기반 계산 |
| S18 | 행려 8종 | D80 | 40 | D80 전액면제 | WPF 입력 기반 계산 |
| S19 | 산제 가루약 ATB | C10 | 8 | Z4010 별도 행 | WPF 입력 기반 계산 |

---

## 5. Regression Checklist (기존 동작 불변 확인)

Phase 5 확장 완료 후 아래 항목이 이전과 동일하게 동작하는지 반드시 확인한다.

### 5-1. 앱 기본 동작

- [ ] 홈페이지 (`/`) 정상 로드 — 레이아웃 깨짐 없음, 주요 링크 작동
- [ ] `/learn` 진입 — 13개 챕터 목록 전체 표시

| 챕터 | 경로 | 확인 |
|------|------|------|
| CH01 | `/learn/ch01` | [ ] |
| CH02 | `/learn/ch02` | [ ] |
| CH03 | `/learn/ch03` | [ ] |
| CH04 | `/learn/ch04` | [ ] |
| CH05 | `/learn/ch05` | [ ] |
| CH06 | `/learn/ch06` | [ ] |
| CH07 | `/learn/ch07` | [ ] |
| CH08 | `/learn/ch08` | [ ] |
| CH09 | `/learn/ch09` | [ ] |
| CH10 | `/learn/ch10` | [ ] |
| CH11 | `/learn/ch11` | [ ] |
| CH12 | `/learn/ch12` | [ ] |
| CH13 | `/learn/ch13` | [ ] |

- [ ] `/quiz` 진입 — 카테고리 5개 전체 표시
- [ ] `/quiz` — 각 카테고리별 문제 40개 표시
- [ ] `/daily` 정상 렌더 — 오늘의 학습 내용 출력

### 5-2. S01 계산 결과 불변 (핵심 회귀 테스트)

Phase 5 변경 후에도 S01 결과값이 변경되면 안 된다.

**S01 고정 기대값 (WPF 실행 기준)**:

```
입력: C10, 40세, 내복약 1종 (500원, 1정, 3회, 7일), 평일 주간
기대: sumInsuDrug=10,500원, sumWage=9,210원, totalPrice=19,710원,
      userPrice=5,900원, insuPrice=13,810원
```

- [ ] TypeScript 계산 엔진 `calculate()` 함수에 위 입력 주입 시 동일 결과 반환
- [ ] Vitest 단위 테스트 `s01-regression.test.ts` 통과

---

## 6. 테스트 실행 방법

### 6-1. 수동 검증 절차 (개발자)

**Step 1: 기준값 수집 (WPF TestApp 실행)**

```
1. YakjaebiCalc.TestApp 빌드 및 실행
2. [시나리오 테스트] 버튼 클릭
3. StatusWindow에서 S01~S19 실행 로그 저장
4. 각 시나리오의 총액1/본인부담/청구/보훈/수납 값을 이 문서의 "실행 후 기록" 칸에 기입
5. 해당 값이 이 문서의 확정 기대값이 됨
```

**Step 2: TypeScript 엔진 검증**

```bash
# PharmaEdu 프로젝트 루트에서
cd C:/Projects/KSH/PharmaEdu
npm run dev       # 개발 서버 실행

# 브라우저에서 /learn/ch11 계산기 페이지 접근
# 각 시나리오 입력 후 결과 비교
```

**Step 3: 단위 테스트 실행**

```bash
# Vitest 실행
npm run test       # 전체 테스트
npm run test -- --reporter=verbose  # 상세 출력
```

### 6-2. 자동화 권장 사항 (Vitest)

아래 파일을 생성하여 자동화 테스트를 구축할 것을 권장한다.

**파일 구조 (권장)**:

```
src/
└── __tests__/
    ├── unit/
    │   ├── rounding.test.ts          ← 반올림 규칙 단위 테스트 (CH07)
    │   ├── drug-amount.test.ts       ← 약품금액 사사오입 경계값
    │   └── dispensing-fee.test.ts    ← 조제료 Z코드 선택 로직
    └── integration/
        ├── s01-regression.test.ts    ← S01 고정 회귀 테스트
        ├── s01-s10.test.ts           ← S01~S10 통합 시나리오
        └── s11-s19.test.ts           ← S11~S19 통합 시나리오
```

**단위 테스트 자동화 가능 영역**:

| 테스트 대상 | 자동화 난이도 | 이유 |
|-----------|-------------|------|
| 반올림/절사 함수 (`rounding.ts`) | 쉬움 | 순수 함수, Mock 불필요 |
| 약품금액 계산 (`drug-amount.ts`) | 쉬움 | 순수 함수 |
| Z코드 선택 로직 | 중간 | Mock Repo 필요 |
| 보험유형별 본인부담 | 중간 | Mock InsuRate 필요 |
| 보훈 3자배분 | 어려움 | G계열 DB 파라미터 의존 |
| E2E UI 검증 | 어려움 | Playwright 설정 필요 |

**Mock Repo 사용 패턴 예시** (Vitest):

```typescript
// __tests__/helpers/mock-repo.ts
import { MockCalcRepository } from '../../../src/lib/calc/mock-repo';

// S01 단위 테스트 예시
describe('S01: 일반 건보 내복약 3일', () => {
  const repo = new MockCalcRepository();

  it('sumInsuDrug는 10,500원이어야 한다', async () => {
    const result = await calculate({
      dosDate: '20260403',
      insuCode: 'C10',
      age: '40',
      powderYn: 'N',
      drugList: [{
        code: '641600010',
        take: 'Internal',
        insuPay: 'Covered',
        dose: 1, dnum: 3, dday: 7, price: 500,
        insuDrug: true, pack: 0
      }]
    }, repo);
    expect(result.sumInsuDrug).toBe(10500);
  });

  it('합계 항등식이 성립해야 한다', async () => {
    const result = await calculate(/* ... */);
    expect(result.totalPrice).toBe(result.userPrice + result.insuPrice);
  });
});
```

---

## 7. Phase 4 QA 팀 전달 메시지

### 핵심 주의사항 3가지

**1. 기대값 출처 이중 확인 필수**

CH11 문서의 계산값(S01: 조제료 8,660원)과 WPF TestApp 실행값(S01: 조제료 9,210원)이 다르다. WPF TestApp이 실제 2026년 EDB Mock DB를 참조하므로 **WPF 실행 결과를 최종 기준값**으로 삼는다. CH11 문서는 로직 추적용으로 참조한다.

**2. "실행 후 기록" 공란 처리**

S02~S19의 기대값 중 "실행 후 기록"으로 표시된 항목은 WPF TestApp을 직접 실행하여 채워야 한다. 이 문서는 입력 파라미터와 검증 포인트를 제공하며, 금액은 WPF 실행 후 기록된 값으로 확정된다.

**3. 법령/EDB 불일치 시나리오 처리**

S04(65세 정액), S05/S03(6세미만 부담률), S06(의료급여 정액)는 EDB Mock 값과 법령 기준이 다르다. 두 값 모두 기록하고 엔진이 어떤 기준을 채택했는지 명시하여 Pass/Fail을 판정한다. 어느 쪽이든 일관성만 있으면 Pass로 처리한다.

---

**[약제비 분析용]**
