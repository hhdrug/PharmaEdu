'use client';

import { useEffect, useState } from 'react';
import { Flame, Trophy, BookOpen, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getDailyRecords, calculateStats } from '@/lib/daily/storage';
import type { DailyStats } from '@/lib/daily/types';

interface DailyStatsCardProps {
  className?: string;
}

const EMPTY_STATS: DailyStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalSolved: 0,
  totalCorrect: 0,
};

export function DailyStatsCard({ className = '' }: DailyStatsCardProps) {
  const [stats, setStats] = useState<DailyStats>(EMPTY_STATS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const records = getDailyRecords();
    // localStorage는 SSR에서 접근 불가, effect 내에서 초기화
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(calculateStats(records));
    setMounted(true);
  }, []);

  const correctRate =
    stats.totalSolved > 0
      ? Math.round((stats.totalCorrect / stats.totalSolved) * 100)
      : 0;

  const items = [
    {
      icon: <Flame className="w-5 h-5 text-warning-500" aria-hidden="true" />,
      label: '현재 스트릭',
      value: `${stats.currentStreak}일`,
    },
    {
      icon: <Trophy className="w-5 h-5 text-primary-500" aria-hidden="true" />,
      label: '최장 스트릭',
      value: `${stats.longestStreak}일`,
    },
    {
      icon: <BookOpen className="w-5 h-5 text-info-500" aria-hidden="true" />,
      label: '총 풀이',
      value: `${stats.totalSolved}문제`,
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-success-500" aria-hidden="true" />,
      label: '정답률',
      value: `${correctRate}%`,
    },
  ];

  return (
    <Card variant="standard" className={className}>
      <h3 className="text-sm font-semibold text-text-secondary mb-4">내 학습 통계</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1 text-center">
            {item.icon}
            {!mounted ? (
              <div className="w-12 h-6 rounded bg-neutral-200 animate-pulse" />
            ) : (
              <span className="text-xl font-bold text-text-primary tabular-nums">
                {item.value}
              </span>
            )}
            <span className="text-xs text-text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
