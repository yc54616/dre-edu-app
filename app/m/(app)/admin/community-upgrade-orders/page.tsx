import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import CommunityUpgradeOrder from '@/lib/models/CommunityUpgradeOrder';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  amount_desc: { amount: -1, createdAt: -1 },
  amount_asc: { amount: 1, createdAt: -1 },
  paid_desc: { paidAt: -1, createdAt: -1 },
};

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'amount_desc', label: '금액 높은순' },
  { value: 'amount_asc', label: '금액 낮은순' },
  { value: 'paid_desc', label: '결제시간 최신순' },
] as const;

type CommunityOrderLean = {
  _id: unknown;
  orderId?: string;
  productName?: string;
  productKey?: string;
  amount?: number;
  applicantName?: string;
  phone?: string;
  cafeNickname?: string;
  status?: 'pending' | 'paid' | 'cancelled';
  processStatus?: 'pending' | 'completed';
  paymentMethod?: string;
  paidAt?: Date;
  createdAt?: Date;
};

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const formatDateTime = (value: unknown) => {
  if (!value) return '-';
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
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
  };
  return (map[method] ?? method) || '기타';
};

export default async function AdminCommunityUpgradeOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  const sp = await searchParams;

  const q = normalizeText(sp.q);
  const sort = SORT_OPTIONS.some((opt) => opt.value === sp.sort) ? sp.sort : 'newest';
  const requestedPage = Math.max(1, parseInt(sp.page || '1', 10));
  const limit = 30;

  const andFilters: Record<string, unknown>[] = [];
  // 처리대기 항목은 목록에서 제외하고 완료 처리 기준으로만 표시한다.
  andFilters.push({ $or: [{ processStatus: 'completed' }, { processStatus: { $exists: false } }] });
  if (q) {
    andFilters.push({
      $or: [
        { orderId: { $regex: q, $options: 'i' } },
        { applicantName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { cafeNickname: { $regex: q, $options: 'i' } },
        { productName: { $regex: q, $options: 'i' } },
      ],
    });
  }

  const filter: Record<string, unknown> = andFilters.length > 0 ? { $and: andFilters } : {};
  const hasFilter = Boolean(q || sort !== 'newest');

  await connectMongo();
  const [totalAll, paidCount, totalFiltered] = await Promise.all([
    CommunityUpgradeOrder.countDocuments({}),
    CommunityUpgradeOrder.countDocuments({ status: 'paid' }),
    CommunityUpgradeOrder.countDocuments(filter),
  ]);

  const totalPage = Math.max(1, Math.ceil(totalFiltered / limit));
  const page = Math.min(requestedPage, totalPage);

  const orders = await CommunityUpgradeOrder.find(filter)
    .sort(SORT_MAP[sort] ?? SORT_MAP.newest)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean() as CommunityOrderLean[];

  const buildUrl = (overrides: Record<string, string>) => {
    const nextQ = overrides.q ?? q;
    const nextSort = overrides.sort ?? sort;
    const nextPage = overrides.page ?? String(page);

    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);

    const qs = params.toString();
    return qs ? `/m/admin/community-upgrade-orders?${qs}` : '/m/admin/community-upgrade-orders';
  };

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-8 sm:py-10">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
            <span className="text-[13px] font-extrabold tracking-wide text-blue-500">관리자 패널</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-[2.25rem]">
                상품 결제 관리
              </h1>
              <p className="mt-1.5 text-[15px] font-medium text-gray-400">
                전체 <strong className="font-extrabold text-blue-500">{totalAll.toLocaleString()}</strong>건
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2">
                <CheckCircle2 size={15} className="text-blue-500" />
                <span className="text-[13px] font-extrabold text-blue-600">결제완료 {paidCount.toLocaleString()}건</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-7xl space-y-5 py-8">
        <div className="m-detail-card p-4 sm:p-5">
          <form action="/m/admin/community-upgrade-orders" method="get" className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                name="sort"
                defaultValue={sort}
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 text-xs font-semibold text-gray-600 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:w-[130px]"
                aria-label="정렬"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="신청자명 · 연락처 · 주문번호 · 상품명 검색"
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
              />
              <button type="submit" className="m-detail-btn-primary w-full rounded-2xl px-5 py-2.5 text-sm sm:w-auto">
                필터 적용
              </button>
              {hasFilter && (
                <Link
                  href="/m/admin/community-upgrade-orders"
                  className="m-detail-btn-secondary w-full rounded-2xl border border-gray-200 px-5 py-2.5 text-center text-sm sm:w-auto"
                >
                  초기화
                </Link>
              )}
            </div>

            <input type="hidden" name="page" value="1" />
          </form>
        </div>

        {orders.length === 0 ? (
          <div className="m-detail-card flex flex-col items-center justify-center py-24">
            <div className="h-16 w-16 rounded-2xl border border-gray-100 bg-gray-50" />
            <p className="mt-4 text-[16px] font-bold text-gray-400">
              {hasFilter ? '조건에 맞는 주문이 없습니다' : '등록된 상품 결제 주문이 없습니다'}
            </p>
          </div>
        ) : (
          <>
            <div className="m-detail-card border border-blue-100/80 bg-gradient-to-r from-blue-50/60 via-white to-white px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <p className="font-semibold text-gray-600">
                  현재 표시 <span className="font-extrabold text-blue-600">{orders.length.toLocaleString()}건</span>
                </p>
                <p className="font-semibold text-gray-500">
                  검색 결과 <span className="font-extrabold text-gray-700">{totalFiltered.toLocaleString()}건</span>
                </p>
                <p className="font-semibold text-gray-500">
                  페이지 <span className="font-extrabold text-gray-700">{page}</span> / {totalPage}
                </p>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {orders.map((order) => {
                return (
                  <div key={order.orderId || String(order._id)} className="m-detail-card space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">{normalizeText(order.applicantName) || '(이름 없음)'}</p>
                        <p className="truncate text-xs text-gray-400">{normalizeText(order.cafeNickname) || '(닉네임 없음)'}</p>
                        <p className="mt-1 truncate font-mono text-[11px] text-gray-300">#{normalizeText(order.orderId)}</p>
                      </div>
                      <p className="text-xs tabular-nums text-gray-400">{formatDateTime(order.createdAt)}</p>
                    </div>

                    <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
                      <p className="font-semibold text-gray-800">{normalizeText(order.productName) || '-'}</p>
                      <p className="text-xs text-gray-500">{normalizeText(order.phone) || '-'}</p>
                      <p className="font-bold text-blue-600">{Number(order.amount || 0).toLocaleString()}원</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        order.status === 'paid'
                          ? 'border border-blue-100 bg-blue-50 text-blue-600'
                          : order.status === 'cancelled'
                            ? 'border border-gray-200 bg-gray-100 text-gray-600'
                            : 'border border-amber-100 bg-amber-50 text-amber-600'
                      }`}>
                        {order.status === 'paid' ? '결제완료' : order.status === 'cancelled' ? '취소' : '결제대기'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block">
              <div className="m-detail-card overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[980px] table-fixed text-sm">
                  <colgroup>
                    <col className="w-[250px]" />
                    <col className="w-[250px]" />
                    <col className="w-[120px]" />
                    <col className="w-[150px]" />
                    <col className="w-[100px]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-bold tracking-wide text-gray-500">신청 정보</th>
                      <th className="px-5 py-4 text-left text-xs font-bold tracking-wide text-gray-500">상품 / 결제 수단</th>
                      <th className="px-5 py-4 text-left text-xs font-bold tracking-wide text-gray-500">결제 상태</th>
                      <th className="px-5 py-4 text-left text-xs font-bold tracking-wide text-gray-500">결제/처리시간</th>
                      <th className="px-6 py-4 text-right text-xs font-bold tracking-wide text-gray-500">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.orderId || String(order._id)} className="align-top transition-colors hover:bg-gray-50/80">
                        <td className="px-6 py-4">
                          <p className="truncate text-sm font-bold text-gray-900">{normalizeText(order.applicantName) || '(이름 없음)'}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">닉네임: {normalizeText(order.cafeNickname) || '-'}</p>
                          <p className="truncate text-xs text-gray-500">연락처: {normalizeText(order.phone) || '-'}</p>
                          <p className="mt-1 truncate font-mono text-[11px] text-gray-300">#{normalizeText(order.orderId)}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-gray-800">{normalizeText(order.productName) || '-'}</p>
                          <p className="mt-1 text-xs font-medium text-gray-500">{paymentMethodLabel(normalizeText(order.paymentMethod))}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
                            order.status === 'paid'
                              ? 'border border-blue-100 bg-blue-50 text-blue-600'
                              : order.status === 'cancelled'
                                ? 'border border-gray-200 bg-gray-100 text-gray-600'
                                : 'border border-amber-100 bg-amber-50 text-amber-600'
                          }`}>
                            {order.status === 'paid' ? '결제완료' : order.status === 'cancelled' ? '취소' : '결제대기'}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs tabular-nums text-gray-500">{formatDateTime(order.paidAt || order.createdAt)}</p>
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <p className="text-base font-bold tabular-nums text-gray-900">{Number(order.amount || 0).toLocaleString()}원</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPage > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Link
                  href={buildUrl({ page: String(Math.max(1, page - 1)) })}
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
                  href={buildUrl({ page: String(Math.min(totalPage, page + 1)) })}
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
          </>
        )}
      </div>
    </div>
  );
}
