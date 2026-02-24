'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, CalendarRange } from 'lucide-react';

const STATUS_OPTIONS = [
  { val: 'all', label: '환불 상태 전체' },
  { val: 'paid', label: '결제완료' },
  { val: 'cancelled', label: '환불완료' },
];

const SORT_OPTIONS = [
  { val: 'newest', label: '최신순' },
  { val: 'oldest', label: '오래된순' },
  { val: 'amount_desc', label: '금액 높은순' },
  { val: 'amount_asc',  label: '금액 낮은순' },
];

const RANGE_OPTIONS = [
  { val: 'all', label: '전체 기간' },
  { val: '7d', label: '최근 7일' },
  { val: '30d', label: '최근 1개월' },
  { val: '90d', label: '최근 3개월' },
  { val: '180d', label: '최근 6개월' },
  { val: '1y', label: '최근 1년' },
];

export default function OrderFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback((updates: Record<string, string | null>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.set('page', '1');
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }, [pathname, router, searchParams]);

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams({ q: value }), 350);
  };

  const sort = searchParams.get('sort') ?? 'newest';
  const status = searchParams.get('status') ?? 'all';
  const range = searchParams.get('range') ?? 'all';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const q = searchParams.get('q') ?? '';
  const hasFilter = !!(q || sort !== 'newest' || status !== 'all' || range !== 'all' || from || to);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row">
        {/* 검색 */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <input
            key={q}
            type="text"
            defaultValue={q}
            placeholder="주문번호 · 이름 · 이메일 · 자료명"
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        {/* 정렬 */}
        <div className="relative w-full sm:w-auto">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? null : e.target.value })}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white py-2.5 pl-8 pr-8 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 sm:w-auto"
          >
            {SORT_OPTIONS.map(({ val, label }) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* 환불 상태 */}
        <div className="relative w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value === 'all' ? null : e.target.value })}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 sm:w-auto"
          >
            {STATUS_OPTIONS.map(({ val, label }) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {hasFilter && (
          <Link
            href="/m/admin/orders"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-center text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 sm:w-auto"
          >
            초기화
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative w-full sm:w-auto sm:min-w-[180px]">
          <CalendarRange size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <select
            value={range}
            onChange={(e) =>
              updateParams({
                range: e.target.value === 'all' ? null : e.target.value,
                from: null,
                to: null,
              })
            }
            className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white py-2.5 pl-8 pr-8 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
          >
            {RANGE_OPTIONS.map(({ val, label }) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="date"
            value={from}
            onChange={(e) =>
              updateParams({
                from: e.target.value || null,
                range: null,
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-700 focus:border-[var(--color-dre-blue)] focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:w-auto"
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            value={to}
            onChange={(e) =>
              updateParams({
                to: e.target.value || null,
                range: null,
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-700 focus:border-[var(--color-dre-blue)] focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
}
