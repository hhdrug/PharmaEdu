/**
 * calc-engine/copayment.ts
 * 본인부담금 계산 — CH05 기반 MVP
 *
 * 지원 범위:
 * - C10 건강보험 일반 (30%)
 * - 65세 이상 3구간 (정액 1,000원 / 20% / 30%)
 * - 6세 미만 소아 (21% = 30% × 70%)
 * 미지원: 의료급여(D), 의료급여2종(G), 자동차보험(F), 산재(E), 보훈
 */

import type { CalcOptions, InsuRate } from './types';
import { trunc10, trunc100 } from './rounding';

export interface CopayResult {
  totalPrice: number;   // 요양급여비용총액1 = trunc10(약가+조제료)
  userPrice: number;    // 본인일부부담금
  pubPrice: number;     // 청구액 = totalPrice - userPrice
  steps: CopayStep[];
}

export interface CopayStep {
  title: string;
  formula: string;
  result: number;
  unit: string;
}

/**
 * 본인부담금 계산
 *
 * @param sumInsuDrug 급여 약가 합계
 * @param sumWage 조제료 합계
 * @param opt CalcOptions
 * @param rate 보험요율 마스터
 */
export function calcCopayment(
  sumInsuDrug: number,
  sumWage: number,
  opt: CalcOptions,
  rate: InsuRate
): CopayResult {
  const steps: CopayStep[] = [];

  // Step 1: 요양급여비용총액1 = trunc10(약가+조제료)
  const totalPrice = trunc10(sumInsuDrug + sumWage);
  steps.push({
    title: '요양급여비용총액1',
    formula: `trunc10(${sumInsuDrug} + ${sumWage})`,
    result: totalPrice,
    unit: '원',
  });

  const insuCategory = opt.insuCode.charAt(0).toUpperCase();

  // MVP: C(건강보험)만 지원
  if (insuCategory !== 'C') {
    // 미지원 보험 유형 — 기본 30% 적용 (fallback)
    const userPrice = trunc100(totalPrice * (rate.rate / 100));
    const pubPrice = totalPrice - userPrice;
    steps.push({
      title: '본인부담금 (미지원 보험유형 — 기본 30%)',
      formula: `trunc100(${totalPrice} × ${rate.rate}%)`,
      result: userPrice,
      unit: '원',
    });
    return { totalPrice, userPrice, pubPrice, steps };
  }

  // ── C 건강보험 ────────────────────────────────────────────────────────────

  const age = opt.age;
  let userPrice: number;

  if (age >= 65) {
    // 65세 이상 3구간
    if (totalPrice <= 10000) {
      // 1구간: 정액 1,000원 (단 총액 < 1,000원이면 총액 전체)
      const fixCost = rate.fixCost > 0 ? rate.fixCost : 1000;
      userPrice = Math.min(totalPrice, fixCost);
      steps.push({
        title: '65세 이상 본인부담금 (1구간: 정액)',
        formula: `min(${totalPrice}, ${fixCost})`,
        result: userPrice,
        unit: '원',
      });
    } else if (totalPrice <= 12000) {
      // 2구간: 20%
      const rate2 = rate.age65_12000Less > 0 ? rate.age65_12000Less : 20;
      userPrice = trunc100(totalPrice * (rate2 / 100));
      steps.push({
        title: '65세 이상 본인부담금 (2구간: 20%)',
        formula: `trunc100(${totalPrice} × ${rate2}%)`,
        result: userPrice,
        unit: '원',
      });
    } else {
      // 3구간: 30%
      userPrice = trunc100(totalPrice * (rate.rate / 100));
      steps.push({
        title: '65세 이상 본인부담금 (3구간: 30%)',
        formula: `trunc100(${totalPrice} × ${rate.rate}%)`,
        result: userPrice,
        unit: '원',
      });
    }
  } else if (age < 6) {
    // 6세 미만 소아: 30% × 70% = 21%
    const baseUser = trunc100(totalPrice * (rate.rate / 100));
    userPrice = trunc100(baseUser * (rate.sixAgeRate / 100));
    steps.push({
      title: '6세 미만 본인부담금 (30% × 70%)',
      formula: `trunc100(trunc100(${totalPrice} × ${rate.rate}%) × ${rate.sixAgeRate}%)`,
      result: userPrice,
      unit: '원',
    });
  } else {
    // 일반 C10: 30%
    userPrice = trunc100(totalPrice * (rate.rate / 100));
    steps.push({
      title: '본인부담금 (건강보험 30%)',
      formula: `trunc100(${totalPrice} × ${rate.rate}%)`,
      result: userPrice,
      unit: '원',
    });
  }

  const pubPrice = totalPrice - userPrice;
  steps.push({
    title: '청구액',
    formula: `${totalPrice} - ${userPrice}`,
    result: pubPrice,
    unit: '원',
  });

  return { totalPrice, userPrice, pubPrice, steps };
}
