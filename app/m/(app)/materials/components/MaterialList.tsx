import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '@/lib/models/Material';
import { buildTitle, diffStyle, isNewMaterial, type MaterialCardData } from '../lib/utils';

interface Props {
  materials: MaterialCardData[];
  total: number;
  page: number;
  totalPage: number;
  isSearching: boolean;
  query: string;
  subject: string;
  buildUrl: (overrides: Record<string, string>) => string;
}

function Preview({ item, title }: { item: MaterialCardData; title: string }) {
  if (item.previewImages?.[0]) {
    return (
      <img
        src={`/uploads/previews/${item.previewImages[0]}`}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 ${item.fileType === 'hwp' ? 'bg-amber-50' : 'bg-blue-50'}`}>
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.fileType === 'hwp' ? 'bg-amber-100 text-orange-600' : 'bg-blue-100 text-blue-700'}`}
      >
        <BookOpen size={22} />
      </span>
      <span className={`text-[11px] font-black tracking-[0.12em] ${item.fileType === 'hwp' ? 'text-orange-600' : 'text-blue-700'}`}>
        {item.subject}
      </span>
    </div>
  );
}

export default function MaterialList({
  materials,
  total,
  page,
  totalPage,
  isSearching,
  query,
  subject,
  buildUrl,
}: Props) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Material Catalog</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">전체 학습자료</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {isSearching
              ? (
                <>
                  {query ? <><span className="font-black text-slate-700">&ldquo;{query}&rdquo;</span> 검색 결과 </> : null}
                  <span className="font-black text-blue-700">{total.toLocaleString()}개</span>
                </>
              )
              : (
                <>
                  총 <span className="font-black text-blue-700">{total.toLocaleString()}개</span>의 자료
                </>
              )}
          </p>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="m-surface-card flex flex-col items-center justify-center rounded-3xl py-24 sm:py-28">
          <span className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-blue-400">
            <BookOpen size={36} />
          </span>
          <p className="text-center text-lg font-black text-slate-500">
            {query ? `"${query}" 검색 결과가 없습니다` : '등록된 자료가 없습니다'}
          </p>
          {(subject || query) && (
            <Link
              href="/m/materials"
              className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-slate-800"
            >
              전체 자료 보기
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {materials.map((item) => {
              const title = buildTitle(item);
              const diffColor = DIFFICULTY_COLOR[item.difficulty] || 'blue';

              return (
                <Link
                  key={item.materialId}
                  href={`/m/materials/${item.materialId}`}
                  className="group m-surface-card overflow-hidden rounded-3xl border border-blue-100 bg-white transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_34px_-26px_rgba(30,64,175,0.9)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-blue-50">
                    <Preview item={item} title={title} />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      {item.isFree && (
                        <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black text-white">
                          FREE
                        </span>
                      )}
                      {isNewMaterial(item.createdAt) && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black text-white">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${diffStyle[diffColor]}`}>
                        {DIFFICULTY_LABEL[item.difficulty]}
                      </span>
                      {item.schoolLevel && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          {item.schoolLevel}
                        </span>
                      )}
                      <span className="truncate rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {item.type}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-[15px] font-black leading-snug text-slate-900 group-hover:text-blue-700">
                      {title || item.subject}
                    </p>

                    <div className="flex items-center justify-between border-t border-blue-50 pt-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <ShoppingBag size={12} /> {(item.downloadCount ?? 0).toLocaleString()}건
                      </span>
                      {item.isFree ? (
                        <span className="text-sm font-black text-emerald-600">FREE</span>
                      ) : (item.priceProblem ?? 0) > 0 ? (
                        <span className="text-sm font-black text-slate-900">{(item.priceProblem ?? 0).toLocaleString()}원~</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-5">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-700"
                >
                  <ChevronLeft size={18} />
                </Link>
              )}

              {Array.from({ length: totalPage }, (_, index) => index + 1)
                .filter((num) => Math.abs(num - page) <= 2)
                .map((num) => (
                  <Link
                    key={num}
                    href={buildUrl({ page: String(num) })}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition-all ${
                      num === page
                        ? 'm-gradient-badge shadow-[0_16px_26px_-20px_rgba(30,64,175,0.9)]'
                        : 'border border-blue-100 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    {num}
                  </Link>
                ))}

              {page < totalPage && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-700"
                >
                  <ChevronRight size={18} />
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
