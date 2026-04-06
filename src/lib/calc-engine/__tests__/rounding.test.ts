/**
 * rounding.test.ts
 * round1 / trunc10 / trunc100 / round10 / roundToInt 단위 테스트
 */

import { round1, trunc10, trunc100, round10, roundToInt } from '../rounding';

let failCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failCount++;
  }
}

console.log('--- rounding.ts ---');

// ── round1 (원미만 사사오입) ────────────────────────────────────────────────
console.log('\n[round1]');
assert(round1(0)      === 0,    'round1(0) === 0');
assert(round1(1)      === 1,    'round1(1) === 1');
assert(round1(1.4)    === 1,    'round1(1.4) === 1');
assert(round1(1.5)    === 2,    'round1(1.5) === 2');
assert(round1(1.9)    === 2,    'round1(1.9) === 2');
assert(round1(2.5)    === 3,    'round1(2.5) === 3');
assert(round1(100.0)  === 100,  'round1(100.0) === 100');
assert(round1(0.499)  === 0,    'round1(0.499) === 0');
assert(round1(0.5)    === 1,    'round1(0.5) === 1');
assert(round1(99.999) === 100,  'round1(99.999) === 100');
// 5% 가산 예: 10000 × 0.05 = 500
assert(round1(10000 * 0.05) === 500, 'round1(10000 × 0.05) === 500');
// 소수점 발생 예
assert(round1(133.5) === 134, 'round1(133.5) === 134');
assert(round1(133.4) === 133, 'round1(133.4) === 133');

// ── trunc10 (10원 미만 절사) ────────────────────────────────────────────────
console.log('\n[trunc10]');
assert(trunc10(0)      === 0,     'trunc10(0) === 0');
assert(trunc10(10)     === 10,    'trunc10(10) === 10');
assert(trunc10(19)     === 10,    'trunc10(19) === 10');
assert(trunc10(19160)  === 19160, 'trunc10(19160) === 19160');
assert(trunc10(19165)  === 19160, 'trunc10(19165) === 19160');
assert(trunc10(19169)  === 19160, 'trunc10(19169) === 19160');
assert(trunc10(100)    === 100,   'trunc10(100) === 100');
assert(trunc10(109)    === 100,   'trunc10(109) === 100');
assert(trunc10(5748)   === 5740,  'trunc10(5748) === 5740');
assert(trunc10(1)      === 0,     'trunc10(1) === 0');
assert(trunc10(9)      === 0,     'trunc10(9) === 0');
// 총액 × 30% 절사 예: 2130 × 0.3 = 639 → trunc10 = 630
assert(trunc10(2130 * 0.3) === 630, 'trunc10(2130 × 0.3) === 630');

// ── trunc100 (100원 미만 절사) ─────────────────────────────────────────────
console.log('\n[trunc100]');
assert(trunc100(0)     === 0,    'trunc100(0) === 0');
assert(trunc100(99)    === 0,    'trunc100(99) === 0');
assert(trunc100(100)   === 100,  'trunc100(100) === 100');
assert(trunc100(5748)  === 5700, 'trunc100(5748) === 5700');
assert(trunc100(5799)  === 5700, 'trunc100(5799) === 5700');
assert(trunc100(5800)  === 5800, 'trunc100(5800) === 5800');
assert(trunc100(19160 * 0.30) === 5700, 'trunc100(19160 × 30%) === 5700 (S01 시나리오)');
assert(trunc100(1000)  === 1000, 'trunc100(1000) === 1000');
assert(trunc100(1001)  === 1000, 'trunc100(1001) === 1000');
assert(trunc100(1099)  === 1000, 'trunc100(1099) === 1000');

// ── round10 (10원 미만 사사오입) ───────────────────────────────────────────
console.log('\n[round10]');
assert(round10(0)     === 0,   'round10(0) === 0');
assert(round10(4)     === 0,   'round10(4) === 0');
assert(round10(5)     === 10,  'round10(5) === 10');
assert(round10(14)    === 10,  'round10(14) === 10');
assert(round10(15)    === 20,  'round10(15) === 20');
assert(round10(100)   === 100, 'round10(100) === 100');
assert(round10(105)   === 110, 'round10(105) === 110');

// ── roundToInt (EDB 호환 사사오입) ─────────────────────────────────────────
console.log('\n[roundToInt]');
assert(roundToInt(0)     === 0,   'roundToInt(0) === 0');
assert(roundToInt(0.4)   === 0,   'roundToInt(0.4) === 0');
assert(roundToInt(0.5)   === 1,   'roundToInt(0.5) === 1');
assert(roundToInt(1.5)   === 2,   'roundToInt(1.5) === 2');
assert(roundToInt(100.0) === 100, 'roundToInt(100.0) === 100');

console.log('');
if (failCount === 0) {
  console.log('[PASS] rounding 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] rounding 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
