import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type TableResult = {
  name: string;
  label: string;
  count: number | null;
  expected: number;
  error: string | null;
};

async function checkConnection() {
  // 환경 변수 체크
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      envOk: false,
      envError: `환경 변수 누락: URL=${!!url}, KEY=${!!key}`,
      tables: [] as TableResult[],
      sample: null,
      sampleError: null as string | null,
    };
  }

  try {
    const supabase = await createServerSupabase();

    const tableSpecs: { name: string; label: string; expected: number }[] = [
      { name: "suga_fee", label: "수가 단가", expected: 568 },
      { name: "fee_base_params", label: "기본 파라미터", expected: 3 },
      { name: "insu_rate", label: "보험요율", expected: 18 },
      { name: "holiday", label: "공휴일", expected: 53 },
      { name: "presc_dosage_fee", label: "투약일수 조제료", expected: 50 },
    ];

    const tables: TableResult[] = await Promise.all(
      tableSpecs.map(async (spec) => {
        try {
          const { count, error } = await supabase
            .from(spec.name)
            .select("*", { count: "exact", head: true });
          return {
            ...spec,
            count: count ?? null,
            error: error?.message ?? null,
          };
        } catch (e) {
          return {
            ...spec,
            count: null,
            error: e instanceof Error ? e.message : String(e),
          };
        }
      })
    );

    const { data: sample, error: sampleError } = await supabase
      .from("suga_fee")
      .select("code, name, price")
      .eq("apply_year", 2026)
      .eq("code", "Z1000")
      .maybeSingle();

    return {
      envOk: true,
      envError: null,
      tables,
      sample,
      sampleError: sampleError?.message ?? null,
    };
  } catch (e) {
    return {
      envOk: true,
      envError: e instanceof Error ? e.message : String(e),
      tables: [] as TableResult[],
      sample: null,
      sampleError: null,
    };
  }
}

export default async function Home() {
  const result = await checkConnection();
  const allOk =
    result.envOk &&
    result.tables.length > 0 &&
    result.tables.every((t) => t.count === t.expected && !t.error);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-blue-600">팜에듀</h1>
          <p className="text-slate-600">약국 조제료 계산 시뮬레이터 + 퀴즈 학습 플랫폼</p>
        </header>

        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className={allOk ? "text-green-600" : "text-red-600"}>
              {allOk ? "✓" : "✗"}
            </span>
            Supabase 연결 상태
          </h2>

          {!result.envOk && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700 mb-4">
              <strong>환경 변수 오류:</strong> {result.envError}
            </div>
          )}

          {result.envOk && result.envError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700 mb-4">
              <strong>연결 오류:</strong> {result.envError}
            </div>
          )}

          {result.tables.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2">테이블</th>
                  <th className="py-2">설명</th>
                  <th className="py-2 text-right">실제</th>
                  <th className="py-2 text-right">예상</th>
                  <th className="py-2 text-right">상태</th>
                </tr>
              </thead>
              <tbody>
                {result.tables.map((t) => (
                  <tr key={t.name} className="border-b">
                    <td className="py-2 font-mono text-xs">{t.name}</td>
                    <td className="py-2">{t.label}</td>
                    <td className="py-2 text-right font-mono">{t.count ?? "—"}</td>
                    <td className="py-2 text-right font-mono text-slate-400">
                      {t.expected}
                    </td>
                    <td className="py-2 text-right">
                      {t.error ? (
                        <span className="text-red-600" title={t.error}>
                          ERR
                        </span>
                      ) : t.count === t.expected ? (
                        <span className="text-green-600">OK</span>
                      ) : (
                        <span className="text-red-600">FAIL</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {result.tables.some((t) => t.error) && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded p-4 text-xs text-red-700">
              <strong>테이블별 오류:</strong>
              <ul className="mt-2 space-y-1">
                {result.tables
                  .filter((t) => t.error)
                  .map((t) => (
                    <li key={t.name}>
                      <span className="font-mono">{t.name}</span>: {t.error}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </section>

        {result.sample && (
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">샘플 조회</h2>
            <p className="text-sm text-slate-500 mb-2">2026년 Z1000 (약국관리료)</p>
            <div className="bg-slate-50 rounded p-4 font-mono text-sm">
              <div>
                code: <strong>{result.sample.code}</strong>
              </div>
              <div>
                name: <strong>{result.sample.name}</strong>
              </div>
              <div>
                price: <strong>{result.sample.price}원</strong>
              </div>
            </div>
          </section>
        )}

        {result.sampleError && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700">
            <strong>샘플 조회 오류:</strong> {result.sampleError}
          </div>
        )}

        <section className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-3xl mb-2">🧮</div>
            <h3 className="font-semibold">계산기</h3>
            <p className="text-xs text-slate-500 mt-1">조제료 시뮬레이터</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold">퀴즈</h3>
            <p className="text-xs text-slate-500 mt-1">매일 1문제 풀기</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-3xl mb-2">📖</div>
            <h3 className="font-semibold">학습</h3>
            <p className="text-xs text-slate-500 mt-1">단계별 교육</p>
          </div>
        </section>
      </div>
    </main>
  );
}
