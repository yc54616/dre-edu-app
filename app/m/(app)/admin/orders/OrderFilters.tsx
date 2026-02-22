'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, CalendarRange } from 'lucide-react';

const SORT_OPTIONS = [
  { val: 'newest', label: '최신순' },
  { val: 'oldest', label: '오래된순' },
  { val: 'amount_desc', label: '금액 높은순' },
  { val: 'amount_asc',  label: '금액 낮은순' },
];

const STATUS_OPTIONS = [
  { val: '', label: '상태 전체' },
  { val: 'paid', label: '승인 완료' },
  { val: 'pending', label: '입금 대기' },
  { val: 'cancelled', label: '취소됨' },
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

  const status = searchParams.get('status') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const range = searchParams.get('range') ?? 'all';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const q = searchParams.get('q') ?? '';
  const hasFilter = !!(q || status || sort !== 'newest' || range !== 'all' || from || to);

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
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

        {/* 상태 */}
        <select
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map(({ val, label }) => (
            <option key={val || 'all'} value={val}>{label}</option>
          ))}
        </select>

        {/* 정렬 */}
        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? null : e.target.value })}
            className="pl-8 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer transition-all"
          >
            {SORT_OPTIONS.map(({ val, label }) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {hasFilter && (
          <Link
            href="/m/admin/orders"
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors text-center"
          >
            초기화
          </Link>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative min-w-[180px]">
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
            className="pl-8 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer transition-all"
          >
            {RANGE_OPTIONS.map(({ val, label }) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={from}
            onChange={(e) =>
              updateParams({
                from: e.target.value || null,
                range: null,
              })
            }
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
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
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>
    </div>
  );
}
