import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ orderId: string }> };

// PATCH /api/m/orders/[orderId] — 주문 상태 변경 (관리자만)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 변경할 수 있습니다.' }, { status: 403 });
  }

  const { orderId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const status = body.status as 'paid' | 'cancelled';

  if (!['paid', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: '잘못된 상태값' }, { status: 400 });
  }
  if (status === 'cancelled') {
    return NextResponse.json(
      { error: '주문 취소는 환불 API(/api/m/admin/orders/[orderId]/refund)로만 가능합니다.' },
      { status: 400 },
    );
  }

  await connectMongo();
  const result = await Order.updateOne(
    { orderId },
    {
      $set: {
        status,
        paidAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
