/**
 * modules/modes/direct-dispensing.ts
 * 직접조제(Z4200/Z4201/Z4220/Z4221) 계산 모듈
 *
 * 직접조제(의약분업 예외 — 처방전 없이 약사 직접 조제)는
 * 일반 처방조제(Z41xx/Z43xx)와 별도의 수가 체계를 사용한다.
 *
 * 핵심 차이:
 *   처방조제: 투약일수별 고정 코드 → 1회 단가 (일수 곱 없음)
 *   직접조제: Z4200 단가 × 최대내복투약일수 (일수 직선 곱)
 *
 * 적용 수가코드:
 *   Z4200     — 내복약 직접조제료 (기본)
 *   Z4200010  — 내복약 직접조제료 (야간)
 *   Z4200050  — 내복약 직접조제료 (공휴)
 *   Z4200030  — 내복약 직접조제료 (토요)
 *   Z4201     — 내복약 팩단위 직접조제료
 *   Z4220     — 외용약 직접조제료 (기본)
 *   Z4220010  — 외용약 직접조제료 (야간)
 *   Z4220050  — 외용약 직접조제료 (공휴)
 *   Z4220030  — 외용약 직접조제료 (토요)
 *   Z4221     — 내복+외용 동시 직접조제료
 *
 * 기본조제료(Z1000/Z2000/Z3000) 및 의약품관리료(Z5xxx):
 *   직접조제에서도 동일하게 산정 (처방조제와 동일 코드 체계 사용)
 *   단, 일일2회내방 시 Z1000/Z2000은 0원 처리
 *
 * 차상위(C32) 직접조제 본인부담: 900원 (처방조제 500원과 상이)
 *   → 본인부담 처리는 copayment 모듈(Integration Lead)에서 담당
 *
 * 참조 문서:
 *   - C#: DispensingFeeCalculator.cs → 직접조제 분기
 *   - CH03 §5 처방조제 vs 직접조제
 *   - CH02 §3-3 직접조제 약품조제료 (Z42xx)
 *   - 원문 PDF §Z4200 직접조제료
 */

import type { CalcOptions, DrugItem, WageListItem, ICalcRepository } from '../../types';
import type { SurchargeFlags } from '../../surcharge';
import { determineSurcharge } from '../../surcharge';
import type { FeeBaseParams } from '../../../../types/database';

// ─── 컨텍스트 인터페이스 ─────────────────────────────────────────────────────

/**
 * 직접조제 계산 컨텍스트
 */
export interface DirectDispensingContext {
  /** 계산 입력 파라미터 */
  options: CalcOptions;
  /** 레포지토리 */
  repo: ICalcRepository;
  /** 가산 판정 결과 */
  surcharge: SurchargeFlags;
  /**
   * 직접조제 여부
   * C# CalcOptions.IsDirectDispensing — Integration Lead가 CalcOptions에 추가
   */
  isDirectDispensing: boolean;
}

/**
 * 직접조제 계산 결과
 */
export interface DirectDispensingResult {
  /** 직접조제 수가 항목 목록 */
  wageItems: WageListItem[];
  /** 직접조제 수가 합계 */
  sumDirectDispensing: number;
  /** 직접조제 모드 여부 */
  applied: boolean;
}

// ─── 내부 유틸 ───────────────────────────────────────────────────────────────

/** 약품 분류 결과 */
interface DrugClassify {
  hasInternal: boolean;
  hasExternal: boolean;
  maxInternalDay: number;
  maxExternalDay: number;
  coveredCount: number;
  allPack: boolean;
  hasNarcotic: boolean;
}

/** 급여 해당 여부 판정 */
function isCoveredDrug(drug: DrugItem): boolean {
  return (
    drug.insuPay === 'covered' ||
    drug.insuPay === 'fullSelf' ||
    drug.insuPay === 'partial50' ||
    drug.insuPay === 'partial80' ||
    drug.insuPay === 'partial30' ||
    drug.insuPay === 'partial90'
  );
}

/** 약품 목록 분류 */
function classifyDrugs(drugs: DrugItem[]): DrugClassify {
  let hasInternal = false;
  let hasExternal = false;
  let maxInternalDay = 0;
  let maxExternalDay = 0;
  let coveredCount = 0;
  let allPack = true;        // 전체가 팩단위인지 (Z4201 조건)
  let hasNarcotic = false;   // 향정/마약 포함 여부 (Z5001 조건)

  for (const drug of drugs) {
    const covered = isCoveredDrug(drug);
    if (covered) coveredCount++;

    if (drug.take === 'internal') {
      hasInternal = true;
      if (covered && Math.floor(drug.dDay) > maxInternalDay) {
        maxInternalDay = Math.floor(drug.dDay);
      }
      // 팩단위 아닌 약품이 하나라도 있으면 allPack=false
      if (!drug.pack || drug.pack <= 1) {
        allPack = false;
      }
    } else if (drug.take === 'external') {
      hasExternal = true;
      if (covered && Math.floor(drug.dDay) > maxExternalDay) {
        maxExternalDay = Math.floor(drug.dDay);
      }
      allPack = false; // 외용약은 팩단위 대상 아님
    } else {
      // 주사제
      allPack = false;
    }

    // 마약/향정 판정 (spec: "3"=마약, "4"=향정)
    if (drug.spec === '3' || drug.spec === '4') {
      hasNarcotic = true;
    }
  }

  // 내복약이 없으면 allPack 의미 없음
  if (!hasInternal) allPack = false;

  return { hasInternal, hasExternal, maxInternalDay, maxExternalDay, coveredCount, allPack, hasNarcotic };
}

/** Z4200 계열 가산 코드 결정 (내복약 직접조제료) */
function z4200Code(sc: SurchargeFlags, isAllPack: boolean): string {
  const base = isAllPack ? 'Z4201' : 'Z4200';
  if (sc.holidayGb === '1' || sc.holidayGb === '8') return base + '010'; // 야간
  if (sc.holidayGb === '5' || sc.holidayGb === '7') return base + '050'; // 공휴
  if (sc.holidayGb === '3') return base + '030';                          // 토요
  return base;
}

/** Z4220 계열 가산 코드 결정 (외용약 직접조제료) */
function z4220Code(sc: SurchargeFlags): string {
  if (sc.holidayGb === '1' || sc.holidayGb === '8') return 'Z4220010';
  if (sc.holidayGb === '5' || sc.holidayGb === '7') return 'Z4220050';
  if (sc.holidayGb === '3') return 'Z4220030';
  return 'Z4220';
}

/** Z4221 내복+외용 동시 직접조제료 코드 결정 */
function z4221Code(sc: SurchargeFlags): string {
  if (sc.holidayGb === '1' || sc.holidayGb === '8') return 'Z4221010';
  if (sc.holidayGb === '5' || sc.holidayGb === '7') return 'Z4221050';
  if (sc.holidayGb === '3') return 'Z4221030';
  return 'Z4221';
}

/** Z5xxx 의약품관리료 일수별 코드 결정 */
function z5DosageCode(days: number, hasExternalOnly: boolean): string {
  if (hasExternalOnly) return 'Z5010';
  if (days <= 13) return `Z5${String(days).padStart(2, '0')}0`;
  if (days <= 15) return `Z52${String(days).padStart(2, '0')}`;
  if (days <= 20) return 'Z5216';
  if (days <= 25) return 'Z5221';
  if (days <= 30) return 'Z5226';
  if (days <= 40) return 'Z5231';
  if (days <= 50) return 'Z5241';
  if (days <= 60) return 'Z5251';
  if (days <= 70) return 'Z5261';
  if (days <= 80) return 'Z5271';
  if (days <= 90) return 'Z5281';
  return 'Z5291';
}

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 직접조제 여부 판정
 *
 * CH05 §3.6 점검 2026-04-14 결과: C21 은 "지역가입자 세대주" 건강보험 코드이며
 * 공상(공무상 재해) 과 무관함. 과거 "C21=공상" 매핑은 오인이었음.
 * 공상은 별도 플래그 `options.isTreatmentDisaster` 로만 판정.
 *
 * @param options 계산 파라미터
 * @returns 직접조제 여부
 */
export function isDirectDispensingMode(options: CalcOptions): boolean {
  if (typeof options.isDirectDispensing === 'boolean') {
    return options.isDirectDispensing;
  }
  // 공상(공무상 재해) 은 직접조제 규정 적용 대상
  return options.isTreatmentDisaster === true;
}

/**
 * Z4200/Z4201/Z4220/Z4221 직접조제 약품조제료 계산
 *
 * 내복약: Z4200(또는 Z4201 팩단위) 단가 × 최대내복투약일수
 * 외용약: Z4220 단가 × 1 (처방조제 Z4120과 동일하게 방문당 1회)
 * 동시:   Z4221 단가 × 1 추가 산정
 *
 * @param drugList 약품 목록
 * @param dosDate  조제일자 (yyyyMMdd) — 수가 연도 결정용
 * @param repo     수가 레포지토리
 * @param sc       가산 판정 결과
 * @returns WageListItem 배열
 */
export async function calcDirectDosageFee(
  drugList: DrugItem[],
  dosDate: string,
  repo: ICalcRepository,
  sc: SurchargeFlags
): Promise<WageListItem[]> {
  const year = parseInt(dosDate.substring(0, 4), 10) || 2026;
  const sugaMap = await repo.getSugaFeeMap(year);
  const items: WageListItem[] = [];

  const drugs = classifyDrugs(drugList);

  function getPrice(code: string): number {
    return sugaMap.get(code)?.price ?? 0;
  }
  function getName(code: string): string {
    return sugaMap.get(code)?.name ?? code;
  }

  // (1) 내복약 직접조제료 — Z4200 × 투약일수 (핵심 차이)
  if (drugs.hasInternal && drugs.maxInternalDay > 0) {
    const code = z4200Code(sc, drugs.allPack);
    let price = getPrice(code);
    // 가산 코드 단가가 없으면 기본 Z4200/Z4201 fallback
    if (price === 0) {
      const fallback = drugs.allPack ? 'Z4201' : 'Z4200';
      price = getPrice(fallback);
    }
    if (price > 0) {
      const sum = price * drugs.maxInternalDay;
      items.push({
        sugaCd: code,
        name: getName(code),
        insuPay: '1',
        cnt: drugs.maxInternalDay,
        price,
        sum,
        addType: 'direct',
      });
    }
  }

  // (2) 외용약 직접조제료 — Z4220 × 1 (방문당 1회, 일수 곱 없음)
  if (drugs.hasExternal && !drugs.hasInternal) {
    const code = z4220Code(sc);
    let price = getPrice(code);
    if (price === 0) price = getPrice('Z4220');
    if (price > 0) {
      items.push({
        sugaCd: code,
        name: getName(code),
        insuPay: '1',
        cnt: 1,
        price,
        sum: price,
        addType: 'direct',
      });
    }
  }

  // (3) 내복+외용 동시 직접조제료 — Z4221 × 1 추가 산정
  if (drugs.hasInternal && drugs.hasExternal) {
    const code = z4221Code(sc);
    let price = getPrice(code);
    if (price === 0) price = getPrice('Z4221');
    if (price > 0) {
      items.push({
        sugaCd: code,
        name: getName(code),
        insuPay: '1',
        cnt: 1,
        price,
        sum: price,
        addType: 'direct',
      });
    }
  }

  return items;
}

/**
 * 직접조제 모드 전체 조제료 계산
 *
 * 처리 항목:
 *   Z1000 약국관리료
 *   Z2000 기본조제기술료 (야간/공휴/6세미만 가산 포함)
 *   Z3000 복약지도료 (야간/공휴 가산 포함)
 *   Z4200/Z4201/Z4220/Z4221 직접조제 약품조제료
 *   Z5000/Z5xxx 의약품관리료
 *   토요 가산 별도 행 (holidayGb="3"인 경우)
 *
 * @param options   계산 파라미터 (CalcOptions)
 * @param drugList  약품 목록
 * @param feeParams 연도별 수가 정책값 (FeeBaseParams)
 * @param repo      수가 레포지토리 (옵션; 없으면 sugaMap 불가)
 * @returns WageListItem 배열 (Z1000/Z2000/Z3000/Z4200계열/Z5xxx)
 */
export async function calcDirectDispensing(
  options: CalcOptions,
  drugList: DrugItem[],
  _feeParams: FeeBaseParams,
  repo: ICalcRepository
): Promise<WageListItem[]>;

/**
 * 직접조제(Z4200) 수가 계산 — Context 기반 오버로드
 *
 * 처리 순서:
 *   1. isDirectDispensing 확인 → false이면 빈 결과 반환
 *   2. 수가 맵 로드
 *   3. 가산 코드 결정 (holidayGb → 접미사)
 *   4. Z1000/Z2000/Z3000 기본조제료 산정
 *   5. Z4200계열 직접조제 약품조제료 산정 (단가 × 일수)
 *   6. Z5000/Z5xxx 의약품관리료 산정
 *   7. 토요 가산 별도 행 추가 (holidayGb="3")
 *
 * 주의:
 *   - 직접조제 시 Z41xx/Z43xx(처방조제 내복약조제료) 미적용
 *   - 차상위(C32) 직접조제 본인부담 900원 처리는 copayment 모듈에서 담당
 *
 * @param ctx 직접조제 컨텍스트
 * @returns DirectDispensingResult
 */
export async function calcDirectDispensing(
  ctx: DirectDispensingContext
): Promise<DirectDispensingResult>;

// 구현부
export async function calcDirectDispensing(
  ctxOrOptions: DirectDispensingContext | CalcOptions,
  drugList?: DrugItem[],
  _feeParams?: FeeBaseParams,
  repo?: ICalcRepository
): Promise<DirectDispensingResult | WageListItem[]> {
  // ── 오버로드 분기 ─────────────────────────────────────────────────────────
  const isContextCall = 'isDirectDispensing' in ctxOrOptions;

  if (!isContextCall) {
    // CalcOptions 오버로드: WageListItem[] 반환
    const opt = ctxOrOptions as CalcOptions;
    if (!repo) throw new Error('[direct-dispensing] repo is required');
    const sc = determineSurcharge({
      age: opt.age,
      isNight: opt.isNight,
      isHolyDay: opt.isHolyDay,
      isSaturday: opt.isSaturday,
      isMidNight: opt.isMidNight,
    });
    const ctx: DirectDispensingContext = {
      options: opt,
      repo,
      surcharge: sc,
      isDirectDispensing: isDirectDispensingMode(opt),
    };
    const result = await _calcDirectDispensingImpl(ctx);
    return result.wageItems;
  }

  // DirectDispensingContext 오버로드: DirectDispensingResult 반환
  const ctx = ctxOrOptions as DirectDispensingContext;
  return _calcDirectDispensingImpl(ctx);
}

// ─── 핵심 계산 구현 (내부) ───────────────────────────────────────────────────

async function _calcDirectDispensingImpl(
  ctx: DirectDispensingContext
): Promise<DirectDispensingResult> {
  // Step 1: 직접조제 여부 확인
  if (!ctx.isDirectDispensing) {
    return { wageItems: [], sumDirectDispensing: 0, applied: false };
  }

  const { options: opt, repo, surcharge: sc } = ctx;
  const year = parseInt(opt.dosDate.substring(0, 4), 10) || 2026;
  const sugaMap = await repo.getSugaFeeMap(year);
  const wageItems: WageListItem[] = [];

  function getPrice(code: string): number {
    return sugaMap.get(code)?.price ?? 0;
  }
  function getName(code: string): string {
    return sugaMap.get(code)?.name ?? code;
  }
  function addWage(code: string, cnt: number, addType = ''): void {
    const price = getPrice(code);
    if (price === 0) return;
    wageItems.push({
      sugaCd: code,
      name: getName(code),
      insuPay: '1',
      cnt,
      price,
      sum: price * cnt,
      addType,
    });
  }

  const drugs = classifyDrugs(opt.drugList.length > 0 ? opt.drugList : []);

  // 급여 약품이 없으면 조제료 미산정
  if (drugs.coveredCount === 0) {
    return { wageItems: [], sumDirectDispensing: 0, applied: true };
  }

  // 투약일수 결정 (opt.insuDose 우선, 없으면 약품 최대 일수)
  const insuDose =
    opt.insuDose && opt.insuDose > 0
      ? opt.insuDose
      : Math.max(drugs.maxInternalDay, drugs.maxExternalDay);

  // ── (1) Z1000 약국관리료 ─────────────────────────────────────────────────
  addWage('Z1000', 1);

  // ── (2) Z2000 기본조제기술료 ─────────────────────────────────────────────
  // 처방조제와 동일 코드 체계 사용
  {
    let z2Code: string;
    switch (sc.holidayGb) {
      case '1': z2Code = 'Z2000010'; break;
      case '5': z2Code = 'Z2000050'; break;
      case '6': z2Code = 'Z2000600'; break;
      case '7': z2Code = 'Z2000650'; break;
      case '8': z2Code = 'Z2000610'; break;
      default:  z2Code = 'Z2000';    break;
    }
    addWage(z2Code, 1);
  }

  // ── (3) Z3000 복약지도료 ──────────────────────────────────────────────────
  {
    let z3Code: string;
    if (sc.holidayGb === '1' || sc.holidayGb === '8') z3Code = 'Z3000010';
    else if (sc.holidayGb === '5' || sc.holidayGb === '7') z3Code = 'Z3000050';
    else z3Code = 'Z3000';
    addWage(z3Code, 1);
  }

  // ── (4) Z4200계열 직접조제 약품조제료 ────────────────────────────────────
  const doseItems = await calcDirectDosageFee(
    opt.drugList,
    opt.dosDate,
    repo,
    sc
  );
  wageItems.push(...doseItems);

  // ── (5) Z5000 의약품관리료 ────────────────────────────────────────────────
  {
    // 기본료 Z5000 / 마약 포함 시 Z5001
    const baseCode = drugs.hasNarcotic ? 'Z5001' : 'Z5000';
    addWage(baseCode, 1);

    // 일수별 가산 (1회만 산정)
    const hasExternalOnly = drugs.hasExternal && !drugs.hasInternal;
    const dosageCode = z5DosageCode(insuDose, hasExternalOnly);
    addWage(dosageCode, 1);
  }

  // ── (6) 토요 가산 별도 행 (holidayGb="3") ──────────────────────────────
  if (sc.holidayGb === '3') {
    addWage('Z2000030', 1, 'saturday');
    addWage('Z3000030', 1, 'saturday');

    // 내복 직접조제 토요 가산: Z4200030 × 투약일수
    if (drugs.hasInternal && drugs.maxInternalDay > 0) {
      const satCode = drugs.allPack ? 'Z4201030' : 'Z4200030';
      const satPrice = getPrice(satCode);
      if (satPrice > 0) {
        wageItems.push({
          sugaCd: satCode,
          name: getName(satCode),
          insuPay: '1',
          cnt: drugs.maxInternalDay,
          price: satPrice,
          sum: satPrice * drugs.maxInternalDay,
          addType: 'saturday',
        });
      }
    }

    // 외용 직접조제 토요 가산: Z4220030 × 1
    if (drugs.hasExternal && !drugs.hasInternal) {
      addWage('Z4220030', 1, 'saturday');
    }
  }

  const sumDirectDispensing = wageItems.reduce((s, w) => s + w.sum, 0);
  return { wageItems, sumDirectDispensing, applied: true };
}
