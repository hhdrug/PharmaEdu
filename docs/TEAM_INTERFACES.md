# TEAM_INTERFACES.md — 팀 간 인터페이스 정의

> **파일 충돌 방지를 위한 팀별 영역 및 공통 규칙.**  
> 최종 수정: 2026-04-06

---

## 1. Phase 개요

```
Phase 1 — Foundation (완료)
    └── Supabase 연결, 테이블 시딩, 홈페이지 연결 확인
            │
            ▼
Phase 2 — Option Teams (병렬 진행)
    ├── Calculator Team   → /calculator + 계산 엔진
    ├── Learning Team     → /learn + 챕터 콘텐츠
    └── Quiz Team         → /quiz + /daily + quiz_questions 테이블
```

Phase 1이 완료된 상태에서 3개 팀이 독립적으로 병렬 작업한다.  
각 팀은 **자신에게 할당된 디렉토리** 외에는 원칙적으로 건드리지 않는다.

---

## 2. 팀별 소유 디렉토리

### Calculator Team
```
src/app/calculator/          ← 계산기 페이지 전체 소유
src/lib/calc-engine/         ← TypeScript 계산 엔진 (C# 포팅)
src/app/api/calculate/       ← Route Handler (서버사이드 계산 API)
src/types/calc.ts            ← 계산 관련 타입 정의 (CalcOptions, CalcResult 등)
```

**허용 작업**
- `src/app/calculator/` 하위 모든 파일 자유롭게 생성·수정
- `src/lib/calc-engine/` 하위 계산 엔진 파일 자유롭게 생성
- `src/app/api/calculate/route.ts` 생성 및 수정

**금지 작업**
- `src/app/learn/`, `src/app/quiz/`, `src/app/daily/` 접근 금지
- 공통 파일 수정 시 아래 섹션 4 규칙 준수

---

### Learning Team
```
src/app/learn/               ← 학습 페이지 전체 소유
src/content/chapters/        ← 챕터별 콘텐츠 (Markdown 또는 MDX)
src/types/content.ts         ← 콘텐츠 관련 타입 정의
```

**허용 작업**
- `src/app/learn/` 하위 모든 파일 자유롭게 생성·수정
- `src/content/chapters/` 하위 챕터 파일 생성
  - 파일명 규칙: `ch00.md`, `ch01.md`, ..., `ch12.md`
  - 원본: `C:\Projects\DSNode\약제비 분석용\output\CH00-CH12.md` 참조

**금지 작업**
- `src/app/calculator/`, `src/app/quiz/`, `src/app/daily/` 접근 금지
- `supabase/migrations/` 신규 파일 생성 금지 (Learning은 DB 테이블 불필요)

---

### Quiz Team
```
src/app/quiz/                ← 퀴즈 페이지 전체 소유
src/app/daily/               ← 오늘의 문제 페이지 전체 소유
supabase/migrations/         ← quiz_questions 테이블 추가 마이그레이션 1개만
src/types/quiz.ts            ← 퀴즈 관련 타입 정의
```

**허용 작업**
- `src/app/quiz/` 및 `src/app/daily/` 하위 모든 파일 자유롭게 생성·수정
- `supabase/migrations/`에 새 파일 추가 (기존 파일 수정 절대 금지)
  - 파일명 규칙: `20260406000002_create_quiz_tables.sql` (타임스탬프 순서 유지)

**quiz_questions 테이블 스키마 (Quiz Team이 적용)**
```sql
CREATE TABLE quiz_questions (
  id          BIGSERIAL PRIMARY KEY,
  chapter     SMALLINT NOT NULL,
  question    TEXT NOT NULL,
  options     JSONB,                    -- 객관식: ["①...", "②..."], 단답식: null
  answer      TEXT NOT NULL,
  explanation TEXT,
  difficulty  SMALLINT NOT NULL DEFAULT 1  -- 1=쉬움, 2=보통, 3=어려움
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 읽기" ON quiz_questions FOR SELECT USING (true);
```

**금지 작업**
- `src/app/calculator/`, `src/app/learn/` 접근 금지
- 기존 마이그레이션 파일(`20260406000001_*.sql`) 수정 절대 금지

---

## 3. 공통 컴포넌트 사용 규칙

### 공통 UI 컴포넌트 위치
```
src/components/ui/           ← 재사용 UI 컴포넌트
```

**현재 상태**: 비어있음. Phase 2 진행 중 필요한 팀이 먼저 생성하고 다른 팀이 import하여 재사용.

**생성 규칙**
- 컴포넌트 파일명: PascalCase (예: `Button.tsx`, `Card.tsx`, `InputField.tsx`)
- 반드시 TypeScript + 명시적 Props 타입 정의
- Tailwind 클래스만 사용 (별도 CSS 파일 생성 금지)
- `'use client'` 또는 `'use server'` 명시 필수

**사용 예시**
```typescript
// 어느 팀에서나 공통 컴포넌트 import 가능
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
```

**공통 컴포넌트 수정 시**: 수정 전 다른 팀에 영향 없는지 반드시 확인. 기존 Props 인터페이스를 파괴하는 변경 금지 (새 optional Props 추가만 허용).

---

## 4. 공통 파일 접근 규칙

### `src/app/layout.tsx` — 네비게이션 추가만 허용
현재 상태:
```tsx
// 네비게이션 없음 — 단순 body 래퍼만 존재
<body className="bg-slate-50 text-slate-900 antialiased">
  {children}
</body>
```

각 팀은 자신의 페이지 완성 후 `layout.tsx`에 네비게이션 링크를 추가한다.

**허용되는 변경**
```tsx
// nav 추가 예시 — 각 팀이 자신의 링크를 추가
<nav>
  <a href="/calculator">계산기</a>
  <a href="/learn">학습</a>
  <a href="/quiz">퀴즈</a>
  <a href="/daily">오늘의 문제</a>
</nav>
```

**금지되는 변경**
- `<html lang="ko">` 속성 변경 금지
- `metadata` export 수정 금지
- `globals.css` import 제거 금지
- 전체 레이아웃 구조 변경 금지 (nav 추가는 허용, 전면 재구성은 금지)

---

### `src/app/globals.css` — 절대 수정 금지
```css
/* 현재 내용 — 1줄 */
@import "tailwindcss";
```
이 파일은 수정하지 않는다. Tailwind 유틸리티 클래스를 컴포넌트에 인라인으로 작성할 것.

---

### `src/lib/supabase.ts` / `supabase-server.ts` — 수정 금지
Supabase 클라이언트 팩토리는 현재 구현이 완성되어 있다. 수정하지 않고 import하여 사용.

```typescript
// 서버 컴포넌트에서
import { createServerSupabase } from '@/lib/supabase-server';
const supabase = await createServerSupabase();

// 클라이언트 컴포넌트('use client')에서
import { createClient } from '@/lib/supabase';
const supabase = createClient();
```

---

## 5. 팀 간 의존성 정리

### Calculator Team이 제공하는 것 (다른 팀이 활용 가능)
- `src/lib/calc-engine/` — 계산 로직 함수들
  - 예: `calcDispensingFee(options)`, `calcCopayment(options, result)` 등
  - Learning Team의 챕터 내 인터랙티브 예제에서 활용 가능

### Learning Team이 제공하는 것
- `src/content/chapters/*.md` — 챕터별 콘텐츠
  - Quiz Team이 퀴즈 문제 작성 시 참고 자료로 활용

### Quiz Team이 제공하는 것
- `quiz_questions` 테이블 — 퀴즈 데이터
  - 향후 Learning Team 챕터 페이지 하단의 "이 챕터 퀴즈" 기능에 활용 가능

---

## 6. 타입 공유 규칙

각 팀은 자신의 타입을 `src/types/` 하위 파일로 정의한다.

| 파일 | 소유 팀 | 내용 |
|------|---------|------|
| `src/types/calc.ts` | Calculator | CalcOptions, CalcResult, DrugItem, WageListItem 등 |
| `src/types/content.ts` | Learning | Chapter, ChapterMeta 등 |
| `src/types/quiz.ts` | Quiz | QuizQuestion, QuizAnswer 등 |
| `src/types/supabase.ts` | 공통 | Supabase 테이블 Row 타입 (생성 시 공유) |

**타입 import 시**: 다른 팀의 타입을 import하는 것은 허용되나, 해당 팀의 타입 파일을 직접 수정하는 것은 금지.

---

## 7. 개발 시작 체크리스트

각 팀원이 작업 시작 전 확인할 항목:

```
[ ] PROJECT_CONTEXT.md 읽기 완료
[ ] TEAM_INTERFACES.md 읽기 완료
[ ] npm install 완료
[ ] .env.local 파일 존재 확인 (Supabase URL·Key 설정 필요)
[ ] npm run dev 실행 → localhost:3000 홈페이지에서 Supabase 연결 OK 확인
[ ] 자신의 팀 브랜치 생성 (feat/calculator, feat/learning, feat/quiz)
[ ] C# 계산 엔진 참조 파일 경로 확인
    C:\Projects\DSNode\약제비 분석용\YakjaebiCalc\YakjaebiCalc.Engine\
```

---

## 8. 커밋 메시지 규칙

```
feat(calculator): 조제료 기본 계산 엔진 TypeScript 포팅
feat(learning): CH03 챕터 페이지 구현
feat(quiz): quiz_questions 테이블 마이그레이션 추가
fix(calculator): 야간 가산율 계산 오류 수정
chore: 공통 Button 컴포넌트 추가
```

---

*[약제비 분석용]*
