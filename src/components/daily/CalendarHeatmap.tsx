'use client';

import { useEffect, useState } from 'react';
import { getDailyRecords, getLast30Days } from '@/lib/daily/storage';
import { formatDateKo } from '@/lib/daily/date';
import type { CalendarDay, DayStatus } from '@/lib/daily/types';

const STATUS_CLASSES: Record<DayStatus, string> = {
  correct:
    'bg-success-500 border-success-500',
  wrong:
    'bg-error-500 border-error-500',
  missed:
    'bg-neutral-100 border-neutral-200',
  today:
    'bg-primary-100 border-primary-500 ring-2 ring-primary-300 ring-offset-1',
  future:
    'bg-neutral-50 border-neutral-100 opacity-40',
};

const STATUS_LABEL: Record<DayStatus, string> = {
  correct: '정답',
  wrong: '오답',
  missed: '미응시',
  today: '오늘 (미응시)',
  future: '-',
};

interface CalendarHeatmapProps {
  className?: string;
}

export function CalendarHeatmap({ className = '' }: CalendarHeatmapProps) {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const records = getDailyRecords();
    // localStorage는 SSR에서 접근 불가, effect 내에서 초기화
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(getLast30Days(records));
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={['grid grid-cols-7 gap-1.5', className].join(' ')}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded bg-neutral-200 animate-pulse" />
        ))}
      </div>
    );
  }

  // 30일을 7열 그리드로 배치 — 첫 셀의 요일 앞쪽에 빈 칸 삽입
  // days[0]의 요일(0=일, 1=월, ..., 6=토)
  const firstDay = days[0];
  const firstDayOfWeek = firstDay
    ? new Date(firstDay.date + 'T00:00:00+09:00').getDay()
    : 0;

  const emptyCells = Array.from({ length: firstDayOfWeek });

  return (
    <div className={className}>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <div key={d} className="text-center text-xs text-text-muted font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1.5">
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day.date}
            title={`${formatDateKo(day.date)} — ${STATUS_LABEL[day.status]}`}
            aria-label={`${formatDateKo(day.date)}: ${STATUS_LABEL[day.status]}`}
            className={[
              'w-8 h-8 rounded border transition-transform hover:scale-110',
              STATUS_CLASSES[day.status],
            ].join(' ')}
          />
        ))}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-3 mt-3 text-xs text-text-muted flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-success-500 inline-block" />
          정답
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-error-500 inline-block" />
          오답
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-neutral-100 border border-neutral-200 inline-block" />
          미응시
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-primary-100 border border-primary-500 inline-block" />
          오늘
        </span>
      </div>
    </div>
  );
}
