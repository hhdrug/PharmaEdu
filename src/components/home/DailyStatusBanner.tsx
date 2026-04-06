'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Flame, CheckCircle2 } from 'lucide-react';
import { getTodayRecord, getDailyRecords, calculateStats } from '@/lib/daily/storage';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type BannerState = {
  hasToday: boolean;
  todayCorrect: boolean;
  streak: number;
} | null;

export function DailyStatusBanner() {
  // null = SSR/하이드레이션 전, non-null = 클라이언트 마운트 후
  const [bannerState, setBannerState] = useState<BannerState>(null);

  useEffect(() => {
    const todayRecord = getTodayRecord();
    const records = getDailyRecords();
    /* eslint-disable react-hooks/set-state-in-effect */
    setBannerState({
      hasToday: !!todayRecord,
      todayCorrect: todayRecord?.correct ?? false,
      streak: calculateStats(records).currentStreak,
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (bannerState === null) return null;

  const { hasToday, todayCorrect, streak } = bannerState;

  if (!hasToday) {
    return (
      <Card
        variant="elevated"
        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary-500" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm sm:text-base">
              오늘의 문제가 기다리고 있어요!
            </p>
            {streak > 0 && (
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" aria-hidden="true" />
                현재 {streak}일 연속 학습 중
              </p>
            )}
          </div>
        </div>
        <Link href="/daily">
          <Button size="sm" variant="primary">
            시작하기
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-success-50 to-emerald-50 border-success-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-success-500" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-text-primary text-sm sm:text-base">
            {todayCorrect ? '오늘 완료! 내일 또 만나요 🎉' : '오늘 도전 완료! 내일 다시 도전해봐요'}
          </p>
          {streak > 0 && (
            <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" aria-hidden="true" />
              {streak}일 연속 학습 달성
            </p>
          )}
        </div>
      </div>
      <Link href="/daily">
        <Button size="sm" variant="secondary">
          결과 보기
        </Button>
      </Link>
    </Card>
  );
}
