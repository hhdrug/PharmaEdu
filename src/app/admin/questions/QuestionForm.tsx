'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, X, FileText, Info } from 'lucide-react';
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

// Phase 7+: 8종 문제 타입 전부 지원
const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: '객관식 (MC)' },
  { value: 'true_false',      label: 'O/X' },
  { value: 'numeric',         label: '숫자 주관식' },
  { value: 'matching',        label: '매칭 (Matching)' },
  { value: 'ordering',        label: '순서 정렬 (Ordering)' },
  { value: 'fill_blank',      label: '빈칸 채우기 (Fill Blank)' },
  { value: 'error_spot',      label: '오류 찾기 (Error Spot)' },
  { value: 'multi_step',      label: '다단계 (Multi-Step)' },
];

// 타입별 payload 예시 JSON (placeholder + 가이드)
const PAYLOAD_EXAMPLES: Record<QuestionType, string> = {
  multiple_choice: '(불필요 — 선택지는 choices 필드 사용)',
  true_false:      '(불필요 — choices = ["O","X"])',
  numeric:         '(불필요)',
  matching: JSON.stringify({
    left:  [{ id: 'l1', label: '단가' }, { id: 'l2', label: '1회투약량' }],
    right: [{ id: 'r1', label: '1정의 단위가격' }, { id: 'r2', label: '한 번 복용 시 정량' }],
  }, null, 2),
  ordering: JSON.stringify({
    items: [
      { id: 'i1', label: '산제 가산 (1순위)' },
      { id: 'i2', label: '소아심야 (2순위)' },
      { id: 'i3', label: '토요 (3순위)' },
      { id: 'i4', label: '야간 (4순위)' },
    ],
  }, null, 2),
  fill_blank: JSON.stringify({
    template: '약품금액 {b1} + 조제료 {b2} = 총액1 {b3}',
    slots: [
      { id: 'b1', label: '약품금액' },
      { id: 'b2', label: '조제료' },
      { id: 'b3', label: '총액1' },
    ],
  }, null, 2),
  error_spot: JSON.stringify({
    steps: [
      { id: 'step1', label: '약품금액', value: '10,500원' },
      { id: 'step2', label: '조제료',   value: '8,660원' },
      { id: 'step3', label: '총액1',    value: '19,160원' },
      { id: 'step4', label: '본인부담', value: '5,748원 (검산)' },
    ],
  }, null, 2),
  multi_step: JSON.stringify({
    steps: [
      { id: 'drugAmount', label: '약품금액' },
      { id: 'wage',       label: '조제료' },
      { id: 'total1',     label: '총액1' },
      { id: 'userPrice',  label: '본인부담금' },
    ],
  }, null, 2),
};

// correct_answer 형식 가이드
const ANSWER_HINTS: Record<QuestionType, string> = {
  multiple_choice: '선택지 인덱스 (0, 1, 2, 3)',
  true_false:      '0 (O) 또는 1 (X)',
  numeric:         '숫자 (예: 5700)',
  matching:        'JSON 객체 {"l1":"r1","l2":"r2",...}',
  ordering:        '콤마 구분 순서 (예: i1,i2,i3,i4)',
  fill_blank:      'JSON 객체 {"b1":"값","b2":"값"}',
  error_spot:      '오류 step id (예: step4) 또는 0-indexed',
  multi_step:      'JSON 객체 {"drugAmount":10500,"wage":8660,...}',
};

function needsChoices(type: QuestionType): boolean {
  return type === 'multiple_choice' || type === 'true_false';
}

function needsPayload(type: QuestionType): boolean {
  return ['matching', 'ordering', 'fill_blank', 'error_spot', 'multi_step'].includes(type);
}

export function QuestionForm({ mode, question, action }: QuestionFormProps) {
  const [isPending, startTransition] = useTransition();

  const [qType, setQType] = useState<QuestionType>(
    question?.question_type ?? 'multiple_choice'
  );
  const [choices, setChoices] = useState<string[]>(
    question?.choices ?? ['', '', '', '']
  );
  const [payloadText, setPayloadText] = useState<string>(
    question?.payload ? JSON.stringify(question.payload, null, 2) : ''
  );
  const [tagsText, setTagsText] = useState<string>(
    (question?.tags ?? []).join(', ')
  );
  const [error, setError] = useState<string | null>(null);

  function addChoice() { setChoices((p) => [...p, '']); }
  function removeChoice(idx: number) { setChoices((p) => p.filter((_, i) => i !== idx)); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // choices 배열 개별 append (객관식·OX 만)
    formData.delete('choices');
    if (needsChoices(qType)) {
      choices.filter((c) => c.trim() !== '').forEach((c) => formData.append('choices', c));
    }

    // payload JSON 검증
    formData.delete('payload');
    if (needsPayload(qType) && payloadText.trim() !== '') {
      try {
        JSON.parse(payloadText);
        formData.append('payload', payloadText);
      } catch {
        setError(`payload JSON 파싱 실패 — 형식을 확인하세요.`);
        return;
      }
    }

    // tags — comma-separated → 배열
    formData.delete('tags');
    tagsText.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) =>
      formData.append('tags', t),
    );

    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
      }
    });
  }

  const isChoicesVisible = needsChoices(qType);
  const isPayloadVisible = needsPayload(qType);

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
        <div className="bg-bg-surface rounded-2xl border border-border-light p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* 메타 3종 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="챕터" name="chapter" required
                options={CHAPTER_OPTIONS}
                defaultValue={question?.chapter ?? 'CH01'}
              />
              <Select
                label="난이도" name="difficulty" required
                options={DIFFICULTY_OPTIONS}
                defaultValue={String(question?.difficulty ?? '1')}
              />
              <Select
                label="문제 유형" name="question_type" required
                options={QUESTION_TYPE_OPTIONS}
                value={qType}
                onChange={(e) => setQType(e.target.value as QuestionType)}
              />
            </div>

            {/* 문제 텍스트 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="question-text" className="text-sm font-medium text-text-primary">
                문제 텍스트 <span className="text-error-500 ml-0.5">*</span>
              </label>
              <textarea
                id="question-text" name="question" required rows={4}
                defaultValue={question?.question ?? ''}
                placeholder="문제를 입력하세요"
                className="w-full px-3 py-2 text-sm text-text-primary bg-bg-surface border border-border-light rounded-lg outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-500/20 resize-y"
              />
            </div>

            {/* 선택지 — 객관식·OX 만 */}
            {isChoicesVisible && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-primary">
                  선택지 <span className="text-text-secondary font-normal">({qType === 'true_false' ? 'O/X: ["O","X"]' : '객관식 2-4개'})</span>
                </span>
                {choices.map((choice, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text" value={choice}
                      onChange={(e) => setChoices((p) => p.map((c, i) => (i === idx ? e.target.value : c)))}
                      placeholder={`선택지 ${idx + 1}`}
                      className="flex-1 h-10 px-3 text-sm text-text-primary bg-bg-surface border border-border-light rounded-lg outline-none focus:border-border-focus"
                    />
                    {choices.length > 2 && (
                      <button type="button" onClick={() => removeChoice(idx)}
                        className="p-1 text-text-muted hover:text-error-500 transition-colors"
                        aria-label={`선택지 ${idx + 1} 삭제`}
                      ><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={addChoice} className="self-start">
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  선택지 추가
                </Button>
              </div>
            )}

            {/* Payload JSON — 고급 타입 전용 */}
            {isPayloadVisible && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payload-text" className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  Payload (JSON) <span className="text-error-500">*</span>
                </label>
                <div className="flex items-start gap-1.5 text-xs text-text-secondary bg-info-100 border border-info-500/30 rounded-lg px-3 py-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-info-500" aria-hidden="true" />
                  <span>
                    {qType === 'matching' && '좌측 items(left)와 우측 items(right) 배열. correct_answer는 {"l1":"r1",...} 매핑 JSON 문자열.'}
                    {qType === 'ordering' && 'items 배열 정의 후 correct_answer에 올바른 순서를 i1,i2,i3 콤마 구분.'}
                    {qType === 'fill_blank' && 'template에 {b1}·{b2} 치환 토큰, slots 배열로 각 빈칸 정의. correct_answer는 {"b1":"값",...}.'}
                    {qType === 'error_spot' && 'steps 배열의 각 항목에 id/label/value. correct_answer는 오류 step id (예: step4).'}
                    {qType === 'multi_step' && 'steps 배열 정의 후 correct_answer에 {"step1":값, ...} JSON.'}
                  </span>
                </div>
                <textarea
                  id="payload-text" value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  rows={10}
                  placeholder={PAYLOAD_EXAMPLES[qType]}
                  className="w-full px-3 py-2 text-xs font-mono text-text-primary bg-bg-surface border border-border-light rounded-lg outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-500/20 resize-y"
                  spellCheck={false}
                />
              </div>
            )}

            {/* 정답 */}
            <Input
              label="정답" name="correct_answer" required
              defaultValue={question?.correct_answer ?? ''}
              placeholder={ANSWER_HINTS[qType]}
              helperText={ANSWER_HINTS[qType]}
            />

            {/* 해설 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="explanation-text" className="text-sm font-medium text-text-primary">
                해설
              </label>
              <textarea
                id="explanation-text" name="explanation" rows={3}
                defaultValue={question?.explanation ?? ''}
                placeholder="해설 (선택사항)"
                className="w-full px-3 py-2 text-sm text-text-primary bg-bg-surface border border-border-light rounded-lg outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-500/20 resize-y"
              />
            </div>

            {/* Tags (Phase 7) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tags-text" className="text-sm font-medium text-text-primary">
                태그 <span className="text-text-secondary font-normal">(쉼표 구분)</span>
              </label>
              <input
                id="tags-text" type="text" value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="chapter:CH01, lesson:lesson-03-..., scenario:S01, 약품금액, easy"
                className="w-full h-10 px-3 text-sm text-text-primary bg-bg-surface border border-border-light rounded-lg outline-none focus:border-border-focus"
              />
              <span className="text-xs text-text-secondary">
                Cross-ref prefix 지원: <code className="bg-neutral-100 px-1 rounded">chapter:CHxx</code> · <code className="bg-neutral-100 px-1 rounded">lesson:slug</code> · <code className="bg-neutral-100 px-1 rounded">scenario:Sxx</code>
              </span>
            </div>

            {/* 에러 */}
            {error && (
              <div className="bg-error-100 border border-error-500/30 rounded-lg px-4 py-3 text-sm text-error-500">
                {error}
              </div>
            )}

            {/* 액션 */}
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/admin/quiz">
                <Button type="button" variant="secondary" size="md">취소</Button>
              </Link>
              <Button type="submit" variant="primary" size="md" loading={isPending}>
                {mode === 'new' ? '문제 추가' : '저장'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
