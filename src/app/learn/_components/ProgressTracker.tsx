'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'pharmaEdu_visitedChapters';

export function useVisitedChapters() {
  const [visited, setVisited] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // localStorage는 SSR에서 접근 불가, effect 내에서 초기화
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setVisited(new Set(JSON.parse(raw) as string[]));
    } catch {
      // localStorage 접근 불가 환경 무시
    }
  }, []);

  const markVisited = (slug: string) => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(slug);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // 저장 실패 무시
      }
      return next;
    });
  };

  return { visited, markVisited };
}

interface VisitedDotProps {
  slug: string;
  visited: Set<string>;
}

export function VisitedDot({ slug, visited }: VisitedDotProps) {
  if (!visited.has(slug)) return null;
  return (
    <CheckCircle
      className="w-4 h-4 text-success-500 flex-shrink-0"
      aria-label="학습 완료"
    />
  );
}

interface ChapterVisitMarkerProps {
  slug: string;
}

/** 챕터 페이지에 마운트하면 자동으로 해당 slug를 visited로 기록 */
export function ChapterVisitMarker({ slug }: ChapterVisitMarkerProps) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const visited: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (!visited.includes(slug)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited, slug]));
      }
    } catch {
      // 무시
    }
  }, [slug]);

  return null;
}
