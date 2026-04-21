'use client';

/**
 * /auth/sign-in — 이메일 매직 링크 로그인
 *
 * 이메일 입력 → Supabase Magic Link 발송 → 이메일 확인 →
 *   /auth/callback 으로 리다이렉트되어 세션 생성.
 *
 * 비밀번호 미사용 (계정 안전성 + Claude 보안규칙 준수).
 */

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '전송 실패. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card variant="standard" className="space-y-5">
        <div className="space-y-1 text-center">
          <LogIn className="w-10 h-10 text-primary-500 mx-auto" aria-hidden="true" />
          <h1 className="text-xl font-bold text-text-primary">로그인 / 가입</h1>
          <p className="text-sm text-text-secondary">
            이메일로 로그인 링크를 보내드립니다.
            <br />
            비밀번호 없이 안전하게 동기화하세요.
          </p>
        </div>

        {sent ? (
          <div className="space-y-3 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto" aria-hidden="true" />
            <p className="text-sm text-text-primary">
              <strong>{email}</strong> 로 로그인 링크를 보냈습니다.
            </p>
            <p className="text-xs text-text-muted">
              메일함을 확인하고 &quot;로그인&quot; 버튼을 눌러주세요.
              <br />
              스팸함도 확인해보세요.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-text-primary">이메일</span>
              <div className="mt-1 relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-light bg-bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </label>

            {error && (
              <p className="text-sm text-error-500 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? '전송 중…' : '로그인 링크 받기'}
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-border-light">
          <Link href="/" className="text-xs text-text-muted hover:text-primary-500">
            ← 홈으로 돌아가기
          </Link>
        </div>

        <p className="text-xs text-text-muted text-center leading-relaxed">
          로그인하면 오답노트/퀴즈 기록/레슨 진도가 기기 간에 동기화됩니다.
          <br />
          비로그인 상태에서도 모든 기능을 사용할 수 있습니다 (로컬 저장).
        </p>
      </Card>
    </div>
  );
}
