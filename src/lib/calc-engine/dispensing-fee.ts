/**
 * calc-engine/dispensing-fee.ts
 * 조제료 계산 — CH03/CH04 기반
 *
 * 지원 범위:
 * - 직접조제 (isDirectDispensing=true) → calcDirectDispensing 모듈로 위임
 * - 처방조제: Z1000/Z2000/Z3000/Z41xx/Z4120/Z4121/Z5000
 * - 산제 가산: calcPowderSurchargeFromCtx (Z4010 또는 Z41xx100)
 * - 토요 가산: applySaturdaySurchargeRows (별도 행 분리)
 * - 명절 가산: calcSeasonalSurcharge (ZE 계열)
 * - 복약상담/비대면: calcCounseling (Z7001/ZC 계열)
 */

import type { CalcOptions, DrugItem, WageListItem, ICalcRepository } from './types';
import { determineSurcharge } from './surcharge';
import type { SurchargeFlags } from './surcharge';
import { calcDirectDispensing, isDirectDispensingMode } from './modules/modes/direct-dispensing';
import { calcPowderSurchargeFromCtx, hasPowderDrug } from './modules/surcharges/powder';
import { applySaturdaySurchargeRows } from './modules/surcharges/saturday-split';
import { calcSeasonalSurcharge } from './modules/surcharges/seasonal';
import { calcCounseling } from './modules/modes/counseling';

// ─── surcharge 컨텍스트 빌더 (CalcOptions → SurchargeFlags) ────────────────

function buildSurcharge(opt: CalcOptions & { isPowder?: boolean }): SurchargeFlags {
  return determineSurcharge({
    age: typeof opt.age === 'number' ? opt.age : 0,
    isNight: opt.isNight,
    isHolyDay: opt.isHolyDay,
    isSaturday: opt.isSaturday,
    isMidNight: opt.isMidNight,
    isNonFace: opt.isNonFace,
    isPowder: opt.isPowder,
  });
}

// SurchargeFlags → 내부 코드 선택용 별칭 타입
type SurchargeCtx = SurchargeFlags;

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

/** Z2000 기본조제기술료 코드 (토요는 기본 코드 사용 — 가산분은 별도 행) */
function z2000Code(sc: SurchargeCtx): string {
  switch (sc.holidayGb) {
    case '1': return 'Z2000010';
    case '5': return 'Z2000050';
    case '6': return 'Z2000600';
    case '7': return 'Z2000650';
    case '8': return 'Z2000610';
    // 토요('3')는 기본 코드 사용 — Z2000030은 별도 행
    default:  return 'Z2000';
  }
}

/** Z3000 복약지도료 코드 (토요는 기본 코드 — 가산분은 별도 행) */
function z3000Code(sc: SurchargeCtx): string {
  if (sc.holidayGb === '1' || sc.holidayGb === '8') return 'Z3000010';
  if (sc.holidayGb === '5' || sc.holidayGb === '7') return 'Z3000050';
  // 토요('3')는 기본 코드 사용
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
  if (sc.holidayGb === '1' || sc.holidayGb === '8') return 'Z4121010'; // 야간/소아야간
  if (sc.holidayGb === '5' || sc.holidayGb === '7') return 'Z4121050'; // 공휴/소아공휴
  if (sc.holidayGb === '3') return 'Z4121030';                         // 토요
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
  const year = parseInt(opt.dosDate.substring(0, 4), 10) || 2026;

  // ── 직접조제 모드 분기 ────────────────────────────────────────────────────
  // isDirectDispensing=true이면 Z42xx 코드 체계 사용 (처방조제와 완전히 다른 경로)
  if (isDirectDispensingMode(opt)) {
    const sc = buildSurcharge(opt);
    const ddResult = await calcDirectDispensing({
      options: opt,
      repo,
      surcharge: sc,
      isDirectDispensing: true,
    });
    if (ddResult.applied) {
      const sumWage = ddResult.wageItems.reduce((s, w) => s + w.sum, 0);
      return { wageList: ddResult.wageItems, sumWage };
    }
  }

  // ── 처방조제 경로 ─────────────────────────────────────────────────────────
  let wageList: WageListItem[] = [];

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

  // 산제(가루약) 가산 여부 — 가루약 있으면 가산 우선순위 재조정
  const isPowder = hasPowderDrug(opt.drugList);
  const sc = buildSurcharge({ ...opt, isPowder } as Parameters<typeof buildSurcharge>[0]);

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

  // (1) Z1000 약국관리료
  addWage(z1000Code(sc), 1);

  // (2) Z2000 기본조제기술료
  addWage(z2000Code(sc), 1);

  // (3) Z3000 복약지도료
  addWage(z3000Code(sc), 1);

  // (4) Z4xxx 약품조제료
  // 산제 가산 활성 시: 2023.11.01 이후 → Z41xx100 코드 사용 (별도 경로)
  //                    2023.11.01 이전 → 기본 Z41xx + Z4010 별도 행
  const isAfter20231101 = opt.dosDate >= '20231101';
  const usePowderNewCode = isPowder && isAfter20231101;

  if (drugCtx.hasInternal) {
    if (usePowderNewCode) {
      // 신체계 산제: Z41xx100 코드 (기본조제료 대체)
      const baseCode = `Z41${String(drugCtx.maxInternalDay <= 15
        ? drugCtx.maxInternalDay
        : 16).padStart(2, '0')}`;
      const powderCode = baseCode + '100';
      // 가산 코드 단가가 있으면 powderCode, 없으면 기본코드
      if (getPrice(powderCode) > 0) {
        addWage(powderCode, 1);
      } else {
        addWage(baseCode, 1);
      }
    } else {
      // 일반 처방조제 or 구체계 산제
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

  // ── (6) 산제 가산 행 추가 (구체계: 2023.11.01 이전 Z4010) ─────────────────
  if (isPowder && !usePowderNewCode && drugCtx.hasInternal) {
    const powderResult = await calcPowderSurchargeFromCtx({
      options: opt,
      repo,
      maxInternalDay: drugCtx.maxInternalDay,
      isAfter20231101: false,
    });
    wageList.push(...powderResult.wageItems);
  }

  // ── (7) 토요 가산 별도 행 (2016.09.29 이후) ─────────────────────────────
  // 기존 wageList에서 토요 가산 대상 코드를 찾아 030 행 삽입
  // 단, 가루약 가산 활성 시(isPowder=true)는 토요 가산 비활성화 상태
  if (opt.isSaturday && !isPowder) {
    wageList = applySaturdaySurchargeRows(wageList, opt.dosDate, true);
  }

  // ── (8) 명절 가산 (ZE 계열) ──────────────────────────────────────────────
  const isNonFace = opt.isNonFace ?? false;
  const seasonalItem = calcSeasonalSurcharge(opt.dosDate, opt.insuCode, isNonFace);
  if (seasonalItem) {
    wageList.push(seasonalItem);
  }

  // ── (9) 복약상담료/비대면 조제 가산 (Z7001/ZC 계열) ────────────────────
  const counselingResult = await calcCounseling({
    options: opt,
    repo,
    isNonFace: opt.isNonFace,
    hasCounseling: opt.hasCounseling,
    isDalbitPharmacy: opt.isDalbitPharmacy,
  });
  if (counselingResult.wageItems.length > 0) {
    wageList.push(...counselingResult.wageItems);
  }

  const sumWage = wageList.reduce((s, w) => s + w.sum, 0);
  return { wageList, sumWage };
}
