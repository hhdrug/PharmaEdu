# PHASE6_PLAN.md — 팜에듀 Phase 6 기획서

> **작성**: Phase 6 PM  
> **작성일**: 2026-04-06  
> **전제**: Phase 5 완료 (계산 엔진 5종 보험 + 8가지 조제 특수기능 구현 완료, 빌드/타입체크/린트 0 오류)

---

## 1. Phase 6 목표 및 범위

### 핵심 한 줄 정의
> **계산 엔진(Phase 5)이 완성된 지금, 그것을 활용하는 학습·퀴즈·탐색 경험을 완성하고, UX의 빈 자리(홈 리뉴얼·오답노트·에러 페이지·로딩 스켈레톤)를 채운다.**

### Phase 6 범위 요약

| 구분 | Phase 5 (완료) | Phase 6 (목표) |
|------|---------------|---------------|
| 계산 엔진 | 5종 보험 + 12 모듈 완성 | 건드리지 않음 (Phase 5 동결) |
| 퀴즈 문제 수 | CH01~CH08 기반 (약 40문제 추정) | CH09~CH12 60+ 추가 → 총 100+ 문제 |
| 홈 카드 | 3개 (계산기·학습·퀴즈) | 4개 (Daily 카드 추가) |
| 오답 관리 | 없음 | 오답노트 `/quiz/wrong-notes` |
| 챕터→퀴즈 연결 | 없음 | 챕터 하단 "이 챕터 퀴즈 풀기" 버튼 |
| 계산형 랜덤 문제 | 없음 | 계산 엔진 활용 동적 문제 생성 |
| 검색 | 없음 | /learn 챕터 검색 (이미 UI만 있음, 기능 완성) |
| 관리자 | 없음 | /admin 문제 CRUD (서버사이드 보호) |
| 계산 이력 | 없음 | /calculator/history (localStorage) |
| 에러 페이지 | 없음 | 404 / 500 커스텀 |
| 로딩 UX | 없음 | Skeleton 컴포넌트 전반 적용 |

---

## 2. 10대 Must-Have 기능 상세

### F01. 홈 페이지 리뉴얼 (4-Card)
- 현재 `src/app/page.tsx`의 `features` 배열에 Daily 카드 추가
- 퀴즈 페이지(`/quiz`)의 "오늘의 1문제" 티저 섹션을 `/daily`로 직접 연결로 변경
- 헤더 "3대 핵심 기능" → "4대 핵심 기능" 문구 수정
- `/daily` 카드: 아이콘 `Calendar`, badge `info`, cta "오늘의 문제 풀기"

### F02. Quiz 문제 대규모 확장 (60+ 문제)
- CH09 선별급여: 15문제 이상 (50%·80%·30%·90% 각 케이스)
- CH10 100일 이상 특례: 15문제 이상
- CH11 보훈 약국 청구: 15문제 이상 (M10/M20/M30/M50/M60/M90 보훈코드)
- CH12 종합 실습: 15문제 이상 (복합 계산 시나리오)
- 마이그레이션: `20260406000004_quiz_ch09_ch10.sql` + `20260406000005_quiz_ch11_ch12.sql`
- Phase 5 QA 권장사항 반영: 보훈 케이스, D20 vs D10 비교, 직접조제 vs 처방조제 문제 포함

### F03. 오답 노트 (Wrong Answer Notebook)
- 라우트: `/quiz/wrong-notes`
- 데이터: `localStorage['quiz_wrong_notes']`에 JSON 저장 (틀린 문제 id + 오답 기록 시각)
- 기능: 오답 목록 조회, 개별 문제 다시 풀기, 오답 삭제
- QuizPlayer에서 오답 시 자동 localStorage 기록 훅 추가

### F04. 챕터 → 퀴즈 연결
- `src/app/learn/[slug]/page.tsx` 하단에 "이 챕터 퀴즈 풀기" 버튼 추가
- 각 챕터의 slug에서 챕터 번호를 파싱해 `/quiz/play?category=ch0X` 로 연결
- 챕터 인덱스(`src/content/chapters/index.ts`)에 `chapterNumber` 필드 활용

### F05. 계산형 랜덤 문제 생성기
- 라우트: `/quiz/dynamic`
- 계산 엔진(`src/lib/calc-engine/index.ts`)을 서버사이드에서 호출해 임의 파라미터 생성
- 난이도 슬라이더(1~3) → 파라미터 복잡도 조절
- 문제 형식: "다음 조건에서 환자 본인부담금은?" (계산 결과를 정답으로 동적 생성)
- Route Handler: `src/app/api/quiz/dynamic/route.ts`

### F06. 검색 기능 완성 (/learn)
- `src/app/learn/page.tsx`에 검색 UI는 이미 구현됨 (query state 존재)
- 현재 클라이언트 사이드 필터만 동작 — URL 파라미터 연동(`?q=키워드`) 추가
- 검색 결과 없을 때 UX 개선 (현재 기본 상태)
- 태그 기반 필터 추가 (난이도 버튼 클릭 필터)

### F07. 관리자 페이지 (/admin)
- 라우트: `/admin`
- 인증: `ADMIN_SECRET` 환경변수와 쿠키 비교 (서버사이드 — 클라이언트에 키 노출 없음)
- 기능: 퀴즈 문제 목록 / 추가 / 수정 / 삭제 (CRUD)
- 서버 액션(`src/app/admin/actions.ts`) + 서버 컴포넌트 조합
- `src/app/admin/` 하위 신규 생성 (기존 파일과 충돌 없음)
- Supabase RLS 서버 클라이언트(`supabase-server.ts`)만 사용

### F08. 계산 이력 저장
- 라우트: `/calculator/history`
- 기존 `src/app/calculator/page.tsx`에 localStorage 저장 로직 추가
- 저장 항목: 계산일시, 보험코드, 투약일수, 총약제비, 환자부담금
- 이력 페이지에서 재계산 버튼 제공 (저장된 옵션으로 자동 입력)
- `src/lib/content/storage.ts` 패턴을 참고해 `src/lib/calc-engine/history.ts` 확장

### F09. 에러 페이지 (404/500)
- `src/app/not-found.tsx` — 404 커스텀 (Next.js App Router 컨벤션)
- `src/app/error.tsx` — 500 커스텀 (`'use client'` 필수 — Next.js Error Boundary)
- `src/app/global-error.tsx` — 루트 에러 바운더리 (layout 에러 포함)
- 디자인: 팜에듀 브랜드 컬러 + 홈으로 이동 버튼

### F10. 로딩 스켈레톤
- 신규 컴포넌트: `src/components/ui/Skeleton.tsx`
- 적용 대상:
  - `src/app/quiz/loading.tsx` — 퀴즈 목록 스켈레톤
  - `src/app/learn/loading.tsx` — 챕터 목록 스켈레톤
  - `src/app/daily/loading.tsx` — 데일리 퀴즈 스켈레톤
  - `src/app/calculator/loading.tsx` — 계산기 스켈레톤
- Next.js App Router `loading.tsx` 컨벤션 활용

---

## 3. 팀 편성 (총 19명)

### Phase 6A — 기획·설계 (2명, 병렬, Day 1)
| 번호 | 역할 | 주요 산출물 |
|------|------|-----------|
| A-01 | Phase 6 PM (현재) | PHASE6_PLAN.md, PHASE6_TEAM_TERRITORIES.md |
| A-02 | UX Lead | 신규 화면 와이어프레임 (문서 기술) |

### Phase 6B — 핵심 기능 (12명, 병렬, Day 2~5)
| 번호 | 역할 | 담당 기능 |
|------|------|---------|
| B-01 | Home Renovation Expert | F01 홈 리뉴얼 (4-Card) |
| B-02 | Quiz Content Expert CH09 | F02 CH09 선별급여 15문제 |
| B-03 | Quiz Content Expert CH10 | F02 CH10 100일상한 15문제 |
| B-04 | Quiz Content Expert CH11 | F02 CH11 보훈청구 15문제 |
| B-05 | Quiz Content Expert CH12 | F02 CH12 종합실습 15문제 |
| B-06 | Wrong Answer Notebook Expert | F03 오답노트 |
| B-07 | Chapter-Quiz Link Expert | F04 챕터→퀴즈 연결 |
| B-08 | Calculator History Expert | F08 계산 이력 |
| B-09 | Error Page Expert | F09 에러 페이지 |
| B-10 | Loading Skeleton Expert | F10 로딩 스켈레톤 |
| B-11 | Learn Search Completion Expert | F06 검색 URL파라미터 + 태그 필터 |
| B-12 | DB Migration Coordinator | B-02~B-05 마이그레이션 파일 통합 검토 |

### Phase 6C — 고급 기능 (3명, 병렬, Day 3~6, 6B와 일부 병렬 가능)
| 번호 | 역할 | 담당 기능 | 의존성 |
|------|------|---------|--------|
| C-01 | Dynamic Question Generator Expert | F05 계산형 랜덤 문제 | Phase 5 계산 엔진 (이미 완성) |
| C-02 | Admin Page Expert | F07 관리자 페이지 | B-12 마이그레이션 완료 후 |
| C-03 | Analytics Lead | 학습 대시보드 (선택적) | B-06, B-07 완료 후 |

### Phase 6D — 통합·QA (2명, 순차, Day 6~7)
| 번호 | 역할 | 담당 |
|------|------|------|
| D-01 | Integration Lead | 전체 기능 통합, 브랜치 머지, build 검증 |
| D-02 | Master QA | 최종 QA, 완성 보고서 작성 |

**총 인원: 19명 (A×2 + B×12 + C×3 + D×2)**

---

## 4. 실행 순서 (Phase 6A → 6B → 6C → 6D)

```
Day 1: Phase 6A (병렬)
  A-01: PHASE6_PLAN.md + PHASE6_TEAM_TERRITORIES.md 작성
  A-02: 신규 화면 UX 스펙 문서 작성

Day 2~5: Phase 6B (12명 병렬)
  B-01: src/app/page.tsx 수정 (4카드)
  B-02~B-05: 각 챕터 SQL 시드 작성
  B-06: src/app/quiz/wrong-notes/ 신규
  B-07: src/app/learn/[slug]/page.tsx 버튼 추가
  B-08: src/app/calculator/history/ 신규
  B-09: src/app/not-found.tsx + error.tsx + global-error.tsx
  B-10: src/components/ui/Skeleton.tsx + loading.tsx 파일들
  B-11: src/app/learn/page.tsx URL 파라미터 + 태그 필터
  B-12: SQL 마이그레이션 파일 검토 (B02~B05 취합)

Day 3~6: Phase 6C (3명 병렬, 6B와 일부 중첩)
  C-01: src/app/quiz/dynamic/ + src/app/api/quiz/dynamic/
  C-02: src/app/admin/ (B-12 완료 조건)
  C-03: 학습 대시보드 컴포넌트 (선택)

Day 6~7: Phase 6D (순차)
  D-01: 모든 feat 브랜치 dev 머지 + npm run build 통과 확인
  D-02: 전체 기능 QA + PHASE6_COMPLETION_REPORT.md 작성
```

---

## 5. 의존성 다이어그램

```
Phase 6A (완료 필수)
  A-01 ──┐
  A-02 ──┤
         ▼
Phase 6B (A-01 완료 후 시작, B들 간 병렬)
  B-01 (홈 리뉴얼)         ──────────────────────────────────────▶ D-01
  B-02 (CH09 문제) ─┐
  B-03 (CH10 문제) ─┤→ B-12 (마이그레이션 통합) ─────────────────▶ D-01
  B-04 (CH11 문제) ─┤                              └──▶ C-02 (admin)
  B-05 (CH12 문제) ─┘
  B-06 (오답노트)          ──────────────────────────────────────▶ D-01
  B-07 (챕터→퀴즈)         ──────────────────────────────────────▶ D-01
  B-08 (계산이력)          ──────────────────────────────────────▶ D-01
  B-09 (에러페이지)        ──────────────────────────────────────▶ D-01
  B-10 (스켈레톤)          ──────────────────────────────────────▶ D-01
  B-11 (검색 완성)         ──────────────────────────────────────▶ D-01

Phase 6C (병렬, B와 일부 중첩 가능)
  C-01 (동적문제) ← Phase 5 calc-engine (이미 완성) ─────────────▶ D-01
  C-02 (admin)  ← B-12 완료 후 시작 ────────────────────────────▶ D-01
  C-03 (대시보드)← B-06+B-07 완료 후 권장 ───────────────────────▶ D-01

Phase 6D (모든 B, C 완료 후)
  D-01 (통합) ──▶ D-02 (최종QA) ──▶ main 브랜치 배포
```

### 핵심 의존 조건 요약
| 팀 | 시작 가능 조건 |
|----|--------------|
| B 전체 | A-01 문서 완료 |
| B-12 | B-02, B-03, B-04, B-05 SQL 초안 완료 |
| C-02 | B-12 마이그레이션 파일 확정 후 |
| C-03 | B-06, B-07 인터페이스 확정 후 |
| D-01 | 모든 B + C 작업 완료 |
| D-02 | D-01 통합 빌드 성공 후 |

---

## 6. 브랜치 전략

```
main (Vercel 자동 배포)
  └── dev
        ├── feat/phase6-home-renovation      (B-01)
        ├── feat/phase6-quiz-ch09            (B-02)
        ├── feat/phase6-quiz-ch10            (B-03)
        ├── feat/phase6-quiz-ch11            (B-04)
        ├── feat/phase6-quiz-ch12            (B-05)
        ├── feat/phase6-wrong-notes          (B-06)
        ├── feat/phase6-chapter-quiz-link    (B-07)
        ├── feat/phase6-calc-history         (B-08)
        ├── feat/phase6-error-pages          (B-09)
        ├── feat/phase6-loading-skeleton     (B-10)
        ├── feat/phase6-learn-search         (B-11)
        ├── feat/phase6-dynamic-quiz         (C-01)
        └── feat/phase6-admin                (C-02)
```

---

## 7. 성공 기준

| 기준 | 측정 방법 |
|------|---------|
| 총 퀴즈 문제 수 100+ | `SELECT COUNT(*) FROM quiz_questions` |
| 홈 카드 4개 | `/` 페이지 렌더링 확인 |
| 오답노트 작동 | 오답 후 localStorage 항목 존재 확인 |
| 에러 페이지 표시 | `/존재하지않는경로` 접근 → 커스텀 404 표시 |
| 로딩 스켈레톤 | 느린 네트워크 환경에서 스켈레톤 표시 확인 |
| npm run build | 오류 0, 경고 0 |
| npm run type-check | TypeScript 오류 0 |
| 관리자 CRUD | /admin에서 문제 추가/수정/삭제 동작 |

---

## 8. Phase 5 잔여 이슈 중 Phase 6에서 처리할 항목

Phase 5 QA 보고서의 "한계사항(Part D)" 중 Phase 6에서 처리 권장된 항목:

| 항목 | 담당 팀 | 비고 |
|------|---------|------|
| 2026년 이후 명절 날짜 추가 (seasonal.ts) | Phase 5 Engine Team (별도 핫픽스) | Phase 6 범위 외 — 메모만 |
| sumUserDrug 비급여 합계 CalcResult 반영 | Phase 5 Engine Team (별도 핫픽스) | Phase 6 범위 외 — 메모만 |
| medical-aid.ts 오해 소지 주석 수정 | B-12 (마이그레이션 검토 시 부수적 수정) | 1줄 수정 |

> Phase 5 계산 엔진 파일은 Phase 6에서 직접 수정하지 않는다. 단, 계산형 랜덤 문제 생성기(C-01)는 엔진을 import하여 활용 (수정 아닌 호출).

---

## 9. 리스크 및 대응

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| B-02~B-05 문제 내용 품질 불균일 | 중 | 중 | B-12 DB 통합 담당자가 내용 교차 검토 |
| C-02 관리자 페이지 보안 취약 | 중 | 상 | ADMIN_SECRET 환경변수 + 서버액션 only, 클라이언트 노출 금지 |
| B-07 챕터→퀴즈 연결 시 챕터 번호 파싱 오류 | 하 | 중 | slug → chapterNumber 매핑 테이블 사전 확정 |
| C-01 동적 문제 생성 시 계산 엔진 호출 성능 | 중 | 중 | 서버사이드 Route Handler로 격리, 타임아웃 설정 |
| D-01 통합 시 layout.tsx 동시 수정 충돌 | 상 | 상 | PHASE6_TEAM_TERRITORIES.md에서 layout.tsx 단일 수정권 명시 |

---

*[약제비 분석용]*
