export type Difficulty = '입문' | '기초' | '중급' | '심화';

export type ChapterMeta = {
  slug: string;          // 'ch01-약품금액'
  number: string;        // 'CH01'
  title: string;         // '약품금액 계산'
  description: string;  // short description
  difficulty: Difficulty;
  estimatedMinutes: number;
  order: number;
};

export const CHAPTERS: ChapterMeta[] = [
  {
    slug: 'ch00-기준데이터',
    number: 'CH00',
    title: '기준 데이터 입력 규격',
    description: '약제비 계산 엔진에 필요한 입력 파라미터 전체 정의 (처방전/조제건 단위)',
    difficulty: '입문',
    estimatedMinutes: 15,
    order: 0,
  },
  {
    slug: 'ch01-약품금액',
    number: 'CH01',
    title: '약품금액 계산 로직',
    description: '처방 약품 1줄의 금액 산출 공식 — 단가 × 투약량 × 횟수 × 일수, 4사5입 포함',
    difficulty: '기초',
    estimatedMinutes: 20,
    order: 1,
  },
  {
    slug: 'ch02-조제료코드',
    number: 'CH02',
    title: '조제료 Z코드 체계',
    description: 'Z코드 기본 구조·대분류·접미사(산정코드) 체계와 투약일수별 코드 생성 로직',
    difficulty: '기초',
    estimatedMinutes: 25,
    order: 2,
  },
  {
    slug: 'ch03-수가계산',
    number: 'CH03',
    title: '조제료 수가 계산 로직',
    description: '약국관리료·기본조제기술료·복약지도료·약품조제료 항목별 금액 산출 상세 로직',
    difficulty: '중급',
    estimatedMinutes: 35,
    order: 3,
  },
  {
    slug: 'ch04-가산로직',
    number: 'CH04',
    title: '가산 로직',
    description: '야간·공휴일·토요일·산제·직접조제·6세미만·65세이상 등 8종 가산의 우선순위 규칙',
    difficulty: '중급',
    estimatedMinutes: 30,
    order: 4,
  },
  {
    slug: 'ch05-본인부담금',
    number: 'CH05',
    title: '보험유형별 본인부담금',
    description: '건강보험·의료급여·보훈·자동차보험·산재 유형별 본인부담금 산출 방식 전체 비교',
    difficulty: '중급',
    estimatedMinutes: 40,
    order: 5,
  },
  {
    slug: 'ch06-3자배분',
    number: 'CH06',
    title: '3자배분 및 공비 로직',
    description: '환자(UserPrice)·공단(InsuPrice)·보훈(MpvaPrice) 3자 배분과 공비(PubPrice) 계산',
    difficulty: '중급',
    estimatedMinutes: 30,
    order: 6,
  },
  {
    slug: 'ch07-반올림절사',
    number: 'CH07',
    title: '반올림·절사 규칙',
    description: '계산 단계마다 다른 반올림/절사/올림 방식(4사5입·10원절사·100원절사) 통합 명세',
    difficulty: '기초',
    estimatedMinutes: 20,
    order: 7,
  },
  {
    slug: 'ch08-특수케이스',
    number: 'CH08',
    title: '특수케이스 및 엣지케이스',
    description: '명절가산·본인부담상한제·특수약품 하드코딩·날짜 분기 등 일반 로직 예외 사항 정리',
    difficulty: '심화',
    estimatedMinutes: 35,
    order: 8,
  },
  {
    slug: 'ch09-데이터모델',
    number: 'CH09',
    title: '데이터 모델 설계',
    description: 'CalcOptions·CalcResult·DrugItem 등 계산 엔진 핵심 클래스/인터페이스 정규 설계안',
    difficulty: '중급',
    estimatedMinutes: 30,
    order: 9,
  },
  {
    slug: 'ch10-계산파이프라인',
    number: 'CH10',
    title: '계산 파이프라인',
    description: '약제비 계산 전체 흐름 — 입력에서 청구액 산출까지 단계별 파이프라인 통합 설명',
    difficulty: '심화',
    estimatedMinutes: 40,
    order: 10,
  },
  {
    slug: 'ch11-테스트시나리오',
    number: 'CH11',
    title: '테스트 시나리오',
    description: '건강보험·의료급여·보훈 등 실제 사례 기반 계산 검증 시나리오와 기대값 목록',
    difficulty: '심화',
    estimatedMinutes: 45,
    order: 11,
  },
  {
    slug: 'ch12-보훈약국',
    number: 'CH12',
    title: '보훈 약국 약제비 청구',
    description: '보훈 감면 코드(M10~M90)·보훈병원 하드코딩·보훈 전용 3자배분 로직 상세',
    difficulty: '심화',
    estimatedMinutes: 35,
    order: 12,
  },
];

export function getChapterBySlug(slug: string): ChapterMeta | undefined {
  return CHAPTERS.find((ch) => ch.slug === slug);
}

export function getPrevChapter(order: number): ChapterMeta | undefined {
  return CHAPTERS.find((ch) => ch.order === order - 1);
}

export function getNextChapter(order: number): ChapterMeta | undefined {
  return CHAPTERS.find((ch) => ch.order === order + 1);
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  '입문': 'bg-emerald-100 text-emerald-700',
  '기초': 'bg-blue-100 text-blue-700',
  '중급': 'bg-amber-100 text-amber-700',
  '심화': 'bg-red-100 text-red-700',
};
