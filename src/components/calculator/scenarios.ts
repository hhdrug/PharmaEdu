/**
 * 테스트 시나리오 프리셋 (22종)
 *
 * CH11 공식 테스트 시나리오 S01~S13 + webapp 학습 보조 S14~S22 (Phase 7 재정렬).
 * 이전 webapp의 S01~S19 와 S번호 매핑이 달라졌음 — CH11 문서 기준으로 표준화.
 *
 * 참조: src/content/chapters/ch11-테스트시나리오.md
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
  mediIllness?: string;
  // 가산 플래그
  isNight: boolean;
  isSaturday: boolean;
  isHolyDay: boolean;
  isMidNight: boolean;
  isDirectDispensing: boolean;
  isDalbitPharmacy: boolean;
  isPowder: boolean;   // powderYn="Y" 여부 (UI 전용)
  isTreatmentDisaster?: boolean;  // Phase 7 A2
  // 의료급여 1종 면제 플래그 (Phase 7 A1)
  isStudent?: boolean;
  isPregnant?: boolean;
  isHomeCare?: boolean;
  isSelectMedi?: boolean;
  isHomeless?: boolean;
  isExemptDisease?: boolean;
  isDisabled?: boolean;
  drugs: Omit<DrugItem, 'pack'>[];
  /** 이 시나리오가 검증/실습하는 Chapter 번호 목록 ('CH01' 등) */
  relatedChapters?: string[];
  /** 학습 경로 — 계산 단계별로 어떤 개념을 다루는지 설명 */
  learningPath?: Array<{
    chapter: string;
    concept: string;
  }>;
}

export const SCENARIOS: ScenarioPreset[] = [
  // ─────────────────────────────────────────────────────────────
  // CH11 공식 테스트 시나리오 S01~S13 (src/content/chapters/ch11-*.md §3~15)
  // ─────────────────────────────────────────────────────────────

  // S01: 기본 처방 (C10, 40세, 내복 7일)
  {
    id: 'S01',
    label: 'S01 기본 처방 (C10, 40세)',
    description: 'C10, 40세, 내복약 1종 7일 | 기본 파이프라인 전체 검증 (CH11 §3.1)',
    insuCode: 'C10', age: '40',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH01', 'CH02', 'CH03', 'CH05', 'CH07'],
    learningPath: [
      { chapter: 'CH01', concept: '약품금액 기본 공식' },
      { chapter: 'CH02', concept: 'Z코드 선택 (내복 7일)' },
      { chapter: 'CH03', concept: '조제료 합계 8,660원' },
      { chapter: 'CH05', concept: 'C10 30% 본인부담 → trunc100' },
      { chapter: 'CH07', concept: 'trunc10(총액1), trunc100(본인부담)' },
    ],
  },

  // S02: 단수 발생 (C10, 35세, 0.5정 × 2회 × 3일 × 10원 = 30원)
  {
    id: 'S02',
    label: 'S02 단수 발생 (C10, 35세)',
    description: 'C10, 35세, 단가10원·0.5정·2회·3일 → 약품금액 30원 | 사사오입 경계값 검증 (CH11 §3.2)',
    insuCode: 'C10', age: '35',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 10, dose: 0.5, dNum: 2, dDay: 3, insuDrug: true },
    ],
    relatedChapters: ['CH01', 'CH07'],
    learningPath: [
      { chapter: 'CH01', concept: '0.5정 × 2회 × 3일 × 10원 = 30원 (소수점 경계)' },
      { chapter: 'CH07', concept: 'Round1 사사오입 (정수값은 불변)' },
    ],
  },

  // S03: 6세미만 + 야간 (C10, 3세)
  {
    id: 'S03',
    label: 'S03 6세미만+야간 (C10, 3세)',
    description: 'C10, 3세, 야간, 내복 7일 | Z2000610+Z3000010+Z4107010 복합가산, 21% 본인부담 (CH11 §3.3)',
    insuCode: 'C10', age: '3',
    isNight: true, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH02', 'CH04', 'CH05', 'CH07'],
    learningPath: [
      { chapter: 'CH04', concept: '6세미만+야간 복합 가산 규칙' },
      { chapter: 'CH02', concept: 'Z2000610(6세미만+야간) 복합코드' },
      { chapter: 'CH05', concept: '약국 6세미만 부담률 30% × 70% = 21%' },
    ],
  },

  // S04: 혼합보험 (C10, 50세, 급여+비급여+100%본인)
  {
    id: 'S04',
    label: 'S04 혼합보험 (C10, 50세)',
    description: 'C10, 50세, 급여1+비급여1+100%본인1 7일 | 01/U/W항 분리, 총액1은 01+02항만 (CH11 §3.4)',
    insuCode: 'C10', age: '50',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered',    take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '999900001', insuPay: 'nonCovered', take: 'internal', price: 300, dose: 1, dNum: 2, dDay: 7, insuDrug: false },
      { code: '999900002', insuPay: 'fullSelf',   take: 'internal', price: 200, dose: 1, dNum: 2, dDay: 7, insuDrug: false },
    ],
    relatedChapters: ['CH01', 'CH05', 'CH08'],
    learningPath: [
      { chapter: 'CH01', concept: '01항(급여)/U항(100%본인)/W항(비급여) 분리' },
      { chapter: 'CH05', concept: '총액1 = 01항 + 02항만, U/W 제외' },
      { chapter: 'CH08', concept: '총액2 = 총액1 + U항 (전자청구용)' },
    ],
  },

  // S05: 65세 이상 정액 (C10, 70세, 저액)
  {
    id: 'S05',
    label: 'S05 65세 정액 (C10, 70세)',
    description: 'C10, 70세, 내복 3일 저액 (총액1 ≤ 10,000원) | FixCost 정액 분기 (CH11 §3.5)',
    insuCode: 'C10', age: '70',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 50, dose: 1, dNum: 2, dDay: 3, insuDrug: true },
    ],
    relatedChapters: ['CH05', 'CH08'],
    learningPath: [
      { chapter: 'CH05', concept: '65세 이상 + 총액 ≤ 10,000원 → FixCost 정액' },
      { chapter: 'CH08', concept: '65세 특례 총액 구간별 분기' },
    ],
  },

  // S06: 의료급여 1종 (D10, 50세, sbrdnType=M)
  {
    id: 'S06',
    label: 'S06 의료급여 1종 (D10, 50세)',
    description: 'D10, 50세, sbrdnType=M | Mcode 정액 본인부담 (CH11 §3.6)',
    insuCode: 'D10', age: '50', sbrdnType: 'M',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH05', 'CH07'],
    learningPath: [
      { chapter: 'CH05', concept: '의료급여 1종 Mcode 정액 본인부담' },
    ],
  },

  // S07: 보훈 60% 감면 (G10, 60세, M60)
  {
    id: 'S07',
    label: 'S07 보훈 60% 감면 (G10+M60, 60세)',
    description: 'G10+M60, 60세, 내복 7일 | Z1000/Z2000/Z3000=0, 보훈청 60% 부담, 환자 30% (CH11 §3.7)',
    insuCode: 'G10', bohunCode: 'M60', age: '60',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH06', 'CH12'],
    learningPath: [
      { chapter: 'CH12', concept: 'M60 보훈 60% 감면 + 조제료 일부 0원' },
      { chapter: 'CH06', concept: '3자배분 (환자/공단/보훈)' },
    ],
  },

  // S08: 가루약 가산 (C10, 40세, 산제)
  {
    id: 'S08',
    label: 'S08 가루약 가산 (C10, 40세)',
    description: 'C10, 40세, 산제=Y, 내복 7일 | Z4010(800원) 별도행, 다른 가산 배제 (CH11 §3.8)',
    insuCode: 'C10', age: '40',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: true,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, isPowder: '1', insuDrug: true },
    ],
    relatedChapters: ['CH02', 'CH04'],
    learningPath: [
      { chapter: 'CH04', concept: '가루약 가산 1순위 (다른 가산 배제)' },
      { chapter: 'CH02', concept: 'Z4010 산제 가산 별도 행' },
    ],
  },

  // S09: 토요가산 (C10, 40세, 토요)
  {
    id: 'S09',
    label: 'S09 토요가산 (C10, 40세)',
    description: 'C10, 40세, 토요일, 내복 7일 | Z2000/Z3000/Z4107 + 030 별도행 분리 (CH11 §3.9)',
    insuCode: 'C10', age: '40',
    isNight: false, isSaturday: true, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH02', 'CH04'],
    learningPath: [
      { chapter: 'CH04', concept: '토요가산 = 기본금액 별도 30% 가산행' },
      { chapter: 'CH02', concept: 'Z코드 접미사 030 (토요 분리행)' },
    ],
  },

  // S10: 빌런 처방 (C10, 3세, 야간+산제+혼합)
  {
    id: 'S10',
    label: 'S10 빌런 처방 (C10, 3세)',
    description: 'C10, 3세, 야간+산제, 급여+비급여+100%본인 | 가루약 1순위 → 야간/소아 배제, 단 21% 경감은 유지 (CH11 §3.10)',
    insuCode: 'C10', age: '3',
    isNight: true, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: true,
    drugs: [
      { code: '648901070', insuPay: 'covered',    take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, isPowder: '1', insuDrug: true },
      { code: '999900001', insuPay: 'nonCovered', take: 'internal', price: 300, dose: 1, dNum: 2, dDay: 7, insuDrug: false },
      { code: '999900002', insuPay: 'fullSelf',   take: 'internal', price: 200, dose: 1, dNum: 2, dDay: 7, insuDrug: false },
    ],
    relatedChapters: ['CH01', 'CH04', 'CH05', 'CH08'],
    learningPath: [
      { chapter: 'CH04', concept: '가루약 가산이 야간/소아가산을 배제' },
      { chapter: 'CH05', concept: '6세미만 21% 경감은 보험료율이라 유지' },
      { chapter: 'CH08', concept: '복합 조건에서 우선순위 명확화' },
    ],
  },

  // S11: 의료급여 2종 500원 정액 (D20, 45세, sbrdnType=B)
  {
    id: 'S11',
    label: 'S11 의료급여 2종 정액 (D20, 45세)',
    description: 'D20, 45세, sbrdnType=B | 약국 2종 정액 500원 (CH11 §3.11)',
    insuCode: 'D20', age: '45', sbrdnType: 'B',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH05'],
    learningPath: [
      { chapter: 'CH05', concept: 'D20 2종 Bcode 정액 500원 (법령 기준)' },
    ],
  },

  // S12: 의료급여 1종 면제 (D10, 10세, 18세미만 자동면제)
  {
    id: 'S12',
    label: 'S12 의료급여 1종 면제 (D10, 10세)',
    description: 'D10, 10세, sbrdnType=M | 18세미만 자동 면제 → 0원 (CH11 §3.12, CH05 §12.4 #1)',
    insuCode: 'D10', age: '10', sbrdnType: 'M',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH05'],
    learningPath: [
      { chapter: 'CH05', concept: '의료급여 1종 8종 면제 (§12.4): 18세 미만' },
    ],
  },

  // S13: 의료급여 경증질환 3% 정률 (D20, 45세, V252)
  {
    id: 'S13',
    label: 'S13 경증질환 V252 (D20, 45세)',
    description: 'D20, 45세, sbrdnType=B, 질병 V252 | 경증질환 3% 정률, 최저 500원 (CH11 §3.13)',
    insuCode: 'D20', age: '45', sbrdnType: 'B', mediIllness: 'V252',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 1000, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH05', 'CH08'],
    learningPath: [
      { chapter: 'CH05', concept: 'V252 경증질환 → max(trunc10(총액1×3%), 500)' },
      { chapter: 'CH08', concept: '산정특례 질병코드 분기' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // webapp 학습 보조 시나리오 S14~S22 (CH11 외 실전 케이스)
  // ─────────────────────────────────────────────────────────────

  // S14: 의료급여 B014 30% 정률 (D10+B014, 50세)
  {
    id: 'S14',
    label: 'S14 의료급여 B014 30% (D10+B014, 50세)',
    description: 'D10+B014, 50세, 내복 5일 | 2019.01.01~ sbrdnType=B014 30% 정률',
    insuCode: 'D10', age: '50', sbrdnType: 'B014',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 600, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 350, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
    ],
    relatedChapters: ['CH05', 'CH08'],
    learningPath: [
      { chapter: 'CH08', concept: 'sbrdnType B014 특수 분기 (2019.01.01~)' },
      { chapter: 'CH05', concept: '의료급여 30% 정률 10원 절사' },
    ],
  },

  // S15: 행려 D80 전액면제 (D80, 40세)
  {
    id: 'S15',
    label: 'S15 행려 D80 (40세)',
    description: 'D80 (행려 8종), 40세, 내복 3일 | 전액면제 userPrice=0',
    insuCode: 'D80', age: '40',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
    ],
    relatedChapters: ['CH05', 'CH08'],
    learningPath: [
      { chapter: 'CH08', concept: '행려 D80 특수 보험코드' },
      { chapter: 'CH05', concept: '전액면제 — 별도 분기' },
    ],
  },

  // S16: 보훈 M10 전액면제 (C10+M10, 70세)
  {
    id: 'S16',
    label: 'S16 보훈 M10 전액면제 (C10+M10, 70세)',
    description: 'C10+M10, 70세, 내복 7일 | M10 전액 보훈청 부담, 환자 0원',
    insuCode: 'C10', bohunCode: 'M10', age: '70',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 800, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH06', 'CH12'],
    learningPath: [
      { chapter: 'CH12', concept: 'M10 전액 보훈 청구' },
      { chapter: 'CH06', concept: '3자배분 — 환자 0, 보훈 전액' },
    ],
  },

  // S17: 보훈위탁 G20+M10 (G20+M10, 75세)
  {
    id: 'S17',
    label: 'S17 보훈위탁 G20+M10 (75세)',
    description: 'G20+M10, 75세, 내복 7일 | 보훈위탁 약국에서의 3자배분',
    insuCode: 'G20', bohunCode: 'M10', age: '75',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 800, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 350, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH06', 'CH12'],
    learningPath: [
      { chapter: 'CH12', concept: 'G20 보훈위탁 + M10 전액면제 (MT038 분기)' },
      { chapter: 'CH06', concept: '보훈청구액·본인부담·공단청구 3자 합산' },
    ],
  },

  // S18: 산재 E10 전액면제 (E10, 40세)
  {
    id: 'S18',
    label: 'S18 산재 E10 (40세)',
    description: 'E10 산재요양급여, 40세, 내복 5일 | 환자부담 0원, 전액 공단(근로복지) 부담',
    insuCode: 'E10', age: '40',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 5, insuDrug: true },
    ],
    relatedChapters: ['CH05'],
    learningPath: [
      { chapter: 'CH05', concept: 'E10 산재 — 환자부담 0원' },
    ],
  },

  // S19: 자동차보험 F10 (F10, 35세)
  {
    id: 'S19',
    label: 'S19 자동차보험 F10 (35세)',
    description: 'F10, 35세, 내복 7일 3종 | 전액 환자부담 (보험사 추후 보상), insuPrice=0',
    insuCode: 'F10', age: '35',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 800, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 450, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
      { code: '648903090', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 7, insuDrug: true },
    ],
    relatedChapters: ['CH04', 'CH05'],
    learningPath: [
      { chapter: 'CH05', concept: 'F10 자보 — 전액 환자부담' },
      { chapter: 'CH04', concept: 'M_AddRat 할증 (addRat 입력 시)' },
    ],
  },

  // S20: 산재 E20 후유증 (E20, 50세)
  {
    id: 'S20',
    label: 'S20 산재 E20 후유증 (50세)',
    description: 'E20 산재 후유증, 50세, 내복 3일 | E20도 전액면제 (산재 후유증)',
    insuCode: 'E20', age: '50',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 600, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
    ],
    relatedChapters: ['CH05'],
    learningPath: [
      { chapter: 'CH05', concept: 'E20 산재 후유증 — 환자부담 0원 (E10과 동일 규칙)' },
    ],
  },

  // S21: 직접조제 (C10, 45세, isDirectDispensing)
  {
    id: 'S21',
    label: 'S21 직접조제 (C10, 45세)',
    description: 'C10, 45세, 직접조제=Y | 의사 직접조제 → Z4200 계열, 약국관리/복약지도 없음',
    insuCode: 'C10', age: '45',
    isNight: false, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: true, isDalbitPharmacy: false, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 500, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 1, dNum: 3, dDay: 3, insuDrug: true },
    ],
    relatedChapters: ['CH02', 'CH08'],
    learningPath: [
      { chapter: 'CH08', concept: '직접조제 특수 분기 (의사 조제)' },
      { chapter: 'CH02', concept: 'Z4200 직접조제 전용 코드' },
    ],
  },

  // S22: 달빛어린이 야간 (C10, 5세, 야간+달빛)
  {
    id: 'S22',
    label: 'S22 달빛어린이 야간 (C10, 5세)',
    description: 'C10, 5세, 야간+달빛어린이약국 | Z7001 복약상담료 + Z2000610 6세미만+야간',
    insuCode: 'C10', age: '5',
    isNight: true, isSaturday: false, isHolyDay: false, isMidNight: false,
    isDirectDispensing: false, isDalbitPharmacy: true, isPowder: false,
    drugs: [
      { code: '648901070', insuPay: 'covered', take: 'internal', price: 400, dose: 0.5, dNum: 3, dDay: 3, insuDrug: true },
      { code: '648902080', insuPay: 'covered', take: 'internal', price: 300, dose: 0.5, dNum: 3, dDay: 3, insuDrug: true },
    ],
    relatedChapters: ['CH04', 'CH08'],
    learningPath: [
      { chapter: 'CH08', concept: '달빛어린이 특수 Z7001 가산' },
      { chapter: 'CH04', concept: '6세미만+야간+달빛 복합 가산 조합' },
    ],
  },
];

/** 카테고리 그룹 (탭 표시용) */
export const SCENARIO_GROUPS = [
  {
    label: 'CH11 공식 S01~S05',
    ids: ['S01', 'S02', 'S03', 'S04', 'S05'],
  },
  {
    label: 'CH11 공식 S06~S10',
    ids: ['S06', 'S07', 'S08', 'S09', 'S10'],
  },
  {
    label: 'CH11 의료급여 S11~S13',
    ids: ['S11', 'S12', 'S13'],
  },
  {
    label: '의료급여 확장 (S14~S15)',
    ids: ['S14', 'S15'],
  },
  {
    label: '보훈 (S16~S17)',
    ids: ['S16', 'S17'],
  },
  {
    label: '산재·자보 (S18~S20)',
    ids: ['S18', 'S19', 'S20'],
  },
  {
    label: '특수 모드 (S21~S22)',
    ids: ['S21', 'S22'],
  },
];

/** id로 시나리오 조회 */
export function getScenarioById(id: string): ScenarioPreset | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

/** 특정 chapter를 다루는 시나리오 목록 */
export function getScenariosByChapter(chapter: string): ScenarioPreset[] {
  return SCENARIOS.filter((s) => s.relatedChapters?.includes(chapter));
}
