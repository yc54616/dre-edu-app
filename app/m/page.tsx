import { auth } from '@/lib/auth';
import LoginForm from './LoginForm';

export default async function MLoginPage() {
  const session = await auth();

  return <LoginForm session={session} />;
}
