import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서는 쿠키 설정 불가 — 무시
          }
        },
      },
    }
  );
}

/**
 * 쿠키를 읽지 않는 공개 데이터 전용 서버 클라이언트.
 *
 * 일반 createServerSupabase 는 cookies() 를 호출 → Next.js가 페이지를
 * 강제로 dynamic 으로 분류 → ISR/revalidate 무력화. 공개 퀴즈 데이터처럼
 * 사용자 컨텍스트가 필요 없는 SELECT 에는 이걸 써야 페이지가 빌드타임에
 * 정적 생성되거나 ISR 캐시가 정상 작동함.
 */
export function createPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
