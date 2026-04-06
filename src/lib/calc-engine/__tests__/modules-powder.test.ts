/**
 * modules-powder.test.ts
 * hasPowderDrug / calcPowderSurcharge 단위 테스트
 */

import { hasPowderDrug, calcPowderSurcharge, shouldExcludeOtherSurcharges } from '../modules/surcharges/powder';
import type { DrugItem } from '../types';

let failCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failCount++;
  }
}

// ── 테스트용 DrugItem 팩토리 ─────────────────────────────────────────────

function makeDrug(code: string, isPowder?: string): DrugItem {
  return {
    code,
    insuPay: 'covered',
    take: 'internal',
    price: 100,
    dose: 1,
    dNum: 1,
    dDay: 7,
    pack: 0,
    isPowder,
  } as unknown as DrugItem;
}

console.log('--- modules/surcharges/powder.ts ---');

// ── hasPowderDrug ──────────────────────────────────────────────────────────
console.log('\n[hasPowderDrug]');
{
  const empty: DrugItem[] = [];
  assert(!hasPowderDrug(empty), '빈 리스트 → false');

  const noPowder = [makeDrug('A001'), makeDrug('B002')];
  assert(!hasPowderDrug(noPowder), 'isPowder 없음 → false');

  const withPowder = [makeDrug('A001'), makeDrug('B002', '1')];
  assert(hasPowderDrug(withPowder), 'isPowder="1" 포함 → true');

  const allPowder = [makeDrug('A001', '1'), makeDrug('B002', '1')];
  assert(hasPowderDrug(allPowder), '모두 가루약 → true');

  const zeroPowder = [makeDrug('A001', '0')];
  assert(!hasPowderDrug(zeroPowder), 'isPowder="0" → false');
}

// ── shouldExcludeOtherSurcharges ───────────────────────────────────────────
console.log('\n[shouldExcludeOtherSurcharges]');
{
  const noPowder = [makeDrug('A001')];
  assert(!shouldExcludeOtherSurcharges(noPowder), '가루약 없음 → 다른 가산 배제 안 함');

  const withPowder = [makeDrug('A001', '1')];
  assert(shouldExcludeOtherSurcharges(withPowder), '가루약 있음 → 다른 가산 배제');
}

// ── calcPowderSurcharge — 가루약 없음 ─────────────────────────────────────
console.log('\n[calcPowderSurcharge — 가루약 없음]');
{
  const noPowder = [makeDrug('A001')];

  const r1 = calcPowderSurcharge(noPowder, '20231031');
  assert(r1 === null, '가루약 없음 (구체계): null 반환');

  const r2 = calcPowderSurcharge(noPowder, '20231101');
  assert(r2 === null, '가루약 없음 (신체계): null 반환');
}

// ── calcPowderSurcharge — 구체계 (2023.11.01 이전) ──────────────────────
console.log('\n[calcPowderSurcharge — 구체계 (2023.10.31)]');
{
  const withPowder = [makeDrug('A001', '1')];
  const r = calcPowderSurcharge(withPowder, '20231031');
  assert(r !== null, '구체계: null이 아님');
  assert(r!.sugaCd === 'Z4010', `구체계: sugaCd = Z4010 (실제: ${r?.sugaCd})`);
  assert(r!.addType === 'powder', `구체계: addType = powder`);
  assert(r!.cnt === 1, `구체계: cnt = 1`);
}

// ── calcPowderSurcharge — 구체계 날짜 경계 (구분자 있는 날짜 처리) ────────
console.log('\n[calcPowderSurcharge — 날짜 형식 변형 (점 포함)]');
{
  const withPowder = [makeDrug('A001', '1')];
  const r = calcPowderSurcharge(withPowder, '2023.10.31');
  assert(r !== null, '점 포함 날짜 구체계: null 아님');
  assert(r!.sugaCd === 'Z4010', '점 포함 날짜: sugaCd = Z4010');
}

// ── calcPowderSurcharge — 신체계 (2023.11.01 이후) ──────────────────────
console.log('\n[calcPowderSurcharge — 신체계 (2023.11.01)]');
{
  const withPowder = [makeDrug('A001', '1')];
  const r = calcPowderSurcharge(withPowder, '20231101');
  // 신체계에서는 null 반환 (Integration Lead가 dispensing-fee 레벨에서 처리)
  assert(r === null, '신체계: null 반환 (dispensing-fee 레벨 처리)');
}

// ── calcPowderSurcharge — 신체계 이후 날짜 ──────────────────────────────
console.log('\n[calcPowderSurcharge — 신체계 (2026.01.01)]');
{
  const withPowder = [makeDrug('A001', '1'), makeDrug('B002', '1')];
  const r = calcPowderSurcharge(withPowder, '20260101');
  assert(r === null, '신체계 2026년: null 반환');
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-powder 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-powder 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
