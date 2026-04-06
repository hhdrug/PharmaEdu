import { redirect, notFound } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/admin/supabase-admin';
import { updateQuestion } from '../../../actions';
import { QuestionForm } from '../../QuestionForm';
import type { QuizQuestion } from '@/lib/quiz/types';

export const dynamic = 'force-dynamic';

interface EditQuestionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect('/admin/login');

  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) notFound();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('quiz_question')
    .select('*')
    .eq('id', numId)
    .maybeSingle();

  if (error || !data) notFound();
  const question = data as QuizQuestion;

  // updateQuestion을 id에 바인딩
  const boundUpdate = async (formData: FormData) => {
    'use server';
    return updateQuestion(numId, formData);
  };

  return (
    <QuestionForm
      mode="edit"
      question={question}
      action={boundUpdate}
    />
  );
}
