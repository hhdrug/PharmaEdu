import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CHAPTERS, getChapterBySlug, getPrevChapter, getNextChapter, DIFFICULTY_COLORS } from '@/content/chapters/index';
import { loadChapterMarkdown } from '@/lib/content/loader';
import { markdownToHtml } from '@/lib/content/parser';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CHAPTERS.map((ch) => ({ slug: ch.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return { title: '챕터를 찾을 수 없습니다 — 팜에듀' };
  return {
    title: `${chapter.number} ${chapter.title} — 팜에듀`,
    description: chapter.description,
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const markdown = await loadChapterMarkdown(slug);
  if (!markdown) {
    notFound();
  }

  const htmlContent = await markdownToHtml(markdown);
  const prevChapter = getPrevChapter(chapter.order);
  const nextChapter = getNextChapter(chapter.order);

  return (
    <div className="max-w-3xl mx-auto">
      {/* 챕터 메타 헤더 */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-neutral-200">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-mono font-bold text-neutral-400 tracking-wider">{chapter.number}</span>
          <span className={`px-2.5 py-0.5 rounded-full font-medium text-xs ${DIFFICULTY_COLORS[chapter.difficulty]}`}>
            {chapter.difficulty}
          </span>
          <span className="text-neutral-400">예상 학습 시간: {chapter.estimatedMinutes}분</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900 leading-snug">{chapter.title}</h1>
        <p className="mt-1.5 text-sm text-neutral-500">{chapter.description}</p>
      </div>

      {/* 마크다운 콘텐츠 */}
      <div
        className={[
          'bg-white rounded-xl border border-neutral-200 p-6 lg:p-8',
          // 마크다운 스타일링 (Tailwind 4 prose 대신 직접 적용)
          '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-neutral-900',
          '[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-neutral-900 [&_h2]:border-b [&_h2]:border-neutral-100 [&_h2]:pb-2',
          '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-neutral-800',
          '[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-neutral-700',
          '[&_p]:my-3 [&_p]:leading-relaxed [&_p]:text-neutral-700',
          '[&_ul]:my-3 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:space-y-1',
          '[&_ol]:my-3 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1',
          '[&_li]:text-neutral-700 [&_li]:leading-relaxed',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-neutral-500 [&_blockquote]:italic',
          '[&_code]:bg-neutral-100 [&_code]:text-red-600 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono',
          '[&_pre]:bg-neutral-900 [&_pre]:text-neutral-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-sm',
          '[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0 [&_pre_code]:rounded-none',
          '[&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm',
          '[&_th]:border [&_th]:border-neutral-200 [&_th]:p-2.5 [&_th]:bg-neutral-50 [&_th]:font-semibold [&_th]:text-left [&_th]:text-neutral-700',
          '[&_td]:border [&_td]:border-neutral-200 [&_td]:p-2.5 [&_td]:text-neutral-600',
          '[&_tr:hover_td]:bg-neutral-50',
          '[&_a]:text-primary-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary-800',
          '[&_hr]:border-neutral-200 [&_hr]:my-6',
          '[&_strong]:font-semibold [&_strong]:text-neutral-900',
        ].join(' ')}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* 이전/다음 챕터 네비게이션 */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {prevChapter ? (
          <Link
            href={`/learn/${prevChapter.slug}`}
            className="group flex flex-col gap-1 bg-white rounded-xl border border-neutral-200 p-4 hover:border-primary-400 hover:shadow-sm transition-all"
          >
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              ← 이전 챕터
            </span>
            <span className="text-sm font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors leading-snug">
              {prevChapter.number} {prevChapter.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextChapter ? (
          <Link
            href={`/learn/${nextChapter.slug}`}
            className="group flex flex-col gap-1 bg-white rounded-xl border border-neutral-200 p-4 hover:border-primary-400 hover:shadow-sm transition-all text-right ml-auto w-full"
          >
            <span className="text-xs text-neutral-400 flex items-center gap-1 justify-end">
              다음 챕터 →
            </span>
            <span className="text-sm font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors leading-snug">
              {nextChapter.number} {nextChapter.title}
            </span>
          </Link>
        ) : (
          <div className="group flex flex-col gap-1 bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-right">
            <span className="text-xs text-emerald-600">마지막 챕터</span>
            <span className="text-sm font-semibold text-emerald-700">학습 완료!</span>
          </div>
        )}
      </div>
    </div>
  );
}
