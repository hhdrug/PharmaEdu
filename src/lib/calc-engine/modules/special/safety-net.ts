/**
 * modules/special/safety-net.ts
 * 본인부담상한제 (OverUserPrice) 처리 모듈
 *
 * 본인부담상한제:
 *   연간 본인부담 누적액이 소득분위별 상한액을 초과하는 경우,
 *   초과분을 공단에서 대신 납부하는 제도.
 *   약국은 청구 시점에 상한제 적용 여부를 판정하지 않고,
 *   공단에서 사후 정산 처리하는 것이 원칙.
 *
 *   그러나 일부 경우 약국 시스템에서 OverUserPrice를 계산하여
 *   RealPrice에서 차감 처리한다.
 *
 * 계산 흐름 (C# CopaymentCalculator.cs step 14):
 *   OverUserPrice = 상한제 초과금
 *   실수납금(RealPrice) = UserPrice - PubPrice - OverUserPrice
 *   InsuPrice += OverUserPrice  (공단 청구액에 포함)
 *
 * 참조:
 *   - C#: CopaymentCalculator.cs → ApplyOverUserPrice() (step 14, 1085행)
 *   - 소득분위별 상한액: 2024년 기준 (보건복지부 고시)
 */

import type { CalcOptions, CalcResult } from '../../types';

// ─── 소득분위별 연간 본인부담 상한액 (2024년 기준) ──────────────────────────

/**
 * 소득분위별 연간 본인부담 상한액 (원)
 * 2024년 기준 (보건복지부 고시)
 *
 * 분위 그룹별 상한액:
 *   1분위        : 870,000원
 *   2~3분위      : 1,030,000원
 *   4~5분위      : 1,550,000원
 *   6~7분위      : 2,210,000원
 *   8~9분위      : 3,080,000원
 *   10분위       : 5,980,000원
 */
export const ANNUAL_CAP_BY_DECILE: Record<number, number> = {
  1:  870_000,
  2:  1_030_000,
  3:  1_030_000,
  4:  1_550_000,
  5:  1_550_000,
  6:  2_210_000,
  7:  2_210_000,
  8:  3_080_000,
  9:  3_080_000,
  10: 5_980_000,
};

// ─── 컨텍스트 인터페이스 ─────────────────────────────────────────────────────

/**
 * 본인부담상한제 적용 컨텍스트
 */
export interface SafetyNetCalcContext {
  /** 계산 입력 파라미터 */
  options: CalcOptions;
  /** 현재 건 본인부담금 (상한제 적용 전) */
  userPrice: number;
  /**
   * 연간 누적 본인부담액 (원)
   * 이 건 이전까지 해당 연도의 누적 본인부담
   */
  cumulativeUserPrice?: number;
  /**
   * 소득분위 (1~10)
   * 공단에서 제공 또는 환자 등록 정보에서 조회
   */
  incomeDecile?: number;
  /**
   * 연간 상한액 (원)
   * 소득분위별 고시 금액 (DB 또는 상수 테이블에서 조회)
   * 제공 시 ANNUAL_CAP_BY_DECILE 대신 이 값을 우선 사용
   */
  annualCap?: number;
}

/**
 * 본인부담상한제 계산 결과
 */
export interface SafetyNetCalcResult {
  /** 상한제 적용 여부 */
  applied: boolean;
  /** 상한제 초과금 (공단 전환액) */
  overUserPrice: number;
  /** 상한제 적용 후 실 환자 부담금 */
  adjustedUserPrice: number;
  /** 미적용 사유 */
  reason?: string;
}

// ─── CalcResult 확장 타입 ────────────────────────────────────────────────────

/**
 * 본인부담상한제 적용 후 CalcResult 확장 타입
 * Integration Lead가 types.ts에 insuPrice/overUserPrice 필드를 추가하기 전까지
 * 이 모듈 내에서 자체 확장 타입을 사용한다.
 */
export type CalcResultWithSafetyNet = CalcResult & {
  /** 본인부담상한제 초과금 (공단 전환액) */
  overUserPrice: number;
  /** 공단 청구액 (pubPrice + overUserPrice) */
  insuPrice: number;
};

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 본인부담상한제 초과분 계산
 *
 * 로직:
 *   total = yearlyAccumulated + currentUserPrice
 *   overage = max(0, total - cap)
 *   overage = min(overage, currentUserPrice)  // 이번 건 본인부담 초과 불가
 *
 * @param currentUserPrice  현재 건 본인부담금
 * @param yearlyAccumulated 올해 누적 본인부담금 (이 건 이전까지)
 * @param decile            소득분위 (1~10)
 * @returns 상한제 초과금 (원, 0 이상)
 */
export function calcSafetyNetOverage(
  currentUserPrice: number,
  yearlyAccumulated: number,
  decile: number,
): number {
  const cap = ANNUAL_CAP_BY_DECILE[decile] ?? ANNUAL_CAP_BY_DECILE[10];
  const total = yearlyAccumulated + currentUserPrice;
  const raw = total - cap;
  if (raw <= 0) return 0;
  // 초과분은 이번 건 본인부담을 초과할 수 없음
  return Math.min(raw, currentUserPrice);
}

/**
 * 본인부담상한제 적용
 *
 * 처리 흐름:
 *   1. calcSafetyNetOverage()로 초과금 산출
 *   2. userPrice -= overage
 *   3. insuPrice(공단청구) += overage  →  pubPrice 재산출
 *
 * @param options           CalcOptions (현재 미사용, 향후 확장용)
 * @param result            calcCopayment() 등에서 산출된 CalcResult
 * @param yearlyAccumulated 올해 누적 본인부담금 (이 건 이전까지)
 * @param decile            소득분위 (1~10)
 * @returns 본인부담상한제 적용 후 CalcResult (overUserPrice, insuPrice 필드 추가)
 */
export function applySafetyNet(
  options: CalcOptions,
  result: CalcResult,
  yearlyAccumulated: number,
  decile: number,
): CalcResultWithSafetyNet {
  // options는 향후 확장(소득분위 자동 조회 등)을 위해 인자로 받아둠
  void options;

  const overage = calcSafetyNetOverage(result.userPrice, yearlyAccumulated, decile);

  const newUserPrice = result.userPrice - overage;
  // insuPrice = 기존 공단청구(pubPrice) + 상한제 전환분
  const newInsuPrice = result.pubPrice + overage;

  return {
    ...result,
    userPrice: newUserPrice,
    pubPrice: newInsuPrice,   // pubPrice = totalPrice - userPrice 관계 유지
    overUserPrice: overage,
    insuPrice: newInsuPrice,
  };
}

/**
 * 본인부담상한제 처리 (컨텍스트 객체 방식, 내부 호환용)
 *
 * @param ctx SafetyNetCalcContext
 * @returns SafetyNetCalcResult
 */
export function calcSafetyNet(ctx: SafetyNetCalcContext): SafetyNetCalcResult {
  const { userPrice, cumulativeUserPrice, incomeDecile, annualCap } = ctx;

  // 필수 파라미터 확인
  if (cumulativeUserPrice === undefined || cumulativeUserPrice === null) {
    return {
      applied: false,
      overUserPrice: 0,
      adjustedUserPrice: userPrice,
      reason: '연간 누적 본인부담액(cumulativeUserPrice) 미제공 — 사후정산 방식 사용',
    };
  }

  if (incomeDecile === undefined && annualCap === undefined) {
    return {
      applied: false,
      overUserPrice: 0,
      adjustedUserPrice: userPrice,
      reason: '소득분위(incomeDecile) 또는 연간상한액(annualCap) 미제공',
    };
  }

  // 연간 상한액 결정
  const cap =
    annualCap !== undefined
      ? annualCap
      : ANNUAL_CAP_BY_DECILE[incomeDecile!] ?? ANNUAL_CAP_BY_DECILE[10];

  const total = cumulativeUserPrice + userPrice;
  if (total <= cap) {
    return {
      applied: false,
      overUserPrice: 0,
      adjustedUserPrice: userPrice,
      reason: `누적(${total.toLocaleString()}원) ≤ 상한액(${cap.toLocaleString()}원)`,
    };
  }

  const over = total - cap;
  // 초과분은 이번 건 본인부담을 초과할 수 없음
  const overUserPrice = Math.min(over, userPrice);
  const adjustedUserPrice = userPrice - overUserPrice;

  return {
    applied: true,
    overUserPrice,
    adjustedUserPrice,
  };
}
