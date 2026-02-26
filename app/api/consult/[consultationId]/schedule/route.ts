import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Consultation from '@/lib/models/Consultation';
import { sendScheduleAlimtalk } from '@/lib/solapi';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ consultationId: string }> };

// POST /api/consult/[consultationId]/schedule — 일정 확정 + 알림톡
export async function POST(req: NextRequest, { params }: Params) {
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

  const scheduledDate = (body.scheduledDate as string || '').trim();
  const scheduledTime = (body.scheduledTime as string || '').trim();

  if (!scheduledDate || !scheduledTime) {
    return NextResponse.json({ error: '날짜와 시간은 필수입니다.' }, { status: 400 });
  }

  await connectMongo();

  const consultation = await Consultation.findOneAndUpdate(
    { consultationId },
    {
      $set: {
        scheduledDate,
        scheduledTime,
        scheduleChangeRequest: '',
        scheduleConfirmedAt: null,
        status: 'scheduled',
        updatedAt: new Date(),
      },
    },
    { new: true },
  );

  if (!consultation) {
    return NextResponse.json({ error: '상담 신청을 찾을 수 없습니다.' }, { status: 404 });
  }

  // 일정 알림톡 발송 (fire-and-forget)
  sendScheduleAlimtalk(consultation.phone, {
    name: consultation.name,
    date: scheduledDate,
    time: scheduledTime,
  }).catch((err) => console.error('[일정 알림톡] 발송 실패:', err));

  return NextResponse.json({ success: true });
}
