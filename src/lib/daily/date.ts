// ── KST 날짜 유틸리티 ────────────────────────────────────────────
// 한국 표준시(UTC+9) 기준으로 날짜를 처리한다.

/** 한국 시간 기준 오늘 날짜 'YYYY-MM-DD' */
export function getTodayKST(): string {
  const now = new Date();
  // UTC 오프셋을 KST(+9h)로 변환
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().slice(0, 10);
}

/**
 * 날짜 문자열('YYYY-MM-DD')을 정수 시드로 변환
 * 예: '2026-04-06' → 20260406
 * quiz/client.ts의 getDailyQuestion와 동일한 알고리즘으로
 * seed % totalCount + 1 을 사용해 문제를 결정적으로 선택한다.
 */
export function getDateSeed(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return year * 10000 + month * 100 + day;
}

/**
 * 'YYYY-MM-DD' 형식의 날짜를 받아 N일 전 날짜 배열 생성 (오늘 포함)
 * 인덱스 0 = 가장 오래된 날짜, 마지막 = 오늘
 */
export function getLast30DayStrings(today: string): string[] {
  const result: string[] = [];
  const base = new Date(today + 'T00:00:00+09:00');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base.getTime() - i * 24 * 60 * 60 * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    result.push(`${y}-${m}-${day}`);
  }
  return result;
}

/** 날짜 'YYYY-MM-DD' → 'M월 D일' 표시용 */
export function formatDateKo(date: string): string {
  const [, m, d] = date.split('-');
  return `${parseInt(m)}월 ${parseInt(d)}일`;
}
