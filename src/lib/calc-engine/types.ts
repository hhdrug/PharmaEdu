/**
 * calc-engine/types.ts
 * TypeScript 타입 정의 — C# CalcOptions, CalcResult, DrugItem, InsuRate 포팅
 */

// ─── 열거형 ──────────────────────────────────────────────────────────────────

/** 보험급여구분 (DrugItem.InsuPay) */
export type InsuPayType =
  | 'covered'    // 1 = 급여 (일반)
  | 'nonCovered' // 0 = 비급여
  | 'fullSelf'   // 9 = 100% 본인부담
  | 'partial50'  // 2 = 선별급여 50%
  | 'partial80'  // 3 = 선별급여 80%
  | 'partial30'  // 4 = 선별급여 30%
  | 'partial90'; // 5 = 선별급여 90%

/** 복용구분 (DrugItem.Take) */
export type TakeType =
  | 'internal'  // 0 = 내복
  | 'external'  // 1 = 외용
  | 'injection';// 2 = 주사

// ─── DrugItem ────────────────────────────────────────────────────────────────

/**
 * 처방 약품 1건
 * C# DrugItem 포팅 (핵심 필드만)
 */
export interface DrugItem {
  /** 약품코드 (EDI코드, 9자리) */
  code: string;
  /** 보험급여구분 */
  insuPay: InsuPayType;
  /** 복용구분 */
  take: TakeType;
  /** 단가 (원) */
  price: number;
  /** 1회투약량 */
  dose: number;
  /** 1일투여횟수 */
  dNum: number;
  /** 총투여일수 */
  dDay: number;
  /** 포장단위 (0=미적용) */
  pack?: number;
  /** 산제여부 ("1"=산제) */
  isPowder?: string;
  /** 마약/향정 ("3"=마약, "4"=향정) */
  spec?: string;
  /** 보험약품여부 (true=보험등재) */
  insuDrug?: boolean;
}

// ─── CalcOptions ─────────────────────────────────────────────────────────────

/**
 * 계산 엔진 입력 파라미터
 * C# CalcOptions MVP 서브셋
 */
export interface CalcOptions {
  /** 조제일자 (yyyyMMdd) */
  dosDate: string;
  /** 조제시간 (HHmm, 야간판정용) */
  dosTime?: string;
  /** 보험코드 (C10/D10/G10/F10/E10 등) */
  insuCode: string;
  /** 환자나이 */
  age: number;
  /** 보험투여일수 (0이면 자동) */
  insuDose?: number;
  /** 토요일 가산 */
  isSaturday?: boolean;
  /** 야간 가산 */
  isNight?: boolean;
  /** 공휴일 가산 */
  isHolyDay?: boolean;
  /** 심야 가산 (6세 미만 전용) */
  isMidNight?: boolean;
  /** 처방 약품 리스트 */
  drugList: DrugItem[];
  /** 질병코드 (V252 산정특례 등) */
  mediIllness?: string;
}

// ─── InsuRate ────────────────────────────────────────────────────────────────

/**
 * 보험요율 마스터 (insu_rate 테이블 1행)
 */
export interface InsuRate {
  insuCode: string;
  rate: number;
  sixAgeRate: number;
  fixCost: number;
  mcode: number;
  bcode: number;
  age65_12000Less: number;
}

// ─── WageListItem ─────────────────────────────────────────────────────────────

/**
 * 수가 항목 1건 (조제료 세부내역)
 */
export interface WageListItem {
  sugaCd: string;
  name: string;
  insuPay: string;
  cnt: number;
  price: number;
  sum: number;
  addType: string;
}

// ─── CalcResult ──────────────────────────────────────────────────────────────

/**
 * 계산 결과
 * C# CalcResult MVP 서브셋
 */
export interface CalcResult {
  /** 약품금액 합계 (급여) */
  sumInsuDrug: number;
  /** 조제료 합계 */
  sumWage: number;
  /** 요양급여비용총액1 = trunc10(약가+조제료) */
  totalPrice: number;
  /** 본인일부부담금 */
  userPrice: number;
  /** 청구액 = totalPrice - userPrice */
  pubPrice: number;
  /** 수가 항목별 결과 리스트 */
  wageList: WageListItem[];
  /** 계산 단계 설명 (교육용) */
  steps: CalcStep[];
  /** 오류 메시지 (있을 경우) */
  error?: string;
}

/**
 * 계산 단계 설명 (교육 모드용)
 */
export interface CalcStep {
  title: string;
  formula: string;
  result: number;
  unit: string;
}

// ─── ICalcRepository ─────────────────────────────────────────────────────────

/**
 * 수가 데이터 조회 인터페이스
 */
export interface ICalcRepository {
  /** Z코드별 단가 Map 조회 */
  getSugaFeeMap(year: number): Promise<Map<string, { price: number; name: string }>>;
  /** 투약일수에 해당하는 처방조제료 항목 조회 */
  getPrescDosageFee(year: number, days: number): Promise<{ sugaCode: string; fee: number } | null>;
  /** 보험코드별 요율 조회 */
  getInsuRate(insuCode: string): Promise<InsuRate | null>;
}
