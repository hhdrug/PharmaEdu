/**
 * calc-engine/rounding.ts
 * 약제비 계산 반올림/절사 유틸리티 — C# RoundingHelper.cs 포팅
 *
 * 주의: JavaScript Math.round()는 "round half to even"이 아닌 "round half up"이지만
 * 정확히는 음수 처리에서 차이가 있다. 약제비는 항상 양수이므로 Math.round = AwayFromZero.
 */

/**
 * R01/R04/R06~R11: 원미만 사사오입 (4사5입)
 * 용도: 약품금액, 조제료금액, 할증금액 등 대부분의 금액 계산
 * 공식: Math.round(v) — JS의 Math.round는 양수에서 AwayFromZero와 동일
 */
export function round1(v: number): number {
  return Math.round(v);
}

/**
 * R12~R17: 10원 미만 절사 (내림)
 * 용도: 요양급여비용총액1/2, 의료급여 본인부담금
 * 공식: Math.floor(v / 10) * 10
 */
export function trunc10(v: number): number {
  return Math.floor(v / 10) * 10;
}

/**
 * 건보(C) 본인부담금: 100원 미만 절사 (내림)
 * 용도: 건강보험 본인부담금, 보훈 일반 본인부담금
 * 공식: Math.floor(v / 100) * 100
 */
export function trunc100(v: number): number {
  return Math.floor(v / 100) * 100;
}

/**
 * 10원 미만 사사오입
 * 용도: 조제료 단가 (점수 × 점수당단가)
 * 공식: Math.round(v / 10) * 10
 */
export function round10(v: number): number {
  return Math.round(v / 10) * 10;
}

/**
 * EDB 호환: (int)(v + 0.5) 사사오입
 * 양수 영역에서 round1과 동일
 */
export function roundToInt(v: number): number {
  return Math.floor(v + 0.5);
}
