import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { auth } from '@/lib/auth';
import {
  getAllProducts,
  seedDefaultCommunityUpgradeProductsIfEmpty,
} from '@/lib/community-upgrade';
import ProductForm from './ProductForm';

export default async function AdminCommunityProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') redirect('/m/materials');
  const sp = await searchParams;

  await seedDefaultCommunityUpgradeProductsIfEmpty();
  const products = await getAllProducts();
  const productRows = products.map((product) => ({
    productId: product.productId,
    key: product.key,
    name: product.name,
    shortLabel: product.shortLabel,
    amount: product.amount,
    sortOrder: product.sortOrder,
    isActive: product.isActive,
  }));
  const limit = 12;
  const requestedPage = Math.max(1, parseInt(sp.page || '1', 10));
  const totalPage = Math.max(1, Math.ceil(productRows.length / limit));
  const page = Math.min(requestedPage, totalPage);
  const pagedRows = productRows.slice((page - 1) * limit, page * limit);
  const activeCount = productRows.filter((product) => product.isActive).length;

  const buildUrl = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (key === 'page') continue;
      if (value) params.set(key, value);
    }
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/m/admin/community-products?${qs}` : '/m/admin/community-products';
  };

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-6xl py-8 sm:py-10">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
            <span className="text-[13px] font-extrabold tracking-wide text-blue-500">관리자 패널</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-[2.25rem]">
                상품 관리
              </h1>
              <p className="mt-1.5 text-[15px] font-medium text-gray-400">
                전체 <strong className="font-extrabold text-blue-500">{productRows.length.toLocaleString()}</strong>개
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2">
                <Package size={15} className="text-blue-500" />
                <span className="text-[13px] font-extrabold text-blue-600">총 상품 {productRows.length.toLocaleString()}개</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span className="text-[13px] font-extrabold text-emerald-700">활성 {activeCount.toLocaleString()}개</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-6xl py-8">
        <ProductForm products={pagedRows} />
        {totalPage > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            <Link
              href={buildUrl(Math.max(1, page - 1))}
              className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm ${
                page <= 1
                  ? 'pointer-events-none border-gray-200 text-gray-300'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft size={16} />
              이전
            </Link>
            <span className="px-2 text-sm font-bold text-gray-600">
              {page} / {totalPage}
            </span>
            <Link
              href={buildUrl(Math.min(totalPage, page + 1))}
              className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm ${
                page >= totalPage
                  ? 'pointer-events-none border-gray-200 text-gray-300'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              다음
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
