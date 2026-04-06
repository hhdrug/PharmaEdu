import { getChapterQuestionCount } from '@/lib/quiz/client';
import { ChapterQuizLink } from './ChapterQuizLink';

interface ChapterQuizLinkServerProps {
  /** 'CH01' 형식의 챕터 번호 */
  chapterNumber: string;
}

/**
 * ChapterQuizLinkServer (서버 컴포넌트)
 * ─────────────────────────────────────
 * Supabase에서 챕터별 문제 수를 서버 사이드로 조회한 뒤
 * 클라이언트 컴포넌트인 ChapterQuizLink에 props로 전달한다.
 */
export async function ChapterQuizLinkServer({ chapterNumber }: ChapterQuizLinkServerProps) {
  const questionCount = await getChapterQuestionCount(chapterNumber);

  return (
    <ChapterQuizLink
      chapterNumber={chapterNumber}
      questionCount={questionCount}
    />
  );
}
