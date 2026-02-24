import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processFeedback, undoFeedback } from '@/lib/recommendation';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import Order from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

// POST /api/m/feedback — 자료 완료 피드백 (ELO 업데이트, 자료당 1회)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: '사용자 정보 없음' }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const { materialId, difficulty } = body;
  if (!materialId || !['easy', 'normal', 'hard'].includes(difficulty as string)) {
    return NextResponse.json({ error: '잘못된 파라미터' }, { status: 400 });
  }

  await connectMongo();

  // 구매 여부 확인 (유료 자료의 경우)
  const material = await Material.findOne({ materialId, isActive: true }).lean();
  if (!material) return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });

  if (!material.isFree) {
    const order = await Order.findOne({ userId, materialId, status: 'paid' }).lean();
    if (!order) return NextResponse.json({ error: '구매 후 평가할 수 있습니다.' }, { status: 403 });
  }

  try {
    const result = await processFeedback({ materialId: materialId as string, userId, difficulty: difficulty as 'easy' | 'normal' | 'hard' });
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '서버 오류';
    const status  = message === '이미 평가한 자료입니다.' ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/m/feedback — 피드백 되돌리기
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: '사용자 정보 없음' }, { status: 400 });

  const materialId = req.nextUrl.searchParams.get('materialId');
  if (!materialId) return NextResponse.json({ error: 'materialId 필요' }, { status: 400 });

  try {
    await undoFeedback({ materialId, userId });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '서버 오류';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
