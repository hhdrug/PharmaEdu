/**
 * calc-engine/index.ts
 * 공개 API — calculate(options, repo): CalcResult
 */

import type { CalcOptions, CalcResult, ICalcRepository } from './types';
import { calcDrugAmountSum } from './drug-amount';
import { calcDispensingFee } from './dispensing-fee';
import { calcCopayment } from './copayment';

export type { CalcOptions, CalcResult, DrugItem, InsuRate, WageListItem, CalcStep, ICalcRepository }
  from './types';
export { SupabaseCalcRepository } from './supabase-repo';

/**
 * 약제비 계산 메인 엔트리포인트
 *
 * @param opt 계산 입력 파라미터
 * @param repo 수가 데이터 조회 리포지토리
 * @returns CalcResult
 */
export async function calculate(opt: CalcOptions, repo: ICalcRepository): Promise<CalcResult> {
  try {
    // 입력 검증
    if (!opt.dosDate || opt.dosDate.length < 8) {
      return errorResult('DosDate가 올바르지 않습니다 (yyyyMMdd 형식)');
    }
    if (!opt.drugList || opt.drugList.length === 0) {
      return errorResult('약품 목록이 비어있습니다');
    }
    if (!opt.insuCode) {
      return errorResult('보험코드가 누락되었습니다');
    }

    // Step 1: 약품금액 계산
    const { sumInsu: sumInsuDrug, sumUser: sumUserDrug } = calcDrugAmountSum(opt.drugList);

    // Step 2: 조제료 계산
    const { wageList, sumWage } = await calcDispensingFee(opt, repo);

    // Step 3: 보험요율 조회
    const rate = await repo.getInsuRate(opt.insuCode);
    if (!rate) {
      // 보험요율 조회 실패 시 기본값으로 계산
      const fallbackRate = {
        insuCode: opt.insuCode,
        rate: 30,
        sixAgeRate: 70,
        fixCost: 1000,
        mcode: 0,
        bcode: 0,
        age65_12000Less: 20,
      };
      const copay = calcCopayment(sumInsuDrug, sumWage, opt, fallbackRate);
      return buildResult(sumInsuDrug, sumUserDrug, sumWage, wageList, copay);
    }

    // Step 4: 본인부담금 계산
    const copay = calcCopayment(sumInsuDrug, sumWage, opt, rate);

    return buildResult(sumInsuDrug, sumUserDrug, sumWage, wageList, copay);

  } catch (e) {
    console.error('[calc-engine] calculate error:', e);
    return errorResult(e instanceof Error ? e.message : '알 수 없는 오류');
  }
}

function buildResult(
  sumInsuDrug: number,
  sumUserDrug: number,
  sumWage: number,
  wageList: import('./types').WageListItem[],
  copay: import('./copayment').CopayResult
): CalcResult {
  return {
    sumInsuDrug,
    sumWage,
    totalPrice: copay.totalPrice,
    userPrice: copay.userPrice,
    pubPrice: copay.pubPrice,
    wageList,
    steps: [
      {
        title: '약품금액 (01항)',
        formula: '단가 × 1회투약량 × 1일투여횟수 × 총투여일수 (원미만 사사오입)',
        result: sumInsuDrug,
        unit: '원',
      },
      {
        title: '조제료 (02항)',
        formula: 'Z1000+Z2000+Z3000+Z41xx+Z5000 합계',
        result: sumWage,
        unit: '원',
      },
      ...copay.steps,
    ],
  };
}

function errorResult(message: string): CalcResult {
  return {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice: 0,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: message,
  };
}
