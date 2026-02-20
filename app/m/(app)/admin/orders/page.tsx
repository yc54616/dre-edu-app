import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import OrderFilters from './OrderFilters';
import { Suspense } from 'react';

const formatDate = (d: Date | null | undefined) => {
  if (!d) return '—';
  const dt = new Date(d);
  const month  = dt.getMonth() + 1;
  const day    = dt.getDate();
  const h      = dt.getHours().toString().padStart(2, '0');
  const m      = dt.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${h}:${m}`;
};

const formatCreatedAt = (d: Date) => {
  const dt = new Date(d);
  const month = dt.getMonth() + 1;
  const day   = dt.getDate();
  const h     = dt.getHours().toString().padStart(2, '0');
  const m     = dt.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${h}:${m}`;
};

const paymentMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    CARD:                     '카드',
    TRANSFER:                 '계좌이체',
    VIRTUAL_ACCOUNT:          '가상계좌',
    MOBILE_PHONE:             '휴대폰',
    CULTURE_GIFT_CERTIFICATE: '문화상품권',
    TOSSPAY:                  '토스페이',
    PAYCO:                    'PAYCO',
    bank_transfer:            '직접입금',
  };
  return map[method] ?? method ?? '기타';
};

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest:      { createdAt: -1 },
  oldest:      { createdAt:  1 },
  amount_desc: { amount: -1 },
  amount_asc:  { amount:  1 },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  const sp     = await searchParams;
  const status = sp.status || '';
  const q      = sp.q?.trim() || '';
  const sort   = sp.sort || 'newest';
  const page   = Math.max(1, parseInt(sp.page || '1'));
  const limit  = 30;

  await connectMongo();

  // 필터 조건
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { orderId:       { $regex: q, $options: 'i' } },
      { userName:      { $regex: q, $options: 'i' } },
      { userEmail:     { $regex: q, $options: 'i' } },
      { materialTitle: { $regex: q, $options: 'i' } },
    ];
  }

  const sortObj = SORT_MAP[sort] ?? SORT_MAP.newest;

  const [orders, total, counts] = await Promise.all([
    Order.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  let totalAll = 0;
  let paidCount = 0;
  for (const c of counts) {
    totalAll += c.count;
    if (c._id === 'paid') paidCount = c.count;
  }

  const totalPage = Math.ceil(total / limit);

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({
      page: '1',
      ...(status ? { status } : {}),
      ...(q      ? { q }      : {}),
      ...(sort !== 'newest' ? { sort } : {}),
      ...overrides,
    });
    return `/m/admin/orders?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-bold text-red-500">관리자</span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-dre-navy)]">주문 관리</h1>
              <p className="text-sm text-gray-400 mt-1.5">전체 {totalAll.toLocaleString()}건</p>
            </div>
            {/* 요약 뱃지 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">{paidCount.toLocaleString()}건 완료</span>
              </div>
            </div>
          </div>

          {/* 검색 + 정렬 */}
          <div className="mt-6">
            <Suspense>
              <OrderFilters />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-32">
            <ShoppingBag size={34} className="text-gray-300 mb-4" />
            <p className="text-xl font-bold text-gray-400">
              {q ? `"${q}" 검색 결과가 없습니다` : '주문이 없습니다'}
            </p>
          </div>
        ) : (
          <>
            {/* 결과 수 */}
            {(q || status) && (
              <p className="text-sm text-gray-400 mb-4 font-medium">
                {total.toLocaleString()}건 검색됨
                {q && <span className="ml-2 font-bold text-gray-600">"{q}"</span>}
              </p>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[220px]">주문자</th>
                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">자료</th>
                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[110px]">결제</th>
                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[100px]">결제 시간</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[110px]">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.orderId} className={`hover:bg-gray-50/60 transition-colors group ${order.status !== 'paid' ? 'opacity-60' : ''}`}>
                        {/* 주문자 */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-800">{order.userName || '(이름 없음)'}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{order.userEmail}</p>
                          <p className="text-[11px] font-mono text-gray-300 mt-1 truncate">#{order.orderId}</p>
                          <p className="text-[11px] text-gray-400 tabular-nums">{formatCreatedAt(order.createdAt)}</p>
                        </td>

                        {/* 자료 */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800 text-sm leading-snug">{order.materialTitle || '(자료명 없음)'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.fileTypes.map((t: string) => t === 'problem' ? '문제지' : '답지/기타').join(' + ')}
                          </p>
                        </td>

                        {/* 결제 */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-700 font-medium">{paymentMethodLabel(order.paymentMethod)}</p>
                        </td>

                        {/* 결제 시간 */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-500 tabular-nums">{formatDate(order.paidAt)}</p>
                        </td>

                        {/* 금액 */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <p className="text-base font-bold text-gray-900 tabular-nums">
                            {order.amount.toLocaleString()}원
                          </p>
                          {order.status === 'paid' && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-500 mt-1">
                              <CheckCircle2 size={12} />완료
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 페이지네이션 */}
            {totalPage > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">
                  {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} / {total.toLocaleString()}건
                </p>
                <div className="flex items-center gap-2">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-[var(--color-dre-blue)] transition-colors">
                      <ChevronLeft size={16} />
                    </Link>
                  )}
                  {Array.from({ length: totalPage }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPage)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-300 text-sm">…</span>
                        : <Link
                            key={p}
                            href={buildUrl({ page: String(p) })}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                              p === page
                                ? 'bg-[var(--color-dre-blue)] text-white shadow-md shadow-blue-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-dre-blue)]/50'
                            }`}
                          >
                            {p}
                          </Link>
                    )}
                  {page < totalPage && (
                    <Link href={buildUrl({ page: String(page + 1) })} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-[var(--color-dre-blue)] transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
