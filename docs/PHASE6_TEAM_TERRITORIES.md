# PHASE6_TEAM_TERRITORIES.md — Phase 6 팀별 파일 영역 정의

> **작성**: Phase 6 PM  
> **작성일**: 2026-04-06  
> **목적**: 19명 병렬 작업 시 파일 충돌 완전 방지  
> **규칙**: 자신의 영역 외 파일은 읽기만 가능, 쓰기·수정 금지

---

## 0. 읽기 필수 파일 (모든 팀 공통)

작업 시작 전 반드시 읽어야 하는 파일:

```
C:\Projects\KSH\PharmaEdu\docs\PROJECT_CONTEXT.md        ← 기술 스택, DB 스키마
C:\Projects\KSH\PharmaEdu\docs\PROJECT_PLAN.md           ← 프로젝트 전체 목표
C:\Projects\KSH\PharmaEdu\docs\PHASE5_COMPLETION_REPORT.md ← Phase 5 완성 상태
C:\Projects\KSH\PharmaEdu\docs\PHASE6_PLAN.md            ← Phase 6 목표 및 기능 상세
C:\Projects\KSH\PharmaEdu\docs\PHASE6_TEAM_TERRITORIES.md ← 이 파일
```

---

## 1. 절대 수정 금지 파일 (전 팀 공통)

아래 파일은 Phase 6에서 **어떤 팀도 수정 불가**:

| 파일 경로 | 이유 |
|----------|------|
| `src/app/globals.css` | 전역 스타일 — 수정 시 모든 팀 영향 |
| `src/lib/supabase.ts` | 브라우저 클라이언트 팩토리 — 변경 시 전체 연결 파괴 |
| `src/lib/supabase-server.ts` | 서버 클라이언트 팩토리 — 동일 이유 |
| `.env.local` | Supabase 시크릿 — Git 업로드 및 수정 금지 |
| `supabase/migrations/20260406000001_create_suga_tables.sql` | 이미 적용된 마이그레이션 |
| `supabase/migrations/20260406000002_create_quiz_tables.sql` | 이미 적용된 마이그레이션 |
| `supabase/migrations/20260406000003_quiz_improvements.sql` | 이미 적용된 마이그레이션 |
| `supabase/seed.sql` | 초기 시딩 — 재실행 시 중복 발생 |

### Phase 5 계산 엔진 동결 파일 (Phase 6에서 수정 금지)

Phase 5가 완성하고 QA를 통과한 계산 엔진 파일들. 읽기만 허용.

```
src/lib/calc-engine/index.ts
src/lib/calc-engine/types.ts
src/lib/calc-engine/dispensing-fee.ts
src/lib/calc-engine/copayment.ts
src/lib/calc-engine/drug-amount.ts
src/lib/calc-engine/rounding.ts
src/lib/calc-engine/surcharge.ts
src/lib/calc-engine/supabase-repo.ts
src/lib/calc-engine/modules/special/drug-648.ts
src/lib/calc-engine/modules/special/exemption.ts
src/lib/calc-engine/modules/special/safety-net.ts
src/lib/calc-engine/modules/surcharges/powder.ts
src/lib/calc-engine/modules/surcharges/seasonal.ts
src/lib/calc-engine/modules/surcharges/saturday-split.ts
src/lib/calc-engine/modules/modes/direct-dispensing.ts
src/lib/calc-engine/modules/modes/counseling.ts
src/lib/calc-engine/modules/insurance/veteran.ts
src/lib/calc-engine/modules/insurance/medical-aid.ts
src/lib/calc-engine/modules/insurance/auto-insurance.ts
src/lib/calc-engine/modules/insurance/workers-comp.ts
```

> 예외: C-01(동적 문제 생성기)은 이 파일들을 **import하여 호출**하는 것은 허용. 내용 수정 불가.

---

## 2. layout.tsx — 단일 수정 담당 규칙

`src/app/layout.tsx`는 **B-01(홈 리뉴얼 전문가)가 단독 수정 권한**을 가진다.

다른 팀이 네비게이션 링크 추가가 필요한 경우:
1. B-01 팀에게 추가 요청 목록 전달
2. B-01이 일괄 반영

**허용 변경 (B-01 한정)**:
- `<nav>` 내 링크 추가 (`/daily`, `/quiz/wrong-notes`, `/calculator/history`, `/admin`)
- 네비게이션 컴포넌트 교체 (기존 `src/components/layout/Header.tsx` 활용)

**금지 변경 (B-01 포함 전 팀)**:
- `<html lang="ko">` 수정 금지
- `metadata` export 수정 금지
- `globals.css` import 제거 금지

---

## 3. 팀별 파일 영역 상세

---

### A-01 — Phase 6 PM

**소유 파일 (신규 생성)**:
```
docs/PHASE6_PLAN.md                         ← 이미 작성 완료
docs/PHASE6_TEAM_TERRITORIES.md             ← 이미 작성 완료
```

**읽기 전용 (참조용)**:
```
docs/PROJECT_PLAN.md
docs/PROJECT_CONTEXT.md
docs/PHASE5_COMPLETION_REPORT.md
docs/TEAM_INTERFACES.md
src/app/ (전체 구조 파악용)
```

---

### A-02 — UX Lead

**소유 파일 (신규 생성)**:
```
docs/PHASE6_UX_SPEC.md                      ← 신규 화면 와이어프레임·UX 스펙
```

**읽기 전용**: 전체 소스 구조 참조 가능 (수정 없음)

---

### B-01 — Home Renovation Expert

**소유 파일 (수정)**:
```
src/app/page.tsx                            ← 4-Card 추가, Daily 링크 추가
src/app/layout.tsx                          ← nav 링크 추가 (단독 수정권)
```

**읽기 전용 (참조)**:
```
src/components/ui/Card.tsx
src/components/ui/Badge.tsx
src/components/ui/Button.tsx
src/components/layout/Header.tsx
src/app/quiz/page.tsx                       ← Daily 티저 섹션 참조
```

**금지**:
- `/quiz`, `/learn`, `/calculator`, `/daily` 하위 파일 수정
- 기존 3개 feature 카드 내용 변경 (Daily 카드만 추가)

---

### B-02 — Quiz Content Expert CH09

**소유 파일 (신규 생성)**:
```
supabase/seeds/quiz_ch09_seed.sql           ← CH09 15문제 이상 INSERT 문
```

**최종 마이그레이션 파일은 B-12가 통합 처리** (직접 migrations/ 폴더에 쓰지 않음)

**문제 작성 기준**:
- chapter: 9
- 주제: 선별급여 (50%·80%·30%·90%)
- 난이도 분포: 쉬움 5 / 보통 7 / 어려움 3 이상
- Phase 5 QA 권장 반영: 648903860 특수약품 5% 가산 계산 문제 포함

**참조 파일**:
```
src/content/chapters/ch09-데이터모델.md     ← 챕터 콘텐츠 참조
docs/PROJECT_PLAN.md §2-3                   ← quiz_questions 테이블 스키마
```

---

### B-03 — Quiz Content Expert CH10

**소유 파일 (신규 생성)**:
```
supabase/seeds/quiz_ch10_seed.sql           ← CH10 15문제 이상 INSERT 문
```

**문제 작성 기준**:
- chapter: 10
- 주제: 100일 이상 투약 특례 (장기처방 본인부담 완화)
- 난이도 분포: 쉬움 5 / 보통 7 / 어려움 3 이상

**참조 파일**:
```
src/content/chapters/ch10-계산파이프라인.md
```

---

### B-04 — Quiz Content Expert CH11

**소유 파일 (신규 생성)**:
```
supabase/seeds/quiz_ch11_seed.sql           ← CH11 15문제 이상 INSERT 문
```

**문제 작성 기준**:
- chapter: 11
- 주제: 보훈 약국 청구 (G계열, M10/M20/M30/M50/M60/M90 코드)
- Phase 5 QA 권장 반영: 보훈 케이스(M코드별) 문제 세트 필수 포함
- 난이도 분포: 쉬움 4 / 보통 7 / 어려움 4 이상

**참조 파일**:
```
src/content/chapters/ch11-테스트시나리오.md
src/lib/calc-engine/modules/insurance/veteran.ts   ← 읽기 전용 참조
```

---

### B-05 — Quiz Content Expert CH12

**소유 파일 (신규 생성)**:
```
supabase/seeds/quiz_ch12_seed.sql           ← CH12 15문제 이상 INSERT 문
```

**문제 작성 기준**:
- chapter: 12
- 주제: 종합 실습 (복합 계산 시나리오, 의료급여 D20 vs D10 비교)
- Phase 5 QA 권장 반영: D20 vs D10 비교, 직접조제 vs 처방조제 조제료 비교 필수 포함
- 난이도 분포: 쉬움 3 / 보통 7 / 어려움 5 이상

**참조 파일**:
```
src/content/chapters/ch12-보훈약국.md
docs/SCENARIO_RESULTS.md                   ← Phase 5 시나리오 검증 결과
```

---

### B-06 — Wrong Answer Notebook Expert

**소유 파일 (신규 생성)**:
```
src/app/quiz/wrong-notes/
  page.tsx                                  ← 오답노트 목록 페이지
  WrongNotePlayer.tsx                       ← 오답 재풀기 컴포넌트
```

**수정 허용 파일**:
```
src/app/quiz/play/QuizPlayer.tsx            ← 오답 시 localStorage 저장 로직 추가
```

**새 유틸 파일 (신규 생성)**:
```
src/lib/quiz/wrong-notes.ts                 ← localStorage 오답 저장/조회/삭제 함수
```

**읽기 전용 (참조)**:
```
src/lib/quiz/history.ts                     ← 기존 히스토리 구현 패턴 참조
src/lib/quiz/types.ts                       ← QuizQuestion 타입 참조
src/app/quiz/play/QuizPlayer.tsx            ← 수정 전 반드시 전체 내용 파악
```

**금지**:
- `src/app/quiz/page.tsx` 수정 금지 (B-07이 담당)
- `src/lib/quiz/client.ts` 수정 금지

---

### B-07 — Chapter-Quiz Link Expert

**수정 허용 파일**:
```
src/app/learn/[slug]/page.tsx               ← 하단 "이 챕터 퀴즈 풀기" 버튼 추가
```

**읽기 전용 (참조)**:
```
src/content/chapters/index.ts              ← 챕터 번호(number) 필드 확인
src/app/quiz/page.tsx                      ← 카테고리 slug 형식 확인
src/components/ui/Button.tsx               ← 버튼 컴포넌트
```

**중요 구현 주의사항**:
- 챕터 slug (`ch03-수가계산` 등)에서 챕터 번호 추출 → `/quiz/play?category=ch03` 형식으로 연결
- 챕터에 해당하는 퀴즈 문제가 없을 경우 버튼 비활성화 처리 필요
- `CHAPTERS` 인덱스의 `number` 필드와 `quiz_questions.chapter` 번호 매핑 확인 필수

**금지**:
- `src/app/learn/page.tsx` 수정 금지 (B-11이 담당)
- `src/content/chapters/` 내 md 파일 수정 금지

---

### B-08 — Calculator History Expert

**소유 파일 (신규 생성)**:
```
src/app/calculator/history/
  page.tsx                                  ← 계산 이력 목록 페이지
```

**수정 허용 파일**:
```
src/app/calculator/page.tsx                 ← 계산 완료 시 localStorage 저장 로직 추가
```

**새 유틸 파일 (신규 생성)**:
```
src/lib/calc-engine/history.ts              ← 계산 이력 localStorage 저장/조회 함수
```

**읽기 전용 (참조)**:
```
src/lib/content/storage.ts                  ← localStorage 패턴 참조
src/lib/calc-engine/types.ts               ← CalcOptions, CalcResult 타입
src/app/calculator/page.tsx                ← 수정 전 전체 내용 파악 필수
```

**저장 데이터 형식 (구현 기준)**:
```typescript
interface CalcHistoryEntry {
  id: string;               // crypto.randomUUID()
  savedAt: string;          // ISO 8601
  insuCode: string;         // 보험코드
  insuDose: number;         // 투약일수
  totalPrice: number;       // 총약제비
  userPrice: number;        // 환자부담금
  options: CalcOptions;     // 재계산용 전체 옵션
}
```

**금지**:
- `src/lib/calc-engine/index.ts` 등 계산 엔진 핵심 파일 수정 금지
- `src/app/api/calculate/` 수정 금지

---

### B-09 — Error Page Expert

**소유 파일 (신규 생성)**:
```
src/app/not-found.tsx                       ← 404 커스텀 페이지
src/app/error.tsx                           ← 500 에러 바운더리 ('use client' 필수)
src/app/global-error.tsx                    ← 루트 레벨 에러 바운더리 ('use client' 필수)
```

**읽기 전용 (참조)**:
```
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/app/layout.tsx                          ← 레이아웃 구조 파악 (수정 없이 참조만)
docs/DESIGN_SYSTEM.md                       ← 색상·타이포 시스템
```

**구현 기준**:
- 404: 팜에듀 브랜드 일러스트(또는 아이콘) + "페이지를 찾을 수 없습니다" + 홈으로 버튼
- 500: 에러 메시지 표시 + "다시 시도" 버튼 (reset() 호출) + 홈으로 버튼
- Tailwind 유틸리티만 사용, 별도 CSS 파일 생성 금지

**금지**:
- `src/app/layout.tsx` 수정 금지 (B-01 전담)
- 기존 페이지 파일 수정 금지

---

### B-10 — Loading Skeleton Expert

**소유 파일 (신규 생성)**:
```
src/components/ui/Skeleton.tsx              ← 공용 스켈레톤 컴포넌트
src/app/quiz/loading.tsx                    ← 퀴즈 목록 스켈레톤
src/app/learn/loading.tsx                   ← 챕터 목록 스켈레톤
src/app/daily/loading.tsx                   ← 데일리 퀴즈 스켈레톤
src/app/calculator/loading.tsx              ← 계산기 스켈레톤
```

**읽기 전용 (참조)**:
```
src/components/ui/Card.tsx                  ← 카드 구조 파악
src/app/quiz/page.tsx                       ← 퀴즈 페이지 레이아웃 파악
src/app/learn/page.tsx                      ← 학습 페이지 레이아웃 파악
src/app/daily/page.tsx                      ← 데일리 페이지 레이아웃 파악
src/app/calculator/page.tsx                 ← 계산기 레이아웃 파악
docs/DESIGN_SYSTEM.md                       ← 색상 시스템
```

**Skeleton 컴포넌트 기준**:
```typescript
// src/components/ui/Skeleton.tsx
// 'use client' 불필요 (서버 컴포넌트로 작성)
// Props: className?: string, variant?: 'text' | 'rect' | 'circle'
// animate-pulse 애니메이션 사용
```

**금지**:
- 기존 페이지 파일(`page.tsx`) 수정 금지 — `loading.tsx`만 신규 생성
- `src/components/ui/` 기존 컴포넌트(Button, Card, Badge 등) 수정 금지

---

### B-11 — Learn Search Completion Expert

**수정 허용 파일**:
```
src/app/learn/page.tsx                      ← URL ?q= 파라미터 연동, 태그 필터 추가
```

**읽기 전용 (참조)**:
```
src/content/chapters/index.ts              ← CHAPTERS 데이터 구조
src/components/ui/Button.tsx
src/components/ui/Badge.tsx
```

**구현 기준**:
- 현재 `useState`로만 동작하는 `query`를 `useSearchParams` + `useRouter` 로 URL 연동
- URL: `/learn?q=조제료` 형식
- 난이도 버튼 클릭 필터 (`/learn?difficulty=중급`)
- 필터 초기화 버튼 추가
- SSR 고려: `Suspense` 래핑 필수 (`useSearchParams` 사용 시 `'use client'` 유지)

**금지**:
- `src/app/learn/[slug]/page.tsx` 수정 금지 (B-07이 담당)
- `src/content/chapters/` 내 파일 수정 금지

---

### B-12 — DB Migration Coordinator

**소유 파일 (신규 생성)**:
```
supabase/migrations/20260406000004_quiz_ch09_ch10.sql   ← B-02+B-03 문제 통합
supabase/migrations/20260406000005_quiz_ch11_ch12.sql   ← B-04+B-05 문제 통합
```

**읽기 전용 (참조, 수정 불가)**:
```
supabase/seeds/quiz_ch09_seed.sql           ← B-02 산출물
supabase/seeds/quiz_ch10_seed.sql           ← B-03 산출물
supabase/seeds/quiz_ch11_seed.sql           ← B-04 산출물
supabase/seeds/quiz_ch12_seed.sql           ← B-05 산출물
supabase/migrations/20260406000002_create_quiz_tables.sql  ← 기존 스키마 파악
supabase/migrations/20260406000003_quiz_improvements.sql   ← 기존 개선사항 파악
```

**마이그레이션 파일 작성 규칙**:
```sql
-- 파일명: 20260406000004_quiz_ch09_ch10.sql
-- 역할: CH09, CH10 퀴즈 문제 INSERT
-- 기존 테이블 스키마 변경 금지
-- INSERT INTO quiz_questions (chapter, question, options, answer, explanation, difficulty) VALUES ...
-- 트랜잭션 래핑 권장: BEGIN; ... COMMIT;
```

**검토 기준**:
- SQL 문법 오류 없음
- options 컬럼 JSONB 형식 올바름 (null 또는 JSON 배열)
- answer 값이 options 배열 내에 존재하는지 확인
- difficulty 값이 1~3 범위 내 확인

**금지**:
- 기존 마이그레이션 파일 수정 절대 금지
- `quiz_questions` 테이블 스키마 변경 금지 (ALTER TABLE 금지)

---

### C-01 — Dynamic Question Generator Expert

**소유 파일 (신규 생성)**:
```
src/app/quiz/dynamic/
  page.tsx                                  ← 계산형 랜덤 문제 UI
  DynamicPlayer.tsx                         ← 동적 문제 출제 컴포넌트
src/app/api/quiz/dynamic/
  route.ts                                  ← Route Handler (서버사이드 계산 엔진 호출)
```

**읽기 전용 (참조, 호출 가능, 수정 불가)**:
```
src/lib/calc-engine/index.ts               ← calculate() 함수 import + 호출
src/lib/calc-engine/types.ts               ← CalcOptions, CalcResult 타입
src/app/quiz/play/QuizPlayer.tsx           ← QuizPlayer UI 패턴 참조
```

**동적 문제 생성 로직 기준**:
```typescript
// route.ts에서 서버사이드로 처리
// 1. 난이도(1~3)를 받아 랜덤 CalcOptions 생성
// 2. calculate(options)로 정답(userPrice 등) 계산
// 3. 오답 선택지 3개 생성 (정답 ±10~30% 범위 난수)
// 4. { question, options, answer, explanation } 반환
```

**금지**:
- `src/lib/calc-engine/` 내 파일 수정 금지 (import만 허용)
- `src/app/api/calculate/` 기존 Route Handler 수정 금지 (별도 `/api/quiz/dynamic/` 신규 생성)

---

### C-02 — Admin Page Expert

**소유 파일 (신규 생성)**:
```
src/app/admin/
  page.tsx                                  ← 관리자 대시보드 (문제 목록)
  questions/
    new/page.tsx                            ← 문제 추가 폼
    [id]/edit/page.tsx                      ← 문제 수정 폼
  actions.ts                               ← Server Actions (CRUD)
  middleware-check.ts                      ← ADMIN_SECRET 쿠키 검증 유틸
```

**읽기 전용 (참조)**:
```
src/lib/supabase-server.ts                  ← 서버 클라이언트 (import만)
src/lib/quiz/types.ts                       ← QuizQuestion 타입
supabase/migrations/20260406000002_create_quiz_tables.sql  ← 스키마 확인
src/components/ui/                          ← 모든 UI 컴포넌트 import 가능
```

**보안 구현 기준**:
```typescript
// src/app/admin/middleware-check.ts
// 서버사이드에서만 ADMIN_SECRET 비교
// process.env.ADMIN_SECRET — 클라이언트 번들에 절대 포함 금지
// NEXT_PUBLIC_ 접두사 사용 금지
// 인증 실패 시 redirect('/') 처리
```

**금지**:
- `NEXT_PUBLIC_ADMIN_SECRET` 형식의 환경변수 사용 금지 (클라이언트 노출)
- `src/app/api/calculate/` 접근 금지
- 기존 마이그레이션 파일 수정 금지

---

### C-03 — Analytics Lead (선택적)

**소유 파일 (신규 생성)**:
```
src/app/learn/dashboard/
  page.tsx                                  ← 학습 진도 대시보드
src/components/ui/ProgressBar.tsx           ← 공용 프로그레스바 컴포넌트
```

**읽기 전용 (참조)**:
```
src/lib/content/storage.ts                  ← 학습 진도 localStorage 구조
src/lib/quiz/history.ts                     ← 퀴즈 기록 구조
src/content/chapters/index.ts
```

**금지**:
- `src/components/ui/` 기존 컴포넌트 수정 금지 (신규 추가만)
- 기존 페이지 파일 수정 금지

---

### D-01 — Integration Lead

**작업 내용**: 브랜치 머지 + 빌드 검증 (소스 신규 작성 최소화)

**허용 수정**:
- 머지 충돌 해소 (최소한의 수정)
- `src/app/layout.tsx` 최종 정리 (B-01 작업 검토 후 보완)
- `docs/TEAM_INTERFACES.md` Phase 6 업데이트

**검증 체크리스트**:
```
[ ] npm run build → 오류 0, 경고 0
[ ] npm run type-check → TypeScript 오류 0
[ ] npm run lint → ESLint 오류 0
[ ] 모든 신규 라우트 접근 가능 확인
    /              → 4카드 표시
    /quiz/wrong-notes  → 오답노트
    /calculator/history → 계산 이력
    /quiz/dynamic  → 동적 문제
    /admin         → 관리자 (ADMIN_SECRET 필요)
    /존재않는주소  → 커스텀 404
[ ] 스켈레톤: 네트워크 throttle 3G에서 loading.tsx 표시 확인
```

---

### D-02 — Master QA

**소유 파일 (신규 생성)**:
```
docs/PHASE6_COMPLETION_REPORT.md            ← 최종 QA 보고서
```

**검증 범위**: F01~F10 전 기능 동작 확인, 회귀 테스트 (Phase 5 기능 정상 유지 확인)

---

## 4. 공통 컴포넌트 사용 규칙

### 기존 컴포넌트 (수정 금지, import만 허용)
```
src/components/ui/Badge.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Input.tsx
src/components/ui/Select.tsx
src/components/ui/Spinner.tsx
src/components/layout/Footer.tsx
src/components/layout/Header.tsx
src/components/layout/MobileNav.tsx
```

### Phase 6에서 신규 생성 (B-10, C-03이 추가)
```
src/components/ui/Skeleton.tsx              ← B-10 생성
src/components/ui/ProgressBar.tsx           ← C-03 생성 (선택적)
```

**컴포넌트 추가 규칙**:
- PascalCase 파일명
- TypeScript + 명시적 Props 타입
- Tailwind 클래스만 사용 (별도 CSS 금지)
- 기존 컴포넌트의 Props 인터페이스 파괴 금지 (optional 추가만 허용)
- `'use client'` / `'use server'` 명시 필수

---

## 5. 마이그레이션 파일 네이밍 규칙

| 파일명 | 담당 | 내용 |
|--------|------|------|
| `20260406000001_create_suga_tables.sql` | 기존 (수정 금지) | 수가 관련 테이블 |
| `20260406000002_create_quiz_tables.sql` | 기존 (수정 금지) | quiz_questions 테이블 |
| `20260406000003_quiz_improvements.sql` | 기존 (수정 금지) | 퀴즈 개선 |
| `20260406000004_quiz_ch09_ch10.sql` | B-12 생성 | CH09, CH10 문제 INSERT |
| `20260406000005_quiz_ch11_ch12.sql` | B-12 생성 | CH11, CH12 문제 INSERT |

**규칙**:
- 타임스탬프는 순서를 반드시 유지 (000004 → 000005 순)
- 기존 파일 번호 재사용 절대 금지
- 마이그레이션 파일은 멱등성 보장 (`INSERT ... ON CONFLICT DO NOTHING` 권장)

---

## 6. 시드 파일 보관 위치

```
supabase/
├── migrations/                             ← 실제 적용 파일 (B-12 통합)
└── seeds/                                  ← 팀별 작업 파일 (B-02~B-05)
    ├── quiz_ch09_seed.sql                  ← B-02
    ├── quiz_ch10_seed.sql                  ← B-03
    ├── quiz_ch11_seed.sql                  ← B-04
    └── quiz_ch12_seed.sql                  ← B-05
```

`seeds/` 폴더는 Phase 6에서 신규 생성. B-02~B-05는 `seeds/`에만 작성하고 `migrations/` 직접 수정 금지.

---

## 7. localStorage 키 네임스페이스 규칙

여러 팀이 localStorage를 사용하므로 키 충돌 방지:

| 팀 | localStorage 키 | 용도 |
|----|----------------|------|
| 기존 (Learning) | `pharmaedu_visited_*` | 챕터 방문 기록 |
| 기존 (Quiz) | `pharmaedu_quiz_history` | 퀴즈 기록 |
| B-06 (오답노트) | `pharmaedu_wrong_notes` | 오답 문제 목록 |
| B-08 (계산이력) | `pharmaedu_calc_history` | 계산기 이력 |

모든 Phase 6 신규 키는 `pharmaedu_` 접두사 필수.

---

## 8. 팀 간 의사소통 프로토콜

### 공유 인터페이스 파일
다른 팀의 결과물을 사용해야 할 때 참조하는 타입:

| 제공 팀 | 소비 팀 | 파일 |
|--------|---------|------|
| Phase 5 calc-engine | C-01 | `src/lib/calc-engine/types.ts` |
| B-06 | C-03 | `src/lib/quiz/wrong-notes.ts` (타입만) |
| B-08 | C-03 | `src/lib/calc-engine/history.ts` (타입만) |
| B-10 (Skeleton) | 전 팀 | `src/components/ui/Skeleton.tsx` (import 허용) |

### 충돌 발생 시 에스컬레이션 경로
1. 같은 파일을 수정해야 하는 상황 발생 → D-01(통합 리드)에게 즉시 보고
2. D-01이 수정 순서 및 방법 조율
3. 불가피한 경우 D-01이 해당 파일의 단독 수정권 획득 후 양 팀 요구사항 동시 반영

---

*[약제비 분석용]*
