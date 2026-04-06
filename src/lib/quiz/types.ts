// ── 퀴즈 도메인 타입 정의 ─────────────────────────────────────

export type QuestionType = 'multiple_choice' | 'numeric' | 'true_false';

export interface QuizQuestion {
  id: number;
  chapter: string;           // 'CH01', 'CH05' 등
  difficulty: 1 | 2 | 3;    // 1=쉬움, 2=보통, 3=어려움
  question_type: QuestionType;
  question: string;
  choices: string[] | null;  // MC/true_false: string[], numeric: null
  correct_answer: string;    // MC: "0"~"3" (0-indexed), numeric: 숫자 문자열
  explanation: string;
  tags: string[] | null;
  created_at: string;
}

export interface QuizCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  order_idx: number;
}

/** 사용자 답변 결과 */
export interface QuizAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
}

/** 퀴즈 세션 상태 */
export interface QuizSession {
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  currentIndex: number;
  isFinished: boolean;
}

/** 난이도 레이블 */
export const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = {
  1: '쉬움',
  2: '보통',
  3: '어려움',
};

/** 난이도 뱃지 variant */
export const DIFFICULTY_VARIANT: Record<1 | 2 | 3, 'success' | 'warning' | 'error'> = {
  1: 'success',
  2: 'warning',
  3: 'error',
};
