import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import Consultation from '@/lib/models/Consultation';
import TopNav from './TopNav';
import './m-theme.css';

export default async function MAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/m');

  const user = session.user as { name?: string; email?: string; role?: string; id?: string };
  const role    = user.role || 'student';
  const isAdmin = role === 'admin';
  let pendingTeacherCount = 0;
  let pendingConsultationCount = 0;
  let pendingScheduleCount = 0;

  if (isAdmin) {
    try {
      await connectMongo();
      const [teacherCount, consultationCount, scheduleCount] = await Promise.all([
        User.countDocuments({ role: 'teacher', teacherApprovalStatus: 'pending' }),
        Consultation.countDocuments({ status: 'pending' }),
        Consultation.countDocuments({
          status: { $nin: ['cancelled', 'completed'] },
          $or: [
            { status: { $in: ['pending', 'contacted'] } },
            { scheduleChangeRequest: { $exists: true, $ne: '' } },
          ],
        }),
      ]);
      pendingTeacherCount = teacherCount;
      pendingConsultationCount = consultationCount;
      pendingScheduleCount = scheduleCount;
    } catch (error) {
      console.error('[MAppLayout] pending count load failed', error);
    }
  }

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
        isAdmin={isAdmin}
        currentMode={currentMode}
        pendingTeacherCount={pendingTeacherCount}
        pendingConsultationCount={pendingConsultationCount}
        pendingScheduleCount={pendingScheduleCount}
      />
      <main className="min-h-screen pt-16">
        {children}
      </main>
    </div>
  );
}
