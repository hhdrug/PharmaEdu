'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { QuizQuestion, QuestionType } from '@/lib/quiz/types';

interface QuestionFormProps {
  mode: 'new' | 'edit';
  question?: QuizQuestion;
  action: (formData: FormData) => Promise<void>;
}

const CHAPTER_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const ch = `CH${String(i + 1).padStart(2, '0')}`;
  return { value: ch, label: ch };
});

const DIFFICULTY_OPTIONS = [
  { value: '1', label: '1 - 쉬움' },
  { value: '2', label: '2 - 보통' },
  { value: '3', label: '3 - 어려움' },
];

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: '객관식' },
  { value: 'numeric', label: '주관식 (숫자)' },
  { value: 'true_false', label: 'O/X' },
];

export function QuestionForm({ mode, question, action }: QuestionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [choices, setChoices] = useState<string[]>(
    question?.choices ?? ['', '', '', '']
  );
  const [error, setError] = useState<string | null>(null);

  function addChoice() {
    setChoices((prev) => [...prev, '']);
  }

  function removeChoice(idx: number) {
    setChoices((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // choices 배열 — 각 항목을 개별 append
    formData.delete('choices');
    choices.forEach((c) => formData.append('choices', c));

    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
      }
    });
  }

  return (
    <div className="min-h-screen bg-bg-page">
      <header className="bg-bg-surface border-b border-border-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link href="/admin/quiz">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              목록으로
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-text-primary">
            {mode === 'new' ? '문제 추가' : '문제 수정'}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-bg-surface border border-border-light rounded-xl p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 챕터 */}
            <Select
              label="챕터"
              name="chapter"
              required
              options={CHAPTER_OPTIONS}
              defaultValue={question?.chapter ?? 'CH01'}
              placeholder="챕터 선택"
            />

            {/* 난이도 */}
            <Select
              label="난이도"
              name="difficulty"
              required
              options={DIFFICULTY_OPTIONS}
              defaultValue={String(question?.difficulty ?? '1')}
            />

            {/* 문제 유형 */}
            <Select
              label="문제 유형"
              name="question_type"
              required
              options={QUESTION_TYPE_OPTIONS}
              defaultValue={question?.question_type ?? 'multiple_choice'}
            />

            {/* 문제 텍스트 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="question-text"
                className="text-sm font-medium text-text-primary"
              >
                문제 텍스트 <span className="text-error-500 ml-0.5">*</span>
              </label>
              <textarea
                id="question-text"
                name="question"
                required
                rows={4}
                defaultValue={question?.question ?? ''}
                placeholder="문제를 입력하세요"
                className="w-full px-3 py-2 text-sm text-text-primary bg-bg-surface border border-border-light rounded-lg outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-500/20 resize-y"
              />
            </div>

            {/* 선택지 */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-text-primary">
                선택지{' '}
                <span className="text-text-muted font-normal">
                  (객관식인 경우 입력, 주관식이면 비워두기)
                </span>
              </span>
              {choices.map((choice, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) =>
                      setChoices((prev) =>
                        prev.map((c, i) => (i === idx ? e.target.value : c))
                      )
                    }
                    placeholder={`선택지 ${idx + 1}`}
                    className="flex-1 h-10 px-3 text-sm text-text-primary bg-bg-surface border border-border-light rounded-lg outline-none focus:border-border-focus"
                  />
                  {choices.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeChoice(idx)}
                      className="p-1 text-text-muted hover:text-error-500 transition-colors"
                      aria-label={`선택지 ${idx + 1} 삭제`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addChoice}
                className="self-start"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                선택지 추가
              </Button>
            </div>

            {/* 정답 */}
            <Input
              label="정답"
              name="correct_answer"
              required
              defaultValue={question?.correct_answer ?? ''}
              placeholder="선택지 번호(0-indexed) 또는 주관식 답"
              helperText="객관식: 0, 1, 2, 3 중 하나 / 숫자 주관식: 숫자 값"
            />

            {/* 해설 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="explanation-text"
                className="text-sm font-medium text-text-primary"
              >
                해설
              </label>
              <textarea
                id="explanation-text"
                name="explanation"
                rows={3}
                defaultValue={question?.explanation ?? ''}
                placeholder="해설 (선택사항)"
                className="w-full px-3 py-2 text-sm text-text-primary bg-bg-surface border border-border-light rounded-lg outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-500/20 resize-y"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-error-100 border border-error-500/30 rounded-lg px-4 py-3 text-sm text-error-500">
                {error}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/admin/quiz">
                <Button type="button" variant="secondary" size="md">
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isPending}
              >
                {mode === 'new' ? '문제 추가' : '저장'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
