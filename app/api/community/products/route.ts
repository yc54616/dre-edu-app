import { NextResponse } from 'next/server';
import { getActiveProducts } from '@/lib/community-upgrade';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[GET /api/community/products] error', error);
    return NextResponse.json({ error: '상품 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}
