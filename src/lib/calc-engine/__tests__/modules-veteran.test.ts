/**
 * modules-veteran.test.ts
 * getBohunRate / calcVeteran 단위 테스트
 */

import { getBohunRate, calcVeteran, BohunCode } from '../modules/insurance/veteran';
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

console.log('--- modules/insurance/veteran.ts ---');

// ── getBohunRate ─────────────────────────────────────────────────────────────
console.log('\n[getBohunRate]');
assert(getBohunRate('M10', '20260101') === 100, 'M10 → 100% (전액면제)');
assert(getBohunRate('M30', '20260101') === 30,  'M30 → 30%');
assert(getBohunRate('M50', '20260101') === 50,  'M50 → 50%');
assert(getBohunRate('M60', '20260101') === 60,  'M60 → 60%');
assert(getBohunRate('M90', '20260101') === 90,  'M90 2018이후 → 90%');
assert(getBohunRate('M90', '20170101') === 0,   'M90 2018이전 → 0%');
assert(getBohunRate('M20', '20180101') === 90,  'M20 2018이후 → 90%');
assert(getBohunRate('M20', '20171231') === 80,  'M20 2018이전 → 80%');
assert(getBohunRate('M81', '20260101') === 60,  'M81 보훈약국 → 60%');
assert(getBohunRate('M82', '20260101') === 0,   'M82 보훈약국 감면없음 → 0%');
assert(getBohunRate('M83', '20260101') === 90,  'M83 보훈약국 → 90%');
assert(getBohunRate('',    '20260101') === 0,   '빈 코드 → 0%');
assert(getBohunRate('M99', '20260101') === 0,   '알 수 없는 코드 → 0%');

// ── calcVeteran — M10 전액면제 ────────────────────────────────────────────
console.log('\n[calcVeteran — M10 전액면제]');
{
  const totalPrice = 20000;
  const options = {
    dosDate: '20260101',
    insuCode: 'G10',
    age: 60,
    drugList: [],
    bohunCode: 'M10',
    isMPVBill: false,
  } as unknown as CalcOptions;

  const result = {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  } as CalcResult;

  const rate = {
    insuCode: 'G10',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  } as InsuRate;

  const r = calcVeteran(options, result, rate);
  assert(r.userPrice === 0,          'M10: userPrice = 0');
  assert((r as any).mpvaPrice === totalPrice, 'M10: mpvaPrice = totalPrice');
  assert((r as any).insuPrice === 0, 'M10: insuPrice = 0');
}

// ── calcVeteran — M30 감면 30% (비위탁) ─────────────────────────────────────
console.log('\n[calcVeteran — M30 감면 30% 비위탁]');
{
  const totalPrice = 20000;
  const options = {
    dosDate: '20260101',
    insuCode: 'G10',
    age: 50,
    drugList: [],
    bohunCode: 'M30',
    isMPVBill: false,
  } as unknown as CalcOptions;

  const result = {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  } as CalcResult;

  const rate = {
    insuCode: 'G10',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  } as InsuRate;

  const r = calcVeteran(options, result, rate);
  // 비위탁 역산: mpvaPrice = totalPrice - trunc10(totalPrice × (100-30)/100)
  //   = 20000 - trunc10(20000 × 0.70) = 20000 - trunc10(14000) = 20000 - 14000 = 6000
  // basisAmt = totalPrice - mpvaPrice = 20000 - 6000 = 14000
  // 30% 감면 → trunc10(14000 × 30%) = trunc10(4200) = 4200
  const expectedMpva = 6000;
  const expectedUser = 4200;
  assert((r as any).mpvaPrice === expectedMpva, `M30 비위탁: mpvaPrice = ${expectedMpva}`);
  assert(r.userPrice === expectedUser,           `M30 비위탁: userPrice = ${expectedUser}`);
}

// ── calcVeteran — M50 감면 50% (위탁) ─────────────────────────────────────
console.log('\n[calcVeteran — M50 감면 50% 위탁]');
{
  const totalPrice = 19160;
  const options = {
    dosDate: '20260101',
    insuCode: 'G20',
    age: 55,
    drugList: [],
    bohunCode: 'M50',
    isMPVBill: true,
  } as unknown as CalcOptions;

  const result = {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  } as CalcResult;

  const rate = {
    insuCode: 'G20',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  } as InsuRate;

  const r = calcVeteran(options, result, rate);
  // 위탁: mpvaPrice = trunc10(19160 × 50%) = trunc10(9580) = 9580
  // basisAmt = 19160 - 9580 = 9580
  // 50% → trunc10(9580 × 30%) = trunc10(2874) = 2870
  const expectedMpva = 9580;
  const expectedUser = 2870;
  assert((r as any).mpvaPrice === expectedMpva, `M50 위탁: mpvaPrice = ${expectedMpva}`);
  assert(r.userPrice === expectedUser,           `M50 위탁: userPrice = ${expectedUser}`);
}

// ── calcVeteran — M60 감면 60% (비위탁) ─────────────────────────────────────
console.log('\n[calcVeteran — M60 감면 60% 비위탁]');
{
  const totalPrice = 10000;
  const options = {
    dosDate: '20260101',
    insuCode: 'G10',
    age: 65,
    drugList: [],
    bohunCode: 'M60',
    isMPVBill: false,
  } as unknown as CalcOptions;

  const result = {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  } as CalcResult;

  const rate = {
    insuCode: 'G10',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  } as InsuRate;

  const r = calcVeteran(options, result, rate);
  // 비위탁 역산: mpvaPrice = 10000 - trunc10(10000 × 0.40) = 10000 - 4000 = 6000
  // basisAmt = 10000 - 6000 = 4000
  // 60% → trunc10(4000 × 30%) = trunc10(1200) = 1200
  const expectedMpva = 6000;
  const expectedUser = 1200;
  assert((r as any).mpvaPrice === expectedMpva, `M60 비위탁: mpvaPrice = ${expectedMpva}`);
  assert(r.userPrice === expectedUser,           `M60 비위탁: userPrice = ${expectedUser}`);
}

// ── calcVeteran — M82 감면없음 (G10 비위탁 → ApplyBohunPharmacy에서 userPrice=0) ──
console.log('\n[calcVeteran — M82 감면없음 (G10 비위탁)]');
{
  const totalPrice = 10000;
  // G10 + 비위탁(isMPVBill=false) + isSimSa=false 조합:
  //   Step 5: userPrice = trunc100(10000 × 30%) = 3000 (일반 부담률)
  //   Step 7(ApplyBohunPharmacy): G계열 + 비위탁 → userPrice=0, mpvaPrice += 3000
  const options = {
    dosDate: '20260101',
    insuCode: 'G10',
    age: 65,
    drugList: [],
    bohunCode: 'M82',
    isMPVBill: false,
    isSimSa: false,
  } as unknown as CalcOptions;

  const result = {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  } as CalcResult;

  const rate = {
    insuCode: 'G10',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  } as InsuRate;

  const r = calcVeteran(options, result, rate);
  // M82 + G10 + 비위탁 계산 흐름:
  //   Step 5: userPrice = trunc100(10000 × 30%) = 3000 (M82 감면없음)
  //   Step 7 ApplyBohunPharmacy (G계열 비위탁):
  //     realPrice = 3000, userPrice → 0, mpvaPrice += 3000 = 3000
  //   → userPrice=0, mpvaPrice=3000, insuPrice=7000
  const ext = r as any;
  assert(r.userPrice === 0,           'M82 G10 비위탁: userPrice = 0 (보훈약국 전액 보훈청 부담)');
  assert(ext.mpvaPrice === 3000,      'M82 G10 비위탁: mpvaPrice = 3000 (환자부담 전환)');
  assert(ext.insuPrice === 7000,      'M82 G10 비위탁: insuPrice = 7000');
  assert(r.userPrice + ext.insuPrice + ext.mpvaPrice === totalPrice,
    `M82 G10 비위탁 3자배분 합산: 0+7000+3000=10000`);
}

// ── calcVeteran — M82 감면없음 (위탁 — userPrice 유지) ────────────────────
console.log('\n[calcVeteran — M82 위탁 (userPrice 일반 부담률)]');
{
  const totalPrice = 10000;
  const options = {
    dosDate: '20260101',
    insuCode: 'G20',
    age: 65,
    drugList: [],
    bohunCode: 'M82',
    isMPVBill: true, // 위탁: userPrice 그대로 유지
  } as unknown as CalcOptions;

  const result = {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  } as CalcResult;

  const rate = {
    insuCode: 'G20',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  } as InsuRate;

  const r = calcVeteran(options, result, rate);
  // M82 위탁: userPrice = trunc100(10000 × 30%) = 3000 유지
  assert(r.userPrice === 3000, 'M82 위탁: userPrice = 3000 (일반 30%)');
}

// ── 3자배분 합산 검증 ────────────────────────────────────────────────────────
console.log('\n[calcVeteran — 3자배분 합산 검증]');
{
  const totalPrice = 15000;
  const options = {
    dosDate: '20260101',
    insuCode: 'G10',
    age: 50,
    drugList: [],
    bohunCode: 'M50',
    isMPVBill: false,
  } as unknown as CalcOptions;

  const result = {
    sumInsuDrug: 0,
    sumWage: 0,
    totalPrice,
    userPrice: 0,
    pubPrice: 0,
    wageList: [],
    steps: [],
    error: undefined,
  } as CalcResult;

  const rate = {
    insuCode: 'G10',
    rate: 30,
    sixAgeRate: 70,
    fixCost: 0,
    mcode: 0,
    bcode: 0,
    age65_12000Less: 0,
  } as InsuRate;

  const r = calcVeteran(options, result, rate);
  const ext = r as any;
  const sum = r.userPrice + (ext.insuPrice ?? 0) + (ext.mpvaPrice ?? 0);
  assert(sum === totalPrice, `3자배분 합산: ${r.userPrice} + ${ext.insuPrice} + ${ext.mpvaPrice} = ${sum} === ${totalPrice}`);
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-veteran 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-veteran 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
