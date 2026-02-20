import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

// GET /api/m/admin/users — 전체 사용자 목록
export async function GET(_req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  await connectMongo();
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}
