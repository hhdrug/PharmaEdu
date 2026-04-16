/**
 * cross-refs.ts
 * Lesson ↔ Chapter ↔ Scenario ↔ Quiz 교차 참조 조회 유틸리티.
 *
 * 메타데이터 출처:
 *   - src/content/chapters/index.ts  (ChapterMeta.relatedLessons, relatedScenarios)
 *   - src/content/lessons/index.ts   (LessonMeta)
 *   - src/components/calculator/scenarios.ts (ScenarioPreset.relatedChapters)
 *   - src/lib/quiz/types.ts (QuizQuestion.tags — 'lesson:', 'scenario:', 'chapter:' prefix)
 *
 * 이 모듈은 모든 교차 참조 로직의 단일 진입점이다. UI 컴포넌트는 여기서만 조회한다.
 */

import { CHAPTERS, type ChapterMeta } from '@/content/chapters';
import { LESSONS, type LessonMeta, getLessonBySlug } from '@/content/lessons';
import { SCENARIOS, type ScenarioPreset, getScenarioById } from '@/components/calculator/scenarios';
import {
  getRelatedLessons as getQuizRelatedLessons,
  getRelatedScenarios as getQuizRelatedScenarios,
  type QuizQuestion,
} from '@/lib/quiz/types';
import type { WrongAnswerEntry } from '@/lib/quiz/wrong-notes';

// ── Chapter 기반 조회 ────────────────────────────────────────

/** Chapter 번호('CH01' 등)로 연결된 Lesson 메타 목록 반환 */
export function getLessonsForChapter(chapter: string): LessonMeta[] {
  const ch = CHAPTERS.find((c) => c.number === chapter);
  if (!ch?.relatedLessons) return [];
  return ch.relatedLessons
    .map((slug) => getLessonBySlug(slug))
    .filter((l): l is LessonMeta => !!l);
}

/** Chapter 번호로 연결된 Scenario 목록 반환 */
export function getScenariosForChapter(chapter: string): ScenarioPreset[] {
  const ch = CHAPTERS.find((c) => c.number === chapter);
  if (!ch?.relatedScenarios) return [];
  return ch.relatedScenarios
    .map((id) => getScenarioById(id))
    .filter((s): s is ScenarioPreset => !!s);
}

// ── Lesson 기반 조회 ────────────────────────────────────────

/** Lesson slug로 관련 Chapter 목록 반환 (해당 레슨을 relatedLessons에 포함한 모든 챕터) */
export function getChaptersForLesson(slug: string): ChapterMeta[] {
  return CHAPTERS.filter((c) => c.relatedLessons?.includes(slug));
}

/** Lesson slug로 실습 가능한 Scenario 목록 반환 (경유: 관련 챕터들의 시나리오 합집합) */
export function getScenariosForLesson(slug: string): ScenarioPreset[] {
  const chapters = getChaptersForLesson(slug);
  const scenarioIds = new Set<string>();
  for (const ch of chapters) {
    ch.relatedScenarios?.forEach((id) => scenarioIds.add(id));
  }
  return Array.from(scenarioIds)
    .map((id) => getScenarioById(id))
    .filter((s): s is ScenarioPreset => !!s);
}

// ── Scenario 기반 조회 ──────────────────────────────────────

/** Scenario id로 관련 Chapter 메타 목록 반환 */
export function getChaptersForScenario(id: string): ChapterMeta[] {
  const s = getScenarioById(id);
  if (!s?.relatedChapters) return [];
  return s.relatedChapters
    .map((num) => CHAPTERS.find((c) => c.number === num))
    .filter((c): c is ChapterMeta => !!c);
}

/** Scenario id로 연결된 Lesson 목록 (경유: 관련 챕터들의 레슨 합집합) */
export function getLessonsForScenario(id: string): LessonMeta[] {
  const chapters = getChaptersForScenario(id);
  const lessonSlugs = new Set<string>();
  for (const ch of chapters) {
    ch.relatedLessons?.forEach((slug) => lessonSlugs.add(slug));
  }
  return Array.from(lessonSlugs)
    .map((slug) => getLessonBySlug(slug))
    .filter((l): l is LessonMeta => !!l);
}

// ── Quiz 기반 조회 ──────────────────────────────────────────

/**
 * 문제에서 연결된 학습 자원을 모두 찾는다.
 * 우선순위:
 *   1. tags에 명시된 'lesson:...', 'scenario:...' prefix
 *   2. (fallback) chapter 기반 간접 조회
 */
export function getLearningRefsForQuestion(q: QuizQuestion): {
  lessons: LessonMeta[];
  scenarios: ScenarioPreset[];
} {
  // 1. tags 직접 참조
  const tagLessons = getQuizRelatedLessons(q)
    .map((slug) => getLessonBySlug(slug))
    .filter((l): l is LessonMeta => !!l);
  const tagScenarios = getQuizRelatedScenarios(q)
    .map((id) => getScenarioById(id))
    .filter((s): s is ScenarioPreset => !!s);

  // 2. chapter 기반 fallback (tags에 직접 참조가 없으면 chapter로 간접 조회)
  const chapterLessons =
    tagLessons.length === 0 ? getLessonsForChapter(q.chapter) : [];
  const chapterScenarios =
    tagScenarios.length === 0 ? getScenariosForChapter(q.chapter) : [];

  // 중복 제거 (slug/id 기준)
  const lessonMap = new Map<string, LessonMeta>();
  [...tagLessons, ...chapterLessons].forEach((l) => lessonMap.set(l.slug, l));
  const scenarioMap = new Map<string, ScenarioPreset>();
  [...tagScenarios, ...chapterScenarios].forEach((s) => scenarioMap.set(s.id, s));

  return {
    lessons: Array.from(lessonMap.values()),
    scenarios: Array.from(scenarioMap.values()),
  };
}

/** 오답 항목에서 복습할 레슨 + 실습할 시나리오 추천 */
export function getRecommendationsForWrongAnswer(entry: WrongAnswerEntry): {
  lessons: LessonMeta[];
  scenarios: ScenarioPreset[];
} {
  // 현재 WrongAnswerEntry에는 tags 스냅샷이 없어 chapter로만 추적 가능.
  // Phase 4에서 필요 시 entry에 tags 필드를 확장할 수 있음.
  return {
    lessons: getLessonsForChapter(entry.chapter),
    scenarios: getScenariosForChapter(entry.chapter),
  };
}

// ── Lesson 완료 후 추천 ────────────────────────────────────

/**
 * 레슨 완료 후 다음에 풀 만한 관련 퀴즈를 찾기 위한 필터.
 * 문제 목록(quiz_question[])을 받아서 해당 레슨 태그를 가진 문제만 반환한다.
 */
export function filterQuestionsForLesson(
  questions: QuizQuestion[],
  lessonSlug: string
): QuizQuestion[] {
  return questions.filter((q) => getQuizRelatedLessons(q).includes(lessonSlug));
}

/**
 * 대체 필터: tags에 lesson 매핑이 없을 때 chapter 기반으로 관련 문제 찾기.
 */
export function filterQuestionsByLessonViaChapter(
  questions: QuizQuestion[],
  lessonSlug: string
): QuizQuestion[] {
  const chapters = getChaptersForLesson(lessonSlug);
  const chapterNumbers = new Set(chapters.map((c) => c.number));
  return questions.filter((q) => chapterNumbers.has(q.chapter));
}
