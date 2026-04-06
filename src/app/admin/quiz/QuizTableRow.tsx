'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { deleteQuestion } from '../actions';
import type { QuizQuestion } from '@/lib/quiz/types';
import { DIFFICULTY_LABEL } from '@/lib/quiz/types';

interface QuizTableRowProps {
  question: QuizQuestion;
  /** true 이면 삭제 버튼만 렌더링 (모바일 카드 내부 용도) */
  mobileDeleteOnly?: boolean;
}

export function QuizTableRow({ question, mobileDeleteOnly = false }: QuizTableRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`문제 #${question.id}를 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      await deleteQuestion(question.id);
    });
  }

  // 모바일 삭제 버튼만
  if (mobileDeleteOnly) {
    return (
      <Button
        variant="ghost"
        size="sm"
        loading={isPending}
        onClick={handleDelete}
        className="text-error-500 hover:bg-error-100"
      >
        삭제
      </Button>
    );
  }

  // 테이블 행 전체
  return (
    <tr className={isPending ? 'opacity-50' : undefined}>
      <td className="px-4 py-3 text-text-muted">{question.id}</td>
      <td className="px-4 py-3">
        <span className="text-xs font-medium text-text-secondary">{question.chapter}</span>
      </td>
      <td className="px-4 py-3 text-text-primary max-w-xs">
        <p className="truncate">{question.question}</p>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={
            question.difficulty === 1
              ? 'success'
              : question.difficulty === 2
              ? 'warning'
              : 'error'
          }
        >
          {DIFFICULTY_LABEL[question.difficulty]}
        </Badge>
      </td>
      <td className="px-4 py-3 text-text-muted text-xs">
        {new Date(question.created_at).toLocaleDateString('ko-KR')}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Link href={`/admin/questions/${question.id}/edit`}>
            <Button variant="secondary" size="sm">수정</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            loading={isPending}
            onClick={handleDelete}
            className="text-error-500 hover:bg-error-100"
          >
            삭제
          </Button>
        </div>
      </td>
    </tr>
  );
}
