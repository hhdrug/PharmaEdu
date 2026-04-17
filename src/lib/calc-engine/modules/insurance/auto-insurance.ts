/**
 * modules/insurance/auto-insurance.ts
 * 자동차보험(F) 본인부담금 계산 모듈
 *
 * 대상 보험코드: F10 (자동차보험)
 *
 * 특징:
 *   - 환자 본인부담금 = 요양급여비용총액1 전액 (100% 자부담)
 *   - 공단청구 없음 (InsuPrice = 0)
 *   - 할증(Premium): 요양기관 종별 기준 할증율(AddRat) 적용 가능
 *   - 비급여약(SumUserDrug)도 환자 전액 부담
 *
 * 계산 흐름:
 *   UserPrice = Trunc10(요양급여비용총액1)  (전액)
 *   InsuPrice = 0
 *   Premium   = Round1(총액1 × AddRat / 100)  [할증 있는 경우]
 *   pubPrice  = 0
 *
 * 참조 문서:
 *   - C#: CopaymentCalculator.cs → CalcCopay_F() (752행)
 *   - C#: CopaymentCalculator.cs step 9 (할증 처리, 254~257행)
 *   - output/CH05_보험유형별_본인부담금.md §6 (자동차보험)
 */

import type { CalcOptions, CalcResult, InsuRate } from '../../types';
import { trunc10, surchargeAmount } from '../../rounding';

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 자동차보험(F10) 본인부담금 계산
 *
 * 처리 순서 (C# CalcCopay_F() + step 9 기준):
 *   1. userPrice = Trunc10(totalPrice)   → 전액 환자 부담, 10원 절사
 *   2. premium   = addRat > 0 ? floor(totalPrice × addRat / 100) : 0   ← CH04 §4-9 int 절사
 *   3. insuPrice = 0  (공단 청구 없음)
 *   4. pubPrice  = 0
 *
 * @param options CalcOptions (addRat 필드 사용)
 * @param result  이전 단계까지의 CalcResult (totalPrice 참조)
 * @param rate    InsuRate (자보는 요율 미사용 — 서명 일관성을 위해 수신)
 * @returns 갱신된 CalcResult
 */
export function calcAutoInsurance(
  options: CalcOptions,
  result: CalcResult,
  rate: InsuRate
): CalcResult {
  // rate는 자동차보험에서 사용하지 않음 (서명 일관성 유지)
  void rate;

  const totalPrice = result.totalPrice;

  // Step 1: 전액 환자 부담 (10원 절사)
  // C# CalcCopay_F(): return Trunc10(pbSum);
  const userPrice = trunc10(totalPrice);

  // Step 2: 할증(Premium) 계산
  // CH04 §4-9 M_AddRat: premium = floor(totalPrice × addRat / 100)  (int 절사)
  const addRat = options.addRat ?? 0;
  const premium = surchargeAmount(totalPrice, addRat);

  // Step 3: 공단 청구액 = 0 (자보는 공단 청구 없음)
  const pubPrice = 0;

  return {
    ...result,
    userPrice,
    pubPrice,
    // premium은 types.ts §5.2에 정의된 확장 필드
    // Integration Lead가 CalcResult에 premium 필드 추가 후 활성화됨
    ...(premium > 0 ? { premium } : {}),
    steps: [
      ...result.steps,
      {
        title: '자동차보험 본인부담금',
        formula: `Trunc10(${totalPrice}) = ${userPrice}`,
        result: userPrice,
        unit: '원',
      },
      ...(premium > 0
        ? [
            {
              title: '자동차보험 할증액',
              formula: `floor(${totalPrice} × ${addRat} / 100) = ${premium}`,
              result: premium,
              unit: '원',
            },
          ]
        : []),
      {
        title: '자동차보험 공단청구액',
        formula: '공단 청구 없음 = 0',
        result: 0,
        unit: '원',
      },
    ],
  };
}
