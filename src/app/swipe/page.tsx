import { getSwipeQuestions } from '@/lib/quiz/client';
import { SwipeQuiz } from './SwipeQuiz';

// 시드 고정 데이터 → 1시간 ISR 캐시. 시드 갱신 시 다음 revalidate 사이클에서 자동 반영.
export const revalidate = 3600;

export const metadata = {
  title: '슥슥 풀이 — 팜에듀',
  description: '누워서 한 손으로 무한 풀이',
};

export default async function SwipePage() {
  // 서버에서 이미 객관식·OX + choices NOT NULL 필터링됨 → 클라이언트 필터 불필요
  const tappable = await getSwipeQuestions();
  return <SwipeQuiz questions={tappable} />;
}
