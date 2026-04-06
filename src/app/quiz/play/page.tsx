import { getQuestions, getRandomQuestions, getDailyQuestion } from '@/lib/quiz/client';
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

  // 카테고리별 (slug → chapter 매핑)
  if (searchParams.category) {
    const categorySlugToChapter: Record<string, string> = {
      'basic-calc': 'CH01',
      'copayment': 'CH05',
      'rounding': 'CH07',
      'insu-type': 'CH05',
      'special-case': 'CH05',
    };
    const chapter = categorySlugToChapter[String(searchParams.category)];
    if (chapter) {
      return getQuestions({ chapter, limit: 10 });
    }
    // 전체 조회 fallback
    return getQuestions({ limit: 10 });
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
      : '무작위 퀴즈';

  return <QuizPlayer questions={questions} title={title} />;
}
