import Link from 'next/link';
import { CHAPTERS, DIFFICULTY_COLORS } from '@/content/chapters/index';

export const metadata = {
  title: '학습 — 팜에듀',
  description: '약국 약제비 계산 로직을 13개 챕터로 단계별 학습합니다.',
};

export default function LearnPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">약제비 계산 학습</h1>
        <p className="text-neutral-600 leading-relaxed">
          건강보험 약제비 계산 로직을 13개 챕터로 단계적으로 학습합니다.
          입문부터 심화까지, 순서대로 읽으면 전체 계산 파이프라인을 이해할 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(['입문', '기초', '중급', '심화'] as const).map((d) => (
            <span key={d} className={`text-xs px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_COLORS[d]}`}>
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* 챕터 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CHAPTERS.map((chapter) => (
          <Link
            key={chapter.slug}
            href={`/learn/${chapter.slug}`}
            className="group block bg-white rounded-xl border border-neutral-200 p-5 hover:border-primary-400 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-neutral-400 tracking-wider">
                {chapter.number}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[chapter.difficulty]}`}>
                  {chapter.difficulty}
                </span>
                <span className="text-xs text-neutral-400">{chapter.estimatedMinutes}분</span>
              </div>
            </div>

            <h2 className="text-base font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors leading-snug">
              {chapter.title}
            </h2>

            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">
              {chapter.description}
            </p>

            <div className="mt-4 flex items-center text-primary-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              학습 시작 →
            </div>
          </Link>
        ))}
      </div>

      {/* 하단 안내 */}
      <div className="mt-10 p-5 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
        <strong>학습 순서 안내:</strong> CH00(기준 데이터)부터 순서대로 학습하는 것을 권장합니다.
        CH01~CH07은 핵심 계산 로직이며, CH08~CH12는 심화 내용입니다.
      </div>
    </div>
  );
}
