import { getAllQuestions } from '@/lib/quiz/client';
import { SwipeQuiz } from './SwipeQuiz';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '슥슥 풀이 — 팜에듀',
  description: '누워서 한 손으로 무한 풀이',
};

export default async function SwipePage() {
  const all = await getAllQuestions();
  // 탭만으로 풀 수 있는 객관식/OX만 필터링 (숫자 입력 제외)
  const tappable = all.filter(
    (q) =>
      (q.question_type === 'multiple_choice' || q.question_type === 'true_false') &&
      Array.isArray(q.choices) &&
      q.choices.length > 0
  );

  return <SwipeQuiz questions={tappable} />;
}
