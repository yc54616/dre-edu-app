import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '@/lib/ensure-admin';
import { processRefund } from '@/lib/refund';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ orderId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: '관리자만 환불할 수 있습니다.' }, { status: 403 });
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
  const cancelReason = (reasonRaw || '관리자 환불').slice(0, 80);

  const result = await processRefund(orderId, cancelReason);
  if (!result.success) {
    const { error, status, ...rest } = result;
    return NextResponse.json({ error, ...rest }, { status });
  }
  return NextResponse.json(result);
}
