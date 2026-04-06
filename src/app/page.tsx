import Link from "next/link";
import { Calculator, BookOpen, ClipboardList, Calendar, Pill } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DailyStatusBanner } from "@/components/home/DailyStatusBanner";

export const dynamic = "force-dynamic";

type TableResult = {
  name: string;
  label: string;
  count: number | null;
  expected: number;
  error: string | null;
};

async function checkConnection() {
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

// ─── 4대 기능 카드 정의 ─────────────────────────────────────────────────────

interface FeatureCard {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  hint: string;
  badge: string;
  badgeVariant: "primary" | "success" | "warning" | "info";
  cta: string;
}

const features: FeatureCard[] = [
  {
    href: "/calculator",
    icon: Calculator,
    title: "조제료 계산기",
    description: "정밀한 약제비 계산 시뮬레이터",
    hint: "건강보험·의료급여·비급여 지원",
    badge: "계산기",
    badgeVariant: "primary",
    cta: "계산 시작하기",
  },
  {
    href: "/learn",
    icon: BookOpen,
    title: "단계별 학습",
    description: "13개 챕터로 배우는 기초부터 실무까지",
    hint: "수가 체계·가산 조건·본인부담율",
    badge: "학습",
    badgeVariant: "success",
    cta: "학습 시작하기",
  },
  {
    href: "/quiz",
    icon: ClipboardList,
    title: "퀴즈",
    description: "100문제로 실력 테스트",
    hint: "챕터별 필터·난이도 선택 지원",
    badge: "퀴즈",
    badgeVariant: "warning",
    cta: "퀴즈 풀기",
  },
  {
    href: "/daily",
    icon: Calendar,
    title: "데일리 챌린지",
    description: "매일 1문제로 꾸준히 학습",
    hint: "스트릭·통계로 학습 습관 형성",
    badge: "데일리",
    badgeVariant: "info",
    cta: "오늘 문제 풀기",
  },
];

export default async function Home() {
  const result = await checkConnection();
  const allOk =
    result.envOk &&
    result.tables.length > 0 &&
    result.tables.every((t) => t.count === t.expected && !t.error);

  return (
    <div className="min-h-screen">
      {/* ── 히어로 섹션 ── */}
      <section className="bg-bg-surface border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Pill className="w-8 h-8 text-primary-500" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary leading-tight">
                팜에듀
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed">
                약국 약제비 계산의 복잡한 규칙을 누구나 스스로 배울 수 있도록,
                <br className="hidden sm:block" />
                시뮬레이션·단계별 학습·퀴즈·데일리 챌린지를 하나의 플랫폼에 통합했습니다.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/calculator">
                <Button size="lg" variant="primary">
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                  계산기 시작하기
                </Button>
              </Link>
              <Link href="/learn">
                <Button size="lg" variant="secondary">
                  <BookOpen className="w-5 h-5" aria-hidden="true" />
                  학습 콘텐츠 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4대 핵심 기능 카드 ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            4대 핵심 기능
          </h2>
          <p className="mt-2 text-text-secondary text-sm sm:text-base">
            학습 → 연습 → 테스트 → 꾸준히
          </p>
        </div>

        {/* 오늘 할 일 배너 */}
        <div className="mb-8">
          <DailyStatusBanner />
        </div>

        {/* 4-card grid: mobile 1열 / tablet 2x2 / desktop 4열 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl"
                aria-label={`${feature.title} 페이지로 이동`}
              >
                <Card
                  variant="elevated"
                  className="h-full flex flex-col gap-4 cursor-pointer group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
                >
                  {/* 아이콘 + 뱃지 */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon
                        className="w-6 h-6 text-primary-500"
                        aria-hidden="true"
                      />
                    </div>
                    <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
                  </div>

                  {/* 텍스트 */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-medium text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {feature.hint}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 group-hover:text-primary-600 transition-colors duration-150">
                      {feature.cta}
                      <svg
                        className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Supabase 연결 상태 (Phase 1 검증용, 유지) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <Card variant="standard" className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span
              className={allOk ? "text-success-500" : "text-error-500"}
              aria-hidden="true"
            >
              {allOk ? "✓" : "✗"}
            </span>
            Supabase 연결 상태
            <Badge variant={allOk ? "success" : "error"}>
              {allOk ? "정상" : "오류"}
            </Badge>
          </h2>

          {!result.envOk && (
            <div className="bg-error-100 border border-error-500/30 rounded-lg p-4 text-sm text-error-500 mb-4">
              <strong>환경 변수 오류:</strong> {result.envError}
            </div>
          )}

          {result.envOk && result.envError && (
            <div className="bg-error-100 border border-error-500/30 rounded-lg p-4 text-sm text-error-500 mb-4">
              <strong>연결 오류:</strong> {result.envError}
            </div>
          )}

          {result.tables.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light text-left text-text-muted">
                    <th className="py-2 font-medium">테이블</th>
                    <th className="py-2 font-medium">설명</th>
                    <th className="py-2 text-right font-medium">실제</th>
                    <th className="py-2 text-right font-medium">예상</th>
                    <th className="py-2 text-right font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {result.tables.map((t) => (
                    <tr key={t.name} className="border-b border-border-light">
                      <td className="py-2 font-mono text-xs">{t.name}</td>
                      <td className="py-2 text-text-secondary">{t.label}</td>
                      <td className="py-2 text-right font-mono">{t.count ?? "—"}</td>
                      <td className="py-2 text-right font-mono text-text-muted">
                        {t.expected}
                      </td>
                      <td className="py-2 text-right">
                        {t.error ? (
                          <Badge variant="error">ERR</Badge>
                        ) : t.count === t.expected ? (
                          <Badge variant="success">OK</Badge>
                        ) : (
                          <Badge variant="error">FAIL</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.tables.some((t) => t.error) && (
            <div className="mt-4 bg-error-100 border border-error-500/30 rounded-lg p-4 text-xs text-error-500">
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

          {result.sample && (
            <div className="mt-6 pt-4 border-t border-border-light">
              <h3 className="text-base font-semibold mb-3">샘플 조회</h3>
              <p className="text-sm text-text-muted mb-2">2026년 Z1000 (약국관리료)</p>
              <div className="bg-bg-panel rounded-lg p-4 font-mono text-sm space-y-1">
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
            </div>
          )}

          {result.sampleError && (
            <div className="mt-4 bg-error-100 border border-error-500/30 rounded-lg p-4 text-sm text-error-500">
              <strong>샘플 조회 오류:</strong> {result.sampleError}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
