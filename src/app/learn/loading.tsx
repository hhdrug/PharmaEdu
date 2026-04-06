import { Skeleton } from '@/components/ui/Skeleton';

export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-bg-page py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <Skeleton variant="text" rows={1} className="w-48 h-8 mb-2" />
          <Skeleton variant="text" rows={1} className="w-72 h-5" />
        </div>

        {/* 검색바 */}
        <div className="mb-8">
          <Skeleton variant="rect" className="h-10 w-full" />
        </div>

        {/* 챕터 카드 그리드: 6개 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    </div>
  );
}
