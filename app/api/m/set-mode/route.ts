import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 로그인 직후 역할에 맞는 dre-mode 쿠키를 설정하고 이동할 경로를 반환
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ redirect: '/m' }, { status: 401 });
  }

  const role = (session.user as { role?: string })?.role;

  if (role === 'admin') {
    const res = NextResponse.json({ redirect: '/m/admin/materials' });
    res.cookies.set('dre-mode', 'teacher', { path: '/', maxAge: 86400 });
    return res;
  }

  const mode = role === 'teacher' ? 'teacher' : 'student';
  const res = NextResponse.json({ redirect: '/m/materials' });
  res.cookies.set('dre-mode', mode, { path: '/', maxAge: 86400 });
  return res;
}
