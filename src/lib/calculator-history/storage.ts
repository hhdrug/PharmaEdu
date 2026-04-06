/**
 * calculator-history/storage.ts
 * localStorage 기반 계산 이력 CRUD
 * - 최대 100건 보관 (초과 시 오래된 항목 자동 삭제)
 * - SSR-safe (typeof window 체크)
 */

import type { CalcHistoryEntry } from './types';

const STORAGE_KEY = 'pharma_edu_calc_history';
const MAX_ENTRIES = 100;

/** localStorage에서 전체 이력 읽기 */
export function getCalcHistory(): CalcHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CalcHistoryEntry[];
    // 최신순 정렬 보장
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/** 이력 항목 1건 저장 (최신 항목이 앞에 오도록, 최대 100건) */
export function saveCalcHistory(entry: CalcHistoryEntry): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getCalcHistory();
    // 중복 ID 방지
    const filtered = existing.filter((e) => e.id !== entry.id);
    const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 저장 실패 시 무시 (QuotaExceededError 등)
  }
}

/** 특정 ID 이력 삭제 */
export function deleteCalcHistory(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getCalcHistory();
    const next = existing.filter((e) => e.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 무시
  }
}

/** 전체 이력 삭제 */
export function clearCalcHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}

/** 간단한 ID 생성기 (crypto.randomUUID 사용, 폴백으로 timestamp) */
export function generateHistoryId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
