/**
 * /swipe 라우트 스켈레톤 — 클릭 즉시 표시되어 사용자에게 "이미 페이지가 떴다" 인지 부여.
 * SwipeQuiz의 실제 레이아웃(상단 stat bar + 메타 + 문제 + 4개 선지 + 하단 액션바)을
 * pulse 애니메이션으로 모방. 서버 fetch 완료 시 자연스럽게 실 카드로 교체됨.
 */
export default function SwipeLoading() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-base animate-pulse">
      {/* 상단 stat bar */}
      <div className="sticky top-0 z-30 bg-bg-surface border-b border-border-light">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg bg-neutral-100" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-5 rounded bg-neutral-100" />
            <div className="w-14 h-5 rounded bg-neutral-100" />
            <div className="w-10 h-4 rounded bg-neutral-100" />
          </div>
        </div>
      </div>

      {/* 카드 영역 */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-2xl w-full mx-auto px-4 py-4 flex-1 flex flex-col">
          {/* 메타 chips */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-14 h-5 rounded bg-neutral-100" />
            <div className="w-16 h-4 rounded bg-neutral-100" />
          </div>

          {/* 문제 텍스트 — 3줄 placeholder */}
          <div className="space-y-2 mb-5">
            <div className="h-5 rounded bg-neutral-100 w-full" />
            <div className="h-5 rounded bg-neutral-100 w-11/12" />
            <div className="h-5 rounded bg-neutral-100 w-2/3" />
          </div>

          {/* 선지 4개 큰 박스 */}
          <div className="space-y-2.5 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full min-h-[56px] px-4 py-3 rounded-xl border-2 border-border-light bg-bg-surface flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-neutral-100 flex-shrink-0" />
                <div className="flex-1 h-4 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 액션바 */}
      <div
        className="sticky bottom-0 z-30 bg-bg-surface border-t border-border-light"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="flex-shrink-0 h-12 w-24 rounded-xl bg-neutral-100" />
          <div className="flex-1 h-4 rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
