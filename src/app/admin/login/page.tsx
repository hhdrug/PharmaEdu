import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { loginAdmin } from '../actions';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  // 이미 인증된 경우 대시보드로 이동
  const authenticated = await isAdminAuthenticated();
  if (authenticated) redirect('/admin');

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-bg-surface border border-border-light rounded-xl shadow-md p-8 space-y-6">
          {/* 헤더 */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-500" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">관리자 로그인</h1>
            <p className="text-sm text-text-secondary">
              팜에듀 관리자만 접근할 수 있습니다.
            </p>
          </div>

          {/* 로그인 폼 (클라이언트 컴포넌트) */}
          <LoginForm action={loginAdmin} />
        </div>
      </div>
    </div>
  );
}
