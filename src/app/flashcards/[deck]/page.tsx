import { notFound } from 'next/navigation';
import { getDeck } from '@/content/flashcards';
import { FlashcardPlayer } from './FlashcardPlayer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ deck: string }>;
}

export default async function FlashcardDeckPage({ params }: PageProps) {
  const { deck: deckId } = await params;
  const deck = getDeck(deckId);
  if (!deck) notFound();
  return <FlashcardPlayer deck={deck} />;
}
