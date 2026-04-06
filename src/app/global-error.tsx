'use client';

import '@/app/globals.css';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="ko">
      <body className="bg-bg-page min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6">
          {/* 아이콘 */}
          <div className="relative flex items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute text-[180px] font-black text-primary-50 select-none pointer-events-none leading-none"
            >
              500
            </span>
            <AlertCircle
              className="relative z-10 w-16 h-16 text-error-500"
              strokeWidth={1.5}
            />
          </div>

          {/* 제목 */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-text-primary">
              심각한 오류가 발생했습니다
            </h1>
            <p className="text-base text-text-secondary max-w-sm">
              페이지를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
            </p>
          </div>

          {/* 오류 상세 — 개발 환경에만 표시 */}
          {isDev && error.message && (
            <div className="w-full text-left rounded-lg bg-error-100 p-3">
              <p className="text-xs font-mono text-error-500 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 transition-all duration-150 outline-none bg-primary-500 text-white font-medium hover:bg-primary-600 hover:shadow-sm active:bg-primary-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 px-6 py-3 text-base rounded-lg min-h-[52px] w-full sm:w-auto"
            >
              다시 시도
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 transition-all duration-150 outline-none bg-bg-surface text-text-primary font-medium border border-border-light hover:bg-neutral-50 active:bg-neutral-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 px-6 py-3 text-base rounded-lg min-h-[52px] w-full sm:w-auto"
            >
              홈으로 가기
            </a>
          </div>

          {/* 에러 코드 */}
          <p className="text-xs text-text-muted">
            에러 코드: 500&nbsp;&nbsp;|&nbsp;&nbsp;Digest:{' '}
            <span className="font-mono">{error.digest ?? '-'}</span>
          </p>
        </div>
      </body>
    </html>
  );
}
