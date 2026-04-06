export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-blue-600">팜에듀</h1>
        <p className="text-lg text-slate-600">
          약국 조제료 계산 시뮬레이터 + 퀴즈 학습 플랫폼
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <div className="bg-white rounded-xl shadow-sm border p-6 w-48">
            <div className="text-3xl mb-2">🧮</div>
            <h2 className="font-semibold">계산기</h2>
            <p className="text-sm text-slate-500 mt-1">조제료 시뮬레이터</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 w-48">
            <div className="text-3xl mb-2">📝</div>
            <h2 className="font-semibold">퀴즈</h2>
            <p className="text-sm text-slate-500 mt-1">매일 1문제 풀기</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 w-48">
            <div className="text-3xl mb-2">📖</div>
            <h2 className="font-semibold">학습</h2>
            <p className="text-sm text-slate-500 mt-1">단계별 교육</p>
          </div>
        </div>
      </div>
    </main>
  );
}
