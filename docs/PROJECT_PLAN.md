# PROJECT_PLAN.md — 팜에듀 (PharmaEdu) 전체 계획서

> 최종 수정: 2026-04-06  
> 작성 기준: Phase 1 완료 시점 (Supabase 연결 완료, 기능 미구현 상태)

---

## 1. 프로젝트 목표와 비전

### 한 문장 정의
> **약국 약제비 계산의 복잡한 규칙을 누구나 스스로 배울 수 있도록, 시뮬레이션·단계별 학습·퀴즈를 하나의 웹 플랫폼에 통합한다.**

### 배경
한국 건강보험(HIRA) 약제비 계산 로직은 조제료 9단계 수가 산출, 보험유형별 본인부담율, 가산 조건(야간·공휴일·산제 등)이 복잡하게 얽혀 있어 약국 실무자가 체계적으로 학습하기 어렵다. 팜에듀는 이 로직을 인터랙티브 도구로 풀어내어 학습 효율을 높이는 것을 목표로 한다.

### 핵심 가치
- **정확성**: Supabase에 적재된 2026년 기준 수가 데이터 기반 실제 계산
- **교육성**: 단순 결과 제시가 아닌, 각 계산 단계를 시각적으로 설명
- **접근성**: 로그인 없이 모든 기능 사용 가능 (향후 진도 저장 시 선택적 인증)

---

## 2. 3대 핵심 기능

### 2-1. 계산기 (Calculator)
**URL**: `/calculator`

**목표**: 처방전 정보를 입력하면 실제 청구액·환자부담금·공단부담금을 단계별로 산출해 보여주는 시뮬레이터.

**주요 입력 항목**
| 항목 | 설명 | C# 대응 필드 |
|------|------|-------------|
| 조제일자 | 야간·공휴일 가산 판단 | `CalcOptions.DosDate`, `DosTime` |
| 보험코드 | C(건강보험)/D(의료급여1종)/G(의료급여2종)/E(비급여) 등 | `CalcOptions.InsuCode` |
| 환자 나이 | 6세 미만·65세 이상 가산 판단 | `CalcOptions.Age` |
| 투약일수 | 처방조제료 구간 결정 | `CalcOptions.InsuDose` |
| 약품 목록 | 품목별 보험/비급여 여부, 단가, 수량 | `CalcOptions.DrugList` |
| 가산 조건 | 야간/공휴일/토요일/산제/직접조제 등 | `CalcOptions.IsNight` 등 |

**출력 항목**
- 조제료 항목별 수가 내역 (WageList)
- 총 청구금액 (TotalPrice)
- 환자 부담금 (UserPrice) / 공단 부담금 (PubPrice)
- 각 계산 단계 설명 (교육 모드)

**구현 방식**
- Next.js Route Handler(`/api/calculate`)에서 서버사이드 계산 수행
- Supabase에서 수가 데이터 조회 → TypeScript 계산 엔진 호출 → JSON 반환
- C# `DispensingFeeCalculator` + `CopaymentCalculator` 로직을 TypeScript로 포팅

---

### 2-2. 학습 (Learning)
**URL**: `/learn`, `/learn/[chapter]`

**목표**: 12개 챕터의 교육 콘텐츠를 순서대로 읽고, 각 챕터 내에서 개념을 체험할 수 있도록 구성.

**챕터 구성** (교육 콘텐츠 `output/CH00-CH12.md` 기준)
| 챕터 | 주제 |
|------|------|
| CH00 | 오리엔테이션 — 약제비란 무엇인가 |
| CH01 | 건강보험 체계와 요양급여 |
| CH02 | Z코드 수가 체계 |
| CH03 | 조제료 9단계 수가 계산 |
| CH04 | 가산 로직 (야간·공휴일·산제 등) |
| CH05 | 보험유형별 본인부담율 |
| CH06 | 의료급여 수급권자 |
| CH07 | 3자배분 (UserPrice/InsuPrice/MpvaPrice) |
| CH08 | 투약일수와 처방조제료 구간 |
| CH09 | 선별급여 (50%·80%·30%·90%) |
| CH10 | 100일 이상 특례 |
| CH11 | 보훈 약국 청구 |
| CH12 | 계산 종합 실습 |

**핵심 UX**
- 챕터 목록 페이지에서 진행 상태 표시 (localStorage 기반)
- 챕터 내 미니 계산기 예시 (교육용 인터랙션)
- "다음 챕터" 버튼으로 순서 학습 유도

---

### 2-3. 퀴즈 (Quiz)
**URL**: `/quiz`, `/daily`

**목표**: 매일 1문제씩 약제비 계산 관련 객관식·단답식 문제를 제공하여 반복 학습 유도.

**데이터 구조** (Supabase `quiz_questions` 테이블 신규 추가)
```sql
CREATE TABLE quiz_questions (
  id          BIGSERIAL PRIMARY KEY,
  chapter     SMALLINT NOT NULL,          -- 관련 챕터 번호
  question    TEXT NOT NULL,
  options     JSONB,                       -- 객관식 선택지 (null이면 단답)
  answer      TEXT NOT NULL,
  explanation TEXT,
  difficulty  SMALLINT DEFAULT 1          -- 1=쉬움, 2=보통, 3=어려움
);
```

**일일 퀴즈 (`/daily`)**: 오늘 날짜 기반으로 문제 1개를 결정적으로 선택 (id % 총문제수 방식)

**자유 퀴즈 (`/quiz`)**: 챕터별 필터링, 난이도 선택 가능

---

## 3. URL 라우트 구조

```
/                       → 홈 (연결 상태 + 기능 소개 카드)
/calculator             → 계산기 메인
/learn                  → 챕터 목록 (진행 상태 표시)
/learn/[chapter]        → 챕터별 교육 콘텐츠
  예: /learn/ch03       → 조제료 9단계 수가 계산
/quiz                   → 자유 퀴즈 (챕터·난이도 필터)
/daily                  → 오늘의 문제 1문제
```

### Next.js 디렉토리 매핑
```
src/app/
├── page.tsx                      → /
├── layout.tsx                    → 전체 레이아웃 (네비게이션 포함)
├── calculator/
│   └── page.tsx                  → /calculator
├── learn/
│   ├── page.tsx                  → /learn
│   └── [chapter]/
│       └── page.tsx              → /learn/[chapter]
├── quiz/
│   └── page.tsx                  → /quiz
└── daily/
    └── page.tsx                  → /daily
```

---

## 4. 데이터 흐름 다이어그램

```
사용자 브라우저
    │
    │  HTTP 요청
    ▼
Next.js 16 (Vercel Edge)
    │
    ├── 정적 콘텐츠 (챕터 텍스트)
    │       ↓
    │   src/content/chapters/*.md (로컬 파일)
    │
    ├── 계산 요청 (/api/calculate)
    │       ↓
    │   Route Handler (Server)
    │       ↓
    │   TypeScript 계산 엔진 (src/lib/calc-engine/)
    │       ↓
    │   Supabase Client (createServerSupabase)
    │       ↓
    │   PostgreSQL (Supabase)
    │   ┌──────────────────────────────┐
    │   │  suga_fee          (568행)   │
    │   │  fee_base_params   (3행)     │
    │   │  insu_rate         (18행)    │
    │   │  holiday           (53행)    │
    │   │  presc_dosage_fee  (50행)    │
    │   │  quiz_questions    (추가 예정)│
    │   └──────────────────────────────┘
    │
    └── 퀴즈 데이터 (서버 컴포넌트 직접 조회)
            ↓
        Supabase → quiz_questions 테이블
```

---

## 5. 성공 기준

### Phase 1 — 기반 (완료)
- [x] Supabase 연결 및 5개 테이블 시딩 완료
- [x] Next.js 프로젝트 Vercel 배포 완료

### Phase 2 — 기능 구현 (목표)
- [ ] **Calculator**: 기본 조제료 계산 (건강보험 C10 단순 케이스) 결과 정확도 100%
- [ ] **Learning**: CH00~CH12 모든 챕터 렌더링 및 네비게이션 동작
- [ ] **Quiz**: 일일 퀴즈 1문제 제공, 정답 해설 표시

### Phase 3 — 완성도 (목표)
- [ ] Calculator: 가산 조건 전체 지원 (야간·공휴일·산제·직접조제·보훈 등)
- [ ] Calculator: 보험유형 전체 지원 (C/D/G/F/E)
- [ ] Quiz: 100문제 이상 콘텐츠 적재
- [ ] Learning: 챕터 진행 상태 로컬 저장

---

*[약제비 분석용]*
