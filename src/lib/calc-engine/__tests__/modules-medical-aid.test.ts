/**
 * modules-medical-aid.test.ts
 * calcMedicalAid / resolveMedicalAidFixAmount / applySbrdnTypeModifier 단위 테스트
 */

import {
  calcMedicalAid,
  resolveMedicalAidFixAmount,
  applySbrdnTypeModifier,
} from '../modules/insurance/medical-aid';
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

// ── 공통 헬퍼 ────────────────────────────────────────────────────────────────

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

function makeRate(opts: Partial<InsuRate> = {}): InsuRate {
  return {
    insuCode: 'D20',
    rate: 15,
    sixAgeRate: 0,
    fixCost: 500,
    mcode: 500,
    bcode: 1500,
    age65_12000Less: 0,
    ...opts,
  };
}

console.log('--- modules/insurance/medical-aid.ts ---');

// ── D20 — FixCost 500원 정액 ──────────────────────────────────────────────
console.log('\n[D20 — FixCost 500원 정액]');
{
  const totalPrice = 10000;
  const options = { insuCode: 'D20', dosDate: '20260101', age: 40, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate({ insuCode: 'D20', fixCost: 500 });

  const r = calcMedicalAid(options, result, rate);
  assert(r.userPrice === 500, `D20 정액: userPrice = 500`);
  assert(r.pubPrice === totalPrice - 500, `D20 정액: pubPrice = ${totalPrice - 500}`);
}

// ── D20 — 총액이 정액보다 작을 때 전액 ──────────────────────────────────────
console.log('\n[D20 — 총액 < 정액 → 전액]');
{
  const totalPrice = 300;
  const options = { insuCode: 'D20', dosDate: '20260101', age: 40, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate({ insuCode: 'D20', fixCost: 500 });

  const r = calcMedicalAid(options, result, rate);
  assert(r.userPrice === 300, `총액 300 < 정액 500 → userPrice = trunc10(300) = 300`);
}

// ── D80 — 행려 전액면제 ───────────────────────────────────────────────────
console.log('\n[D80 — 행려 전액면제]');
{
  const totalPrice = 15000;
  const options = { insuCode: 'D80', dosDate: '20260101', age: 50, drugList: [] } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate({ insuCode: 'D80' });

  const r = calcMedicalAid(options, result, rate);
  assert(r.userPrice === 0, 'D80: userPrice = 0 (행려 전액면제)');
  assert(r.pubPrice === totalPrice, `D80: pubPrice = ${totalPrice}`);
}

// ── B014 — 30% 정률 ──────────────────────────────────────────────────────
console.log('\n[B014 — 30% 정률 (2019.01.01 이후)]');
{
  const totalPrice = 20000;
  const options = {
    insuCode: 'D10',
    dosDate: '20260101',
    age: 35,
    drugList: [],
    sbrdnType: 'B014',
  } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate({ insuCode: 'D10' });

  const r = calcMedicalAid(options, result, rate);
  // trunc10(20000 × 0.3) = trunc10(6000) = 6000
  assert(r.userPrice === 6000, `B014: trunc10(20000 × 30%) = 6000`);
  assert(r.pubPrice === 14000, `B014: pubPrice = 14000`);
}

// ── B014 — 2019 이전이면 정액 로직 ──────────────────────────────────────────
console.log('\n[B014 — 2019 이전 (정액 적용)]');
{
  const totalPrice = 20000;
  const options = {
    insuCode: 'D20',
    dosDate: '20180101',
    age: 35,
    drugList: [],
    sbrdnType: 'B014',
  } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate({ insuCode: 'D20', fixCost: 500 });

  const r = calcMedicalAid(options, result, rate);
  // B014이지만 날짜 미달 → FixCost 500원 정액
  assert(r.userPrice === 500, `B014 2018년: 날짜 미달이므로 정액 500원`);
}

// ── B030 — 전액면제 (2022.03.22 이후) ────────────────────────────────────
console.log('\n[B030 — 전액면제 2022.03.22 이후]');
{
  const totalPrice = 8000;
  const options = {
    insuCode: 'D10',
    dosDate: '20220322',
    age: 30,
    drugList: [],
    sbrdnType: 'B030',
  } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate({ insuCode: 'D10' });

  const r = calcMedicalAid(options, result, rate);
  assert(r.userPrice === 0, 'B030 2022이후: userPrice = 0');
}

// ── V103 — 전액면제 ────────────────────────────────────────────────────────
console.log('\n[V103 질병코드 — 전액면제]');
{
  const totalPrice = 12000;
  const options = {
    insuCode: 'D10',
    dosDate: '20260101',
    age: 45,
    drugList: [],
    mediIllness: 'V103',
  } as unknown as CalcOptions;
  const result = makeResult(totalPrice);
  const rate = makeRate({ insuCode: 'D10' });

  const r = calcMedicalAid(options, result, rate);
  assert(r.userPrice === 0, 'V103: userPrice = 0');
}

// ── resolveMedicalAidFixAmount ─────────────────────────────────────────────
console.log('\n[resolveMedicalAidFixAmount]');
{
  const baseOpts = { insuCode: 'D10', dosDate: '20260101', age: 40, drugList: [] } as unknown as CalcOptions;
  const baseRate = makeRate({ mcode: 500, bcode: 1500, fixCost: 500 });

  const mOpts = { ...baseOpts, sbrdnType: 'M001' } as unknown as CalcOptions;
  assert(resolveMedicalAidFixAmount('D10', baseRate, mOpts) === 500, 'D10 + M시작: mcode = 500');

  const bOpts = { ...baseOpts, sbrdnType: 'B014' } as unknown as CalcOptions;
  assert(resolveMedicalAidFixAmount('D10', baseRate, bOpts) === 1500, 'D10 + B시작: bcode = 1500');

  const d20Opts = { ...baseOpts, insuCode: 'D20' } as unknown as CalcOptions;
  assert(resolveMedicalAidFixAmount('D20', baseRate, d20Opts) === 500, 'D20: fixCost = 500');
}

// ── applySbrdnTypeModifier ─────────────────────────────────────────────────
console.log('\n[applySbrdnTypeModifier]');
assert(applySbrdnTypeModifier(500, 'B014', 10000, '20260101') === 3000, 'B014 2026: trunc10(10000×0.3)=3000');
assert(applySbrdnTypeModifier(500, 'B014', 10000, '20180101') === 500, 'B014 2018이전: 정액 그대로 500');
assert(applySbrdnTypeModifier(500, 'B030', 10000, '20220322') === 0,   'B030 2022이후: 0');
assert(applySbrdnTypeModifier(500, 'B030', 10000, '20210101') === 500, 'B030 2021이전: 500 유지');
assert(applySbrdnTypeModifier(500, 'V103', 10000, '20260101') === 0,   'V103: 0');
assert(applySbrdnTypeModifier(500, 'OTHER', 10000, '20260101') === 500, '기타코드: 원값 유지');

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-medical-aid 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-medical-aid 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
