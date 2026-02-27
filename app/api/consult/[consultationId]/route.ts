import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Consultation, { CONSULTATION_STATUSES } from '@/lib/models/Consultation';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ consultationId: string }> };

// PATCH /api/consult/[consultationId] — 상태 변경, 메모 수정 (admin only)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 변경할 수 있습니다.' }, { status: 403 });
  }

  const { consultationId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.status !== undefined) {
    const status = body.status as string;
    if (!CONSULTATION_STATUSES.includes(status as typeof CONSULTATION_STATUSES[number])) {
      return NextResponse.json({ error: '잘못된 상태값입니다.' }, { status: 400 });
    }
    updates.status = status;
  }

  if (body.adminMemo !== undefined) {
    updates.adminMemo = (body.adminMemo as string).trim();
  }

  if (body.clearChangeRequest === true) {
    updates.scheduleChangeRequest = '';
  }

  await connectMongo();
  const result = await Consultation.updateOne({ consultationId }, { $set: updates });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: '상담 신청을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
