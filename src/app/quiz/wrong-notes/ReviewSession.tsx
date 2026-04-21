'use client';

/**
 * ReviewSession — SM-2 Lite 간격 반복 복습 세션
 *
 * 흐름:
 *   1. due 항목들을 순서대로 1장씩 플래시카드 스타일로 표시
 *   2. 사용자가 먼저 문제를 읽고 답을 떠올린 뒤 "정답 공개" 클릭
 *   3. 내 답 vs 정답 + 해설이 노출됨
 *   4. Again / Hard / Good / Easy 4단계 평가 → scheduleReview() 호출
 *   5. 다음 카드로 자동 이동. 모두 끝나면 요약 화면.
 */

import { useState, useMemo } from 'react';
import {
  Eye, CheckCircle, XCircle, ArrowRight, RotateCcw, Home, Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  scheduleReview,
  type WrongAnswerEntry,
  type ReviewQuality,
} from '@/lib/quiz/wrong-notes';
import { DIFFICULTY_LABEL, DIFFICULTY_VARIANT } from '@/lib/quiz/types';

interface Props {
  queue: WrongAnswerEntry[];
  onExit: () => void;
}

interface SessionStat {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

const QUALITY_META: Record<ReviewQuality, {
  label: string;
  hint: string;
  className: string;
}> = {
  again: {
    label: '다시',
    hint: '틀렸거나 전혀 기억 안남',
    className: 'bg-error-500 hover:bg-error-600 text-white',
  },
  hard: {
    label: '어려움',
    hint: '겨우 맞춤',
    className: 'bg-warning-500 hover:bg-warning-600 text-white',
  },
  good: {
    label: '좋음',
    hint: '한 번 생각하고 맞춤',
    className: 'bg-info-500 hover:bg-info-600 text-white',
  },
  easy: {
    label: '쉬움',
    hint: '즉시 기억남',
    className: 'bg-success-500 hover:bg-success-600 text-white',
  },
};

export function ReviewSession({ queue, onExit }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stat, setStat] = useState<SessionStat>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [finished, setFinished] = useState(queue.length === 0);

  const current = queue[currentIdx];
  const totalCards = queue.length;
  const progressPct = useMemo(
    () => (totalCards === 0 ? 0 : Math.round((currentIdx / totalCards) * 100)),
    [currentIdx, totalCards],
  );

  function rate(quality: ReviewQuality) {
    if (!current) return;
    scheduleReview(current.questionId, quality);
    setStat((s) => ({ ...s, [quality]: s[quality] + 1 }));
    if (currentIdx + 1 >= totalCards) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setRevealed(false);
    }
  }

  // ── 빈 큐 / 완료 화면 ────────────────────────────────────────
  if (finished || !current) {
    return (
      <Card variant="standard" className="space-y-4 text-center py-10">
        <Sparkles className="w-12 h-12 text-primary-500 mx-auto" aria-hidden="true" />
        <h2 className="text-xl font-bold text-text-primary">복습 완료!</h2>
        {totalCards === 0 ? (
          <p className="text-text-secondary">오늘 복습할 문제가 없습니다. 완벽!</p>
        ) : (
          <>
            <p className="text-text-secondary">
              총 <strong>{totalCards}</strong> 장 복습. 잘 하셨어요!
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <Badge variant="error">다시 {stat.again}</Badge>
              <Badge variant="warning">어려움 {stat.hard}</Badge>
              <Badge variant="info">좋음 {stat.good}</Badge>
              <Badge variant="success">쉬움 {stat.easy}</Badge>
            </div>
          </>
        )}
        <Button variant="primary" onClick={onExit}>
          <Home className="w-4 h-4" />
          오답 목록으로
        </Button>
      </Card>
    );
  }

  // ── 카드 화면 ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* 진도 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted whitespace-nowrap">
          {currentIdx + 1} / {totalCards}
        </span>
        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          나가기
        </Button>
      </div>

      {/* 카드 */}
      <Card variant="standard" className="space-y-4 min-h-[320px]">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="primary">{current.chapter}</Badge>
          <Badge variant={DIFFICULTY_VARIANT[current.difficulty]}>
            {DIFFICULTY_LABEL[current.difficulty]}
          </Badge>
          {(current.reviewCount ?? 0) > 0 && (
            <Badge variant="info">{current.reviewCount}회 복습</Badge>
          )}
        </div>

        <p className="text-base text-text-primary font-medium leading-relaxed whitespace-pre-wrap">
          {current.question}
        </p>

        {!revealed ? (
          <div className="pt-4 text-center">
            <Button variant="primary" onClick={() => setRevealed(true)}>
              <Eye className="w-4 h-4" />
              정답 공개
            </Button>
            <p className="text-xs text-text-muted mt-2">
              먼저 머릿속으로 답을 떠올려보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-2 border-t border-border-light">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-error-500" />
                <span className="text-text-muted">지난 내 답:</span>
                <span className="text-error-500 font-medium">{current.userAnswer || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span className="text-text-muted">정답:</span>
                <span className="text-success-500 font-medium">{current.correctAnswer}</span>
              </div>
            </div>
            {current.explanation && (
              <div className="text-sm text-text-secondary leading-relaxed bg-neutral-50 rounded-lg px-3 py-2 border border-border-light whitespace-pre-wrap">
                {current.explanation}
              </div>
            )}

            {/* 4단계 평가 */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                얼마나 잘 기억하셨나요?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(QUALITY_META) as ReviewQuality[]).map((q) => {
                  const meta = QUALITY_META[q];
                  return (
                    <button
                      key={q}
                      onClick={() => rate(q)}
                      className={[
                        'px-3 py-3 rounded-lg text-sm font-semibold transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
                        'flex flex-col items-center gap-0.5',
                        meta.className,
                      ].join(' ')}
                      title={meta.hint}
                    >
                      <span>{meta.label}</span>
                      <span className="text-[10px] font-normal opacity-90">{meta.hint}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                선택 즉시 다음 카드로 이동합니다.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
