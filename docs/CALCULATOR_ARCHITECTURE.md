# CALCULATOR_ARCHITECTURE.md
# 팜에듀 계산 엔진 아키텍처 설계서

> **작성**: Engine Architect (Phase 5, Expert #1)  
> **작성일**: 2026-04-06  
> **대상**: Integration Lead (Phase 5, Expert #13) + 12명 Specialist

---

## 1. 현재 엔진 파이프라인 (Phase 4 완료 상태)

```
calculate(opt, repo)                        ← index.ts 진입점
    │
    ├─ Step 1: calcDrugAmountSum()          ← drug-amount.ts
    │    약품금액 합계 (급여/비급여 분리)
    │
    ├─ Step 2: calcDispensingFee()          ← dispensing-fee.ts
    │    조제료 계산 (Z1000~Z5000 + 가산)
    │    (내부에서 determineSurcharge 호출)
    │
    ├─ Step 3: getInsuRate()               ← supabase-repo.ts
    │    보험요율 DB 조회
    │
    └─ Step 4: calcCopayment()             ← copayment.ts
         본인부담금 산출
         지원: C10, C65세+, C6세미만, D10
         미지원: D20/D80/B014/B030, G, F, E, V252
```

---

## 2. Phase 5 확장 후 전체 파이프라인

```
calculate(opt, repo)
    │
    ├─ Step 1: 약품금액 계산 (기존)
    │    calcDrugAmountSum() — 변경 없음
    │    + sum648DrugAmount() ← [NEW] drug-648.ts
    │
    ├─ Step 2: 조제료 계산 (확장)
    │    calcDispensingFee() — 기존 코드 유지
    │    + 산제 분기 → calcPowderSurcharge()     ← [NEW] surcharges/powder.ts
    │    + 직접조제 분기 → calcDirectDispensing() ← [NEW] modes/direct-dispensing.ts
    │    + 비대면 분기 → calcCounseling()         ← [NEW] modes/counseling.ts
    │    + 명절 분기 → calcSeasonalSurcharge()    ← [NEW] surcharges/seasonal.ts
    │    + 토요 분리 → calcSaturdaySplit()         ← [NEW] surcharges/saturday-split.ts
    │    (기존 토요 로직을 모듈로 추출 + 교육 단계 추가)
    │
    ├─ Step 3: 보험요율 조회 (기존)
    │    + determineExemptionRate() ← [NEW] special/exemption.ts
    │
    └─ Step 4: 본인부담금 + 3자배분 (확장)
         기존 calcCopayment() 유지 (C10/D10 커버)
         보험유형별 확장:
         │
         ├─ C계열: calcCopayment() 유지 (Integration Lead가 V252 연결)
         │         + determineExemptionRate() 결과 반영
         │
         ├─ D계열: calcMedicalAid()           ← [NEW] insurance/medical-aid.ts
         │         (B014/B030/V103/건강생활유지비 추가)
         │
         ├─ G계열: calcVeteran()              ← [NEW] insurance/veteran.ts
         │         (M코드별 감면 + MpvaPrice 3자배분)
         │
         ├─ F계열: calcAutoInsurance()        ← [NEW] insurance/auto-insurance.ts
         │         (전액 + 할증)
         │
         └─ E계열: calcWorkersComp()         ← [NEW] insurance/workers-comp.ts
                   (0원)
         │
         + 특수 후처리:
           ├─ calcDrug648Surcharge()          ← [NEW] special/drug-648.ts
           ├─ calcSafetyNet()                ← [NEW] special/safety-net.ts
           └─ 공비(PubPrice) 계산 (Integration Lead 구현)
```

---

## 3. 모듈별 실행 순서 및 영향 단계

| 실행 순서 | 모듈 | 영향하는 파이프라인 단계 | 출력 |
|-----------|------|------------------------|------|
| 1 | `drug-648.ts` | Step 1 (약품금액) | Sum648 → Step 4에서 사용 |
| 2 | `powder.ts` | Step 2 (조제료) | WageList 수정 (Z41xx → Z4010) |
| 3 | `direct-dispensing.ts` | Step 2 (조제료) | WageList 수정 (Z41xx → Z4200) |
| 4 | `counseling.ts` | Step 2 (조제료) | WageList 추가 (Z7001/ZC001~) |
| 5 | `seasonal.ts` | Step 2 (조제료) | WageList 수정 (공휴 → ZE) |
| 6 | `saturday-split.ts` | Step 2 (조제료) | WageList 추가 (Z코드030) |
| 7 | `exemption.ts` | Step 3 (보험요율) | effectiveRate → Step 4로 전달 |
| 8 | `veteran.ts` | Step 4 (본인부담) | UserPrice + MpvaPrice |
| 9 | `medical-aid.ts` | Step 4 (본인부담) | UserPrice (D계열 확장) |
| 10 | `auto-insurance.ts` | Step 4 (본인부담) | UserPrice + Premium |
| 11 | `workers-comp.ts` | Step 4 (본인부담) | UserPrice = 0 |
| 12 | `drug-648.ts` (가산) | Step 4 후처리 | UserPrice += surcharge648 |
| 13 | `safety-net.ts` | Step 4 후처리 | OverUserPrice → InsuPrice 전환 |

---

## 4. Integration Lead 작업 지침 (Phase 3)

### 4.1 index.ts 수정 계획

```typescript
// 현재 (Phase 4):
const copay = calcCopayment(sumInsuDrug, sumWage, opt, rate);

// Phase 5 이후 (Integration Lead 구현):
// 1. 보험유형 분기 확장
const insuCategory = opt.insuCode.charAt(0).toUpperCase();
switch (insuCategory) {
  case 'G': { const r = calcVeteran(...); ... break; }
  case 'D': { const r = calcMedicalAid(...); ... break; }
  case 'F': { const r = calcAutoInsurance(...); ... break; }
  case 'E': { const r = calcWorkersComp(...); ... break; }
  default:  { const r = calcCopayment(...); ... break; }
}

// 2. 특수 후처리 체인
const drug648 = calcDrug648Surcharge({ options: opt, sum648, bohunCode });
userPrice += drug648.surcharge;
const safetyNet = calcSafetyNet({ options: opt, userPrice, ... });
```

### 4.2 copayment.ts 수정 계획

```typescript
// Integration Lead가 calcCopayment_D()를 의료급여 확장 모듈로 교체:
// medical-aid.ts의 calcMedicalAid()를 내부에서 호출하거나
// index.ts 레벨에서 분기 처리
```

---

## 5. types.ts 확장 필요 사항 (Integration Lead 담당)

> **중요**: 아래 항목들은 각 Specialist가 작업하기 위해 필요한 타입 변경이다.  
> Integration Lead는 Specialist 작업 시작 전에 types.ts에 추가해야 한다.

### 5.1 CalcOptions 추가 필드

```typescript
export interface CalcOptions {
  // ... 기존 필드 유지 ...

  // [NEW] 보훈 관련
  bohunCode?: string;          // M10~M90 — veteran.ts
  hospCode?: string;           // 요양기관기호 — isBohunHospital() 판정

  // [NEW] 의료급여 관련
  sbrdnType?: string;          // B014/B030 등 수급권자 유형 — medical-aid.ts
  eHealthBalance?: number;     // 건강생활유지비 잔액 (원) — medical-aid.ts
  isHealthCenterPresc?: boolean; // 보건기관 처방전 여부 — medical-aid.ts
  hgGrade?: string;            // 의료급여 등급 ('5' → 면제) — medical-aid.ts

  // [NEW] 자동차보험 관련
  addRat?: number;             // 할증율 (%) — auto-insurance.ts

  // [NEW] 직접조제
  isDirectDispensing?: boolean; // 직접조제 여부 — direct-dispensing.ts

  // [NEW] 비대면 조제
  isNonFace?: boolean;         // 비대면 조제 여부 — counseling.ts
  hasCounseling?: boolean;     // 복약상담 제공 여부 — counseling.ts
  isDalbitPharmacy?: boolean;  // 달빛어린이약국 여부 — counseling.ts

  // [NEW] 산정특례
  mediIllnessInfo?: MediIllnessInfo; // 상세 특정기호 정보 — exemption.ts

  // [NEW] 장려금
  incentiveSum?: number;       // 대체조제/사용장려금 합계 (원) — C# Incentive

  // [NEW] 코로나 특례
  mediIllnessB?: string;       // B코드 질병코드 (F008 코로나 등)
}
```

### 5.2 CalcResult 추가 필드

```typescript
export interface CalcResult {
  // ... 기존 필드 유지 ...

  // [NEW] 3자배분
  mpvaPrice?: number;          // 보훈청 청구액 — veteran.ts
  insuPrice?: number;          // 공단 청구액 (= pubPrice와 다를 수 있음)
  realPrice?: number;          // 실수납금 = userPrice - pubPrice
  sumUser?: number;            // 최종 환자수납액 (비급여 포함)
  sumInsure?: number;          // 최종 공단청구액

  // [NEW] 특수약품
  sum648?: number;             // 648903860 약품금액 합계 — drug-648.ts
  sumInsuDrug100?: number;     // 100% 자부담 약품금액 합계
  totalPrice100?: number;      // 100% 약품 총액
  userPrice100?: number;       // 100% 약품 환자분

  // [NEW] 할증
  premium?: number;            // 자동차보험 할증액 — auto-insurance.ts

  // [NEW] 공비 관련
  pubPrice2?: number;          // 공비 상세 (302/101/102 분리 시)
  mpvaComm?: number;           // 보훈 비급여 감면분

  // [NEW] 본인부담상한제
  overUserPrice?: number;      // 상한제 초과금 (공단 전환액)

  // [NEW] 장려금
  incentive?: number;          // 대체조제 장려금
}
```

### 5.3 InsuRate 추가 필드

```typescript
export interface InsuRate {
  // ... 기존 필드 유지 ...

  // [NEW] V252 산정특례 등급별 요율
  v2520?: number;              // V252 0등급 요율 (%) — exemption.ts
  v2521?: number;              // V252 1등급 요율 (%) — exemption.ts
}
```

### 5.4 ICalcRepository 추가 메서드

```typescript
export interface ICalcRepository {
  // ... 기존 메서드 유지 ...

  // [NEW] 명절 여부 조회 — seasonal.ts
  getHolidayType(date: string): Promise<'lunar_new_year' | 'chuseok' | 'holiday' | null>;

  // [NEW] MediIllnessInfo 조회 — exemption.ts
  getMediIllnessInfo(code: string): Promise<MediIllnessInfo | null>;
}

// [NEW] MediIllnessInfo 타입
export interface MediIllnessInfo {
  code: string;
  rate: number;           // 본인부담율 (%)
  isV252: boolean;
  grade?: number;
  description?: string;
}
```

---

## 6. 파일 충돌 방지 매트릭스

| 파일 | 담당자 | 수정 가능 여부 |
|------|--------|--------------|
| `types.ts` | Integration Lead | Specialist 수정 금지 |
| `index.ts` | Integration Lead | Specialist 수정 금지 |
| `copayment.ts` | Integration Lead | Specialist 수정 금지 |
| `dispensing-fee.ts` | Integration Lead | Specialist 수정 금지 |
| `surcharge.ts` | Integration Lead | Specialist 수정 금지 (읽기만) |
| `rounding.ts` | Integration Lead | Specialist 수정 금지 (읽기만) |
| `modules/insurance/veteran.ts` | Specialist #1 | 독점 소유 |
| `modules/insurance/medical-aid.ts` | Specialist #2 | 독점 소유 |
| `modules/insurance/auto-insurance.ts` | Specialist #3 | 독점 소유 |
| `modules/insurance/workers-comp.ts` | Specialist #4 | 독점 소유 |
| `modules/surcharges/powder.ts` | Specialist #5 | 독점 소유 |
| `modules/surcharges/seasonal.ts` | Specialist #6 | 독점 소유 |
| `modules/surcharges/saturday-split.ts` | Specialist #7 | 독점 소유 |
| `modules/modes/direct-dispensing.ts` | Specialist #8 | 독점 소유 |
| `modules/modes/counseling.ts` | Specialist #9 | 독점 소유 |
| `modules/special/drug-648.ts` | Specialist #10 | 독점 소유 |
| `modules/special/safety-net.ts` | Specialist #11 | 독점 소유 |
| `modules/special/exemption.ts` | Specialist #12 | 독점 소유 |

---

## 7. C# 소스 참조 가이드

```
C:\Projects\DSNode\약제비 분석용\YakjaebiCalc\YakjaebiCalc.Engine\
├── Engine/
│   ├── CopaymentCalculator.cs          ← 본인부담금 전체 (900+ 라인)
│   │   ├── CalcCopay_C()               → copayment.ts (기존)
│   │   ├── CalcCopay_D()               → medical-aid.ts (Specialist #2)
│   │   ├── CalcCopay_G()               → veteran.ts (Specialist #1)
│   │   ├── CalcCopay_F()               → auto-insurance.ts (Specialist #3)
│   │   ├── DetermineInsuRate()         → exemption.ts (Specialist #12)
│   │   ├── GetBohunRate()              → veteran.ts (Specialist #1)
│   │   ├── CalcMpvaPrice()             → veteran.ts (Specialist #1)
│   │   ├── ApplyBohunPharmacy()        → veteran.ts (Specialist #1)
│   │   ├── ApplyOverUserPrice()        → safety-net.ts (Specialist #11)
│   │   └── ApplySpecialPub()           → Integration Lead
│   └── DispensingFeeCalculator.cs      ← 조제료 전체
│       ├── 산제 분기                   → powder.ts (Specialist #5)
│       ├── 직접조제 분기               → direct-dispensing.ts (Specialist #8)
│       ├── 비대면 분기                 → counseling.ts (Specialist #9)
│       └── 토요 별도행                 → saturday-split.ts (Specialist #7)
```

---

## 8. 빌드 통과 조건

각 Specialist가 구현을 완료하기 전까지, 스켈레톤 파일은 아래 조건을 만족해야 한다:

1. TypeScript 컴파일 오류 없음 (`npm run build` 통과)
2. 함수 시그니처와 반환 타입이 명시적으로 선언됨
3. 미구현 함수는 `throw new Error(...)` 사용 (빌드는 통과)
4. `import type`으로 타입만 가져옴 (런타임 의존성 최소화)

---

## 9. 통합 순서 (Integration Lead Phase 3 작업 순서 권장)

1. **types.ts 확장** — §5 목록대로 필드 추가 (Specialist 작업 전 선행)
2. **exemption.ts 연결** — DetermineInsuRate 결과를 calcCopayment에 전달
3. **medical-aid.ts 연결** — D계열 분기를 calcCopayment_D 대신 연결
4. **veteran.ts 연결** — G계열 분기 신설
5. **auto-insurance.ts 연결** — F계열 분기 신설
6. **workers-comp.ts 연결** — E계열 분기 신설
7. **drug-648.ts 연결** — 후처리 체인에 추가
8. **safety-net.ts 연결** — 후처리 체인에 추가
9. **조제료 모듈 연결** — calcDispensingFee에 powder/direct/counseling/seasonal 분기 추가
10. **saturday-split.ts 리팩토링** — 기존 토요 로직 추출 및 교체

---

*[약제비 분석용]*
