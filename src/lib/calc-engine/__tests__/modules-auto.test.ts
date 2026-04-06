/**
 * modules-auto.test.ts
 * calcAutoInsurance (F10) 단위 테스트
 */

import { calcAutoInsurance } from '../modules/insurance/auto-insurance';
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
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  };
}

function makeRate(): InsuRate {
  return {
    insuCode: 'F10',
    rate: 0,
    sixAgeRate: 0,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  };
}

console.log('--- modules/insurance/auto-insurance.ts ---');

// ── F10 addRat 없음 — 전액 환자 부담 ────────────────────────────────────
console.log('\n[F10 — addRat 없음 (전액 자부담)]');
{
  const totalPrice = 19160;
  const options = { insuCode: 'F10', dosDate: '20260101', age: 35, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcAutoInsurance(options, result, rate);
  // userPrice = trunc10(19160) = 19160
  assert(r.userPrice === 19160, `F10 무할증: userPrice = trunc10(${totalPrice}) = 19160`);
  assert(r.pubPrice === 0,      'F10 무할증: pubPrice = 0 (공단 청구 없음)');
}

// ── F10 10원 절사 발생 케이스 ─────────────────────────────────────────────
console.log('\n[F10 — 10원 절사]');
{
  const totalPrice = 19165;
  const options = { insuCode: 'F10', dosDate: '20260101', age: 35, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcAutoInsurance(options, result, rate);
  // trunc10(19165) = 19160
  assert(r.userPrice === 19160, `F10 절사: trunc10(19165) = 19160`);
  assert(r.pubPrice  === 0,     'F10 절사: pubPrice = 0');
}

// ── F10 addRat 있음 — 할증 계산 ─────────────────────────────────────────
console.log('\n[F10 — addRat 20% 할증]');
{
  const totalPrice = 10000;
  const options = {
    insuCode: 'F10',
    dosDate: '20260101',
    age: 35,
    drugList: [],
    addRat: 20,
  } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcAutoInsurance(options, result, rate);
  // userPrice = trunc10(10000) = 10000
  // premium = round1(10000 × 20 / 100) = round1(2000) = 2000
  assert(r.userPrice === 10000, 'F10 addRat 20%: userPrice = 10000');
  assert((r as any).premium === 2000, 'F10 addRat 20%: premium = 2000');
  assert(r.pubPrice  === 0,     'F10 addRat 20%: pubPrice = 0');
}

// ── F10 addRat 소수점 할증 — round1 적용 ─────────────────────────────────
console.log('\n[F10 — addRat 15% (소수점 round1 검증)]');
{
  const totalPrice = 10000;
  const options = {
    insuCode: 'F10',
    dosDate: '20260101',
    age: 35,
    drugList: [],
    addRat: 15,
  } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcAutoInsurance(options, result, rate);
  // premium = round1(10000 × 15 / 100) = round1(1500) = 1500
  assert((r as any).premium === 1500, 'F10 addRat 15%: premium = 1500');
}

// ── F10 addRat=0 — premium 미생성 ────────────────────────────────────────
console.log('\n[F10 — addRat=0 (premium 미생성)]');
{
  const totalPrice = 5000;
  const options = {
    insuCode: 'F10',
    dosDate: '20260101',
    age: 35,
    drugList: [],
    addRat: 0,
  } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcAutoInsurance(options, result, rate);
  assert((r as any).premium === undefined, 'addRat=0: premium 필드 미생성');
  assert(r.userPrice === 5000, 'addRat=0: userPrice = 5000');
}

// ── steps 존재 확인 ───────────────────────────────────────────────────────
console.log('\n[F10 — steps 생성 확인]');
{
  const totalPrice = 10000;
  const options = { insuCode: 'F10', dosDate: '20260101', age: 35, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate();

  const r = calcAutoInsurance(options, result, rate);
  assert(r.steps.length >= 2, `steps 수 >= 2 (실제: ${r.steps.length})`);
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-auto 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-auto 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
