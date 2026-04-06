'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { getTodayRecord } from '@/lib/daily/storage';
import type { DailyRecord } from '@/lib/daily/types';

export function DailyAlreadySolvedBanner() {
  const [record, setRecord] = useState<DailyRecord | null | undefined>(undefined);

  useEffect(() => {
    // localStorage 읽기 후 state 초기화 — SSR 환경에서는 접근 불가하므로 effect 내에서 처리
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecord(getTodayRecord());
  }, []);

  // 마운트 전 또는 오늘 기록 없음
  if (record === undefined || record === null) return null;

  if (record.correct) {
    return (
      <div
        role="status"
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-success-100 border border-success-500"
      >
        <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-success-500">오늘 문제를 이미 맞혔어요!</p>
          <p className="text-xs text-text-secondary mt-0.5">내일 또 새로운 문제가 기다립니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-error-100 border border-error-500"
    >
      <XCircle className="w-5 h-5 text-error-500 flex-shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-error-500">오늘 문제에 오답했어요.</p>
        <p className="text-xs text-text-secondary mt-0.5">다시 풀기는 내일부터 가능합니다.</p>
      </div>
    </div>
  );
}
