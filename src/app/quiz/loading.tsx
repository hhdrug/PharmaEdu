import { Skeleton } from '@/components/ui/Skeleton';

export default function QuizLoading() {
  return (
    <div className="min-h-screen bg-bg-page py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 페이지 제목 */}
        <div className="mb-6">
          <Skeleton variant="text" rows={1} className="w-32 h-8" />
        </div>

        {/* 필터 영역 */}
        <div className="mb-8">
          <Skeleton variant="rect" className="h-12 w-full" />
        </div>

        {/* 카드 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    </div>
  );
}
