/**
 * calc-engine/copayment.ts
 * 본인부담금 계산 — CH05 기반
 *
 * 지원 범위:
 * - C10 건강보험 일반 (30%)
 * - 65세 이상 3구간 (정액 FixCost / 20% / 30%)
 * - 6세 미만 소아 (21% = 30% × 70%)
 * - D계열 의료급여 — calcMedicalAid 모듈로 위임 (확장)
 * - G계열 보훈 — calcVeteran 모듈로 위임
 * - F계열 자동차보험 — calcAutoInsurance 모듈로 위임
 * - E계열 산재 — calcWorkersComp 모듈로 위임
 */

import type { CalcOptions, CalcResult, InsuRate, MediIllnessInfo } from './types';
import { trunc10, trunc100 } from './rounding';
import { calcVeteran } from './modules/insurance/veteran';
import { calcMedicalAid } from './modules/insurance/medical-aid';
import { calcAutoInsurance } from './modules/insurance/auto-insurance';
import { calcWorkersComp } from './modules/insurance/workers-comp';
import { determineExemptionRate, determineV252RateByGrade } from './modules/special/exemption';

export interface CopayResult {
  totalPrice: number;   // 요양급여비용총액1 = trunc10(약가+조제료)
  userPrice: number;    // 본인일부부담금
  pubPrice: number;     // 청구액 = totalPrice - userPrice
  steps: CopayStep[];
  /** 보훈청 청구액 (3자배분 시 채워짐) */
  mpvaPrice?: number;
  /** 공단 청구액 (3자배분 시 채워짐) */
  insuPrice?: number;
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
 * @param illness 산정특례 질병코드 상세 (옵션)
 */
export function calcCopayment(
  sumInsuDrug: number,
  sumWage: number,
  opt: CalcOptions,
  rate: InsuRate,
  illness?: MediIllnessInfo
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

  // ── 중간 결과 객체 (모듈 공유용) ─────────────────────────────────────────
  // 각 모듈은 CalcResult를 받아 업데이트하고 반환하는 계약을 따른다.
  const partialResult: CalcResult = {
    sumInsuDrug,
    sumWage,
    totalPrice,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps,
  };

  // ── 보훈 M코드 우선 처리 (insuCode 무관) ─────────────────────────────────
  // C10+M10 같이 건강보험 insuCode이지만 bohunCode가 M코드인 경우
  // (예: S07 시나리오 — C10+M10, 보훈 전액감면)
  if (opt.bohunCode && opt.bohunCode.startsWith('M')) {
    const updatedResult = calcVeteran(opt, partialResult, rate);
    return _resultToCopay(updatedResult);
  }

  // ── G 보훈 ───────────────────────────────────────────────────────────────
  if (insuCategory === 'G') {
    const updatedResult = calcVeteran(opt, partialResult, rate);
    return _resultToCopay(updatedResult);
  }

  // ── D 의료급여 ────────────────────────────────────────────────────────────
  if (insuCategory === 'D') {
    // illness: CalcOptions.mediIllnessInfo 우선, 없으면 파라미터 illness 사용
    const illnessInfo = opt.mediIllnessInfo ?? illness;
    const updatedResult = calcMedicalAid(opt, partialResult, rate, illnessInfo);
    return _resultToCopay(updatedResult);
  }

  // ── F 자동차보험 ──────────────────────────────────────────────────────────
  if (insuCategory === 'F') {
    const updatedResult = calcAutoInsurance(opt, partialResult, rate);
    return _resultToCopay(updatedResult);
  }

  // ── E 산재 ───────────────────────────────────────────────────────────────
  if (insuCategory === 'E') {
    const updatedResult = calcWorkersComp(opt, partialResult, rate);
    return _resultToCopay(updatedResult);
  }

  // ── C 건강보험 (기본) ────────────────────────────────────────────────────
  // C 이외의 미지원 보험유형도 여기서 fallback 처리

  // 산정특례 요율 결정 (mediIllness 있는 경우)
  const effectiveCopayRate = _determineEffectiveRate(opt, rate, illness);

  const age = opt.age;
  let userPrice: number;

  if (age >= 65 && effectiveCopayRate < 0) {
    // 65세 이상 3구간 (산정특례 없는 경우)
    if (totalPrice <= 10000) {
      const fixCost = rate.fixCost > 0 ? rate.fixCost : 1000;
      userPrice = Math.min(totalPrice, fixCost);
      steps.push({
        title: '65세 이상 본인부담금 (1구간: 정액)',
        formula: `min(${totalPrice}, ${fixCost})`,
        result: userPrice,
        unit: '원',
      });
    } else if (totalPrice <= 12000) {
      const rate2 = rate.age65_12000Less > 0 ? rate.age65_12000Less : 20;
      userPrice = trunc100(totalPrice * (rate2 / 100));
      steps.push({
        title: '65세 이상 본인부담금 (2구간: 20%)',
        formula: `trunc100(${totalPrice} × ${rate2}%)`,
        result: userPrice,
        unit: '원',
      });
    } else {
      userPrice = trunc100(totalPrice * (rate.rate / 100));
      steps.push({
        title: '65세 이상 본인부담금 (3구간: 30%)',
        formula: `trunc100(${totalPrice} × ${rate.rate}%)`,
        result: userPrice,
        unit: '원',
      });
    }
  } else if (effectiveCopayRate >= 0) {
    // 산정특례 요율 적용 (0%~99%)
    userPrice = trunc100(totalPrice * (effectiveCopayRate / 100));
    steps.push({
      title: `산정특례 본인부담금 (${opt.mediIllness ?? ''} — ${effectiveCopayRate}%)`,
      formula: `trunc100(${totalPrice} × ${effectiveCopayRate}%)`,
      result: userPrice,
      unit: '원',
    });
  } else if (age < 6) {
    // 6세 미만 소아: rate% × sixAgeRate%
    const effectiveRate = (rate.rate * rate.sixAgeRate) / 100;
    userPrice = trunc100(totalPrice * (effectiveRate / 100));
    steps.push({
      title: `6세 미만 본인부담금 (${rate.rate}% × ${rate.sixAgeRate}% = ${effectiveRate}%)`,
      formula: `trunc100(${totalPrice} × ${effectiveRate}%)`,
      result: userPrice,
      unit: '원',
    });
  } else {
    // 일반 C10: rate% (기본 30%)
    userPrice = trunc100(totalPrice * (rate.rate / 100));
    steps.push({
      title: '본인부담금 (건강보험)',
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

// ─── 내부 헬퍼 ────────────────────────────────────────────────────────────────

/**
 * CalcResult → CopayResult 변환
 * mpvaPrice, insuPrice 등 3자배분 필드도 함께 전달한다.
 */
function _resultToCopay(r: CalcResult): CopayResult {
  const result: CopayResult = {
    totalPrice: r.totalPrice,
    userPrice: r.userPrice,
    pubPrice: r.pubPrice,
    steps: r.steps as CopayStep[],
  };
  if (r.mpvaPrice !== undefined) result.mpvaPrice = r.mpvaPrice;
  if (r.insuPrice !== undefined) result.insuPrice = r.insuPrice;
  return result;
}

/**
 * 산정특례 요율 결정
 * 반환: 0~100 적용 요율, -1이면 산정특례 미적용 (기본 로직 사용)
 */
function _determineEffectiveRate(
  opt: CalcOptions,
  rate: InsuRate,
  illness?: MediIllnessInfo
): number {
  const mediIllness = opt.mediIllness ?? illness?.code;
  if (!mediIllness) return -1;

  // mediIllnessInfo에 grade가 있으면 V252 등급별 요율 시도
  const info = opt.mediIllnessInfo ?? illness;
  if (info?.grade !== undefined) {
    const gradeStr = String(info.grade);
    const gradeRate = determineV252RateByGrade(mediIllness, gradeStr, rate);
    if (gradeRate >= 0) return gradeRate;
  }

  return determineExemptionRate(mediIllness, rate, rate.rate);
}

// ─── 주: D계열 의료급여 로직은 modules/insurance/medical-aid.ts로 이관됨 ───
// calcMedicalAid() 함수가 D10/D20/D40/D80/D90/B014/B030/V103를 전부 처리한다.
