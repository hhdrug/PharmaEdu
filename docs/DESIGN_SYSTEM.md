# PharmaEdu 디자인 시스템 (Design System)

> **버전:** 1.0.0 | **작성일:** 2026-04-06
> DSNode 프로젝트 패밀리 — Modernize Blue 테마 기반

---

## 목차

1. [브랜드 아이덴티티](#1-브랜드-아이덴티티)
2. [컬러 팔레트](#2-컬러-팔레트)
3. [타이포그래피](#3-타이포그래피)
4. [스페이싱 & 레이아웃](#4-스페이싱--레이아웃)
5. [컴포넌트 스펙](#5-컴포넌트-스펙)
6. [반응형 전략](#6-반응형-전략)
7. [Tailwind 4 테마 설정](#7-tailwind-4-테마-설정)
8. [아이콘 시스템](#8-아이콘-시스템)
9. [애니메이션 & 인터랙션](#9-애니메이션--인터랙션)
10. [접근성](#10-접근성)

---

## 1. 브랜드 아이덴티티

### 프로젝트 톤 앤 매너

PharmaEdu는 **전문성과 친근함의 균형**을 지향한다. 건강보험 약제비라는 다소 딱딱한 도메인을 약국 직원, 약대생, 초보 개발자가 쉽고 즐겁게 배울 수 있도록 설계한다.

| 속성 | 설명 |
|------|------|
| **톤** | 전문적이되 위압적이지 않은 (Professional but Approachable) |
| **무드** | 깔끔하고 신뢰감 있는 교육 플랫폼 |
| **느낌** | 현대적 SaaS 대시보드 + 교육 앱의 친근함 |
| **피할 것** | 의료 앱 특유의 차갑고 단조로운 흰색 일변도 |

### 핵심 가치 (Core Values)

- **Trustworthy (신뢰성)** — 정확한 계산 로직, 검증된 정보. 색상과 레이아웃으로 안정감 표현.
- **Clear (명확함)** — 복잡한 약제비 규정을 단순하게. 정보 계층이 눈에 보여야 한다.
- **Helpful (유익함)** — 사용자가 막히지 않도록. 힌트, 가이드, 피드백을 적극 활용.

### 디자인 원칙

1. **모바일 퍼스트** — 작은 화면부터 설계하고 확장한다
2. **정보 밀도 조절** — 한 화면에 너무 많은 정보를 욱여넣지 않는다
3. **상태를 명확히** — 로딩, 성공, 에러, 빈 상태를 항상 표현한다
4. **일관성** — DSNode 프로젝트 패밀리(YakjaebiCalc, MapService)와 컬러 감성을 공유한다

---

## 2. 컬러 팔레트

> DSNode의 YakjaebiCalc WPF 앱이 사용하는 **Modernize Blue** 테마에서 직접 추출하여 웹용으로 변환했다.

### 2.1 Primary 팔레트

Modernize Blue의 시그니처 컬러. 파란색 계열의 신뢰감 있는 색상.

| 토큰 | HEX | 용도 |
|------|-----|------|
| `primary-50` | `#F0F5FF` | 배경 하이라이트, 선택된 메뉴 배경 |
| `primary-100` | `#ECF2FF` | Light tint (WPF PrimaryLightColor 기반) |
| `primary-200` | `#D6E4FF` | 호버 배경, 비활성 버튼 배경 |
| `primary-300` | `#A8C4FF` | 보조 강조 |
| `primary-400` | `#7AA8FF` | - |
| `primary-500` | `#5D87FF` | **메인 Primary** (WPF PrimaryColor 그대로) |
| `primary-600` | `#4570EA` | **Primary Dark** — 버튼 호버, 눌림 (WPF PrimaryDarkColor) |
| `primary-700` | `#3559CC` | 강조 텍스트, 링크 active |
| `primary-800` | `#2441A8` | - |
| `primary-900` | `#162B7A` | 가장 진한 Primary |

### 2.2 Secondary 팔레트

밝고 청량한 하늘색. Primary와 그라데이션 조합 시 사용.

| 토큰 | HEX | 용도 |
|------|-----|------|
| `secondary-100` | `#E8F7FF` | Light tint (WPF SecondaryLightColor) |
| `secondary-500` | `#49BEFF` | **메인 Secondary** (WPF SecondaryColor) |
| `secondary-600` | `#2EA8F0` | 호버 |

### 2.3 시멘틱 컬러 (Semantic Colors)

WPF 앱과 동일한 색상을 웹에 그대로 적용하여 DSNode 패밀리 일관성 유지.

| 역할 | 메인 | Light tint | 용도 |
|------|------|-----------|------|
| **Success** | `#13DEB9` | `#E6FFFA` | 계산 성공, 정답, 완료 |
| **Warning** | `#FFAE1F` | `#FEF5E5` | 주의 안내, 조건부 규정 |
| **Error (Danger)** | `#FA896B` | `#FDEDE8` | 오류, 오답, 필수 항목 미입력 |
| **Info** | `#539BFF` | `#EBF3FE` | 안내 메시지, 도움말 |

### 2.4 Neutral 스케일 (Gray Scale)

WPF의 6단계 Gray에서 웹용 9단계로 확장.

| 토큰 | HEX | 참조 |
|------|-----|------|
| `neutral-50` | `#F8FAFC` | - |
| `neutral-100` | `#F2F6FA` | WPF Gray100 |
| `neutral-200` | `#EAEFF4` | WPF Gray200 |
| `neutral-300` | `#DFE5EF` | WPF Gray300 |
| `neutral-400` | `#7C8FAC` | WPF Gray400 |
| `neutral-500` | `#5A6A85` | WPF Gray500 |
| `neutral-600` | `#2A3547` | WPF Gray600 |
| `neutral-700` | `#1E2A3A` | 사이드바 하단 그라데이션 |
| `neutral-800` | `#131E2D` | - |
| `neutral-900` | `#0A1120` | 최대 진한 색 |

### 2.5 배경 색상 (Background)

| 토큰 | HEX | 용도 |
|------|-----|------|
| `bg-page` | `#F5F7FA` | 페이지 기본 배경 (WPF PageBackgroundColor) |
| `bg-surface` | `#FFFFFF` | 카드, 모달, 패널 |
| `bg-surface-alt` | `#FAFBFC` | 테이블 짝수 행, 보조 표면 |
| `bg-panel` | `#F8F9FB` | 사이드바 내 패널, 인풋 disabled |
| `bg-sidebar` | `#2A3547` | 좌측 사이드바 배경 (WPF SidebarBackgroundColor) |
| `bg-header` | `#FFFFFF` | 상단 헤더 바 |

### 2.6 텍스트 색상

| 토큰 | HEX | 용도 |
|------|-----|------|
| `text-primary` | `#2A3547` | 제목, 본문 주요 텍스트 |
| `text-secondary` | `#5A6A85` | 부제목, 보조 설명 |
| `text-muted` | `#7C8FAC` | placeholder, 비활성 레이블 |
| `text-disabled` | `#94A3B8` | disabled 상태 텍스트 |
| `text-on-primary` | `#FFFFFF` | Primary 배경 위 텍스트 |
| `text-on-sidebar` | `#FFFFFF` | 사이드바 위 텍스트 |

### 2.7 보더 색상

| 토큰 | HEX | 용도 |
|------|-----|------|
| `border-light` | `#E5EAEF` | 카드, 인풋 기본 테두리 |
| `border-medium` | `#DFE5EF` | 테이블 구분선, 구분자 |
| `border-focus` | `#5D87FF` | 인풋 포커스 링 |

### 2.8 다크 모드

**권고: 다크 모드 미구현 (v1.0)**

이유:
- 약제비 계산은 정확한 숫자 확인이 중요 — 라이트 모드가 더 적합
- 초기 버전 개발 속도 우선
- 추후 `dark:` variant로 확장 가능한 구조로 CSS 변수 설계

v2.0 계획 시 다크 모드 기준값:
- `bg-page`: `#0F1623`
- `bg-surface`: `#1E2A3A`
- `text-primary`: `#E2E8F0`
- Primary: 그대로 유지 (`#5D87FF`)

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

**Primary: Pretendard** (한글 최우선 권장)

```css
font-family: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont,
             'Segoe UI', sans-serif;
```

Pretendard는 한글 웹폰트 중 가장 현대적인 느낌. 네이버, 토스, 카카오 등 국내 대형 서비스에서 검증된 폰트.

**대안 (CDN 없이 사용 가능):**
- `Noto Sans KR` — Google Fonts, 무난하지만 무게감 있음
- `SUIT` — Pretendard와 유사, 경량 대안

**Monospace (코드/계산 수식):**
```css
font-family: 'D2Coding', 'Consolas', 'Courier New', monospace;
```

### 3.2 폰트 웨이트 스케일

| 웨이트 | 값 | 용도 |
|-------|-----|------|
| `font-light` | 300 | 대형 디스플레이 텍스트 |
| `font-normal` | 400 | 본문, 설명 |
| `font-medium` | 500 | 레이블, 버튼 텍스트 |
| `font-semibold` | 600 | 소제목, 카드 제목 |
| `font-bold` | 700 | 페이지 제목, 강조 |
| `font-extrabold` | 800 | 히어로 섹션 대제목 |

### 3.3 크기 스케일

| 토큰 | 크기 | Line Height | 용도 |
|------|------|-------------|------|
| `text-xs` | 12px (0.75rem) | 1.5 | 뱃지, 보조 레이블 |
| `text-sm` | 14px (0.875rem) | 1.5 | 보조 본문, 테이블 셀 |
| `text-base` | 16px (1rem) | 1.6 | 기본 본문 |
| `text-lg` | 18px (1.125rem) | 1.6 | 강조 본문, 카드 설명 |
| `text-xl` | 20px (1.25rem) | 1.4 | 카드 제목, 소제목 |
| `text-2xl` | 24px (1.5rem) | 1.35 | 섹션 제목 |
| `text-3xl` | 30px (1.875rem) | 1.3 | 페이지 제목 |
| `text-4xl` | 36px (2.25rem) | 1.2 | 히어로 제목 |

### 3.4 Line Height 규칙

- **본문 텍스트**: `leading-relaxed` (1.625) — 한글 가독성 최적화
- **제목**: `leading-tight` (1.25) ~ `leading-snug` (1.375)
- **코드/수식**: `leading-normal` (1.5)
- **한글 본문 최소 줄간격**: 1.6 이상 권장 (영문보다 자간이 넓음)

---

## 4. 스페이싱 & 레이아웃

### 4.1 8px 기반 스페이싱 스케일

Tailwind의 기본 spacing scale (4px 단위) 중 8px 배수를 핵심으로 사용.

| 토큰 | px | rem | 용도 |
|------|-----|-----|------|
| `space-1` | 4px | 0.25rem | 아이콘 간격, 인라인 여백 |
| `space-2` | 8px | 0.5rem | 컴포넌트 내부 소형 패딩 |
| `space-3` | 12px | 0.75rem | 버튼 수직 패딩 |
| `space-4` | 16px | 1rem | 기본 패딩 단위 |
| `space-6` | 24px | 1.5rem | 카드 패딩, 섹션 내부 |
| `space-8` | 32px | 2rem | 카드 간 간격, 섹션 구분 |
| `space-12` | 48px | 3rem | 대형 섹션 여백 |
| `space-16` | 64px | 4rem | 페이지 상하 여백 |
| `space-24` | 96px | 6rem | 히어로 섹션 |

### 4.2 Container Max Width

| 이름 | 최대 너비 | 용도 |
|------|----------|------|
| `container-sm` | 640px | 좁은 폼, 모달 |
| `container-md` | 768px | 학습 콘텐츠 |
| `container-lg` | 1024px | 일반 페이지 |
| `container-xl` | 1280px | 대시보드 |
| `container-2xl` | 1536px | 전체 너비 레이아웃 |

기본 페이지 레이아웃: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### 4.3 반응형 브레이크포인트

| 이름 | 범위 | 설명 |
|------|------|------|
| `(기본)` | 0 ~ 639px | 모바일 (스마트폰) |
| `sm:` | 640px ~ 767px | 대형 스마트폰, 소형 태블릿 |
| `md:` | 768px ~ 1023px | 태블릿 |
| `lg:` | 1024px ~ 1279px | 소형 데스크탑 |
| `xl:` | 1280px ~ 1535px | 일반 데스크탑 |
| `2xl:` | 1536px~ | 대형 모니터 |

### 4.4 그리드 시스템

Tailwind CSS Grid 기반 12컬럼 시스템.

```
모바일:  1컬럼  (grid-cols-1)
태블릿:  2~4컬럼 (md:grid-cols-2, md:grid-cols-4)
데스크탑: 12컬럼 기준 자유 조합
```

**주요 레이아웃 패턴:**

```
[데스크탑] 사이드바 + 메인:
  sidebar: w-64 (256px) 고정
  main: flex-1

[태블릿] 사이드바 오버레이 or 숨김

[모바일] 전체 화면 단일 컬럼
```

**대시보드 카드 그리드:**
```
모바일:  grid-cols-1
태블릿:  grid-cols-2
데스크탑: grid-cols-3 또는 grid-cols-4
```

---

## 5. 컴포넌트 스펙

### 5.1 Button

#### Primary Button
```
배경: primary-500 (#5D87FF)
텍스트: white, font-medium, text-sm
패딩: px-4 py-2.5 (16px 좌우, 10px 상하)
Border radius: rounded-lg (8px)
호버: primary-600 (#4570EA), shadow-sm 추가
눌림: primary-700, scale-[0.98]
비활성: primary-100 배경, text-muted, cursor-not-allowed
포커스: outline-none + ring-2 ring-primary-500 ring-offset-2
```

#### Secondary Button
```
배경: white
텍스트: text-primary (#2A3547), font-medium, text-sm
테두리: 1px solid border-light (#E5EAEF)
패딩: px-4 py-2.5
Border radius: rounded-lg
호버: bg-neutral-50
포커스: ring-2 ring-primary-500 ring-offset-2
```

#### Ghost Button
```
배경: transparent
텍스트: primary-500, font-medium, text-sm
테두리: 없음
패딩: px-4 py-2.5
호버: bg-primary-50
포커스: ring-2 ring-primary-500 ring-offset-2
```

#### Icon Button
```
크기: 40px × 40px (터치 타깃 44px 위한 최소값)
배경: transparent
테두리: 1px solid border-light (선택)
Border radius: rounded-lg
아이콘 크기: 20px (w-5 h-5)
호버: bg-neutral-100
```

#### 버튼 크기 변형
| 크기 | 패딩 | 텍스트 | 용도 |
|------|------|--------|------|
| `btn-sm` | px-3 py-1.5 | text-xs | 인라인, 테이블 내 |
| `btn-md` | px-4 py-2.5 | text-sm | 기본 |
| `btn-lg` | px-6 py-3 | text-base | CTA, 히어로 |

---

### 5.2 Card

#### Standard Card
```
배경: white
테두리: 1px solid border-light (#E5EAEF)
Border radius: rounded-xl (12px)
그림자: shadow-sm (box-shadow: 0 1px 2px rgba(0,0,0,0.05))
패딩: p-6 (24px)
```

#### Elevated Card
```
Standard Card와 동일하되:
그림자: shadow-md (box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1))
호버 시: shadow-lg, translateY(-2px), transition-all duration-200
```

#### Outlined Card
```
배경: transparent
테두리: 2px solid border-medium (#DFE5EF)
Border radius: rounded-xl
그림자: 없음
패딩: p-6
```

#### 카드 내부 구조
```
card-header: pb-4 border-b border-light, text-lg font-semibold text-primary
card-body: py-4
card-footer: pt-4 border-t border-light, flex justify-end gap-2
```

---

### 5.3 Input

#### Text Input
```
높이: h-10 (40px) — 터치 타깃 충족
패딩: px-3 py-2
배경: white
테두리: 1px solid border-light (#E5EAEF)
Border radius: rounded-lg (8px)
텍스트: text-sm text-primary
placeholder: text-muted

포커스:
  테두리: primary-500 (#5D87FF)
  ring: ring-2 ring-primary-500/20
  outline: none

에러:
  테두리: error-500 (#FA896B)
  ring: ring-2 ring-error-500/20

비활성:
  배경: bg-panel (#F8F9FB)
  텍스트: text-disabled
  cursor-not-allowed
```

#### Select
```
Input과 동일한 스타일
우측에 ChevronDown 아이콘 (w-4 h-4, text-muted)
appearance-none으로 기본 화살표 제거
```

#### Checkbox
```
크기: 16px × 16px
Border radius: rounded (4px)
체크 전: 테두리 1px solid border-medium
체크 후: 배경 primary-500, 체크 아이콘 white
포커스: ring-2 ring-primary-500 ring-offset-1
레이블: text-sm text-primary, ml-2
터치 타깃: 레이블 포함 최소 44px 높이 확보
```

#### Radio
```
크기: 16px × 16px, 원형
선택 전: 테두리 1px solid border-medium
선택 후: 테두리 primary-500, 내부 원 primary-500
포커스: ring-2 ring-primary-500 ring-offset-1
```

#### Form Label
```
text-sm font-medium text-primary
mb-1.5 (6px 하단 간격)
필수 표시: text-error-500 ml-0.5 (*)
```

#### Form Helper Text
```
text-xs text-muted, mt-1.5
에러 시: text-error-500
```

---

### 5.4 Badge / Chip

#### Badge (상태 표시 — 읽기 전용)
```
높이: h-5 (20px)
패딩: px-2
Border radius: rounded-full
텍스트: text-xs font-medium

변형:
  primary:  bg-primary-100  text-primary-600
  success:  bg-[#E6FFFA]    text-[#13DEB9]
  warning:  bg-[#FEF5E5]    text-[#FFAE1F]
  error:    bg-[#FDEDE8]    text-[#FA896B]
  info:     bg-[#EBF3FE]    text-[#539BFF]
  neutral:  bg-neutral-100  text-neutral-500
```

#### Chip (필터, 선택 가능)
```
높이: h-8 (32px)
패딩: px-3
Border radius: rounded-full
테두리: 1px solid border-light
텍스트: text-sm
배경: white

선택됨: bg-primary-500, text-white, border-transparent
호버: bg-neutral-50
삭제 버튼: X 아이콘 ml-1, w-4 h-4
```

---

### 5.5 Header (상단 네비게이션 바)

```
높이: h-16 (64px) — 모바일: h-14 (56px)
배경: white
하단 테두리: 1px solid border-light
그림자: shadow-sm
position: sticky top-0 z-50

내부 구조:
  [로고 영역]          [네비게이션 링크]          [우측 액션]
  좌측 고정          중앙 또는 좌측 정렬       검색, 알림, 사용자 아바타

로고:
  텍스트: "팜에듀" font-bold text-xl text-primary-600
  아이콘: 캡슐 또는 약 모양 아이콘 (Lucide: Pill)

데스크탑 네비게이션:
  링크: text-sm font-medium text-secondary
  활성: text-primary-600 font-semibold
  호버: text-primary-500
  언더라인: border-b-2 border-primary-500 (활성)

모바일:
  햄버거 아이콘 (Menu, w-6 h-6)
  드로어 슬라이드인 (좌측에서)
```

---

### 5.6 Sidebar (학습 모듈용 좌측 사이드바)

```
너비: w-64 (256px)
배경: #2A3547 (WPF SidebarBackgroundColor 그대로)
그림자: shadow-sidebar (우측으로 16px blur)
position: fixed, z-40

텍스트: white
섹션 레이블: text-xs font-semibold uppercase tracking-wider text-neutral-400, px-4 mb-1

네비게이션 아이템:
  패딩: px-4 py-2.5
  Border radius: rounded-lg (mx-2)
  기본: text-neutral-300, hover: text-white hover:bg-white/10
  활성: text-white bg-primary-500 (#5D87FF)
  아이콘: w-5 h-5 mr-3

모바일 전환:
  기본 숨김 (translate-x-[-100%])
  열림: translate-x-0, transition-transform duration-300
  오버레이: bg-black/50 z-30
```

---

### 5.7 Footer

```
배경: white
상단 테두리: 1px solid border-light
패딩: py-8 px-4

내용 (심플):
  좌: "© 2026 PharmaEdu — 약제비 계산 교육 플랫폼"
  우: 버전 정보, 관련 링크

텍스트: text-sm text-muted
링크: text-primary-500 hover:text-primary-600
```

---

### 5.8 Modal / Dialog

```
오버레이: bg-black/50, z-50, backdrop-blur-sm
모달 컨테이너:
  배경: white
  Border radius: rounded-2xl (16px)
  그림자: shadow-xl
  패딩: p-6
  최소 너비: min-w-[320px]
  최대 너비: max-w-lg (모바일: 화면 폭 - 32px)
  위치: 화면 중앙 (items-center justify-center)

구조:
  헤더: text-lg font-semibold text-primary + 닫기 버튼 (X, 우측)
  본문: py-4, text-sm text-secondary
  푸터: pt-4 border-t border-light, flex justify-end gap-2

애니메이션:
  진입: opacity-0 scale-95 → opacity-100 scale-100, duration-200
  퇴장: 반대 방향, duration-150

모바일 처리:
  화면 하단에서 슬라이드업 (bottom sheet 패턴)
  rounded-t-2xl, rounded-b-none
```

---

### 5.9 Toast / Notification

```
위치: 화면 우측 하단 (bottom-4 right-4)
  모바일: 하단 중앙 (bottom-4 left-1/2 -translate-x-1/2)
너비: w-80 (320px)
Border radius: rounded-xl
그림자: shadow-lg
패딩: p-4
z-index: z-50

좌측 색상 바: w-1 rounded-l-xl
  success: bg-success-500
  warning: bg-warning-500
  error: bg-error-500
  info: bg-info-500

내부:
  아이콘: w-5 h-5 (좌측)
  제목: text-sm font-semibold
  내용: text-xs text-secondary (선택)
  닫기: X 버튼 (우측 상단)

애니메이션:
  진입: translateY(100%) → translateY(0), duration-300 ease-out
  퇴장: opacity-100 → opacity-0 translateY(-8px), duration-200

자동 소멸: 4000ms
```

---

### 5.10 Table

```
컨테이너: overflow-x-auto (모바일 수평 스크롤)
테이블: w-full, border-collapse

헤더 (thead):
  배경: #F0F4F8 (WPF DataGridHeaderBackgroundColor)
  텍스트: text-xs font-semibold uppercase text-secondary
  패딩: px-4 py-3
  정렬: text-left

행 (tbody tr):
  기본: bg-white
  짝수 행: bg-surface-alt (#FAFBFC)
  호버: bg-primary-50 (#F0F5FF)
  선택됨: bg-[#EBF5FF] (WPF DataGridRowSelectedColor)
  border-b: border-light

셀 (td):
  패딩: px-4 py-3
  텍스트: text-sm text-primary

숫자 컬럼:
  font-mono (D2Coding)
  text-right
  font-medium

모바일 전략:
  중요도 낮은 컬럼 숨김 (hidden md:table-cell)
  또는 카드형 리스트로 전환
```

---

### 5.11 Loading Spinner

```
Primary Spinner:
  크기: w-6 h-6 (기본), w-8 h-8 (중형), w-12 h-12 (대형)
  색상: text-primary-500
  animate-spin
  구현: SVG circle (stroke-dasharray)

페이지 로딩:
  전체 오버레이: bg-white/80, z-40
  중앙 스피너 + "로딩 중..." text-sm text-secondary

버튼 내 로딩:
  버튼 비활성화 + 좌측 스피너 w-4 h-4
  텍스트: "처리 중..."

스켈레톤 로딩 (Skeleton):
  배경: bg-neutral-200
  animate-pulse
  Border radius: rounded-lg
  카드 스켈레톤, 텍스트 스켈레톤 조합
```

---

### 5.12 Empty State

```
컨테이너: flex flex-col items-center justify-center
패딩: py-16
텍스트 정렬: text-center

일러스트/아이콘:
  w-16 h-16 text-neutral-300
  mb-4
  Lucide: FileSearch, BookOpen, Calculator 등 맥락에 맞게

제목: text-lg font-semibold text-primary, mb-2
설명: text-sm text-muted max-w-xs, mb-6
CTA: Primary Button (선택)

예시:
  계산 결과 없음: "계산 내역이 없습니다" + 계산기 아이콘
  학습 콘텐츠 없음: "아직 콘텐츠가 없습니다" + BookOpen 아이콘
  퀴즈 없음: "출제된 퀴즈가 없습니다" + HelpCircle 아이콘
```

---

## 6. 반응형 전략

### 6.1 Mobile-First 원칙

모든 CSS 클래스는 모바일 기준으로 먼저 작성하고, 큰 화면을 위한 변형을 접두사(`md:`, `lg:`)로 추가한다.

```html
<!-- 올바른 예: 모바일 우선 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

<!-- 잘못된 예: 데스크탑 우선 -->
<div class="grid grid-cols-3 max-md:grid-cols-1">
```

### 6.2 Touch Target 최소 사이즈

**모든 인터랙티브 요소는 최소 44px × 44px을 확보한다.**

- 버튼: `min-h-[44px]` 또는 padding으로 충족
- 체크박스/라디오: 레이블 영역 포함 44px
- 아이콘 버튼: `w-11 h-11` (44px)
- 네비게이션 링크: `py-3` 이상

### 6.3 브레이크포인트별 레이아웃 변화

#### 모바일 (0 ~ 639px)
- 사이드바: 숨김 (드로어로 전환)
- 헤더: 로고 + 햄버거 메뉴
- 카드 그리드: 단일 컬럼
- 테이블: 수평 스크롤 또는 카드형
- 모달: 하단 시트 (bottom sheet)

#### 태블릿 (640px ~ 1023px)
- 사이드바: 좁은 모드 (아이콘만, w-16) 또는 오버레이
- 카드 그리드: 2컬럼
- 테이블: 주요 컬럼만 표시

#### 데스크탑 (1024px~)
- 사이드바: 상시 표시 (w-64)
- 카드 그리드: 3~4컬럼
- 테이블: 전체 컬럼 표시
- 모달: 중앙 다이얼로그

### 6.4 모바일 네비게이션

```
햄버거 메뉴:
  아이콘: Lucide Menu (기본), X (열린 상태)
  위치: 헤더 좌측 (로고 앞)
  크기: w-6 h-6, 터치 타깃 44px 확보

드로어 슬라이드인:
  너비: w-72 (288px) — 화면의 80% 초과 안 함
  배경: bg-sidebar (#2A3547)
  오버레이 클릭: 드로어 닫힘
  스와이프 제스처: 선택적 (라이브러리 없이 구현 어려움, 선택사항)

바텀 네비게이션 (선택사항, 앱처럼 쓸 경우):
  높이: h-16
  아이템: 최대 4개
  아이콘 + 텍스트 (text-xs)
  활성: text-primary-500
```

---

## 7. Tailwind 4 테마 설정

Tailwind 4에서는 `tailwind.config.ts` 대신 CSS `@theme` 블록으로 설정한다.

`src/app/globals.css` 또는 `src/styles/theme.css`에 추가:

```css
@import "tailwindcss";

@theme {
  /* ===== Primary ===== */
  --color-primary-50: #F0F5FF;
  --color-primary-100: #ECF2FF;
  --color-primary-200: #D6E4FF;
  --color-primary-300: #A8C4FF;
  --color-primary-400: #7AA8FF;
  --color-primary-500: #5D87FF;
  --color-primary-600: #4570EA;
  --color-primary-700: #3559CC;
  --color-primary-800: #2441A8;
  --color-primary-900: #162B7A;

  /* ===== Secondary ===== */
  --color-secondary-100: #E8F7FF;
  --color-secondary-500: #49BEFF;
  --color-secondary-600: #2EA8F0;

  /* ===== Semantic ===== */
  --color-success-500: #13DEB9;
  --color-success-100: #E6FFFA;
  --color-warning-500: #FFAE1F;
  --color-warning-100: #FEF5E5;
  --color-error-500: #FA896B;
  --color-error-100: #FDEDE8;
  --color-info-500: #539BFF;
  --color-info-100: #EBF3FE;

  /* ===== Neutral ===== */
  --color-neutral-50: #F8FAFC;
  --color-neutral-100: #F2F6FA;
  --color-neutral-200: #EAEFF4;
  --color-neutral-300: #DFE5EF;
  --color-neutral-400: #7C8FAC;
  --color-neutral-500: #5A6A85;
  --color-neutral-600: #2A3547;
  --color-neutral-700: #1E2A3A;
  --color-neutral-800: #131E2D;
  --color-neutral-900: #0A1120;

  /* ===== Background ===== */
  --color-bg-page: #F5F7FA;
  --color-bg-surface: #FFFFFF;
  --color-bg-surface-alt: #FAFBFC;
  --color-bg-panel: #F8F9FB;
  --color-bg-sidebar: #2A3547;

  /* ===== Text ===== */
  --color-text-primary: #2A3547;
  --color-text-secondary: #5A6A85;
  --color-text-muted: #7C8FAC;
  --color-text-disabled: #94A3B8;

  /* ===== Border ===== */
  --color-border-light: #E5EAEF;
  --color-border-medium: #DFE5EF;
  --color-border-focus: #5D87FF;

  /* ===== Typography ===== */
  --font-sans: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'D2Coding', 'Consolas', 'Courier New', monospace;

  /* ===== Border Radius ===== */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ===== Shadows ===== */
  --shadow-card: 0 1px 8px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px 0 rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 8px 24px 0 rgba(0, 0, 0, 0.12);
  --shadow-sidebar: 0 0 16px 0 rgba(0, 0, 0, 0.20);
  --shadow-primary-glow: 0 2px 12px 0 rgba(93, 135, 255, 0.30);

  /* ===== Transitions ===== */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* ===== Spacing (8px base) ===== */
  --spacing-0: 0px;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-24: 96px;
}

/* ===== 전역 기본값 ===== */
@layer base {
  html {
    font-family: var(--font-sans);
    color: var(--color-text-primary);
    background-color: var(--color-bg-page);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 한글 word-break */
  body {
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  /* 포커스 링 기본 스타일 초기화 (JS로 제어) */
  :focus:not(:focus-visible) {
    outline: none;
  }
  :focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}
```

---

## 8. 아이콘 시스템

### 8.1 권장 라이브러리

**lucide-react** 를 기본 아이콘 시스템으로 사용.

```bash
npm install lucide-react
```

선택 이유:
- React 컴포넌트로 직접 import (번들 사이즈 최적화)
- SVG 기반, 크기/색상 prop으로 쉽게 제어
- 1,500개 이상의 일관된 선형 아이콘
- Tailwind 클래스 그대로 적용 가능

### 8.2 사용 규칙

```tsx
import { Pill, Calculator, BookOpen, HelpCircle } from 'lucide-react';

// 기본 사용
<Calculator className="w-5 h-5 text-primary-500" />

// 텍스트와 함께
<span className="flex items-center gap-2">
  <BookOpen className="w-5 h-5" />
  학습하기
</span>
```

### 8.3 크기 규칙

| 용도 | 크기 | Tailwind |
|------|------|----------|
| 인라인 텍스트 내 | 16px | `w-4 h-4` |
| 버튼, 네비게이션 | 20px | `w-5 h-5` |
| 카드 아이콘, 강조 | 24px | `w-6 h-6` |
| Empty state | 64px | `w-16 h-16` |
| 히어로/대형 표시 | 48px | `w-12 h-12` |

### 8.4 주요 아이콘 매핑

| 기능 | 아이콘 |
|------|--------|
| 계산기 | `Calculator` |
| 학습 | `BookOpen` |
| 퀴즈 | `HelpCircle` |
| 약 | `Pill` |
| 홈 | `Home` |
| 설정 | `Settings` |
| 사용자 | `User` |
| 검색 | `Search` |
| 닫기 | `X` |
| 체크 | `Check`, `CheckCircle` |
| 경고 | `AlertTriangle` |
| 정보 | `Info` |
| 에러 | `AlertCircle` |
| 메뉴 (햄버거) | `Menu` |
| 펼치기 | `ChevronDown` |
| 뒤로가기 | `ArrowLeft` |
| 로딩 | `Loader2` (animate-spin) |
| 복사 | `Copy` |

---

## 9. 애니메이션 & 인터랙션

### 9.1 Transition Timing

```css
/* 빠른 피드백: 버튼, 체크박스, 토글 */
transition-duration: 150ms;   /* --transition-fast */
transition-timing-function: ease;

/* 기본 UI: 카드 호버, 드롭다운 */
transition-duration: 200ms;   /* --transition-base */
transition-timing-function: ease;

/* 느린 전환: 사이드바, 모달, 페이지 */
transition-duration: 300ms;   /* --transition-slow */
transition-timing-function: ease-in-out;
```

### 9.2 Hover / Focus 상태 규칙

| 요소 | Hover | Focus |
|------|-------|-------|
| 버튼 | 배경색 한 단계 진하게 + shadow-sm | ring-2 ring-primary-500 ring-offset-2 |
| 링크 | 색상 변화 + underline | ring-2 ring-primary-500 |
| 카드 (클릭 가능) | translateY(-2px) + shadow-md | ring-2 ring-primary-500 |
| 인풋 | 테두리 neutral-400 | 테두리 primary-500 + ring |
| 사이드바 아이템 | bg-white/10 | bg-white/10 |

```css
/* 공통 transition 클래스 */
.transition-ui {
  transition-property: color, background-color, border-color, box-shadow, transform;
  transition-duration: 200ms;
  transition-timing-function: ease;
}
```

### 9.3 미세한 Motion 가이드

**원칙: 목적 있는 애니메이션만 사용한다.**
불필요한 애니메이션은 인지 부하를 높이고 모바일 성능을 저하시킨다.

| 상황 | 애니메이션 | 방법 |
|------|-----------|------|
| 페이지 진입 | 콘텐츠 fade + slide up | opacity-0→1, translateY(8px→0), 300ms |
| 모달 열기 | scale + fade | scale-95→100, opacity-0→1, 200ms |
| 모달 닫기 | 반대 방향 | 150ms (열기보다 빠르게) |
| 사이드바 | slide in | translateX(-100%→0), 300ms |
| Toast | slide up | translateY(100%→0), 300ms |
| 버튼 클릭 | scale down | scale-[0.97], 100ms |
| 데이터 로딩 | pulse | animate-pulse |
| 스피너 | 회전 | animate-spin |
| 아코디언 | 높이 펼침 | max-height 전환 (grid-rows-[0fr→1fr]) |

**접근성 고려:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.4 스크롤 동작

- 페이지 내 앵커 이동: `scroll-behavior: smooth`
- 무한 스크롤 또는 페이지네이션: 로딩 스피너 하단 노출
- 상단 이동 버튼: 300px 이상 스크롤 시 우측 하단 노출

---

## 10. 접근성

### 10.1 목표

**WCAG 2.1 AA 준수**를 목표로 한다.

### 10.2 Color Contrast 최소 비율

| 텍스트 종류 | 최소 비율 | 비고 |
|------------|----------|------|
| 일반 본문 (text-sm 이상) | **4.5:1** | WCAG AA |
| 대형 텍스트 (18px 이상 또는 bold 14px 이상) | **3:1** | WCAG AA |
| UI 컴포넌트, 그래픽 요소 | **3:1** | 버튼 테두리, 아이콘 등 |

**주요 색상 조합 대비 검증:**

| 전경 | 배경 | 비율 | 판정 |
|------|------|------|------|
| `#2A3547` on `#FFFFFF` | | 약 12.6:1 | AAA 통과 |
| `#5A6A85` on `#FFFFFF` | | 약 5.7:1 | AA 통과 |
| `#FFFFFF` on `#5D87FF` | | 약 3.5:1 | 대형 텍스트 AA |
| `#FFFFFF` on `#4570EA` | | 약 4.6:1 | AA 통과 |
| `#7C8FAC` on `#FFFFFF` | | 약 3.8:1 | 대형 텍스트만 AA |

> 주의: `#7C8FAC` (text-muted)는 12px 이하 본문에 단독 사용 금지. placeholder, 보조 레이블 등 시각적 보조 역할에만 사용.

### 10.3 Focus Indicator 규칙

```css
/* 모든 인터랙티브 요소 */
:focus-visible {
  outline: 2px solid #5D87FF;   /* primary-500 */
  outline-offset: 2px;
}

/* 다크 배경 위 (사이드바) */
.dark-bg :focus-visible {
  outline: 2px solid #FFFFFF;
  outline-offset: 2px;
}
```

- 포커스 인디케이터는 절대 `outline: none` 만으로 제거하지 않는다
- `focus:not(:focus-visible)`로 마우스 사용자에게는 숨기고 키보드 사용자에게만 표시

### 10.4 키보드 접근성

- 모든 인터랙티브 요소: `Tab` 키로 접근 가능
- 드롭다운/모달: `Escape` 키로 닫기
- 모달: focus trap 구현 (첫/마지막 요소에서 Tab 순환)
- 사이드바 메뉴: `Arrow` 키 탐색 권장

### 10.5 스크린 리더 지원

```tsx
// 아이콘 버튼
<button aria-label="메뉴 열기">
  <Menu className="w-6 h-6" aria-hidden="true" />
</button>

// 로딩 상태
<div role="status" aria-live="polite">
  <Loader2 className="animate-spin" aria-hidden="true" />
  <span className="sr-only">로딩 중...</span>
</div>

// 배지
<span aria-label="성공">
  <Badge variant="success">완료</Badge>
</span>

// 에러 메시지
<input aria-describedby="error-msg" aria-invalid="true" />
<p id="error-msg" role="alert">필수 입력 항목입니다.</p>
```

### 10.6 언어 설정

```html
<html lang="ko">
```

한글 콘텐츠에 대한 스크린 리더 최적화를 위해 반드시 `lang="ko"` 설정.

---

## 부록: 빠른 참조

### 자주 쓰는 Tailwind 클래스 조합

```html
<!-- 페이지 래퍼 -->
<div class="min-h-screen bg-bg-page">

<!-- 컨테이너 -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

<!-- 카드 -->
<div class="bg-white border border-border-light rounded-xl shadow-card p-6">

<!-- Primary 버튼 -->
<button class="bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">

<!-- 인풋 -->
<input class="w-full h-10 px-3 py-2 text-sm border border-border-light rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors duration-150">

<!-- 섹션 제목 -->
<h2 class="text-2xl font-bold text-text-primary">

<!-- 보조 텍스트 -->
<p class="text-sm text-text-secondary leading-relaxed">

<!-- 반응형 그리드 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

*이 문서는 DSNode 프로젝트 패밀리의 Modernize Blue 테마를 기반으로 작성되었으며, PharmaEdu의 모든 UI 구현 시 이 디자인 시스템을 우선 참조한다.*
