import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order, { type IOrder } from '@/lib/models/Order';
import Material, { type IMaterial } from '@/lib/models/Material';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import OrderFilters from './OrderFilters';
import { Suspense } from 'react';
import OrderActions from './OrderActions';

const formatDate = (d: Date | null | undefined) => {
  if (!d) return '—';
  const dt = new Date(d);
  const month = dt.getMonth() + 1;
  const day = dt.getDate();
  const h = dt.getHours().toString().padStart(2, '0');
  const m = dt.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${h}:${m}`;
};

const formatCreatedAt = (d: Date) => {
  const dt = new Date(d);
  const month = dt.getMonth() + 1;
  const day = dt.getDate();
  const h = dt.getHours().toString().padStart(2, '0');
  const m = dt.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${h}:${m}`;
};

const paymentMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    CARD: '카드',
    TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    MOBILE_PHONE: '휴대폰',
    CULTURE_GIFT_CERTIFICATE: '문화상품권',
    TOSSPAY: '토스페이',
    PAYCO: 'PAYCO',
    bank_transfer: '직접입금',
  };
  return map[method] ?? method ?? '기타';
};

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  amount_desc: { amount: -1 },
  amount_asc: { amount: 1 },
};

type QuickRange = 'all' | '7d' | '30d' | '90d' | '180d' | '1y';
type StatusFilter = 'all' | 'paid' | 'cancelled';
type OrderRow = Pick<IOrder, 'orderId' | 'userName' | 'userEmail' | 'materialId' | 'materialTitle' | 'fileTypes' | 'paymentMethod' | 'paidAt' | 'createdAt' | 'amount' | 'status'>;
type MaterialFlagRow = Pick<IMaterial, 'materialId' | 'hasAnswerInProblem'>;

const isDateInput = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseDateParam = (value: string, endOfDay = false) => {
  if (!isDateInput(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
};

const getRangeStart = (range: QuickRange, now: Date) => {
  const start = new Date(now);
  if (range === '7d') {
    start.setDate(start.getDate() - 7);
    return start;
  }
  if (range === '30d') {
    start.setDate(start.getDate() - 30);
    return start;
  }
  if (range === '90d') {
    start.setDate(start.getDate() - 90);
    return start;
  }
  if (range === '180d') {
    start.setDate(start.getDate() - 180);
    return start;
  }
  if (range === '1y') {
    start.setFullYear(start.getFullYear() - 1);
    return start;
  }
  return null;
};

const formatOrderFileTypes = (order: OrderRow, materialMap: Map<string, boolean>) => {
  if (order.fileTypes.includes('problem') && order.fileTypes.includes('etc')) {
    return '전체 자료';
  }
  return order.fileTypes
    .map((fileType) => (fileType === 'problem'
      ? (materialMap.get(order.materialId) ? '문제지 (정답 포함)' : '문제지')
      : '답지/기타'))
    .join(' + ');
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  const sp = await searchParams;
  const status: StatusFilter = ['paid', 'cancelled'].includes(sp.status || '')
    ? sp.status as StatusFilter
    : 'all';
  const q = sp.q?.trim() || '';
  const sort = ['newest', 'oldest', 'amount_desc', 'amount_asc'].includes(sp.sort || '')
    ? sp.sort || 'newest'
    : 'newest';
  const range: QuickRange = ['7d', '30d', '90d', '180d', '1y'].includes(sp.range || '')
    ? sp.range as QuickRange
    : 'all';
  const rawFrom = (sp.from || '').trim();
  const rawTo = (sp.to || '').trim();
  const safeFrom = isDateInput(rawFrom) ? rawFrom : '';
  const safeTo = isDateInput(rawTo) ? rawTo : '';
  const [fromInput, toInput] =
    safeFrom && safeTo && safeFrom > safeTo ? [safeTo, safeFrom] : [safeFrom, safeTo];
  const fromDate = parseDateParam(fromInput, false);
  const toDate = parseDateParam(toInput, true);
  const hasCustomDate = !!fromDate || !!toDate;
  const page = Math.max(1, parseInt(sp.page || '1'));
  const limit = 30;
  const hasFilter = !!(status !== 'all' || q || sort !== 'newest' || range !== 'all' || hasCustomDate);

  await connectMongo();

  const filter: Record<string, unknown> = {};
  filter.status = status === 'all' ? { $in: ['paid', 'cancelled'] } : status;
  const rangeStart = hasCustomDate ? null : getRangeStart(range, new Date());
  const createdAtFilter: Record<string, Date> = {};
  if (fromDate) createdAtFilter.$gte = fromDate;
  if (toDate) createdAtFilter.$lte = toDate;
  if (!hasCustomDate && rangeStart) createdAtFilter.$gte = rangeStart;
  if (Object.keys(createdAtFilter).length > 0) filter.createdAt = createdAtFilter;

  if (q) {
    filter.$or = [
      { orderId: { $regex: q, $options: 'i' } },
      { userName: { $regex: q, $options: 'i' } },
      { userEmail: { $regex: q, $options: 'i' } },
      { materialTitle: { $regex: q, $options: 'i' } },
    ];
  }

  const sortObj = SORT_MAP[sort] ?? SORT_MAP.newest;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit).lean<OrderRow[]>(),
    Order.countDocuments(filter),
  ]);

  const materialIds = Array.from(new Set(orders.map((o) => o.materialId)));
  const materials = materialIds.length > 0
    ? await Material.find({ materialId: { $in: materialIds } }, { materialId: 1, hasAnswerInProblem: 1 }).lean<MaterialFlagRow[]>()
    : [];
  const materialMap = new Map(materials.map((m) => [m.materialId, !!m.hasAnswerInProblem]));

  const totalPage = Math.ceil(total / limit);

  const buildUrl = (overrides: Record<string, string>) => {
    const nextStatus = overrides.status ?? status;
    const nextQ = overrides.q ?? q;
    const nextSort = overrides.sort ?? sort;
    const nextRange = overrides.range ?? range;
    const nextFrom = overrides.from ?? fromInput;
    const nextTo = overrides.to ?? toInput;
    const nextPage = overrides.page ?? '1';

    const params = new URLSearchParams();
    if (nextStatus && nextStatus !== 'all') params.set('status', nextStatus);
    if (nextQ) params.set('q', nextQ);
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
    if (nextFrom) params.set('from', nextFrom);
    if (nextTo) params.set('to', nextTo);
    if (!nextFrom && !nextTo && nextRange !== 'all') params.set('range', nextRange);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);
    const qs = params.toString();
    return qs ? `/m/admin/orders?${qs}` : '/m/admin/orders';
  };

  return (
    <div className="m-detail-page min-h-screen">
      {/* ── 헤더 ── */}
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
            <span className="text-[13px] font-extrabold text-blue-500 tracking-wide">관리자 패널</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-[2.25rem] font-extrabold text-gray-900 tracking-tight leading-tight">주문 관리</h1>
              <p className="text-[15px] text-gray-400 font-medium mt-1.5">결제/환불 <strong className="text-blue-500 font-extrabold">{total.toLocaleString()}</strong>건</p>
            </div>
          </div>

          {/* 검색 + 정렬 */}
          <div className="mt-8">
            <Suspense>
              <OrderFilters />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-7xl py-8">
        {orders.length === 0 ? (
          <div className="m-detail-card flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <ShoppingBag size={34} className="text-gray-300" />
            </div>
            <p className="text-[17px] font-bold text-gray-400">
              {q ? `"${q}" 검색 결과가 없습니다` : '주문 내역이 없습니다'}
            </p>
          </div>
        ) : (
          <>
            {q && (
              <p className="text-[14px] text-gray-400 mb-5 font-bold">
                {total.toLocaleString()}건 검색됨
                <span className="ml-2 font-extrabold text-blue-500">&ldquo;{q}&rdquo;</span>
              </p>
            )}

            {hasFilter && !q && (
              <p className="text-[14px] text-gray-400 mb-5 font-bold">
                필터 적용 결과 {total.toLocaleString()}건
              </p>
            )}

            <div className="space-y-3 md:hidden">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="m-detail-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800">{order.userName || '(이름 없음)'}</p>
                      <p className="truncate text-xs text-gray-400">{order.userEmail}</p>
                      <p className="mt-1 truncate font-mono text-[11px] text-gray-300">#{order.orderId}</p>
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums">{formatCreatedAt(order.createdAt)}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm font-semibold leading-snug text-gray-800">{order.materialTitle || '(자료명 없음)'}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatOrderFileTypes(order, materialMap)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
                    <span className="font-medium text-gray-700">{paymentMethodLabel(order.paymentMethod)}</span>
                    <span className="text-gray-500 tabular-nums">{formatDate(order.paidAt)}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <p className="text-base font-bold text-gray-900 tabular-nums">{order.amount.toLocaleString()}원</p>
                    <OrderActions orderId={order.orderId} status={order.status} />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <div className="m-detail-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-7 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest w-[220px]">주문자</th>
                        <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">자료</th>
                        <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[110px]">결제</th>
                        <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[100px]">결제 시간</th>
                        <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[110px]">금액</th>
                        <th className="text-center px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[120px]">환불</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-800">{order.userName || '(이름 없음)'}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{order.userEmail}</p>
                            <p className="text-[11px] font-mono text-gray-300 mt-1 truncate">#{order.orderId}</p>
                            <p className="text-[11px] text-gray-400 tabular-nums">{formatCreatedAt(order.createdAt)}</p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-800 text-sm leading-snug">{order.materialTitle || '(자료명 없음)'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatOrderFileTypes(order, materialMap)}
                            </p>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-700 font-medium">{paymentMethodLabel(order.paymentMethod)}</p>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-500 tabular-nums">{formatDate(order.paidAt)}</p>
                          </td>

                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <p className="text-base font-bold text-gray-900 tabular-nums">
                              {order.amount.toLocaleString()}원
                            </p>
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <OrderActions orderId={order.orderId} status={order.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 페이지네이션 */}
            {totalPage > 1 && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-400">
                  {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} / {total.toLocaleString()}건
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-300 transition-colors">
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
                          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${p === page
                              ? 'bg-blue-100 text-blue-600 border border-blue-100'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                        >
                          {p}
                        </Link>
                    )}
                  {page < totalPage && (
                    <Link href={buildUrl({ page: String(page + 1) })} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-300 transition-colors">
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
