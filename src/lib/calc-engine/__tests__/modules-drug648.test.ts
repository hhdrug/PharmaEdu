/**
 * modules-drug648.test.ts
 * apply648DayLimit / calc648Surcharge / has648Drug / calcDrug648Surcharge 단위 테스트
 */

import {
  apply648DayLimit,
  calc648Surcharge,
  has648Drug,
  sum648DrugAmount,
  calcDrug648Surcharge,
  SPECIAL_DRUG_648,
} from '../modules/special/drug-648';
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

function make648Drug(dDay: number, insuPay: string = 'covered'): DrugItem {
  return {
    code: SPECIAL_DRUG_648,
    insuPay,
    take: 'internal',
    price: 1000,
    dose: 1,
    dNum: 1,
    dDay,
    pack: 0,
  } as unknown as DrugItem;
}

function makeOtherDrug(dDay: number): DrugItem {
  return {
    code: 'OTHER001',
    insuPay: 'covered',
    take: 'internal',
    price: 500,
    dose: 1,
    dNum: 1,
    dDay,
    pack: 0,
  } as unknown as DrugItem;
}

console.log('--- modules/special/drug-648.ts ---');

// ── has648Drug ─────────────────────────────────────────────────────────────
console.log('\n[has648Drug]');
{
  assert(!has648Drug([]), '빈 리스트 → false');
  assert(!has648Drug([makeOtherDrug(5)]), '648 없음 → false');
  assert(has648Drug([make648Drug(5)]),    '648 있음 → true');
  assert(has648Drug([makeOtherDrug(3), make648Drug(5)]), '혼합 리스트 → true');
}

// ── apply648DayLimit ───────────────────────────────────────────────────────
console.log('\n[apply648DayLimit]');
{
  // dDay <= 5 → 변경 없음
  const list1 = [make648Drug(3)];
  const r1 = apply648DayLimit(list1);
  assert(r1[0].dDay === 3, 'dDay=3 → 변경 없음');

  const list2 = [make648Drug(5)];
  const r2 = apply648DayLimit(list2);
  assert(r2[0].dDay === 5, 'dDay=5 → 그대로 5');

  // dDay > 5 → 5로 제한
  const list3 = [make648Drug(7)];
  const r3 = apply648DayLimit(list3);
  assert(r3[0].dDay === 5, 'dDay=7 → 5로 제한');

  const list4 = [make648Drug(10)];
  const r4 = apply648DayLimit(list4);
  assert(r4[0].dDay === 5, 'dDay=10 → 5로 제한');

  // 원본 배열 불변 확인
  const list5 = [make648Drug(10)];
  apply648DayLimit(list5);
  assert(list5[0].dDay === 10, '원본 배열 불변');

  // 다른 약품은 변경 없음
  const list6 = [makeOtherDrug(14), make648Drug(7)];
  const r6 = apply648DayLimit(list6);
  assert(r6[0].dDay === 14, '다른 약품 dDay 불변');
  assert(r6[1].dDay === 5,  '648 약품 dDay 5로 제한');
}

// ── sum648DrugAmount ────────────────────────────────────────────────────────
console.log('\n[sum648DrugAmount]');
{
  // 648 없음 → 0
  const r1 = sum648DrugAmount([makeOtherDrug(5)]);
  assert(r1 === 0, '648 없음: sum = 0');

  // dose=1, dNum=1, dDay=5, price=1000, pack=0(→1)
  // amount = 1×1×5/1 = 5, drugAmt = floor(5×1000+0.5) = 5000
  const r2 = sum648DrugAmount([make648Drug(5)]);
  assert(r2 === 5000, `648 5일 × 1000원: sum = 5000 (실제: ${r2})`);

  // 비급여는 제외
  const nonCovered = make648Drug(5, 'nonCovered');
  const r3 = sum648DrugAmount([nonCovered]);
  assert(r3 === 0, '비급여 648: sum = 0');
}

// ── calc648Surcharge ────────────────────────────────────────────────────────
console.log('\n[calc648Surcharge]');
{
  // 2024.10.25 이전 → 0
  assert(calc648Surcharge(10000, '20241024') === 0,   '20241024: 날짜 미달 → 0');
  assert(calc648Surcharge(10000, '20241025') === 500,  '20241025: round1(10000×5%) = 500');
  assert(calc648Surcharge(10000, '20260101') === 500,  '20260101: round1(10000×5%) = 500');

  // sum648=0 → 0
  assert(calc648Surcharge(0, '20260101') === 0, 'sum648=0 → 0');

  // 소수점 round1 검증
  // round1(5001 × 0.05) = round1(250.05) = 250
  assert(calc648Surcharge(5001, '20260101') === 250, `round1(5001×5%) = 250`);
  // round1(5001 × 0.05) = round1(250.05) → 250
  // round1(5050 × 0.05) = round1(252.5) = 253
  assert(calc648Surcharge(5050, '20260101') === 253, `round1(5050×5%) = 253 (0.5 올림)`);
}

// ── calcDrug648Surcharge ────────────────────────────────────────────────────
console.log('\n[calcDrug648Surcharge]');
{
  // 날짜 조건 미충족
  const r1 = calcDrug648Surcharge({
    options: { dosDate: '20241024' },
    sum648: 10000,
  });
  assert(!r1.applied,      '날짜 미충족: applied = false');
  assert(r1.surcharge === 0, '날짜 미충족: surcharge = 0');

  // sum648=0
  const r2 = calcDrug648Surcharge({
    options: { dosDate: '20260101' },
    sum648: 0,
  });
  assert(!r2.applied,      'sum648=0: applied = false');

  // 정상 가산
  const r3 = calcDrug648Surcharge({
    options: { dosDate: '20260101' },
    sum648: 10000,
  });
  assert(r3.applied,          '정상: applied = true');
  assert(r3.surcharge === 500, `정상: surcharge = 500 (실제: ${r3.surcharge})`);

  // 보훈 M10 면제
  const r4 = calcDrug648Surcharge({
    options: { dosDate: '20260101' },
    sum648: 10000,
    bohunCode: 'M10',
  });
  assert(!r4.applied,      'M10 면제: applied = false');
  assert(r4.surcharge === 0, 'M10 면제: surcharge = 0');

  // 보훈 M83 면제
  const r5 = calcDrug648Surcharge({
    options: { dosDate: '20260101' },
    sum648: 10000,
    bohunCode: 'M83',
  });
  assert(!r5.applied,      'M83 면제: applied = false');

  // 보훈 M30 — 면제 아님
  const r6 = calcDrug648Surcharge({
    options: { dosDate: '20260101' },
    sum648: 10000,
    bohunCode: 'M30',
  });
  assert(r6.applied,          'M30은 면제 아님: applied = true');
  assert(r6.surcharge === 500, `M30: surcharge = 500`);
}

console.log('');
if (failCount === 0) {
  console.log('[PASS] modules-drug648 테스트 전체 통과\n');
} else {
  console.error(`[FAIL] modules-drug648 테스트 ${failCount}건 실패\n`);
  process.exit(1);
}
