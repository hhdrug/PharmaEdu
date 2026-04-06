/**
 * calc-engine/index.ts
 * 공개 API — calculate(options, repo): CalcResult
 *
 * Phase 5 파이프라인:
 *   Step 0: 648903860 5일 상한 적용 (약품 목록 전처리)
 *   Step 1: 약품금액 계산 (calcDrugAmountSum)
 *   Step 2: 조제료 계산 (calcDispensingFee)
 *   Step 3: 보험요율 조회 + 산정특례 요율 결정 (determineExemptionRate)
 *   Step 4: 본인부담금 계산 (calcCopayment — 보험유형별 모듈 위임)
 *   Step 5: 648 5% 가산 후처리
 *   Step 6: 본인부담상한제 후처리 (yearlyAccumulated 제공 시)
 */

import type { CalcOptions, CalcResult, ICalcRepository, MediIllnessInfo } from './types';
import { calcDrugAmountSum } from './drug-amount';
import { calcDispensingFee } from './dispensing-fee';
import { calcCopayment } from './copayment';
import { process648Special, calcDrug648Surcharge } from './modules/special/drug-648';
import { applySafetyNet } from './modules/special/safety-net';

export type { CalcOptions, CalcResult, DrugItem, InsuRate, WageListItem, CalcStep, ICalcRepository, MediIllnessInfo }
  from './types';
export { SupabaseCalcRepository } from './supabase-repo';
export { determineSurcharge } from './surcharge';
export type { SurchargeFlags, SurchargeInput } from './surcharge';

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

    // ── Step 0: 648903860 특수약품 전처리 ─────────────────────────────────
    // 5일 투약 상한 적용 (약품 금액 계산 전에 처리)
    const { modifiedDrugList, sum648, surcharge648 } = process648Special(
      opt.drugList,
      opt.dosDate
    );
    // 수정된 약품 목록을 이번 계산에 사용
    const effectiveDrugList = modifiedDrugList;
    const effectiveOpt: CalcOptions = { ...opt, drugList: effectiveDrugList };

    // ── Step 1: 약품금액 계산 ────────────────────────────────────────────
    const { sumInsu: sumInsuDrug, sumUser: sumUserDrug } = calcDrugAmountSum(effectiveDrugList);

    // ── Step 2: 조제료 계산 ──────────────────────────────────────────────
    const { wageList, sumWage } = await calcDispensingFee(effectiveOpt, repo);

    // ── Step 3: 보험요율 조회 + 산정특례 요율 결정 ─────────────────────
    const rate = await repo.getInsuRate(opt.insuCode);

    // 산정특례 MediIllnessInfo: opt.mediIllnessInfo 우선, DB 조회 가능하면 조회
    let illnessInfo: MediIllnessInfo | undefined = opt.mediIllnessInfo;
    if (!illnessInfo && opt.mediIllness && repo.getMediIllnessInfo) {
      illnessInfo = (await repo.getMediIllnessInfo(opt.mediIllness)) ?? undefined;
    }

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
      const copay = calcCopayment(sumInsuDrug, sumWage, effectiveOpt, fallbackRate, illnessInfo);
      let result = buildResult(sumInsuDrug, sumUserDrug, sumWage, wageList, copay);
      result = applyPostProcessing(result, effectiveOpt, sum648, surcharge648);
      return result;
    }

    // ── Step 4: 본인부담금 계산 (보험유형별 모듈 위임) ──────────────────
    const copay = calcCopayment(sumInsuDrug, sumWage, effectiveOpt, rate, illnessInfo);

    let result = buildResult(sumInsuDrug, sumUserDrug, sumWage, wageList, copay);

    // sum648 결과를 CalcResult에 기록
    if (sum648 > 0) {
      result = { ...result, sum648 };
    }

    // ── Step 5/6: 후처리 (648 가산 + 상한제) ─────────────────────────
    result = applyPostProcessing(result, effectiveOpt, sum648, surcharge648);

    return result;

  } catch (e) {
    console.error('[calc-engine] calculate error:', e);
    return errorResult(e instanceof Error ? e.message : '알 수 없는 오류');
  }
}

/**
 * 후처리 체인: 648 5% 가산 + 본인부담상한제
 */
function applyPostProcessing(
  result: CalcResult,
  opt: CalcOptions,
  sum648: number,
  surcharge648: number,
): CalcResult {
  let r = { ...result };

  // ── Step 5: 648903860 5% 가산 적용 ───────────────────────────────────────
  if (sum648 > 0) {
    const drug648Result = calcDrug648Surcharge({
      options: { dosDate: opt.dosDate },
      sum648,
      bohunCode: opt.bohunCode,
    });

    if (drug648Result.applied && drug648Result.surcharge > 0) {
      r = {
        ...r,
        userPrice: r.userPrice + drug648Result.surcharge,
        sum648,
        steps: [
          ...r.steps,
          {
            title: '648903860 특수약품 5% 가산',
            formula: `round1(${sum648} × 5%) = ${drug648Result.surcharge}원 → UserPrice에 가산`,
            result: drug648Result.surcharge,
            unit: '원',
          },
        ],
      };
    } else if (surcharge648 > 0) {
      // process648Special의 사전 계산값 사용 (보훈 면제 등 미고려된 경우 보완)
      r = { ...r, sum648 };
    }
  }

  // ── Step 6: 본인부담상한제 적용 (yearlyAccumulated 제공 시) ──────────────
  if (opt.yearlyAccumulated !== undefined && opt.incomeDecile !== undefined) {
    const snResult = applySafetyNet(opt, r, opt.yearlyAccumulated, opt.incomeDecile);
    r = { ...snResult };
  }

  return r;
}

function buildResult(
  sumInsuDrug: number,
  sumUserDrug: number,
  sumWage: number,
  wageList: import('./types').WageListItem[],
  copay: import('./copayment').CopayResult
): CalcResult {
  // sumUserDrug: 비급여 약가 합계 (향후 sumInsuDrug100 등에 활용)
  void sumUserDrug;

  const result: CalcResult = {
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
  // 3자배분 필드 전달 (보훈 등)
  if (copay.mpvaPrice !== undefined) result.mpvaPrice = copay.mpvaPrice;
  if (copay.insuPrice !== undefined) result.insuPrice = copay.insuPrice;
  return result;
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
