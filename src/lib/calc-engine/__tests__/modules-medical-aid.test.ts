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

// ── Phase 7: CH05 §12.4 — 의료급여 1종 면제 8종 ──────────────────────────
console.log('\n[CH05 §12.4 — 의료급여 1종 면제 8종 (Step 0)]');
{
  const rate = makeRate({ insuCode: 'D10', mcode: 1000 });
  const baseOpts: CalcOptions = {
    insuCode: 'D10',
    dosDate: '20260101',
    age: 50,
    sbrdnType: 'M',
    drugList: [],
  } as unknown as CalcOptions;

  // (1) 18세 미만 자동 판정 (age < 18)
  {
    const opts = { ...baseOpts, age: 10 } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(19160), rate);
    assert(r.userPrice === 0, '18세 미만 자동: userPrice = 0');
    assert(r.pubPrice === 19160, '18세 미만 자동: pubPrice = totalPrice');
  }

  // (2) isUnder18 명시 플래그
  {
    const opts = { ...baseOpts, age: 40, isUnder18: true } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate);
    assert(r.userPrice === 0, 'isUnder18=true: userPrice = 0');
  }

  // (3) isStudent (20세 미만 재학생)
  {
    const opts = { ...baseOpts, age: 19, isStudent: true } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate);
    assert(r.userPrice === 0, 'isStudent=true: userPrice = 0');
  }

  // (4) 임산부
  {
    const opts = { ...baseOpts, age: 30, isPregnant: true } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate);
    assert(r.userPrice === 0, 'isPregnant=true: userPrice = 0');
  }

  // (5) 가정간호
  {
    const opts = { ...baseOpts, age: 60, isHomeCare: true } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate);
    assert(r.userPrice === 0, 'isHomeCare=true: userPrice = 0');
  }

  // (6) 선택의료급여기관
  {
    const opts = { ...baseOpts, age: 45, isSelectMedi: true } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate);
    assert(r.userPrice === 0, 'isSelectMedi=true: userPrice = 0');
  }

  // (7) 행려/노숙인
  {
    const opts = { ...baseOpts, age: 40, isHomeless: true } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate);
    assert(r.userPrice === 0, 'isHomeless=true: userPrice = 0');
  }

  // (8) 결핵·희귀·중증질환
  {
    const opts = { ...baseOpts, age: 50, isExemptDisease: true } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate);
    assert(r.userPrice === 0, 'isExemptDisease=true: userPrice = 0');
  }

  // (9) 등록 장애인
  {
    const opts = { ...baseOpts, age: 55, isDisabled: true } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate);
    assert(r.userPrice === 0, 'isDisabled=true: userPrice = 0');
  }

  // (10) 8종 모두 false + 성인 → 정액 경로 유지
  {
    const opts = { ...baseOpts, age: 50 } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(19160), rate);
    assert(r.userPrice === 1000, '8종 모두 false: Mcode 정액 1000원 유지');
  }

  // (11) D20 에는 면제 분기 적용 안 됨 (D10 만 해당)
  {
    const rate20 = makeRate({ insuCode: 'D20', fixCost: 500 });
    const opts = { insuCode: 'D20', dosDate: '20260101', age: 10, sbrdnType: 'B', drugList: [] } as unknown as CalcOptions;
    const r = calcMedicalAid(opts, makeResult(10000), rate20);
    // D20 은 1종 면제 8종 분기 없음 → 정액 500원
    assert(r.userPrice === 500, 'D20 10세: 1종 면제 미적용, 500원 정액');
  }
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-medical-aid 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-medical-aid 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
