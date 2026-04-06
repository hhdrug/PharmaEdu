/**
 * modules/special/drug-648.ts
 * 특수약품 648903860 (코로나19 치료제, 팍스로비드 등) 처리 모듈
 *
 * 약품코드 648903860: 5일 투약 상한 + 2024.10.25 이후 5% 가산
 *
 * 적용 규칙:
 *   1. 투약일수(dDay) > 5 이면 5일로 제한
 *   2. 2024.10.25 이후 조제 건에서 해당 약품 급여 금액의 5% 가산
 *   3. 보훈코드 M10, M83, M82 환자는 가산 면제
 *
 * 계산 공식:
 *   surcharge648 = round1(sum648 × 0.05)
 *   UserPrice += surcharge648  (본인부담에 추가)
 *
 * 참조:
 *   - C#: CopaymentCalculator.cs 4d. 648903860 5% 가산 준비 (130~143행)
 *   - C#: CopaymentCalculator.cs userPrice += surcharge648 (165~174행)
 *   - output/CH08_특수케이스.md §4 특수약품 하드코딩
 */

import type { DrugItem } from '../../types';
import { round1 } from '../../rounding';

// ─── 상수 ─────────────────────────────────────────────────────────────────────

export const SPECIAL_DRUG_648 = '648903860';

/** 5일 투약 상한 */
const DAY_LIMIT_648 = 5;

/** 5% 가산 적용 시작일 (yyyyMMdd) */
const SURCHARGE_START_DATE = '20241025';

/** 가산율 5% */
const SURCHARGE_RATE = 0.05;

/** 가산 면제 보훈코드 목록 */
const EXEMPT_BOHUN_CODES = ['M10', 'M83', 'M82'];

// ─── 컨텍스트 인터페이스 ─────────────────────────────────────────────────────

/**
 * 648903860 특수약품 가산 컨텍스트
 */
export interface Drug648CalcContext {
  /** 계산 입력 파라미터 (dosDate, insuCode 등) */
  options: { dosDate: string; [key: string]: unknown };
  /**
   * 648903860 약품의 약품금액 합계 (원)
   * CalcResult.Sum648903860 — Integration Lead가 CalcResult에 추가
   */
  sum648: number;
  /**
   * 보훈코드 (보훈 환자 면제 판정)
   * CalcOptions.bohunCode — Integration Lead가 CalcOptions에 추가
   */
  bohunCode?: string;
}

/**
 * 648903860 가산 계산 결과
 */
export interface Drug648CalcResult {
  /** 적용 여부 */
  applied: boolean;
  /** 648903860 약품금액 합계 */
  sum648: number;
  /** 5% 가산액 */
  surcharge: number;
  /** 미적용 사유 (있을 경우) */
  reason?: string;
}

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 약품 리스트에 648903860이 있는지 확인
 *
 * @param drugList 처방 약품 목록
 * @returns true = 648903860 포함
 */
export function has648Drug(drugList: DrugItem[]): boolean {
  return drugList.some(d => d.code === SPECIAL_DRUG_648);
}

/**
 * 648903860 약품의 5일 투약 상한 적용
 *
 * - 해당 코드 약품의 dDay가 5를 초과하면 5로 제한
 * - 다른 약품은 변경 없음
 * - 원본 배열을 변경하지 않고 새 배열 반환
 *
 * @param drugList 처방 약품 목록
 * @returns 수정된 DrugItem 배열 (648 약품의 dDay가 5 초과면 5로 제한)
 */
export function apply648DayLimit(drugList: DrugItem[]): DrugItem[] {
  return drugList.map(d => {
    if (d.code === SPECIAL_DRUG_648 && d.dDay > DAY_LIMIT_648) {
      return { ...d, dDay: DAY_LIMIT_648 };
    }
    return d;
  });
}

/**
 * 648903860 약품의 급여 금액 합산
 *
 * 약품금액 공식: Math.floor(소모량 × 단가 + 0.5) — drug-amount.ts와 동일
 * 소모량 = dose × dNum × dDay / pack
 * 비급여(insuPay === 'nonCovered')는 제외
 *
 * @param drugList 처방 약품 목록
 * @returns 648903860 약품 급여금액 합계 (원)
 */
export function sum648DrugAmount(drugList: DrugItem[]): number {
  return drugList
    .filter(d => d.code === SPECIAL_DRUG_648 && d.insuPay !== 'nonCovered')
    .reduce((sum, d) => {
      const pack = d.pack && d.pack > 1 ? d.pack : 1;
      const amount = (d.dose * d.dNum * d.dDay) / pack;
      const drugAmt = Math.floor(amount * d.price + 0.5);
      return sum + drugAmt;
    }, 0);
}

/**
 * 2024.10.25 이후 5% 가산 계산
 *
 * 조건:
 *   - dosDate >= '20241025'
 *   - sum648 > 0
 * 미충족 시 가산액 0 반환
 *
 * @param sum648 648903860 약품 합산 금액
 * @param dosDate 조제일자 (yyyyMMdd)
 * @returns 가산 금액 (추가될 액수) — round1(sum648 × 0.05)
 */
export function calc648Surcharge(sum648: number, dosDate: string): number {
  if (dosDate < SURCHARGE_START_DATE) return 0;
  if (sum648 <= 0) return 0;
  return round1(sum648 * SURCHARGE_RATE);
}

/**
 * 메인 진입점: 648903860 약품 전체 처리
 *
 * 처리 순서:
 *   1. 5일 투약 상한 적용 → modifiedDrugList
 *   2. 수정된 목록으로 급여 금액 합산 → sum648
 *   3. 2024.10.25 이후 5% 가산 계산 → surcharge648
 *
 * @param drugList 처방 약품 목록
 * @param dosDate 조제일자 (yyyyMMdd)
 * @returns modifiedDrugList, sum648, surcharge648
 */
export function process648Special(
  drugList: DrugItem[],
  dosDate: string
): {
  modifiedDrugList: DrugItem[];
  sum648: number;
  surcharge648: number;
} {
  // Step 1: 5일 투약 상한 적용
  const modifiedDrugList = apply648DayLimit(drugList);

  // Step 2: 급여 금액 합산 (상한 적용 후 목록 기준)
  const sum648 = sum648DrugAmount(modifiedDrugList);

  // Step 3: 5% 가산 계산
  const surcharge648 = calc648Surcharge(sum648, dosDate);

  return { modifiedDrugList, sum648, surcharge648 };
}

/**
 * 648903860 특수약품 5% 가산 계산 (보훈 면제 포함)
 *
 * Integration Lead가 후처리 체인에서 호출하는 함수.
 * 보훈코드 M10/M83/M82는 가산 면제.
 *
 * 처리 순서:
 *   1. dosDate >= '20241025' 확인
 *   2. sum648 > 0 확인
 *   3. 보훈코드 M10/M83/M82 → 면제 반환
 *   4. surcharge = round1(sum648 × 0.05)
 *
 * @param ctx 648 가산 컨텍스트
 * @returns Drug648CalcResult
 */
export function calcDrug648Surcharge(ctx: Drug648CalcContext): Drug648CalcResult {
  // Step 1: 날짜 조건 (2024.10.25 이후)
  if (ctx.options.dosDate < SURCHARGE_START_DATE) {
    return {
      applied: false,
      sum648: 0,
      surcharge: 0,
      reason: '날짜 조건 미충족 (20241025 이전)',
    };
  }

  // Step 2: 약품금액 합계 확인
  if (ctx.sum648 <= 0) {
    return {
      applied: false,
      sum648: 0,
      surcharge: 0,
      reason: '648903860 약품 없음 (sum648 = 0)',
    };
  }

  // Step 3: 보훈 면제 판정 (M10/M83/M82)
  if (ctx.bohunCode && EXEMPT_BOHUN_CODES.includes(ctx.bohunCode)) {
    return {
      applied: false,
      sum648: ctx.sum648,
      surcharge: 0,
      reason: `보훈코드 ${ctx.bohunCode} 면제`,
    };
  }

  // Step 4: 가산액 계산 — round1(sum648 × 5%)
  const surcharge = round1(ctx.sum648 * SURCHARGE_RATE);

  return {
    applied: true,
    sum648: ctx.sum648,
    surcharge,
  };
}
