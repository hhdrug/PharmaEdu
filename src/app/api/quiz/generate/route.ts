/**
 * GET /api/quiz/generate?difficulty=1&type=calc-copay
 *
 * 동적 계산 문제 1건 생성 후 JSON 반환
 * 서버 사이드에서 SupabaseCalcRepository + calc-engine 사용
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { SupabaseCalcRepository } from '@/lib/calc-engine';
import { generateQuestion } from '@/lib/quiz/dynamic-generator';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // ── 파라미터 파싱 ────────────────────────────────────────────────────────
    const rawDifficulty = searchParams.get('difficulty') ?? '1';
    const typeParam = searchParams.get('type') ?? undefined;

    const difficulty = parseInt(rawDifficulty, 10);
    if (![1, 2, 3].includes(difficulty)) {
      return NextResponse.json(
        { error: 'difficulty는 1, 2, 3 중 하나여야 합니다.' },
        { status: 400 }
      );
    }

    const validTypes = ['calc-copay', 'calc-total', 'calc-drug-amount'];
    if (typeParam && !validTypes.includes(typeParam)) {
      return NextResponse.json(
        { error: `type은 ${validTypes.join(', ')} 중 하나여야 합니다.` },
        { status: 400 }
      );
    }

    // ── Supabase + Repository 초기화 ─────────────────────────────────────────
    const supabase = await createServerSupabase();
    const repo = new SupabaseCalcRepository(supabase);

    // ── 문제 생성 ─────────────────────────────────────────────────────────────
    const question = await generateQuestion(
      difficulty as 1 | 2 | 3,
      repo,
      typeParam
    );

    return NextResponse.json(question);
  } catch (err) {
    console.error('[/api/quiz/generate] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
