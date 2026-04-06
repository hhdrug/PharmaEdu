/**
 * S01 시나리오 단독 검증 스크립트 (Supabase 없이 Mock 데이터로 검증)
 * 실행: npx ts-node src/lib/calc-engine/__tests__/s01-verify.ts
 *
 * S01 입력:
 *   C10, 40세, 내복약 1종, 단가 500원, 1회 1정, 1일 3회, 7일
 *
 * S01 기대값:
 *   약품금액: 10,500원
 *   조제료: 8,660원 (Z1000:790 + Z2000:1720 + Z3000:1150 + Z4107:4320 + Z5000:680)
 *   총액: 19,160원
 *   본인부담: 5,700원 (trunc100(19160 × 30%) = trunc100(5748) = 5700)
 *   청구액: 13,460원
 */

import type { ICalcRepository, InsuRate } from '../types';
import { calculate } from '../index';

// ─── Mock Repository ─────────────────────────────────────────────────────────

class MockCalcRepository implements ICalcRepository {
  private readonly sugaFee = new Map<string, { price: number; name: string }>([
    ['Z1000',   { price: 790,  name: '약국관리료' }],
    ['Z2000',   { price: 1720, name: '기본조제료' }],
    ['Z3000',   { price: 1150, name: '복약지도료' }],
    // Z4107 = 7일 내복약 조제료
    ['Z4107',   { price: 4320, name: '내복약조제료(7일)' }],
    ['Z5000',   { price: 680,  name: '의약품관리료' }],
    // 가산 코드들 (이 테스트에서는 사용 안함)
    ['Z2000010',{ price: 2240, name: '기본조제료(야간)' }],
    ['Z3000010',{ price: 1500, name: '복약지도료(야간)' }],
  ]);

  async getSugaFeeMap(_year: number) {
    return new Map(this.sugaFee);
  }

  async getPrescDosageFee(_year: number, _days: number) {
    return null; // 7일은 1~15일 직접 코드 사용
  }

  async getInsuRate(_insuCode: string): Promise<InsuRate> {
    return {
      insuCode: 'C10',
      rate: 30,
      sixAgeRate: 70,
      fixCost: 1000,
      mcode: 0,
      bcode: 0,
      age65_12000Less: 20,
    };
  }
}

// ─── 테스트 실행 ─────────────────────────────────────────────────────────────

async function runS01() {
  console.log('=== S01 시나리오 검증 ===');
  console.log('입력: C10, 40세, 내복약 1종, 단가 500원, 1회1정 × 3회 × 7일');
  console.log('');

  const repo = new MockCalcRepository();

  const result = await calculate(
    {
      dosDate: '20260403',
      insuCode: 'C10',
      age: 40,
      drugList: [
        {
          code: 'S01drug',
          insuPay: 'covered',
          take: 'internal',
          price: 500,
          dose: 1,
          dNum: 3,
          dDay: 7,
          pack: 0,
        },
      ],
    },
    repo
  );

  if (result.error) {
    console.error('계산 실패:', result.error);
    process.exit(1);
  }

  const expected = {
    sumInsuDrug: 10500,
    sumWage: 8660,
    totalPrice: 19160,
    userPrice: 5700,
    pubPrice: 13460,
  };

  let allPass = true;

  function check(field: string, actual: number, exp: number) {
    const pass = actual === exp;
    if (!pass) allPass = false;
    const mark = pass ? '✓' : '✗';
    console.log(
      `  ${mark} ${field.padEnd(20)} 기대: ${String(exp).padStart(7)}원  실제: ${String(actual).padStart(7)}원`
    );
  }

  check('약품금액 (sumInsuDrug)', result.sumInsuDrug, expected.sumInsuDrug);
  check('조제료 (sumWage)',       result.sumWage,      expected.sumWage);
  check('총액 (totalPrice)',      result.totalPrice,   expected.totalPrice);
  check('본인부담 (userPrice)',   result.userPrice,    expected.userPrice);
  check('청구액 (pubPrice)',      result.pubPrice,     expected.pubPrice);

  console.log('');
  console.log('조제료 세부내역:');
  for (const w of result.wageList) {
    console.log(`  ${w.sugaCd.padEnd(12)} ${w.name.padEnd(20)} ${w.sum}원`);
  }

  console.log('');
  if (allPass) {
    console.log('[PASS] S01 시나리오 검증 성공 — 모든 값 일치');
  } else {
    console.error('[FAIL] S01 시나리오 검증 실패 — 불일치 항목 있음');
    process.exit(1);
  }
}

runS01().catch((e) => {
  console.error(e);
  process.exit(1);
});
