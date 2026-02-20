import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ userId: string }> };

// PATCH /api/m/admin/users/[userId] — 역할 변경
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  const { userId } = await params;
  const body = await req.json();
  const newRole = body.role;

  if (!['student', 'teacher', 'admin'].includes(newRole)) {
    return NextResponse.json({ error: '잘못된 역할값' }, { status: 400 });
  }

  await connectMongo();
  const result = await User.updateOne({ _id: userId }, { $set: { role: newRole } });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

// DELETE /api/m/admin/users/[userId] — 계정 삭제
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  const adminUser = session?.user as { id?: string; role?: string };
  if (!session || adminUser.role !== 'admin') {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  const { userId } = await params;

  // 자기 자신 삭제 방지
  if (userId === adminUser.id) {
    return NextResponse.json({ error: '자신의 계정은 삭제할 수 없습니다.' }, { status: 400 });
  }

  await connectMongo();
  await User.deleteOne({ _id: userId });
  return NextResponse.json({ success: true });
}
