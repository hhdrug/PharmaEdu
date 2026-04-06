/**
 * modules-exemption.test.ts
 * isV252Series / determineExemptionRate / inferExemptionRate 단위 테스트
 */

import {
  isV252Series,
  determineExemptionRate,
  inferExemptionRate,
  determineV252RateByGrade,
} from '../modules/special/exemption';
import type { InsuRate } from '../types';

let failCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failCount++;
  }
}

function makeRate(v2520?: number, v2521?: number): InsuRate & { v2520?: number; v2521?: number } {
  return {
    insuCode: 'C10',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
    v2520,
    v2521,
  };
}

console.log('--- modules/special/exemption.ts ---');

// ── isV252Series ──────────────────────────────────────────────────────────
console.log('\n[isV252Series]');
assert( isV252Series('V252'), 'V252 → true');
assert( isV252Series('V352'), 'V352 → true');
assert( isV252Series('V452'), 'V452 → true');
assert(!isV252Series('V100'), 'V100 → false');
assert(!isV252Series('V009'), 'V009 → false');
assert(!isV252Series(''),     '빈 문자열 → false');
assert(!isV252Series('V2520'), 'V2520 → false (접두사 일치 아님)');

// ── determineExemptionRate ────────────────────────────────────────────────
console.log('\n[determineExemptionRate — 기본]');
{
  const rate = makeRate();
  assert(determineExemptionRate('', rate, 30)     === -1, '빈 코드 → -1 (미적용)');
  assert(determineExemptionRate('V100', rate, 30) === -1, 'V100 → -1 (미적용)');
}

console.log('\n[determineExemptionRate — 면제 0%]');
{
  const rate = makeRate();
  assert(determineExemptionRate('V193', rate, 30) === 0,  'V193 → 0% 면제');
  assert(determineExemptionRate('V124', rate, 30) === 0,  'V124 → 0% 면제');
  assert(determineExemptionRate('V001', rate, 30) === 0,  'V001 → 0% 면제');
  assert(determineExemptionRate('V254', rate, 30) === 0,  'V254 결핵 → 0% 면제');
}

console.log('\n[determineExemptionRate — 중증 5%]');
{
  const rate = makeRate();
  assert(determineExemptionRate('V009', rate, 30) === 5,  'V009 → 5%');
  assert(determineExemptionRate('V010', rate, 30) === 5,  'V010 → 5%');
  assert(determineExemptionRate('V025', rate, 30) === 5,  'V025 → 5%');
  // V0xx 패턴 (정적 매핑에 없는 코드)
  assert(determineExemptionRate('V050', rate, 30) === 5,  'V050 (V0xx 패턴) → 5%');
}

console.log('\n[determineExemptionRate — 희귀 10%]');
{
  const rate = makeRate();
  assert(determineExemptionRate('V106', rate, 30) === 10, 'V106 → 10%');
  assert(determineExemptionRate('V130', rate, 30) === 10, 'V130 → 10%');
  // V1xx 패턴 (정적 매핑에 없는 코드)
  assert(determineExemptionRate('V150', rate, 30) === 10, 'V150 (V1xx 패턴) → 10%');
}

console.log('\n[determineExemptionRate — V252 계열 (DB 없음)]');
{
  const rateNoDb = makeRate(); // v2520 = undefined
  // v2520 없으면 고정 50%
  assert(determineExemptionRate('V252', rateNoDb, 30) === 50, 'V252 DB없음 → 50%');
  assert(determineExemptionRate('V352', rateNoDb, 30) === 40, 'V352 → 40%');
  assert(determineExemptionRate('V452', rateNoDb, 30) === 30, 'V452 → 30%');
}

console.log('\n[determineExemptionRate — V252 계열 (DB 있음)]');
{
  const rateWithDb = makeRate(20); // v2520 = 20%
  // v2520 > 0이면 DB 값 사용
  assert(determineExemptionRate('V252', rateWithDb, 30) === 20, 'V252 v2520=20 → 20%');
}

console.log('\n[determineExemptionRate — 알 수 없는 코드]');
{
  const rate = makeRate();
  assert(determineExemptionRate('Z999', rate, 30) === -1, 'Z999 → -1 (미적용)');
  assert(determineExemptionRate('V999', rate, 30) === -1, 'V999 (V9xx) → -1 (미적용)');
}

// ── determineV252RateByGrade ──────────────────────────────────────────────
console.log('\n[determineV252RateByGrade]');
{
  // V252가 아니면 -1
  assert(determineV252RateByGrade('V100', '0', makeRate(20)) === -1, 'V100 → -1');

  // grade '0' → v2520
  const rateWith = makeRate(20, 10);
  assert(determineV252RateByGrade('V252', '0', rateWith) === 20, 'V252 grade=0, v2520=20 → 20');
  assert(determineV252RateByGrade('V252', '4', rateWith) === 20, 'V252 grade=4, v2520=20 → 20');

  // grade '1' → v2521
  assert(determineV252RateByGrade('V252', '1', rateWith) === 10, 'V252 grade=1, v2521=10 → 10');

  // DB 없을 때 고정값
  const rateNoDb = makeRate();
  assert(determineV252RateByGrade('V252', '0', rateNoDb) === 50, 'V252 grade=0 DB없음 → 50');
  assert(determineV252RateByGrade('V352', '0', rateNoDb) === 40, 'V352 grade=0 DB없음 → 40');
  assert(determineV252RateByGrade('V452', '0', rateNoDb) === 30, 'V452 grade=0 DB없음 → 30');
}

// ── inferExemptionRate ────────────────────────────────────────────────────
console.log('\n[inferExemptionRate]');
{
  assert(inferExemptionRate('')      === null, '빈 코드 → null');
  assert(inferExemptionRate('V100') === null, 'V100 → null (특례 제외)');
  assert(inferExemptionRate('V193') === 0,    'V193 → 0%');
  assert(inferExemptionRate('V252') === 50,   'V252 → 50%');
  assert(inferExemptionRate('V352') === 40,   'V352 → 40%');
  assert(inferExemptionRate('V452') === 30,   'V452 → 30%');
  assert(inferExemptionRate('V009') === 5,    'V009 → 5%');
  assert(inferExemptionRate('V050') === 5,    'V050 (V0xx) → 5%');
  assert(inferExemptionRate('V106') === 10,   'V106 → 10%');
  assert(inferExemptionRate('V150') === 10,   'V150 (V1xx) → 10%');
  assert(inferExemptionRate('Z999') === null, 'Z999 → null (판단 불가)');
  assert(inferExemptionRate('V999') === null, 'V999 (V9xx) → null');
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-exemption 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-exemption 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
