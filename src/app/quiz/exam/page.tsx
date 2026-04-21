import { getRandomQuestions } from '@/lib/quiz/client';
import type { QuizQuestion } from '@/lib/quiz/types';
import { ExamRunner } from './ExamRunner';

export const dynamic = 'force-dynamic';

/**
 * /quiz/exam — 모의고사 시험 모드
 * 50문 × 60분 타이머. 중도 나가기 경고, 자동 제출, 결과 분석.
 *
 * URL params:
 *   ?count=50           (기본 50, 10~100)
 *   ?minutes=60         (기본 60)
 */

interface PageProps {
  searchParams: Promise<{ count?: string; minutes?: string }>;
}

export default async function ExamPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const count = Math.min(100, Math.max(10, parseInt(String(params.count ?? '50'), 10) || 50));
  const minutes = Math.min(180, Math.max(5, parseInt(String(params.minutes ?? '60'), 10) || 60));

  const questions: QuizQuestion[] = await getRandomQuestions(count);

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-xl font-bold text-text-primary">시험 모드</h1>
        <p className="text-text-secondary">
          아직 DB 에 문제가 없습니다. 관리자 페이지에서 문제를 추가하거나 seed 를 실행해주세요.
        </p>
      </div>
    );
  }

  return <ExamRunner questions={questions} totalMinutes={minutes} />;
}
