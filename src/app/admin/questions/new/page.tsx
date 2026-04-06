import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { addQuestion } from '../../actions';
import { QuestionForm } from '../QuestionForm';

export const dynamic = 'force-dynamic';

export default async function NewQuestionPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect('/admin/login');

  return (
    <QuestionForm
      mode="new"
      action={addQuestion}
    />
  );
}
