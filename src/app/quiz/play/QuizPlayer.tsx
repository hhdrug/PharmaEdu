'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Home } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { QuizQuestion } from '@/lib/quiz/types';
import { DIFFICULTY_LABEL, DIFFICULTY_VARIANT } from '@/lib/quiz/types';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  title: string;
}

type AnswerState = 'idle' | 'correct' | 'incorrect';

export function QuizPlayer({ questions, title }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [numericInput, setNumericInput] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;
  const progress = total > 0 ? ((currentIndex + (answerState !== 'idle' ? 1 : 0)) / total) * 100 : 0;

  const handleChoiceSelect = useCallback((idx: number) => {
    if (answerState !== 'idle') return;
    setUserAnswer(String(idx));
  }, [answerState]);

  const handleCheckAnswer = useCallback(() => {
    if (!question) return;

    const answer =
      question.question_type === 'numeric' ? numericInput.trim() : userAnswer;

    if (!answer) return;

    const isCorrect = answer === question.correct_answer;
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setScore((s) => s + 1);
  }, [question, userAnswer, numericInput]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setUserAnswer('');
      setNumericInput('');
      setAnswerState('idle');
    }
  }, [currentIndex, total]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswer('');
    setNumericInput('');
    setAnswerState('idle');
    setScore(0);
    setIsFinished(false);
  }, []);

  // ── 빈 문제 상태 ──
  if (total === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-text-secondary text-lg">불러올 문제가 없습니다.</p>
        <p className="text-text-muted text-sm">
          Supabase SQL Editor에서 seed_quiz.sql을 실행해주세요.
        </p>
        <Link href="/quiz">
          <Button variant="primary">퀴즈 홈으로</Button>
        </Link>
      </div>
    );
  }

  // ── 최종 결과 화면 ──
  if (isFinished) {
    const pct = Math.round((score / total) * 100);
    const resultVariant = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'error';
    const resultMsg =
      pct >= 80 ? '훌륭합니다!' : pct >= 50 ? '잘 했어요. 더 연습해보세요!' : '다시 한 번 도전해보세요!';

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
        <Card variant="elevated" className="text-center space-y-4">
          <div className="flex justify-center">
            {pct >= 80 ? (
              <CheckCircle className="w-16 h-16 text-success-500" />
            ) : (
              <XCircle className="w-16 h-16 text-error-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-text-primary">퀴즈 완료!</h2>
          <div className="py-4">
            <p className="text-5xl font-extrabold text-primary-500">
              {score} / {total}
            </p>
            <p className="text-text-secondary mt-1">{pct}% 정답률</p>
          </div>
          <Badge variant={resultVariant} className="text-sm px-3 py-1 h-auto">
            {resultMsg}
          </Badge>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="primary" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4" />
              다시 풀기
            </Button>
            <Link href="/quiz">
              <Button variant="secondary">
                <Home className="w-4 h-4" />
                퀴즈 홈
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ── 문제 화면 ──
  const isAnswered = answerState !== 'idle';
  const isMultipleChoice = question.question_type === 'multiple_choice' || question.question_type === 'true_false';
  const canSubmit =
    isMultipleChoice ? userAnswer !== '' : numericInput.trim() !== '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* 제목 + 진행 바 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span className="font-medium">{title}</span>
          <span>
            {currentIndex + 1} / {total}
          </span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 문제 카드 */}
      <Card variant="standard" className="space-y-4">
        {/* 메타 정보 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="primary">{question.chapter}</Badge>
          <Badge variant={DIFFICULTY_VARIANT[question.difficulty]}>
            {DIFFICULTY_LABEL[question.difficulty]}
          </Badge>
          {question.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>

        {/* 문제 텍스트 */}
        <p className="text-text-primary font-medium leading-relaxed">
          {question.question}
        </p>

        {/* 선택지 또는 입력창 */}
        {isMultipleChoice && question.choices ? (
          <div className="space-y-2 pt-1">
            {question.choices.map((choice, idx) => {
              const isSelected = userAnswer === String(idx);
              const isCorrectChoice = isAnswered && String(idx) === question.correct_answer;
              const isWrongSelected = isAnswered && isSelected && !isCorrectChoice;

              return (
                <button
                  key={idx}
                  onClick={() => handleChoiceSelect(idx)}
                  disabled={isAnswered}
                  className={[
                    'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    isCorrectChoice
                      ? 'bg-success-100 border-success-500 text-success-500 font-medium'
                      : isWrongSelected
                      ? 'bg-error-100 border-error-500 text-error-500'
                      : isSelected && !isAnswered
                      ? 'bg-primary-50 border-primary-500 text-primary-600 font-medium'
                      : 'bg-bg-surface border-border-light text-text-primary hover:bg-neutral-50',
                    isAnswered ? 'cursor-default' : 'cursor-pointer',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="font-mono text-text-muted mr-2">
                    {String.fromCharCode(9312 + idx)}
                  </span>
                  {choice}
                  {isCorrectChoice && (
                    <CheckCircle className="inline w-4 h-4 ml-2 text-success-500" />
                  )}
                  {isWrongSelected && (
                    <XCircle className="inline w-4 h-4 ml-2 text-error-500" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* 숫자 입력 */
          <div className="pt-1 space-y-2">
            <label className="text-sm text-text-secondary" htmlFor="numeric-answer">
              답을 숫자로 입력하세요 (단위 없이 숫자만)
            </label>
            <div className="flex gap-2">
              <input
                id="numeric-answer"
                type="text"
                inputMode="numeric"
                value={numericInput}
                onChange={(e) => setNumericInput(e.target.value)}
                disabled={isAnswered}
                placeholder="예: 5700"
                className={[
                  'flex-1 px-4 py-2.5 rounded-lg border text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  'disabled:bg-neutral-50 disabled:cursor-default',
                  isAnswered && numericInput === question.correct_answer
                    ? 'border-success-500 bg-success-100'
                    : isAnswered
                    ? 'border-error-500 bg-error-100'
                    : 'border-border-light bg-bg-surface',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            </div>
            {isAnswered && numericInput !== question.correct_answer && (
              <p className="text-sm text-success-500 font-medium">
                정답: {question.correct_answer}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* 해설 카드 (정답 확인 후 표시) */}
      {isAnswered && (
        <Card
          variant="standard"
          className={
            answerState === 'correct'
              ? 'border-l-4 border-l-success-500 bg-success-100'
              : 'border-l-4 border-l-error-500 bg-error-100'
          }
        >
          <div className="flex items-start gap-3">
            {answerState === 'correct' ? (
              <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className={`font-semibold text-sm ${answerState === 'correct' ? 'text-success-500' : 'text-error-500'}`}>
                {answerState === 'correct' ? '정답입니다!' : '오답입니다.'}
              </p>
              <p className="text-text-secondary text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 버튼 영역 */}
      <div className="flex justify-between items-center">
        <Link href="/quiz">
          <Button variant="ghost" size="sm">
            <Home className="w-4 h-4" />
            홈
          </Button>
        </Link>

        {!isAnswered ? (
          <Button
            variant="primary"
            onClick={handleCheckAnswer}
            disabled={!canSubmit}
          >
            정답 확인
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext}>
            {currentIndex + 1 >= total ? '결과 보기' : '다음 문제'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
