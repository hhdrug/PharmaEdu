'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getDailyRecords, calculateStats } from '@/lib/daily/storage';

interface StreakCounterProps {
  className?: string;
}

export function StreakCounter({ className = '' }: StreakCounterProps) {
  const [streak, setStreak] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const records = getDailyRecords();
    const stats = calculateStats(records);
    // localStorage는 SSR에서 접근 불가, effect 내에서 초기화
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(stats.currentStreak);
    setMounted(true);
  }, []);

  if (!mounted) {
    // SSR/hydration 불일치 방지 — 마운트 전 스켈레톤
    return (
      <div className={['flex items-center gap-2', className].join(' ')}>
        <div className="w-6 h-6 rounded bg-neutral-200 animate-pulse" />
        <div className="w-16 h-6 rounded bg-neutral-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={['flex items-center gap-2', className].join(' ')}
      role="status"
      aria-label={`현재 스트릭: ${streak}일 연속`}
    >
      <Flame
        className={streak > 0 ? 'w-6 h-6 text-warning-500' : 'w-6 h-6 text-neutral-300'}
        aria-label="스트릭 불꽃"
      />
      <span className="text-2xl font-extrabold text-text-primary tabular-nums">
        {streak}
      </span>
      <span className="text-sm text-text-secondary">일 연속</span>
    </div>
  );
}
