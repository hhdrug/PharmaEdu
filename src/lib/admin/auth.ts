/**
 * Admin 인증 유틸리티 (서버 전용)
 *
 * 환경변수 ADMIN_PASSWORD 와 쿠키 기반 세션을 사용합니다.
 * 이 파일은 클라이언트에서 절대 import 하지 마십시오.
 *
 * .env.local 설정 필요:
 *   ADMIN_PASSWORD=choose-a-strong-password
 */

import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'pharmaedu_admin';

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24시간
    path: '/admin',
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === 'authenticated';
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
