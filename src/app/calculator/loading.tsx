import { Skeleton } from '@/components/ui/Skeleton';

export default function CalculatorLoading() {
  return (
    <div className="min-h-screen bg-bg-page py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <Skeleton variant="text" rows={1} className="w-40 h-7" />
        </div>

        {/* 계산기 폼 카드 */}
        <div className="bg-bg-surface border border-border-light rounded-xl p-6 mb-6">
          {/* 섹션 제목 */}
          <Skeleton variant="text" rows={1} className="w-32 h-5 mb-6" />

          {/* 인풋 필드 4개 */}
          <div className="flex flex-col gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton variant="text" rows={1} className="w-24 h-4 mb-1" />
                <Skeleton variant="rect" className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* 계산 버튼 */}
          <Skeleton variant="rect" className="h-12 w-full" />
        </div>

        {/* 결과 영역 */}
        <Skeleton variant="card" className="mt-6" />
      </div>
    </div>
  );
}
