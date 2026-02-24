import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock3, Flame, ShoppingBag } from 'lucide-react';
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '@/lib/models/Material';
import { buildTitle, diffStyle, isNewMaterial, rankStyle, type MaterialCardData } from '../lib/utils';

interface Props {
  isSearching: boolean;
  top10: MaterialCardData[];
  newMaterials: MaterialCardData[];
}

function MaterialThumb({ item, title }: { item: MaterialCardData; title: string }) {
  if (item.previewImages?.[0]) {
    return (
      <Image
        src={`/uploads/previews/${item.previewImages[0]}`}
        alt={title || item.subject || item.type}
        fill
        sizes="(max-width: 640px) 56px, (max-width: 1280px) 33vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1 ${item.fileType === 'hwp' ? 'bg-amber-50' : 'bg-blue-50'}`}>
      <BookOpen size={20} className={item.fileType === 'hwp' ? 'text-orange-500' : 'text-blue-600'} />
      <span className="text-[11px] font-bold text-slate-500">{item.subject}</span>
    </div>
  );
}

export default function TopMaterials({ isSearching, top10, newMaterials }: Props) {
  if (isSearching) return null;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
      <div className="m-surface-card rounded-3xl p-5 sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_16px_24px_-18px_rgba(239,68,68,.95)]">
              <Flame size={18} />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">인기 TOP 10</h2>
              <p className="text-xs font-semibold text-slate-400">구매/다운로드 실데이터 기반</p>
            </div>
          </div>
          <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-black text-orange-600">HOT</span>
        </div>

        <div className="space-y-2.5">
          {top10.map((item, index) => {
            const rank = index + 1;
            const style = rankStyle(rank);
            const title = buildTitle(item);
            const diffColor = DIFFICULTY_COLOR[item.difficulty] || 'blue';

            return (
              <Link
                key={item.materialId}
                href={`/m/materials/${item.materialId}`}
                className="group flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_26px_-22px_rgba(30,64,175,.9)]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.box}`}>
                  <span className={`text-sm font-black ${style.text}`}>{rank}</span>
                </div>

                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-blue-50">
                  <MaterialThumb item={item} title={title} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-black text-slate-900 group-hover:text-blue-700">{title || item.subject}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${diffStyle[diffColor]}`}>
                      {DIFFICULTY_LABEL[item.difficulty]}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{item.subject}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[12px] font-black text-slate-700">
                    {item.isFree ? '무료' : `${((item.priceProblem ?? 0) + (item.priceEtc ?? 0)).toLocaleString()}원~`}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <ShoppingBag size={11} /> {(item.downloadCount ?? 0).toLocaleString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="m-surface-card rounded-3xl p-5 sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_16px_24px_-18px_rgba(37,99,235,.95)]">
              <Clock3 size={18} />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">신규 등록</h2>
              <p className="text-xs font-semibold text-slate-400">최근 14일 업데이트</p>
            </div>
          </div>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-600">NEW</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
          {newMaterials.map((item) => {
            const title = buildTitle(item);
            const diffColor = DIFFICULTY_COLOR[item.difficulty] || 'blue';

            return (
              <Link
                key={item.materialId}
                href={`/m/materials/${item.materialId}`}
                className="group overflow-hidden rounded-2xl border border-blue-100 bg-white transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_28px_-22px_rgba(30,64,175,.9)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <MaterialThumb item={item} title={title} />
                  {isNewMaterial(item.createdAt) && (
                    <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">
                      NEW
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${diffStyle[diffColor]}`}>
                    {DIFFICULTY_LABEL[item.difficulty]}
                  </span>
                  <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-snug text-slate-900 group-hover:text-blue-700">
                    {title || item.subject}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
