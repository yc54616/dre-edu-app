import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import CommunityUpgradeOrder from '@/lib/models/CommunityUpgradeOrder';

export const dynamic = 'force-dynamic';

const isProcessStatus = (value: unknown): value is 'pending' | 'completed' =>
  value === 'pending' || value === 'completed';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const processStatus = body.processStatus;
  if (!isProcessStatus(processStatus)) {
    return NextResponse.json({ error: '처리 상태 값이 올바르지 않습니다.' }, { status: 400 });
  }

  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 });
  }

  await connectMongo();
  const updated = await CommunityUpgradeOrder.findOneAndUpdate(
    { orderId },
    { $set: { processStatus, updatedAt: new Date() } },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, order: updated });
}
