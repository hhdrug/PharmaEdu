/**
 * modules/insurance/veteran.ts
 * 보훈(G) 본인부담금 + 3자배분 계산 모듈
 *
 * 대상 보험코드: G10 (보훈일반), G20 (보훈2중)
 *
 * 보훈코드(BohunCode) 목록:
 *   M10 — 국비 전액감면 (환자 0원, 보훈청 전액 청구)
 *   M20 — 이중감면 90%(2018~)/80%(이전), 특수 역산 로직
 *   M30 — 감면 30%
 *   M50 — 감면 50%
 *   M60 — 감면 60%
 *   M61 — 고엽제 이중감면 역산 방식 (특수 처리)
 *   M81 — 보훈약국 60% (보훈병원 6곳 전용)
 *   M82 — 보훈약국 감면없음 (일반 30% 적용)
 *   M83 — 보훈약국 90%
 *   M90 — 감면 90% (2018.01.01 이후만 적용, 이전은 0%)
 *
 * 참조 문서:
 *   - C#: YakjaebiCalc.Engine/Engine/CopaymentCalculator.cs
 *       → CalcCopay_G(), GetBohunRate(), GetDoubleReductionRate(),
 *          CalcMpvaPrice(), IsBohunHospital(), ApplyBohunPharmacy()
 *   - output/CH05_보험유형별_본인부담금.md §5 (보훈 본인부담금)
 *   - output/CH06_3자배분_공비.md §5 (보훈 MpvaPrice/MpvaComm 산출)
 *   - output/CH06_3자배분_공비.md §6 (M81/M82/M83 보훈약국 처리)
 *   - output/CH12_보훈_약국_약제비_청구.md (공상등구분 로직)
 */

import type { CalcOptions, CalcResult, InsuRate } from '../../types';
import { trunc10, trunc100 } from '../../rounding';

// ─── 보훈코드 상수 ────────────────────────────────────────────────────────────

/**
 * 보훈코드 상수 (BohunCode)
 * C# BohunCode.cs 포팅
 */
export const BohunCode = {
  M10: 'M10', // 전액면제 (100% 감면)
  M20: 'M20', // 이중감면 90%/80%
  M30: 'M30', // 감면 30%
  M50: 'M50', // 감면 50%
  M60: 'M60', // 감면 60%
  M61: 'M61', // 고엽제 역산
  M81: 'M81', // 보훈약국 60%
  M82: 'M82', // 보훈약국 감면없음
  M83: 'M83', // 보훈약국 90%
  M90: 'M90', // 감면 90%
} as const;

export type BohunCodeType = (typeof BohunCode)[keyof typeof BohunCode];

// ─── 보훈병원 6곳 하드코딩 ───────────────────────────────────────────────────

/**
 * 보훈병원 6곳 요양기관기호
 *
 * C# CopaymentCalculator._bohunHospitals (요양기관기호 6곳)
 * 순서: 서울(중앙), 부산, 광주, 대전, 대구, 인천
 *
 * 참조: output/CH05_보험유형별_본인부담금.md §5.6
 *       C# CopaymentCalculator.cs 1127행
 */
const BOHUN_HOSPITAL_CODES = new Set<string>([
  '11100231', // 서울(중앙보훈병원)
  '21100292', // 부산보훈병원
  '37100220', // 광주보훈병원
  '36100137', // 대전보훈병원
  '34100237', // 대구보훈병원
  '31210961', // 인천보훈병원
]);

// ─── 컨텍스트/결과 인터페이스 ─────────────────────────────────────────────────

/**
 * 보훈 계산 입력 컨텍스트
 */
export interface VeteranCalcContext {
  /** 계산 입력 파라미터 */
  options: CalcOptions;
  /** 중간 결과 (sumInsuDrug, sumWage 채워진 상태) */
  result: CalcResult;
  /** 보험요율 마스터 */
  rate: InsuRate;
}

/**
 * 보훈 계산 출력
 */
export interface VeteranCalcResult {
  /** 본인일부부담금 (환자 납부액) */
  userPrice: number;
  /** 보훈청 청구액 (MpvaPrice) */
  mpvaPrice: number;
  /** 공단 청구액 (InsuPrice = totalPrice - userPrice - mpvaPrice) */
  insuPrice: number;
  /** 보훈 비급여 감면분 (MpvaComm) — 향후 비급여 필드 추가 시 채움 */
  mpvaComm: number;
  /** 계산 단계 로그 (교육용) */
  steps: VeteranCalcStep[];
}

/**
 * 보훈 계산 단계 (교육 모드용)
 */
export interface VeteranCalcStep {
  title: string;
  formula: string;
  result: number;
  unit: string;
}

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 보훈 감면율 결정 (BohunCode → 감면율)
 *
 * C# CopaymentCalculator.GetBohunRate() 포팅
 *
 * 날짜 분기:
 *  - M20: 2018.01.01 이후 90%, 이전 80%
 *  - M90: 2018.01.01 이후 90%, 이전 0% (G타입에서만 유효)
 *
 * @param bohunCode 보훈코드 (M10~M90)
 * @param dosDate   조제일자 (yyyyMMdd 형식)
 * @returns 감면율 정수 (0~100, %)
 */
export function getBohunRate(bohunCode: string, dosDate: string): number {
  if (!bohunCode) return 0;

  const isAfter2018 = dosDate >= '20180101';

  switch (bohunCode) {
    case BohunCode.M10: return 100;
    case BohunCode.M20: return isAfter2018 ? 90 : 80;
    case BohunCode.M30: return 30;
    case BohunCode.M50: return 50;
    case BohunCode.M60: return 60;
    case BohunCode.M61: return 60; // 고엽제 — 감면율은 60%이지만 역산 특수로직 별도 처리
    case BohunCode.M81: return 60; // 보훈약국 60%
    case BohunCode.M82: return 0;  // 감면없음
    case BohunCode.M83: return 90; // 보훈약국 90%
    case BohunCode.M90: return isAfter2018 ? 90 : 0;
    default: return 0;
  }
}

/**
 * 이중감면 비율 조회 (M20/M61 전용)
 *
 * C# CopaymentCalculator.GetDoubleReductionRate() 포팅
 *
 * M20/M61의 2차 감면율(num7): 보험 부담률 적용 후 환자 부담금에서
 * 추가로 감면하는 비율. 이 비율만큼 보훈청이 추가 부담한다.
 *
 * 반환값 의미:
 *   - 90 → 환자 부담금의 90%를 남긴다 (= 10% 추가 감면)
 *   - 80 → 환자 부담금의 80%를 남긴다 (= 20% 추가 감면)
 *   - 0  → 해당 없음 (M20/M61이 아닌 경우)
 *
 * C# 원본에서 num7은 10(2018이후)/20(이전)이지만,
 * 실제 사용은 trunc100(userPrice * num7/100) 형태이다.
 * 즉, num7=10이면 userPrice의 10%를 보훈청이 추가 부담하고
 * 환자는 90%만 낸다. 여기서는 C# 원본과 동일하게 10/20으로 반환한다.
 *
 * @param bohunCode 보훈코드
 * @param dosDate   조제일자 (yyyyMMdd)
 * @returns 이중감면 비율 (0, 10, 20)
 */
export function getDoubleReductionRate(bohunCode: string, dosDate: string): number {
  if (bohunCode !== BohunCode.M20 && bohunCode !== BohunCode.M61) return 0;

  const isAfter2018 = dosDate >= '20180101';
  // 2018이후: 10% 추가 감면(환자는 90%), 이전: 20% 추가 감면(환자는 80%)
  return isAfter2018 ? 10 : 20;
}

/**
 * 보훈병원 여부 확인 (하드코딩 6곳)
 *
 * C# CopaymentCalculator.IsBohunHospital() 포팅
 *
 * 보훈병원 6곳(서울·부산·광주·대전·대구·인천)에 속하는 요양기관기호일 때 true.
 * M81/M82/M83 코드는 이 병원들 처방전에서만 발행된다.
 *
 * @param hospCode 요양기관기호
 * @returns 보훈병원 여부
 */
export function isBohunHospital(hospCode: string): boolean {
  if (!hospCode) return false;
  return BOHUN_HOSPITAL_CODES.has(hospCode);
}

/**
 * 내부 — MpvaPrice(보훈청구액) 산출
 *
 * C# CopaymentCalculator.CalcMpvaPrice() 포팅
 *
 * 분기:
 *  - G10 이외 보험(C/D)에서 M10이 아닌 경우 → 0 반환 (단, G타입은 항상 산출)
 *  - 위탁(isMPVBill): trunc10(총액 × 감면율/100) — 정산 방식
 *  - 비위탁: 총액 - trunc10(총액 × (100-감면율)/100) — 역산 방식
 *    (절사 오차가 환자에게 불리하지 않도록 비보훈분을 먼저 절사)
 *
 * @param totalPrice 요양급여비용총액1
 * @param bohunRate  감면율 (0~100)
 * @param isMPVBill  위탁 여부 (G20 등)
 * @returns MpvaPrice
 */
function calcMpvaPrice(
  totalPrice: number,
  bohunRate: number,
  isMPVBill: boolean,
): number {
  if (bohunRate <= 0) return 0;
  if (bohunRate >= 100) return totalPrice;

  if (isMPVBill) {
    // 위탁: 정산 방식
    return trunc10(totalPrice * bohunRate / 100);
  } else {
    // 비위탁: 역산 방식
    const nonBohun = trunc10(totalPrice * (100 - bohunRate) / 100);
    return totalPrice - nonBohun;
  }
}

/**
 * 보훈 본인부담금 + 3자배분 계산
 *
 * C# CalcCopay_G() + 주변 로직 포팅
 *
 * 처리 순서:
 *   1. bohunCode / dosDate 추출 (CalcOptions 정식 필드)
 *   2. 감면율(bohunRate) = getBohunRate(bohunCode, dosDate)
 *   3. 이중감면율(num7) = getDoubleReductionRate(bohunCode, dosDate)
 *   4. MpvaPrice = calcMpvaPrice(totalPrice, bohunRate, isMPVBill)
 *      단, M20·M61은 이 단계에서 MpvaPrice=0 (CalcCopay_G 내에서 직접 처리)
 *   5. 본인부담 기준액 = totalPrice - mpvaPrice
 *   6. 감면율 30/50/60/90% → trunc10, 기타 → trunc100
 *   7. M10: userPrice=0, mpvaPrice=totalPrice
 *   8. M82: 일반 부담률 trunc100(총액 × insuRate%)
 *   9. M20: 이중감면 — userPrice에서 num7% 추가 감면 후 mpvaPrice로 전환, G타입에서는 mpvaPrice=0
 *  10. M61: 고엽제 역산 — trunc100(기준액 × insuRate% × num7%)
 *  11. 3자배분 확정: insuPrice = totalPrice - userPrice - mpvaPrice
 *      (음수 발생 시 mpvaPrice → userPrice 순으로 차감)
 *  12. ApplyBohunPharmacy: M81~M83 보훈약국 후처리 (isMPVBill 여부에 따라 분기)
 *
 * @param options CalcOptions (bohunCode, hospCode, isMPVBill, isSimSa 포함)
 * @param result  CalcResult (totalPrice 채워진 상태)
 * @param rate    InsuRate (rate 필드 = 본인부담률 %)
 * @returns 업데이트된 CalcResult (userPrice, mpvaPrice, insuPrice 반영)
 */
export function calcVeteran(
  options: CalcOptions,
  result: CalcResult,
  rate: InsuRate,
): CalcResult {
  // ── 보훈 관련 옵션 추출 ───────────────────────────────────────────────────
  const bohunCode = options.bohunCode ?? '';
  const dosDate = options.dosDate;
  const isMPVBill = options.isMPVBill ?? false;
  const isSimSa = options.isSimSa ?? false;
  // hospCode는 isBohunHospital 판정에만 사용 (M81~M83 후처리에서)
  const hospCode = options.hospCode ?? '';

  // ── Step 1: 총액 ─────────────────────────────────────────────────────────
  const totalPrice = result.totalPrice; // trunc10 이미 적용된 요양급여비용총액1

  // ── Step 2: 감면율 결정 ───────────────────────────────────────────────────
  const bohunRate = getBohunRate(bohunCode, dosDate);
  // 이중감면율 (M20/M61 전용, 나머지 0)
  const num7 = getDoubleReductionRate(bohunCode, dosDate);

  // ── Step 3: 보험요율 ──────────────────────────────────────────────────────
  const insuRate = rate.rate; // 본인부담률 (%)

  // ── Step 4: MpvaPrice 사전 산출 ──────────────────────────────────────────
  // M20·M61은 이 단계에서 mpvaPrice=0 (CalcCopay_G 내부에서 결정)
  let mpvaPrice =
    bohunRate > 0 &&
    bohunCode !== BohunCode.M20 &&
    bohunCode !== BohunCode.M61
      ? calcMpvaPrice(totalPrice, bohunRate, isMPVBill)
      : 0;

  // ── Step 5: 본인부담금 산출 ───────────────────────────────────────────────
  let userPrice: number;

  // M10: 국비 100% — 환자 0원
  if (bohunRate >= 100) {
    userPrice = 0;
    mpvaPrice = totalPrice; // 전액 보훈청 부담
  }
  // M82: 감면없음 — 일반 부담률 (100원 절사)
  else if (bohunCode === BohunCode.M82) {
    userPrice = trunc100(totalPrice * insuRate / 100);
  }
  // M20: 이중감면 (G타입)
  else if (bohunCode === BohunCode.M20 && num7 > 0) {
    // 1단계: 기준액(= 총액 - mpvaPrice=0) 에 보험요율 적용
    const basisAmt = totalPrice; // M20은 mpvaPrice=0이므로 기준액 = 총액
    let baseUser = trunc100(basisAmt * insuRate / 100);

    // 2단계: 이중감면 — baseUser에서 num7% 추가 감면
    //   addMpva = baseUser - trunc100(baseUser * num7/100)
    //   → 추가 감면액을 보훈이 부담
    //   G타입에서는 MpvaPrice를 0으로 리셋하고 MpvaComm으로 전환 (CH06 §5-4)
    const addMpva = baseUser - trunc100(baseUser * num7 / 100);
    userPrice = baseUser - addMpva;
    mpvaPrice = 0; // ★ G타입 M20: MpvaPrice는 0 (MpvaComm으로 전환 — Integration Lead 처리)
  }
  // M61: 고엽제 역산
  else if (bohunCode === BohunCode.M61 && num7 >= 0) {
    // 기준액 = 총액 - mpvaPrice (mpvaPrice는 위에서 0으로 설정됨)
    const basisAmt = totalPrice - mpvaPrice;
    // 본인부담률 × 감면후비율(num7/100)
    // 예: insuRate=30%, num7=10 → 30% × 10% = 3% → 실제 환자부담
    userPrice = trunc100(basisAmt * insuRate / 100 * num7 / 100);

    // MpvaPrice 재산출: 일반 본인부담금 - 고엽제 적용 본인부담금
    const normalUser = trunc100(totalPrice * insuRate / 100);
    mpvaPrice = normalUser - userPrice;
    if (mpvaPrice < 0) mpvaPrice = 0;
  }
  // 일반 보훈 감면 (M30/M50/M60/M81/M83/M90)
  else {
    const basisAmt = totalPrice - mpvaPrice;
    // 감면율 30/50/60/90%: 10원 절사, 기타: 100원 절사
    if (
      bohunRate === 30 ||
      bohunRate === 50 ||
      bohunRate === 60 ||
      bohunRate === 90
    ) {
      userPrice = trunc10(basisAmt * insuRate / 100);
    } else {
      userPrice = trunc100(basisAmt * insuRate / 100);
    }
  }

  // ── Step 6: 3자배분 확정 ─────────────────────────────────────────────────
  // 항등식: totalPrice = userPrice + insuPrice + mpvaPrice
  let insuPrice = totalPrice - userPrice - mpvaPrice;

  // 음수 보정 (C# 207~223행)
  if (insuPrice < 0) {
    const overflow = -insuPrice;
    insuPrice = 0;
    if (mpvaPrice >= overflow) {
      mpvaPrice -= overflow;
    } else {
      userPrice -= overflow - mpvaPrice;
      mpvaPrice = 0;
    }
  }

  // ── Step 7: ApplyBohunPharmacy (M81/M82/M83 후처리) ──────────────────────
  // G타입 + 비위탁: 환자부담 0, 보훈전액부담
  // G타입 + 위탁: userPrice 유지
  // C31/C32, D타입: Integration Lead가 연결할 때 별도 분기 추가 필요
  if (
    bohunCode === BohunCode.M81 ||
    bohunCode === BohunCode.M82 ||
    bohunCode === BohunCode.M83
  ) {
    // 보험코드가 G계열이고 비위탁이면 환자부담 0, MpvaPrice 가산
    const isVeteransInsurance = options.insuCode.startsWith('G');
    if (isVeteransInsurance && !isMPVBill) {
      // 비위탁 보훈약국: 환자부담 0, RealPrice(= userPrice)를 mpvaPrice로 전환
      const realPrice = userPrice; // pubPrice=0 가정 (Integration Lead가 공비 처리)
      if (!isSimSa) {
        userPrice = 0;
      }
      mpvaPrice += realPrice;
      insuPrice = totalPrice - userPrice - mpvaPrice;
      if (insuPrice < 0) insuPrice = 0;
    }
    // 위탁(isMPVBill): userPrice 그대로 유지 (SumUser=RealPrice는 Integration Lead 처리)
  }

  // ── 결과 단계 로그 ────────────────────────────────────────────────────────
  const steps: VeteranCalcStep[] = [
    {
      title: '보훈 감면율 결정',
      formula: `getBohunRate('${bohunCode}', '${dosDate}')`,
      result: bohunRate,
      unit: '%',
    },
    {
      title: '보훈청 청구액 (MpvaPrice)',
      formula:
        isMPVBill
          ? `trunc10(${totalPrice} × ${bohunRate}%) = ${mpvaPrice}`
          : `${totalPrice} - trunc10(${totalPrice} × ${100 - bohunRate}%) = ${mpvaPrice}`,
      result: mpvaPrice,
      unit: '원',
    },
    {
      title: '본인일부부담금 (UserPrice)',
      formula: `trunc100((${totalPrice} - ${mpvaPrice}) × ${insuRate}%)`,
      result: userPrice,
      unit: '원',
    },
    {
      title: '공단 청구액 (InsuPrice)',
      formula: `${totalPrice} - ${userPrice} - ${mpvaPrice}`,
      result: insuPrice,
      unit: '원',
    },
  ];

  // ── CalcResult 업데이트 ────────────────────────────────────────────────────
  return {
    ...result,
    userPrice,
    pubPrice: insuPrice + mpvaPrice, // pubPrice = insuPrice + mpvaPrice (기존 정의 유지)
    mpvaPrice,
    insuPrice,
    steps: [
      ...result.steps,
      ...steps.map(s => ({ title: s.title, formula: s.formula, result: s.result, unit: s.unit })),
    ],
  };
}
