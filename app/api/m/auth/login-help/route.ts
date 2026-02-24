import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

type LoginReason = 'OK' | 'INVALID_CREDENTIALS' | 'EMAIL_UNVERIFIED' | 'TEACHER_PENDING';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reason: 'INVALID_CREDENTIALS' as LoginReason });
  }

  const payload = body as { email?: string; password?: string };
  const email = (payload.email || '').toLowerCase().trim();
  const password = payload.password || '';

  if (!email || !password) {
    return NextResponse.json({ reason: 'INVALID_CREDENTIALS' as LoginReason });
  }

  await connectMongo();
  const user = await User.findByEmail(email);
  if (!user) {
    return NextResponse.json({ reason: 'INVALID_CREDENTIALS' as LoginReason });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ reason: 'INVALID_CREDENTIALS' as LoginReason });
  }

  if (user.emailVerified === false) {
    return NextResponse.json({ reason: 'EMAIL_UNVERIFIED' as LoginReason });
  }

  if (user.role === 'teacher' && user.teacherApprovalStatus !== 'approved') {
    return NextResponse.json({ reason: 'TEACHER_PENDING' as LoginReason });
  }

  return NextResponse.json({ reason: 'OK' as LoginReason });
}

