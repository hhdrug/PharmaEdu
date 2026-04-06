import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, HelpCircle, BookOpen, LogOut, Plus } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/admin/supabase-admin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { logoutAdmin } from './actions';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const supabase = createAdminClient();

  const [questionResult, categoryResult, historyResult] = await Promise.all([
    supabase
      .from('quiz_question')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('quiz_category')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('calc_history')
      .select('*', { count: 'exact', head: true }),
  ]);

  return {
    questionCount: questionResult.count ?? 0,
    categoryCount: categoryResult.count ?? 0,
    historyCount: historyResult.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect('/admin/login');

  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-bg-page">
      {/* 헤더 */}
      <header className="bg-bg-surface border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary-500" aria-hidden="true" />
            <h1 className="text-lg font-bold text-text-primary">관리자 대시보드</h1>
          </div>
          <form action={logoutAdmin}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="w-4 h-4" aria-hidden="true" />
              로그아웃
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* 통계 카드 */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-4">현황 요약</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="standard" className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                퀴즈 문제 수
              </div>
              <p className="text-3xl font-bold text-primary-500">
                {stats.questionCount.toLocaleString()}
              </p>
            </Card>

            <Card variant="standard" className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                카테고리 수
              </div>
              <p className="text-3xl font-bold text-primary-500">
                {stats.categoryCount.toLocaleString()}
              </p>
            </Card>

            <Card variant="standard" className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                계산 이력 건수
              </div>
              <p className="text-3xl font-bold text-primary-500">
                {stats.historyCount.toLocaleString()}
              </p>
            </Card>
          </div>
        </section>

        {/* 관리 메뉴 */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-4">관리 메뉴</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="elevated" className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-warning-500" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-text-primary">퀴즈 문제 관리</h3>
                  <p className="text-sm text-text-secondary">
                    문제 추가, 수정, 삭제
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/quiz">
                  <Button variant="primary" size="sm">목록 보기</Button>
                </Link>
                <Link href="/admin/questions/new">
                  <Button variant="secondary" size="sm">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    문제 추가
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
