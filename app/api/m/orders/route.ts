import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Material from '@/lib/models/Material';
import { buildMaterialTitle } from '@/lib/material-display';

export const dynamic = 'force-dynamic';

// GET /api/m/orders — 내 주문 목록 (또는 관리자: 전체)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const user  = session.user as { id?: string; role?: string };
  const role  = user.role || 'student';
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit  = 20;

  await connectMongo();

  const filter: Record<string, unknown> = role === 'admin'
    ? {}
    : { userId: user.id };

  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return NextResponse.json({ orders, total, page, totalPage: Math.ceil(total / limit) });
}

// POST /api/m/orders — 주문 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const user = session.user as { id?: string; email?: string; name?: string; role?: string };

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const materialId    = body.materialId as string | undefined;
  const fileTypes     = body.fileTypes as unknown;
  const paymentMethod = body.paymentMethod as string | undefined;
  const paymentNote   = body.paymentNote as string | undefined;

  if (!materialId) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
  }

  await connectMongo();
  const material = await Material.findOne({ materialId, isActive: true }).lean();
  if (!material) return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
  const isTeacherMaterial = material.targetAudience === 'teacher';

  if (material.isFree) {
    return NextResponse.json({ error: '무료 자료는 주문이 필요 없습니다.' }, { status: 400 });
  }

  const requestedFileTypes = isTeacherMaterial
    ? ['problem', 'etc']
    : [...new Set(
      (Array.isArray(fileTypes) ? fileTypes : []).filter((type: unknown): type is 'problem' | 'etc' =>
        type === 'problem' || type === 'etc')
    )];
  if (!isTeacherMaterial && requestedFileTypes.length === 0) {
    return NextResponse.json({ error: '구매할 파일 유형이 올바르지 않습니다.' }, { status: 400 });
  }

  const paidOrders = await Order.find(
    { userId: user.id, materialId, status: 'paid' },
    { fileTypes: 1, orderId: 1 }
  ).lean();
  const purchased = new Set<string>();
  for (const order of paidOrders) {
    for (const type of order.fileTypes || []) purchased.add(type);
  }
  if (isTeacherMaterial && paidOrders.length > 0) {
    return NextResponse.json(
      { error: '이미 구매한 교사용 자료입니다.', purchasedFileTypes: ['problem', 'etc'] },
      { status: 400 }
    );
  }
  const fileTypesToBuy = isTeacherMaterial
    ? ['problem', 'etc']
    : requestedFileTypes.filter((type) => !purchased.has(type));

  if (!isTeacherMaterial && fileTypesToBuy.length === 0) {
    return NextResponse.json(
      { error: '선택한 파일은 이미 모두 구매했습니다.', purchasedFileTypes: [...purchased] },
      { status: 400 }
    );
  }

  // 기존 pending 주문 삭제 (결제 재시도 시 중복 방지)
  await Order.deleteMany({ userId: user.id, materialId, status: 'pending' });

  const amount = isTeacherMaterial
    ? (material.priceProblem || 0) + (material.priceEtc || 0)
    : (
      (fileTypesToBuy.includes('problem') ? (material.priceProblem || 0) : 0) +
      (fileTypesToBuy.includes('etc')     ? (material.priceEtc     || 0) : 0)
    );

  if (amount <= 0) {
    return NextResponse.json({ error: '결제 금액이 없습니다. 자료 가격을 확인해 주세요.' }, { status: 400 });
  }

  const materialTitle = buildMaterialTitle(material) || material.subject;

  const order = await Order.create({
    userId:        user.id || '',
    userEmail:     user.email || '',
    userName:      user.name  || '',
    materialId,
    materialTitle,
    fileTypes:     fileTypesToBuy,
    amount,
    status:        'pending',
    paymentMethod: paymentMethod || 'bank_transfer',
    paymentNote:   paymentNote   || '',
  });

  return NextResponse.json({ order }, { status: 201 });
}
