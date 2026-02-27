'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

const TYPE_OPTIONS = [
  { val: '', label: '유형 전체' },
  { val: 'admission', label: '입학 안내' },
  { val: 'consulting', label: '입시컨설팅' },
  { val: 'coaching', label: '온라인수학코칭' },
  { val: 'teacher', label: '수업설계컨설팅' },
];

const STATUS_OPTIONS = [
  { val: '', label: '상태 전체' },
  { val: 'pending', label: '접수' },
  { val: 'contacted', label: '연락 완료' },
  { val: 'scheduled', label: '상담 예정' },
  { val: 'confirmed', label: '상담 확정' },
  { val: 'completed', label: '완료' },
  { val: 'cancelled', label: '취소' },
];

interface Props {
  resetHref?: string;
}

export default function ConsultFilters({ resetHref = '/m/admin/consultations' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const type = searchParams.get('type') ?? '';
  const status = searchParams.get('status') ?? '';
  const q = searchParams.get('q') ?? '';
  const hasFilter = !!(q || type || status);

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          key={q}
          type="text"
          defaultValue={q}
          placeholder="이름 · 연락처 · 문의 내용"
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-[15px] outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      <select
        value={type}
        onChange={(e) => updateParams({ type: e.target.value })}
        className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-medium outline-none focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 sm:w-auto"
      >
        {TYPE_OPTIONS.map(({ val, label }) => (
          <option key={val || 'all'} value={val}>{label}</option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => updateParams({ status: e.target.value })}
        className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-medium outline-none focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 sm:w-auto"
      >
        {STATUS_OPTIONS.map(({ val, label }) => (
          <option key={val || 'all'} value={val}>{label}</option>
        ))}
      </select>

      {hasFilter && (
        <Link
          href={resetHref}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-[15px] font-semibold text-gray-600 transition-colors hover:bg-gray-100 sm:w-auto"
        >
          초기화
        </Link>
      )}
    </div>
  );
}
