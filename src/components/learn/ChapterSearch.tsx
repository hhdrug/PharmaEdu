'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function ChapterSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL 파라미터가 외부에서 바뀌면 input 동기화
  // (뒤로가기·다른 컴포넌트에서 q 파라미터가 바뀔 때 입력창과 동기화)
  // searchParams는 Next.js 라우터(외부 시스템)이므로 effect 내 동기화가 올바른 패턴임
  useEffect(
    () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue(searchParams.get('q') ?? '');
    },
    [searchParams]
  );

  const pushQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushQuery(value);
    }, 300);
  };

  const handleClear = () => {
    setInputValue('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushQuery('');
  };

  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={inputValue}
        onChange={handleChange}
        placeholder="챕터 검색 (예: 약품금액, 보훈, 반올림)"
        className={[
          'w-full h-10 pl-9',
          inputValue ? 'pr-9' : 'pr-4',
          'bg-bg-surface border border-border-light rounded-lg',
          'text-sm text-text-primary placeholder:text-text-muted',
          'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-500/20',
          'transition-colors',
        ].join(' ')}
        aria-label="챕터 검색"
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="검색어 지우기"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
