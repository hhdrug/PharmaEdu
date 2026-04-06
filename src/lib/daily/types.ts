// ── Daily Challenge 도메인 타입 정의 ─────────────────────────────

/** 하루 1문제 풀기 기록 */
export type DailyRecord = {
  date: string;        // 'YYYY-MM-DD' (KST 기준)
  questionId: number;
  correct: boolean;
  answeredAt: number;  // Unix timestamp (ms)
};

/** 통합 스탯 */
export type DailyStats = {
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  totalCorrect: number;
};

/** 캘린더 30일 그리드에서 날짜별 상태 */
export type DayStatus = 'correct' | 'wrong' | 'missed' | 'today' | 'future';

export type CalendarDay = {
  date: string;        // 'YYYY-MM-DD'
  status: DayStatus;
};
