import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Link from 'next/link';
import { ShoppingBag, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const sortLabel: Record<string, string> = {
  newest: '최신순',
  oldest: '오래된순',
  amountHigh: '금액 높은순',
  amountLow: '금액 낮은순',
};

const rangeLabel: Record<string, string> = {
  all: '전체 기간',
  '1m': '최근 1개월',
  '3m': '최근 3개월',
  '6m': '최근 6개월',
  '1y': '최근 1년',
};

type OrderSort = 'newest' | 'oldest' | 'amountHigh' | 'amountLow';
type DateRange = 'all' | '1m' | '3m' | '6m' | '1y';

interface OrderListItem {
  orderId: string;
  materialId: string;
  materialTitle: string;
  fileTypes: string[];
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod: string;
  createdAt: Date | string;
}

const paymentMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    CARD: '카드',
    TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    MOBILE_PHONE: '휴대폰',
    CULTURE_GIFT_CERTIFICATE: '문화상품권',
    bank_transfer: '직접입금',
  };
  return map[method] ?? method ?? '기타';
};

const sortValues: OrderSort[] = ['newest', 'oldest', 'amountHigh', 'amountLow'];
const rangeValues: DateRange[] = ['all', '1m', '3m', '6m', '1y'];

const isSort = (value: string): value is OrderSort =>
  sortValues.includes(value as OrderSort);

const isRange = (value: string): value is DateRange =>
  rangeValues.includes(value as DateRange);

const isDateInput = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseDateParam = (value: string, endOfDay = false) => {
  if (!isDateInput(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
};

const getRangeStart = (range: DateRange, now: Date) => {
  const start = new Date(now);
  if (range === '1m') {
    start.setMonth(start.getMonth() - 1);
    return start;
  }
  if (range === '3m') {
    start.setMonth(start.getMonth() - 3);
    return start;
  }
  if (range === '6m') {
    start.setMonth(start.getMonth() - 6);
    return start;
  }
  if (range === '1y') {
    start.setFullYear(start.getFullYear() - 1);
    return start;
  }
  return null;
};

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session) redirect('/m');

  const user = session.user as { id?: string };
  const userId = user.id || '';
  const sp = await searchParams;

  const rawPage = Number.parseInt(sp.page || '1', 10);
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const sort: OrderSort = isSort(sp.sort || '') ? sp.sort as OrderSort : 'newest';
  const dateRange: DateRange = isRange(sp.range || '') ? sp.range as DateRange : 'all';
  const query = (sp.q || '').trim();
  const rawFrom = (sp.from || '').trim();
  const rawTo = (sp.to || '').trim();

  const safeFrom = isDateInput(rawFrom) ? rawFrom : '';
  const safeTo = isDateInput(rawTo) ? rawTo : '';
  const [fromInput, toInput] =
    safeFrom && safeTo && safeFrom > safeTo ? [safeTo, safeFrom] : [safeFrom, safeTo];
  const fromDate = parseDateParam(fromInput, false);
  const toDate = parseDateParam(toInput, true);
  const hasCustomDate = !!fromDate || !!toDate;

  await connectMongo();
  const allOrders = await Order.find({ userId }).sort({ createdAt: -1 }).lean() as OrderListItem[];

  // 결제 완료된 자료가 있으면 동일 material의 pending 주문은 숨김
  const paidMaterialIds = new Set(
    allOrders.filter((o) => o.status === 'paid').map((o) => o.materialId)
  );
  const visibleOrders = allOrders.filter(
    (o) => !(o.status === 'pending' && paidMaterialIds.has(o.materialId))
  );

  const rangeStart = hasCustomDate ? null : getRangeStart(dateRange, new Date());
  const normalizedQuery = query.toLowerCase();
  let filteredOrders = visibleOrders.filter((o) => {
    const createdAt = new Date(o.createdAt);
    if (fromDate && createdAt < fromDate) return false;
    if (toDate && createdAt > toDate) return false;
    if (!hasCustomDate && rangeStart && createdAt < rangeStart) return false;
    return true;
  });

  if (normalizedQuery) {
    filteredOrders = filteredOrders.filter((o) =>
      o.orderId.toLowerCase().includes(normalizedQuery) ||
      (o.materialTitle || '').toLowerCase().includes(normalizedQuery)
    );
  }

  const sortedOrders = [...filteredOrders];
  if (sort === 'oldest') {
    sortedOrders.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  } else if (sort === 'amountHigh') {
    sortedOrders.sort((a, b) => (b.amount - a.amount) || (+new Date(b.createdAt) - +new Date(a.createdAt)));
  } else if (sort === 'amountLow') {
    sortedOrders.sort((a, b) => (a.amount - b.amount) || (+new Date(b.createdAt) - +new Date(a.createdAt)));
  } else {
    sortedOrders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  const limit = 12;
  const total = sortedOrders.length;
  const totalPage = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(requestedPage, totalPage);
  const start = (page - 1) * limit;
  const orders = sortedOrders.slice(start, start + limit);
  const hasFilter = dateRange !== 'all' || !!query || sort !== 'newest' || hasCustomDate;

  const buildUrl = (overrides: Record<string, string>) => {
    const nextRange = overrides.range ?? dateRange;
    const nextSort = overrides.sort ?? sort;
    const nextQuery = overrides.q ?? query;
    const nextFrom = overrides.from ?? fromInput;
    const nextTo = overrides.to ?? toInput;
    const nextPage = overrides.page ?? '1';

    const params = new URLSearchParams();
    if (nextFrom) params.set('from', nextFrom);
    if (nextTo) params.set('to', nextTo);
    if (!nextFrom && !nextTo && nextRange && nextRange !== 'all') params.set('range', nextRange);
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
    if (nextQuery) params.set('q', nextQuery);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);

    const qs = params.toString();
    return qs ? `/m/my-orders?${qs}` : '/m/my-orders';
  };

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-5xl py-8 sm:py-10">
          <h1 className="m-detail-title">내 주문 내역</h1>
          <p className="text-base text-gray-500 font-medium mt-2">
            총 <strong className="text-gray-700">{visibleOrders.length}</strong>건 중
            현재 <strong className="text-blue-500 ml-1">{total}</strong>건 표시
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="m-detail-soft px-3 py-2.5">
              <p className="text-[12px] text-gray-500 font-semibold">전체 주문</p>
              <p className="text-lg font-extrabold text-gray-800 mt-0.5">{visibleOrders.length}</p>
            </div>
            <div className="m-detail-soft px-3 py-2.5">
              <p className="text-[12px] text-gray-500 font-semibold">현재 표시</p>
              <p className="text-lg font-extrabold text-gray-800 mt-0.5">{total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-5xl py-8 space-y-5">
        <section className="m-detail-card p-4 sm:p-5 space-y-4">
          <form action="/m/my-orders" method="get" className="flex items-center gap-3 flex-wrap">
            {dateRange !== 'all' && !hasCustomDate && <input type="hidden" name="range" value={dateRange} />}
            {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="주문번호, 자료명 검색"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-300"
              />
            </div>
            <button
              type="submit"
              className="m-detail-btn-secondary px-4 py-3 text-sm border-gray-200"
            >
              검색
            </button>
            {(query || dateRange !== 'all' || sort !== 'newest' || hasCustomDate) && (
              <Link href="/m/my-orders" scroll={false} className="m-detail-btn-secondary px-4 py-3 text-sm border-gray-200">
                초기화
              </Link>
            )}

            <div className="w-full flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 font-semibold">기간 지정</span>
              <input
                type="date"
                name="from"
                defaultValue={fromInput}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-300"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                name="to"
                defaultValue={toInput}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-300"
              />
              <button
                type="submit"
                className="m-detail-btn-secondary px-3.5 py-2 text-sm border-gray-200"
              >
                기간 적용
              </button>
              {hasCustomDate && (
                <Link
                  href={buildUrl({ from: '', to: '', page: '1' })}
                  scroll={false}
                  className="m-detail-btn-secondary px-3.5 py-2 text-sm border-gray-200"
                >
                  기간 해제
                </Link>
              )}
            </div>
          </form>

          <div className="m-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
            {rangeValues.map((value) => (
              <Link
                key={value}
                href={buildUrl({ range: value, from: '', to: '', page: '1' })}
                scroll={false}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  !hasCustomDate && dateRange === value
                    ? 'bg-blue-100 text-blue-600 border border-blue-100'
                    : 'bg-white text-gray-600 border border-blue-100 hover:border-blue-200 hover:text-blue-500'
                }`}
              >
                {rangeLabel[value]}
              </Link>
            ))}
          </div>

          {hasCustomDate && (
            <p className="text-sm text-gray-500 font-medium">
              지정 기간: <strong className="text-gray-700">{fromInput || '처음'}</strong> ~ <strong className="text-gray-700">{toInput || '현재'}</strong>
            </p>
          )}

          <div className="inline-flex items-center rounded-xl border border-blue-100 bg-blue-50/60 p-1 gap-1">
            {sortValues.map((opt) => (
              <Link
                key={opt}
                href={buildUrl({ sort: opt, page: '1' })}
                scroll={false}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                  sort === opt
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                {sortLabel[opt]}
              </Link>
            ))}
          </div>
        </section>

        {orders.length === 0 ? (
          <div className="m-detail-card flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <ShoppingBag size={34} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-500 mb-2">
              {hasFilter ? '조건에 맞는 주문 내역이 없습니다' : '주문 내역이 없습니다'}
            </p>
            {hasFilter ? (
              <Link href="/m/my-orders" scroll={false} className="mt-3 text-base text-blue-500 font-semibold hover:underline underline-offset-4">
                필터 초기화
              </Link>
            ) : (
              <Link href="/m/materials" className="mt-3 text-base text-blue-500 font-semibold hover:underline underline-offset-4">
                자료 둘러보기 →
              </Link>
            )}
          </div>
        ) : (
          <>
            <section className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="m-detail-card hover:border-blue-200 hover:shadow-sm p-7 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-mono mb-1.5 opacity-80">#{order.orderId}</p>
                      <p className="text-[17px] font-extrabold text-gray-900 truncate tracking-tight">{order.materialTitle}</p>
                      <p className="text-sm text-gray-600 mt-1 font-medium">
                        {order.fileTypes.map((t: string) => t === 'problem' ? '문제지' : '답지/기타').join(' + ')}
                        {order.paymentMethod && (
                          <>{' · '}{paymentMethodLabel(order.paymentMethod)}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                    <span className="text-[18px] font-extrabold text-blue-500">{order.amount.toLocaleString()}원</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      {order.status === 'paid' && (
                        <Link
                          href={`/m/materials/${order.materialId}`}
                          className="m-detail-btn-secondary px-4 py-2 text-sm border-blue-100 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Download size={14} />
                          자료 열람
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {totalPage > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                {page > 1 && (
                  <Link
                    href={buildUrl({ page: String(page - 1) })}
                    scroll={false}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-300 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </Link>
                )}
                {Array.from({ length: totalPage }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <Link
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      scroll={false}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? 'bg-blue-100 text-blue-600 border border-blue-100'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                {page < totalPage && (
                  <Link
                    href={buildUrl({ page: String(page + 1) })}
                    scroll={false}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-300 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
