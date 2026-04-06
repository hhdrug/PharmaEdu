/**
 * modules-workers-comp.test.ts
 * calcWorkersComp (E10/E20) 단위 테스트
 */

import { calcWorkersComp } from '../modules/insurance/workers-comp';
import type { CalcOptions, CalcResult, InsuRate } from '../types';

let failCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failCount++;
  }
}

function makeResult(totalPrice: number): CalcResult {
  return {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice,
    userPrice: 999, // 초기값이 0이 아닌 경우도 확인
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  };
}

function makeRate(): InsuRate {
  return {
    insuCode: 'E10',
    rate: 0,
    sixAgeRate: 0,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  };
}

console.log('--- modules/insurance/workers-comp.ts ---');

// ── E10 — 본인부담 0원 ───────────────────────────────────────────────────
console.log('\n[E10 — 산재 요양급여 본인부담 0원]');
{
  const totalPrice = 25000;
  const options = { insuCode: 'E10', dosDate: '20260101', age: 40, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcWorkersComp(options, result, rate);
  assert(r.userPrice === 0,         'E10: userPrice = 0');
  assert(r.pubPrice  === totalPrice, `E10: pubPrice = ${totalPrice} (전액 근로복지공단)`);
}

// ── E20 — 산재 후유증, 동일하게 0원 ──────────────────────────────────────
console.log('\n[E20 — 산재 후유증 본인부담 0원]');
{
  const totalPrice = 18000;
  const options = { insuCode: 'E20', dosDate: '20260101', age: 55, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcWorkersComp(options, result, rate);
  assert(r.userPrice === 0,         'E20: userPrice = 0');
  assert(r.pubPrice  === totalPrice, `E20: pubPrice = ${totalPrice}`);
}

// ── totalPrice + userPrice 항등식 검증 ────────────────────────────────────
console.log('\n[산재 — pubPrice = totalPrice 항등식]');
{
  const totalPrice = 31500;
  const options = { insuCode: 'E10', dosDate: '20260101', age: 30, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcWorkersComp(options, result, rate);
  assert(r.userPrice + r.pubPrice === totalPrice,
    `userPrice(${r.userPrice}) + pubPrice(${r.pubPrice}) = totalPrice(${totalPrice})`);
}

// ── steps 생성 확인 ─────────────────────────────────────────────────────
console.log('\n[산재 — steps 생성 확인]');
{
  const options = { insuCode: 'E10', dosDate: '20260101', age: 40, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(10000);
  const rate = makeRate();

  const r = calcWorkersComp(options, result, rate);
  assert(r.steps.length >= 1, `steps 수 >= 1 (실제: ${r.steps.length})`);
}

// ── totalPrice=0 엣지 케이스 ─────────────────────────────────────────────
console.log('\n[산재 — totalPrice=0 엣지 케이스]');
{
  const options = { insuCode: 'E10', dosDate: '20260101', age: 40, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(0);
  const rate = makeRate();

  const r = calcWorkersComp(options, result, rate);
  assert(r.userPrice === 0, 'totalPrice=0: userPrice = 0');
  assert(r.pubPrice  === 0, 'totalPrice=0: pubPrice = 0');
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-workers-comp 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-workers-comp 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
