'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  action: (formData: FormData) => Promise<{ error?: string }>;
}

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return action(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="관리자 비밀번호"
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="비밀번호를 입력하세요"
        errorText={state?.error}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isPending}
        className="w-full"
      >
        로그인
      </Button>
    </form>
  );
}
