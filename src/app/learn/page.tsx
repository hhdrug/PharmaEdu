import { Suspense } from 'react';
import { Badge } from '@/components/ui/Badge';
import { LearnContent } from './_components/LearnContent';
import type { Difficulty } from '@/content/chapters/index';

/** Difficulty -> Badge variant 매핑 */
const DIFFICULTY_BADGE: Record<Difficulty, 'success' | 'info' | 'warning' | 'error'> = {
  '입문': 'success',
  '기초': 'info',
  '중급': 'warning',
  '심화': 'error',
};

export default function LearnPage() {
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
        </div>
      </div>

      {/* 검색 + 필터 + 챕터 목록 — useSearchParams 사용 영역 */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-10 bg-bg-surface border border-border-light rounded-lg animate-pulse" />
            <div className="flex gap-2">
              {['전체', '입문', '기초', '중급', '심화'].map((l) => (
                <div
                  key={l}
                  className="h-7 w-12 bg-bg-surface border border-border-light rounded-full animate-pulse"
                />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-bg-surface border border-border-light rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        }
      >
        <LearnContent />
      </Suspense>

      {/* 하단 안내 */}
      <div className="mt-10 p-5 bg-info-100 rounded-xl border border-info-100 text-sm text-text-primary">
        <strong className="text-info-500">학습 순서 안내:</strong>{' '}
        CH00(기준 데이터)부터 순서대로 학습하는 것을 권장합니다.
        CH01~CH07은 핵심 계산 로직이며, CH08~CH12는 심화 내용입니다.
      </div>
    </div>
  );
}
