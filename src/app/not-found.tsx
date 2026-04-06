import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import BackButton from './_components/BackButton';

export default function NotFound() {
  return (
    <div className="bg-bg-page min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6">
        {/* 장식용 대형 숫자 (뒤에 깔림) */}
        <div className="relative flex items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute text-[180px] font-black text-primary-50 select-none pointer-events-none leading-none"
          >
            404
          </span>

          {/* 아이콘 */}
          <FileQuestion className="relative z-10 w-16 h-16 text-primary-300" strokeWidth={1.5} />
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-text-primary">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-base text-text-secondary max-w-sm">
            요청하신 페이지를 찾을 수 없습니다.
            <br />
            주소를 다시 확인하거나 홈으로 이동해 주세요.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              홈으로 가기
            </Button>
          </Link>
          <BackButton />
        </div>

        {/* 에러 코드 */}
        <p className="text-xs text-text-muted">에러 코드: 404</p>
      </div>
    </div>
  );
}
