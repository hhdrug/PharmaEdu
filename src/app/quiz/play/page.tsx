import { getQuestions, getRandomQuestions, getDailyQuestion, getCategoryChapter } from '@/lib/quiz/client';
import type { QuizQuestion } from '@/lib/quiz/types';
import { QuizPlayer } from './QuizPlayer';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function loadQuestions(searchParams: Awaited<PageProps['searchParams']>): Promise<QuizQuestion[]> {
  // 오늘의 1문제
  if (searchParams.daily) {
    const q = await getDailyQuestion();
    return q ? [q] : [];
  }

  // 무작위 N문제
  if (searchParams.random) {
    const n = parseInt(String(searchParams.random), 10);
    return getRandomQuestions(isNaN(n) ? 5 : n);
  }

  // 카테고리별 — DB-driven slug → chapter 매핑 (하드코딩 제거)
  if (searchParams.category) {
    const slug = String(searchParams.category);
    const chapter = await getCategoryChapter(slug);
    if (chapter) {
      return getQuestions({ chapter, limit: 10 });
    }
    // chapter 컬럼이 아직 없는 환경(migration 미적용)에서는 전체 조회로 fallback
    return getQuestions({ limit: 10 });
  }

  // 챕터 직접 필터 (Phase 4B: 레슨 → 퀴즈 추천 링크에서 사용)
  if (searchParams.chapter) {
    const chapter = String(searchParams.chapter);
    return getQuestions({ chapter, limit: 10 });
  }

  // 기본: 무작위 5문제
  return getRandomQuestions(5);
}

export default async function QuizPlayPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const questions = await loadQuestions(params);

  const title =
    params.daily
      ? '오늘의 1문제'
      : params.random
      ? `무작위 ${params.random}문제`
      : params.category
      ? '카테고리 퀴즈'
      : params.chapter
      ? `${params.chapter} 관련 퀴즈`
      : '무작위 퀴즈';

  const category = params.daily
    ? 'daily'
    : params.random
    ? `random-${params.random}`
    : params.category
    ? String(params.category)
    : params.chapter
    ? `chapter-${params.chapter}`
    : 'random';

  return <QuizPlayer questions={questions} title={title} category={category} />;
}
