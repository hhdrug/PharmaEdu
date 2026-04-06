import { createClient } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase-server';
import type { QuizQuestion, QuizCategory } from './types';

// ── 카테고리 조회 ────────────────────────────────────────────────

/** 모든 카테고리 조회 (order_idx 순) — 서버 컴포넌트용 */
export async function getCategories(): Promise<QuizCategory[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('quiz_category')
    .select('*')
    .order('order_idx');

  if (error) {
    console.error('[quiz/client] getCategories error:', error.message);
    return [];
  }
  return (data ?? []) as QuizCategory[];
}

// ── 문제 조회 ────────────────────────────────────────────────────

/** 전체 문제 목록 (서버 컴포넌트용) */
export async function getAllQuestions(): Promise<QuizQuestion[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('quiz_question')
    .select('*')
    .order('id');

  if (error) {
    console.error('[quiz/client] getAllQuestions error:', error.message);
    return [];
  }
  return (data ?? []) as QuizQuestion[];
}

/** 총 문제 수 조회 (서버 컴포넌트용) */
export async function getQuestionCount(): Promise<number> {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from('quiz_question')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count ?? 0;
}

/**
 * 챕터별 문제 수 조회 (서버 컴포넌트용)
 * @param chapterNumber - 'CH01' 형식의 챕터 번호
 */
export async function getChapterQuestionCount(chapterNumber: string): Promise<number> {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from('quiz_question')
    .select('*', { count: 'exact', head: true })
    .eq('chapter', chapterNumber);

  if (error) {
    console.error('[quiz/client] getChapterQuestionCount error:', error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * 조건별 문제 조회 (서버 컴포넌트용)
 * @param chapter - 챕터 필터 ('CH01' 등). undefined이면 전체
 * @param difficulty - 난이도 필터. undefined이면 전체
 * @param limit - 최대 반환 수
 */
export async function getQuestions(opts?: {
  chapter?: string;
  difficulty?: 1 | 2 | 3;
  limit?: number;
}): Promise<QuizQuestion[]> {
  const supabase = await createServerSupabase();
  let query = supabase.from('quiz_question').select('*').order('id');

  if (opts?.chapter) {
    query = query.eq('chapter', opts.chapter);
  }
  if (opts?.difficulty) {
    query = query.eq('difficulty', opts.difficulty);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[quiz/client] getQuestions error:', error.message);
    return [];
  }
  return (data ?? []) as QuizQuestion[];
}

/**
 * 무작위 N개 문제 (서버 컴포넌트용)
 * get_random_questions RPC를 사용해 DB에서 직접 랜덤 샘플링 (migration 003 이후).
 * RPC가 없는 환경(local 개발 등)에서는 COUNT → random offset 방식으로 fallback.
 */
export async function getRandomQuestions(n: number): Promise<QuizQuestion[]> {
  const supabase = await createServerSupabase();

  // 1차 시도: RPC 방식 (DB-side ORDER BY random())
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_random_questions', { n });

  if (!rpcError && rpcData && rpcData.length > 0) {
    return rpcData as QuizQuestion[];
  }

  // fallback: COUNT → 랜덤 오프셋 2회 분산 샘플링
  const { count } = await supabase
    .from('quiz_question')
    .select('*', { count: 'exact', head: true });

  const total = count ?? 0;
  if (total === 0) return [];

  const offset = Math.floor(Math.random() * Math.max(0, total - n));
  const { data, error } = await supabase
    .from('quiz_question')
    .select('*')
    .range(offset, offset + n - 1);

  if (error) {
    console.error('[quiz/client] getRandomQuestions fallback error:', error.message);
    return [];
  }
  // 클라이언트 셔플은 fallback에서만 수행
  return ([...(data ?? [])] as QuizQuestion[]).sort(() => Math.random() - 0.5);
}

/**
 * 오늘의 1문제 (날짜 시드 기반 — 결정적)
 * id % totalCount 방식으로 매일 같은 문제를 선택
 */
export async function getDailyQuestion(): Promise<QuizQuestion | null> {
  const total = await getQuestionCount();
  if (total === 0) return null;

  const today = new Date();
  // 날짜를 숫자로 변환 (YYYYMMDD)
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  const targetId = (seed % total) + 1; // 1-indexed ID 범위에 근사

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('quiz_question')
    .select('*')
    .gte('id', targetId)
    .order('id')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    // fallback: 첫 번째 문제
    const { data: fallback } = await supabase
      .from('quiz_question')
      .select('*')
      .order('id')
      .limit(1)
      .maybeSingle();
    return (fallback as QuizQuestion) ?? null;
  }
  return data as QuizQuestion;
}

// ── 클라이언트 컴포넌트용 (브라우저 supabase) ───────────────────

/**
 * 클라이언트 컴포넌트에서 문제 조회
 * 'use client' 컴포넌트에서 직접 사용
 */
export async function getQuestionsClient(opts?: {
  chapter?: string;
  difficulty?: 1 | 2 | 3;
  limit?: number;
}): Promise<QuizQuestion[]> {
  const supabase = createClient();
  let query = supabase.from('quiz_question').select('*').order('id');

  if (opts?.chapter) query = query.eq('chapter', opts.chapter);
  if (opts?.difficulty) query = query.eq('difficulty', opts.difficulty);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    console.error('[quiz/client] getQuestionsClient error:', error.message);
    return [];
  }
  return (data ?? []) as QuizQuestion[];
}

/** 클라이언트 컴포넌트에서 카테고리 조회 */
export async function getCategoriesClient(): Promise<QuizCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('quiz_category')
    .select('*')
    .order('order_idx');
  if (error) return [];
  return (data ?? []) as QuizCategory[];
}

/**
 * slug → chapter 조회 (DB-driven, 서버 컴포넌트용)
 * migration 003 적용 후 quiz_category.chapter 컬럼에서 읽어옴.
 * 컬럼이 없거나 null이면 null 반환.
 */
export async function getCategoryChapter(slug: string): Promise<string | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('quiz_category')
    .select('chapter')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    console.error('[quiz/client] getCategoryChapter error:', error?.message);
    return null;
  }
  return (data as { chapter: string | null }).chapter;
}

/**
 * 클라이언트 컴포넌트에서 무작위 N개 문제 조회
 * get_random_questions RPC 사용, fallback으로 클라이언트 셔플
 */
export async function getRandomQuestionsClient(n: number): Promise<QuizQuestion[]> {
  const supabase = createClient();

  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_random_questions', { n });

  if (!rpcError && rpcData && rpcData.length > 0) {
    return rpcData as QuizQuestion[];
  }

  // fallback: 전체 조회 후 클라이언트 셔플
  const { data, error } = await supabase
    .from('quiz_question')
    .select('*');
  if (error) return [];
  return ([...(data ?? [])] as QuizQuestion[])
    .sort(() => Math.random() - 0.5)
    .slice(0, n);
}
