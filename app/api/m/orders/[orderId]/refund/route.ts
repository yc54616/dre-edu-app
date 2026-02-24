import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ orderId: string }> };

interface RefundOrderDoc {
  orderId: string;
  userId: string;
  status: 'pending' | 'paid' | 'cancelled';
  paymentKey: string | null;
}

const extractTossError = (data: unknown) => {
  if (!data || typeof data !== 'object') return '토스페이먼츠 환불 실패';
  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) return message;
  return '토스페이먼츠 환불 실패';
};

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  const userId = (session.user as { id?: string } | undefined)?.id || '';
  if (!userId) {
    return NextResponse.json({ error: '사용자 정보를 확인할 수 없습니다.' }, { status: 401 });
  }

  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const reasonRaw = typeof body.cancelReason === 'string' ? body.cancelReason.trim() : '';
  const cancelReason = (reasonRaw || '사용자 환불 요청').slice(0, 80);

  await connectMongo();

  const order = await Order.findOne(
    { orderId },
    { orderId: 1, userId: 1, status: 1, paymentKey: 1 },
  ).lean() as RefundOrderDoc | null;

  if (!order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (order.userId !== userId) {
    return NextResponse.json({ error: '본인 주문만 환불 신청할 수 있습니다.' }, { status: 403 });
  }
  if (order.status !== 'paid') {
    return NextResponse.json({ error: '결제 완료 주문만 환불 신청할 수 있습니다.' }, { status: 400 });
  }
  if (!order.paymentKey) {
    return NextResponse.json({ error: '토스 결제 건만 환불할 수 있습니다.' }, { status: 400 });
  }

  const secretKey = process.env.TOSS_SECRET_KEY ?? '';
  if (!secretKey) {
    return NextResponse.json({ error: '토스 시크릿 키가 설정되지 않았습니다.' }, { status: 500 });
  }
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');

  const tossRes = await fetch(
    `https://api.tosspayments.com/v1/payments/${encodeURIComponent(order.paymentKey)}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancelReason }),
    },
  );

  let tossData: unknown = null;
  try {
    tossData = await tossRes.json();
  } catch {
    tossData = null;
  }

  if (!tossRes.ok) {
    const code =
      tossData && typeof tossData === 'object' && typeof (tossData as { code?: unknown }).code === 'string'
        ? (tossData as { code: string }).code
        : undefined;
    return NextResponse.json(
      { error: extractTossError(tossData), code, failedOrderId: order.orderId },
      { status: 400 },
    );
  }

  const updateResult = await Order.updateOne(
    { orderId: order.orderId, status: 'paid' },
    {
      $set: {
        status: 'cancelled',
        paidAt: null,
      },
    },
  );

  if (updateResult.matchedCount === 0) {
    return NextResponse.json(
      { error: '환불 처리 중 주문 상태가 변경되었습니다. 다시 시도해 주세요.' },
      { status: 409 },
    );
  }

  return NextResponse.json({
    success: true,
    cancelledCount: 1,
    cancelledOrderIds: [order.orderId],
  });
}
