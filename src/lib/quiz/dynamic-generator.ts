/**
 * dynamic-generator.ts
 * 계산형 동적 문제 생성기 — calc-engine을 활용한 무한 문제 생성
 *
 * MVP: insuCode=C10 (건강보험 일반) 고정
 * 난이도별 파라미터 범위:
 *   1=쉬움  : 성인(20~60세), 약품 1개, 투여일수 1~7일
 *   2=보통  : 65세 이상 포함, 약품 2~3개, 투여일수 1~14일
 *   3=어려움: 6세 미만 포함, 약품 3~5개, 투여일수 1~14일
 */

import type { CalcOptions, CalcResult, ICalcRepository } from '@/lib/calc-engine';
import { calculate } from '@/lib/calc-engine';

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

export interface DynamicDrug {
  code: string;
  price: number;
  dose: number;
  dnum: number;
  dday: number;
}

export interface DynamicQuestion {
  id: string;
  type: 'calc-copay' | 'calc-total' | 'calc-drug-amount';
  difficulty: 1 | 2 | 3;
  prompt: string;
  given: {
    insuCode: string;
    age: number;
    drugs: DynamicDrug[];
  };
  correctAnswer: number;
  answerField: 'totalPrice' | 'userPrice' | 'insuPrice' | 'drugAmount';
  explanation: string;
}

// ─── 내부 유틸리티 ───────────────────────────────────────────────────────────

/** 정수 범위 내 랜덤 값 (min, max 포함) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 배열에서 무작위 원소 선택 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 오늘 날짜 yyyyMMdd 형식 */
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// 예시 약품 코드 목록 (실제 EDI 코드 패턴, 교육용 더미)
const SAMPLE_CODES = [
  '012345678', // 예시 약품 A
  '023456789', // 예시 약품 B
  '034567890', // 예시 약품 C
  '045678901', // 예시 약품 D
  '056789012', // 예시 약품 E
];

// ─── 나이 선택 로직 ──────────────────────────────────────────────────────────

function pickAge(difficulty: 1 | 2 | 3): number {
  if (difficulty === 1) {
    // 쉬움: 성인 20~60
    return randInt(20, 60);
  } else if (difficulty === 2) {
    // 보통: 성인 또는 노인(65세 이상) 50:50
    return Math.random() < 0.5 ? randInt(20, 60) : randInt(65, 80);
  } else {
    // 어려움: 성인 / 노인(65+) / 소아(6세 미만) 각 1/3
    const r = Math.random();
    if (r < 0.33) return randInt(20, 60);
    if (r < 0.66) return randInt(65, 80);
    return randInt(0, 5); // 6세 미만
  }
}

// ─── 약품 목록 생성 ──────────────────────────────────────────────────────────

function buildDrugList(difficulty: 1 | 2 | 3): DynamicDrug[] {
  const countMap: Record<1 | 2 | 3, [number, number]> = {
    1: [1, 1],
    2: [2, 3],
    3: [3, 5],
  };
  const [minCount, maxCount] = countMap[difficulty];
  const count = randInt(minCount, maxCount);

  const dayRange: Record<1 | 2 | 3, [number, number]> = {
    1: [1, 7],
    2: [3, 14],
    3: [7, 14],
  };
  const [minDay, maxDay] = dayRange[difficulty];

  // 가격 범위: 쉬움=100~1000, 보통=200~3000, 어려움=500~5000
  const priceRanges: Record<1 | 2 | 3, [number, number]> = {
    1: [100, 1000],
    2: [200, 3000],
    3: [500, 5000],
  };
  const [minPrice, maxPrice] = priceRanges[difficulty];

  return Array.from({ length: count }, (_, i) => ({
    code: SAMPLE_CODES[i % SAMPLE_CODES.length],
    price: randInt(minPrice / 100, maxPrice / 100) * 100, // 100원 단위
    dose: pickRandom([0.5, 1, 1.5, 2]),
    dnum: pickRandom([1, 2, 3]),
    dday: randInt(minDay, maxDay),
  }));
}

// ─── 문제 유형 선택 ──────────────────────────────────────────────────────────

type QuestionType = DynamicQuestion['type'];

function pickQuestionType(difficulty: 1 | 2 | 3): QuestionType {
  if (difficulty === 1) {
    // 쉬움: 약품금액 또는 본인부담금
    return Math.random() < 0.5 ? 'calc-drug-amount' : 'calc-copay';
  }
  // 보통/어려움: 세 유형 중 랜덤
  return pickRandom<QuestionType>(['calc-copay', 'calc-total', 'calc-drug-amount']);
}

// ─── 약품 금액 계산 (calc-engine 없이 단순 계산) ─────────────────────────────

function calcDrugAmountOnly(drugs: DynamicDrug[]): number {
  return drugs.reduce((sum, d) => {
    // 단가 × 1회투약량 × 1일투여횟수 × 총투여일수 (원미만 사사오입 후 합산)
    const raw = d.price * d.dose * d.dnum * d.dday;
    return sum + Math.round(raw); // 원 단위 반올림
  }, 0);
}

// ─── 한국어 나이 설명 ─────────────────────────────────────────────────────────

function ageDescription(age: number): string {
  if (age < 6) return `${age}세 영유아(6세 미만)`;
  if (age >= 65) return `${age}세 노인(65세 이상)`;
  return `${age}세 성인`;
}

// ─── 약품 목록 텍스트 ─────────────────────────────────────────────────────────

function drugListText(drugs: DynamicDrug[]): string {
  return drugs
    .map(
      (d, i) =>
        `  약품${i + 1}: 단가 ${d.price.toLocaleString()}원, ` +
        `1회 ${d.dose}정, 1일 ${d.dnum}회, ${d.dday}일치`
    )
    .join('\n');
}

// ─── 단계별 해설 생성 ─────────────────────────────────────────────────────────

function buildExplanation(
  drugs: DynamicDrug[],
  result: CalcResult,
  type: QuestionType
): string {
  const lines: string[] = [];

  // 약품금액 계산 단계
  lines.push('【약품금액 계산】');
  let totalDrug = 0;
  drugs.forEach((d, i) => {
    const amt = Math.round(d.price * d.dose * d.dnum * d.dday);
    totalDrug += amt;
    lines.push(
      `  약품${i + 1}: ${d.price} × ${d.dose} × ${d.dnum} × ${d.dday} = ${amt.toLocaleString()}원`
    );
  });
  lines.push(`  약품금액 합계 = ${totalDrug.toLocaleString()}원`);

  if (type !== 'calc-drug-amount') {
    // 조제료
    lines.push(`\n【조제료】`);
    lines.push(`  조제료 합계 = ${result.sumWage.toLocaleString()}원`);

    // 요양급여비용 총액
    lines.push(`\n【요양급여비용 총액 (10원 미만 절사)】`);
    lines.push(
      `  (${totalDrug.toLocaleString()} + ${result.sumWage.toLocaleString()})` +
        ` → 10원 단위 절사 = ${result.totalPrice.toLocaleString()}원`
    );

    if (type === 'calc-copay') {
      lines.push(`\n【본인일부부담금】`);
      lines.push(`  본인부담금 = ${result.userPrice.toLocaleString()}원`);
      if (result.steps) {
        const copayStep = result.steps.find(
          (s) => s.title.includes('본인부담') || s.title.includes('본인일부')
        );
        if (copayStep) {
          lines.push(`  계산식: ${copayStep.formula}`);
        }
      }
    }
  }

  return lines.join('\n');
}

// ─── 메인 생성 함수 ───────────────────────────────────────────────────────────

/**
 * 동적 계산 문제 생성
 *
 * @param difficulty 난이도 (1=쉬움, 2=보통, 3=어려움)
 * @param repo       ICalcRepository (서버 사이드에서 주입)
 * @param type       문제 유형 (미지정 시 난이도에 맞게 랜덤)
 */
export async function generateQuestion(
  difficulty: 1 | 2 | 3,
  repo: ICalcRepository,
  type?: string
): Promise<DynamicQuestion> {
  const questionType = (type as QuestionType | undefined) ?? pickQuestionType(difficulty);
  const age = pickAge(difficulty);
  const drugs = buildDrugList(difficulty);
  const insuCode = 'C10'; // MVP: 건강보험 일반

  // ── calc-engine 호출 ──────────────────────────────────────────────────────
  const calcOpt: CalcOptions = {
    dosDate: todayStr(),
    insuCode,
    age,
    drugList: drugs.map((d) => ({
      code: d.code,
      insuPay: 'covered' as const,
      take: 'internal' as const,
      price: d.price,
      dose: d.dose,
      dNum: d.dnum,
      dDay: d.dday,
    })),
  };

  const result = await calculate(calcOpt, repo);

  // ── 정답 값 결정 ──────────────────────────────────────────────────────────
  let correctAnswer: number;
  let answerField: DynamicQuestion['answerField'];
  let promptSuffix: string;

  if (questionType === 'calc-drug-amount') {
    correctAnswer = calcDrugAmountOnly(drugs);
    answerField = 'drugAmount';
    promptSuffix = '이 처방전의 약품금액 합계(01항)는 얼마입니까?';
  } else if (questionType === 'calc-total') {
    correctAnswer = result.totalPrice;
    answerField = 'totalPrice';
    promptSuffix = '이 처방전의 요양급여비용 총액(총액1)은 얼마입니까?';
  } else {
    // calc-copay
    correctAnswer = result.userPrice;
    answerField = 'userPrice';
    promptSuffix = '이 처방전에서 환자가 부담하는 본인일부부담금은 얼마입니까?';
  }

  // ── 문제 텍스트 구성 ─────────────────────────────────────────────────────
  const diffLabel = difficulty === 1 ? '쉬움' : difficulty === 2 ? '보통' : '어려움';
  const prompt = [
    `[${diffLabel}] 건강보험(C10) 환자입니다.`,
    `환자 나이: ${ageDescription(age)}`,
    `처방 약품 목록:`,
    drugListText(drugs),
    ``,
    promptSuffix,
    `(단위: 원, 정수로 입력)`,
  ].join('\n');

  // ── 해설 생성 ─────────────────────────────────────────────────────────────
  const explanation = buildExplanation(drugs, result, questionType);

  // ── ID 생성 ───────────────────────────────────────────────────────────────
  const id = `dyn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    type: questionType,
    difficulty,
    prompt,
    given: { insuCode, age, drugs },
    correctAnswer,
    answerField,
    explanation,
  };
}
