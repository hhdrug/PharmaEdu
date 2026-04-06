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

// ─── MediIllnessInfo ─────────────────────────────────────────────────────────

/**
 * 산정특례 질병코드 상세 정보 (V252/V103 등)
 * C# MediIllnessInfo 포팅
 */
export interface MediIllnessInfo {
  /** 질병코드 (V103, V252 등) */
  code: string;
  /** 본인부담율 (%) */
  rate: number;
  /** V252 계열 여부 */
  isV252: boolean;
  /** 등급 (V252 0~9) */
  grade?: number;
  /** 설명 */
  description?: string;
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

  // ── [NEW] 보훈 관련 ────────────────────────────────────────────────────────
  /** 보훈코드 (M10~M90) — veteran.ts */
  bohunCode?: string;
  /** 요양기관기호 — isBohunHospital() 판정 */
  hospCode?: string;
  /** 위탁 여부 (G10=비위탁, G20=위탁) — veteran.ts */
  isMPVBill?: boolean;
  /** 심사기관 여부 — veteran.ts M81~M83 후처리 분기 */
  isSimSa?: boolean;

  // ── [NEW] 의료급여 관련 ────────────────────────────────────────────────────
  /** B014/B030 등 수급권자 유형 — medical-aid.ts */
  sbrdnType?: string;
  /** 건강생활유지비 잔액 (원) — medical-aid.ts */
  eHealthBalance?: number;
  /** 보건기관 처방전 여부 — medical-aid.ts */
  isHealthCenterPresc?: boolean;
  /** 의료급여 등급 ('5' → 면제) — medical-aid.ts */
  hgGrade?: string;

  // ── [NEW] 자동차보험 관련 ──────────────────────────────────────────────────
  /** 할증율 (%) — auto-insurance.ts */
  addRat?: number;

  // ── [NEW] 직접조제 ────────────────────────────────────────────────────────
  /** 직접조제 여부 — direct-dispensing.ts */
  isDirectDispensing?: boolean;

  // ── [NEW] 비대면/복약상담 ─────────────────────────────────────────────────
  /** 비대면 조제 여부 — counseling.ts */
  isNonFace?: boolean;
  /** 복약상담 제공 여부 — counseling.ts */
  hasCounseling?: boolean;
  /** 달빛어린이약국 여부 — counseling.ts */
  isDalbitPharmacy?: boolean;

  // ── [NEW] 산정특례 ────────────────────────────────────────────────────────
  /** 상세 특정기호 정보 — exemption.ts */
  mediIllnessInfo?: MediIllnessInfo;
  /** B코드 질병코드 (F008 코로나 등) */
  mediIllnessB?: string;

  // ── [NEW] 장려금/기타 ─────────────────────────────────────────────────────
  /** 대체조제/사용장려금 합계 (원) */
  incentiveSum?: number;
  /** 연간 누적 본인부담액 (본인부담상한제용) — safety-net.ts */
  yearlyAccumulated?: number;
  /** 소득분위 (1~10, 본인부담상한제용) — safety-net.ts */
  incomeDecile?: number;
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

  // ── [NEW] V252 산정특례 등급별 요율 ─────────────────────────────────────
  /** V252 0등급 요율 (%) — exemption.ts */
  v2520?: number;
  /** V252 1등급 요율 (%) — exemption.ts */
  v2521?: number;
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

  // ── [NEW] 3자배분 ─────────────────────────────────────────────────────────
  /** 보훈청 청구액 — veteran.ts */
  mpvaPrice?: number;
  /** 공단 청구액 (= pubPrice와 다를 수 있음) — veteran.ts/safety-net.ts */
  insuPrice?: number;
  /** 실수납금 = userPrice - pubPrice */
  realPrice?: number;
  /** 최종 환자수납액 (비급여 포함) */
  sumUser?: number;
  /** 최종 공단청구액 */
  sumInsure?: number;

  // ── [NEW] 특수약품 ────────────────────────────────────────────────────────
  /** 648903860 약품금액 합계 — drug-648.ts */
  sum648?: number;
  /** 100% 자부담 약품금액 합계 */
  sumInsuDrug100?: number;
  /** 100% 약품 총액 */
  totalPrice100?: number;
  /** 100% 약품 환자분 */
  userPrice100?: number;

  // ── [NEW] 자동차보험 할증 ─────────────────────────────────────────────────
  /** 자동차보험 할증액 — auto-insurance.ts */
  premium?: number;

  // ── [NEW] 공비 관련 ──────────────────────────────────────────────────────
  /** 공비 상세 (302/101/102 분리 시) */
  pubPrice2?: number;
  /** 보훈 비급여 감면분 */
  mpvaComm?: number;

  // ── [NEW] 본인부담상한제 ──────────────────────────────────────────────────
  /** 상한제 초과금 (공단 전환액) — safety-net.ts */
  overUserPrice?: number;

  // ── [NEW] 장려금 ─────────────────────────────────────────────────────────
  /** 대체조제 장려금 */
  incentive?: number;
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

  // ── [NEW] 확장 메서드 ──────────────────────────────────────────────────────
  /** 명절 여부 조회 — seasonal.ts (옵션, 구현 안 해도 됨) */
  getHolidayType?(date: string): Promise<'lunar_new_year' | 'chuseok' | 'holiday' | null>;
  /** MediIllnessInfo 조회 — exemption.ts (옵션, 구현 안 해도 됨) */
  getMediIllnessInfo?(code: string): Promise<MediIllnessInfo | null>;
}
