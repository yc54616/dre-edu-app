import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

  const phones = body.phones as { phone: string; name: string }[];
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
    const result = await sendBrandMessage(phones, message);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[친구톡 발송 에러]', err);
    const errorMessage = err instanceof Error ? err.message : '발송 중 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
