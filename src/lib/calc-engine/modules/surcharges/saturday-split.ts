/**
 * modules/surcharges/saturday-split.ts
 * 토요 가산 별도행 분리 계산 모듈
 *
 * 2016.09.29 이후 규칙:
 *   토요일 가산분을 기본 조제료와 **별도 행(row)**으로 분리하여 청구.
 *   기본 조제료는 평일과 동일한 코드를 사용하고,
 *   토요 가산분만 별도 Z코드(접미사 030)로 추가.
 *
 * 별도 행 코드 목록 (holidayGb="3"):
 *   Z2000030 — 기본조제기술료(토요가산)
 *   Z3000030 — 복약지도료(토요가산)
 *   Z41xx030 — 내복약 조제료(토요가산) [투약일수별]
 *   Z4120030 — 외용약 조제료(토요가산) [외용만 있는 경우]
 *
 * 주의:
 *   - 토요 + 내복 + 외용 동시: Z4121030은 없음, Z41xx030만 적용
 *   - 16일 이상 내복: presc_dosage_fee 조회 후 sugaCode + "030"
 *   - 토요 + 6세 미만: Z2000630 사용 (Z2000030 대신)
 *   - 2016.09.29 이전: 단일 행 방식 (별도 행 없음)
 *
 * 참조 문서:
 *   - C#: DispensingFeeCalculator.cs → IsSaturday 분기 (토요 별도 행)
 *   - surcharge.ts 현재 구현 (getSaturdayAddCodes 참조)
 *   - output/CH04_가산_로직.md §4-5 (토요 가산)
 */

import type { WageListItem, ICalcRepository } from '../../types';

// ─── 상수 ────────────────────────────────────────────────────────────────────

/** 토요 가산 별도 행 분리 시행일 (2016.09.29) */
const SATURDAY_SPLIT_DATE = '20160929';

// ─── 컨텍스트 인터페이스 ─────────────────────────────────────────────────────

/**
 * 토요 가산 별도행 계산 컨텍스트
 */
export interface SaturdaySplitContext {
  /** 계산 입력 파라미터 */
  options: {
    dosDate: string;
    isSaturday?: boolean;
    age?: number;
  };
  /** 레포지토리 */
  repo: ICalcRepository;
  /** 내복약 존재 여부 */
  hasInternal: boolean;
  /** 외용약 존재 여부 */
  hasExternal: boolean;
  /** 내복약 최대 투약일수 */
  maxInternalDay: number;
  /** 6세 미만 여부 (소아 + 토요 동시 적용) */
  isChild: boolean;
}

/**
 * 토요 가산 별도행 계산 결과
 */
export interface SaturdaySplitResult {
  /** 토요 가산 별도 행 목록 */
  wageItems: WageListItem[];
  /** 토요 가산 합계 */
  sumSaturday: number;
}

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 2016.09.29 이후 여부 판정
 *
 * @param dosDate 조제일자 (yyyyMMdd)
 * @returns true = 별도 행 분리 방식, false = 단일 행 방식
 */
export function isAfterSaturdaySplitDate(dosDate: string): boolean {
  return dosDate >= SATURDAY_SPLIT_DATE;
}

/**
 * 토요 가산 별도 행 1건 생성
 *
 * 단가가 0원이면 null 반환 (행 미추가).
 *
 * @param baseCode 기본 Z코드 (Z1000, Z2000, Z3000, Z4xxx 등)
 * @param basePrice 기본 수가 단가 (원)
 * @param dosDate 조제일자 (yyyyMMdd)
 * @returns WageListItem (030 접미사 행) 또는 null
 */
export function createSaturdaySplitRow(
  baseCode: string,
  basePrice: number,
  dosDate: string
): WageListItem | null {
  if (!isAfterSaturdaySplitDate(dosDate)) return null;
  if (basePrice <= 0) return null;

  const satCode = baseCode + '030';

  return {
    sugaCd: satCode,
    name: `${satCode}(토요가산)`,
    insuPay: '1',
    cnt: 1,
    price: basePrice,
    sum: basePrice,
    addType: 'saturday',
  };
}

/**
 * 토요 가산 별도 행을 기존 WageList에 추가
 *
 * wageList를 순회하여 토요 가산 대상 코드(Z2000, Z3000, Z41xx, Z4120)를
 * 찾아 대응하는 "030" 접미사 행을 뒤에 삽입한다.
 *
 * @param wageList 기존 수가 항목 목록
 * @param dosDate 조제일자 (yyyyMMdd)
 * @param isSaturday 토요 가산 여부
 * @returns 토요 가산 행이 추가된 새 WageList
 */
export function applySaturdaySurchargeRows(
  wageList: WageListItem[],
  dosDate: string,
  isSaturday: boolean
): WageListItem[] {
  if (!isSaturday) return wageList;
  if (!isAfterSaturdaySplitDate(dosDate)) return wageList;

  const result: WageListItem[] = [];

  for (const item of wageList) {
    result.push(item);

    // 토요 가산 별도 행을 추가할 대상 코드 패턴:
    //   Z2000, Z2000600(6세+토요 → Z2000630), Z3000, Z41xx, Z4120
    // addType이 이미 'saturday'인 항목은 건너뜀
    if (item.addType === 'saturday') continue;

    const code = item.sugaCd;

    if (code === 'Z2000' || code === 'Z2000600') {
      // 6세+토요: Z2000630, 일반: Z2000030
      const satCode = code === 'Z2000600' ? 'Z2000630' : 'Z2000030';
      if (item.price > 0) {
        result.push({
          sugaCd: satCode,
          name: `${satCode}(토요가산)`,
          insuPay: '1',
          cnt: 1,
          price: item.price,
          sum: item.price,
          addType: 'saturday',
        });
      }
    } else if (code === 'Z3000') {
      if (item.price > 0) {
        result.push({
          sugaCd: 'Z3000030',
          name: 'Z3000030(토요가산)',
          insuPay: '1',
          cnt: 1,
          price: item.price,
          sum: item.price,
          addType: 'saturday',
        });
      }
    } else if (/^Z41\d{2}$/.test(code) || /^Z43\d{2}$/.test(code)) {
      // Z41xx / Z43xx — 내복약 조제료
      if (item.price > 0) {
        const satCode = code + '030';
        result.push({
          sugaCd: satCode,
          name: `${satCode}(토요가산)`,
          insuPay: '1',
          cnt: 1,
          price: item.price,
          sum: item.price,
          addType: 'saturday',
        });
      }
    } else if (code === 'Z4120') {
      // 외용약 조제료
      if (item.price > 0) {
        result.push({
          sugaCd: 'Z4120030',
          name: 'Z4120030(토요가산)',
          insuPay: '1',
          cnt: 1,
          price: item.price,
          sum: item.price,
          addType: 'saturday',
        });
      }
    }
  }

  return result;
}

/**
 * 토요 가산 별도행 수가 계산 (저수준 — repo 직접 조회)
 *
 * 처리 순서:
 *   1. 2016.09.29 이전이거나 isSaturday=false → 빈 결과 반환
 *   2. Z2000030 (또는 Z2000630 — 6세 미만) 추가
 *   3. Z3000030 추가
 *   4. Z41xx030 (내복 있는 경우):
 *      - 1~15일: Z41{일수 2자리}030
 *      - 16일+: presc_dosage_fee 조회 후 sugaCode + "030"
 *   5. Z4120030 (외용만 있는 경우)
 *   6. 단가 0원이면 행 미추가
 *
 * @param ctx 토요 가산 별도행 컨텍스트
 * @returns SaturdaySplitResult
 */
export async function calcSaturdaySplit(
  ctx: SaturdaySplitContext
): Promise<SaturdaySplitResult> {
  const { options, repo, hasInternal, hasExternal, maxInternalDay, isChild } = ctx;

  // 토요 가산 미해당 또는 2016.09.29 이전
  if (!options.isSaturday) return { wageItems: [], sumSaturday: 0 };
  if (!isAfterSaturdaySplitDate(options.dosDate)) return { wageItems: [], sumSaturday: 0 };

  const wageItems: WageListItem[] = [];
  const year = parseInt(options.dosDate.substring(0, 4), 10) || 2026;
  const sugaMap = await repo.getSugaFeeMap(year);

  function getPrice(code: string): number {
    return sugaMap.get(code)?.price ?? 0;
  }

  function getName(code: string): string {
    return sugaMap.get(code)?.name ?? `${code}(토요가산)`;
  }

  function addItem(code: string): void {
    const price = getPrice(code);
    if (price <= 0) return;
    wageItems.push({
      sugaCd: code,
      name: getName(code),
      insuPay: '1',
      cnt: 1,
      price,
      sum: price,
      addType: 'saturday',
    });
  }

  // (1) Z2000030 / Z2000630 — 6세 미만 + 토요: Z2000630
  const z2000SatCode = isChild ? 'Z2000630' : 'Z2000030';
  const z2000SatPrice = getPrice(z2000SatCode);
  if (z2000SatPrice > 0) {
    wageItems.push({
      sugaCd: z2000SatCode,
      name: getName(z2000SatCode),
      insuPay: '1',
      cnt: 1,
      price: z2000SatPrice,
      sum: z2000SatPrice,
      addType: 'saturday',
    });
  } else if (z2000SatCode !== 'Z2000030') {
    // Z2000630 단가 없으면 Z2000030으로 폴백
    addItem('Z2000030');
  }

  // (2) Z3000030
  addItem('Z3000030');

  // (3) 내복약 조제료(토요가산)
  if (hasInternal && maxInternalDay > 0) {
    if (maxInternalDay <= 15) {
      const satCode = `Z41${String(maxInternalDay).padStart(2, '0')}030`;
      addItem(satCode);
    } else {
      // 16일 이상: presc_dosage_fee 테이블 조회 후 "030" 접미사
      const row = await repo.getPrescDosageFee(year, maxInternalDay);
      if (row) {
        const satCode = row.sugaCode + '030';
        const satPrice = getPrice(satCode);
        if (satPrice > 0) {
          wageItems.push({
            sugaCd: satCode,
            name: getName(satCode),
            insuPay: '1',
            cnt: 1,
            price: satPrice,
            sum: satPrice,
            addType: 'saturday',
          });
        }
      }
    }
  }

  // (4) Z4120030 — 외용만 있는 경우
  if (hasExternal && !hasInternal) {
    addItem('Z4120030');
  }

  const sumSaturday = wageItems.reduce((s, w) => s + w.sum, 0);
  return { wageItems, sumSaturday };
}
