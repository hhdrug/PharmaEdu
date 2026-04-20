'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/admin/supabase-admin';
import {
  verifyAdminPassword,
  setAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
} from '@/lib/admin/auth';
import type { QuizQuestion, QuestionType } from '@/lib/quiz/types';

// ── 공통 인증 헬퍼 ────────────────────────────────────────────────

async function requireAdmin(): Promise<void> {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect('/admin/login');
}

// ── 인증 액션 ────────────────────────────────────────────────────

export async function loginAdmin(
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const valid = await verifyAdminPassword(password);
  if (!valid) {
    return { error: '비밀번호가 올바르지 않습니다.' };
  }
  await setAdminSession();
  redirect('/admin');
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect('/admin/login');
}

// ── 문제 CRUD 액션 ───────────────────────────────────────────────

export async function deleteQuestion(id: number): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('quiz_question')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quiz');
}

// ── 공통 FormData 파싱 헬퍼 (Phase 7 확장) ─────────────────
// choices/payload/tags 를 안전하게 추출한다.
function parseQuestionPayload(formData: FormData): {
  base: Pick<QuizQuestion, 'chapter' | 'difficulty' | 'question_type' | 'question' | 'choices' | 'correct_answer' | 'explanation' | 'tags'> & { payload?: unknown };
} {
  const rawChoices = formData.getAll('choices') as string[];
  const filteredChoices = rawChoices.filter((c) => c.trim() !== '');

  const rawTags = formData.getAll('tags') as string[];
  const filteredTags = rawTags.filter((t) => t.trim() !== '');

  // payload JSON 파싱 (클라이언트에서 이미 검증했으나 서버도 한 번 더)
  const payloadRaw = formData.get('payload') as string | null;
  let parsedPayload: unknown = undefined;
  if (payloadRaw && payloadRaw.trim() !== '') {
    try {
      parsedPayload = JSON.parse(payloadRaw);
    } catch {
      throw new Error('Payload JSON 파싱 실패 — 클라이언트 검증을 통과했으나 서버에서 실패했습니다.');
    }
  }

  return {
    base: {
      chapter: formData.get('chapter') as string,
      difficulty: Number(formData.get('difficulty')) as 1 | 2 | 3,
      question_type: formData.get('question_type') as QuestionType,
      question: formData.get('question') as string,
      choices: filteredChoices.length > 0 ? filteredChoices : null,
      correct_answer: formData.get('correct_answer') as string,
      explanation: formData.get('explanation') as string,
      tags: filteredTags.length > 0 ? filteredTags : null,
      ...(parsedPayload !== undefined ? { payload: parsedPayload } : {}),
    },
  };
}

export async function updateQuestion(
  id: number,
  formData: FormData
): Promise<void> {
  await requireAdmin();
  const { base } = parseQuestionPayload(formData);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('quiz_question')
    .update(base)
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quiz');
  redirect('/admin/quiz');
}

export async function addQuestion(formData: FormData): Promise<void> {
  await requireAdmin();
  const { base } = parseQuestionPayload(formData);

  const supabase = createAdminClient();
  const { error } = await supabase.from('quiz_question').insert(base);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quiz');
  redirect('/admin/quiz');
}
