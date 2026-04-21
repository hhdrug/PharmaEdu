'use client';

/**
 * UserMenu — Header 우측의 로그인/프로필 버튼.
 *
 * 미로그인:
 *   [로그인] 버튼 → /auth/sign-in
 *
 * 로그인:
 *   [이메일 첫 글자 아바타] 드롭다운 → 이메일 표시 / 동기화 / 로그아웃
 *   로그인 직후 자동으로 syncAll() 1회 실행 (신규 세션 감지).
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogIn, LogOut, RefreshCw, Check, CloudOff, Cloud } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth/session';
import { syncAll } from '@/lib/sync/cloud-sync';

export function UserMenu() {
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastSessionIdRef = useRef<string | null>(null);

  // 바깥 클릭 감지
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // 로그인 직후 자동 동기화 (세션 id 변경 감지)
  useEffect(() => {
    if (!user?.id) return;
    if (lastSessionIdRef.current === user.id) return;
    lastSessionIdRef.current = user.id;
    void handleSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleSync() {
    if (!user?.id || syncing) return;
    setSyncing(true);
    try {
      const result = await syncAll(user.id);
      setLastSync(
        `동기화 완료 — 오답 ${result.wrongNotes}, 기록 ${result.quizHistory}`,
      );
      setTimeout(() => setLastSync(null), 4000);
    } catch (err) {
      console.error('[UserMenu] sync failed', err);
      setLastSync('동기화 실패. 잠시 후 다시 시도.');
      setTimeout(() => setLastSync(null), 4000);
    } finally {
      setSyncing(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setOpen(false);
  }

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-neutral-100 animate-pulse" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/sign-in"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <LogIn className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">로그인</span>
      </Link>
    );
  }

  const initial = (user.email ?? '?').charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-primary-500 text-white text-sm font-semibold flex items-center justify-center hover:bg-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        aria-label="사용자 메뉴"
        aria-expanded={open}
      >
        {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl bg-bg-surface border border-border-light shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-border-light">
            <p className="text-xs text-text-muted">로그인 계정</p>
            <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            role="menuitem"
            className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-neutral-50 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>동기화 중…</span>
              </>
            ) : lastSync ? (
              <>
                <Check className="w-4 h-4 text-success-500" />
                <span className="text-xs">{lastSync}</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-primary-500" />
                <span>지금 동기화</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            role="menuitem"
            className="w-full px-4 py-2.5 text-left text-sm text-error-500 hover:bg-error-100 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 헤더 외 다른 위치에서 로그인 상태에 따라 안내 배너를 띄우고 싶을 때 사용.
 */
export function CloudStatusBadge() {
  const { user } = useSession();
  if (user) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success-500">
        <Cloud className="w-3.5 h-3.5" /> 동기화 중
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-muted">
      <CloudOff className="w-3.5 h-3.5" /> 로컬 저장
    </span>
  );
}
