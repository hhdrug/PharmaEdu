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
}

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
  if (idx !== -1) {
    // 기존 항목 갱신
    entries[idx] = entry;
  } else {
    // 신규 항목을 앞에 삽입하고 최대치 초과 제거
    entries.unshift(entry);
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
