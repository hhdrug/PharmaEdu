/**
 * 플래시카드 덱 정의.
 *
 * 각 덱은 { id, title, description, cards[] } 형태.
 * 카드는 { front, back, hint? } — 앞면 단순/짧게, 뒷면 자세히.
 *
 * 교육 목적: 보험코드/수가코드/약어를 단기→장기 기억으로 이관.
 */

export interface Flashcard {
  /** 카드 고유 id (덱 내에서만 유일) */
  id: string;
  /** 앞면 — 짧은 코드 or 용어 */
  front: string;
  /** 뒷면 — 의미, 계산 공식, 주의사항 */
  back: string;
  /** 추가 힌트/예시 (optional) */
  hint?: string;
  /** 관련 챕터 (클릭 시 이동) */
  chapter?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  emoji: string;
  cards: Flashcard[];
}

// ─────────────────────────────────────────────────────────────
// Deck 1: 보험코드 (Insurance Code)
// ─────────────────────────────────────────────────────────────

const DECK_INSURANCE: FlashcardDeck = {
  id: 'insurance',
  title: '보험코드',
  description: '건강보험·의료급여·산재·자보·보훈 등 본인부담 분기의 기본',
  emoji: '🏥',
  cards: [
    {
      id: 'c10', front: 'C10', chapter: 'CH05',
      back: '건강보험 일반 — 본인부담 30% (의원 기준). 가장 흔한 케이스.',
      hint: '연령·시간·저액·정액 가산이 없는 표준.',
    },
    {
      id: 'c20', front: 'C20', chapter: 'CH05',
      back: '건강보험 직장가입자 가족(피부양자). 본인부담 산식은 C10과 동일하되 자격 구분용.',
    },
    {
      id: 'c21', front: 'C21', chapter: 'CH05',
      back: '건강보험 지역가입자 세대주. 지역가입 식별 코드이며 공무상 재해와 무관.',
      hint: '공상은 별도 플래그(isTreatmentDisaster)로 판정.',
    },
    {
      id: 'd10', front: 'D10', chapter: 'CH05',
      back: '의료급여 1종 — 정액 Mcode(1,150~2,350원) 또는 면제 8종 적용. 가장 낮은 본인부담.',
      hint: '18세 미만/임산부/등록장애인/행려 등 8종 면제.',
    },
    {
      id: 'd20', front: 'D20', chapter: 'CH05',
      back: '의료급여 2종 — 정률 15% 또는 정액 500원(약국 기준). 1종보다 부담 커짐.',
    },
    {
      id: 'd80', front: 'D80', chapter: 'CH05',
      back: '의료급여 행려환자 — 전액 면제 (userPrice=0).',
    },
    {
      id: 'e10', front: 'E10', chapter: 'CH08',
      back: '산업재해 일반 — 전액 공단부담 (userPrice=0). 근로복지공단이 청구.',
    },
    {
      id: 'e20', front: 'E20', chapter: 'CH08',
      back: '산재 후유증 치료 — E10 분기와 동일 전액면제.',
    },
    {
      id: 'f10', front: 'F10', chapter: 'CH04',
      back: '자동차보험 — 100% 본인 부담(공단 0원). 가입회사가 환자 대신 납부.',
      hint: 'M_AddRat 할증은 floor(price × addRat / 100).',
    },
    {
      id: 'g10', front: 'G10', chapter: 'CH12',
      back: '보훈 국비 일반 — 60% 감면 또는 할증률 적용(보훈 세부 구분에 따라).',
    },
    {
      id: 'g20', front: 'G20', chapter: 'CH12',
      back: '보훈위탁(위탁진료 후 보훈 청구) — 감면율은 Mcode와 결합.',
    },
    {
      id: 'm10', front: 'M10', chapter: 'CH12',
      back: '보훈 감면코드 — 전액면제(100% 감면). G 코드와 함께 적용.',
    },
    {
      id: 'm60', front: 'M60', chapter: 'CH12',
      back: '보훈 감면코드 — 60% 감면. 본인부담 40%만 청구.',
    },
    {
      id: 'b014', front: 'B014', chapter: 'CH05',
      back: '의료급여 차상위 본인부담 경감 — 30%.',
    },
    {
      id: 'v252', front: 'V252', chapter: 'CH05',
      back: '경증질환 본인부담 특례 — 의료급여 기준 3% 정률.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Deck 2: 수가코드 (Dispensing Fee Codes)
// ─────────────────────────────────────────────────────────────

const DECK_SUGA: FlashcardDeck = {
  id: 'suga',
  title: '수가/조제료 코드',
  description: '조제기본료, 의약품관리료, 특수 가산 — wageList 행 생성 기준',
  emoji: '💊',
  cards: [
    {
      id: 'aa100', front: 'AA100', chapter: 'CH02',
      back: '기본 조제료(내복약). 1회 조제 = 1행.',
    },
    {
      id: 'aa220', front: 'AA220', chapter: 'CH02',
      back: '외용제 조제료. 내복+외용 동시 처방 시 외용도 별도 행.',
    },
    {
      id: 'z5000', front: 'Z5000', chapter: 'CH02',
      back: '의약품관리료 — 일반 처방. 1회 1행.',
    },
    {
      id: 'z5001', front: 'Z5001', chapter: 'CH02',
      back: '의약품관리료 — 마약 포함 처방(hasNarcotic=true).',
    },
    {
      id: 'z5010', front: 'Z5010', chapter: 'CH02',
      back: '의약품관리료 — 외용제만 처방 시 일수 가산(외용 only).',
    },
    {
      id: 'z5011', front: 'Z5011', chapter: 'CH02',
      back: '의약품관리료 — 전체 포장(allPack) 처방.',
    },
    {
      id: 'z4010', front: 'Z4010', chapter: 'CH04',
      back: '가루약 조제 가산 — 별도 행으로 계산(조제료에 합산 X).',
    },
    {
      id: 'z4200', front: 'Z4200', chapter: 'CH08',
      back: '직접조제 가산 — 약국 외 조제(의원 등) 특수 코드.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Deck 3: 핵심 용어 및 공식
// ─────────────────────────────────────────────────────────────

const DECK_CONCEPTS: FlashcardDeck = {
  id: 'concepts',
  title: '핵심 용어·공식',
  description: '약제비 계산의 뼈대 — 약품금액, 가산, 환산지수',
  emoji: '🧮',
  cards: [
    {
      id: 'pd_sum', front: 'PD_SUM', chapter: 'CH01',
      back: '약품금액 합산 = Σ(단가 × 복용수 × 일수). 소수점 사사오입 후 합산.',
      hint: '각 약품마다 round() 후 더한다.',
    },
    {
      id: 'total_price', front: 'Total Price', chapter: 'CH01',
      back: '총액1 = 약품금액 + 조제기본료 + 의약품관리료 + 특수가산. Mcode/AddRat 적용 전.',
    },
    {
      id: 'addrat', front: 'M_AddRat', chapter: 'CH04',
      back: '자보 할증률(%). 할증액 = floor(총액1 × AddRat / 100). 절사 기준(round1 X).',
    },
    {
      id: 'mcode', front: 'Mcode', chapter: 'CH12',
      back: '보훈/의료급여 정액 본인부담 매핑 테이블. 연령·일수·약품종류에 따라 행 선택.',
    },
    {
      id: 'conversion', front: '환산지수', chapter: 'CH03',
      back: '2026년 약국 환산지수 = 105.5원. 점수(Score) × 환산지수 → 실제 금액.',
      hint: '매년 보건복지부 고시로 변경됨.',
    },
    {
      id: 'round1', front: 'round1()', chapter: 'CH01',
      back: '1원 단위 사사오입. Math.round(x/10)*10 이 아님 — 일반 round 후 1자리 절사.',
    },
    {
      id: 'exempt8', front: '1종 면제 8종', chapter: 'CH05',
      back: '18세미만 / 20세미만 재학생 / 임산부 / 가정간호 / 선택의료급여 / 행려 / 결핵·희귀난치·중증 / 등록장애인.',
    },
    {
      id: 'over65', front: '65세 이상 정액', chapter: 'CH05',
      back: '총액 10,000원 이하 → 본인부담 1,200원 정액. 초과 시 30% 정률.',
      hint: '저액 경계선을 외워두면 시험에서 유리.',
    },
    {
      id: 'under6', front: '6세 미만 가산', chapter: 'CH04',
      back: '만 6세 미만 유아: 조제료·관리료·약품에 가산율 적용(야간·공휴일과 복합 시 누적).',
    },
    {
      id: 'saturday', front: '토요가산', chapter: 'CH04',
      back: '토요일 오후(13시 이후) 조제 시 별도 행으로 가산.',
    },
    {
      id: 'ilsu', front: '일수 (days)', chapter: 'CH01',
      back: '처방일수. 약품금액·일부 관리료(Z5010)·보훈/의료급여 정액 산정에 영향.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────

export const DECKS: FlashcardDeck[] = [
  DECK_INSURANCE,
  DECK_SUGA,
  DECK_CONCEPTS,
];

export function getDeck(id: string): FlashcardDeck | null {
  return DECKS.find((d) => d.id === id) ?? null;
}
