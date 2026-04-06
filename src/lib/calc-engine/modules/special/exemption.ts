/**
 * modules/special/exemption.ts
 * 산정특례 (V252 계열) 본인부담율 조정 모듈 — Expert #14
 *
 * 산정특례(算定特例)란:
 *   중증질환·희귀난치성질환·결핵 등 특정 질환 환자에 대해
 *   본인부담율을 일반 30%에서 경감(0~10%) 적용하는 제도.
 *
 * V252 계열 체계:
 *   약국에서 조제할 때 처방전 발행 의료기관 종별에 따라 본인부담율이 결정된다.
 *   V252(상급종합) / V352(종합병원) / V452(병원·의원)
 *   등급(SeSickNoType)별로 insu_rate 테이블의 v2520/v2521 컬럼 값 사용.
 *
 * 면제 코드 (0%):
 *   V193, V124, V001, 결핵 특례 코드 등은 본인부담 전액 면제.
 *
 * 참조:
 *   - C#: CopaymentCalculator.cs → DetermineInsuRate() (4단계 요율 결정)
 *   - C#: CopaymentCalculator.cs → IsV252Series() (V252 계열 판정)
 *   - C#: MediIllnessInfo.cs → SeSickNoType 필드 ("0"/"1"/"4")
 *   - CH05 §3.5 산정특례 요율표
 *   - insu_rate 테이블: v2520(0등급), v2521(1등급) 컬럼
 */

import type { InsuRate } from '../../types';

// ─── 내부 상수 ────────────────────────────────────────────────────────────────

/**
 * 면제(0%) 고정 코드 목록
 * C# DetermineInsuRate: illness.Rate >= 0 조건으로 처리되나,
 * DB에 Rate=0으로 등록된 코드들을 명시적으로 나열.
 *
 * V193 — 중증화상 (결핵/희귀 면제)
 * V124 — 기타 선별급여 특례
 * V001 — 암(중증질환) 특례 중 면제 케이스
 *
 * 실제 운영에서는 DB MediIllness 테이블 조회가 우선이며,
 * 이 목록은 DB 없이 코드만으로 판단하는 inferExemptionRate()의 fallback.
 */
const ZERO_RATE_CODES = new Set<string>([
  'V193', // 중증화상 면제
  'V124', // 기타 특례 면제
  'V001', // 암 면제 케이스
]);

/**
 * 코드 → 고정 요율 매핑 (DB 없이 코드만으로 추론 가능한 케이스)
 *
 * V252 계열은 insu_rate DB v2520/v2521 값이 필요하므로 여기에 포함하지 않음.
 * V100은 산정특례 적용 제외(일반 30%) — null 반환.
 */
const STATIC_RATE_MAP: Record<string, number> = {
  // 결핵 (제5조의2) — 0%
  V254: 0,
  // 중증(제4조) 계열 — 5%
  V009: 5,
  V010: 5,
  V012: 5,
  V013: 5,
  V014: 5,
  V015: 5,
  V016: 5,
  V017: 5,
  V018: 5,
  V019: 5,
  V020: 5,
  V021: 5,
  V022: 5,
  V023: 5,
  V024: 5,
  V025: 5,
  // 희귀·중증난치(제5조) 계열 — 10%
  V106: 10,
  V107: 10,
  V108: 10,
  V109: 10,
  V110: 10,
  V111: 10,
  V112: 10,
  V113: 10,
  V114: 10,
  V116: 10,
  V118: 10,
  V119: 10,
  V130: 10,
  V131: 10,
  V132: 10,
  V133: 10,
};

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * V252 계열 질병 판정
 *
 * C# IsV252Series() 포팅:
 *   code == "V252" || code == "V352" || code == "V452"
 *
 * @param mediIllness 특정기호 코드 (예: "V252", "V352", "V452")
 * @returns V252/V352/V452 계열이면 true
 */
export function isV252Series(mediIllness: string): boolean {
  if (!mediIllness) return false;
  return mediIllness === 'V252' || mediIllness === 'V352' || mediIllness === 'V452';
}

/**
 * 산정특례 요율 결정
 *
 * C# DetermineInsuRate() 2단계·3단계 로직 포팅.
 * (4단계 중 2번: 질병코드 요율 적용, 3번: V252 등급별 대체)
 *
 * 4단계 전체 흐름:
 *   1단계: 기본 rate (DB insu_rate.rate) — 호출자가 baseRate로 전달
 *   2단계: 질병코드(산정특례) → rate 객체의 mediIllnessInfo.rate 적용
 *          (이 함수에서는 rate 테이블 + mediIllness 코드 기반으로 판단)
 *   3단계: V252 계열 → insu_rate.v2520 / v2521 대체
 *   4단계: 6세 미만 경감 — copayment.ts에서 처리
 *
 * 반환 규칙:
 *   - 산정특례 적용 요율(0~100) 반환
 *   - -1 반환 시 산정특례 미적용 (호출자는 baseRate 유지)
 *
 * V252 계열 등급 판정:
 *   grade 0 또는 4 → insu_rate.v2520 사용 (0보다 큰 경우)
 *   grade 1        → insu_rate.v2521 사용 (0보다 큰 경우)
 *   grade 없음     → V252=50 / V352=40 / V452=30 고정값
 *
 * 면제 코드:
 *   V193, V124, V001 등 → 0%
 *
 * @param mediIllness 특정기호 코드
 * @param rate 보험요율 마스터 (insu_rate 테이블 1행)
 * @param baseRate 기본 본인부담율 (%) — 산정특례 없을 때 반환되는 fallback
 * @returns 적용 요율 (0~100), -1이면 산정특례 미적용
 */
export function determineExemptionRate(
  mediIllness: string,
  rate: InsuRate,
  baseRate: number
): number {
  if (!mediIllness) return -1;

  // V100: 산정특례 적용 제외 — 일반 요율 유지 (미적용 반환)
  if (mediIllness === 'V100') return -1;

  // ── 면제(0%) 고정 코드 ──────────────────────────────────────────────────
  if (ZERO_RATE_CODES.has(mediIllness)) {
    return 0;
  }

  // ── V252 계열 (3단계: 등급별 insu_rate 필드 사용) ────────────────────────
  if (isV252Series(mediIllness)) {
    // grade는 호출자가 InsuRate에 별도 전달할 수 없으므로
    // 여기서는 mediIllness 코드 자체로 고정 매핑만 처리.
    // 등급별(v2520/v2521) 분기는 determineExemptionRateWithGrade()로 확장 가능.
    //
    // InsuRate에 v2520/v2521 필드가 있을 경우 v2520 우선 사용 (0등급 기본값).
    const extRate = rate as InsuRate & { v2520?: number; v2521?: number };

    if (mediIllness === 'V252') {
      // 0등급(기본) — v2520 > 0이면 DB 값, 없으면 고정 50%
      if (extRate.v2520 && extRate.v2520 > 0) return extRate.v2520;
      return 50;
    }
    if (mediIllness === 'V352') {
      return 40;
    }
    if (mediIllness === 'V452') {
      return 30;
    }
  }

  // ── 정적 매핑 (중증 5%, 희귀 10% 등) ────────────────────────────────────
  const staticRate = STATIC_RATE_MAP[mediIllness];
  if (staticRate !== undefined) {
    return staticRate;
  }

  // ── V0xx 패턴 — 중증질환(제4조) 5% ──────────────────────────────────────
  if (/^V0\d\d$/.test(mediIllness)) {
    return 5;
  }

  // ── V1xx 패턴 — 희귀/중증난치(제5조) 10% ─────────────────────────────────
  if (/^V1\d\d$/.test(mediIllness)) {
    return 10;
  }

  // 알 수 없는 코드 — 미적용
  return -1;
}

/**
 * V252 계열 등급별 산정특례 요율 결정 (등급 정보 있는 경우)
 *
 * C# DetermineInsuRate() 3단계:
 *   등급 "0" 또는 "4" → insu_rate.v2520 (0보다 큰 경우)
 *   등급 "1"           → insu_rate.v2521 (0보다 큰 경우)
 *
 * 이 함수는 MediIllnessInfo.SeSickNoType 값을 알고 있을 때 사용.
 * Integration Lead가 CalcOptions에 mediIllnessInfo를 추가한 후
 * copayment.ts에서 이 함수를 호출하도록 연결 예정.
 *
 * @param mediIllness 특정기호 코드 (V252/V352/V452)
 * @param grade SeSickNoType 값 ("0"/"1"/"4")
 * @param rate 보험요율 마스터 (v2520/v2521 컬럼 포함)
 * @returns 적용 요율 (0~100), -1이면 V252 계열 아님
 */
export function determineV252RateByGrade(
  mediIllness: string,
  grade: string,
  rate: InsuRate & { v2520?: number; v2521?: number }
): number {
  if (!isV252Series(mediIllness)) return -1;

  if (grade === '0' || grade === '4') {
    if (rate.v2520 && rate.v2520 > 0) return rate.v2520;
  } else if (grade === '1') {
    if (rate.v2521 && rate.v2521 > 0) return rate.v2521;
  }

  // grade가 없거나 DB 값이 없으면 mediIllness 코드 기준 고정값
  if (mediIllness === 'V252') return 50;
  if (mediIllness === 'V352') return 40;
  if (mediIllness === 'V452') return 30;

  return -1;
}

/**
 * 질병코드 → 요율 직접 매핑 (캐시·간편 조회용)
 *
 * DB(MediIllness 테이블) 조회 없이 코드만으로 추론.
 * V252 계열은 insu_rate DB 값이 필요하므로 고정 기본값을 반환.
 * DB 조회가 가능한 경우에는 determineExemptionRate()를 사용할 것.
 *
 * 반환:
 *   number — 추론된 요율 (%)
 *   null   — 판단 불가 (DB 조회 필요)
 *
 * @param mediIllness 특정기호 코드
 * @returns 추론된 요율 또는 null
 */
export function inferExemptionRate(mediIllness: string): number | null {
  if (!mediIllness) return null;

  // 산정특례 제외
  if (mediIllness === 'V100') return null;

  // 면제 0%
  if (ZERO_RATE_CODES.has(mediIllness)) return 0;

  // V252 계열 고정값 (등급 정보 없는 경우)
  if (mediIllness === 'V252') return 50;
  if (mediIllness === 'V352') return 40;
  if (mediIllness === 'V452') return 30;

  // 정적 매핑
  const staticRate = STATIC_RATE_MAP[mediIllness];
  if (staticRate !== undefined) return staticRate;

  // V0xx — 중증 5%
  if (/^V0\d\d$/.test(mediIllness)) return 5;

  // V1xx — 희귀/중증난치 10%
  if (/^V1\d\d$/.test(mediIllness)) return 10;

  // 판단 불가
  return null;
}
