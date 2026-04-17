/**
 * modules-gong-sang.test.ts — Phase 7 A2 추가
 * CH05 §3.6 공상(공무상 재해) 플래그 회귀 테스트.
 *
 * 검증:
 *   1. isTreatmentDisaster=true → 본인부담 0원, 전액 공단부담 (보험 유형 무관)
 *   2. C21 코드 단독 (플래그 없음) → 일반 건강보험 30% 정률 (과거 공상 오인 회귀)
 */

import { calcCopayment } from '../copayment';
import type { CalcOptions, InsuRate } from '../types';

let failCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failCount++;
  }
}

function makeRate(opts: Partial<InsuRate> = {}): InsuRate {
  return {
    insuCode: 'C10',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 1000,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
    ...opts,
  };
}

function makeOpts(overrides: Partial<CalcOptions> = {}): CalcOptions {
  return {
    dosDate: '20260101',
    insuCode: 'C10',
    age: 40,
    drugList: [],
    ...overrides,
  } as unknown as CalcOptions;
}

console.log('--- modules/gong-sang (CH05 §3.6) ---');

// ── (1) C10 + isTreatmentDisaster=true → 0원 ──────────────────────────────
console.log('\n[공상 플래그 (isTreatmentDisaster=true)]');
{
  // sumInsuDrug=10500, sumWage=8660 → totalPrice = 19160
  const r = calcCopayment(10500, 8660, makeOpts({ isTreatmentDisaster: true }), makeRate());
  assert(r.userPrice === 0, 'C10 + 공상: userPrice = 0');
  assert(r.pubPrice === 19160, 'C10 + 공상: pubPrice = totalPrice 19160');
}

// ── (2) C21 단독 (과거 공상 오인) → 일반 30% 정률 ─────────────────────────
console.log('\n[C21 단독 (지역가입자 세대주 — 공상 아님)]');
{
  // C21 은 insuCode 지역세대주 코드. rate 는 C10 과 동일 30%.
  const r = calcCopayment(10500, 8660, makeOpts({ insuCode: 'C21' }), makeRate({ insuCode: 'C21' }));
  // trunc100(19160 × 0.30) = trunc100(5748) = 5700
  assert(r.userPrice === 5700, 'C21 단독: 일반 30% 정률 5700 (공상 오인 회귀 방지)');
  assert(r.pubPrice === 13460, 'C21 단독: pubPrice = 19160 - 5700 = 13460');
}

// ── (3) D10 + 공상 → 여전히 0원 (보험 유형 무관) ─────────────────────────
console.log('\n[D10 + 공상 (보험 유형 무관 전액면제)]');
{
  const r = calcCopayment(
    10500, 8660,
    makeOpts({ insuCode: 'D10', isTreatmentDisaster: true, sbrdnType: 'M' }),
    makeRate({ insuCode: 'D10', mcode: 1000 }),
  );
  assert(r.userPrice === 0, 'D10 + 공상: userPrice = 0 (의료급여 정액 우회)');
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-gong-sang 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-gong-sang 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
