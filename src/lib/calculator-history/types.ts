/**
 * calculator-history/types.ts
 * 계산 이력 저장용 타입 정의
 */

import type { CalcOptions } from '@/lib/calc-engine/types';

export interface CalcResultSnapshot {
  sumInsuDrug: number;
  sumWage: number;
  totalPrice: number;
  userPrice: number;
  pubPrice: number;
  mpvaPrice?: number;
}

export interface CalcHistoryEntry {
  /** UUID 형식 고유 ID */
  id: string;
  /** Unix timestamp (ms) */
  timestamp: number;
  /** 프리셋 시나리오 이름 (사용 시) */
  scenarioName?: string;
  /** 입력값 스냅샷 */
  options: CalcOptions;
  /** 계산 결과 핵심 수치 */
  result: CalcResultSnapshot;
  /** 약품 요약 ("3종 내복 7일" 형식) */
  drugSummary: string;
}
