# PROJECT_CONTEXT.md — 팜에듀 공유 컨텍스트

> **모든 팀이 작업 시작 전 반드시 이 파일을 먼저 읽을 것.**  
> 최종 수정: 2026-04-06

---

## 1. 프로젝트 루트 및 주요 디렉토리

```
C:\Projects\KSH\PharmaEdu\          ← 프로젝트 루트
├── src/
│   ├── app/                         ← Next.js App Router 페이지
│   │   ├── layout.tsx               ← 전체 레이아웃 (네비게이션 여기에 추가)
│   │   ├── globals.css              ← 전역 CSS (손대지 말 것)
│   │   └── page.tsx                 ← 홈페이지 (연결 상태 확인)
│   ├── components/                  ← 공통 컴포넌트 (현재 비어있음)
│   │   └── ui/                      ← 재사용 가능한 UI 컴포넌트 위치
│   ├── lib/
│   │   ├── supabase.ts              ← 브라우저 Supabase 클라이언트
│   │   └── supabase-server.ts       ← 서버 Supabase 클라이언트
│   ├── types/                       ← TypeScript 타입 정의
│   └── content/                     ← 챕터별 학습 콘텐츠 (Learning Team 생성)
│       └── chapters/
├── supabase/
│   ├── migrations/                  ← DB 마이그레이션 (절대 수동 수정 금지)
│   │   └── 20260406000001_create_suga_tables.sql
│   └── seed.sql                     ← 초기 데이터 시딩
├── docs/                            ← 기획·컨텍스트 문서
│   ├── PROJECT_PLAN.md
│   ├── PROJECT_CONTEXT.md           ← 이 파일
│   └── TEAM_INTERFACES.md
└── public/                          ← 정적 파일
```

---

## 2. Tech Stack 전체

| 항목 | 버전 / 세부 |
|------|------------|
| **Next.js** | 16.1.6 (App Router, `use server` / `use client` 구분 필수) |
| **React** | 19.2.3 |
| **TypeScript** | ^5 (`strict` 모드 권장) |
| **Tailwind CSS** | ^4 (PostCSS 플러그인 방식, `@import "tailwindcss"`) |
| **Supabase JS** | `@supabase/supabase-js` ^2.95.3 |
| **Supabase SSR** | `@supabase/ssr` ^0.9.0 (서버/클라이언트 클라이언트 분리) |
| **배포** | Vercel (main 브랜치 자동 배포) |
| **DB** | PostgreSQL (Supabase 호스팅) |

### Supabase 클라이언트 사용 규칙
- **서버 컴포넌트 / Route Handler** → `createServerSupabase()` from `@/lib/supabase-server`
- **클라이언트 컴포넌트** (`'use client'`) → `createClient()` from `@/lib/supabase`
- 두 클라이언트를 혼용하지 말 것 (쿠키 관리 방식이 다름)

---

## 3. 공유 파일 위치 (모든 팀 공통 참조)

| 파일 | 절대 경로 | 용도 |
|------|----------|------|
| `layout.tsx` | `C:\Projects\KSH\PharmaEdu\src\app\layout.tsx` | 전체 HTML 래퍼 + 네비게이션 |
| `globals.css` | `C:\Projects\KSH\PharmaEdu\src\app\globals.css` | 전역 스타일 (`@import "tailwindcss"`) |
| `supabase.ts` | `C:\Projects\KSH\PharmaEdu\src\lib\supabase.ts` | 브라우저 클라이언트 |
| `supabase-server.ts` | `C:\Projects\KSH\PharmaEdu\src\lib\supabase-server.ts` | 서버 클라이언트 |

---

## 4. Supabase 테이블 스키마 요약

마이그레이션 파일: `supabase/migrations/20260406000001_create_suga_tables.sql`

### `suga_fee` — Z코드 수가 단가 마스터 (568행)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGSERIAL PK | |
| `apply_year` | SMALLINT | 적용 연도 (2026 등) |
| `code` | VARCHAR(12) | Z코드 (예: Z1000, Z2101) |
| `name` | VARCHAR(60) | 수가명 |
| `price` | NUMERIC(10,0) | 단가 (원) |
| `group_cd` | VARCHAR(20) | 그룹 코드 |
| UNIQUE | (apply_year, code) | |

### `fee_base_params` — 조제료 기본 파라미터 (3행, 연도별)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `apply_year` | SMALLINT PK | 적용 연도 |
| `relative_unit` | NUMERIC(6,2) | 상대가치 점수 단위 (예: 105.5) |
| `store_manage_fee` | NUMERIC(10,0) | 약국관리료 |
| `dosage_tech_fee` | NUMERIC(10,0) | 기본조제기술료 |
| `drug_guide_fee` | NUMERIC(10,0) | 복약지도료 |
| `drug_manage_fee` | NUMERIC(10,0) | 조제관리료 |
| `night_inc_rate` | NUMERIC(5,1) | 야간가산율 (%) |
| `baby_add_tech_cost` | NUMERIC(10,0) | 영유아 추가 기술료 |
| `presc_rate` | NUMERIC(5,1) | 처방조제 가산율 (%) |
| `presc_burden_cost` | NUMERIC(10,0) | 처방전 부담금 (원) |

### `insu_rate` — 보험유형별 요율 (18행)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGSERIAL PK | |
| `insu_code` | VARCHAR(4) UNIQUE | 보험코드 (C10, D10, G10 등) |
| `rate` | NUMERIC(5,1) | 본인부담율 (%) |
| `six_age_rate` | NUMERIC(5,1) | 6세 미만 특례 요율 |
| `fix_cost` | NUMERIC(10,0) | 정액 본인부담금 |
| `mcode` | NUMERIC(10,0) | M코드 기준값 |
| `bcode` | NUMERIC(10,0) | B코드 기준값 |
| `v2520` | NUMERIC(5,1) | V252 산정특례 0등급 요율 |
| `v2521` | NUMERIC(5,1) | V252 산정특례 1등급 요율 |
| `age65_12000_less` | NUMERIC(5,1) | 65세 이상 12,000원 이하 특례 |

### `holiday` — 공휴일 마스터 (53행)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGSERIAL PK | |
| `holiday_date` | DATE UNIQUE | 공휴일 날짜 |
| `year` | SMALLINT | 연도 |
| `description` | VARCHAR(30) | 공휴일명 |

### `presc_dosage_fee` — 투약일수별 처방조제료 (50행)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGSERIAL PK | |
| `apply_year` | SMALLINT | 적용 연도 |
| `min_days` | SMALLINT | 최소 투약일수 |
| `max_days` | SMALLINT | 최대 투약일수 |
| `suga_code` | VARCHAR(10) | 해당 Z코드 |
| `fee` | NUMERIC(10,0) | 조제료 (원) |
| UNIQUE | (apply_year, min_days) | |

### `quiz_questions` — 퀴즈 문제 (Quiz Team이 마이그레이션 추가)
> Quiz Team이 별도 마이그레이션 파일로 생성 예정. 스키마는 `TEAM_INTERFACES.md` 참조.

---

## 5. 계산 엔진 참조 파일 (C# 원본)

계산 로직을 TypeScript로 포팅할 때 아래 C# 파일을 참조할 것.

**엔진 루트**: `C:\Projects\DSNode\약제비 분석용\YakjaebiCalc\YakjaebiCalc.Engine\`

| 파일 | 역할 |
|------|------|
| `Engine/DispensingFeeCalculator.cs` | 조제료 계산 핵심 엔진 (CH02+CH03+CH04 통합) |
| `Engine/CopaymentCalculator.cs` | 본인부담금 계산 + 3자배분 (CH05/CH06/CH07) |
| `Models/CalcOptions.cs` | 계산 입력 파라미터 44개 필드 정의 |
| `Models/CalcResult.cs` | 계산 결과 39개 필드 정의 (HIRA EDI 1:1 대응) |
| `Models/DrugItem.cs` | 처방 약품 1품목 데이터 |
| `Models/InsuRateInfo.cs` | 보험요율 마스터 |
| `Tables/SugaFeeTable.cs` | Z코드 수가 조회 테이블 |
| `Tables/PrescDosageFeeTable.cs` | 투약일수별 처방조제료 테이블 |
| `Tables/HolidayTable.cs` | 공휴일 판단 테이블 |
| `Tables/FeeBaseParams.cs` | 기본 파라미터 테이블 |
| `Tables/InsuranceRuleTable.cs` | 보험 규칙 테이블 |
| `Constants/` | 코드 상수 (Z코드명, 보험코드 등) |
| `Utilities/` | 반올림 헬퍼 (`RoundingHelper`) 등 |

### 핵심 계산 흐름 요약
```
CalcOptions (입력)
    ↓
DispensingFeeCalculator.Calculate()
    Step 1: 수가 마스터 로드 (suga_fee)
    Step 2: 투약일수 → 처방조제료 구간 결정 (presc_dosage_fee)
    Step 3: 기본조제기술료·복약지도료·약국관리료 산출 (fee_base_params)
    Step 4: 가산 적용 (야간 30% / 공휴일 / 산제 / 직접조제 등)
    Step 5~9: 항목별 수가 누적 → WageList 완성
    ↓
CopaymentCalculator.Calculate()
    Step 1: 총약제비 = Trunc10(약가합계 + 조제료합계)
    Step 2: 보험요율 결정 (insu_rate + 산정특례 + 6세미만)
    Step 3: 보훈감면율 결정
    Step 4: 본인부담금 산출
    Step 5: 3자배분 (UserPrice / InsuPrice / MpvaPrice)
    ↓
CalcResult (출력)
```

---

## 6. 교육 콘텐츠 파일

| 항목 | 경로 |
|------|------|
| 통합 교육 콘텐츠 (CH00~CH12) | `C:\Projects\DSNode\약제비 분석용\output\CH00-CH12.md` |
| 약국 약제비 계산 분석 | `C:\Projects\DSNode\약제비 분석용\docs\약국_약제비_계산_분석.md` |
| 원문 PDF (823쪽) | `C:\Projects\DSNode\약제비 분석용\docs\요양급여비용 청구방법...pdf` |

Learning Team은 `CH00-CH12.md`를 챕터별로 분리하여 `src/content/chapters/` 하위에 저장한다.

---

## 7. 브랜치 전략

| 브랜치 | 역할 |
|--------|------|
| `main` | **Vercel 자동 배포** — 완성된 기능만 머지 |
| `dev` | 공통 작업 브랜치 — Phase 1 기반 코드 |
| `feat/calculator` | Calculator Team 작업 브랜치 |
| `feat/learning` | Learning Team 작업 브랜치 |
| `feat/quiz` | Quiz Team 작업 브랜치 |

### 머지 규칙
1. 각 팀은 자신의 `feat/` 브랜치에서만 작업
2. `dev` → `main` 머지 전 반드시 `npm run build` + `npm run type-check` 통과 확인
3. 공통 파일(`layout.tsx`) 수정 시 팀 간 사전 협의 필수

---

## 8. 절대 수정 금지 파일 목록

| 파일 | 이유 |
|------|------|
| `.env.local` | Supabase URL·Key 포함 — Git에도 올리지 말 것 |
| `supabase/migrations/*.sql` | 이미 적용된 마이그레이션 — 수정 시 DB 불일치 |
| `src/app/globals.css` | 전역 스타일 — 변경 시 모든 팀에 영향 |
| `src/lib/supabase.ts` | 클라이언트 팩토리 — 변경 시 전체 연결 파괴 |
| `src/lib/supabase-server.ts` | 서버 클라이언트 팩토리 — 동일 이유 |

> **새 마이그레이션 추가는 가능.** 기존 파일 수정은 불가.

---

*[약제비 분석용]*
