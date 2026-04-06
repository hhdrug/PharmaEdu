'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Difficulty } from '@/content/chapters/index';

const ALL_LEVELS: Difficulty[] = ['입문', '기초', '중급', '심화'];

export function DifficultyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parseSelected = (params: ReturnType<typeof useSearchParams>): Difficulty[] => {
    const raw = params.get('level') ?? '';
    if (!raw) return [];
    return raw
      .split(',')
      .filter((v): v is Difficulty => (ALL_LEVELS as string[]).includes(v));
  };

  const [selected, setSelected] = useState<Difficulty[]>(() => parseSelected(searchParams));

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSelected(parseSelected(searchParams));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [searchParams]);

  const toggle = useCallback(
    (level: Difficulty | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (level === null) {
        // 전체 선택 → level 파라미터 제거
        params.delete('level');
      } else {
        const next = selected.includes(level)
          ? selected.filter((l) => l !== level)
          : [...selected, level];

        if (next.length === 0) {
          params.delete('level');
        } else {
          params.set('level', next.join(','));
        }
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, selected]
  );

  const isAllActive = selected.length === 0;

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="난이도 필터"
    >
      {/* 전체 칩 */}
      <button
        type="button"
        onClick={() => toggle(null)}
        className={[
          'px-3 py-1 rounded-full text-sm transition-colors',
          isAllActive
            ? 'bg-primary-500 text-white font-medium'
            : 'border border-border-light text-text-secondary hover:bg-neutral-50',
        ].join(' ')}
        aria-pressed={isAllActive}
      >
        전체
      </button>

      {ALL_LEVELS.map((level) => {
        const isActive = selected.includes(level);
        return (
          <button
            key={level}
            type="button"
            onClick={() => toggle(level)}
            className={[
              'px-3 py-1 rounded-full text-sm transition-colors',
              isActive
                ? 'bg-primary-500 text-white font-medium'
                : 'border border-border-light text-text-secondary hover:bg-neutral-50',
            ].join(' ')}
            aria-pressed={isActive}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}
