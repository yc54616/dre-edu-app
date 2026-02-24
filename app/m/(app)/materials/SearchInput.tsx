'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const submit = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`/m/materials?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(value); }}
      className="flex items-center gap-3"
    >
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
          {isPending
            ? <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            : <Search size={18} />
          }
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="과목, 단원, 학교명, 도서명으로 검색..."
          className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-[15px] text-gray-900 placeholder:text-gray-400 font-medium focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm hover:shadow-md"
        />
        {value && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              type="button"
              onClick={() => { setValue(''); submit(''); }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="shrink-0 px-7 py-4 bg-gray-50 text-gray-600 text-[15px] font-bold rounded-2xl border border-gray-200 transition-all hover:bg-gray-100 hover:text-gray-900"
      >
        검색
      </button>
    </form>
  );
}
