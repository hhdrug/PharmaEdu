'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full sm:w-auto"
      onClick={() => router.back()}
    >
      이전 페이지로
    </Button>
  );
}
