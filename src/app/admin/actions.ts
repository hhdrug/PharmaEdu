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

export async function updateQuestion(
  id: number,
  formData: FormData
): Promise<void> {
  await requireAdmin();

  const rawChoices = formData.getAll('choices') as string[];
  const filteredChoices = rawChoices.filter((c) => c.trim() !== '');

  const payload: Partial<QuizQuestion> = {
    chapter: formData.get('chapter') as string,
    difficulty: Number(formData.get('difficulty')) as 1 | 2 | 3,
    question_type: formData.get('question_type') as QuestionType,
    question: formData.get('question') as string,
    choices: filteredChoices.length > 0 ? filteredChoices : null,
    correct_answer: formData.get('correct_answer') as string,
    explanation: formData.get('explanation') as string,
  };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('quiz_question')
    .update(payload)
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quiz');
  redirect('/admin/quiz');
}

export async function addQuestion(formData: FormData): Promise<void> {
  await requireAdmin();

  const rawChoices = formData.getAll('choices') as string[];
  const filteredChoices = rawChoices.filter((c) => c.trim() !== '');

  const payload: Omit<QuizQuestion, 'id' | 'created_at'> = {
    chapter: formData.get('chapter') as string,
    difficulty: Number(formData.get('difficulty')) as 1 | 2 | 3,
    question_type: formData.get('question_type') as QuestionType,
    question: formData.get('question') as string,
    choices: filteredChoices.length > 0 ? filteredChoices : null,
    correct_answer: formData.get('correct_answer') as string,
    explanation: formData.get('explanation') as string,
    tags: null,
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from('quiz_question').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quiz');
  redirect('/admin/quiz');
}
