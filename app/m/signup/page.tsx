import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import SignupForm from '../SignupForm';

export default async function SignupPage() {
  const session = await auth();
  if (session) redirect('/m/materials');

  return <SignupForm />;
}

