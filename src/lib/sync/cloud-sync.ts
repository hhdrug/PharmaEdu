'use client';

/**
 * 클라우드 동기화 (localStorage ↔ Supabase).
 *
 * 전략 (Last-write-wins, 데이터 손실 최소화):
 *   - push: 로컬 전체 스냅샷을 DB에 upsert. 기존 DB 데이터는 덮어쓰기되지 않고 병합됨.
 *   - pull: DB 전체를 가져와 로컬에 병합 (locally newer 항목 보존).
 *   - syncAll: push 후 pull. 로그인 직후 한 번 호출을 권장.
 *
 * Non-goals:
 *   - 실시간 동기화 (onSnapshot 패턴 X)
 *   - 양방향 충돌 해결 (updated_at 기반 merge만)
 */

import { createClient } from '@/lib/supabase';
import {
  getWrongAnswers,
  type WrongAnswerEntry,
} from '@/lib/quiz/wrong-notes';
import {
  loadQuizHistory,
  type QuizHistoryEntry,
} from '@/lib/quiz/history';
import {
  getLearningState,
  STORAGE_KEY as LEARNING_STORAGE_KEY,
} from '@/lib/learning/progress';
import type { LearningState } from '@/lib/learning/types';

const WRONG_NOTES_KEY = 'pharmaedu_wrong_notes';
const QUIZ_HISTORY_KEY = 'pharmaEdu_quizHistory';

// ── Row 매핑 ──────────────────────────────────────────────────

interface WrongNoteRow {
  user_id: string;
  question_id: number;
  question: string;
  correct_answer: string;
  user_answer: string;
  explanation: string;
  chapter: string;
  difficulty: 1 | 2 | 3;
  attempts: number;
  resolved: boolean;
  next_review_at: string | null;
  interval_days: number;
  easiness: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

interface QuizHistoryRow {
  id: number;
  user_id: string;
  client_id: string;
  category: string;
  category_label: string;
  score: number;
  total: number;
  pct: number;
  played_at: string;
  created_at: string;
}

function entryToRow(e: WrongAnswerEntry, userId: string): Omit<WrongNoteRow, 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    question_id: e.questionId,
    question: e.question,
    correct_answer: e.correctAnswer,
    user_answer: e.userAnswer,
    explanation: e.explanation ?? '',
    chapter: e.chapter,
    difficulty: e.difficulty,
    attempts: e.attempts,
    resolved: e.resolved,
    next_review_at: e.nextReviewAt ? new Date(e.nextReviewAt).toISOString() : null,
    interval_days: e.interval ?? 1,
    easiness: e.easiness ?? 2.5,
    review_count: e.reviewCount ?? 0,
  };
}

function rowToEntry(r: WrongNoteRow): WrongAnswerEntry {
  return {
    questionId: r.question_id,
    question: r.question,
    correctAnswer: r.correct_answer,
    userAnswer: r.user_answer,
    explanation: r.explanation,
    chapter: r.chapter,
    difficulty: r.difficulty,
    attempts: r.attempts,
    resolved: r.resolved,
    timestamp: new Date(r.created_at).getTime(),
    nextReviewAt: r.next_review_at ? new Date(r.next_review_at).getTime() : undefined,
    interval: r.interval_days,
    easiness: r.easiness,
    reviewCount: r.review_count,
  };
}

// ── Push: local → DB ──────────────────────────────────────────

async function pushWrongNotes(userId: string): Promise<number> {
  const supabase = createClient();
  const local = getWrongAnswers();
  if (local.length === 0) return 0;
  const rows = local.map((e) => entryToRow(e, userId));
  const { error } = await supabase
    .from('user_wrong_notes')
    .upsert(rows, { onConflict: 'user_id,question_id' });
  if (error) {
    console.error('[cloud-sync] pushWrongNotes:', error);
    throw error;
  }
  return rows.length;
}

async function pushQuizHistory(userId: string): Promise<number> {
  const supabase = createClient();
  const local = loadQuizHistory();
  if (local.length === 0) return 0;
  const rows = local.map((h) => ({
    user_id: userId,
    client_id: h.id,
    category: h.category,
    category_label: h.categoryLabel,
    score: h.score,
    total: h.total,
    pct: h.pct,
    played_at: new Date(h.timestamp).toISOString(),
  }));
  const { error } = await supabase
    .from('user_quiz_history')
    .upsert(rows, { onConflict: 'user_id,client_id', ignoreDuplicates: true });
  if (error) {
    console.error('[cloud-sync] pushQuizHistory:', error);
    throw error;
  }
  return rows.length;
}

async function pushLearningState(userId: string): Promise<void> {
  const supabase = createClient();
  const state = getLearningState();
  const { error } = await supabase
    .from('user_learning_state')
    .upsert(
      { user_id: userId, state },
      { onConflict: 'user_id' },
    );
  if (error) {
    console.error('[cloud-sync] pushLearningState:', error);
    throw error;
  }
}

// ── Pull: DB → local ──────────────────────────────────────────

async function pullWrongNotes(userId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_wrong_notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(200);
  if (error) {
    console.error('[cloud-sync] pullWrongNotes:', error);
    throw error;
  }
  const remote = (data ?? []).map(rowToEntry);
  const local = getWrongAnswers();
  // Merge — keep locally newer (nextReviewAt 또는 timestamp 기준)
  const map = new Map<number, WrongAnswerEntry>();
  for (const e of remote) map.set(e.questionId, e);
  for (const e of local) {
    const existing = map.get(e.questionId);
    if (!existing) {
      map.set(e.questionId, e);
    } else {
      // 로컬 reviewCount 가 더 크면 로컬 우선
      if ((e.reviewCount ?? 0) > (existing.reviewCount ?? 0)) {
        map.set(e.questionId, e);
      }
    }
  }
  const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  localStorage.setItem(WRONG_NOTES_KEY, JSON.stringify(merged));
  return merged.length;
}

async function pullQuizHistory(userId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_quiz_history')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(20);
  if (error) {
    console.error('[cloud-sync] pullQuizHistory:', error);
    throw error;
  }
  const remote = (data ?? []) as QuizHistoryRow[];
  const local = loadQuizHistory();
  const map = new Map<string, QuizHistoryEntry>();
  for (const h of local) map.set(h.id, h);
  for (const r of remote) {
    if (r.client_id && !map.has(r.client_id)) {
      map.set(r.client_id, {
        id: r.client_id,
        category: r.category,
        categoryLabel: r.category_label,
        score: r.score,
        total: r.total,
        pct: r.pct,
        timestamp: new Date(r.played_at).getTime(),
      });
    }
  }
  const merged = Array.from(map.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);
  localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(merged));
  return merged.length;
}

async function pullLearningState(userId: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_learning_state')
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[cloud-sync] pullLearningState:', error);
    throw error;
  }
  if (!data || !data.state) return;
  // 로컬 state가 있으면 lessons 별로 더 진도가 앞선 쪽을 병합
  const remote = data.state as LearningState;
  const local = getLearningState();
  const mergedLessons = { ...(remote.lessons ?? {}), ...(local.lessons ?? {}) };
  const merged: LearningState = {
    ...remote,
    ...local,
    lessons: mergedLessons,
  };
  localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(merged));
}

// ── Public API ────────────────────────────────────────────────

export interface SyncResult {
  wrongNotes: number;
  quizHistory: number;
  learningStateSynced: boolean;
}

export async function syncAll(userId: string): Promise<SyncResult> {
  // Push first (로컬이 진실의 원천일 가능성), 이후 pull로 DB 변경 반영
  await pushWrongNotes(userId);
  await pushQuizHistory(userId);
  await pushLearningState(userId);
  const wrongNotes = await pullWrongNotes(userId);
  const quizHistory = await pullQuizHistory(userId);
  await pullLearningState(userId);
  return { wrongNotes, quizHistory, learningStateSynced: true };
}

export async function pushOnly(userId: string): Promise<void> {
  await pushWrongNotes(userId);
  await pushQuizHistory(userId);
  await pushLearningState(userId);
}

export async function pullOnly(userId: string): Promise<SyncResult> {
  const wrongNotes = await pullWrongNotes(userId);
  const quizHistory = await pullQuizHistory(userId);
  await pullLearningState(userId);
  return { wrongNotes, quizHistory, learningStateSynced: true };
}
