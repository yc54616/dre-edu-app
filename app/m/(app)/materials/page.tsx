import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import { MATERIAL_SUBJECTS } from '@/lib/constants/material';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  BookOpen, ShoppingBag, Sparkles, ChevronLeft, ChevronRight,
  Clock, ArrowRight, LayoutGrid, List, Gift, Flame,
} from 'lucide-react';
import SearchInput from './SearchInput';
import type { SortOrder } from 'mongoose';

export const dynamic = 'force-dynamic';

type ViewMode = 'grid' | 'list';

interface MaterialListItem {
  materialId: string;
  type: string;
  subject: string;
  topic?: string | null;
  schoolLevel?: string | null;
  gradeNumber?: number | null;
  year?: number | null;
  semester?: number | null;
  schoolName?: string | null;
  difficulty: number;
  fileType: string;
  isFree?: boolean;
  priceProblem?: number;
  previewImages?: string[];
  downloadCount?: number;
  createdAt?: Date | string;
}

const diffStyle: Record<string, string> = {
  emerald: 'bg-blue-50 text-blue-600 border-blue-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  violet: 'bg-sky-50 text-sky-700 border-sky-200',
  orange: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  red: 'bg-slate-100 text-slate-700 border-slate-200',
};

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'easy', label: '쉬운순' },
  { value: 'hard', label: '어려운순' },
] as const;

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'grid', label: '카드', icon: <LayoutGrid size={14} /> },
  { value: 'list', label: '리스트', icon: <List size={14} /> },
];

const sortMap: Record<string, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  popular: { downloadCount: -1 },
  easy: { difficulty: 1 },
  hard: { difficulty: -1 },
};

function buildTitle(m: {
  schoolName?: string | null;
  year?: number | null;
  gradeNumber?: number | null;
  semester?: number | null;
  subject: string;
  topic?: string | null;
}) {
  return [
    m.schoolName,
    m.year ? `${m.year}년` : '',
    m.gradeNumber ? `${m.gradeNumber}학년` : '',
    m.semester ? `${m.semester}학기` : '',
    m.subject,
    m.topic,
  ].filter(Boolean).join(' ');
}

function getPriceLabel(item: MaterialListItem) {
  if (item.isFree) return { text: '무료', color: 'text-blue-500' };
  if ((item.priceProblem ?? 0) > 0) {
    return { text: `${item.priceProblem!.toLocaleString()}원~`, color: 'text-slate-700' };
  }
  return { text: '가격 문의', color: 'text-slate-400' };
}

function MaterialCard({
  item,
  view,
  isNew,
  returnTo,
  anchorKey = 'all',
}: {
  item: MaterialListItem;
  view: ViewMode;
  isNew: boolean;
  returnTo: string;
  anchorKey?: string;
}) {
  const title = buildTitle(item);
  const difficultyTone = diffStyle[DIFFICULTY_COLOR[item.difficulty] || 'blue'];
  const price = getPriceLabel(item);
  const preview = item.previewImages?.[0] || null;
  const anchorId = `m-${item.materialId}-${anchorKey}`;
  const detailHref = `/m/materials/${item.materialId}?from=${encodeURIComponent(`${returnTo}#${anchorId}`)}`;

  if (view === 'list') {
    return (
      <Link
        id={anchorId}
        href={detailHref}
        className="group m-detail-card block p-4 sm:p-5 hover:border-blue-200 hover:shadow-lg transition-all"
      >
        <div className="flex gap-4">
          <div className="h-24 w-20 sm:h-28 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-blue-100 bg-blue-50">
            {preview ? (
              <img
                src={`/uploads/previews/${preview}`}
                alt={title || item.subject}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-blue-400">
                <BookOpen size={20} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${difficultyTone}`}>
                {DIFFICULTY_LABEL[item.difficulty]}
              </span>
              <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold">
                {item.type}
              </span>
              {item.isFree && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full">
                  FREE
                </span>
              )}
              {isNew && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full">
                  NEW
                </span>
              )}
            </div>

            <p className="text-[15px] sm:text-base font-bold text-slate-800 truncate group-hover:text-blue-500 transition-colors">
              {title || item.subject}
            </p>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {item.subject}{item.topic ? ` · ${item.topic}` : ''}{item.schoolLevel ? ` · ${item.schoolLevel}` : ''}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                <ShoppingBag size={12} />
                <span>{(item.downloadCount ?? 0).toLocaleString()}명 구매</span>
              </div>
              <span className={`text-sm font-bold ${price.color}`}>{price.text}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      id={anchorId}
      href={detailHref}
      className="group m-detail-card block overflow-hidden hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        {preview ? (
          <img
            src={`/uploads/previews/${preview}`}
            alt={title || item.subject}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-sky-50">
            <div className="w-14 h-14 rounded-[1.25rem] bg-blue-100/80 text-blue-500 flex items-center justify-center">
              <BookOpen size={26} strokeWidth={2.5} />
            </div>
            <span className="text-[12px] font-bold tracking-widest uppercase text-blue-500">
              {item.subject}
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-1.5">
          {item.isFree && (
            <span className="text-[10px] font-bold bg-white/95 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">FREE</span>
          )}
          {isNew && (
            <span className="text-[10px] font-bold bg-white/95 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">NEW</span>
          )}
        </div>

        <div className="absolute bottom-3 right-3">
          <span className={`text-[12px] font-bold bg-white/95 border border-slate-200 rounded-xl shadow-sm px-3 py-1.5 ${price.color}`}>
            {price.text}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${difficultyTone}`}>
            {DIFFICULTY_LABEL[item.difficulty]}
          </span>
          {item.schoolLevel && (
            <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold">
              {item.schoolLevel}
            </span>
          )}
          <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold truncate max-w-[90px]">
            {item.type}
          </span>
        </div>

        <p className="text-[15px] font-bold text-slate-800 truncate leading-snug mb-1 group-hover:text-blue-500 transition-colors">
          {title || item.subject}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {item.subject}{item.topic ? ` · ${item.topic}` : ''}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
            <ShoppingBag size={12} className="text-gray-300" />
            <span>{(item.downloadCount ?? 0).toLocaleString()}명 구매</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ShelfSection({
  title,
  subtitle,
  icon,
  items,
  view,
  newIdSet,
  returnTo,
  anchorKey,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: MaterialListItem[];
  view: ViewMode;
  newIdSet: Set<string>;
  returnTo: string;
  anchorKey: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 border border-blue-100 flex items-center justify-center shadow-sm shadow-blue-100/60">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <MaterialCard
              key={item.materialId}
              item={item}
              view={view}
              isNew={newIdSet.has(item.materialId)}
              returnTo={returnTo}
              anchorKey={anchorKey}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <MaterialCard
              key={item.materialId}
              item={item}
              view={view}
              isNew={newIdSet.has(item.materialId)}
              returnTo={returnTo}
              anchorKey={anchorKey}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session) redirect('/m');

  const user = session.user as { role?: string };
  const role = user.role || 'student';

  const cookieStore = await cookies();
  const modeCookie = cookieStore.get('dre-mode')?.value;
  const currentMode: 'teacher' | 'student' =
    role === 'student' ? 'student' :
      role === 'teacher'
        ? (modeCookie === 'student' ? 'student' : 'teacher')
        : 'student';

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const subject = sp.subject || '';
  const sort = sp.sort || 'newest';
  const query = sp.q || '';
  const view: ViewMode = sp.view === 'list' ? 'list' : 'grid';
  const limit = 20;

  await connectMongo();

  // Base filter used by shelf sections and global stats
  const baseFilter: Record<string, unknown> = { isActive: true };
  if (currentMode === 'student') {
    baseFilter.fileType = { $in: ['pdf', 'both'] };
    baseFilter.targetAudience = { $in: ['student', 'all'] };
  } else {
    baseFilter.fileType = { $in: ['hwp', 'both'] };
    baseFilter.targetAudience = { $in: ['teacher', 'all'] };
  }

  // Filtered query used for full result section
  const filter: Record<string, unknown> = { ...baseFilter };
  if (subject) filter.subject = subject;
  if (query) {
    filter.$or = [
      { subject: { $regex: query, $options: 'i' } },
      { topic: { $regex: query, $options: 'i' } },
      { schoolName: { $regex: query, $options: 'i' } },
      { type: { $regex: query, $options: 'i' } },
    ];
  }

  const isSearching = !!(subject || query);
  const sortQuery = sortMap[sort] || sortMap.newest;

  const [materials, total, newMaterials, freeMaterials, hardMaterials, purchaseAgg, totalMaterials] =
    await Promise.all([
      Material.find(filter).sort(sortQuery).skip((page - 1) * limit).limit(limit).lean() as Promise<MaterialListItem[]>,
      Material.countDocuments(filter),
      isSearching
        ? Promise.resolve([] as MaterialListItem[])
        : (Material.find(baseFilter).sort({ createdAt: -1 }).limit(8).lean() as Promise<MaterialListItem[]>),
      isSearching
        ? Promise.resolve([] as MaterialListItem[])
        : (Material.find({ ...baseFilter, isFree: true }).sort({ createdAt: -1 }).limit(8).lean() as Promise<MaterialListItem[]>),
      isSearching
        ? Promise.resolve([] as MaterialListItem[])
        : (Material.find({ ...baseFilter, difficulty: { $gte: 4 } }).sort({ downloadCount: -1, createdAt: -1 }).limit(8).lean() as Promise<MaterialListItem[]>),
      Material.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, sum: { $sum: '$downloadCount' } } },
      ]),
      Material.countDocuments(baseFilter),
    ]);

  const totalPage = Math.ceil(total / limit);
  const isTeacher = currentMode === 'teacher';
  const totalPurchaseCount: number = (purchaseAgg[0]?.sum as number) ?? 0;
  const newIdSet = new Set(newMaterials.map((item) => item.materialId));

  const buildUrl = (overrides: Record<string, string>) => {
    const nextSubject = overrides.subject ?? subject;
    const nextSort = overrides.sort ?? sort;
    const nextQuery = overrides.q ?? query;
    const nextView = (overrides.view as ViewMode | undefined) ?? view;
    const nextPage = overrides.page ?? '1';

    const params = new URLSearchParams();
    if (nextSubject) params.set('subject', nextSubject);
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
    if (nextQuery) params.set('q', nextQuery);
    if (nextView === 'list') params.set('view', nextView);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);

    const qs = params.toString();
    return qs ? `/m/materials?${qs}` : '/m/materials';
  };
  const currentListUrl = buildUrl({ page: String(page) });

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-7 sm:py-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="m-detail-kicker mb-2">
                {isTeacher ? 'Teacher Library' : 'Student Library'}
              </p>
              <h1 className="m-detail-title">
                {isTeacher ? '교사용 자료 라이브러리' : '학생용 자료 라이브러리'}
              </h1>
              <p className="m-detail-subtitle mt-3">
                과목, 난이도, 최신 등록 기준으로 빠르게 탐색할 수 있도록 서가형으로 구성했습니다.
              </p>
            </div>

            <Link
              href="/m/recommend"
              className="m-detail-btn-primary shrink-0 px-5 py-3 text-[14px] sm:text-[15px]"
            >
              <Sparkles size={16} />
              맞춤추천
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="m-detail-soft p-4">
              <p className="text-[12px] font-bold text-blue-500">전체 보유 자료</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-800">{totalMaterials.toLocaleString()}</p>
            </div>
            <div className="m-detail-soft p-4">
              <p className="text-[12px] font-bold text-blue-500">현재 검색 결과</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-800">{total.toLocaleString()}</p>
            </div>
            <div className="m-detail-soft p-4">
              <p className="text-[12px] font-bold text-blue-500">누적 구매 수</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-800">{totalPurchaseCount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-7xl py-6 space-y-7">
        <section className="sticky top-16 z-30">
          <div className="m-detail-card p-4 sm:p-5 space-y-4">
            <Suspense fallback={<div className="h-[58px] rounded-2xl border border-blue-100 bg-white" />}>
              <SearchInput defaultValue={query} />
            </Suspense>

            <div className="m-scrollbar flex gap-2 overflow-x-auto pb-1">
              <Link
                href={buildUrl({ subject: '' })}
                scroll={false}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                  !subject
                    ? 'bg-blue-100 text-blue-600 border border-blue-100'
                    : 'bg-white border border-blue-100 text-gray-600 hover:border-blue-200 hover:text-blue-500'
                }`}
              >
                전체
              </Link>
              {MATERIAL_SUBJECTS.map((item) => (
                <Link
                  key={item}
                  href={buildUrl({ subject: item })}
                  scroll={false}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                    subject === item
                      ? 'bg-blue-100 text-blue-600 border border-blue-100'
                      : 'bg-white border border-blue-100 text-gray-600 hover:border-blue-200 hover:text-blue-500'
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex items-center rounded-xl border border-blue-100 bg-blue-50/60 p-1">
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ sort: opt.value })}
                    scroll={false}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                      sort === opt.value
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-blue-500'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>

              <div className="inline-flex items-center rounded-xl border border-blue-100 bg-white p-1">
                {VIEW_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ view: opt.value })}
                    scroll={false}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                      view === opt.value
                        ? 'bg-blue-100 text-blue-600 border border-blue-100'
                        : 'text-gray-500 hover:text-blue-500'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!isSearching && (
          <>
            <ShelfSection
              title="신규 자료"
              subtitle="최근 등록된 자료를 빠르게 확인하세요."
              icon={<Clock size={18} className="text-blue-500" />}
              items={newMaterials}
              view={view}
              newIdSet={newIdSet}
              returnTo={currentListUrl}
              anchorKey="new"
            />

            <ShelfSection
              title="무료 자료"
              subtitle="바로 활용 가능한 무료 자료 모음."
              icon={<Gift size={18} className="text-blue-500" />}
              items={freeMaterials}
              view={view}
              newIdSet={newIdSet}
              returnTo={currentListUrl}
              anchorKey="free"
            />

            <ShelfSection
              title="고난도 자료"
              subtitle="심화/최고난도 중심 추천."
              icon={<Flame size={18} className="text-blue-500" />}
              items={hardMaterials}
              view={view}
              newIdSet={newIdSet}
              returnTo={currentListUrl}
              anchorKey="hard"
            />
          </>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 border border-blue-100 flex items-center justify-center shadow-sm shadow-blue-100/60">
              <BookOpen size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">전체 자료</h2>
              <p className="text-sm text-slate-500">
                {query
                  ? <><strong className="text-blue-600">&ldquo;{query}&rdquo;</strong> 검색 결과 {total.toLocaleString()}개</>
                  : <>{total.toLocaleString()}개의 자료</>
                }
              </p>
            </div>
          </div>

          {materials.length === 0 ? (
            <div className="m-detail-card flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <BookOpen size={30} className="text-blue-300" />
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-500">
                {query ? `"${query}" 검색 결과가 없습니다` : '자료가 없습니다'}
              </p>
              {(subject || query) && (
                <Link href="/m/materials" className="mt-3 text-base font-semibold text-blue-500 hover:underline">
                  전체 보기
                </Link>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {materials.map((item) => (
                <MaterialCard
                  key={item.materialId}
                  item={item}
                  view={view}
                  isNew={newIdSet.has(item.materialId)}
                  returnTo={currentListUrl}
                  anchorKey="all"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((item) => (
                <MaterialCard
                  key={item.materialId}
                  item={item}
                  view={view}
                  isNew={newIdSet.has(item.materialId)}
                  returnTo={currentListUrl}
                  anchorKey="all"
                />
              ))}
            </div>
          )}

          {totalPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  scroll={false}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-300 transition-colors"
                >
                    <ChevronLeft size={18} />
                  </Link>
              )}
              {Array.from({ length: totalPage }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <Link
                    key={p}
                    href={buildUrl({ page: String(p) })}
                    scroll={false}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      p === page
                        ? 'bg-blue-100 text-blue-600 border border-blue-100'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              {page < totalPage && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  scroll={false}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-300 transition-colors"
                >
                  <ChevronRight size={18} />
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
