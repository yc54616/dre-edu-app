import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import { processRefund, type RefundOrderDoc } from '@/lib/refund';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ orderId: string }> };

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

  // Verify ownership before processing refund
  await connectMongo();
  const order = await Order.findOne(
    { orderId },
    { orderId: 1, userId: 1 },
  ).lean() as Pick<RefundOrderDoc, 'orderId' | 'userId'> | null;

  if (!order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (order.userId !== userId) {
    return NextResponse.json({ error: '본인 주문만 환불 신청할 수 있습니다.' }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const reasonRaw = typeof body.cancelReason === 'string' ? body.cancelReason.trim() : '';
  const cancelReason = (reasonRaw || '사용자 환불 요청').slice(0, 80);

  const result = await processRefund(orderId, cancelReason);
  if (!result.success) {
    const { error, status, ...rest } = result;
    return NextResponse.json({ error, ...rest }, { status });
  }
  return NextResponse.json(result);
}
