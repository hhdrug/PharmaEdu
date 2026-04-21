/**
 * /auth/callback
 *
 * Supabase 매직 링크 / OAuth 콜백 핸들러.
 * 이메일에서 링크 클릭 → 여기로 리다이렉트됨. code 를 세션으로 교환.
 * 완료 후 홈으로 이동.
 */

import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/?signedin=1';

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('[auth/callback] exchange failed:', error);
  }

  return NextResponse.redirect(`${origin}/auth/sign-in?error=callback`);
}
