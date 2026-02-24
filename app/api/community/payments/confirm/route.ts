import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import CommunityUpgradeOrder from '@/lib/models/CommunityUpgradeOrder';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const paymentKey = typeof body.paymentKey === 'string' ? body.paymentKey : '';
  const orderId = typeof body.orderId === 'string' ? body.orderId : '';
  const amount = Number(body.amount || 0);

  if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 });
  }

  await connectMongo();

  const order = await CommunityUpgradeOrder.findOne({ orderId }).lean();
  if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  if (order.amount !== amount) return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
  if (order.status === 'paid') return NextResponse.json({ success: true, alreadyPaid: true });

  const secretKey = process.env.TOSS_SECRET_KEY ?? '';
  if (!secretKey) {
    return NextResponse.json({ error: '토스 시크릿 키가 설정되지 않았습니다.' }, { status: 500 });
  }
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');

  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const tossData = await tossRes.json();
  if (!tossRes.ok) {
    return NextResponse.json(
      { error: tossData.message || '토스페이먼츠 승인 실패', code: tossData.code },
      { status: 400 },
    );
  }

  await CommunityUpgradeOrder.updateOne(
    { orderId },
    {
      $set: {
        status: 'paid',
        paymentKey,
        paymentMethod: tossData.method || 'CARD',
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );

  return NextResponse.json({ success: true });
}
