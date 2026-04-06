'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, BookOpen, Clock } from 'lucide-react';
import { CHAPTERS } from '@/content/chapters/index';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChapterSearch } from '@/components/learn/ChapterSearch';
import { DifficultyFilter } from '@/components/learn/DifficultyFilter';
import { useVisitedChapters, VisitedDot } from './ProgressTracker';
import type { Difficulty } from '@/content/chapters/index';

/** Difficulty -> Badge variant 매핑 */
const DIFFICULTY_BADGE: Record<Difficulty, 'success' | 'info' | 'warning' | 'error'> = {
  '입문': 'success',
  '기초': 'info',
  '중급': 'warning',
  '심화': 'error',
};

const ALL_LEVELS: Difficulty[] = ['입문', '기초', '중급', '심화'];

export function LearnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { visited } = useVisitedChapters();

  const query = searchParams.get('q')?.trim() ?? '';
  const levelParam = searchParams.get('level') ?? '';
  const selectedLevels: Difficulty[] = levelParam
    ? levelParam.split(',').filter((v): v is Difficulty => (ALL_LEVELS as string[]).includes(v))
    : [];

  const filtered = CHAPTERS.filter((ch) => {
    // 텍스트 검색 (title, description, slug, number)
    const matchesQuery =
      !query ||
      ch.title.toLowerCase().includes(query.toLowerCase()) ||
      ch.description.toLowerCase().includes(query.toLowerCase()) ||
      ch.slug.toLowerCase().includes(query.toLowerCase()) ||
      ch.number.toLowerCase().includes(query.toLowerCase());

    // 난이도 필터
    const matchesDifficulty =
      selectedLevels.length === 0 || selectedLevels.includes(ch.difficulty);

    return matchesQuery && matchesDifficulty;
  });

  const visitedCount = CHAPTERS.filter((ch) => visited.has(ch.slug)).length;

  const handleReset = () => {
    router.push('?', { scroll: false });
  };

  const hasFilter = query || selectedLevels.length > 0;

  return (
    <>
      {/* 진행도 표시 */}
      {visitedCount > 0 && (
        <div className="mb-4 flex items-center gap-1.5 text-sm text-text-muted">
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          {visitedCount}/{CHAPTERS.length}챕터 완료
        </div>
      )}

      {/* 검색 바 */}
      <div className="mb-4">
        <ChapterSearch />
      </div>

      {/* 난이도 필터 */}
      <div className="mb-6">
        <DifficultyFilter />
      </div>

      {/* 결과 요약 */}
      {hasFilter && (
        <p className="mb-4 text-sm text-text-muted">
          {query && <span>&ldquo;{query}&rdquo; </span>}
          {selectedLevels.length > 0 && (
            <span>[{selectedLevels.join(', ')}] </span>
          )}
          검색 결과 {filtered.length}개
        </p>
      )}

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
        /* 빈 결과 상태 */
        <div className="text-center py-16">
          <Search
            className="w-12 h-12 mx-auto mb-4 text-neutral-300"
            aria-hidden="true"
          />
          <p className="text-lg font-medium text-text-primary mb-2">
            {query
              ? <>&ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다.</>
              : '조건에 맞는 챕터가 없습니다.'}
          </p>
          <p className="text-sm text-text-secondary mb-6">
            검색어를 확인하거나 다른 키워드로 검색해 보세요.
          </p>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            검색 초기화
          </Button>
        </div>
      )}
    </>
  );
}
