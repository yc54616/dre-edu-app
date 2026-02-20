import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

// POST /api/m/auth/register — 관리자가 계정 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 계정을 생성할 수 있습니다.' }, { status: 403 });
  }

  await connectMongo();
  const body = await req.json();
  const { email, username, password, userRole } = body;

  if (!email || !username || !password) {
    return NextResponse.json({ error: '이메일, 이름, 비밀번호는 필수입니다.' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
  }

  const existing = await User.findByEmail(email);
  if (existing) {
    return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
  }

  const allowedRoles = ['student', 'teacher', 'admin'];
  const newRole = allowedRoles.includes(userRole) ? userRole : 'student';

  const user = await User.create({
    email:    email.toLowerCase().trim(),
    username: username.trim(),
    password,
    role:     newRole,
  });

  return NextResponse.json({
    user: { id: user._id, email: user.email, username: user.username, role: user.role },
  }, { status: 201 });
}
