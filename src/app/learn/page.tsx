'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Clock, BookOpen } from 'lucide-react';
import { CHAPTERS } from '@/content/chapters/index';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useVisitedChapters, VisitedDot } from './_components/ProgressTracker';
import type { Difficulty } from '@/content/chapters/index';

/** Difficulty -> Badge variant 매핑 */
const DIFFICULTY_BADGE: Record<Difficulty, 'success' | 'info' | 'warning' | 'error'> = {
  '입문': 'success',
  '기초': 'info',
  '중급': 'warning',
  '심화': 'error',
};

export default function LearnPage() {
  const [query, setQuery] = useState('');
  const { visited } = useVisitedChapters();

  const filtered = query.trim()
    ? CHAPTERS.filter(
        (ch) =>
          ch.title.includes(query) ||
          ch.description.includes(query) ||
          ch.number.toLowerCase().includes(query.toLowerCase())
      )
    : CHAPTERS;

  const visitedCount = CHAPTERS.filter((ch) => visited.has(ch.slug)).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-3">약제비 계산 학습</h1>
        <p className="text-text-secondary leading-relaxed">
          건강보험 약제비 계산 로직을 13개 챕터로 단계적으로 학습합니다.
          입문부터 심화까지, 순서대로 읽으면 전체 계산 파이프라인을 이해할 수 있습니다.
        </p>

        {/* 난이도 범례 */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(['입문', '기초', '중급', '심화'] as const).map((d) => (
            <Badge key={d} variant={DIFFICULTY_BADGE[d]}>
              {d}
            </Badge>
          ))}
          {visitedCount > 0 && (
            <span className="ml-auto text-sm text-text-muted flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              {visitedCount}/{CHAPTERS.length}챕터 완료
            </span>
          )}
        </div>
      </div>

      {/* 검색 필터 */}
      <div className="mb-6 relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="챕터 제목 또는 키워드로 검색…"
          className={[
            'w-full h-10 pl-9 pr-4',
            'bg-bg-surface border border-border-light rounded-lg',
            'text-sm text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-500/20',
            'transition-colors',
          ].join(' ')}
          aria-label="챕터 검색"
        />
      </div>

      {/* 챕터 그리드 */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/learn/${chapter.slug}`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl"
            >
              <Card
                variant="elevated"
                className="h-full p-5 hover:border-primary-400 transition-all duration-200"
              >
                {/* 상단: 챕터 번호 + 난이도 + 시간 */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-text-muted tracking-wider">
                    {chapter.number}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={DIFFICULTY_BADGE[chapter.difficulty]}>
                      {chapter.difficulty}
                    </Badge>
                    <span className="text-xs text-text-muted flex items-center gap-0.5">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {chapter.estimatedMinutes}분
                    </span>
                    <VisitedDot slug={chapter.slug} visited={visited} />
                  </div>
                </div>

                {/* 챕터 제목 */}
                <h2 className="text-base font-semibold text-text-primary mb-2 group-hover:text-primary-600 transition-colors leading-snug">
                  {chapter.title}
                </h2>

                {/* 챕터 설명 */}
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                  {chapter.description}
                </p>

                {/* 호버 CTA */}
                <div className="mt-4 flex items-center text-primary-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  학습 시작 →
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" aria-hidden="true" />
          <p className="text-sm">
            &ldquo;{query}&rdquo;에 해당하는 챕터가 없습니다.
          </p>
        </div>
      )}

      {/* 하단 안내 */}
      <div className="mt-10 p-5 bg-info-100 rounded-xl border border-info-100 text-sm text-text-primary">
        <strong className="text-info-500">학습 순서 안내:</strong>{' '}
        CH00(기준 데이터)부터 순서대로 학습하는 것을 권장합니다.
        CH01~CH07은 핵심 계산 로직이며, CH08~CH12는 심화 내용입니다.
      </div>
    </div>
  );
}
