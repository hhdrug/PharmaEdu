import Link from 'next/link';
import { Layers, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DECKS } from '@/content/flashcards';

export const dynamic = 'force-dynamic';

export default function FlashcardsIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2">
          <Layers className="w-7 h-7 text-primary-500" aria-hidden="true" />
          플래시카드
        </h1>
        <p className="text-sm text-text-secondary">
          코드·용어를 단기→장기 기억으로. 덱을 골라 시작하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DECKS.map((deck) => (
          <Link key={deck.id} href={`/flashcards/${deck.id}`} className="block group">
            <Card variant="standard" className="space-y-2 h-full hover:ring-2 hover:ring-primary-500 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{deck.emoji}</span>
                  <h2 className="text-base font-semibold text-text-primary">
                    {deck.title}
                  </h2>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary-500 transition-colors" />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {deck.description}
              </p>
              <p className="text-xs text-text-muted">
                {deck.cards.length}장
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-xs text-text-muted text-center pt-2">
        👉 카드를 클릭하면 뒷면이 뒤집힙니다. 좌우 방향키 또는 버튼으로 이동하세요.
      </p>
    </div>
  );
}
