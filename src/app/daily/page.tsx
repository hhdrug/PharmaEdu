import Link from 'next/link';
import { CalendarDays, ChevronRight, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getDailyQuestion } from '@/lib/quiz/client';
import { DIFFICULTY_LABEL, DIFFICULTY_VARIANT } from '@/lib/quiz/types';
import { StreakCounter } from '@/components/daily/StreakCounter';
import { CalendarHeatmap } from '@/components/daily/CalendarHeatmap';
import { DailyStatsCard } from '@/components/daily/DailyStatsCard';
import { DailyAlreadySolvedBanner } from './DailyAlreadySolvedBanner';

export const dynamic = 'force-dynamic';

export default async function DailyPage() {
  const question = await getDailyQuestion();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* ── 헤더 ── */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-warning-100 flex items-center justify-center">
            <CalendarDays className="w-7 h-7 text-warning-500" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-text-primary">매일 1문제</h1>
        <p className="text-text-secondary text-sm">
          하루 1문제씩 꾸준히 풀어보세요. 스트릭을 이어가면 실력이 쌓입니다.
        </p>
        {/* 클라이언트 아일랜드 — 스트릭 카운터 */}
        <div className="flex justify-center pt-1">
          <StreakCounter />
        </div>
      </div>

      {/* ── 오늘의 문제 이미 풀었는지 확인 배너 (클라이언트) ── */}
      <DailyAlreadySolvedBanner />

      {/* ── 오늘의 문제 CTA 카드 ── */}
      <Card variant="elevated" className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-warning-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-text-secondary">오늘의 문제 미리보기</span>
        </div>

        {question ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="warning">{question.chapter}</Badge>
              <Badge variant={DIFFICULTY_VARIANT[question.difficulty]}>
                {DIFFICULTY_LABEL[question.difficulty]}
              </Badge>
            </div>
            <p className="text-text-primary font-medium leading-relaxed line-clamp-3">
              {question.question}
            </p>
          </>
        ) : (
          <p className="text-text-muted text-sm">문제를 불러올 수 없습니다.</p>
        )}

        <Link href="/daily/play" className="block">
          <Button variant="primary" size="lg" className="w-full" disabled={!question}>
            오늘의 문제 풀기
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </Button>
        </Link>
      </Card>

      {/* ── 통계 카드 (클라이언트) ── */}
      <DailyStatsCard />

      {/* ── 30일 캘린더 (클라이언트) ── */}
      <section>
        <h2 className="text-base font-semibold text-text-primary mb-3">최근 30일 기록</h2>
        <Card variant="standard">
          <CalendarHeatmap />
        </Card>
      </section>
    </div>
  );
}
