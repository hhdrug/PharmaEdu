/**
 * /api/calculate — 약제비 계산 Route Handler
 * POST { CalcOptions } → CalcResult
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { calculate, SupabaseCalcRepository } from '@/lib/calc-engine';
import type { CalcOptions } from '@/lib/calc-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CalcOptions;

    // 기본 유효성 검사
    if (!body || !body.insuCode || !body.drugList) {
      return NextResponse.json(
        { error: '필수 입력값이 누락되었습니다 (insuCode, drugList)' },
        { status: 400 }
      );
    }

    // dosDate 자동 설정 (미전달 시 오늘 날짜)
    if (!body.dosDate) {
      const now = new Date();
      body.dosDate = now.toISOString().replace(/-/g, '').substring(0, 8);
    }

    // Supabase 클라이언트 + 리포지토리 생성
    const supabase = await createServerSupabase();
    const repo = new SupabaseCalcRepository(supabase);

    // 계산 실행
    const result = await calculate(body, repo);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (e) {
    console.error('[/api/calculate] 오류:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '서버 오류' },
      { status: 500 }
    );
  }
}
