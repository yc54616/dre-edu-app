import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import TopNav from './TopNav';
import './m-theme.css';

export default async function MAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/m');

  const user = session.user as { name?: string; email?: string; role?: string; id?: string };
  const role    = user.role || 'student';
  const isAdmin = role === 'admin';

  const cookieStore = await cookies();
  const modeCookie  = cookieStore.get('dre-mode')?.value;
  // student 역할은 항상 student 모드 고정 (쿠키 무시)
  const currentMode: 'teacher' | 'student' =
    role === 'student' ? 'student' :
    role === 'teacher'
      ? (modeCookie === 'student' ? 'student' : 'teacher')
      : 'student';

  return (
    <div className="m-theme m-page-bg min-h-screen">
      <TopNav
        userName={user.name || ''}
        userRole={role}
        isAdmin={isAdmin}
        currentMode={currentMode}
      />
      <main className="min-h-screen pt-16">
        {children}
      </main>
    </div>
  );
}
