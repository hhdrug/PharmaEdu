'use client';

// ── Daily Challenge localStorage 유틸리티 ──────────────────────
// 이 파일의 모든 함수는 클라이언트 사이드 전용이다.
// localStorage 접근 불가 환경(SSR, incognito 용량 초과)은 안전하게 빈 값으로 처리한다.

import type { DailyRecord, DailyStats, CalendarDay } from './types';
import { getTodayKST, getLast30DayStrings } from './date';

const STORAGE_KEY = 'pharmaEdu_daily_records';

// ── 기본 CRUD ────────────────────────────────────────────────────

/** 저장된 전체 기록 반환. 읽기 실패 시 빈 배열 */
export function getDailyRecords(): DailyRecord[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DailyRecord[]) : [];
  } catch {
    return [];
  }
}

/** 기록 1건 저장 (같은 날짜가 있으면 덮어씀) */
export function saveDailyRecord(record: DailyRecord): void {
  try {
    if (typeof window === 'undefined') return;
    const records = getDailyRecords();
    const existing = records.findIndex((r) => r.date === record.date);
    if (existing >= 0) {
      records[existing] = record;
    } else {
      records.push(record);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage full or unavailable (incognito) — silently ignore
  }
}

/** 오늘(KST) 기록 반환. 없으면 null */
export function getTodayRecord(): DailyRecord | null {
  const today = getTodayKST();
  const records = getDailyRecords();
  return records.find((r) => r.date === today) ?? null;
}

// ── 스탯 계산 ─────────────────────────────────────────────────

/**
 * 스트릭 계산 규칙:
 * - 오늘 또는 어제까지 연속으로 맞춘 날 수 = currentStreak
 * - 틀린 날(wrong)은 스트릭을 끊는다 (0으로 리셋)
 * - 오늘 아직 안 풀었으면: 어제 기준으로 연속 확인
 */
export function calculateStats(records: DailyRecord[]): DailyStats {
  if (records.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalSolved: 0, totalCorrect: 0 };
  }

  const totalSolved = records.length;
  const totalCorrect = records.filter((r) => r.correct).length;

  // 날짜순 정렬 (오래된 것 먼저)
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const today = getTodayKST();

  // currentStreak: 오늘 또는 어제부터 거슬러 올라가며 연속 정답 카운트
  let currentStreak = 0;
  let checkDate = today;

  // 오늘 기록이 없으면 어제부터 확인
  const todayRecord = sorted.find((r) => r.date === today);
  if (!todayRecord) {
    // 어제로 출발점 이동
    const yesterday = new Date(today + 'T00:00:00+09:00');
    yesterday.setDate(yesterday.getDate() - 1);
    const yy = yesterday.getUTCFullYear();
    const mm = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getUTCDate()).padStart(2, '0');
    checkDate = `${yy}-${mm}-${dd}`;
  } else if (!todayRecord.correct) {
    // 오늘 틀렸으면 스트릭 0
    return { currentStreak: 0, longestStreak: calcLongest(sorted), totalSolved, totalCorrect };
  }

  // checkDate 부터 거슬러 올라가며 연속 정답 세기
  const recordMap = new Map(sorted.map((r) => [r.date, r]));
  let cursor = checkDate;
  while (true) {
    const rec = recordMap.get(cursor);
    if (!rec || !rec.correct) break;
    currentStreak++;
    // 하루 앞으로
    const prev = new Date(cursor + 'T00:00:00+09:00');
    prev.setDate(prev.getDate() - 1);
    const py = prev.getUTCFullYear();
    const pm = String(prev.getUTCMonth() + 1).padStart(2, '0');
    const pd = String(prev.getUTCDate()).padStart(2, '0');
    cursor = `${py}-${pm}-${pd}`;
  }

  return {
    currentStreak,
    longestStreak: calcLongest(sorted),
    totalSolved,
    totalCorrect,
  };
}

/** 최장 연속 정답 일수 계산 */
function calcLongest(sorted: DailyRecord[]): number {
  let longest = 0;
  let streak = 0;
  let prevDate: string | null = null;

  for (const rec of sorted) {
    if (!rec.correct) {
      streak = 0;
      prevDate = null;
      continue;
    }
    if (!prevDate) {
      streak = 1;
    } else {
      // 연속 날짜인지 확인
      const prev = new Date(prevDate + 'T00:00:00+09:00');
      prev.setDate(prev.getDate() + 1);
      const nextExpected = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}-${String(prev.getUTCDate()).padStart(2, '0')}`;
      if (rec.date === nextExpected) {
        streak++;
      } else {
        streak = 1;
      }
    }
    prevDate = rec.date;
    if (streak > longest) longest = streak;
  }
  return longest;
}

// ── 캘린더 30일 뷰 ──────────────────────────────────────────────

/**
 * 오늘 기준 최근 30일의 날짜별 상태 배열 반환
 * 인덱스 0 = 30일 전, 마지막 = 오늘
 */
export function getLast30Days(records: DailyRecord[]): CalendarDay[] {
  const today = getTodayKST();
  const days = getLast30DayStrings(today);
  const recordMap = new Map(records.map((r) => [r.date, r]));

  return days.map((date) => {
    if (date > today) return { date, status: 'future' as const };
    if (date === today) {
      const rec = recordMap.get(date);
      if (!rec) return { date, status: 'today' as const };
      return { date, status: rec.correct ? 'correct' : 'wrong' };
    }
    const rec = recordMap.get(date);
    if (!rec) return { date, status: 'missed' as const };
    return { date, status: rec.correct ? 'correct' : 'wrong' };
  });
}
