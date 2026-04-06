// ── 퀴즈 히스토리 (localStorage 기반) ─────────────────────────
// 'use client' 컴포넌트에서만 import 가능 (브라우저 전용)

export interface QuizHistoryEntry {
  id: string;           // crypto.randomUUID() 또는 타임스탬프 문자열
  category: string;     // 'random' | 'daily' | category slug
  categoryLabel: string; // 표시용 레이블 (예: '무작위 5문제', '오늘의 1문제', '기본 계산')
  score: number;
  total: number;
  pct: number;          // Math.round(score/total*100)
  timestamp: number;    // Date.now()
}

const STORAGE_KEY = 'pharmaEdu_quizHistory';
const MAX_ENTRIES = 20;

/** localStorage에서 히스토리 목록을 불러옴 */
export function loadQuizHistory(): QuizHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QuizHistoryEntry[];
  } catch {
    return [];
  }
}

/** 새 결과를 히스토리에 저장 (최대 MAX_ENTRIES개 유지, 최신순) */
export function saveQuizHistory(entry: Omit<QuizHistoryEntry, 'id' | 'pct'>): void {
  if (typeof window === 'undefined') return;
  const existing = loadQuizHistory();
  const newEntry: QuizHistoryEntry = {
    ...entry,
    id: String(Date.now()),
    pct: Math.round((entry.score / entry.total) * 100),
  };
  const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage 쓰기 실패 시 무시 (용량 초과 등)
  }
}

/** 히스토리 전체 삭제 */
export function clearQuizHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/** 최근 N개 히스토리 반환 */
export function getRecentHistory(n: number = 5): QuizHistoryEntry[] {
  return loadQuizHistory().slice(0, n);
}

/** 타임스탬프를 '방금 전', 'N분 전', 'N시간 전', 'N일 전' 형식으로 변환 */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60_000);
  const hour = Math.floor(diff / 3_600_000);
  const day = Math.floor(diff / 86_400_000);

  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  if (hour < 24) return `${hour}시간 전`;
  return `${day}일 전`;
}
