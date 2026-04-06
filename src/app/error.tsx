'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="bg-bg-page min-h-screen flex flex-col items-center justify-center p-4">
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
            문제가 발생했습니다
          </h1>
          <p className="text-base text-text-secondary max-w-sm">
            잠시 후 다시 시도하거나, 홈으로 이동해 주세요.
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
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={reset}
          >
            다시 시도
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              홈으로 가기
            </Button>
          </Link>
        </div>

        {/* 에러 코드 */}
        <p className="text-xs text-text-muted">
          에러 코드: 500&nbsp;&nbsp;|&nbsp;&nbsp;Digest:{' '}
          <span className="font-mono">{error.digest ?? '-'}</span>
        </p>
      </div>
    </div>
  );
}
