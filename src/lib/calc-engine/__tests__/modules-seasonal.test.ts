/**
 * modules-seasonal.test.ts
 * detectSeasonalHoliday / calcSeasonalSurcharge 단위 테스트
 */

import { detectSeasonalHoliday, calcSeasonalSurcharge } from '../modules/surcharges/seasonal';

let failCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failCount++;
  }
}

console.log('--- modules/surcharges/seasonal.ts ---');

// ── detectSeasonalHoliday ─────────────────────────────────────────────────
console.log('\n[detectSeasonalHoliday — 2024 추석]');
{
  // 2024 추석: 2024-09-16 ~ 2024-09-18 (당일: 2024-09-17)
  const r1 = detectSeasonalHoliday('20240916');
  assert(r1 !== null,              '20240916: 결과 있음');
  assert(r1!.code === 'ZE100',     '20240916: code = ZE100 (추석 연휴)');
  assert(r1!.amount === 1000,      '20240916: amount = 1000');
  assert(r1!.isActualDay === false,'20240916: isActualDay = false (연휴 시작, 당일 아님)');

  const r2 = detectSeasonalHoliday('20240917');
  assert(r2 !== null,              '20240917: 결과 있음');
  assert(r2!.code === 'ZE100',     '20240917: code = ZE100 (추석 당일)');
  assert(r2!.amount === 1000,      '20240917: amount = 1000 (2024 추석은 단일 코드)');
  assert(r2!.isActualDay === true, '20240917: isActualDay = true (추석 당일)');

  const r3 = detectSeasonalHoliday('20240918');
  assert(r3 !== null,              '20240918: 결과 있음');
  assert(r3!.isActualDay === false,'20240918: isActualDay = false (연휴 마지막)');

  const r4 = detectSeasonalHoliday('20240919');
  assert(r4 === null,              '20240919: 추석 연휴 이후 → null');

  const r5 = detectSeasonalHoliday('20240915');
  assert(r5 === null,              '20240915: 추석 연휴 이전 → null');
}

console.log('\n[detectSeasonalHoliday — 2025 설날]');
{
  // 2025 설날: 2025-01-28 ~ 2025-01-30 (당일: 2025-01-29)
  const r1 = detectSeasonalHoliday('20250128');
  assert(r1 !== null,              '20250128: 결과 있음');
  assert(r1!.code === 'ZE010',     '20250128: code = ZE010 (설날 연휴)');
  assert(r1!.amount === 1000,      '20250128: amount = 1000 (연휴 기본)');
  assert(r1!.isActualDay === false,'20250128: isActualDay = false');

  const r2 = detectSeasonalHoliday('20250129');
  assert(r2 !== null,              '20250129: 결과 있음');
  assert(r2!.code === 'ZE020',     '20250129: code = ZE020 (설날 당일)');
  assert(r2!.amount === 3000,      '20250129: amount = 3000 (당일 가산)');
  assert(r2!.isActualDay === true, '20250129: isActualDay = true');

  const r3 = detectSeasonalHoliday('20250130');
  assert(r3 !== null,              '20250130: 결과 있음');
  assert(r3!.code === 'ZE010',     '20250130: code = ZE010 (연휴 마지막)');
  assert(r3!.amount === 1000,      '20250130: amount = 1000');
  assert(r3!.isActualDay === false,'20250130: isActualDay = false');

  const r4 = detectSeasonalHoliday('20250127');
  assert(r4 === null,              '20250127: 설날 연휴 이전 → null');
  const r5 = detectSeasonalHoliday('20250131');
  assert(r5 === null,              '20250131: 설날 연휴 이후 → null');
}

console.log('\n[detectSeasonalHoliday — 2025 추석]');
{
  // 2025 추석: 2025-10-05 ~ 2025-10-07 (당일: 2025-10-06)
  const r1 = detectSeasonalHoliday('20251005');
  assert(r1 !== null,              '20251005: 결과 있음');
  assert(r1!.code === 'ZE101',     '20251005: code = ZE101');
  assert(r1!.amount === 1000,      '20251005: amount = 1000');

  const r2 = detectSeasonalHoliday('20251006');
  assert(r2 !== null,              '20251006: 결과 있음');
  assert(r2!.code === 'ZE102',     '20251006: code = ZE102 (2025 추석 당일)');
  assert(r2!.amount === 3000,      '20251006: amount = 3000');
  assert(r2!.isActualDay === true, '20251006: isActualDay = true');

  const r3 = detectSeasonalHoliday('20251007');
  assert(r3 !== null,              '20251007: 결과 있음');
  assert(r3!.isActualDay === false,'20251007: isActualDay = false');
}

console.log('\n[detectSeasonalHoliday — 명절 외 날짜]');
{
  assert(detectSeasonalHoliday('20260101') === null, '20260101: 명절 아님 → null');
  assert(detectSeasonalHoliday('20260403') === null, '20260403: 일반 날짜 → null');
  assert(detectSeasonalHoliday('20241225') === null, '20241225: 크리스마스 → null (명절 아님)');
}

// ── calcSeasonalSurcharge ─────────────────────────────────────────────────
console.log('\n[calcSeasonalSurcharge — 조건별 적용 여부]');
{
  // C10 건강보험 + 명절 → 적용
  const r1 = calcSeasonalSurcharge('20250129', 'C10', false);
  assert(r1 !== null,              'C10 + 설날 당일 → 적용');
  assert(r1!.sum === 3000,         'C10 + 설날 당일: sum = 3000');
  assert(r1!.addType === 'seasonal', '설날: addType = seasonal');

  // D10 의료급여 + 명절 → 적용
  const r2 = calcSeasonalSurcharge('20250128', 'D10', false);
  assert(r2 !== null,              'D10 + 설날 연휴 → 적용');
  assert(r2!.sum === 1000,         'D10 + 설날 연휴: sum = 1000');

  // G10 보훈 + 명절 → 미적용
  const r3 = calcSeasonalSurcharge('20250129', 'G10', false);
  assert(r3 === null,              'G10 + 명절 → 미적용 (보훈은 대상 아님)');

  // F10 자동차보험 + 명절 → 미적용
  const r4 = calcSeasonalSurcharge('20250129', 'F10', false);
  assert(r4 === null,              'F10 + 명절 → 미적용');

  // 비대면 조제 → 미적용
  const r5 = calcSeasonalSurcharge('20250129', 'C10', true);
  assert(r5 === null,              '비대면 조제 → 미적용');

  // 명절 외 날짜
  const r6 = calcSeasonalSurcharge('20260101', 'C10', false);
  assert(r6 === null,              '명절 외 날짜 → null');
}

console.log('\n[calcSeasonalSurcharge — 2024 추석 검증]');
{
  const r1 = calcSeasonalSurcharge('20240917', 'C10', false);
  assert(r1 !== null,              '2024 추석 당일: 적용');
  assert(r1!.sugaCd === 'ZE100',   '2024 추석 당일: sugaCd = ZE100');
  assert(r1!.sum === 1000,         '2024 추석 당일: sum = 1000');
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-seasonal 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-seasonal 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
