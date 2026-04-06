import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/admin/supabase-admin';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QuizTableRow } from './QuizTableRow';
import type { QuizQuestion } from '@/lib/quiz/types';
import { DIFFICULTY_LABEL } from '@/lib/quiz/types';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

interface AdminQuizPageProps {
  searchParams: Promise<{
    page?: string;
    chapter?: string;
    difficulty?: string;
    q?: string;
  }>;
}

export default async function AdminQuizPage({ searchParams }: AdminQuizPageProps) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect('/admin/login');

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? '1'));
  const chapter = params.chapter ?? '';
  const difficulty = params.difficulty ?? '';
  const q = params.q ?? '';

  const supabase = createAdminClient();

  // 필터 쿼리 빌드
  let query = supabase
    .from('quiz_question')
    .select('*', { count: 'exact' })
    .order('id');

  if (chapter) query = query.eq('chapter', chapter);
  if (difficulty) query = query.eq('difficulty', Number(difficulty));
  if (q) query = query.ilike('question', `%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  const questions = (data ?? []) as QuizQuestion[];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-bg-page">
      {/* 헤더 */}
      <header className="bg-bg-surface border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                대시보드
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-text-primary">퀴즈 문제 관리</h1>
          </div>
          <Link href="/admin/questions/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" aria-hidden="true" />
              문제 추가
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 필터/검색 */}
        <form method="GET" className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="chapter-filter" className="text-xs font-medium text-text-secondary">
              챕터
            </label>
            <select
              id="chapter-filter"
              name="chapter"
              defaultValue={chapter}
              className="h-9 px-3 text-sm border border-border-light rounded-lg bg-bg-surface outline-none focus:border-border-focus"
            >
              <option value="">전체</option>
              {Array.from({ length: 12 }, (_, i) => {
                const ch = `CH${String(i + 1).padStart(2, '0')}`;
                return (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="difficulty-filter" className="text-xs font-medium text-text-secondary">
              난이도
            </label>
            <select
              id="difficulty-filter"
              name="difficulty"
              defaultValue={difficulty}
              className="h-9 px-3 text-sm border border-border-light rounded-lg bg-bg-surface outline-none focus:border-border-focus"
            >
              <option value="">전체</option>
              <option value="1">쉬움</option>
              <option value="2">보통</option>
              <option value="3">어려움</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label htmlFor="q-filter" className="text-xs font-medium text-text-secondary">
              검색
            </label>
            <input
              id="q-filter"
              name="q"
              type="text"
              defaultValue={q}
              placeholder="문제 내용 검색..."
              className="h-9 px-3 text-sm border border-border-light rounded-lg bg-bg-surface outline-none focus:border-border-focus"
            />
          </div>

          <Button type="submit" variant="secondary" size="sm">
            검색
          </Button>
          <Link href="/admin/quiz">
            <Button variant="ghost" size="sm">초기화</Button>
          </Link>
        </form>

        {/* 결과 수 */}
        <p className="text-sm text-text-secondary">
          전체 <span className="font-semibold text-text-primary">{totalCount}</span>건
        </p>

        {/* 빈 상태 */}
        {questions.length === 0 && (
          <div className="bg-bg-surface border border-border-light rounded-xl p-12 text-center space-y-3">
            <p className="text-text-secondary">등록된 문제가 없습니다.</p>
            <Link href="/admin/questions/new">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4" aria-hidden="true" />
                첫 문제 추가하기
              </Button>
            </Link>
          </div>
        )}

        {/* 데스크탑/태블릿 테이블 */}
        {questions.length > 0 && (
          <>
            {/* 테이블 (sm 이상) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-border-light">
              <table className="w-full text-sm">
                <thead className="bg-bg-panel border-b border-border-light">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-text-secondary w-12">#</th>
                    <th className="px-4 py-3 text-left font-medium text-text-secondary w-20">챕터</th>
                    <th className="px-4 py-3 text-left font-medium text-text-secondary">문제</th>
                    <th className="px-4 py-3 text-left font-medium text-text-secondary w-20">난이도</th>
                    <th className="px-4 py-3 text-left font-medium text-text-secondary w-24">등록일</th>
                    <th className="px-4 py-3 text-center font-medium text-text-secondary w-24">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light bg-bg-surface">
                  {questions.map((q) => (
                    <QuizTableRow key={q.id} question={q} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 (sm 미만) */}
            <div className="sm:hidden space-y-3">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-bg-surface border border-border-light rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary">
                      {question.chapter}
                    </span>
                    <Badge
                      variant={
                        question.difficulty === 1
                          ? 'success'
                          : question.difficulty === 2
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {DIFFICULTY_LABEL[question.difficulty]}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-primary line-clamp-2">
                    {question.question}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(question.created_at).toLocaleDateString('ko-KR')}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Link href={`/admin/questions/${question.id}/edit`}>
                      <Button variant="secondary" size="sm">수정</Button>
                    </Link>
                    <QuizTableRow question={question} mobileDeleteOnly />
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/quiz?page=${page - 1}&chapter=${chapter}&difficulty=${difficulty}&q=${q}`}
                  >
                    <Button variant="secondary" size="sm">← 이전</Button>
                  </Link>
                )}
                <span className="text-sm text-text-secondary">
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/admin/quiz?page=${page + 1}&chapter=${chapter}&difficulty=${difficulty}&q=${q}`}
                  >
                    <Button variant="secondary" size="sm">다음 →</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {error && (
          <div className="bg-error-100 border border-error-500/30 rounded-lg px-4 py-3 text-sm text-error-500">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        )}
      </main>
    </div>
  );
}
