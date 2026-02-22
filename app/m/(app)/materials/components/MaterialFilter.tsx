import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { MATERIAL_SUBJECTS } from '@/lib/constants/material';

interface Props {
  subject: string;
  sort: string;
  buildUrl: (overrides: Record<string, string>) => string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'easy', label: '쉬운순' },
  { value: 'hard', label: '어려운순' },
] as const;

export default function MaterialFilter({ subject, sort, buildUrl }: Props) {
  return (
    <section className="m-surface-card rounded-3xl p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        <SlidersHorizontal size={14} />
        Store Filter
      </div>

      <div className="flex flex-col gap-4">
        <div className="m-scrollbar flex gap-2 overflow-x-auto pb-1">
          <Link
            href={buildUrl({ subject: '' })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition-all ${
              !subject
                ? 'm-chip-active'
                : 'm-chip hover:border-blue-200 hover:text-blue-700'
            }`}
          >
            전체
          </Link>
          {MATERIAL_SUBJECTS.map((item) => (
            <Link
              key={item}
              href={buildUrl({ subject: item })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition-all ${
                subject === item
                  ? 'm-chip-active'
                  : 'm-chip hover:border-blue-200 hover:text-blue-700'
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl({ sort: opt.value })}
              className={`rounded-xl px-3.5 py-2 text-[13px] font-extrabold transition-all ${
                sort === opt.value
                  ? 'm-btn-primary border px-4 text-white'
                  : 'border border-blue-100 bg-blue-50/50 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
