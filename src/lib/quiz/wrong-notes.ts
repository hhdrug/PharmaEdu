/**
 * Wrong Answer Notebook storage.
 *
 * INTEGRATION NOTE:
 * In QuizPlayer.tsx, after user submits an answer:
 *
 *   if (userAnswer !== correctAnswer) {
 *     addWrongAnswer({
 *       questionId: question.id,
 *       question: question.question,
 *       correctAnswer: question.correct_answer,
 *       userAnswer: answer,
 *       explanation: question.explanation ?? '',
 *       chapter: question.chapter,
 *       difficulty: question.difficulty,
 *       timestamp: Date.now(),
 *       attempts: existingEntry ? existingEntry.attempts + 1 : 1,
 *       resolved: false,
 *     });
 *   }
 *
 * When user answers correctly on a retry, call markResolved(questionId).
 *
 * To get the existing entry before overwriting (for attempts count):
 *   const existing = getWrongAnswers().find(e => e.questionId === question.id);
 */

// ── 타입 정의 ─────────────────────────────────────────────────

export interface WrongAnswerEntry {
  questionId: number;
  question: string;       // snapshot
  correctAnswer: string;
  userAnswer: string;
  explanation: string;
  chapter: string;
  difficulty: 1 | 2 | 3;
  timestamp: number;
  attempts: number;       // how many times tried
  resolved: boolean;      // after getting it right
  // ── SM-2 Lite 간격 반복 (optional, 기존 데이터 호환) ───────────
  /** 다음 복습 예정 (Unix ms). 지나면 due. */
  nextReviewAt?: number;
  /** 현재 복습 간격 (일 단위). 초기값 1. */
  interval?: number;
  /** 난이도 계수 (1.3 ~ 2.5). 초기값 2.5. */
  easiness?: number;
  /** 복습 횟수. */
  reviewCount?: number;
}

/** SM-2 Lite 품질 등급 */
export type ReviewQuality = 'again' | 'hard' | 'good' | 'easy';

// ── 상수 ─────────────────────────────────────────────────────

const STORAGE_KEY = 'pharmaedu_wrong_notes';
const MAX_ENTRIES = 200;

// ── 내부 유틸 ─────────────────────────────────────────────────

function readFromStorage(): WrongAnswerEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as WrongAnswerEntry[];
  } catch {
    return [];
  }
}

function writeToStorage(entries: WrongAnswerEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage 쓰기 실패 시 무시 (용량 초과 등)
  }
}

// ── Public API ────────────────────────────────────────────────

/**
 * 오답을 추가하거나 기존 항목을 갱신한다.
 * 동일 questionId가 존재하면 덮어쓰고, 없으면 최신순 앞에 추가한다.
 * 최대 MAX_ENTRIES(200)개를 유지한다.
 */
export function addWrongAnswer(entry: WrongAnswerEntry): void {
  const entries = readFromStorage();
  const idx = entries.findIndex((e) => e.questionId === entry.questionId);
  const DAY = 24 * 60 * 60 * 1000;
  if (idx !== -1) {
    // 기존 항목 갱신 — SM-2 필드는 보존
    const prev = entries[idx];
    entries[idx] = {
      ...entry,
      nextReviewAt: prev.nextReviewAt ?? Date.now() + DAY,
      interval: prev.interval ?? 1,
      easiness: prev.easiness ?? 2.5,
      reviewCount: prev.reviewCount ?? 0,
    };
  } else {
    // 신규 항목 — 내일 복습 예정으로 초기화
    entries.unshift({
      ...entry,
      nextReviewAt: Date.now() + DAY,
      interval: 1,
      easiness: 2.5,
      reviewCount: 0,
    });
    if (entries.length > MAX_ENTRIES) {
      entries.splice(MAX_ENTRIES);
    }
  }
  writeToStorage(entries);
}

/** 전체 오답 목록을 반환한다 (최신순). */
export function getWrongAnswers(): WrongAnswerEntry[] {
  return readFromStorage();
}

/** 아직 해결되지 않은 오답만 반환한다. */
export function getUnresolvedWrongAnswers(): WrongAnswerEntry[] {
  return readFromStorage().filter((e) => !e.resolved);
}

/** 특정 문제를 해결 완료로 표시한다. */
export function markResolved(questionId: number): void {
  const entries = readFromStorage();
  const idx = entries.findIndex((e) => e.questionId === questionId);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], resolved: true };
    writeToStorage(entries);
  }
}

/** 특정 오답 항목을 삭제한다. */
export function deleteWrongAnswer(questionId: number): void {
  const entries = readFromStorage().filter((e) => e.questionId !== questionId);
  writeToStorage(entries);
}

/** 오답 노트 전체를 초기화한다. */
export function clearWrongAnswers(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ── 필터 헬퍼 ─────────────────────────────────────────────────

/** 특정 챕터의 오답만 반환한다. */
export function filterByChapter(chapter: string): WrongAnswerEntry[] {
  return readFromStorage().filter((e) => e.chapter === chapter);
}

/** 주어진 시간 범위(Unix ms)의 오답만 반환한다. */
export function filterByDateRange(start: number, end: number): WrongAnswerEntry[] {
  return readFromStorage().filter(
    (e) => e.timestamp >= start && e.timestamp <= end,
  );
}

// ── SM-2 Lite 간격 반복 ───────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 복습 결과를 기록하고 다음 복습일을 산정한다.
 * - again: 간격 1일 리셋, easiness -0.2
 * - hard:  간격 × 1.3, easiness -0.15
 * - good:  간격 × easiness
 * - easy:  간격 × easiness × 1.3, easiness +0.15
 */
export function scheduleReview(
  questionId: number,
  quality: ReviewQuality,
): void {
  const entries = readFromStorage();
  const idx = entries.findIndex((e) => e.questionId === questionId);
  if (idx === -1) return;

  const e = entries[idx];
  const prevInterval = e.interval ?? 1;
  const prevEase = e.easiness ?? 2.5;
  const prevCount = e.reviewCount ?? 0;

  let interval = prevInterval;
  let easiness = prevEase;

  switch (quality) {
    case 'again':
      interval = 1;
      easiness = Math.max(1.3, prevEase - 0.2);
      break;
    case 'hard':
      interval = Math.max(1, Math.round(prevInterval * 1.3));
      easiness = Math.max(1.3, prevEase - 0.15);
      break;
    case 'good':
      interval = Math.max(1, Math.round(prevInterval * prevEase));
      break;
    case 'easy':
      interval = Math.max(1, Math.round(prevInterval * prevEase * 1.3));
      easiness = Math.min(3.0, prevEase + 0.15);
      break;
  }

  entries[idx] = {
    ...e,
    interval,
    easiness,
    reviewCount: prevCount + 1,
    nextReviewAt: Date.now() + interval * DAY_MS,
    resolved: quality === 'easy' || quality === 'good' ? true : false,
  };
  writeToStorage(entries);
}

/** 지금 시각 기준 복습 예정 항목(미해결 + due)만 반환한다. */
export function getDueForReview(now: number = Date.now()): WrongAnswerEntry[] {
  return readFromStorage().filter(
    (e) => (e.nextReviewAt ?? 0) <= now,
  );
}

/** 오늘(24시간 이내) 복습해야 할 건수. */
export function getDueCount(now: number = Date.now()): number {
  return getDueForReview(now).length;
}
