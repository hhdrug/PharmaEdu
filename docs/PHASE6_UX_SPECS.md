# PHASE6_UX_SPECS.md — 팜에듀 Phase 6 신규 화면 UX 스펙

> **작성**: Phase 6 UX Lead (A-02)
> **작성일**: 2026-04-06
> **대상**: Phase 6B/C 개발팀 (B-01, B-06, B-07, B-08, B-09, B-10, B-11, C-01, C-02)
> **전제**: DESIGN_SYSTEM.md v1.0 준수 / Tailwind 4 / Next.js App Router

---

## 목차

1. [홈 리뉴얼 — 4-Card 레이아웃](#1-홈-리뉴얼--4-card-레이아웃)
2. [오답 노트 — `/quiz/wrong-notes`](#2-오답-노트--quizwrong-notes)
3. [계산 이력 — `/calculator/history`](#3-계산-이력--calculatorhistory)
4. [에러 페이지 — 404 / 500](#4-에러-페이지--404--500)
5. [로딩 스켈레톤 — Skeleton 컴포넌트](#5-로딩-스켈레톤--skeleton-컴포넌트)
6. [챕터 → 퀴즈 연결 UI](#6-챕터--퀴즈-연결-ui)
7. [검색 기능 — `/learn`](#7-검색-기능--learn)
8. [관리자 페이지 — `/admin`](#8-관리자-페이지--admin)
9. [계산형 동적 문제 UI](#9-계산형-동적-문제-ui)

---

## 공통 규칙 (모든 화면)

| 항목 | 기준 |
|------|------|
| 컨테이너 | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| 배경 | `bg-bg-page` (`#F5F7FA`) |
| 카드 배경 | `bg-bg-surface` (`#FFFFFF`) |
| 브레이크포인트 | 모바일 `<640px` / 태블릿 `640–1023px` / 데스크탑 `≥1024px` |
| 포커스 링 | `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2` |
| 로딩 상태 | 항상 `<Skeleton />` 컴포넌트 사용 (B-10 생성) |
| 빈 상태 | 아이콘 + 설명 문구 + 행동 유도 버튼 세트로 통일 |
| 에러 상태 | `text-error-500` 배경 `bg-error-100` 박스 표시 |
| 애니메이션 | 카드 호버: `transition-all duration-200 -translate-y-1` |

---

## 1. 홈 리뉴얼 — 4-Card 레이아웃

> **담당**: B-01 (Home Renovation Expert)
> **파일**: `src/app/page.tsx` (수정), `src/app/layout.tsx` (nav 링크 추가)

### 1.1 목적

현재 3-Card 홈을 4-Card로 확장하여 **Daily(오늘의 문제)** 기능을 동등한 비중으로 노출한다.
"오늘 할 일" 섹션을 추가해 Daily 미완료 시 명확한 진입 경로를 제공한다.

### 1.2 변경 요약

| 영역 | Before | After |
|------|--------|-------|
| 섹션 제목 | "3대 핵심 기능" | "4대 핵심 기능" |
| 카드 수 | 3개 (계산기, 학습, 퀴즈) | 4개 (+Daily) |
| 그리드 | `md:grid-cols-3` | `lg:grid-cols-4` (데스크탑) |
| 히어로 CTA | 버튼 2개 | 버튼 2개 유지 + 배지 업데이트 |
| 신규 섹션 | 없음 | "오늘 할 일" 섹션 추가 |

### 1.3 Daily 카드 스펙

```typescript
// features 배열에 추가할 4번째 항목
{
  href: "/daily",
  icon: Calendar,          // lucide-react
  title: "오늘의 문제",
  description:
    "매일 1문제씩 자동 출제되는 약제비 계산 퀴즈. 연속 학습 기록을 유지해 꾸준한 복습 습관을 만드세요.",
  badge: "Daily",
  badgeVariant: "info",    // #539BFF 계열
  cta: "오늘의 문제 풀기",
}
```

### 1.4 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [💊 Pill 아이콘 16×16 rounded-2xl bg-primary-100]           │   │
│  │                                                              │   │
│  │  팜에듀              ← text-4xl sm:text-5xl font-extrabold   │   │
│  │  약국 약제비 계산의 복잡한 규칙을...                           │   │
│  │                    ← text-lg sm:text-xl text-secondary       │   │
│  │                                                              │   │
│  │  [계산기 시작하기 btn-lg primary]  [학습 콘텐츠 보기 btn-lg secondary]│
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ═══════════════════ 오늘 할 일 섹션 (신규) ════════════════════════  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  📅 오늘의 문제                    [완료/미완료 Badge]        │   │
│  │  오늘의 퀴즈를 아직 풀지 않았습니다.                          │   │
│  │                        [오늘의 문제 풀기 →] btn-md primary   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ═══════════════════ 4대 핵심 기능 ════════════════════════════════  │
│                                                                      │
│  데스크탑 (lg:grid-cols-4):                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                        │
│  │계산기  │ │ 학습   │ │ 퀴즈   │ │ Daily  │                        │
│  │[Calc]  │ │[Book]  │ │[Help]  │ │[Cal]   │                        │
│  │        │ │        │ │        │ │        │                        │
│  │계산 시작│ │학습 시작│ │퀴즈 풀기│ │문제 풀기│                       │
│  └────────┘ └────────┘ └────────┘ └────────┘                        │
│                                                                      │
│  태블릿 (md:grid-cols-2):          모바일 (grid-cols-1):            │
│  ┌────────┐ ┌────────┐             ┌──────────────────┐             │
│  │계산기  │ │ 학습   │             │     계산기        │             │
│  └────────┘ └────────┘             └──────────────────┘             │
│  ┌────────┐ ┌────────┐             ┌──────────────────┐             │
│  │ 퀴즈   │ │ Daily  │             │      학습         │             │
│  └────────┘ └────────┘             └──────────────────┘             │
│                                    ...                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.5 "오늘 할 일" 섹션 상세

**위치**: 히어로 섹션과 4-Card 섹션 사이

**로직**:
- localStorage `pharmaedu_daily_completed_YYYY-MM-DD` 키 확인 (클라이언트 사이드)
- 완료 여부에 따라 두 가지 상태 표시

**미완료 상태**:
```
배경: bg-warning-100 (#FEF5E5)
테두리: 1px solid warning-500/30
아이콘: Calendar (text-warning-500)
Badge: "미완료" variant="warning"
문구: "오늘의 문제를 아직 풀지 않았습니다."
CTA: [오늘의 문제 풀기 →] — primary 버튼
```

**완료 상태**:
```
배경: bg-success-100 (#E6FFFA)
테두리: 1px solid success-500/30
아이콘: CheckCircle (text-success-500)
Badge: "완료" variant="success"
문구: "오늘의 문제를 완료했습니다. 내일 또 만나요!"
CTA 없음 (또는 [다시 풀기] ghost 버튼)
```

**구현 주의사항**:
- 이 섹션은 `'use client'` 컴포넌트로 분리 (`DailyStatusBanner.tsx`)
- 서버 컴포넌트인 `page.tsx`에서 `<Suspense>` 래핑 후 렌더
- hydration 미스매치 방지: `useEffect` 안에서 localStorage 접근

### 1.6 그리드 Tailwind 클래스

```tsx
// 현재 (3열)
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// 변경 후 (4열)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
```

### 1.7 카드 최소 높이

4개로 늘어나면 카드 너비가 좁아지므로 최소 높이 지정:
```tsx
<Card
  variant="elevated"
  className="h-full min-h-[220px] flex flex-col gap-4 ..."
>
```

### 1.8 반응형 동작

| 화면 | 컬럼 수 | 카드 배치 |
|------|--------|---------|
| 모바일 (< 640px) | 1열 | 세로 스택 |
| 소형 태블릿 (640–1023px) | 2열 | 2×2 그리드 |
| 데스크탑 (≥1024px) | 4열 | 1행 4개 |

### 1.9 네비게이션 링크 추가 (layout.tsx)

B-01이 `layout.tsx` 내 `<nav>`에 추가:
```tsx
{ href: "/daily",               label: "오늘의 문제" },
{ href: "/quiz/wrong-notes",    label: "오답노트" },
{ href: "/calculator/history",  label: "계산이력" },
```

### 1.10 사용할 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<Card variant="elevated">` | 기능 카드 4개 |
| `<Badge variant="info">` | Daily 뱃지 |
| `<Button variant="primary" size="lg">` | 히어로 CTA |
| `<Button variant="secondary" size="lg">` | 히어로 보조 CTA |
| `Calendar` (lucide-react) | Daily 아이콘 |

### 1.11 에러/빈/로딩 상태

| 상태 | 처리 방법 |
|------|---------|
| Daily 완료 여부 로딩 중 | `DailyStatusBanner` 내부 `useEffect` 전까지 null 반환 (깜빡임 최소화) |
| localStorage 없음 (SSR) | 서버 렌더 시 "미완료"로 기본 처리 |

---

## 2. 오답 노트 — `/quiz/wrong-notes`

> **담당**: B-06 (Wrong Answer Notebook Expert)
> **파일**: `src/app/quiz/wrong-notes/page.tsx`, `src/app/quiz/wrong-notes/WrongNotePlayer.tsx`

### 2.1 목적

퀴즈 플레이 중 틀린 문제를 자동으로 localStorage에 저장하고, 사용자가 언제든 오답만 모아 복습할 수 있는 노트 기능. 인증 없이 브라우저 로컬 데이터만 사용.

### 2.2 데이터 구조

```typescript
// localStorage 키: pharmaedu_wrong_notes
interface WrongNote {
  id: string;                    // quiz_questions.id
  questionText: string;          // 문제 텍스트 (캐시)
  options: string[] | null;      // 선택지 (캐시)
  correctAnswer: string;         // 정답
  myAnswer: string;              // 내가 고른 답
  wrongAt: string;               // ISO 8601 틀린 시각
  chapter: number;               // 챕터 번호
  category: string | null;       // 카테고리 slug
  difficulty: 1 | 2 | 3;        // 난이도
}
```

### 2.3 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  오답 노트                              [전체 다시 풀기 btn-primary] │
│  총 N개의 오답이 있습니다.                                            │
│                                                                      │
│  ─── 필터 영역 ──────────────────────────────────────────────────── │
│  [날짜 ▾]  [챕터 ▾]  [난이도 ▾]  [필터 초기화 ×]                   │
│                                                                      │
│  ─── 오답 목록 ─────────────────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ CH03 · 어려움 · 2026-04-05 오후 2:30            [삭제 ×]    │   │
│  │ Q. 환자 A씨는 건강보험 가입자이며 투약일수는 30일...           │   │
│  │    (최대 2줄 미리보기, 이후 말줄임표)                          │   │
│  │                                                              │   │
│  │  내 답:  ❌ 3,850원        정답: ✅ 4,200원                  │   │
│  │                                                              │   │
│  │                              [다시 풀기 btn-sm primary]      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ CH05 · 보통 · 2026-04-04 오전 10:15             [삭제 ×]    │   │
│  │ Q. 의료급여 1종 수급자가 약국에서 처방전 없이...               │   │
│  │                                                              │   │
│  │  내 답:  ❌ ②번            정답: ✅ ③번                      │   │
│  │                                                              │   │
│  │                              [다시 풀기 btn-sm primary]      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ─── 빈 상태 (오답 없을 때) ──────────────────────────────────────  │
│            [CheckCircle 아이콘 large text-success-500]               │
│         오답이 없습니다. 모든 문제를 맞혔어요!                        │
│                   [퀴즈 풀러 가기 btn-primary]                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.4 필터 상세

| 필터 | 타입 | 옵션 |
|------|------|------|
| 날짜 | `<Select>` | 오늘 / 최근 3일 / 최근 7일 / 전체 |
| 챕터 | `<Select>` | 전체 / CH01 / CH02 … CH12 |
| 난이도 | `<Select>` | 전체 / 쉬움(1) / 보통(2) / 어려움(3) |

**필터 초기화**: 세 필터 모두 기본값이면 "필터 초기화" 버튼 숨김. 하나라도 변경되면 표시.

### 2.5 오답 항목 카드 상세

```
┌─── Card variant="standard" ────────────────────────────┐
│  [헤더 행]                                               │
│  Badge(챕터명) · Badge(난이도) · 날짜/시각 text-muted   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  [문제 미리보기]                                          │
│  text-sm text-primary line-clamp-2                      │
│                                                          │
│  [답 비교 행]                                            │
│  ❌ 내 답: "..." text-error-500 font-medium              │
│  ✅ 정답:  "..." text-success-500 font-medium            │
│                                                          │
│  [푸터 행] justify-end                                   │
│  [삭제] ghost btn-sm text-error-500   [다시 풀기] primary btn-sm │
└────────────────────────────────────────────────────────┘
```

**삭제 확인**: 삭제 버튼 클릭 시 `window.confirm()` 없이 즉시 삭제 (UX: 빠른 액션 우선). 삭제 후 토스트 표시 대신 항목이 즉시 사라짐.

### 2.6 "다시 풀기" 인터랙션

개별 "다시 풀기" 버튼 클릭 시:
- `WrongNotePlayer` 컴포넌트를 모달 형태로 오버레이 표시 (별도 라우트 이동 없음)
- 모달 내에서 단일 문제 풀이 → 정답 처리 → 오답 노트에서 제거 (정답 시) 또는 `wrongAt` 갱신 (오답 시)

**WrongNotePlayer 모달 레이아웃**:
```
┌─── 모달 오버레이 ─────────────────────────────────────┐
│  [× 닫기]                                             │
│  오답 재풀기                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [문제 전체 텍스트]                                    │
│                                                       │
│  ○ 선택지 1        ○ 선택지 2                         │
│  ○ 선택지 3        ○ 선택지 4                         │
│                                                       │
│  [답 제출] btn-lg primary (선택 전 disabled)          │
│                                                       │
│  [정답/오답 결과 — 제출 후 표시]                       │
│  해설: ...                                            │
│  [닫기] [다음 오답 풀기 →]                            │
└───────────────────────────────────────────────────────┘
```

### 2.7 "전체 다시 풀기" 모드

상단 "전체 다시 풀기" 버튼 클릭 시:
- `/quiz/wrong-notes?mode=play` URL로 이동 (또는 동일 페이지 내 모드 전환)
- 오답 목록을 순서대로 순회하는 `WrongNotePlayer` 전체화면 표시
- 진행 표시: "N / 전체M" 텍스트 + progress bar
- 마지막 문제 완료 후: 결과 요약 (정답 X개 / 오답 Y개) + [완료] 버튼

### 2.8 반응형 동작

| 화면 | 레이아웃 |
|------|--------|
| 데스크탑 (≥1024px) | 필터 1행 가로 배치 + 목록 `max-w-3xl mx-auto` |
| 태블릿 (640–1023px) | 필터 1행 스크롤 가능 + 목록 전체 너비 |
| 모바일 (< 640px) | 필터 `<Select>` 3개 세로 스택 + 목록 전체 너비 |

모달: 모바일에서 full-screen `fixed inset-0`으로 표시.

### 2.9 사용할 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<Card variant="standard">` | 오답 항목 카드 |
| `<Badge>` | 챕터, 난이도 뱃지 |
| `<Button variant="primary" size="sm">` | 다시 풀기 |
| `<Button variant="ghost" size="sm">` | 삭제 |
| `<Select>` | 필터 |
| `<Skeleton variant="card" />` | 로딩 상태 |

### 2.10 에러/빈/로딩 상태

| 상태 | UI |
|------|-----|
| 로딩 | `<Skeleton variant="card" />` × 3 |
| 오답 없음 | CheckCircle 아이콘 + "오답이 없습니다" + [퀴즈 풀러 가기] |
| 필터 결과 없음 | Search 아이콘 + "조건에 맞는 오답이 없습니다" + [필터 초기화] |

---

## 3. 계산 이력 — `/calculator/history`

> **담당**: B-08 (Calculator History Expert)
> **파일**: `src/app/calculator/history/page.tsx`, `src/lib/calc-engine/history.ts`

### 3.1 목적

계산기 사용 내역을 localStorage에 자동 저장하고 타임라인 형태로 조회. 과거 계산을 클릭 한 번에 재실행하거나 JSON/CSV로 내보낼 수 있다.

### 3.2 데이터 구조

```typescript
// localStorage 키: pharmaedu_calc_history
// 최대 50개 보관 (초과 시 가장 오래된 항목 자동 삭제)
interface CalcHistoryEntry {
  id: string;          // crypto.randomUUID()
  savedAt: string;     // ISO 8601
  scenarioName: string | null;   // 사용자 지정 이름 (선택)
  insuCode: string;    // 보험코드 (예: "G100")
  insuDose: number;    // 투약일수
  totalPrice: number;  // 총약제비 (원)
  userPrice: number;   // 환자부담금 (원)
  options: CalcOptions; // 재계산용 전체 옵션
}
```

### 3.3 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  계산 이력                                                            │
│  저장된 계산 50건 중 N건       [내보내기 ▾]  [전체 삭제 btn-ghost]  │
│                                                                      │
│  ─── 타임라인 ─────────────────────────────────────────────────── │
│                                                                      │
│  2026-04-06 (오늘)                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 오후 3:25       G100 · 30일                    [···메뉴]    │   │
│  │ [이름 없는 계산]                                              │   │
│  │ 총약제비: 48,250원   환자부담금: 14,480원                    │   │
│  │           [재실행 →] btn-sm primary  [삭제 ×] btn-sm ghost   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 오전 10:11      G400 · 60일          [이름: 어르신 사례]     │   │
│  │ 총약제비: 125,400원  환자부담금: 62,700원                    │   │
│  │           [재실행 →] btn-sm primary  [삭제 ×] btn-sm ghost   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  2026-04-05                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 오후 5:45       M20 · 90일                     [···메뉴]    │   │
│  │ 총약제비: 310,000원  환자부담금: 0원 (보훈 면제)             │   │
│  │           [재실행 →] btn-sm primary  [삭제 ×] btn-sm ghost   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ─── 빈 상태 ──────────────────────────────────────────────────── │
│              [Clock 아이콘 large text-neutral-300]                   │
│        아직 저장된 계산 이력이 없습니다.                              │
│               [계산기로 가기 btn-primary]                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 이력 카드 상세

```
┌─── Card variant="standard" ─────────────────────────────┐
│  [헤더 행] justify-between                               │
│  시각 text-muted text-xs              [메뉴 Icon btn]    │
│                                                          │
│  [시나리오명 행]                                          │
│  scenarioName → text-sm font-medium text-primary         │
│  없으면 → "이름 없는 계산" text-muted italic             │
│                                                          │
│  [입력 요약 행]                                           │
│  Badge(보험코드) · text-sm "투약 N일"                    │
│                                                          │
│  [결과 요약 행] — bg-bg-panel rounded-lg p-3 mt-2       │
│  총약제비:    XX,XXX원   (text-primary font-mono)        │
│  환자부담금:  XX,XXX원   (text-error-500 font-mono)      │
│  공단부담금:  XX,XXX원   (text-secondary font-mono)      │
│                                                          │
│  [푸터 행] justify-end gap-2 mt-3                        │
│  [삭제] ghost btn-sm      [재실행] primary btn-sm        │
└──────────────────────────────────────────────────────────┘
```

### 3.5 재실행 동작

"재실행" 버튼 클릭 시:
- `options` 객체를 `localStorage['pharmaedu_prefill_options']`에 저장
- `/calculator`로 라우팅
- 계산기 페이지에서 `useEffect`로 해당 키 감지 → 폼 자동 채움 → localStorage 키 삭제

### 3.6 시나리오 이름 편집

이력 카드의 이름 영역 클릭(또는 [···] 메뉴 → "이름 편집"):
- 인라인 `<input>` 으로 전환 (카드 내부 edit-in-place)
- Enter 또는 포커스 아웃 시 저장
- ESC 시 취소

```
[이름 없는 계산] → 클릭 →  [________________이름 입력... ✓ ×]
```

### 3.7 내보내기 기능

"내보내기" 드롭다운 메뉴:
```
[내보내기 ▾]
├── JSON으로 내보내기
└── CSV로 내보내기
```

**JSON**: 전체 `CalcHistoryEntry[]` 배열 → `pharmaedu_history_YYYYMMDD.json`
**CSV**: 헤더 포함 간략 버전
```
저장일시,보험코드,투약일수,총약제비,환자부담금,시나리오명
2026-04-06T15:25:00Z,G100,30,48250,14480,
```

다운로드는 `Blob` + `URL.createObjectURL()` 패턴으로 구현.

### 3.8 전체 삭제

"전체 삭제" 클릭 → `window.confirm("계산 이력을 모두 삭제합니다. 복구할 수 없습니다.")` → 확인 시 localStorage 항목 삭제.

### 3.9 반응형 동작

| 화면 | 레이아웃 |
|------|--------|
| 데스크탑 (≥1024px) | `max-w-3xl mx-auto` 중앙 정렬 타임라인 |
| 태블릿 (640–1023px) | 전체 너비 타임라인 |
| 모바일 (< 640px) | 전체 너비, 카드 내 결과 요약 font-size 축소 |

### 3.10 사용할 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<Card variant="standard">` | 이력 항목 카드 |
| `<Badge>` | 보험코드 뱃지 |
| `<Button variant="primary" size="sm">` | 재실행 |
| `<Button variant="ghost" size="sm">` | 삭제 |
| `<Skeleton variant="card" />` | 로딩 |

### 3.11 에러/빈/로딩 상태

| 상태 | UI |
|------|-----|
| 로딩 (localStorage 읽기) | `<Skeleton variant="card" />` × 3 |
| 이력 없음 | Clock 아이콘 + "이력 없음" + [계산기로 가기] |
| localStorage 접근 오류 | error-100 박스 + "이력을 불러올 수 없습니다" |

---

## 4. 에러 페이지 — 404 / 500

> **담당**: B-09 (Error Page Expert)
> **파일**: `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`

### 4.1 목적

사용자가 잘못된 URL에 접근하거나 서버 오류가 발생했을 때, 팜에듀 브랜드 감성의 친근한 에러 페이지를 표시해 이탈을 최소화하고 홈/이전 페이지로 안내한다.

### 4.2 404 Not Found — `not-found.tsx`

**와이어프레임**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│              [FileQuestion 아이콘 64×64 text-primary-300]            │
│                                                                      │
│                        404                                           │
│               text-8xl font-extrabold text-primary-100               │
│               (뒤에 깔리는 큰 숫자, 장식용)                           │
│                                                                      │
│           페이지를 찾을 수 없습니다                                   │
│           text-2xl font-bold text-primary                            │
│                                                                      │
│    요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.             │
│    text-base text-secondary text-center max-w-sm                     │
│                                                                      │
│        [🏠 홈으로 가기  btn-lg primary]                              │
│        [← 이전 페이지로  btn-lg secondary]                           │
│                                                                      │
│    에러 코드: 404                                                     │
│    text-xs text-muted                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**구현 상세**:
```tsx
// src/app/not-found.tsx
// 서버 컴포넌트 (기본) — 'use client' 불필요
// "이전 페이지로" 버튼은 'use client' 래퍼 컴포넌트로 분리

// BackButton.tsx (client component)
'use client'
import { useRouter } from 'next/navigation'
export function BackButton() {
  const router = useRouter()
  return (
    <Button variant="secondary" size="lg" onClick={() => router.back()}>
      ← 이전 페이지로
    </Button>
  )
}
```

**시각적 처리**:
- 배경: `bg-bg-page min-h-screen flex flex-col items-center justify-center`
- 아이콘: `FileQuestion` (lucide-react) `w-16 h-16 text-primary-300`
- "404" 텍스트: 뒤에 absolute 포지션으로 `text-[180px] font-black text-primary-50 select-none pointer-events-none` — 접근성 위해 `aria-hidden="true"`

### 4.3 500 Error Boundary — `error.tsx`

**요구사항**: Next.js App Router의 에러 바운더리. `'use client'` 필수.

```tsx
// Props: { error: Error & { digest?: string }, reset: () => void }
```

**와이어프레임**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│           [AlertTriangle 아이콘 64×64 text-warning-500]              │
│                                                                      │
│              오류가 발생했습니다                                       │
│              text-2xl font-bold text-primary                         │
│                                                                      │
│    페이지를 불러오는 중 문제가 생겼습니다.                              │
│    잠시 후 다시 시도하거나, 홈으로 이동해 주세요.                       │
│    text-base text-secondary                                          │
│                                                                      │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │ 오류 상세 (개발 환경에만 표시)                            │      │
│    │ {error.message}                                          │      │
│    │ text-xs font-mono text-error-500 bg-error-100 p-3       │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                                                      │
│        [↺ 다시 시도  btn-lg primary]  (onClick: reset())            │
│        [🏠 홈으로 가기  btn-lg secondary]                            │
│                                                                      │
│    에러 코드: 500  |  Digest: {error.digest ?? '-'}                  │
│    text-xs text-muted                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**오류 메시지 표시 조건**:
- `process.env.NODE_ENV === 'development'` 일 때만 `error.message` 노출
- 프로덕션에서는 상세 메시지 숨김 (보안)

### 4.4 전역 에러 바운더리 — `global-error.tsx`

`layout.tsx` 자체의 에러를 잡는 최상위 바운더리. `'use client'` 필수.
`<html>`, `<body>` 태그를 직접 포함해야 함 (layout 대체).

```tsx
// src/app/global-error.tsx
'use client'
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body>
        {/* error.tsx와 동일한 레이아웃, 단 layout.tsx 없이 */}
        <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center gap-6 p-8">
          {/* AlertTriangle 아이콘 + 메시지 + 버튼 (error.tsx와 동일) */}
        </div>
      </body>
    </html>
  )
}
```

**주의**: `global-error.tsx`에서는 Tailwind 클래스를 위해 CSS import가 필요. `globals.css`를 직접 import.

### 4.5 반응형 동작

모든 에러 페이지 동일:
- `flex flex-col items-center justify-center min-h-screen p-4`
- 콘텐츠 `max-w-md mx-auto text-center`
- 버튼: 모바일에서 `flex-col`, 데스크탑에서 `flex-row` (gap-3)

### 4.6 사용할 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<Button variant="primary" size="lg">` | 재시도/홈으로 |
| `<Button variant="secondary" size="lg">` | 이전/홈으로 |
| `FileQuestion` (lucide-react) | 404 아이콘 |
| `AlertTriangle` (lucide-react) | 500 아이콘 |

---

## 5. 로딩 스켈레톤 — Skeleton 컴포넌트

> **담당**: B-10 (Loading Skeleton Expert)
> **파일**: `src/components/ui/Skeleton.tsx` + 각 `loading.tsx`

### 5.1 목적

데이터 로딩 중 빈 화면 대신 콘텐츠 형태를 흉내 낸 스켈레톤 UI를 표시해 체감 성능을 향상시키고 레이아웃 점프를 방지한다.

### 5.2 Skeleton 컴포넌트 API

```typescript
// src/components/ui/Skeleton.tsx
// 서버 컴포넌트로 작성 ('use client' 불필요)

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'table'
  className?: string
  rows?: number      // variant="table" 또는 "text" 시 행 수 (기본값: 3)
  width?: string     // Tailwind width 클래스 (기본: 'w-full')
  height?: string    // Tailwind height 클래스 (기본: variant별 자동)
}

export function Skeleton({ variant = 'rect', className, rows = 3, width, height }: SkeletonProps)
```

### 5.3 변형(Variant) 스펙

#### `variant="text"` — 텍스트 줄 스켈레톤

```
animate-pulse 기본 적용
bg-neutral-200 rounded-md

행 1: w-full h-4        ← 본문 줄
행 2: w-full h-4
행 3: w-3/4 h-4         ← 마지막 줄은 짧게 (자연스러움)
gap-y-2
```

#### `variant="rect"` — 사각형 블록 스켈레톤

```
bg-neutral-200 rounded-xl animate-pulse
기본 크기: w-full h-24
className으로 크기 override 가능
```

#### `variant="circle"` — 원형 (아바타, 아이콘) 스켈레톤

```
bg-neutral-200 rounded-full animate-pulse
기본 크기: w-12 h-12
```

#### `variant="card"` — 카드 전체 스켈레톤

```
Card 레이아웃을 모방한 복합 스켈레톤:

┌──────────────────────────────────────┐
│ [rect w-12 h-12 rounded-xl]  [rect w-16 h-5 rounded-full]  │
│                                      │
│ [text 2줄]                           │
│                                      │
│ [rect w-24 h-4 rounded]              │ ← CTA 영역
└──────────────────────────────────────┘
bg-bg-surface border border-border-light rounded-xl p-6
```

#### `variant="table"` — 테이블 스켈레톤

```
rows 파라미터로 행 수 조절 (기본: 5)

[헤더 행] bg-neutral-200 h-8 w-full rounded-md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[data행 1] bg-neutral-100 h-6 w-full rounded-md my-1
[data행 2] bg-neutral-100 h-6 w-full rounded-md my-1
...
```

### 5.4 애니메이션

```css
/* Tailwind animate-pulse 사용 (별도 CSS 불필요) */
/* 효과: opacity 1 → 0.5 → 1 주기 2s */
```

**주의**: 접근성 고려
```tsx
<div aria-busy="true" aria-label="콘텐츠를 불러오는 중입니다">
  {/* 스켈레톤 내용 */}
</div>
```

### 5.5 각 페이지 로딩 스켈레톤

#### `src/app/quiz/loading.tsx` — 퀴즈 목록 스켈레톤

```
페이지 제목 영역: Skeleton variant="text" rows={1} className="w-32 h-8"
필터 영역: Skeleton variant="rect" className="h-12 w-full"
카드 3개: Skeleton variant="card" × 3 in grid-cols-1 md:grid-cols-2
```

#### `src/app/learn/loading.tsx` — 챕터 목록 스켈레톤

```
검색바: Skeleton variant="rect" className="h-10 w-full"
챕터 카드: Skeleton variant="card" × 6 in grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

#### `src/app/daily/loading.tsx` — 데일리 퀴즈 스켈레톤

```
상단 진행 정보: Skeleton variant="text" rows={1} className="w-48 h-6"
문제 영역: Skeleton variant="rect" className="h-32 w-full"
선택지 4개: Skeleton variant="rect" className="h-12 w-full" × 4
버튼 영역: Skeleton variant="rect" className="h-10 w-32"
```

#### `src/app/calculator/loading.tsx` — 계산기 스켈레톤

```
폼 제목: Skeleton variant="text" rows={1} className="w-40 h-7"
인풋 필드 4개: Skeleton variant="rect" className="h-10 w-full" × 4 (gap-4)
버튼: Skeleton variant="rect" className="h-12 w-full"
결과 영역: Skeleton variant="card" className="mt-6"
```

### 5.6 사용 예시

```tsx
// page.tsx에서 import하여 사용
import { Skeleton } from '@/components/ui/Skeleton'

// 카드 3개 로딩
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {[1, 2, 3].map((i) => (
    <Skeleton key={i} variant="card" />
  ))}
</div>

// 테이블 5행 로딩
<Skeleton variant="table" rows={5} />

// 텍스트 3줄 로딩
<Skeleton variant="text" rows={3} />
```

---

## 6. 챕터 → 퀴즈 연결 UI

> **담당**: B-07 (Chapter-Quiz Link Expert)
> **파일**: `src/app/learn/[slug]/page.tsx` (수정)

### 6.1 목적

챕터 학습 완료 후 자연스럽게 관련 퀴즈로 진입할 수 있는 경로를 챕터 뷰어 하단에 제공. 학습 → 퀴즈의 흐름을 매끄럽게 연결한다.

### 6.2 챕터-퀴즈 매핑 규칙

챕터 slug에서 챕터 번호를 파싱:
```
slug 예시: "ch03-수가계산"
파싱: slug.split('-')[0]  → "ch03"
퀴즈 URL: /quiz/play?category=ch03
```

**매핑 테이블** (구현 기준):

| 챕터 slug 접두사 | 퀴즈 URL | 퀴즈 존재 여부 |
|--------------|---------|-------------|
| ch01 | `/quiz/play?category=ch01` | Phase 5 (있음) |
| ch02 | `/quiz/play?category=ch02` | Phase 5 (있음) |
| ... | ... | ... |
| ch08 | `/quiz/play?category=ch08` | Phase 5 (있음) |
| ch09 | `/quiz/play?category=ch09` | Phase 6B (추가 예정) |
| ch10 | `/quiz/play?category=ch10` | Phase 6B (추가 예정) |
| ch11 | `/quiz/play?category=ch11` | Phase 6B (추가 예정) |
| ch12 | `/quiz/play?category=ch12` | Phase 6B (추가 예정) |

**퀴즈 문제 존재 여부 확인**:
- Supabase에서 `chapter = 파싱된번호` 인 문제 수를 서버 컴포넌트에서 조회
- `count === 0`이면 버튼 비활성화 + "준비 중" 표시

### 6.3 와이어프레임

챕터 뷰어 하단, 기존 "이전/다음 챕터" 버튼 위:

```
┌─────────────────────────────────────────────────────────────────────┐
│  챕터 내용 ... (기존)                                                │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│                                                                      │
│  ╔═══════════════════════════════════════════════════════════════╗   │
│  ║                                                               ║   │
│  ║  이 챕터를 학습했다면 퀴즈로 확인해 보세요!                    ║   │
│  ║                                                               ║   │
│  ║  CH03 챕터 퀴즈                              N문제 준비됨      ║   │
│  ║                                                               ║   │
│  ║      [퀴즈 풀기  →  btn-lg primary  w-full]                   ║   │
│  ║      (완료 시: [다시 풀기  ↺  btn-lg secondary  w-full])      ║   │
│  ║                                                               ║   │
│  ╚═══════════════════════════════════════════════════════════════╝   │
│                                                                      │
│  ─── 이전/다음 챕터 네비게이션 (기존) ─────────────────────────────  │
│  [← CH02 약국 수가]              [CH04 조제 가산 →]                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.4 "퀴즈 풀기" 버튼 상태 정의

| 상태 | 조건 | UI |
|------|------|-----|
| **미완료** (기본) | localStorage에 완료 기록 없음 | `[퀴즈 풀기 →]` primary |
| **완료** | `pharmaedu_quiz_history`에 해당 챕터 완료 기록 | `[다시 풀기 ↺]` secondary |
| **준비 중** | 해당 챕터 문제 count === 0 | `[퀴즈 준비 중]` disabled + "곧 추가됩니다" |
| **로딩** | 문제 수 조회 중 | `<Skeleton variant="rect" className="h-14 w-full">` |

**완료 여부 판단**:
```typescript
// localStorage 키 패턴
const historyKey = 'pharmaedu_quiz_history'
// 기존 히스토리 타입에서 chapter 필드로 필터
// 해당 챕터의 정답률이 있으면 "완료"로 처리
```

### 6.5 퀴즈 연결 섹션 컴포넌트 구조

```tsx
// ChapterQuizCta.tsx (server component가 데이터 패칭, client child로 상태 판단)

// 서버 컴포넌트에서:
// 1. slug → chapterNumber 파싱
// 2. Supabase에서 해당 챕터 문제 수 조회
// 3. count, chapterNumber를 client 컴포넌트에 props로 전달

// 클라이언트 컴포넌트에서:
// 1. localStorage 완료 여부 확인
// 2. 버튼 상태 결정 및 렌더링
```

### 6.6 UI 상세

```
배경: bg-primary-50 border border-primary-200 rounded-xl p-6
아이콘: HelpCircle (lucide-react) text-primary-500 w-6 h-6
제목: text-lg font-semibold text-primary
부제: text-sm text-secondary "N문제가 준비되어 있습니다"

버튼 [퀴즈 풀기]:
  variant="primary" size="lg" className="w-full mt-4"
  아이콘: ArrowRight w-5 h-5

버튼 [다시 풀기]:
  variant="secondary" size="lg" className="w-full mt-4"
  아이콘: RotateCcw w-5 h-5
```

### 6.7 반응형 동작

| 화면 | 레이아웃 |
|------|--------|
| 모든 화면 | 전체 너비 (`w-full`) — 챕터 콘텐츠 컨테이너 내부 |
| 모바일 | 버튼 전체 너비 유지 |

### 6.8 사용할 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<Button variant="primary" size="lg">` | 퀴즈 풀기 |
| `<Button variant="secondary" size="lg">` | 다시 풀기 |
| `<Skeleton variant="rect">` | 로딩 |
| `HelpCircle`, `ArrowRight`, `RotateCcw` (lucide-react) | 아이콘 |

---

## 7. 검색 기능 — `/learn`

> **담당**: B-11 (Learn Search Completion Expert)
> **파일**: `src/app/learn/page.tsx` (수정)

### 7.1 목적

기존 `useState`만으로 동작하던 검색을 URL 파라미터(`?q=`, `?difficulty=`)와 연동해 검색 결과를 공유 가능하게 만들고, 난이도 태그 필터와 빈 결과 UX를 개선한다.

### 7.2 URL 파라미터 스펙

| 파라미터 | 예시 | 설명 |
|---------|------|------|
| `q` | `/learn?q=조제료` | 텍스트 검색어 |
| `difficulty` | `/learn?difficulty=중급` | 난이도 필터 (초급/중급/고급) |

두 파라미터 동시 사용 가능: `/learn?q=보훈&difficulty=고급`

### 7.3 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  학습 콘텐츠                                                          │
│                                                                      │
│  ─── 검색 바 (상단 고정) ─────────────────────────────────────────── │
│  ┌────────────────────────────────────────────┐                      │
│  │ 🔍  챕터명, 키워드로 검색...                │  ← Input 컴포넌트  │
│  └────────────────────────────────────────────┘                      │
│                                                                      │
│  ─── 난이도 필터 태그 ──────────────────────────────────────────────  │
│  [전체]  [초급]  [중급]  [고급]       (필터 적용 시: [× 초기화])     │
│                                                                      │
│  ─── 결과 요약 ──────────────────────────────────────────────────── │
│  "조제료" 검색 결과 N개                 text-sm text-muted           │
│                                                                      │
│  ─── 챕터 카드 그리드 ──────────────────────────────────────────────  │
│  ┌────────┐ ┌────────┐ ┌────────┐                                   │
│  │ CH01   │ │ CH03   │ │ CH07   │   ← 검색어 일치 텍스트 하이라이트  │
│  │조│제│료│ │(하이라이트)        │   │                               │
│  └────────┘ └────────┘ └────────┘                                   │
│                                                                      │
│  ─── 빈 결과 상태 ──────────────────────────────────────────────── │
│            [Search 아이콘 large text-neutral-300]                    │
│      "조제요율"에 대한 검색 결과가 없습니다.                           │
│      검색어를 확인하거나 다른 키워드로 검색해 보세요.                   │
│                 [검색 초기화 btn-ghost]                              │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.4 검색 바 상세

```tsx
// Input 컴포넌트 사용
<Input
  type="search"
  placeholder="챕터명, 키워드로 검색..."
  value={query}
  onChange={(e) => handleQueryChange(e.target.value)}
  className="w-full"
  // 아이콘: Search (lucide-react) 왼쪽 inside padding
/>
```

**실시간 필터링 동작**:
- `onChange`로 즉시 필터 (debounce 없음 — 로컬 필터이므로 성능 문제 없음)
- URL 업데이트: `useRouter().push()` + `useSearchParams()` 연동
- URL 업데이트는 `setTimeout(0)` 또는 `useTransition`으로 UI 차단 없이 처리

### 7.5 난이도 필터 버튼

```tsx
const difficulties = ['전체', '초급', '중급', '고급']

// 각 버튼: variant="ghost" 기본, 선택 시 variant="primary"
// 클릭 → URL ?difficulty= 업데이트
```

**버튼 스타일**:
```
비선택: border border-border-light rounded-full px-3 py-1 text-sm text-secondary
선택됨: bg-primary-500 text-white rounded-full px-3 py-1 text-sm font-medium
```

### 7.6 검색어 하이라이트

챕터 카드의 제목과 설명 텍스트에서 검색어와 일치하는 부분을 강조:

```tsx
// 하이라이트 유틸 함수
function highlight(text: string, query: string): ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-warning-100 text-warning-700 rounded px-0.5">{part}</mark>
      : part
  )
}
```

### 7.7 필터 초기화 버튼

```
조건: query.trim() !== '' 또는 difficulty !== '전체' 일 때 표시
위치: 난이도 필터 버튼 오른쪽 끝
UI: [× 필터 초기화] ghost 버튼, text-error-500
동작: query = '', difficulty = '전체', URL에서 파라미터 제거
```

### 7.8 빈 결과 상태

```
아이콘: Search (lucide-react) w-12 h-12 text-neutral-300
제목: '"{query}"에 대한 검색 결과가 없습니다.' text-lg font-medium text-primary
설명: '검색어를 확인하거나 다른 키워드로 검색해 보세요.' text-sm text-secondary
CTA: [검색 초기화] ghost 버튼
```

### 7.9 Suspense 래핑 (필수)

`useSearchParams()` 사용 시 Next.js에서 `Suspense` 래핑 요구:

```tsx
// src/app/learn/page.tsx
import { Suspense } from 'react'

export default function LearnPage() {
  return (
    <Suspense fallback={<LearnLoadingSkeleton />}>
      <LearnContent />
    </Suspense>
  )
}

// LearnContent: 'use client' — useSearchParams 사용
```

### 7.10 반응형 동작

| 화면 | 레이아웃 |
|------|--------|
| 데스크탑 (≥1024px) | 검색바 + 난이도 버튼 1행, 챕터 3열 그리드 |
| 태블릿 (640–1023px) | 검색바 전체너비, 난이도 버튼 스크롤, 2열 그리드 |
| 모바일 (< 640px) | 검색바 전체너비, 난이도 버튼 가로 스크롤, 1열 |

### 7.11 사용할 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<Input type="search">` | 검색 바 |
| `<Badge>` | 난이도 뱃지 (카드 내) |
| `<Button variant="ghost">` | 필터 초기화 |
| `<Skeleton variant="card">` | 로딩 |

---

## 8. 관리자 페이지 — `/admin`

> **담당**: C-02 (Admin Page Expert)
> **파일**: `src/app/admin/page.tsx`, `src/app/admin/actions.ts`, 등

### 8.1 목적

관리자가 퀴즈 문제를 웹 UI에서 직접 CRUD할 수 있는 보호된 관리 페이지. 클라이언트에 비밀 키를 노출하지 않는 서버사이드 인증 방식 사용.

### 8.2 인증 플로우

```
사용자 → /admin 접근
  ↓
middleware or 서버 컴포넌트에서 쿠키 확인
  ↓ (쿠키 없음 또는 불일치)
비밀번호 입력 폼 표시
  ↓ (폼 제출)
Server Action: 입력값 == process.env.ADMIN_SECRET 비교
  ↓ (일치)
cookies().set('admin_token', hash값, { httpOnly: true, sameSite: 'strict' })
/admin 리다이렉트 (인증 완료)
  ↓ (불일치)
오류 메시지 표시
```

### 8.3 비밀번호 입력 폼 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│              [Shield 아이콘 48×48 text-primary-500]                  │
│                                                                      │
│                   관리자 로그인                                       │
│              text-2xl font-bold text-primary                         │
│                                                                      │
│         팜에듀 관리자만 접근할 수 있습니다.                            │
│         text-sm text-secondary                                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  🔑  관리자 비밀번호                                          │   │
│  │  [••••••••••••  Input type="password"  w-full]               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│              [로그인  btn-lg primary  w-full]                        │
│                                                                      │
│         (오류 시) 비밀번호가 올바르지 않습니다.                        │
│         text-sm text-error-500                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**보안 규칙**:
- `ADMIN_SECRET` — `NEXT_PUBLIC_` 접두사 절대 금지
- 비밀번호 비교는 Server Action에서만
- 쿠키: `httpOnly: true`, `secure: true (prod)`, `sameSite: 'strict'`
- 세션 만료: 24시간 (`maxAge: 60 * 60 * 24`)

### 8.4 관리자 대시보드 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  관리자 대시보드                          [로그아웃 btn-ghost]         │
│  퀴즈 문제 관리                                                       │
│                                                                      │
│  ─── 필터/검색 + 추가 버튼 ─────────────────────────────────────── │
│  [챕터 전체 ▾]  [난이도 전체 ▾]  [검색...]      [+ 문제 추가]       │
│                                                                      │
│  ─── 문제 목록 테이블 ──────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ # │ 챕터 │ 문제 (미리보기)         │ 난이도 │ 수정일 │ 액션  │   │
│  │───┼──────┼──────────────────────  ┼────────┼────────┼──────│   │
│  │ 1 │ CH01 │ 건강보험 가입자 A씨가... │ 쉬움   │ 04-05  │[수정]│   │
│  │   │      │                        │        │        │[삭제]│   │
│  │───┼──────┼──────────────────────  ┼────────┼────────┼──────│   │
│  │ 2 │ CH03 │ 다음 중 조제료 계산 시...│ 보통   │ 04-06  │[수정]│   │
│  │   │      │                        │        │        │[삭제]│   │
│  │ ...│      │                        │        │        │      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  1-20 / 전체 N건   [← 이전]  1 2 3 ... [다음 →]                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.5 문제 추가/수정 폼 와이어프레임

별도 라우트 `/admin/questions/new` 및 `/admin/questions/[id]/edit`:

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← 목록으로 돌아가기]                                               │
│                                                                      │
│  문제 추가 / 수정                                                     │
│                                                                      │
│  챕터 번호 *    [Input number min=1 max=12]                          │
│                                                                      │
│  난이도 *       [Select: 1-쉬움 / 2-보통 / 3-어려움]                 │
│                                                                      │
│  문제 텍스트 *  [Textarea rows=4 placeholder="문제를 입력하세요"]    │
│                                                                      │
│  선택지        (객관식인 경우 입력, 주관식이면 비워두기)               │
│  선택지 1      [Input]                                               │
│  선택지 2      [Input]                                               │
│  선택지 3      [Input]                                               │
│  선택지 4      [Input]                                               │
│                [+ 선택지 추가] ghost btn-sm                          │
│                                                                      │
│  정답 *        [Input placeholder="선택지 중 하나 또는 주관식 답"]   │
│                                                                      │
│  해설          [Textarea rows=3 placeholder="해설 (선택사항)"]       │
│                                                                      │
│  [취소 btn-secondary]         [저장 btn-primary]                     │
│                                                                      │
│  (저장 중) [Spinner] 저장 중...                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.6 Server Actions 구조

```typescript
// src/app/admin/actions.ts
'use server'

// 인증 확인 공통 헬퍼
async function requireAdmin(): Promise<void>  // 실패 시 redirect('/')

// CRUD 액션
export async function createQuestion(formData: FormData): Promise<void>
export async function updateQuestion(id: string, formData: FormData): Promise<void>
export async function deleteQuestion(id: string): Promise<void>
export async function loginAdmin(formData: FormData): Promise<{ error?: string }>
export async function logoutAdmin(): Promise<void>
```

**삭제 확인**: 테이블 내 [삭제] 버튼 클릭 시 `window.confirm()` 후 Server Action 호출.

### 8.7 페이지네이션

- 페이지당 20건
- URL 파라미터: `/admin?page=2`
- 서버 컴포넌트에서 `searchParams.page` 읽어 Supabase `.range()` 처리

### 8.8 반응형 동작

| 화면 | 레이아웃 |
|------|--------|
| 데스크탑 (≥1024px) | 전체 테이블 표시 |
| 태블릿 (640–1023px) | 테이블 수평 스크롤 (`overflow-x-auto`) |
| 모바일 (< 640px) | 테이블 대신 카드 리스트 형태로 전환 권장 |

**모바일 카드 형태**:
```
┌──────────────────────────┐
│ CH03 · 보통              │
│ 다음 중 조제료 계산...   │
│ 2026-04-06               │
│ [수정] [삭제]            │
└──────────────────────────┘
```

### 8.9 사용할 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<Input>` | 폼 입력 |
| `<Select>` | 챕터, 난이도 선택 |
| `<Button variant="primary">` | 저장, 추가 |
| `<Button variant="ghost">` | 취소, 로그아웃 |
| `<Spinner>` | 저장/삭제 중 로딩 |
| `<Card variant="standard">` | 모바일 문제 카드 |

### 8.10 에러/빈/로딩 상태

| 상태 | UI |
|------|-----|
| 인증 실패 | "비밀번호가 올바르지 않습니다." text-error-500 |
| 문제 없음 | "등록된 문제가 없습니다." + [첫 문제 추가하기] |
| 저장 중 | 버튼 disabled + `<Spinner>` 표시 |
| 삭제 실패 | error-100 박스 토스트 표시 |

---

## 9. 계산형 동적 문제 UI

> **담당**: C-01 (Dynamic Question Generator Expert)
> **파일**: `src/app/quiz/dynamic/page.tsx`, `src/app/quiz/dynamic/DynamicPlayer.tsx`, `src/app/api/quiz/dynamic/route.ts`

### 9.1 목적

Phase 5 계산 엔진을 활용해 매번 다른 조건의 계산 문제를 동적으로 생성. 실제 계산 훈련에 가장 가까운 형태의 퀴즈를 제공한다.

### 9.2 문제 생성 방식

```
사용자: 난이도 선택 (1=초급/2=중급/3=고급)
  ↓
GET /api/quiz/dynamic?difficulty=2
  ↓ (서버)
1. 난이도에 따른 랜덤 CalcOptions 생성
   - 초급: 건강보험(G100/G200) + 단순 조건
   - 중급: 의료급여(D10/D20) 또는 선별급여 추가
   - 고급: 보훈(M코드), 복합 조건, 특수약품
2. calculate(options) 호출 → 정답(userPrice) 확정
3. 오답 선택지 3개 생성 (정답 ±10~30% 범위 난수, 백원 단위 반올림)
4. JSON 반환: { question, choices, answer, explanation, options }
  ↓
클라이언트: DynamicPlayer에서 렌더링
```

### 9.3 와이어프레임

```
┌─────────────────────────────────────────────────────────────────────┐
│  계산형 동적 문제                                                     │
│  매번 다른 조건의 계산 문제를 풀어보세요.                              │
│                                                                      │
│  ─── 난이도 선택 ────────────────────────────────────────────────── │
│  [초급]  [중급 ✓선택]  [고급]                                        │
│                                                                      │
│  ─── 계산기 미니 + 문제 영역 ───────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [다음 문제 생성 ↻] btn-ghost                                 │   │
│  │                                                              │   │
│  │  문제                                                         │   │
│  │  ─────────────────────────────────────────────              │   │
│  │  환자 A씨는 건강보험 가입자(G200)이며, 내과 처방전을          │   │
│  │  가지고 방문했습니다. 투약일수는 30일이며 총약제비는           │   │
│  │  48,250원입니다. 선별급여 항목(80%)이 포함되어 있을 때        │   │
│  │  환자 본인부담금은 얼마입니까?                                 │   │
│  │                                                              │   │
│  │  ─── 계산기 미니 ─────────────────────────────────────────  │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  총약제비   [48,250       원]                        │   │   │
│  │  │  보험유형   [G200 — 건강보험 일반]                    │   │   │
│  │  │  투약일수   [30           일]                        │   │   │
│  │  │  선별급여   [80%         ☑ 포함]                     │   │   │
│  │  │                        [계산하기 btn-primary btn-sm]│   │   │
│  │  │                                                      │   │   │
│  │  │  → 계산 결과: ?????원 (답 입력 전 숨김)              │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                              │   │
│  │  ─── 답 입력 ────────────────────────────────────────────  │   │
│  │  ① 12,000원    ② 14,480원    ③ 17,500원    ④ 9,650원      │   │
│  │  (선택지 클릭 후)                                             │   │
│  │                        [답 제출 btn-lg primary]             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ─── 해설 (제출 후 표시) ─────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ✅ 정답입니다!  (또는 ❌ 오답입니다.)                        │   │
│  │                                                              │   │
│  │  계산 과정                                                    │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  1. 기본 조제료 계산: ...                                     │   │
│  │  2. 선별급여 80% 적용: 총약제비 × 0.8 = 38,600원             │   │
│  │  3. 건강보험 본인부담율 30% 적용: 38,600 × 0.3 = 11,580원   │   │
│  │  4. 일반약제비 본인부담: 48,250 × 0.2 × 0.3 = 2,895원      │   │
│  │  5. 합계: 11,580 + 2,895 = 14,480원 (백원 미만 반올림)      │   │
│  │                                                              │   │
│  │  엔진 검증: calculate(options).userPrice = 14,480원 ✓        │   │
│  │                                                              │   │
│  │         [다음 문제 →] btn-primary    [오답노트 저장] btn-ghost│   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.4 "계산기 미니" 컴포넌트 상세

계산기 미니는 문제에서 제시된 조건을 그대로 채워서 표시되는 인터랙티브 영역:

```
상태 A (계산 전):
  - 입력 필드: 문제 조건으로 pre-filled + read-only (강조 표시)
  - "계산하기" 버튼 활성
  - 결과 영역: "?" 또는 비어있음

상태 B (계산 후):
  - 결과 숫자 표시 (애니메이션 count-up 선택적)
  - 하지만 "올바른 결과"임을 바로 알 수 없음 (힌트 방지)
  - 계산 결과는 선택지 중 하나와 일치 → 사용자가 직접 선택해야 함
```

**계산기 미니 필드 목록** (문제 난이도에 따라 표시/숨김):

| 필드 | 표시 조건 |
|------|---------|
| 총약제비 | 항상 |
| 보험유형 | 항상 |
| 투약일수 | 항상 |
| 선별급여 여부/비율 | 선별급여 조건 포함 시 |
| 직접조제 여부 | 직접조제 조건 포함 시 |
| 특수약품 여부 | 특수 조건 포함 시 |

### 9.5 해설 섹션 계산 과정 표시

```typescript
// route.ts에서 반환하는 explanation 형식
interface DynamicExplanation {
  steps: ExplanationStep[]
  engineResult: {
    userPrice: number
    totalPrice: number
    nhisPrice: number
  }
}

interface ExplanationStep {
  stepNumber: number
  description: string   // "선별급여 80% 적용"
  formula: string       // "48,250 × 0.8 = 38,600"
  result: number        // 38600
}
```

해설 UI:
```
각 step: [번호] [설명] — [수식] = [결과]원
배경: bg-bg-panel rounded-lg p-4 font-mono text-sm
엔진 검증 행: text-success-500 "엔진 검증: calculate(options).userPrice = N,NNN원 ✓"
```

### 9.6 선택지 UI

```tsx
// 4개 선택지, 가로 2×2 grid (모바일: 세로 1열)
<div className="grid grid-cols-2 gap-3 mt-4">
  {choices.map((choice, i) => (
    <button
      key={i}
      className={cn(
        "p-3 rounded-xl border text-left text-sm font-medium transition-all",
        selected === i
          ? "border-primary-500 bg-primary-50 text-primary-700"
          : "border-border-light bg-bg-surface text-primary hover:border-primary-300"
      )}
      onClick={() => setSelected(i)}
    >
      {['①', '②', '③', '④'][i]} {choice.toLocaleString()}원
    </button>
  ))}
</div>
```

### 9.7 오답 노트 연동

정답/오답 판별 후 "오답노트 저장" 버튼 (오답 시에만 활성):
- `pharmaedu_wrong_notes`에 해당 문제 추가
- 동적 문제이므로 `id` = `dynamic_${timestamp}` 형식
- `questionText`에 문제 전문 저장
- B-06의 `src/lib/quiz/wrong-notes.ts` 함수 import 사용

### 9.8 로딩 상태 (문제 생성 중)

```
API 호출 중 (약 1~3초 소요):
[Spinner 아이콘] 문제를 생성하는 중입니다...
문제 영역 전체: Skeleton variant="rect" className="h-64 w-full"
```

### 9.9 오류 상태

```
API 오류 (계산 엔진 실패 등):
[AlertCircle 아이콘 text-error-500]
문제를 생성할 수 없습니다. 잠시 후 다시 시도해 주세요.
[다시 시도 btn-primary]  [일반 퀴즈로 btn-ghost]
```

### 9.10 반응형 동작

| 화면 | 레이아웃 |
|------|--------|
| 데스크탑 (≥1024px) | `max-w-3xl mx-auto` 중앙 정렬 |
| 태블릿 (640–1023px) | 전체 너비 |
| 모바일 (< 640px) | 선택지 `grid-cols-1` (2×2 → 1열), 계산기 미니 간소화 |

### 9.11 사용할 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<Card variant="elevated">` | 문제 카드 |
| `<Card variant="standard">` | 해설 카드 |
| `<Input>` | 계산기 미니 입력 필드 |
| `<Select>` | 보험유형 선택 |
| `<Button variant="primary">` | 계산하기, 답 제출, 다음 문제 |
| `<Button variant="ghost">` | 오답노트 저장 |
| `<Spinner>` | 문제 생성 로딩 |
| `<Skeleton>` | 로딩 스켈레톤 |
| `<Badge>` | 난이도 뱃지 |

---

## 부록 A — 화면별 담당팀 요약

| 화면 | 담당 | 파일 위치 |
|------|------|---------|
| 홈 리뉴얼 (4-Card) | B-01 | `src/app/page.tsx` |
| 오답 노트 | B-06 | `src/app/quiz/wrong-notes/` |
| 계산 이력 | B-08 | `src/app/calculator/history/` |
| 에러 페이지 (404/500) | B-09 | `src/app/not-found.tsx`, `error.tsx` |
| 로딩 스켈레톤 | B-10 | `src/components/ui/Skeleton.tsx` + `loading.tsx` 파일들 |
| 챕터→퀴즈 연결 | B-07 | `src/app/learn/[slug]/page.tsx` |
| 검색 기능 | B-11 | `src/app/learn/page.tsx` |
| 관리자 페이지 | C-02 | `src/app/admin/` |
| 동적 문제 UI | C-01 | `src/app/quiz/dynamic/` |

---

## 부록 B — localStorage 키 레퍼런스

| 키 | 담당 | 용도 |
|----|------|------|
| `pharmaedu_wrong_notes` | B-06 | 오답 노트 목록 |
| `pharmaedu_calc_history` | B-08 | 계산 이력 |
| `pharmaedu_prefill_options` | B-08 | 재계산 prefill 임시 저장 |
| `pharmaedu_daily_completed_YYYY-MM-DD` | B-01 (읽기) | 오늘 Daily 완료 여부 |
| `pharmaedu_quiz_history` | 기존 | 퀴즈 이력 (B-07이 참조) |

---

## 부록 C — 공통 빈 상태 패턴

모든 화면의 빈 상태는 아래 패턴을 따른다:

```tsx
// 빈 상태 공통 패턴
<div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
  <Icon className="w-12 h-12 text-neutral-300" aria-hidden="true" />
  <div>
    <p className="text-lg font-medium text-text-primary">제목</p>
    <p className="text-sm text-text-secondary mt-1">설명 문구</p>
  </div>
  <Button variant="primary" size="md">행동 유도 버튼</Button>
</div>
```

---

*[약제비 분석용]*
