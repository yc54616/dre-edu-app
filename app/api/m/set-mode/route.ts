import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 로그인 직후 역할에 맞는 dre-mode 쿠키를 설정하고 리다이렉트
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.redirect(new URL('/m', req.url));

  const role = (session.user as { role?: string })?.role;

  if (role === 'admin') {
    return NextResponse.redirect(new URL('/m/admin/materials', req.url));
  }

  const mode = role === 'teacher' ? 'teacher' : 'student';
  const res  = NextResponse.redirect(new URL('/m/materials', req.url));
  res.cookies.set('dre-mode', mode, { path: '/', maxAge: 86400 });
  return res;
}
