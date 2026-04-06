/**
 * modules/insurance/workers-comp.ts
 * 산재(E) 본인부담금 계산 모듈
 *
 * 대상 보험코드:
 *   E10 — 산재 요양급여 (일반)
 *   E20 — 산재 후유증 (특수)
 *
 * 핵심 규칙:
 *   - 본인부담금 = 0원 (전액 산재보험 부담)
 *   - 환자는 아무것도 내지 않음
 *   - insuPrice = totalPrice (요양급여비용총액1 전액 산재 청구)
 *   - pubPrice = totalPrice (청구액 = 전체)
 *
 * 참조:
 *   - C#: CopaymentCalculator.cs 189~191행
 *       `case InsuranceType.Industrial: userPrice = 0m; break;`
 *   - output/CH05_보험유형별_본인부담금.md §7 (산재보험)
 *       "본인일부부담금 = 0  // 전액 보험 부담"
 *   - 비즈팜: optBoHum4 → 0
 *   - EDB/유팜: 동일 처리 확인 (4소스 일치)
 */

import type { CalcOptions, CalcResult, InsuRate } from '../../types';

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

/**
 * 산재(E10/E20) 본인부담금 계산
 *
 * E10 (산재 요양급여):
 *   - 업무상 재해로 인한 요양급여 — 환자 부담 없음
 *   - 근로복지공단이 전액 부담
 *
 * E20 (산재 후유증):
 *   - 산재 치료 후 후유증 관련 처방 — 동일하게 0원
 *   - C# 소스에서 E10/E20 구분 없이 동일 처리 (InsuranceType.Industrial)
 *   - 4개 소스 시스템 모두 E계열 본인부담 = 0 확인
 *
 * @param options - 계산 입력 파라미터 (insuCode: 'E10' | 'E20')
 * @param result  - 기존 계산 결과 (sumInsuDrug, sumWage, totalPrice 포함)
 * @param rate    - 보험요율 마스터 (산재의 경우 rate 사용 안 함)
 * @returns 산재 본인부담금 적용 완료된 CalcResult
 */
export function calcWorkersComp(
  options: CalcOptions,
  result: CalcResult,
  rate: InsuRate
): CalcResult {
  const insuCode = options.insuCode.toUpperCase();

  // E10 / E20 구분 메모
  // - E10: 산재 요양급여 (업무상 재해 치료 중)
  // - E20: 산재 후유증 (치료 종결 후 후유증 관련)
  // - 4소스 교차검증 결과: 양쪽 모두 본인부담 0원으로 동일 처리
  // - 향후 E20 특수 조건 발생 시 아래 분기점에서 확장 가능
  const isE20 = insuCode === 'E20';

  // 본인부담금 = 0원 (E10, E20 공통)
  // C# CopaymentCalculator.cs 189행:
  //   case InsuranceType.Industrial: userPrice = 0m; break;
  const userPrice = 0;

  // pubPrice = totalPrice - userPrice = totalPrice (전액 근로복지공단 청구)
  // NOTE: insuPrice 필드는 types.ts에 미추가 상태 (Integration Lead 담당 §5.2)
  //       현재는 pubPrice로 산재 청구액을 표현.
  const pubPrice = result.totalPrice - userPrice;

  return {
    ...result,
    userPrice,
    pubPrice,
    steps: [
      ...result.steps,
      {
        title: `산재보험 본인부담금 (${insuCode})`,
        formula: isE20
          ? 'E20 산재 후유증 → 환자 부담 없음 (전액 근로복지공단 부담)'
          : 'E10 산재 요양급여 → 환자 부담 없음 (전액 근로복지공단 부담)',
        result: 0,
        unit: '원',
      },
      {
        title: '산재 청구액 (pubPrice)',
        formula: `pubPrice = totalPrice − userPrice = ${result.totalPrice} − 0 = ${pubPrice}원`,
        result: pubPrice,
        unit: '원',
      },
    ],
  };
}
