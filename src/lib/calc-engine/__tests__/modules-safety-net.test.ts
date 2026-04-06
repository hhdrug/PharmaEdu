/**
 * modules-safety-net.test.ts
 * calcSafetyNetOverage / calcSafetyNet / ANNUAL_CAP_BY_DECILE 단위 테스트
 */

import {
  calcSafetyNetOverage,
  calcSafetyNet,
  ANNUAL_CAP_BY_DECILE,
} from '../modules/special/safety-net';

let failCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failCount++;
  }
}

console.log('--- modules/special/safety-net.ts ---');

// ── ANNUAL_CAP_BY_DECILE 상수 확인 ────────────────────────────────────────
console.log('\n[ANNUAL_CAP_BY_DECILE — 소득분위별 상한액]');
assert(ANNUAL_CAP_BY_DECILE[1]  === 870_000,   '1분위: 870,000원');
assert(ANNUAL_CAP_BY_DECILE[2]  === 1_030_000, '2분위: 1,030,000원');
assert(ANNUAL_CAP_BY_DECILE[3]  === 1_030_000, '3분위: 1,030,000원 (2분위와 동일)');
assert(ANNUAL_CAP_BY_DECILE[4]  === 1_550_000, '4분위: 1,550,000원');
assert(ANNUAL_CAP_BY_DECILE[5]  === 1_550_000, '5분위: 1,550,000원 (4분위와 동일)');
assert(ANNUAL_CAP_BY_DECILE[6]  === 2_210_000, '6분위: 2,210,000원');
assert(ANNUAL_CAP_BY_DECILE[7]  === 2_210_000, '7분위: 2,210,000원 (6분위와 동일)');
assert(ANNUAL_CAP_BY_DECILE[8]  === 3_080_000, '8분위: 3,080,000원');
assert(ANNUAL_CAP_BY_DECILE[9]  === 3_080_000, '9분위: 3,080,000원 (8분위와 동일)');
assert(ANNUAL_CAP_BY_DECILE[10] === 5_980_000, '10분위: 5,980,000원');

// ── calcSafetyNetOverage ───────────────────────────────────────────────────
console.log('\n[calcSafetyNetOverage — 초과 없음]');
{
  // 1분위 870,000원, 누적 800,000원 + 현재 50,000원 = 850,000 < 870,000 → 초과 없음
  const r = calcSafetyNetOverage(50_000, 800_000, 1);
  assert(r === 0, `1분위 미초과: overage = 0 (실제: ${r})`);
}

console.log('\n[calcSafetyNetOverage — 누적 + 현재가 정확히 상한 = 초과 없음]');
{
  const r = calcSafetyNetOverage(70_000, 800_000, 1); // 870,000 = cap → raw = 0
  assert(r === 0, `1분위 정확히 상한: overage = 0 (실제: ${r})`);
}

console.log('\n[calcSafetyNetOverage — 초과 발생]');
{
  // 1분위 870,000원, 누적 860,000원 + 현재 20,000원 = 880,000 > 870,000 → 초과 10,000
  const r = calcSafetyNetOverage(20_000, 860_000, 1);
  assert(r === 10_000, `1분위 초과: overage = 10,000원 (실제: ${r})`);
}

console.log('\n[calcSafetyNetOverage — 초과분이 현재 건 본인부담 초과 불가]');
{
  // 1분위 870,000원, 누적 870,000원 + 현재 5,000원 = 875,000 → raw = 5,000
  // 단, 현재 건 본인부담(5,000) 이상 → min(5000, 5000) = 5000
  const r = calcSafetyNetOverage(5_000, 870_000, 1);
  assert(r === 5_000, `현재 건 전체가 초과분: overage = 5,000 (실제: ${r})`);
}

console.log('\n[calcSafetyNetOverage — 초과분 상한 (현재 건 본인부담 한도)]');
{
  // 1분위 870,000원, 누적 900,000원 (이미 초과) + 현재 10,000원 = 910,000 → raw = 40,000
  // min(40,000, 10,000) = 10,000 (현재 건 전체)
  const r = calcSafetyNetOverage(10_000, 900_000, 1);
  assert(r === 10_000, `이미 초과 상태: overage = min(40000, 10000) = 10,000 (실제: ${r})`);
}

console.log('\n[calcSafetyNetOverage — 소득분위별 상한액 적용]');
{
  // 10분위: 5,980,000원, 누적 5,970,000원 + 현재 20,000원 = 5,990,000 → raw = 10,000
  const r10 = calcSafetyNetOverage(20_000, 5_970_000, 10);
  assert(r10 === 10_000, `10분위 초과: overage = 10,000 (실제: ${r10})`);

  // 5분위: 1,550,000원, 누적 1,500,000원 + 현재 60,000원 = 1,560,000 → raw = 10,000
  const r5 = calcSafetyNetOverage(60_000, 1_500_000, 5);
  assert(r5 === 10_000, `5분위 초과: overage = 10,000 (실제: ${r5})`);
}

console.log('\n[calcSafetyNetOverage — 알 수 없는 분위 → 10분위 기본값]');
{
  // 분위 99 → ANNUAL_CAP_BY_DECILE[99] = undefined → 10분위 5,980,000원 적용
  const r = calcSafetyNetOverage(20_000, 5_970_000, 99);
  assert(r === 10_000, `알 수 없는 분위: 10분위 적용, overage = 10,000 (실제: ${r})`);
}

// ── calcSafetyNet (컨텍스트 방식) ─────────────────────────────────────────
console.log('\n[calcSafetyNet — 필수 파라미터 누락]');
{
  const r1 = calcSafetyNet({
    options: {} as any,
    userPrice: 5000,
    // cumulativeUserPrice 미제공
  });
  assert(!r1.applied,            'cumulativeUserPrice 없음: applied = false');
  assert(r1.adjustedUserPrice === 5000, '미적용: adjustedUserPrice 원값 유지');

  const r2 = calcSafetyNet({
    options: {} as any,
    userPrice: 5000,
    cumulativeUserPrice: 800_000,
    // incomeDecile, annualCap 모두 미제공
  });
  assert(!r2.applied,            '소득분위/상한액 없음: applied = false');
}

console.log('\n[calcSafetyNet — 미초과]');
{
  const r = calcSafetyNet({
    options: {} as any,
    userPrice: 50_000,
    cumulativeUserPrice: 800_000,
    incomeDecile: 1,
  });
  assert(!r.applied, '1분위 미초과: applied = false');
  assert(r.overUserPrice === 0, '미초과: overUserPrice = 0');
  assert(r.adjustedUserPrice === 50_000, '미초과: adjustedUserPrice 원값');
}

console.log('\n[calcSafetyNet — 초과 적용]');
{
  const r = calcSafetyNet({
    options: {} as any,
    userPrice: 20_000,
    cumulativeUserPrice: 860_000,
    incomeDecile: 1,
  });
  // 860,000 + 20,000 = 880,000 > 870,000 → 초과 10,000
  assert(r.applied,                        '1분위 초과: applied = true');
  assert(r.overUserPrice === 10_000,       `overUserPrice = 10,000 (실제: ${r.overUserPrice})`);
  assert(r.adjustedUserPrice === 10_000,   `adjustedUserPrice = 20,000 - 10,000 = 10,000 (실제: ${r.adjustedUserPrice})`);
}

console.log('\n[calcSafetyNet — annualCap 직접 지정]');
{
  const r = calcSafetyNet({
    options: {} as any,
    userPrice: 30_000,
    cumulativeUserPrice: 900_000,
    annualCap: 1_000_000, // incomeDecile 대신 직접 지정
  });
  // 900,000 + 30,000 = 930,000 < 1,000,000 → 미초과
  assert(!r.applied, '직접 상한액 1,000,000 미초과: applied = false');
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-safety-net 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-safety-net 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
