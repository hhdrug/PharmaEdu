# Supabase Seeds — 실행 순서 가이드

팜에듀 Quiz 콘텐츠를 DB에 올리는 순서 요약. 모든 파일은 Supabase 대시보드
SQL Editor 에서 **복사-붙여넣기 → Run** 방식으로 실행.

## 📋 전체 실행 순서 (최초 셋업)

### Step 0. 마이그레이션 (테이블 생성, 최초 1회만)

이미 `quiz_question` / `quiz_category` / `drug_master` / `quiz_templates` 테이블이 있다면 스킵.

```
supabase/migrations/20260408000001_quiz_redesign.sql
```

### Step 1. 기반 데이터

```
supabase/seeds/quiz_redesign.sql            ─ 12개 카테고리 (CH01~CH12) + 약품 마스터 50개
supabase/seeds/quiz_redesign_part2.sql      ─ 기본 50문 (pre-existing)
```

### Step 2. 기존 챕터 문제 (CH09~CH12 정적 문제)

```
supabase/seeds/seed_quiz_ch09.sql
supabase/seeds/seed_quiz_ch10.sql
supabase/seeds/seed_quiz_ch11.sql
supabase/seeds/seed_quiz_ch12.sql
```

### Step 3. Phase 2 CH01-CH08 기본 문제 (총 48문)

```
supabase/seeds/seed_quiz_ch01_ch04.sql      ─ CH01-CH04 각 6문 (24)
supabase/seeds/seed_quiz_ch05_ch08.sql      ─ CH05-CH08 각 6문 (24)
```

### Step 4. 동적 생성 템플릿 (총 90개)

```
supabase/seeds/quiz_templates_seed.sql          ─ 20개 기본
supabase/seeds/quiz_templates_expansion.sql     ─ +70개 (방안 1)
```

이 단계만 끝나도 `/quiz/dynamic` 에서 **무한 문제 생성** 가능.

### Step 5. Phase Q 확장 (총 +235문)

```
supabase/seeds/seed_quiz_ch11_scenarios.sql          ─ CH11 시나리오 자동변환 50문
supabase/seeds/seed_quiz_ch01_ch04_expansion.sql     ─ CH01-04 개념 확장 60문
supabase/seeds/seed_quiz_ch05_ch08_expansion.sql     ─ CH05-08 개념 확장 60문
supabase/seeds/seed_quiz_ch09_ch12_expansion.sql     ─ CH09-12 개념 확장 40문
supabase/seeds/seed_quiz_exam_patterns.sql           ─ 약사시험 기출 패턴 25문
```

---

## 📊 최종 예상 DB 상태 (전부 적용 시)

| 테이블 | 행 수 |
|---|---|
| `quiz_category` | 12 |
| `drug_master` | 50 |
| `quiz_templates` | **90** (20 + 70) |
| `quiz_question` | **약 335문** <br>(기존 pre-existing ~70 + Phase 2 48 + Phase 7 신규 227) |

**동적 생성**: 90 템플릿 × 무한 변주 = 실질 무한 콘텐츠.

---

## 🔁 재실행 안전성

모든 Phase 7 seed 파일은 상단에 `DELETE FROM ... WHERE 조건` 이 있어
**몇 번 돌려도 중복 발생 없음**. 태그/챕터 기준으로 정확히 해당 부분만
교체되므로 다른 seed 파일과 간섭 없음.

- `seed_quiz_ch11_scenarios.sql` → `WHERE 'ch11' = ANY(tags)` 삭제 후 재삽입
- `*_expansion.sql` → `WHERE chapter IN (...) AND 'expansion' = ANY(tags)` 삭제 후 재삽입
- `seed_quiz_exam_patterns.sql` → `WHERE 'exam-pattern' = ANY(tags)` 삭제 후 재삽입
- `quiz_templates_expansion.sql` → 기존 행 건드리지 않고 INSERT만

---

## 🎯 최소 실행 (빠른 시작)

시간 없으면 다음 4개만 실행해도 **300+ 문항 + 90 템플릿** 확보:

1. `quiz_redesign.sql` (카테고리·약품마스터 없으면)
2. `quiz_templates_seed.sql` + `quiz_templates_expansion.sql`
3. `seed_quiz_ch11_scenarios.sql` (정답 100% 보증 50문)
4. 3개 expansion (`ch01_ch04_expansion`, `ch05_ch08_expansion`, `ch09_ch12_expansion`)

---

## 🛠 각 파일 크기 / 문제 수 (참고)

| 파일 | 타입 | 문제 수 |
|---|---|---|
| quiz_redesign.sql | 카테고리+마스터 | 12 카테고리 + 50 약품 |
| quiz_redesign_part2.sql | 정적 기본 | ~50 |
| seed_quiz_ch09.sql | 정적 | 15 |
| seed_quiz_ch10.sql | 정적 | 15 |
| seed_quiz_ch11.sql | 정적 | 15 |
| seed_quiz_ch12.sql | 정적 | ~5 |
| seed_quiz_ch01_ch04.sql | 정적 | 24 (Phase 2) |
| seed_quiz_ch05_ch08.sql | 정적 | 24 + 5 Phase 7 |
| quiz_templates_seed.sql | 템플릿 | 20 |
| quiz_templates_expansion.sql | 템플릿 | 70 |
| **seed_quiz_ch11_scenarios.sql** | 정적 | **50** (CH11 자동변환) |
| **seed_quiz_ch01_ch04_expansion.sql** | 정적 | **60** |
| **seed_quiz_ch05_ch08_expansion.sql** | 정적 | **60** |
| **seed_quiz_ch09_ch12_expansion.sql** | 정적 | **40** |
| **seed_quiz_exam_patterns.sql** | 정적 | **25** |

---

## 🔧 Admin UI 에서 추가 (Phase 7 방안 5)

Phase 7 이후 `/admin/questions/new` 에서 **8종 문제 타입 전부 편집 가능**:

- multiple_choice / true_false: choices + correct_answer
- numeric: correct_answer (숫자)
- **matching / ordering / fill_blank / error_spot / multi_step**: payload JSON + correct_answer
  (각 타입별 예시 JSON 자동 placeholder)

태그 필드 지원: `chapter:CHxx`, `lesson:slug`, `scenario:Sxx` prefix.

---

## ⚠️ 주의

1. Supabase 프로젝트는 무료 플랜의 경우 **1주 미사용 시 자동 일시정지** →
   Dashboard 에서 Resume 필요.
2. 환경변수(.env.local 의 `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) 가 유효해야
   웹앱이 DB 에 접근 가능.
3. seed 파일 실행 중 에러 나면 해당 파일 **전체를 한 번에** 붙여넣은 경우
   성공한 문제까지만 INSERT 됨. 에러 메시지 확인 후 해당 SQL 라인 수정.
