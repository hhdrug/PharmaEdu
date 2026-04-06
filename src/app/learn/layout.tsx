'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CHAPTERS, DIFFICULTY_COLORS } from '@/content/chapters/index';

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 모바일 헤더 (사이드바 토글) */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-neutral-200 sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="챕터 목록 열기/닫기"
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? (
              <>
                <path d="M4 4l12 12M4 16L16 4" />
              </>
            ) : (
              <>
                <path d="M2 5h16M2 10h16M2 15h16" />
              </>
            )}
          </svg>
        </button>
        <span className="font-semibold text-sm text-neutral-700">팜에듀 — 학습</span>
      </div>

      <div className="flex">
        {/* 사이드바 오버레이 (모바일) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 사이드바 */}
        <aside
          className={[
            'fixed top-0 left-0 h-full w-72 bg-white border-r border-neutral-200 z-30 overflow-y-auto transition-transform duration-300',
            'lg:sticky lg:top-0 lg:translate-x-0 lg:flex-shrink-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          ].join(' ')}
        >
          <div className="p-4 border-b border-neutral-100">
            <Link
              href="/learn"
              className="block text-base font-bold text-primary-700 hover:text-primary-500 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              📚 챕터 목록
            </Link>
          </div>

          <nav className="py-2">
            {CHAPTERS.map((chapter) => {
              const href = `/learn/${chapter.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={chapter.slug}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={[
                    'flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-primary-50',
                    isActive
                      ? 'bg-primary-50 border-r-2 border-primary-500 text-primary-700 font-medium'
                      : 'text-neutral-700 border-r-2 border-transparent',
                  ].join(' ')}
                >
                  <span className="flex-shrink-0 w-10 text-xs font-mono text-neutral-400 pt-0.5">
                    {chapter.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium leading-snug">{chapter.title}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[chapter.difficulty]}`}>
                        {chapter.difficulty}
                      </span>
                      <span className="text-xs text-neutral-400">{chapter.estimatedMinutes}분</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
