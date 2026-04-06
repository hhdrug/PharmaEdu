'use client';

/**
 * ChapterQuizLink
 * ─────────────────────────────────────────────────────────────────────────────
 * 챕터 뷰어 하단에 표시되는 "이 챕터 퀴즈 풀기" 카드 컴포넌트.
 *
 * 사용처: src/app/learn/[slug]/page.tsx
 *
 * 퀴즈 URL 형식: /quiz/play?category=ch01
 *   - 쿼리 파라미터 category는 소문자 slug 형식 (예: ch01, ch03)
 *   - QuizPlayer(/quiz/play/page.tsx)의 searchParams.category 분기로 처리됨
 *   - getCategoryChapter(slug)가 DB에서 chapter 컬럼을 읽어 필터링함
 *
 * NOTE: /quiz/play?category=ch0X 파라미터 처리는 QuizPlayer 팀(타 담당) 영역.
 * 현재 구현(Phase 5~6)에서 quiz_category.chapter 컬럼(migration 003)이 적용된
 * 환경에서는 이미 동작함. 미적용 환경에서는 전체 조회로 fallback됨(QuizPlayer 내부).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { loadQuizHistory } from '@/lib/quiz/history';

interface ChapterQuizLinkProps {
  /** 'CH01' 형식의 챕터 번호 */
  chapterNumber: string;
  /** Supabase에서 조회한 해당 챕터 문제 수 */
  questionCount: number;
}

type ButtonState = 'loading' | 'no-questions' | 'done' | 'ready';

/**
 * 클라이언트 컴포넌트: localStorage에서 완료 여부를 읽어 버튼 상태를 결정한다.
 * questionCount는 서버 컴포넌트(ChapterQuizLinkServer)에서 주입.
 */
export function ChapterQuizLink({ chapterNumber, questionCount }: ChapterQuizLinkProps) {
  // chapterNumber: 'CH01' → categorySlug: 'ch01'
  const categorySlug = chapterNumber.toLowerCase();
  const quizUrl = `/quiz/play?category=${categorySlug}`;

  const [buttonState, setButtonState] = useState<ButtonState>('loading');

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (questionCount === 0) {
      setButtonState('no-questions');
      return;
    }

    // localStorage 히스토리에서 해당 챕터(category slug) 완료 여부 확인
    const history = loadQuizHistory();
    const hasCompleted = history.some((entry) => entry.category === categorySlug);
    setButtonState(hasCompleted ? 'done' : 'ready');
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [categorySlug, questionCount]);

  // 문제 없는 챕터: 눈에 띄지 않는 안내 문구만 표시
  if (buttonState === 'no-questions') {
    return (
      <p className="mt-8 text-sm text-text-muted text-center">
        이 챕터는 아직 퀴즈가 없습니다.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <Card
        variant="elevated"
        className="bg-primary-50 border border-primary-200 p-6"
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-6 h-6 text-primary-500 shrink-0" aria-hidden="true" />
          <span className="text-lg font-semibold text-primary-700">
            이 챕터 퀴즈 풀기
          </span>
        </div>

        {/* 부제 */}
        <p className="text-sm text-text-secondary mt-1 mb-4">
          {buttonState === 'loading' ? (
            <span className="inline-block h-4 w-32 bg-primary-100 rounded animate-pulse" />
          ) : (
            <>
              <span className="font-medium text-primary-600">{questionCount}문제</span>
              가 준비되어 있습니다
            </>
          )}
        </p>

        {/* 버튼 */}
        {buttonState === 'loading' ? (
          <div className="h-[52px] w-full rounded-lg bg-primary-100 animate-pulse" />
        ) : buttonState === 'done' ? (
          <Link href={quizUrl} className="block">
            <Button variant="secondary" size="lg" className="w-full">
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
              다시 풀기
            </Button>
          </Link>
        ) : (
          <Link href={quizUrl} className="block">
            <Button variant="primary" size="lg" className="w-full">
              퀴즈 풀기
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
