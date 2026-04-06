/**
 * calc-engine/drug-amount.ts
 * 약품금액 계산 — CH01 기반
 *
 * 공식: (int)(소모량 × 단가 + 0.5)
 * 소모량 = 1회투약량 × 1일투여횟수 × 총투여일수 / 포장단위
 */

import type { DrugItem } from './types';

/**
 * 약품 1줄의 금액을 계산한다.
 *
 * @param drug DrugItem
 * @returns 약품금액 (정수, 원) — 원미만 사사오입
 */
export function calcDrugAmount(drug: DrugItem): number {
  const pack = drug.pack && drug.pack > 1 ? drug.pack : 1;
  const amount = (drug.dose * drug.dNum * drug.dDay) / pack;
  // (int)(amount * price + 0.5) — 4사5입
  return Math.floor(amount * drug.price + 0.5);
}

/**
 * 약품 목록의 급여약품 금액 합계를 산출한다.
 * (비급여는 sumUserDrug로 분리, MVP에서는 급여합계만 반환)
 */
export function calcDrugAmountSum(drugs: DrugItem[]): {
  sumInsu: number;  // 급여약 합계
  sumUser: number;  // 비급여약 합계
} {
  let sumInsu = 0;
  let sumUser = 0;

  for (const drug of drugs) {
    const amt = calcDrugAmount(drug);
    if (drug.insuPay === 'nonCovered') {
      sumUser += amt;
    } else {
      sumInsu += amt;
    }
  }

  return { sumInsu, sumUser };
}
