/**
 * modules-saturday.test.ts
 * isAfterSaturdaySplitDate / createSaturdaySplitRow / applySaturdaySurchargeRows 단위 테스트
 */

import {
  isAfterSaturdaySplitDate,
  createSaturdaySplitRow,
  applySaturdaySurchargeRows,
} from '../modules/surcharges/saturday-split';
import type { WageListItem } from '../types';

let failCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failCount++;
  }
}

console.log('--- modules/surcharges/saturday-split.ts ---');

// ── isAfterSaturdaySplitDate ──────────────────────────────────────────────
console.log('\n[isAfterSaturdaySplitDate]');
assert(!isAfterSaturdaySplitDate('20160928'), '20160928: 이전 날짜 → false');
assert( isAfterSaturdaySplitDate('20160929'), '20160929: 정확히 시행일 → true');
assert( isAfterSaturdaySplitDate('20160930'), '20160930: 이후 날짜 → true');
assert( isAfterSaturdaySplitDate('20260101'), '20260101: 현재 날짜 → true');
assert(!isAfterSaturdaySplitDate('20000101'), '20000101: 오래된 날짜 → false');

// ── createSaturdaySplitRow ────────────────────────────────────────────────
console.log('\n[createSaturdaySplitRow]');
{
  // 기본 케이스
  const r1 = createSaturdaySplitRow('Z2000', 1720, '20260101');
  assert(r1 !== null,                     'Z2000 정상: null 아님');
  assert(r1!.sugaCd === 'Z2000030',       `Z2000 → sugaCd = Z2000030 (실제: ${r1?.sugaCd})`);
  assert(r1!.price === 1720,              `Z2000 → price = 1720`);
  assert(r1!.sum === 1720,               `Z2000 → sum = 1720`);
  assert(r1!.addType === 'saturday',      `Z2000 → addType = saturday`);

  // Z3000
  const r2 = createSaturdaySplitRow('Z3000', 1150, '20260101');
  assert(r2 !== null,                     'Z3000 정상: null 아님');
  assert(r2!.sugaCd === 'Z3000030',       `Z3000 → Z3000030`);

  // Z4107 (7일 내복약)
  const r3 = createSaturdaySplitRow('Z4107', 4320, '20260101');
  assert(r3 !== null,                     'Z4107 정상: null 아님');
  assert(r3!.sugaCd === 'Z4107030',       `Z4107 → Z4107030`);

  // 2016.09.29 이전 날짜 → null
  const r4 = createSaturdaySplitRow('Z2000', 1720, '20160928');
  assert(r4 === null,                     '2016.09.28 이전 → null');

  // price=0 → null
  const r5 = createSaturdaySplitRow('Z2000', 0, '20260101');
  assert(r5 === null,                     'price=0 → null');

  // price 음수 → null
  const r6 = createSaturdaySplitRow('Z2000', -100, '20260101');
  assert(r6 === null,                     'price 음수 → null');
}

// ── applySaturdaySurchargeRows ────────────────────────────────────────────
console.log('\n[applySaturdaySurchargeRows — isSaturday=false]');
{
  const wageList: WageListItem[] = [
    { sugaCd: 'Z2000', name: '기본조제기술료', insuPay: '1', cnt: 1, price: 1720, sum: 1720, addType: '' },
    { sugaCd: 'Z3000', name: '복약지도료', insuPay: '1', cnt: 1, price: 1150, sum: 1150, addType: '' },
  ];
  const result = applySaturdaySurchargeRows(wageList, '20260101', false);
  assert(result.length === 2, `isSaturday=false: 행 수 = 2 (가산 없음, 실제: ${result.length})`);
}

console.log('\n[applySaturdaySurchargeRows — isSaturday=true, 2016이후]');
{
  const wageList: WageListItem[] = [
    { sugaCd: 'Z2000', name: '기본조제기술료', insuPay: '1', cnt: 1, price: 1720, sum: 1720, addType: '' },
    { sugaCd: 'Z3000', name: '복약지도료', insuPay: '1', cnt: 1, price: 1150, sum: 1150, addType: '' },
    { sugaCd: 'Z4107', name: '내복약조제료(7일)', insuPay: '1', cnt: 1, price: 4320, sum: 4320, addType: '' },
  ];
  const result = applySaturdaySurchargeRows(wageList, '20260101', true);
  // 원래 3행 + 가산 3행(Z2000030, Z3000030, Z4107030) = 6행
  assert(result.length === 6, `토요 가산 적용: 행 수 = 6 (실제: ${result.length})`);
  const satCodes = result.filter(w => w.addType === 'saturday').map(w => w.sugaCd);
  assert(satCodes.includes('Z2000030'), `Z2000030 포함 (실제: ${satCodes.join(',')})`);
  assert(satCodes.includes('Z3000030'), `Z3000030 포함`);
  assert(satCodes.includes('Z4107030'), `Z4107030 포함`);
}

console.log('\n[applySaturdaySurchargeRows — 2016이전 날짜 → 가산 없음]');
{
  const wageList: WageListItem[] = [
    { sugaCd: 'Z2000', name: '기본조제기술료', insuPay: '1', cnt: 1, price: 1720, sum: 1720, addType: '' },
  ];
  const result = applySaturdaySurchargeRows(wageList, '20160928', true);
  assert(result.length === 1, `2016이전 토요: 행 수 = 1 (가산 없음, 실제: ${result.length})`);
}

console.log('\n[applySaturdaySurchargeRows — Z4120 외용약]');
{
  const wageList: WageListItem[] = [
    { sugaCd: 'Z4120', name: '외용약조제료', insuPay: '1', cnt: 1, price: 1000, sum: 1000, addType: '' },
  ];
  const result = applySaturdaySurchargeRows(wageList, '20260101', true);
  assert(result.length === 2, `Z4120 외용약 토요: 행 수 = 2 (실제: ${result.length})`);
  const satCodes = result.filter(w => w.addType === 'saturday').map(w => w.sugaCd);
  assert(satCodes.includes('Z4120030'), `Z4120030 포함`);
}

console.log('\n[applySaturdaySurchargeRows — price=0 행 가산 없음]');
{
  const wageList: WageListItem[] = [
    { sugaCd: 'Z2000', name: '기본조제기술료', insuPay: '1', cnt: 1, price: 0, sum: 0, addType: '' },
  ];
  const result = applySaturdaySurchargeRows(wageList, '20260101', true);
  // price=0인 Z2000은 토요 가산 행 없음
  const satRows = result.filter(w => w.addType === 'saturday');
  assert(satRows.length === 0, `price=0 Z2000: 토요 가산 행 없음 (실제: ${satRows.length})`);
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-saturday 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-saturday 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
