'use client';

/**
 * ExamRunner.tsx
 * 시험 모드 런너 — 타이머, 문제 네비게이션, 자동 제출, 결과 분석.
 *
 * 핵심 흐름:
 *   1. Intro 화면에서 시작 버튼 클릭
 *   2. 타이머 시작, 문제 1번 표시
 *   3. 각 문제 답 입력 → "다음" 누르면 다음 문제
 *   4. 좌측 문제 번호 grid 로 아무 번호나 이동 가능 (모의고사 UX)
 *   5. 타이머 종료 또는 "제출" 버튼 → 결과 화면
 *   6. 결과: 점수 / 챕터별 정답률 / 오답 목록 (해설)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock, AlertTriangle, CheckCircle, XCircle, Home, Play, Flag, List,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { QuizQuestion } from '@/lib/quiz/types';
import { DIFFICULTY_LABEL, DIFFICULTY_VARIANT } from '@/lib/quiz/types';
import { QUESTION_RENDERERS } from '@/lib/quiz/renderers';
import { evaluateAnswer } from '@/lib/quiz/evaluator';
import { saveQuizHistory } from '@/lib/quiz/history';
import { addWrongAnswer } from '@/lib/quiz/wrong-notes';

type Phase = 'intro' | 'running' | 'submitted';

interface Props {
  questions: QuizQuestion[];
  totalMinutes: number;
}

export function ExamRunner({ questions, totalMinutes }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<number, string>>({}); // index → userAnswer
  const [currentIdx, setCurrentIdx] = useState(0);
  const [remainingMs, setRemainingMs] = useState(totalMinutes * 60 * 1000);

  const total = questions.length;

  // ── 타이머 ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'running') return;
    const iv = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(iv);
          /* eslint-disable react-hooks/set-state-in-effect */
          setPhase('submitted');
          /* eslint-enable react-hooks/set-state-in-effect */
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // ── 시험 시작 ─────────────────────────────────────────────
  const startExam = useCallback(() => {
    setPhase('running');
    setCurrentIdx(0);
    setAnswers({});
    setRemainingMs(totalMinutes * 60 * 1000);
  }, [totalMinutes]);

  // ── 제출 (수동 or 타이머) ─────────────────────────────────
  const submitExam = useCallback(() => {
    setPhase('submitted');
    // 히스토리·오답노트 기록
    let score = 0;
    for (let i = 0; i < total; i++) {
      const q = questions[i];
      const userAns = answers[i] ?? '';
      const isCorrect = userAns !== '' && evaluateAnswer(userAns, q);
      if (isCorrect) score++;
      else if (userAns !== '') {
        addWrongAnswer({
          questionId: q.id,
          question: q.question,
          correctAnswer: q.correct_answer,
          userAnswer: userAns,
          explanation: q.explanation,
          chapter: q.chapter,
          difficulty: q.difficulty,
          timestamp: Date.now(),
          attempts: 1,
          resolved: false,
        });
      }
    }
    saveQuizHistory({
      category: 'exam',
      categoryLabel: `모의고사 ${total}문`,
      score,
      total,
      timestamp: Date.now(),
    });
  }, [total, questions, answers]);

  // ── 답 업데이트 ───────────────────────────────────────────
  const updateAnswer = useCallback((idx: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [idx]: val }));
  }, []);

  // ── 네비게이션 ────────────────────────────────────────────
  const prevQ = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const nextQ = () => setCurrentIdx((i) => Math.min(total - 1, i + 1));

  // ── 결과 계산 ─────────────────────────────────────────────
  const results = useMemo(() => {
    if (phase !== 'submitted') return null;
    let score = 0;
    const byChapter = new Map<string, { solved: number; correct: number }>();
    const wrongDetails: Array<{ idx: number; question: QuizQuestion; userAnswer: string }> = [];
    for (let i = 0; i < total; i++) {
      const q = questions[i];
      const userAns = answers[i] ?? '';
      const s = byChapter.get(q.chapter) ?? { solved: 0, correct: 0 };
      s.solved += 1;
      const correct = userAns !== '' && evaluateAnswer(userAns, q);
      if (correct) {
        score += 1;
        s.correct += 1;
      } else {
        wrongDetails.push({ idx: i, question: q, userAnswer: userAns });
      }
      byChapter.set(q.chapter, s);
    }
    return { score, total, byChapter, wrongDetails };
  }, [phase, total, questions, answers]);

  // ── Intro 화면 ────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-100 flex items-center justify-center">
            <Flag className="w-8 h-8 text-primary-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">모의고사 시작</h1>
          <p className="text-sm text-text-secondary">
            시험과 유사한 환경에서 실력을 측정해보세요.
          </p>
        </div>

        <Card variant="standard" className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-info-100 rounded-lg">
            <Clock className="w-5 h-5 text-info-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text-primary">제한 시간: {totalMinutes}분</p>
              <p className="text-xs text-text-secondary">타이머 종료 시 자동 제출</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-warning-100 rounded-lg">
            <List className="w-5 h-5 text-warning-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text-primary">총 {total}문제</p>
              <p className="text-xs text-text-secondary">문제 간 자유로운 이동 가능</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-error-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-error-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text-primary">중도 이탈 주의</p>
              <p className="text-xs text-text-secondary">
                페이지 새로고침 / 닫으면 진행 사항이 사라집니다
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-between gap-3">
          <Link href="/quiz">
            <Button variant="ghost">
              <Home className="w-4 h-4" /> 돌아가기
            </Button>
          </Link>
          <Button variant="primary" size="lg" onClick={startExam}>
            <Play className="w-4 h-4" /> 시험 시작
          </Button>
        </div>
      </div>
    );
  }

  // ── Running 화면 ──────────────────────────────────────────
  if (phase === 'running') {
    const q = questions[currentIdx];
    const Renderer = QUESTION_RENDERERS[q.question_type];
    const userAnswer = answers[currentIdx] ?? '';
    const min = Math.floor(remainingMs / 60000);
    const sec = Math.floor((remainingMs % 60000) / 1000);
    const pctDone = Math.round((Object.keys(answers).length / total) * 100);
    const isLowTime = remainingMs < 5 * 60 * 1000;

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 상단 바: 타이머 + 진행도 + 제출 */}
        <div className="flex items-center justify-between gap-3 sticky top-16 z-40 bg-bg-page py-2">
          <div
            className={[
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
              isLowTime ? 'bg-error-100 border-error-500 animate-pulse' : 'bg-bg-surface border-border-light',
            ].join(' ')}
          >
            <Clock className={['w-4 h-4', isLowTime ? 'text-error-500' : 'text-text-secondary'].join(' ')} />
            <span className="font-mono text-sm font-bold text-text-primary">
              {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
            </span>
          </div>
          <div className="flex-1 text-xs text-text-secondary text-center">
            {Object.keys(answers).length} / {total} 응답 ({pctDone}%)
          </div>
          <Button variant="primary" size="sm" onClick={submitExam}>
            <Flag className="w-4 h-4" /> 제출
          </Button>
        </div>

        {/* 문제 번호 Grid */}
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(34px, 1fr))' }}>
          {questions.map((_, i) => {
            const answered = answers[i] !== undefined && answers[i] !== '';
            const isCurrent = i === currentIdx;
            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={[
                  'h-9 rounded text-xs font-bold transition-all',
                  isCurrent
                    ? 'bg-primary-500 text-white ring-2 ring-primary-500 ring-offset-1'
                    : answered
                    ? 'bg-success-100 text-success-500'
                    : 'bg-neutral-100 text-text-muted hover:bg-neutral-200',
                ].join(' ')}
                aria-label={`문제 ${i + 1}${answered ? ' (응답됨)' : ''}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* 현재 문제 */}
        <Card variant="standard" key={`q-${currentIdx}`} className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="primary">문제 {currentIdx + 1} / {total}</Badge>
            <Badge variant="neutral">{q.chapter}</Badge>
            <Badge variant={DIFFICULTY_VARIANT[q.difficulty]}>
              {DIFFICULTY_LABEL[q.difficulty]}
            </Badge>
          </div>

          <p className="text-text-primary whitespace-pre-line font-medium leading-relaxed">
            {q.question}
          </p>

          {Renderer ? (
            <Renderer
              question={q}
              userAnswer={userAnswer}
              isAnswered={false}
              isCorrect={null}
              onChange={(v) => updateAnswer(currentIdx, v)}
              onSubmit={nextQ}
            />
          ) : (
            <p className="text-sm text-text-muted">지원되지 않는 문제 유형: {q.question_type}</p>
          )}
        </Card>

        {/* 하단 네비 */}
        <div className="flex justify-between gap-3">
          <Button variant="secondary" onClick={prevQ} disabled={currentIdx === 0}>
            <ChevronLeft className="w-4 h-4" /> 이전
          </Button>
          <Button variant="primary" onClick={nextQ} disabled={currentIdx === total - 1}>
            다음 <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Submitted 화면 (결과) ─────────────────────────────────
  if (!results) return null;
  const { score, byChapter, wrongDetails } = results;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div
          className={[
            'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center',
            pct >= 80 ? 'bg-success-100' : pct >= 60 ? 'bg-warning-100' : 'bg-error-100',
          ].join(' ')}
        >
          {pct >= 80 ? (
            <CheckCircle className="w-10 h-10 text-success-500" />
          ) : pct >= 60 ? (
            <Flag className="w-10 h-10 text-warning-500" />
          ) : (
            <XCircle className="w-10 h-10 text-error-500" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-text-primary">
          {score} / {total}
        </h1>
        <p className="text-lg text-text-secondary">
          정답률 <span className="font-bold">{pct}%</span>
          {pct >= 80 && ' — 우수!'}
          {pct >= 60 && pct < 80 && ' — 양호'}
          {pct < 60 && ' — 복습 필요'}
        </p>
      </div>

      {/* 챕터별 정답률 */}
      <Card variant="standard">
        <h2 className="text-base font-semibold text-text-primary mb-3">챕터별 정답률</h2>
        <ul className="space-y-1.5">
          {Array.from(byChapter.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([ch, s]) => {
              const chPct = s.solved > 0 ? Math.round((s.correct / s.solved) * 100) : 0;
              return (
                <li key={ch} className="flex items-center gap-3 text-sm">
                  <Badge variant="neutral" className="w-14 justify-center">
                    {ch}
                  </Badge>
                  <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden relative">
                    <div
                      className={[
                        'h-full transition-all',
                        chPct >= 80 ? 'bg-success-500' : chPct >= 60 ? 'bg-warning-500' : 'bg-error-500',
                      ].join(' ')}
                      style={{ width: `${chPct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {s.correct} / {s.solved} ({chPct}%)
                    </span>
                  </div>
                </li>
              );
            })}
        </ul>
      </Card>

      {/* 오답 목록 */}
      {wrongDetails.length > 0 && (
        <Card variant="standard">
          <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-error-500" />
            틀린 문제 {wrongDetails.length}개 (상세 해설)
          </h2>
          <ul className="space-y-3">
            {wrongDetails.map(({ idx, question: q, userAnswer: ua }) => (
              <li key={idx} className="p-3 bg-error-100/40 rounded-lg border-l-4 border-error-500">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="error">#{idx + 1}</Badge>
                  <Badge variant="neutral">{q.chapter}</Badge>
                </div>
                <p className="text-sm text-text-primary line-clamp-2 mb-1">{q.question}</p>
                <p className="text-xs text-text-muted">
                  정답: <span className="font-bold text-success-500">{q.correct_answer}</span>
                  {ua && <> · 내 답: <span className="text-error-500">{ua}</span></>}
                  {!ua && <> · <span className="text-text-muted">미응답</span></>}
                </p>
                {q.explanation && (
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{q.explanation}</p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex justify-center gap-3">
        <Link href="/quiz/exam">
          <Button variant="secondary">다시 보기</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="primary">대시보드</Button>
        </Link>
      </div>
    </div>
  );
}
