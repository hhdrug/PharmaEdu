import Link from 'next/link';
import { HelpCircle, Shuffle, Star, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getCategories, getDailyQuestion, getQuestionCount } from '@/lib/quiz/client';
import { DIFFICULTY_LABEL, DIFFICULTY_VARIANT } from '@/lib/quiz/types';
import { QuizHistoryWidget } from './QuizHistoryWidget';

export const dynamic = 'force-dynamic';

export default async function QuizHomePage() {
  const [categories, dailyQuestion, totalCount] = await Promise.all([
    getCategories(),
    getDailyQuestion(),
    getQuestionCount(),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ── 헤더 ── */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-warning-100 flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-warning-500" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-text-primary">퀴즈</h1>
        <p className="text-text-secondary text-sm">
          약제비 계산 규칙을 문제로 풀어보세요. 총{' '}
          <span className="font-semibold text-primary-500">{totalCount}문제</span>가 있습니다.
        </p>
      </div>

      {/* ── 오늘의 1문제 티저 ── */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-warning-500" aria-hidden="true" />
          오늘의 1문제
        </h2>
        {dailyQuestion ? (
          <Link
            href={`/quiz/play?daily=1`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl"
          >
            <Card
              variant="elevated"
              className="flex items-start gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="warning">{dailyQuestion.chapter}</Badge>
                  <Badge variant={DIFFICULTY_VARIANT[dailyQuestion.difficulty]}>
                    {DIFFICULTY_LABEL[dailyQuestion.difficulty]}
                  </Badge>
                </div>
                <p className="text-sm text-text-primary line-clamp-2">
                  {dailyQuestion.question}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" aria-hidden="true" />
            </Card>
          </Link>
        ) : (
          <Card variant="outlined" className="text-center py-8">
            <p className="text-text-muted text-sm">문제를 불러올 수 없습니다.</p>
          </Card>
        )}
      </section>

      {/* ── 무작위 5문제 ── */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-primary-500" aria-hidden="true" />
          빠른 퀴즈
        </h2>
        <Card variant="standard" className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-text-primary">무작위 5문제 풀기</p>
            <p className="text-sm text-text-secondary mt-0.5">
              카테고리 관계없이 무작위로 5문제를 출제합니다.
            </p>
          </div>
          <Link href="/quiz/play?random=5">
            <Button variant="primary" size="md">
              <Shuffle className="w-4 h-4" aria-hidden="true" />
              바로 시작
            </Button>
          </Link>
        </Card>
      </section>

      {/* ── 최근 퀴즈 기록 ── */}
      <QuizHistoryWidget />

      {/* ── 카테고리별 퀴즈 ── */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">카테고리별 퀴즈</h2>
        {categories.length === 0 ? (
          <Card variant="outlined" className="text-center py-10">
            <p className="text-text-muted text-sm">카테고리를 불러올 수 없습니다.</p>
            <p className="text-text-muted text-xs mt-1">
              Supabase SQL Editor에서 seed_quiz.sql을 실행해주세요.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/quiz/play?category=${cat.slug}`}
                className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl"
              >
                <Card
                  variant="elevated"
                  className="flex items-center gap-4 cursor-pointer group-hover:-translate-y-0.5 transition-transform h-full"
                >
                  {cat.icon && (
                    <span className="text-2xl flex-shrink-0" aria-hidden="true">
                      {cat.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" aria-hidden="true" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
