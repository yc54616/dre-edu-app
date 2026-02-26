import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Consultation, { CONSULTATION_TYPES, CONSULTATION_STATUSES } from '@/lib/models/Consultation';
import { notifyConsultation } from '@/lib/solapi';

export const dynamic = 'force-dynamic';

// POST /api/consult — 상담 신청 (비로그인 가능)
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const name = (body.name as string || '').trim();
  const phone = (body.phone as string || '').trim();
  const type = body.type as string;

  if (!name || !phone || !type) {
    return NextResponse.json({ error: '이름, 연락처, 유형은 필수입니다.' }, { status: 400 });
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (!/^01[016789]\d{7,8}$/.test(phoneDigits)) {
    return NextResponse.json({ error: '올바른 연락처 형식이 아닙니다.' }, { status: 400 });
  }

  if (!CONSULTATION_TYPES.includes(type as typeof CONSULTATION_TYPES[number])) {
    return NextResponse.json({ error: '잘못된 상담 유형입니다.' }, { status: 400 });
  }

  await connectMongo();

  const consultation = await Consultation.create({
    type,
    name,
    phone: phoneDigits,
    schoolGrade: (body.schoolGrade as string || '').trim(),
    currentScore: (body.currentScore as string || '').trim(),
    targetUniv: (body.targetUniv as string || '').trim(),
    direction: (body.direction as string || '').trim(),
    gradeLevel: (body.gradeLevel as string || '').trim(),
    subject: (body.subject as string || '').trim(),
    message: (body.message as string || '').trim(),
  });

  // 알림톡 비동기 발송 (fire-and-forget)
  notifyConsultation(consultation).catch((err) =>
    console.error('[알림톡] 발송 실패:', err),
  );

  return NextResponse.json({ consultationId: consultation.consultationId }, { status: 201 });
}

// GET /api/consult — 관리자용 목록 조회
export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 조회할 수 있습니다.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';
  const q = searchParams.get('q')?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 30;

  await connectMongo();

  const filter: Record<string, unknown> = {};
  if (type && CONSULTATION_TYPES.includes(type as typeof CONSULTATION_TYPES[number])) {
    filter.type = type;
  }
  if (status && CONSULTATION_STATUSES.includes(status as typeof CONSULTATION_STATUSES[number])) {
    filter.status = status;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { message: { $regex: q, $options: 'i' } },
    ];
  }

  const [consultations, total] = await Promise.all([
    Consultation.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Consultation.countDocuments(filter),
  ]);

  return NextResponse.json({
    consultations,
    total,
    page,
    totalPage: Math.ceil(total / limit),
  });
}
