'use client';

/**
 * /swipe — 모바일 한 손 무한 풀이 모드
 *
 * 설계 원칙:
 *  - 누워서 엄지 하나로 가능한 UX (큰 탭 타겟, 텍스트 입력 0)
 *  - 객관식/OX만. 큐 끝나면 자동 재셔플 → 무한 반복
 *  - 1탭 채점 → 어디든 탭/스와이프로 다음 문제
 *  - 키보드: 1~4 선택, Space/Enter 다음
 *  - 위로 스와이프 = 다음, 좌우 스와이프 = 다음 (모르겠음 처리는 별도 버튼)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Home, Shuffle, Flame, Target, ChevronRight, BookOpen } from 'lucide-react';
import type { QuizQuestion } from '@/lib/quiz/types';
import { evaluateAnswer } from '@/lib/quiz/evaluator';
import {
  addWrongAnswer,
  getWrongAnswers,
  markResolved,
} from '@/lib/quiz/wrong-notes';

interface Props {
  questions: QuizQuestion[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SwipeQuiz({ questions }: Props) {
  const [queue, setQueue] = useState<QuizQuestion[]>(() => shuffle(questions));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    streak: 0,
    best: 0,
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const q = queue[idx];
  const isAnswered = picked !== null;
  const correctIdx = useMemo(() => {
    if (!q) return -1;
    // 시드 포맷 통일: multiple_choice / true_false 모두 0-based 인덱스 문자열
    // (true_false는 choices=["O","X"] 또는 ["참","거짓"], correct_answer='0'|'1')
    const ca = String(q.correct_answer);
    const n = parseInt(ca, 10);
    if (Number.isFinite(n)) return n;
    // 레거시: 'true'/'false' 문자열도 안전하게 처리
    const lc = ca.toLowerCase();
    if (lc === 'true') return 0;
    if (lc === 'false') return 1;
    return -1;
  }, [q]);

  // ── 채점 ───────────────────────────────────────────────────
  const handlePick = useCallback(
    (i: number) => {
      if (picked !== null || !q) return;
      setPicked(i);
      const isCorrect = evaluateAnswer(String(i), q);
      setStats((s) => {
        const newStreak = isCorrect ? s.streak + 1 : 0;
        return {
          total: s.total + 1,
          correct: s.correct + (isCorrect ? 1 : 0),
          streak: newStreak,
          best: Math.max(s.best, newStreak),
        };
      });

      // 오답노트 연동 (정적 문제 = number id 만)
      if (typeof q.id === 'number') {
        const existing = getWrongAnswers().find((e) => e.questionId === q.id);
        if (!isCorrect) {
          addWrongAnswer({
            questionId: q.id,
            question: q.question,
            correctAnswer: q.correct_answer,
            userAnswer: String(i),
            explanation: q.explanation ?? '',
            chapter: q.chapter,
            difficulty: q.difficulty,
            timestamp: Date.now(),
            attempts: existing ? existing.attempts + 1 : 1,
            resolved: false,
          });
        } else if (existing && !existing.resolved) {
          markResolved(q.id);
        }
      }
    },
    [picked, q]
  );

  // ── 다음 문제 (큐 소진 시 자동 재셔플) ────────────────────────
  const handleNext = useCallback(() => {
    setPicked(null);
    setIdx((i) => {
      const next = i + 1;
      if (next >= queue.length) {
        setQueue(shuffle(questions));
        return 0;
      }
      return next;
    });
  }, [queue.length, questions]);

  // ── "모르겠음" 버튼: 강제 오답 등록 후 다음 ────────────────
  const handleSkip = useCallback(() => {
    if (!q || picked !== null) {
      handleNext();
      return;
    }
    setPicked(-2); // -2 = 스킵 마커
    if (typeof q.id === 'number') {
      const existing = getWrongAnswers().find((e) => e.questionId === q.id);
      addWrongAnswer({
        questionId: q.id,
        question: q.question,
        correctAnswer: q.correct_answer,
        userAnswer: '(skip)',
        explanation: q.explanation ?? '',
        chapter: q.chapter,
        difficulty: q.difficulty,
        timestamp: Date.now(),
        attempts: existing ? existing.attempts + 1 : 1,
        resolved: false,
      });
    }
    setStats((s) => ({ ...s, total: s.total + 1, streak: 0, best: s.best }));
  }, [q, picked, handleNext]);

  // ── 키보드 ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!q) return;
      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const i = parseInt(e.key, 10) - 1;
          if (q.choices && i < q.choices.length) handlePick(i);
        } else if (e.key === 's' || e.key === 'S') {
          handleSkip();
        }
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [q, isAnswered, handlePick, handleNext, handleSkip]);

  // ── 터치 스와이프 (채점 후에만 다음으로) ─────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (!isAnswered) return;
    // 가로 스와이프(좌우 50px↑) 만 "다음"으로 인식.
    // 세로 제스처는 해설 스크롤용으로 보존 — 의도치 않은 다음 트리거 방지.
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    if (isHorizontal && Math.abs(dx) > 50) {
      handleNext();
    }
  };

  // ── 빈 상태 ────────────────────────────────────────────────
  if (!q) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-text-secondary">풀 수 있는 문제가 없습니다.</p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1 text-primary-600 hover:underline"
          >
            <Home className="w-4 h-4" /> 퀴즈 홈
          </Link>
        </div>
      </div>
    );
  }

  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div
      className="min-h-[100dvh] flex flex-col bg-bg-base"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── 상단 스탯 바 (sticky, 슬림) ───────────────────────── */}
      <div className="sticky top-0 z-30 bg-bg-surface border-b border-border-light">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <Link
            href="/quiz"
            aria-label="퀴즈 홈"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100"
          >
            <Home className="w-5 h-5 text-text-secondary" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-warning-500 font-semibold">
              <Flame className="w-4 h-4" />
              {stats.streak}
            </span>
            <span className="inline-flex items-center gap-1 text-primary-600 font-semibold">
              <Target className="w-4 h-4" />
              {accuracy}%
            </span>
            <span className="text-text-muted text-xs">
              {stats.total}문제
            </span>
          </div>
        </div>
      </div>

      {/* ── 카드 영역 ─────────────────────────────────────────── */}
      <div ref={cardRef} className="flex-1 flex flex-col">
        <div className="max-w-2xl w-full mx-auto px-4 py-4 flex-1 flex flex-col">
          {/* 메타 */}
          <div className="flex items-center gap-2 text-xs mb-3">
            <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 font-medium">
              {q.chapter}
            </span>
            <span className="text-text-muted">난이도 {q.difficulty}</span>
          </div>

          {/* 문제 */}
          <p className="text-text-primary text-base sm:text-lg font-medium leading-relaxed mb-5">
            {q.question}
          </p>

          {/* 선지 — 큰 탭 타겟 */}
          <div className="space-y-2.5 mb-4">
            {(q.choices ?? []).map((choice, i) => {
              const isPicked = picked === i;
              const isCorrectChoice = i === correctIdx;
              const showResult = isAnswered;

              let cls =
                'w-full min-h-[56px] px-4 py-3 rounded-xl border-2 text-left text-[15px] leading-snug transition-all active:scale-[0.99] flex items-start gap-3';

              if (!showResult) {
                cls +=
                  ' bg-bg-surface border-border-medium hover:border-primary-400 hover:bg-primary-50/30';
              } else if (isCorrectChoice) {
                cls += ' bg-success-100 border-success-500 text-success-500';
              } else if (isPicked) {
                cls += ' bg-error-100 border-error-500 text-error-500';
              } else {
                cls +=
                  ' bg-bg-surface border-border-light text-text-muted opacity-60';
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePick(i)}
                  disabled={showResult}
                  className={cls}
                  aria-pressed={isPicked}
                >
                  <span
                    className={[
                      'flex-shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold',
                      showResult && isCorrectChoice
                        ? 'bg-success-500 text-white'
                        : showResult && isPicked
                          ? 'bg-error-500 text-white'
                          : 'bg-neutral-100 text-text-secondary',
                    ].join(' ')}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1">{choice}</span>
                </button>
              );
            })}
          </div>

          {/* 해설 */}
          {isAnswered && q.explanation && (
            <div
              className={[
                'rounded-xl p-3.5 text-sm leading-relaxed border-l-4 mb-3',
                picked === correctIdx
                  ? 'bg-success-100/60 border-success-500 text-text-primary'
                  : 'bg-error-100/60 border-error-500 text-text-primary',
              ].join(' ')}
            >
              <p className="font-semibold mb-1 text-xs uppercase tracking-wider opacity-70">
                {picked === correctIdx
                  ? '정답!'
                  : picked === -2
                    ? '스킵 — 정답은 ' + (correctIdx + 1) + '번'
                    : '오답 — 정답은 ' + (correctIdx + 1) + '번'}
              </p>
              <p>{q.explanation}</p>
            </div>
          )}

          {/* 빈 공간 채우기 */}
          <div className="flex-1" />
        </div>
      </div>

      {/* ── 하단 액션 바 (sticky, safe-area) ────────────────── */}
      <div
        className="sticky bottom-0 z-30 bg-bg-surface border-t border-border-light"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          {!isAnswered ? (
            <>
              <button
                type="button"
                onClick={handleSkip}
                className="flex-shrink-0 h-12 px-4 rounded-xl border-2 border-border-medium text-text-secondary text-sm font-medium active:scale-95 transition"
              >
                모르겠음
              </button>
              <p className="flex-1 text-center text-xs text-text-muted">
                선지를 탭하세요
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl bg-primary-500 text-white font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm"
              autoFocus
            >
              다음 문제
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
