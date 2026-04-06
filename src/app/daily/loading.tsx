import { Skeleton } from '@/components/ui/Skeleton';

export default function DailyLoading() {
  return (
    <div className="min-h-screen bg-bg-page py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 상단 진행 정보 */}
        <div className="mb-6">
          <Skeleton variant="text" rows={1} className="w-48 h-6" />
        </div>

        {/* 문제 영역 */}
        <div className="bg-bg-surface border border-border-light rounded-xl p-6 mb-6">
          <Skeleton variant="rect" className="h-32 w-full" />
        </div>

        {/* 선택지 4개 */}
        <div className="flex flex-col gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-12 w-full" />
          ))}
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end">
          <Skeleton variant="rect" className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
