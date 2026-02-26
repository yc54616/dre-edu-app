import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import Consultation from '@/lib/models/Consultation';
import { sendBrandMessage } from '@/lib/solapi';

export const dynamic = 'force-dynamic';

// POST /api/broadcast — 관리자 친구톡 발송
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 발송할 수 있습니다.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const rawPhones = Array.isArray(body.phones)
    ? (body.phones as { phone?: unknown; name?: unknown }[])
    : [];
  const phones = rawPhones
    .map((item) => ({
      phone: typeof item.phone === 'string' ? item.phone.replace(/\D/g, '') : '',
      name: typeof item.name === 'string' ? item.name.trim() : '',
    }))
    .filter((item) => item.phone.length > 0 && item.name.length > 0);
  const message = (body.message as string || '').trim();

  if (!Array.isArray(phones) || phones.length === 0) {
    return NextResponse.json({ error: '수신자를 선택해주세요.' }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json({ error: '메시지는 1000자 이내로 입력해주세요.' }, { status: 400 });
  }

  try {
    const uniquePhoneSet = new Set<string>();
    const dedupedRecipients: { phone: string; name: string }[] = [];
    for (const item of phones) {
      if (uniquePhoneSet.has(item.phone)) continue;
      uniquePhoneSet.add(item.phone);
      dedupedRecipients.push(item);
    }

    await connectMongo();
    const [agreedUsers, consultationRecipients] = await Promise.all([
      User.find({
        role: { $in: ['student', 'teacher'] },
        phone: { $in: Array.from(uniquePhoneSet) },
        'consents.marketing': { $exists: true, $ne: null },
      }).select('phone').lean() as Promise<Array<{ phone?: string | null }>>,
      Consultation.find({
        status: { $ne: 'cancelled' },
        phone: { $in: Array.from(uniquePhoneSet) },
        marketingConsent: true,
      }).select('phone').lean() as Promise<Array<{ phone?: string | null }>>,
    ]);

    const allowedPhoneSet = new Set<string>();
    for (const user of agreedUsers) {
      const phone = typeof user.phone === 'string' ? user.phone.replace(/\D/g, '') : '';
      if (phone) allowedPhoneSet.add(phone);
    }
    for (const consultation of consultationRecipients) {
      const phone = typeof consultation.phone === 'string' ? consultation.phone.replace(/\D/g, '') : '';
      if (phone) allowedPhoneSet.add(phone);
    }

    const blockedPhones = Array.from(uniquePhoneSet).filter((phone) => !allowedPhoneSet.has(phone));
    if (blockedPhones.length > 0) {
      return NextResponse.json(
        { error: '회원가입 마케팅 동의 또는 상담 마케팅 동의 대상이 아닌 수신자가 포함되어 있습니다.' },
        { status: 400 },
      );
    }

    const result = await sendBrandMessage(dedupedRecipients, message);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[친구톡 발송 에러]', err);
    const errorMessage = err instanceof Error ? err.message : '발송 중 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
