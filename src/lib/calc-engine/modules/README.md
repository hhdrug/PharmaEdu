# calc-engine/modules — 확장 계산 모듈

Phase 5 병렬 개발용 모듈 디렉토리.  
12명의 전문가(Specialist #1~#12)가 각각 담당 파일을 독립적으로 구현한다.

---

## 디렉토리 구조

```
modules/
├── README.md                   ← 이 파일
├── insurance/                  ← 보험유형별 본인부담금 모듈
│   ├── veteran.ts              ← Specialist #1  (G10/G20 + M코드)
│   ├── medical-aid.ts          ← Specialist #2  (D20/D80 + B014/B030)
│   ├── auto-insurance.ts       ← Specialist #3  (F10)
│   └── workers-comp.ts         ← Specialist #4  (E10/E20)
├── surcharges/                 ← 특수 가산 모듈
│   ├── powder.ts               ← Specialist #5  (Z4010 산제)
│   ├── seasonal.ts             ← Specialist #6  (ZE 명절)
│   └── saturday-split.ts       ← Specialist #7  (토요 별도행)
├── modes/                      ← 특수 조제 모드
│   ├── direct-dispensing.ts    ← Specialist #8  (Z4200 직접조제)
│   └── counseling.ts           ← Specialist #9  (Z7001 복약상담, 달빛어린이, 비대면)
└── special/                    ← 특수 처리
    ├── drug-648.ts             ← Specialist #10 (특수약품 648903860)
    ├── safety-net.ts           ← Specialist #11 (본인부담상한제)
    └── exemption.ts            ← Specialist #12 (V252 산정특례)
```

---

## 담당자별 역할

| # | 파일 | 주제 | 핵심 로직 |
|---|------|------|-----------|
| 1 | `insurance/veteran.ts` | 보훈(G) | M10~M90 감면율, MpvaPrice 3자배분 |
| 2 | `insurance/medical-aid.ts` | 의료급여(D) 확장 | B014/B030, V103, 건강생활유지비 |
| 3 | `insurance/auto-insurance.ts` | 자동차보험(F) | 전액 자부담 + 할증 |
| 4 | `insurance/workers-comp.ts` | 산재(E) | 환자 0원 |
| 5 | `surcharges/powder.ts` | 산제 가산 | Z4010 계열, 2023.11.01 분기 |
| 6 | `surcharges/seasonal.ts` | 명절 가산 | ZE 코드, 공휴일 중복 방지 |
| 7 | `surcharges/saturday-split.ts` | 토요 별도행 | Z2000030/Z3000030/Z41xx030 |
| 8 | `modes/direct-dispensing.ts` | 직접조제 | Z4200 계열 |
| 9 | `modes/counseling.ts` | 복약상담/비대면 | Z7001, ZC001~004, 달빛 |
| 10 | `special/drug-648.ts` | 648903860 가산 | 5% 추가, M코드 면제 |
| 11 | `special/safety-net.ts` | 본인부담상한제 | 소득분위별 상한 초과금 |
| 12 | `special/exemption.ts` | 산정특례 | V252 등급, 특정기호 요율 |

---

## 인터페이스 계약

### 1. 모든 모듈의 공통 패턴

```typescript
// 입력: *Context 인터페이스
export interface XxxCalcContext {
  options: CalcOptions;   // 공통 입력
  // ... 모듈별 추가 필드
}

// 출력: *Result 인터페이스
export interface XxxCalcResult {
  // ... 모듈별 결과
}

// 주 계산 함수 (동기 또는 async)
export function calcXxx(ctx: XxxCalcContext): XxxCalcResult
export async function calcXxx(ctx: XxxCalcContext): Promise<XxxCalcResult>
```

### 2. 타입 의존성

모든 모듈은 다음 타입만 import한다:

```typescript
import type { CalcOptions, CalcResult, InsuRate, DrugItem, WageListItem, ICalcRepository } from '../../types';
import { trunc10, trunc100 } from '../../rounding';
```

- `../../types` — 공통 타입 (수정 금지, Integration Lead 담당)
- `../../rounding` — 반올림 유틸리티
- 모듈 간 직접 import **금지** (Integration Lead의 index.ts에서만 조합)

### 3. 에러 처리

미구현 함수는 반드시 `throw new Error('[모듈명] Not yet implemented')` 사용.  
빌드가 통과해야 하므로 `return` 문 없이 throw만 있어도 무방 (TypeScript never 타입).

---

## 새 모듈 추가 방법

1. 적절한 하위 디렉토리에 파일 생성
2. `*Context`, `*Result` 인터페이스 정의
3. 주 계산 함수 export (NotImplemented throw 포함)
4. JSDoc에 참조 문서, C# 소스 위치 명시
5. `CALCULATOR_ARCHITECTURE.md` 업데이트
6. Integration Lead에게 `types.ts` 확장 필요 여부 전달

---

## 파일 충돌 방지 규칙

- 각 Specialist는 **자신의 담당 파일만** 수정한다
- `../../types.ts`, `../../index.ts`, `../../copayment.ts` 수정 **금지**
- 공통 타입이 필요할 경우 Integration Lead에게 요청
- 모듈 간 함수 호출 **금지** (Integration Lead 조합 전담)
