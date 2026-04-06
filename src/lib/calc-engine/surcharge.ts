/**
 * calc-engine/surcharge.ts
 * 가산 판정 로직 — CH04 기반
 *
 * 가산 우선순위 (상호 배타적 if-else 체인):
 *   [전제] 비대면 조제 → 모든 가산 비활성화
 *   1순위: 가루약 가산 → 야간/공휴/소아심야/토요/소아 전부 배제
 *   2순위: 야간/공휴 가산 → 배타적(야간 또는 공휴 중 하나)
 *   3순위: 소아심야 가산 → 2순위 미해당 시
 *   4순위: 토요 가산 → 2~3순위 미해당 시
 *   [추가] 소아 가산: 1순위(가루약) 미적용 시 2~4순위와 중복 가능
 *
 * holidayGb 코드 체계 (비즈팜 호환):
 *   "0" — 해당 없음
 *   "1" — 야간
 *   "3" — 토요
 *   "5" — 공휴일
 *   "6" — 6세 미만 단독
 *   "7" — 6세 미만 + 공휴일
 *   "8" — 6세 미만 + 야간
 *
 * Z코드 접미사:
 *   야간   → 010
 *   공휴일 → 050
 *   토요   → 030
 *   6세미만  → 600 (Z2000 전용)
 *   6세미만+야간  → 610 (Z2000 전용)
 *   6세미만+공휴  → 650 (Z2000 전용)
 */

export interface SurchargeInput {
  /** 환자 나이 */
  age: number;
  /** 야간 가산 여부 */
  isNight?: boolean;
  /** 공휴일 가산 여부 */
  isHolyDay?: boolean;
  /** 토요일 가산 여부 */
  isSaturday?: boolean;
  /** 심야 가산 여부 (6세 미만 전용) */
  isMidNight?: boolean;
  /** 가루약(산제) 가산 여부 */
  isPowder?: boolean;
  /** 비대면 조제 여부 ("U") */
  isNonFace?: boolean;
}

export interface SurchargeFlags {
  /**
   * 비즈팜 호환 holiday_gb 단일 코드
   * "0"/"1"/"3"/"5"/"6"/"7"/"8"
   */
  holidayGb: string;

  /** 가루약 가산 활성 여부 */
  isPowder: boolean;

  /** 6세 미만 가산 활성 여부 */
  isChild: boolean;

  /** 토요 가산 활성 여부 (별도 행 분리용) */
  isSaturday: boolean;

  /** 야간 가산 활성 여부 */
  isNight: boolean;

  /** 공휴일 가산 활성 여부 */
  isHolyDay: boolean;
}

/**
 * 가산 판정 — 우선순위 체인 적용
 *
 * @param input 가산 입력 파라미터
 * @returns SurchargeFlags — 어느 가산이 활성화되었는지와 holidayGb 코드
 */
export function determineSurcharge(input: SurchargeInput): SurchargeFlags {
  const age = typeof input.age === 'number' ? input.age : 0;
  const isChild = age < 6;

  // [전제] 비대면 조제 → 모든 가산 비활성화
  if (input.isNonFace) {
    return {
      holidayGb: '0',
      isPowder: false,
      isChild: false,
      isSaturday: false,
      isNight: false,
      isHolyDay: false,
    };
  }

  // [1순위] 가루약 가산 → 다른 모든 가산 배제 (소아 포함)
  if (input.isPowder) {
    return {
      holidayGb: '0',
      isPowder: true,
      isChild: false, // 가루약 + 소아 → 소아 미적용
      isSaturday: false,
      isNight: false,
      isHolyDay: false,
    };
  }

  // ── [2순위] 야간/공휴 가산 (배타적) ────────────────────────────────────────
  // 공휴일이 야간보다 우선 (공휴일이면 야간 판정 생략)
  if (input.isHolyDay) {
    // 공휴일 + 6세 미만
    if (isChild) {
      return {
        holidayGb: '7',
        isPowder: false,
        isChild: true,
        isSaturday: false,
        isNight: false,
        isHolyDay: true,
      };
    }
    return {
      holidayGb: '5',
      isPowder: false,
      isChild: false,
      isSaturday: false,
      isNight: false,
      isHolyDay: true,
    };
  }

  if (input.isNight) {
    // 야간 + 6세 미만
    if (isChild) {
      return {
        holidayGb: '8',
        isPowder: false,
        isChild: true,
        isSaturday: false,
        isNight: true,
        isHolyDay: false,
      };
    }
    return {
      holidayGb: '1',
      isPowder: false,
      isChild: false,
      isSaturday: false,
      isNight: true,
      isHolyDay: false,
    };
  }

  // ── [3순위] 소아심야 가산 (6세 미만 + 심야) ────────────────────────────────
  // 2순위 미해당 시에만
  if (input.isMidNight && isChild) {
    return {
      holidayGb: '8', // 비즈팜: 소아심야도 "8" 계열 사용
      isPowder: false,
      isChild: true,
      isSaturday: false,
      isNight: true, // 소아심야는 야간 코드 계열
      isHolyDay: false,
    };
  }

  // ── [4순위] 토요 가산 ────────────────────────────────────────────────────────
  // 2~3순위 미해당 시에만 (2016.09.29 이후 별도 행으로 분리)
  if (input.isSaturday) {
    // 토요 + 6세 미만: 소아 가산은 토요와 중복 가능
    return {
      holidayGb: '3',
      isPowder: false,
      isChild: isChild,
      isSaturday: true,
      isNight: false,
      isHolyDay: false,
    };
  }

  // ── 가산 없음 (소아 단독은 holidayGb="6") ───────────────────────────────────
  if (isChild) {
    return {
      holidayGb: '6',
      isPowder: false,
      isChild: true,
      isSaturday: false,
      isNight: false,
      isHolyDay: false,
    };
  }

  return {
    holidayGb: '0',
    isPowder: false,
    isChild: false,
    isSaturday: false,
    isNight: false,
    isHolyDay: false,
  };
}

/**
 * holidayGb → Z코드 접미사 변환
 *
 * @param holidayGb 비즈팜 holidayGb 코드
 * @param codeType 수가 코드 종류 ("Z2000" | "Z3000" | "Z41xx" | "Z4120" | "Z4121" | "other")
 * @returns 접미사 문자열 (없으면 "")
 */
export function getSurchargeSuffix(
  holidayGb: string,
  codeType: 'Z2000' | 'Z3000' | 'Z41xx' | 'Z4120' | 'Z4121' | 'other'
): string {
  switch (codeType) {
    case 'Z2000':
      // Z2000 전용: 6세미만 복합 코드 존재
      switch (holidayGb) {
        case '1': return '010'; // 야간
        case '5': return '050'; // 공휴
        case '6': return '600'; // 6세미만 단독
        case '7': return '650'; // 6세미만+공휴
        case '8': return '610'; // 6세미만+야간
        case '3': return '030'; // 토요
        default:  return '';
      }

    case 'Z3000':
      // Z3000: 6세미만 단독 코드 없음 (CH04 §4-3 주의사항)
      switch (holidayGb) {
        case '1': case '8': return '010'; // 야간 (6세미만+야간도 야간 코드)
        case '5': case '7': return '050'; // 공휴 (6세미만+공휴도 공휴 코드)
        case '3':           return '030'; // 토요
        default:            return '';    // 6세미만 단독은 기본 코드
      }

    case 'Z41xx':
    case 'Z4120':
      // 내복약·외용약: 야간/공휴/토요 접미사
      switch (holidayGb) {
        case '1': case '8': return '010';
        case '5': case '7': return '050';
        case '3':           return '030';
        default:            return '';
      }

    case 'Z4121':
      // 내복+외용 동시: 야간/공휴/토요
      switch (holidayGb) {
        case '1': case '8': return '010';
        case '5': case '7': return '050';
        case '3':           return '030';
        default:            return '';
      }

    default:
      return '';
  }
}

/**
 * 토요 가산 별도 행 코드 목록 (2016.09.29 이후)
 *
 * 토요일에는 기본 조제료에 더해 토요 가산분을 별도 행으로 추가.
 * 반환값: 추가할 Z코드 목록 (가산 접미사 "030" 포함)
 */
export function getSaturdayAddCodes(
  hasInternal: boolean,
  hasExternal: boolean,
  internalDay: number
): string[] {
  const codes: string[] = [];

  // Z2000030, Z3000030 — 항상 추가
  codes.push('Z2000030');
  codes.push('Z3000030');

  // Z41xx030 — 내복약 있으면
  if (hasInternal) {
    if (internalDay <= 15) {
      codes.push(`Z41${String(internalDay).padStart(2, '0')}030`);
    }
    // 16일 이상은 presc_dosage_fee에서 조회 후 "030" 붙임 (별도 처리)
  }

  // Z4120030 — 외용약 있으면
  if (hasExternal) {
    codes.push('Z4120030');
  }

  return codes;
}
