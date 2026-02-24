import connectMongo from '@/lib/mongoose';
import CommunityUpgradeProduct from '@/lib/models/CommunityUpgradeProduct';

export type CommunityUpgradeProductInfo = {
  productId: string;
  key: string;
  name: string;
  shortLabel: string;
  amount: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

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

const DEFAULT_COMMUNITY_UPGRADE_PRODUCTS = [
  {
    key: 'premium',
    name: '네이버 dre수학 교사용 프리미엄회원 인증',
    shortLabel: '프리미엄회원 인증',
    amount: 50000,
    sortOrder: 1,
    isActive: true,
  },
  {
    key: 'regular',
    name: '네이버 dre수학 교사용 정회원 인증',
    shortLabel: '정회원 인증',
    amount: 10000,
    sortOrder: 2,
    isActive: true,
  },
] as const;

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const normalizeKey = (value: unknown) => normalizeText(value).toLowerCase();

const toProductInfo = (doc: CommunityUpgradeProductLean): CommunityUpgradeProductInfo => ({
  productId: normalizeText(doc.productId),
  key: normalizeKey(doc.key),
  name: normalizeText(doc.name),
  shortLabel: normalizeText(doc.shortLabel),
  amount: Number.isFinite(doc.amount) ? Number(doc.amount) : 0,
  sortOrder: Number.isFinite(doc.sortOrder) ? Number(doc.sortOrder) : 0,
  isActive: doc.isActive !== false,
  createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(0),
  updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(0),
});

const isDuplicateKeyError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const maybeCode = (error as { code?: unknown }).code;
  if (maybeCode === 11000) return true;
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' && message.includes('E11000');
};

export async function seedDefaultCommunityUpgradeProductsIfEmpty() {
  await connectMongo();
  const count = await CommunityUpgradeProduct.countDocuments({});
  if (count > 0) return false;

  try {
    await CommunityUpgradeProduct.insertMany(
      DEFAULT_COMMUNITY_UPGRADE_PRODUCTS.map((product) => ({
        ...product,
        updatedAt: new Date(),
      })),
      { ordered: false },
    );
    return true;
  } catch (error) {
    if (isDuplicateKeyError(error)) return false;
    throw error;
  }
}

export async function getAllProducts() {
  await connectMongo();
  const docs = await CommunityUpgradeProduct.find({})
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean() as CommunityUpgradeProductLean[];
  return docs.map(toProductInfo);
}

export async function getActiveProducts() {
  await connectMongo();
  const docs = await CommunityUpgradeProduct.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean() as CommunityUpgradeProductLean[];
  return docs.map(toProductInfo);
}

export async function getProductByKey(key: string, options?: { includeInactive?: boolean }) {
  const normalizedKey = normalizeKey(key);
  if (!normalizedKey) return null;

  await connectMongo();
  const query: Record<string, unknown> = { key: normalizedKey };
  if (!options?.includeInactive) query.isActive = true;

  const doc = await CommunityUpgradeProduct.findOne(query).lean() as CommunityUpgradeProductLean | null;
  if (!doc) return null;
  return toProductInfo(doc);
}
