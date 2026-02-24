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
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const newRole = body.role as string | undefined;
  const newApproval = body.teacherApprovalStatus as 'approved' | 'pending' | undefined;

  await connectMongo();
  const user = await User.findById(userId).select('role teacherApprovalStatus');
  if (!user) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
  }

  const targetRole = user.role as string;
  if (targetRole === 'admin') {
    const roleChangeRequested = newRole !== undefined && newRole !== 'admin';
    const approvalChangeRequested = newApproval !== undefined;
    if (roleChangeRequested || approvalChangeRequested) {
      return NextResponse.json(
        { error: '관리자 계정의 권한/승인 상태는 변경할 수 없습니다.' },
        { status: 400 },
      );
    }
  }

  const allowedRoles = ['student', 'teacher', 'admin'];
  if (newRole !== undefined && !allowedRoles.includes(newRole)) {
    return NextResponse.json({ error: '잘못된 역할값' }, { status: 400 });
  }

  const allowedApproval = ['approved', 'pending'] as const;
  if (newApproval !== undefined && !allowedApproval.includes(newApproval)) {
    return NextResponse.json({ error: '잘못된 승인 상태값' }, { status: 400 });
  }

  if (newRole === undefined && newApproval === undefined) {
    return NextResponse.json({ error: '변경할 값이 없습니다.' }, { status: 400 });
  }

  const nextRole = newRole ?? user.role;
  let nextApproval = user.teacherApprovalStatus || 'approved';

  if (nextRole !== 'teacher' && newApproval === 'pending') {
    return NextResponse.json({ error: '교사 계정에만 승인 대기를 설정할 수 있습니다.' }, { status: 400 });
  }

  if (nextRole !== 'teacher') {
    nextApproval = 'approved';
  } else if (newApproval !== undefined) {
    nextApproval = newApproval;
  } else if (newRole !== undefined && user.role !== 'teacher') {
    // 관리자가 교사 역할로 변경한 경우 즉시 승인 상태로 둔다.
    nextApproval = 'approved';
  }

  const result = await User.updateOne(
    { _id: userId },
    { $set: { role: nextRole, teacherApprovalStatus: nextApproval } },
  );
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
  const target = await User.findById(userId).select('role');
  if (!target) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
  }

  if (target.role === 'admin') {
    return NextResponse.json({ error: '관리자 계정은 삭제할 수 없습니다.' }, { status: 400 });
  }

  await User.deleteOne({ _id: userId });
  return NextResponse.json({ success: true });
}
