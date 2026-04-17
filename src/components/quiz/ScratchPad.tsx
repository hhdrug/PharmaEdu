'use client';

/**
 * ScratchPad.tsx
 * 퀴즈 풀이 시 계산기 옆에 표시되는 메모장.
 * 사용자가 중간 계산값·약품 정보 등을 기록할 수 있다.
 *
 * - 문제 단위로 초기화 (React key 로 unmount 시 자동 clear)
 * - 저장 없음 (세션 휘발성) — 교육/연습 용도
 */

import { useState, useRef } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export interface ScratchPadProps {
  /** 초기 placeholder 힌트 */
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER = `여기에 계산 메모를 남겨보세요.

예시)
  - 약품1: 500 × 1 × 3 × 7 = 10,500원
  - 약품2: 300 × 1 × 2 × 7 = 4,200원
  - 합계: 14,700원
  - 총액1: 14,700 + 8,660 = ...
  - 본인부담 30%: ...`;

export default function ScratchPad({ placeholder = DEFAULT_PLACEHOLDER }: ScratchPadProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className="flex flex-col h-full min-h-[360px] rounded-xl border border-border-light bg-bg-surface overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-b border-border-light">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          메모장
        </div>
        <button
          type="button"
          onClick={() => {
            setValue('');
            textareaRef.current?.focus();
          }}
          disabled={value.length === 0}
          className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-error-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="메모 지우기"
          title="메모 지우기"
        >
          <Trash2 className="w-3 h-3" aria-hidden="true" />
          지우기
        </button>
      </div>

      {/* 입력 영역 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={[
          'flex-1 w-full p-3 text-xs font-mono leading-relaxed',
          'bg-bg-surface text-text-primary placeholder:text-text-muted/60',
          'resize-none outline-none focus:bg-primary-50/30 transition-colors',
        ].join(' ')}
        spellCheck={false}
        aria-label="계산 메모장"
      />

      {/* 하단 글자수 표시 (선택) */}
      {value.length > 0 && (
        <div className="px-3 py-1 text-[10px] text-text-muted text-right border-t border-border-light bg-neutral-50">
          {value.length}자
        </div>
      )}
    </div>
  );
}
