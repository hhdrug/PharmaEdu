'use client';

/**
 * FlashcardPlayer — 덱 1개를 1장씩 뒤집기 형태로 표시.
 *
 * UX:
 *   - 카드 클릭 또는 Space → 뒤집기 (앞↔뒷면)
 *   - ← / → 방향키 또는 버튼 → 이전/다음 카드
 *   - R → 덱 셔플 후 처음부터
 *   - 진도바 + 카드 번호 표시
 *
 * 접근성: 버튼 기반, 키보드 네비 지원, aria-live 로 현재 면 안내.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Shuffle, RotateCcw, ArrowLeft, BookOpen,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { FlashcardDeck } from '@/content/flashcards';

interface Props {
  deck: FlashcardDeck;
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function FlashcardPlayer({ deck }: Props) {
  const [order, setOrder] = useState(() => deck.cards.map((_, i) => i));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = deck.cards[order[currentIdx]];
  const total = deck.cards.length;
  const progressPct = useMemo(
    () => Math.round(((currentIdx + 1) / total) * 100),
    [currentIdx, total],
  );

  const prev = useCallback(() => {
    setFlipped(false);
    setCurrentIdx((i) => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setFlipped(false);
    setCurrentIdx((i) => (i + 1) % total);
  }, [total]);

  const shuffle = useCallback(() => {
    setOrder(shuffleArray(deck.cards.map((_, i) => i)));
    setCurrentIdx(0);
    setFlipped(false);
  }, [deck.cards]);

  const reset = useCallback(() => {
    setOrder(deck.cards.map((_, i) => i));
    setCurrentIdx(0);
    setFlipped(false);
  }, [deck.cards]);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  // 키보드
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flip();
      } else if (e.key === 'r' || e.key === 'R') shuffle();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next, flip, shuffle]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-4">
      {/* 상단 — 뒤로 / 덱 정보 */}
      <div className="flex items-center justify-between">
        <Link
          href="/flashcards"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-500"
        >
          <ArrowLeft className="w-4 h-4" />
          덱 목록
        </Link>
        <div className="flex items-center gap-1.5 text-sm text-text-primary font-semibold">
          <span className="text-xl" aria-hidden="true">{deck.emoji}</span>
          {deck.title}
        </div>
      </div>

      {/* 진도 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted whitespace-nowrap">
          {currentIdx + 1} / {total}
        </span>
        <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* 카드 */}
      <button
        type="button"
        onClick={flip}
        aria-label={flipped ? '카드 뒤집기 (뒷면 → 앞면)' : '카드 뒤집기 (앞면 → 뒷면)'}
        aria-live="polite"
        className="w-full min-h-[260px] sm:min-h-[320px] rounded-2xl border border-border-light bg-bg-surface p-6 sm:p-10 text-left hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        {!flipped ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3 text-center">
            <span className="text-xs uppercase tracking-wide text-text-muted">앞면</span>
            <p className="text-3xl sm:text-4xl font-bold text-primary-600 break-all">
              {current.front}
            </p>
            {current.hint && (
              <p className="text-sm text-text-muted max-w-md">💡 {current.hint}</p>
            )}
            <p className="text-xs text-text-muted pt-4">클릭하거나 Space 눌러 뒤집기</p>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wide text-text-muted">뒷면</span>
            <p className="text-base sm:text-lg text-text-primary leading-relaxed whitespace-pre-wrap">
              {current.back}
            </p>
            {current.chapter && (
              <Link
                href={`/learn?chapter=${current.chapter}`}
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline pt-2"
                onClick={(e) => e.stopPropagation()}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {current.chapter} 레슨 보기
              </Link>
            )}
          </div>
        )}
      </button>

      {/* 내비게이션 */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={prev} aria-label="이전 카드">
          <ChevronLeft className="w-4 h-4" />
          이전
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={shuffle} title="셔플 (R)">
            <Shuffle className="w-3.5 h-3.5" />
            셔플
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} title="원래 순서">
            <RotateCcw className="w-3.5 h-3.5" />
            리셋
          </Button>
        </div>

        <Button variant="ghost" onClick={next} aria-label="다음 카드">
          다음
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-text-muted text-center pt-2">
        ← / → 이동 · Space 뒤집기 · R 셔플
      </p>
    </div>
  );
}
