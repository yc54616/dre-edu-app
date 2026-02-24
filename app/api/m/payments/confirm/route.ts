import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const { paymentKey, orderId, amount } = body;

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 });
  }

  await connectMongo();

  // 주문 확인 (본인 주문인지 + 금액 일치)
  const order = await Order.findOne({ orderId }).lean();
  if (!order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (order.userId !== userId) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  if (order.amount !== Number(amount)) {
    return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
  }
  if (order.status === 'paid') {
    return NextResponse.json({ success: true, alreadyPaid: true });
  }

  // 토스페이먼츠 승인 API 호출
  const secretKey  = process.env.TOSS_SECRET_KEY ?? '';
  const encoded    = Buffer.from(`${secretKey}:`).toString('base64');

  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${encoded}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
  });

  const tossData = await tossRes.json();

  if (!tossRes.ok) {
    return NextResponse.json(
      { error: tossData.message || '토스페이먼츠 승인 실패', code: tossData.code },
      { status: 400 }
    );
  }

  // 주문 상태 업데이트
  await Order.updateOne(
    { orderId },
    {
      $set: {
        status:        'paid',
        paymentKey,
        paymentMethod: tossData.method || 'card',
        paidAt:        new Date(),
      },
    }
  );

  return NextResponse.json({ success: true });
}
