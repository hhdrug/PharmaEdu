/**
 * modules/surcharges/powder.ts
 * 가루약(산제) 가산 계산 모듈
 *
 * 수가코드: Z4010 계열 (산제 내복약 조제료)
 *
 * 2023.11.01 기준 분기:
 *   - 이전: 기존 Z41xx 코드 사용 + Z4010 별도 행 추가 (cnt=1)
 *   - 이후: Z41xx baseCode + "100" 접미사 (가루약 가산 신체계)
 *          야간/공휴/소아심야/토요/소아 가산 전부 배제
 *
 * 가산 우선순위:
 *   가루약 가산 활성 시 → 야간/공휴/소아심야/토요/소아 가산 전부 비활성
 *   (determineSurcharge의 isPowder=true 경로)
 *
 * Z코드 체계:
 *   2023.11.01 이후:
 *     Z41xx100  — 투약일수별 산제 내복 조제료 (baseCode + "100")
 *     ex) Z4103100 (3일분 가루약)
 *   2023.11.01 이전:
 *     Z41xx (기본) + Z4010 별도 행 (cnt=1)
 *
 * 가루약 판정:
 *   DrugItem.isPowder === '1' 필드 기반 (C# drug.IsPowder == "1"과 동일)
 *   Task 명세의 element(ATB/ACH/AGN) 방식은 현재 types.ts에 없으므로 미지원.
 *
 * 참조 문서:
 *   - C#: DispensingFeeCalculator.cs → 산제 분기 (CalcPresInternal)
 *   - output/CH04_가산_로직.md §4-6 (가루약 가산)
 *   - output/CH03_조제료_수가계산.md (Z4010 계열)
 */

import type { CalcOptions, DrugItem, WageListItem, ICalcRepository } from '../../types';

// ─── 컨텍스트 인터페이스 ─────────────────────────────────────────────────────

/**
 * 산제 가산 계산 컨텍스트
 */
export interface PowderCalcContext {
  /** 계산 입력 파라미터 */
  options: CalcOptions;
  /** 레포지토리 (Z코드 단가 조회용) */
  repo: ICalcRepository;
  /** 내복약 최대 투약일수 */
  maxInternalDay: number;
  /** 2023.11.01 이후 여부 (날짜 분기) */
  isAfter20231101: boolean;
}

/**
 * 산제 가산 계산 결과
 */
export interface PowderCalcResult {
  /** 산제 조제료 항목 목록 */
  wageItems: WageListItem[];
  /** 산제 조제료 합계 */
  sumPowder: number;
}

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 약품 리스트에 가루약이 있는지 판정
 *
 * DrugItem.isPowder === '1' 필드 기반.
 * (C# drug.IsPowder == "1" 로직과 동일)
 *
 * 주의: Task 명세의 element(ATB/ACH/AGN) 방식은 현재 DrugItem 타입에
 *       element 필드가 정의되어 있지 않으므로 isPowder 필드를 사용함.
 *
 * @param drugList 약품 목록
 * @returns 가루약 포함 여부
 */
export function hasPowderDrug(drugList: DrugItem[]): boolean {
  return drugList.some(d => d.isPowder === '1');
}

/**
 * 가루약이 있을 때 다른 가산(야간/공휴/토요/소아)을 배제해야 하는지
 *
 * 가루약 가산은 2023.11.01 이후에만 활성화되어 다른 가산을 배제.
 * (C# hasPowder && dosDateAfterPowder 조건과 동일)
 *
 * @param drugList 전체 약품 리스트
 * @returns 다른 가산 배제 여부
 */
export function shouldExcludeOtherSurcharges(drugList: DrugItem[]): boolean {
  return hasPowderDrug(drugList);
}

/**
 * 내복약 투약일수에 해당하는 Z41xx base 코드 반환
 * 1~15일: Z4101~Z4115
 * 16일 이상: Z4116 (실제 운용 시 presc_dosage_fee 조회 필요 — 여기서는 처리하지 않음)
 */
function getInternalBaseCode(days: number): string {
  if (days <= 15) {
    return `Z41${String(days).padStart(2, '0')}`;
  }
  // 16일 이상은 presc_dosage_fee 테이블 조회 필요
  // 여기서는 처방조제 모듈(dispensing-fee.ts)에서 처리하며 powder 모듈은 지원하지 않음
  return `Z41${String(days).padStart(2, '0')}`;
}

/**
 * 가루약 가산 계산 — Z4010 WageListItem 생성 (컨텍스트 기반)
 *
 * 처리 순서:
 *   1. 2023.11.01 전후 분기
 *      - 이후: Z41xx baseCode + "100" 접미사 (신체계)
 *      - 이전: Z4010 별도 행 추가 (구체계, cnt=1)
 *   2. 가루약 가산 활성 시 야간/공휴 접미사 미적용
 *      (SurchargeFlags.isPowder = true이면 holidayGb는 무시)
 *
 * @param ctx 산제 가산 컨텍스트
 * @returns PowderCalcResult
 */
export async function calcPowderSurchargeFromCtx(
  ctx: PowderCalcContext
): Promise<PowderCalcResult> {
  const { options, repo, maxInternalDay, isAfter20231101 } = ctx;

  if (!hasPowderDrug(options.drugList)) {
    return { wageItems: [], sumPowder: 0 };
  }

  const year = parseInt(options.dosDate.substring(0, 4), 10) || 2026;
  const sugaMap = await repo.getSugaFeeMap(year);

  const wageItems: WageListItem[] = [];

  function addWage(code: string, cnt: number): void {
    const entry = sugaMap.get(code);
    if (!entry || entry.price === 0) return;
    const price = entry.price;
    wageItems.push({
      sugaCd: code,
      name: entry.name || code,
      insuPay: '1',
      cnt,
      price,
      sum: price * cnt,
      addType: 'powder',
    });
  }

  if (isAfter20231101) {
    // 신체계 (2023.11.01 이후): baseCode + "100"
    // 가루약 가산이 활성화되면 내복약 조제료 코드에 "100" 접미사 적용
    // 야간/공휴/토요 접미사는 미적용
    if (maxInternalDay > 0) {
      const baseCode = getInternalBaseCode(maxInternalDay);
      const powderCode = baseCode + '100';
      // 가산 코드 단가가 없으면 기본 코드로 폴백
      const entry = sugaMap.get(powderCode);
      if (entry && entry.price > 0) {
        wageItems.push({
          sugaCd: powderCode,
          name: entry.name || powderCode,
          insuPay: '1',
          cnt: 1,
          price: entry.price,
          sum: entry.price,
          addType: 'powder',
        });
      } else {
        // 폴백: 기본 내복약 코드
        addWage(baseCode, 1);
      }
    }
  } else {
    // 구체계 (2023.11.01 이전): Z4010 별도 행 추가 (cnt=1)
    // 기존 Z41xx 조제료 행은 dispensing-fee.ts에서 정상 산정되고
    // 그에 더해 Z4010 가산 행이 추가됨
    addWage('Z4010', 1);
  }

  const sumPowder = wageItems.reduce((s, w) => s + w.sum, 0);
  return { wageItems, sumPowder };
}

/**
 * 가루약 가산 계산 — Z4010 WageListItem 생성 (단순 인터페이스)
 *
 * 가루약이 없으면 null 반환.
 * 있으면 날짜 분기에 따라:
 *   - 2023.11.01 이전: Z4010 수가 항목 반환
 *   - 2023.11.01 이후: Z41xx 대체 시 dispensing-fee 레벨에서 처리하므로
 *                      여기서는 null 반환 (Integration Lead가 연결 시 확인 필요)
 *
 * @param drugList 전체 약품 리스트
 * @param dosDate 조제일자 (yyyyMMdd)
 * @returns Z4010 수가 항목 (없으면 null)
 *
 * @remarks
 * 이 함수는 repo 없이 단가를 반환할 수 없으므로 단가는 0으로 설정됩니다.
 * 실제 단가 계산이 필요하면 calcPowderSurchargeFromCtx를 사용하세요.
 */
export function calcPowderSurcharge(
  drugList: DrugItem[],
  dosDate: string
): WageListItem | null {
  if (!hasPowderDrug(drugList)) {
    return null;
  }

  const isAfter = dosDate.replace(/\./g, '') >= '20231101';

  if (!isAfter) {
    // 구체계: Z4010 별도 행 (단가는 DB 조회 필요 — 여기서는 0으로 반환)
    return {
      sugaCd: 'Z4010',
      name: '산제내복조제료(가루약가산)',
      insuPay: '1',
      cnt: 1,
      price: 0, // 실제 단가는 getSugaFeeMap(year)에서 조회 필요
      sum: 0,
      addType: 'powder',
    };
  }

  // 신체계: Z41xx+"100" — 코드만 반환 (실제 단가는 dispensing-fee 레벨에서 처리)
  // null 반환으로 Integration Lead에게 신체계 처리 신호 전달
  return null;
}
