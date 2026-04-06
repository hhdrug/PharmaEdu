/**
 * calc-engine/dispensing-fee.ts
 * 조제료 계산 — CH03 기반 MVP
 *
 * 지원 범위 (MVP):
 * - 처방조제 전용 (직접조제 미지원)
 * - Z1000 약국관리료
 * - Z2000 기본조제기술료 (야간/공휴/6세미만 가산 포함)
 * - Z3000 복약지도료 (야간/공휴 가산 포함)
 * - Z41xx 내복약 조제료 (투약일수별, 야간/공휴 가산 포함)
 * - Z4120 외용약 조제료
 * - Z4121 내복+외용 동시 조제료
 * - Z5000 의약품관리료
 * - 가산 없음 (토요/야간/공휴일): 기본형만 지원, 가산 플래그 전달 시 가산 코드도 처리
 */

import type { CalcOptions, DrugItem, WageListItem, ICalcRepository } from './types';

// ─── Holiday/surcharge 판정 ──────────────────────────────────────────────────

/** 내부 가산 컨텍스트 */
interface SurchargeCtx {
  isNight: boolean;
  isHoliday: boolean;
  isChild: boolean; // 6세 미만
  isSaturday: boolean;
  holidayGb: string; // 비즈팜 호환 단일 문자
}

function buildSurcharge(opt: CalcOptions): SurchargeCtx {
  const age = typeof opt.age === 'number' ? opt.age : 0;
  const isChild = age < 6;
  const isNight = opt.isNight ?? false;
  const isHoliday = opt.isHolyDay ?? false;
  const isSaturday = opt.isSaturday ?? false;
  const isMidNight = opt.isMidNight ?? false;

  // Holiday_gb 결정 (비즈팜 단일 코드)
  let holidayGb = '0';
  if (isMidNight && isChild) holidayGb = '8';
  else if (isNight && isChild) holidayGb = '8';
  else if (isHoliday && isChild) holidayGb = '7';
  else if (isChild) holidayGb = '6';
  else if (isNight) holidayGb = '1';
  else if (isHoliday) holidayGb = '5';

  return { isNight, isHoliday, isChild, isSaturday, holidayGb };
}

// ─── 약품 분류 ────────────────────────────────────────────────────────────────

interface DrugClassify {
  hasInternal: boolean;
  hasExternal: boolean;
  hasInjection: boolean;
  coveredCount: number;
  maxInternalDay: number;
  maxExternalDay: number;
}

function classifyDrugs(drugs: DrugItem[]): DrugClassify {
  const ctx: DrugClassify = {
    hasInternal: false,
    hasExternal: false,
    hasInjection: false,
    coveredCount: 0,
    maxInternalDay: 0,
    maxExternalDay: 0,
  };

  for (const drug of drugs) {
    const isCovered =
      drug.insuPay === 'covered' ||
      drug.insuPay === 'fullSelf' ||
      drug.insuPay === 'partial50' ||
      drug.insuPay === 'partial80' ||
      drug.insuPay === 'partial30' ||
      drug.insuPay === 'partial90';

    if (isCovered) ctx.coveredCount++;

    if (drug.take === 'internal') {
      ctx.hasInternal = true;
      if (isCovered && drug.dDay > ctx.maxInternalDay) {
        ctx.maxInternalDay = Math.floor(drug.dDay);
      }
    } else if (drug.take === 'external') {
      ctx.hasExternal = true;
      if (isCovered && drug.dDay > ctx.maxExternalDay) {
        ctx.maxExternalDay = Math.floor(drug.dDay);
      }
    } else if (drug.take === 'injection') {
      ctx.hasInjection = true;
    }
  }

  return ctx;
}

// ─── Z코드 선택 로직 ─────────────────────────────────────────────────────────

/** Z1000 약국관리료 코드 */
function z1000Code(_sc: SurchargeCtx): string {
  return 'Z1000';
}

/** Z2000 기본조제기술료 코드 */
function z2000Code(sc: SurchargeCtx): string {
  switch (sc.holidayGb) {
    case '1': return 'Z2000010';
    case '5': return 'Z2000050';
    case '6': return 'Z2000600';
    case '7': return 'Z2000650';
    case '8': return 'Z2000610';
    default:  return 'Z2000';
  }
}

/** Z3000 복약지도료 코드 */
function z3000Code(sc: SurchargeCtx): string {
  if (sc.holidayGb === '1' || sc.holidayGb === '8') return 'Z3000010';
  if (sc.holidayGb === '5' || sc.holidayGb === '7') return 'Z3000050';
  return 'Z3000';
}

/**
 * Z41xx 내복약 조제료 코드 결정
 * 2008.01.01 이후 기준 (투약일수별 코드 체계)
 * 1~15일: Z4101~Z4115
 * 16일+: presc_dosage_fee 테이블에서 Z코드 조회 → Z4316, Z4321, ... Z4391
 */
function z4InternalCode(days: number, sc: SurchargeCtx): { code: string; needsTableLookup: boolean } {
  let baseCode: string;
  let needsTableLookup = false;

  if (days <= 15) {
    baseCode = `Z41${String(days).padStart(2, '0')}`;
  } else {
    // 16일 이상은 presc_dosage_fee 테이블 조회 필요
    needsTableLookup = true;
    // 임시 코드 (실제로는 테이블에서 가져옴)
    baseCode = 'Z4116';
  }

  // 가산 접미사 추가
  if (sc.holidayGb === '1' || sc.holidayGb === '8') {
    return { code: baseCode + '010', needsTableLookup };
  }
  if (sc.holidayGb === '5' || sc.holidayGb === '7') {
    return { code: baseCode + '050', needsTableLookup };
  }

  return { code: baseCode, needsTableLookup };
}

/** Z4120 외용약 조제료 코드 */
function z4ExternalCode(sc: SurchargeCtx): string {
  if (sc.holidayGb === '1' || sc.holidayGb === '8') return 'Z4120010';
  if (sc.holidayGb === '5' || sc.holidayGb === '7') return 'Z4120050';
  return 'Z4120';
}

/** Z4121 내복+외용 동시 조제료 코드 */
function z4BothCode(sc: SurchargeCtx): string {
  if (sc.holidayGb === '1' || sc.holidayGb === '7') return 'Z4121010';
  if (sc.holidayGb === '5' || sc.holidayGb === '8') return 'Z4121050';
  return 'Z4121';
}

/** Z5000 의약품관리료 코드 */
function z5000Code(_sc: SurchargeCtx): string {
  return 'Z5000';
}

// ─── 메인 조제료 계산 ─────────────────────────────────────────────────────────

interface DispensingFeeResult {
  wageList: WageListItem[];
  sumWage: number;
}

export async function calcDispensingFee(
  opt: CalcOptions,
  repo: ICalcRepository
): Promise<DispensingFeeResult> {
  const wageList: WageListItem[] = [];
  const year = parseInt(opt.dosDate.substring(0, 4), 10) || 2026;

  // 수가 마스터 로드
  const sugaMap = await repo.getSugaFeeMap(year);

  function getPrice(code: string): number {
    return sugaMap.get(code)?.price ?? 0;
  }

  function getName(code: string): string {
    return sugaMap.get(code)?.name ?? code;
  }

  function addWage(code: string, cnt: number): void {
    const price = getPrice(code);
    if (price === 0) return; // 단가 없으면 미산정
    const sum = price * cnt;
    wageList.push({
      sugaCd: code,
      name: getName(code),
      insuPay: '1',
      cnt,
      price,
      sum,
      addType: '',
    });
  }

  // 약품 분류
  const drugCtx = classifyDrugs(opt.drugList);
  const sc = buildSurcharge(opt);

  // 급여 약품이 없으면 조제료 미산정
  if (drugCtx.coveredCount === 0) {
    return { wageList: [], sumWage: 0 };
  }

  // 주사제만 처방이고 자가주사 아닌 경우 → 기본조제료 미산정
  const isInjectionOnly =
    !drugCtx.hasInternal && !drugCtx.hasExternal && drugCtx.hasInjection;
  if (isInjectionOnly) {
    // Z5000만 적용
    addWage(z5000Code(sc), 1);
    const sumWage = wageList.reduce((s, w) => s + w.sum, 0);
    return { wageList, sumWage };
  }

  // 투약일수 결정
  const insuDose =
    opt.insuDose && opt.insuDose > 0
      ? opt.insuDose
      : Math.max(drugCtx.maxInternalDay, drugCtx.maxExternalDay);

  // (1) Z1000 약국관리료
  addWage(z1000Code(sc), 1);

  // (2) Z2000 기본조제기술료
  addWage(z2000Code(sc), 1);

  // (3) Z3000 복약지도료
  addWage(z3000Code(sc), 1);

  // (4) Z4xxx 약품조제료
  if (drugCtx.hasInternal) {
    const { code: internalCode, needsTableLookup } = z4InternalCode(drugCtx.maxInternalDay, sc);

    if (needsTableLookup) {
      // 16일 이상: presc_dosage_fee 테이블에서 Z코드 조회
      const row = await repo.getPrescDosageFee(year, drugCtx.maxInternalDay);
      if (row) {
        // 가산 접미사 추가
        let finalCode = row.sugaCode;
        if (sc.holidayGb === '1' || sc.holidayGb === '8') finalCode += '010';
        else if (sc.holidayGb === '5' || sc.holidayGb === '7') finalCode += '050';

        // 가산 코드 단가가 없으면 기본 코드 사용
        const finalPrice = getPrice(finalCode) > 0 ? getPrice(finalCode) : row.fee;
        const finalName = getName(finalCode) || getName(row.sugaCode);
        wageList.push({
          sugaCd: finalCode,
          name: finalName,
          insuPay: '1',
          cnt: 1,
          price: finalPrice > 0 ? finalPrice : row.fee,
          sum: finalPrice > 0 ? finalPrice : row.fee,
          addType: '',
        });
      }
    } else {
      // 1~15일: 코드 직접 사용
      addWage(internalCode, 1);
    }

    // 외용도 같이 있으면 Z4121 동시조제료 추가
    if (drugCtx.hasExternal) {
      addWage(z4BothCode(sc), 1);
    }
  } else if (drugCtx.hasExternal) {
    // 외용만
    addWage(z4ExternalCode(sc), 1);
  }

  // (5) Z5000 의약품관리료
  addWage(z5000Code(sc), 1);

  const sumWage = wageList.reduce((s, w) => s + w.sum, 0);
  return { wageList, sumWage };
}
