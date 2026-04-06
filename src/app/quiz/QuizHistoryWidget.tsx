'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Trophy, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getRecentHistory,
  clearQuizHistory,
  formatRelativeTime,
  type QuizHistoryEntry,
} from '@/lib/quiz/history';

/** 최근 퀴즈 히스토리 위젯 (localStorage 기반) */
export function QuizHistoryWidget() {
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // localStorage는 SSR에서 접근 불가, effect 내에서 초기화
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setHistory(getRecentHistory(5));
  }, []);

  const handleClear = () => {
    clearQuizHistory();
    setHistory([]);
  };

  // SSR에서는 렌더링 안 함 (localStorage 접근 불가)
  if (!mounted || history.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
        <History className="w-5 h-5 text-primary-500" aria-hidden="true" />
        최근 퀴즈 기록
      </h2>
      <Card variant="standard" className="divide-y divide-border-light">
        {history.map((entry) => {
          const resultVariant =
            entry.pct >= 80 ? 'success' : entry.pct >= 50 ? 'warning' : 'error';

          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Trophy
                className={`w-4 h-4 flex-shrink-0 ${
                  entry.pct >= 80
                    ? 'text-success-500'
                    : entry.pct >= 50
                    ? 'text-warning-500'
                    : 'text-error-500'
                }`}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {entry.categoryLabel}
                </p>
                <p className="text-xs text-text-muted">
                  {formatRelativeTime(entry.timestamp)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-text-primary">
                  {entry.score}/{entry.total}
                </span>
                <Badge variant={resultVariant} className="text-xs px-2 py-0.5 h-auto">
                  {entry.pct}%
                </Badge>
              </div>
            </div>
          );
        })}
      </Card>
      <div className="mt-2 flex justify-between items-center">
        <Link
          href="/quiz/play?random=5"
          className="text-xs text-primary-500 hover:underline"
        >
          빠른 퀴즈 바로 풀기
        </Link>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-error-500 transition-colors"
          aria-label="퀴즈 기록 삭제"
        >
          <RotateCcw className="w-3 h-3" />
          기록 삭제
        </button>
      </div>
    </section>
  );
}
