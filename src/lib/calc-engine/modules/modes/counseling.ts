/**
 * modules/modes/counseling.ts
 * 복약상담료(Z7001/야간조제관리료) 및 달빛어린이약국 가산, 비대면 조제 모듈
 *
 * 수가코드:
 *   Z7001  — 야간조제관리료 (달빛어린이약국 처방조제 전용)
 *   ZC001  — 비대면조제관리료 (일반)
 *   ZC002  — 비대면조제관리료 (야간)
 *   ZC003  — 비대면조제관리료 (심야)
 *   ZC004  — 비대면조제관리료 (공휴)
 *
 * 적용 조건:
 *   Z7001 야간조제관리료:
 *     - 처방조제 AND 달빛어린이약국(isDalbitPharmacy=true)
 *     - 합계기본조제료 > 0 (Z2000 산정된 경우)
 *     - 직접조제에는 적용 불가
 *     - hasCounseling 플래그가 true일 때 산정
 *
 *   달빛어린이 추가 가산(calcMoonChildBonus):
 *     - moonYn=1 (isDalbitPharmacy) + age<6 + (isNight or isHolyDay)
 *     - 야간/소아 복합 상황에서 별도 추가 가산
 *
 *   비대면 조제(ZC001~ZC004):
 *     - isNonFace=true (DrugSafe_YN = "U")
 *     - 모든 가산(야간/공휴/소아/토요/가루약) 비활성화 후 ZC 코드로 대체
 *     - 우선순위: 공휴(ZC004) > 심야(ZC003) > 야간(ZC002) > 기본(ZC001)
 *     - 시행일: 2023.06.01 이후
 *
 * 참조 문서:
 *   - src/content/chapters/ch03-수가계산.md §Z7001, §비대면
 *   - src/content/chapters/ch04-가산로직.md §4-7 비대면 가산
 *   - C#: DispensingFeeCalculator.cs → 비대면 분기, Z7001 처리
 *   - surcharge.ts → determineSurcharge() isNonFace 경로
 */

import type { CalcOptions, WageListItem, ICalcRepository } from '../../types';

// ─── 보조 타입 ────────────────────────────────────────────────────────────────

/**
 * 수가 단가 파라미터 (sugaMap 래퍼)
 * ICalcRepository.getSugaFeeMap() 결과를 미리 로드하여 전달할 때 사용
 */
export interface FeeBaseParams {
  /** Z코드 → { price, name } 맵 */
  sugaMap: Map<string, { price: number; name: string }>;
}

// ─── 컨텍스트 인터페이스 ─────────────────────────────────────────────────────

/**
 * 복약상담 / 비대면 조제 계산 컨텍스트
 */
export interface CounselingCalcContext {
  /** 계산 입력 파라미터 */
  options: CalcOptions;
  /** 레포지토리 */
  repo: ICalcRepository;
  /**
   * 비대면 조제 여부 (약물안전서비스 "U")
   * C# CalcOptions.DrugSafe_YN — Integration Lead가 CalcOptions에 추가
   */
  isNonFace?: boolean;
  /**
   * 복약상담 제공 여부 (Z7001 야간조제관리료)
   * true이면 달빛어린이약국 조건 충족 시 Z7001 산정
   */
  hasCounseling?: boolean;
  /**
   * 달빛어린이약국 지정 여부
   * (CalcOptions.isDalbitPharmacy 또는 요양기관 메타에서 판정)
   */
  isDalbitPharmacy?: boolean;
}

/**
 * 복약상담 계산 결과
 */
export interface CounselingCalcResult {
  /** 복약상담/비대면 수가 항목 */
  wageItems: WageListItem[];
  /** 합계 */
  sumCounseling: number;
  /** 적용 모드 */
  mode: 'none' | 'non-face' | 'counseling' | 'dalbit' | 'counseling+dalbit';
}

// ─── 내부 헬퍼 ────────────────────────────────────────────────────────────────

/**
 * 수가 맵에서 단가/명칭을 가져와 WageListItem을 구성한다
 * 단가가 0이면 null 반환 (미산정)
 */
function makeWageItem(
  sugaMap: Map<string, { price: number; name: string }>,
  code: string,
  addType: string = ''
): WageListItem | null {
  const entry = sugaMap.get(code);
  if (!entry || entry.price === 0) return null;
  return {
    sugaCd: code,
    name: entry.name || code,
    insuPay: '1',
    cnt: 1,
    price: entry.price,
    sum: entry.price,
    addType,
  };
}

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 복약상담료 Z7001 (야간조제관리료) 산정 여부 및 계산
 *
 * 적용 조건:
 *   1. hasCounseling === true (복약상담 제공 플래그)
 *   2. isDalbitPharmacy === true (달빛어린이약국 지정)
 *   3. sumBaseWage > 0 을 caller가 보증한다고 가정
 *      (직접조제 모드가 아닌 처방조제 시)
 *
 * @param options  CalcOptions
 * @param feeParams 수가 맵 (year별 sugaMap)
 * @returns WageListItem (산정됨) 또는 null (미산정)
 */
export function calcCounselingFee(
  options: CalcOptions,
  feeParams: FeeBaseParams
): WageListItem | null {
  if (!options.hasCounseling) return null;
  if (!options.isDalbitPharmacy) return null;

  // 비대면 조제 시 Z7001 미산정
  if (options.isNonFace) return null;

  return makeWageItem(feeParams.sugaMap, 'Z7001', 'counseling');
}

/**
 * 달빛어린이약국 추가 가산 계산
 *
 * 적용 조건:
 *   - isDalbitPharmacy === true (moonYn=1)
 *   - age < 6
 *   - isNight === true OR isHolyDay === true
 *
 * 달빛어린이약국 야간 소아 추가 가산 코드: Z7001 (야간조제관리료와 동일 코드 계열)
 * 현재 별도 가산 코드가 확인되지 않아 Z7001을 재사용한다.
 * 실제 운영 시 Integration Lead와 확인 후 코드 수정 필요.
 *
 * @param options CalcOptions (isDalbitPharmacy, isNight, isHolyDay 포함)
 * @param age     환자 나이 (만 나이)
 * @returns WageListItem 또는 null
 */
export function calcMoonChildBonus(
  options: CalcOptions,
  age: number
): WageListItem | null {
  // 달빛어린이약국 지정 여부
  if (!options.isDalbitPharmacy) return null;

  // 6세 미만 소아
  if (age >= 6) return null;

  // 야간 또는 공휴일 조건
  if (!options.isNight && !options.isHolyDay) return null;

  // 비대면 시 미적용
  if (options.isNonFace) return null;

  // 달빛어린이 추가 가산 — sugaMap 없이 호출되므로 WageListItem 직접 구성
  // (단가는 Integration Lead가 sugaMap 조회 후 채워야 함)
  // 여기서는 price=0 가드 없이 구조만 반환, 실제 단가는 index.ts 통합 시 처리
  return {
    sugaCd: 'Z7001',
    name: '달빛어린이야간조제관리료',
    insuPay: '1',
    cnt: 1,
    price: 0, // Integration Lead: sugaMap에서 실제 단가로 교체
    sum: 0,
    addType: 'moonchild',
  };
}

/**
 * 비대면 조제 수가 코드 결정 (ZC001~ZC004)
 *
 * 우선순위:
 *   1순위: 공휴일(isHolyDay) → ZC004
 *   2순위: 심야(isMidNight) → ZC003
 *   3순위: 야간(isNight) → ZC002
 *   4순위: 기타 → ZC001
 *
 * 비대면 조제가 아닌 경우 null 반환
 *
 * @param options  CalcOptions (isNonFace, isHolyDay, isMidNight, isNight 포함)
 * @param _dosDate 조제일자 (yyyyMMdd) — 향후 시행일 분기용 (현재 미사용)
 * @returns ZC 코드 문자열 또는 null
 */
export function getNonFaceDispensingCode(
  options: CalcOptions,
  _dosDate: string
): string | null {
  if (!options.isNonFace) return null;

  // 공휴일 최우선
  if (options.isHolyDay) return 'ZC004';

  // 심야 (isMidNight)
  if (options.isMidNight) return 'ZC003';

  // 야간
  if (options.isNight) return 'ZC002';

  // 기본
  return 'ZC001';
}

/**
 * 비대면 조제 여부 판정
 *
 * CalcOptions.isNonFace 필드를 확인한다.
 * (Integration Lead가 types.ts에 isNonFace?: boolean 추가 예정)
 *
 * @param options CalcOptions
 * @returns true이면 비대면 조제
 */
export function isNonFaceMode(options: CalcOptions): boolean {
  return options.isNonFace === true;
}

// ─── 통합 계산 함수 ────────────────────────────────────────────────────────────

/**
 * 복약상담(Z7001) 및 비대면 조제(ZC001~ZC004) 수가 계산
 *
 * 처리 순서:
 *   [비대면 조제 경로 (isNonFace=true)]:
 *     1. ZC001~ZC004 코드 결정 (getNonFaceDispensingCode)
 *     2. 해당 코드 단가 조회 후 wageItems 추가
 *     3. mode = 'non-face'
 *
 *   [일반 경로 (isNonFace=false)]:
 *     1. hasCounseling=true AND isDalbitPharmacy=true → Z7001 (calcCounselingFee)
 *     2. isDalbitPharmacy=true + age<6 + (야간/공휴) → 달빛 가산 (calcMoonChildBonus)
 *     3. mode 결정 (counseling / dalbit / counseling+dalbit / none)
 *
 * @param ctx 복약상담 컨텍스트
 * @returns CounselingCalcResult
 */
export async function calcCounseling(
  ctx: CounselingCalcContext
): Promise<CounselingCalcResult> {
  const { options, repo } = ctx;
  const year = parseInt(options.dosDate.substring(0, 4), 10) || 2026;
  const sugaMap = await repo.getSugaFeeMap(year);
  const feeParams: FeeBaseParams = { sugaMap };

  const wageItems: WageListItem[] = [];

  // ── [비대면 조제 경로] ────────────────────────────────────────────────────
  const nonFace = ctx.isNonFace ?? isNonFaceMode(options);
  if (nonFace) {
    const nonFaceOpts: CalcOptions = { ...options, isNonFace: true };
    const zcCode = getNonFaceDispensingCode(nonFaceOpts, options.dosDate);
    if (zcCode) {
      const item = makeWageItem(sugaMap, zcCode, 'non-face');
      if (item) wageItems.push(item);
    }

    const sumCounseling = wageItems.reduce((s, w) => s + w.sum, 0);
    return { wageItems, sumCounseling, mode: 'non-face' };
  }

  // ── [일반 경로: 복약상담 Z7001] ──────────────────────────────────────────
  let hasCounselingItem = false;
  let hasDalbitItem = false;

  const counselingOpts: CalcOptions = {
    ...options,
    hasCounseling: ctx.hasCounseling,
    isDalbitPharmacy: ctx.isDalbitPharmacy,
  };

  const z7001Item = calcCounselingFee(counselingOpts, feeParams);
  if (z7001Item) {
    wageItems.push(z7001Item);
    hasCounselingItem = true;
  }

  // ── [달빛어린이약국 추가 가산] ────────────────────────────────────────────
  const moonOpts: CalcOptions = {
    ...options,
    isDalbitPharmacy: ctx.isDalbitPharmacy,
  };

  const moonItem = calcMoonChildBonus(moonOpts, options.age);
  if (moonItem) {
    // 단가를 sugaMap에서 다시 조회하여 채운다
    const entry = sugaMap.get(moonItem.sugaCd);
    if (entry && entry.price > 0) {
      moonItem.price = entry.price;
      moonItem.sum = entry.price;
      wageItems.push(moonItem);
      hasDalbitItem = true;
    }
  }

  // ── mode 결정 ────────────────────────────────────────────────────────────
  let mode: CounselingCalcResult['mode'] = 'none';
  if (hasCounselingItem && hasDalbitItem) {
    mode = 'counseling+dalbit';
  } else if (hasCounselingItem) {
    mode = 'counseling';
  } else if (hasDalbitItem) {
    mode = 'dalbit';
  }

  const sumCounseling = wageItems.reduce((s, w) => s + w.sum, 0);
  return { wageItems, sumCounseling, mode };
}
