import { getDailyQuestion } from '@/lib/quiz/client';
import { DailyPlayer } from './DailyPlayer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function DailyPlayPage() {
  const question = await getDailyQuestion();

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-text-secondary text-lg">오늘의 문제를 불러올 수 없습니다.</p>
        <p className="text-text-muted text-sm">잠시 후 다시 시도하거나 Supabase seed를 확인하세요.</p>
        <Link href="/daily">
          <Button variant="primary">돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <DailyPlayer question={question} />
    </div>
  );
}
