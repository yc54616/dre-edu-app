import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import CommunityUpgradeOrder from '@/lib/models/CommunityUpgradeOrder';
import {
  getProductByKey,
  seedDefaultCommunityUpgradeProductsIfEmpty,
} from '@/lib/community-upgrade';

export const dynamic = 'force-dynamic';

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const normalizePhone = (value: unknown) => normalizeText(value).replace(/[^\d-]/g, '');

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const productKey = normalizeText(body.productKey).toLowerCase();
  if (!productKey) {
    return NextResponse.json({ error: '상품 정보가 올바르지 않습니다.' }, { status: 400 });
  }

  let product = await getProductByKey(productKey);
  if (!product) {
    await seedDefaultCommunityUpgradeProductsIfEmpty();
    product = await getProductByKey(productKey);
  }
  if (!product) {
    return NextResponse.json({ error: '상품 정보가 올바르지 않습니다.' }, { status: 400 });
  }
  const applicantName = normalizeText(body.applicantName);
  const phone = normalizePhone(body.phone);
  const cafeNickname = normalizeText(body.cafeNickname);

  if (!applicantName || applicantName.length > 30) {
    return NextResponse.json({ error: '신청자 이름을 확인해 주세요.' }, { status: 400 });
  }
  if (!phone || phone.length < 8 || phone.length > 20) {
    return NextResponse.json({ error: '연락처를 확인해 주세요.' }, { status: 400 });
  }
  if (!cafeNickname || cafeNickname.length > 40) {
    return NextResponse.json({ error: '신청자 식별 정보를 확인해 주세요.' }, { status: 400 });
  }

  try {
    await connectMongo();
    const order = await CommunityUpgradeOrder.create({
      productKey: product.key,
      productName: product.name,
      amount: product.amount,
      applicantName,
      phone,
      cafeNickname,
      status: 'pending',
      processStatus: 'pending',
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          orderId: order.orderId,
          orderName: product.shortLabel,
          amount: product.amount,
          applicantName: order.applicantName,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/community/orders] error', error);
    return NextResponse.json({ error: '주문 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
