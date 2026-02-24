import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import CommunityUpgradeProduct from '@/lib/models/CommunityUpgradeProduct';

export const dynamic = 'force-dynamic';

type CommunityUpgradeProductLean = {
  productId?: string;
  key?: string;
  name?: string;
  shortLabel?: string;
  amount?: number;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const normalizeKey = (value: unknown) => normalizeText(value).toLowerCase();

const parseAmount = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (!Number.isInteger(parsed)) return null;
  if (parsed < 0 || parsed > 1000000000) return null;
  return parsed;
};

const parseSortOrder = (value: unknown) => {
  if (typeof value === 'undefined') return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
};

const isDuplicateKeyError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const maybeCode = (error as { code?: unknown }).code;
  if (maybeCode === 11000) return true;
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' && message.includes('E11000');
};

const ensureAdmin = async () => {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') return null;
  return session;
};

const toProductDTO = (doc: CommunityUpgradeProductLean) => ({
  productId: normalizeText(doc.productId),
  key: normalizeKey(doc.key),
  name: normalizeText(doc.name),
  shortLabel: normalizeText(doc.shortLabel),
  amount: Number.isFinite(doc.amount) ? Number(doc.amount) : 0,
  sortOrder: Number.isFinite(doc.sortOrder) ? Number(doc.sortOrder) : 0,
  isActive: doc.isActive !== false,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export async function GET() {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  await connectMongo();
  const products = await CommunityUpgradeProduct.find({})
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean() as CommunityUpgradeProductLean[];

  return NextResponse.json({ products: products.map(toProductDTO) });
}

export async function POST(req: NextRequest) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const key = normalizeKey(body.key);
  const name = normalizeText(body.name);
  const shortLabel = normalizeText(body.shortLabel);
  const amount = parseAmount(body.amount);
  const sortOrder = parseSortOrder(body.sortOrder);
  const isActive = body.isActive !== false;

  if (!/^[a-z0-9][a-z0-9_-]{1,39}$/.test(key)) {
    return NextResponse.json(
      { error: '상품 키는 영문 소문자/숫자/하이픈/언더스코어 조합(2~40자)만 가능합니다.' },
      { status: 400 },
    );
  }
  if (!name || name.length > 120) {
    return NextResponse.json({ error: '상품명을 확인해 주세요. (1~120자)' }, { status: 400 });
  }
  if (!shortLabel || shortLabel.length > 40) {
    return NextResponse.json({ error: '짧은 라벨을 확인해 주세요. (1~40자)' }, { status: 400 });
  }
  if (amount === null) {
    return NextResponse.json({ error: '금액은 0원 이상 정수만 입력할 수 있습니다.' }, { status: 400 });
  }
  if (sortOrder === null) {
    return NextResponse.json({ error: '정렬 순서를 확인해 주세요.' }, { status: 400 });
  }

  await connectMongo();
  try {
    const created = await CommunityUpgradeProduct.create({
      key,
      name,
      shortLabel,
      amount,
      sortOrder,
      isActive,
      updatedAt: new Date(),
    });
    const product = toProductDTO(created.toObject() as CommunityUpgradeProductLean);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: '이미 사용 중인 상품 키입니다.' }, { status: 409 });
    }
    console.error('[POST /api/m/admin/community-products] error', error);
    return NextResponse.json({ error: '상품 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
