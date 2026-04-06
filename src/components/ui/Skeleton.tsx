import type { ReactElement } from 'react';

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'table';
  className?: string;
  rows?: number;
  width?: string;
  height?: string;
}

export function Skeleton({
  variant = 'rect',
  className = '',
  rows = 3,
  width,
  height,
}: SkeletonProps): ReactElement {
  const pulse = 'animate-pulse';

  // text — 여러 줄 텍스트 스켈레톤
  if (variant === 'text') {
    const lineCount = rows < 1 ? 1 : rows;
    return (
      <div
        aria-busy="true"
        aria-label="콘텐츠를 불러오는 중입니다"
        className={['flex flex-col gap-y-2', className].filter(Boolean).join(' ')}
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <div
            key={i}
            className={[
              pulse,
              'bg-neutral-200 rounded-md h-4',
              i === lineCount - 1 && lineCount > 1 ? 'w-3/4' : 'w-full',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
    );
  }

  // circle — 원형 (아바타, 아이콘)
  if (variant === 'circle') {
    return (
      <div
        aria-busy="true"
        aria-label="콘텐츠를 불러오는 중입니다"
        className={[
          pulse,
          'bg-neutral-200 rounded-full',
          width ?? 'w-12',
          height ?? 'h-12',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }

  // card — 카드 레이아웃 모방 복합 스켈레톤
  if (variant === 'card') {
    return (
      <div
        aria-busy="true"
        aria-label="콘텐츠를 불러오는 중입니다"
        className={[
          'bg-bg-surface border border-border-light rounded-xl p-6',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* 상단 헤더 영역: 아이콘 + 배지 */}
        <div className="flex items-center justify-between mb-4">
          <div className={`${pulse} bg-neutral-200 rounded-xl w-12 h-12`} />
          <div className={`${pulse} bg-neutral-200 rounded-full w-16 h-5`} />
        </div>
        {/* 본문 텍스트 2줄 */}
        <div className="flex flex-col gap-y-2 mb-4">
          <div className={`${pulse} bg-neutral-200 rounded-md h-4 w-full`} />
          <div className={`${pulse} bg-neutral-200 rounded-md h-4 w-3/4`} />
        </div>
        {/* CTA 영역 */}
        <div className={`${pulse} bg-neutral-200 rounded-md h-4 w-24`} />
      </div>
    );
  }

  // table — 헤더 + 데이터 행
  if (variant === 'table') {
    const rowCount = rows < 1 ? 1 : rows;
    return (
      <div
        aria-busy="true"
        aria-label="콘텐츠를 불러오는 중입니다"
        className={['w-full', className].filter(Boolean).join(' ')}
      >
        {/* 헤더 행 */}
        <div className={`${pulse} bg-neutral-200 rounded-md h-8 w-full mb-2`} />
        {/* 데이터 행 */}
        {Array.from({ length: rowCount }).map((_, i) => (
          <div
            key={i}
            className={`${pulse} bg-neutral-100 rounded-md h-6 w-full my-1`}
          />
        ))}
      </div>
    );
  }

  // rect — 기본 사각형 블록 (default)
  return (
    <div
      aria-busy="true"
      aria-label="콘텐츠를 불러오는 중입니다"
      className={[
        pulse,
        'bg-neutral-200 rounded-xl',
        width ?? 'w-full',
        height ?? 'h-24',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
