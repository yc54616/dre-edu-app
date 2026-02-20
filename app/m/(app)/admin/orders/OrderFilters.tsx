'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useTransition } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { val: 'newest', label: '최신순' },
  { val: 'oldest', label: '오래된순' },
  { val: 'amount_desc', label: '금액 높은순' },
  { val: 'amount_asc',  label: '금액 낮은순' },
];

export default function OrderFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }, [pathname, router, searchParams]);

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam('q', value), 400);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* 검색 */}
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        <input
          type="text"
          defaultValue={searchParams.get('q') ?? ''}
          placeholder="주문번호 · 이름 · 이메일 · 자료명"
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>

      {/* 정렬 */}
      <div className="relative">
        <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        <select
          defaultValue={searchParams.get('sort') ?? 'newest'}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="pl-8 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer transition-all"
        >
          {SORT_OPTIONS.map(({ val, label }) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
