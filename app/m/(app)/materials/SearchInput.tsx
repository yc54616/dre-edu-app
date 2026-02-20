'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const [value, setValue]            = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const router      = useRouter();
  const searchParams = useSearchParams();

  const submit = (q: string) => {
    // 현재 파라미터(subject, sort 등)를 유지하고 q와 page만 덮어씀
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`/m/materials?${params.toString()}`);
    });
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(value); }}
      className="relative"
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
        {isPending
          ? <span className="w-4 h-4 border-2 border-gray-300 border-t-[var(--color-dre-blue)] rounded-full animate-spin" />
          : <Search size={17} />
        }
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="과목, 단원, 학교명으로 검색..."
        className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-300 font-medium focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => { setValue(''); submit(''); }}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}
