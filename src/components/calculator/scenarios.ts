/**
 * 19개 테스트 시나리오 프리셋
 * WPF TestApp MainWindow.xaml.cs RunScenario_1 ~ RunScenario_19 1:1 포팅
 */

import type { DrugItem } from '@/lib/calc-engine';

export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  // CalcOptions 필드
  insuCode: string;
  bohunCode?: string;
  age: string;
  sbrdnType?: string;
  // 가산 플래그
  isNight: boolean;
  isSaturday: boolean;
  isHolyDay: boolean;
  isMidNight: boolean;
  isDirectDispensing: boolean;
  isDalbitPharmacy: boolean;
  isPowder: boolean;   // powderYn="Y" 여부 (UI 전용)
  drugs: Omit<DrugItem, 'pack'>[];
}

export const SCENARIOS: ScenarioPreset[] = [
  // ── S01: 일반 건보 내복약 3일 (C10, 45세, 약품2종) ────────────────────────
  {
    id: 'S01',
    label: 'S01 일반 3일 (C10, 45세)',
    description: 'C10, 45세, 내복약 2종 3일 | 기본 파이프라인 전체 검증',
    insuCode: 'C10',
    age: '45',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 3, isPowder: undefined, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 3, isPowder: undefined, insuDrug: true },
    ],
  },

  // ── S02: 7일 내복+외용 복합 (C10, 35세) ─────────────────────────────────
  {
    id: 'S02',
    label: 'S02 7일+외용 복합 (C10, 35세)',
    description: 'C10, 35세, 내복2+외용1 7일 | Z4121 외용병용 코드 검증',
    insuCode: 'C10',
    age: '35',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 800, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 450, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '670400020', insuPay: 'covered', take: 'external', price: 1200, dose: 1, dNum: 1, dDay: 7, insuDrug: true },
    ],
  },

  // ── S03: 급여+비급여 혼합 (C10, 40세) ────────────────────────────────────
  {
    id: 'S03',
    label: 'S03 급여+비급여 혼합 (C10, 40세)',
    description: 'C10, 40세, 급여1+비급여1 | W항 분리, totalPrice1 비급여 제외 검증',
    insuCode: 'C10',
    age: '40',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered',    take: 'internal', price: 500,  dose: 1, dNum: 3, dDay: 5, insuDrug: true  },
      { code: '999900001', insuPay: 'nonCovered', take: 'internal', price: 3000, dose: 1, dNum: 1, dDay: 5, insuDrug: false },
    ],
  },

  // ── S04: 65세 이상 저액 정액 (C10, 72세) ─────────────────────────────────
  {
    id: 'S04',
    label: 'S04 65세 저액 정액 (C10, 72세)',
    description: 'C10, 72세, 내복1 3일 | 65세+총액≤10,000 → FixCost 정액 분기',
    insuCode: 'C10',
    age: '72',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 200, dose: 1, dNum: 2, dDay: 3, insuDrug: true },
    ],
  },

  // ── S05: 6세미만 소아 (C10, 3세) ─────────────────────────────────────────
  {
    id: 'S05',
    label: 'S05 6세미만 소아 (C10, 3세)',
    description: 'C10, 3세, 0.5정×2종 | Z2000600 + 21% 본인부담',
    insuCode: 'C10',
    age: '3',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 400, dose: 0.5, dNum: 3, dDay: 3, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 0.5, dNum: 3, dDay: 3, insuDrug: true },
    ],
  },

  // ── S06: 의료급여 1종 (D10, 55세) ────────────────────────────────────────
  {
    id: 'S06',
    label: 'S06 의료급여 1종 (D10, 55세)',
    description: 'D10, 55세, 내복2종 5일 | Mcode 정액 본인부담(기본)',
    insuCode: 'D10',
    age: '55',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 600, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 350, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
    ],
  },

  // ── S07: 보훈 M10 전액면제 (C10+M10, 70세) ────────────────────────────────
  {
    id: 'S07',
    label: 'S07 보훈 M10 전액면제 (C10+M10, 70세)',
    description: 'C10+M10, 70세, 내복1 7일 | userPrice=0, mpvaPrice=totalPrice',
    insuCode: 'C10',
    bohunCode: 'M10',
    age: '70',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 800, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
  },

  // ── S08: 야간+토요 가산 (C10, 45세) ──────────────────────────────────────
  {
    id: 'S08',
    label: 'S08 야간+토요 가산 (C10, 45세)',
    description: 'C10, 45세, 야간+토요 | 010 코드 + 030 별도 행',
    insuCode: 'C10',
    age: '45',
    isNight: true, isSaturday: true, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
    ],
  },

  // ── S09: 산재 요양급여 (E10, 40세) ───────────────────────────────────────
  {
    id: 'S09',
    label: 'S09 산재 E10 (본인부담 0원)',
    description: 'E10, 40세, 내복2종 5일 | 산재 전액면제',
    insuCode: 'E10',
    age: '40',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
    ],
  },

  // ── S10: 자동차보험 (F10, 35세) ───────────────────────────────────────────
  {
    id: 'S10',
    label: 'S10 자동차보험 F10 (전액 본인)',
    description: 'F10, 35세, 내복3종 7일 | 전액 본인부담, insuPrice=0',
    insuCode: 'F10',
    age: '35',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 800, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 450, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '648903090', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
  },

  // ── S11: 산재 후유증 (E20, 50세) ─────────────────────────────────────────
  {
    id: 'S11',
    label: 'S11 산재 후유증 E20 (본인부담 0원)',
    description: 'E20, 50세, 내복1 3일 | E20도 전액면제',
    insuCode: 'E20',
    age: '50',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 600, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
    ],
  },

  // ── S12: 보훈위탁 G20+M10 (75세) ─────────────────────────────────────────
  {
    id: 'S12',
    label: 'S12 보훈위탁 G20+M10 (75세)',
    description: 'G20+M10, 75세, 내복2 7일 | 보훈 전액청구',
    insuCode: 'G20',
    bohunCode: 'M10',
    age: '75',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 800, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 350, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
  },

  // ── S13: 직접조제 (C10, 45세) ─────────────────────────────────────────────
  {
    id: 'S13',
    label: 'S13 직접조제 (C10, 45세)',
    description: 'C10, 45세, 직접조제 | Z4200 코드 사용',
    insuCode: 'C10',
    age: '45',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: true, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
    ],
  },

  // ── S14: 달빛어린이 (C10, 5세, 야간) ─────────────────────────────────────
  {
    id: 'S14',
    label: 'S14 달빛어린이 야간 (C10, 5세)',
    description: 'C10, 5세, 야간, 달빛어린이 | Z7001 + Z2000610',
    insuCode: 'C10',
    age: '5',
    isNight: true, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: true, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 400, dose: 0.5, dNum: 3, dDay: 3, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 0.5, dNum: 3, dDay: 3, insuDrug: true },
    ],
  },

  // ── S15: 보훈 M60+야간 (G10, 60세) ───────────────────────────────────────
  {
    id: 'S15',
    label: 'S15 보훈 M60+야간 (G10, 60세)',
    description: 'G10+M60, 60세, 야간 | 60% 감면 + 3자 배분',
    insuCode: 'G10',
    bohunCode: 'M60',
    age: '60',
    isNight: true, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 800, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 350, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
  },

  // ── S16: 의료급여 2종+65세 (D20, 70세) ───────────────────────────────────
  {
    id: 'S16',
    label: 'S16 의료급여 2종+65세 (D20, 70세)',
    description: 'D20, 70세, 내복1 3일 | D20 정액/15% 정률 분기',
    insuCode: 'D20',
    age: '70',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
    ],
  },

  // ── S17: 의료급여 B014 30% (D10, 50세) ───────────────────────────────────
  {
    id: 'S17',
    label: 'S17 의료급여 B014 30% (D10, 50세)',
    description: 'D10+B014, 50세, 내복2 5일 | sbrdnType B014 → 30% 정률',
    insuCode: 'D10',
    sbrdnType: 'B014',
    age: '50',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 600, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 350, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
    ],
  },

  // ── S18: 행려 8종 D80 (D80, 40세) ────────────────────────────────────────
  {
    id: 'S18',
    label: 'S18 행려 D80 (전액면제)',
    description: 'D80, 40세, 내복2 3일 | 행려 전액면제 userPrice=0',
    insuCode: 'D80',
    age: '40',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
    ],
  },

  // ── S19: 산제 가루약 ATB (C10, 8세) ──────────────────────────────────────
  {
    id: 'S19',
    label: 'S19 산제 가루약 ATB (C10, 8세)',
    description: 'C10, 8세, powder=Y, ATB성분 | Z4010 산제가산 별도 행',
    insuCode: 'C10',
    age: '8',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: true,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 600, dose: 1, dNum: 3, dDay: 3, isPowder: '1', insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 400, dose: 1, dNum: 3, dDay: 3, isPowder: '1', insuDrug: true },
    ],
  },
];

/** 카테고리 그룹 (탭 표시용) */
export const SCENARIO_GROUPS = [
  {
    label: '건강보험 (C)',
    ids: ['S01', 'S02', 'S03', 'S04', 'S05', 'S08'],
  },
  {
    label: '의료급여 (D)',
    ids: ['S06', 'S16', 'S17', 'S18'],
  },
  {
    label: '보훈 (G)',
    ids: ['S07', 'S12', 'S15'],
  },
  {
    label: '산재/자보 (E/F)',
    ids: ['S09', 'S10', 'S11'],
  },
  {
    label: '특수 모드',
    ids: ['S13', 'S14', 'S19'],
  },
];
