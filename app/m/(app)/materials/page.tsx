import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { cookies, headers } from 'next/headers';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import {
  getMaterialSubjectFilterCandidates,
  LEGACY_ONLY_MATERIAL_SUBJECTS,
  MATERIAL_CURRICULUM_LABEL,
  MATERIAL_SUBJECTS,
  MATERIAL_SUBJECTS_BY_CURRICULUM,
} from '@/lib/constants/material';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  BookOpen, ShoppingBag, Sparkles, ChevronLeft, ChevronRight,
  ArrowRight, LayoutGrid, List, SlidersHorizontal,
} from 'lucide-react';
import SearchInput from './SearchInput';
import ModeToggleButton from './ModeToggleButton';
import type { SortOrder } from 'mongoose';
import { buildMaterialTitle, buildMaterialSubline } from '@/lib/material-display';
import { getDifficultyBadgeClass } from '@/lib/material-difficulty-style';

export const dynamic = 'force-dynamic';

type ViewMode = 'grid' | 'list';
type MaterialScope = 'all' | 'free' | 'ebook';
type CurriculumFilter = 'revised_2022' | 'legacy' | 'all';

interface MaterialListItem {
  materialId: string;
  sourceCategory?: string;
  type: string;
  publisher?: string | null;
  bookTitle?: string | null;
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
  priceEtc?: number;
  previewImages?: string[];
  problemFile?: string | null;
  etcFile?: string | null;
  downloadCount?: number;
  createdAt?: Date | string;
}

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

const DEFAULT_CURRICULUM: Exclude<CurriculumFilter, 'all'> = 'revised_2022';
const CURRICULUM_OPTIONS: { value: Exclude<CurriculumFilter, 'all'>; label: string }[] = [
  { value: 'revised_2022', label: MATERIAL_CURRICULUM_LABEL.revised_2022 },
  { value: 'legacy', label: MATERIAL_CURRICULUM_LABEL.legacy },
];

const legacyOnlySubjectHints = LEGACY_ONLY_MATERIAL_SUBJECTS as readonly string[];
const buildCurriculumQuery = (curriculum: Exclude<CurriculumFilter, 'all'>): Record<string, unknown> => (
  curriculum === 'legacy'
    ? {
        $or: [
          { curriculum: 'legacy' },
          { curriculum: { $exists: false }, subject: { $in: legacyOnlySubjectHints } },
        ],
      }
    : {
        $or: [
          { curriculum: 'revised_2022' },
          { curriculum: { $exists: false }, subject: { $nin: legacyOnlySubjectHints } },
        ],
      }
);

const SCOPE_OPTIONS: { value: MaterialScope; label: string }[] = [
  { value: 'all', label: '전체 자료' },
  { value: 'free', label: '무료 자료' },
  { value: 'ebook', label: '전자책' },
];

const sortMap: Record<string, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  popular: { downloadCount: -1 },
  easy: { difficulty: 1 },
  hard: { difficulty: -1 },
};

function toFileExtLabel(fileName?: string | null): string | null {
  if (!fileName) return null;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (!ext) return null;
  if (ext === 'pdf') return 'PDF';
  if (ext === 'hwp') return 'HWP';
  if (ext === 'hwpx') return 'HWPX';
  return ext.toUpperCase();
}

function getMaterialFileFormatLabel(item: MaterialListItem): string {
  const labels: string[] = [];
  const add = (value: string | null) => {
    if (!value) return;
    if (!labels.includes(value)) labels.push(value);
  };
  add(toFileExtLabel(item.problemFile));
  add(toFileExtLabel(item.etcFile));
  if (labels.length > 0) return labels.join(' · ');
  if (item.fileType === 'hwp') return 'HWP';
  if (item.fileType === 'both') return 'PDF · HWP';
  return 'PDF';
}

function getPriceLabel(item: MaterialListItem) {
  if (item.isFree) return { text: '무료', color: 'text-blue-500' };
  const price = (item.priceProblem ?? 0) + (item.priceEtc ?? 0);
  if (price > 0) {
    return { text: `${price.toLocaleString()}원~`, color: 'text-slate-700' };
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
  const title = buildMaterialTitle(item);
  const subtitle = buildMaterialSubline(item) || item.bookTitle || item.subject || item.type;
  const difficultyTone = getDifficultyBadgeClass(DIFFICULTY_COLOR[item.difficulty], 'softOutline');
  const price = getPriceLabel(item);
  const preview = item.previewImages?.[0] || null;
  const fileFormatLabel = getMaterialFileFormatLabel(item);
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
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-blue-100 bg-blue-50 sm:h-28 sm:w-24">
            {preview ? (
              <Image
                src={`/uploads/previews/${preview}`}
                alt={title || item.bookTitle || item.subject || item.type}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              <span className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-bold">
                {fileFormatLabel}
              </span>
              {isNew && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full">
                  NEW
                </span>
              )}
            </div>

            <p className="text-[15px] sm:text-base font-bold text-slate-800 truncate group-hover:text-blue-500 transition-colors">
              {title || item.bookTitle || item.subject || item.type}
            </p>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {subtitle}{item.schoolLevel ? ` · ${item.schoolLevel}` : ''}
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
          <Image
            src={`/uploads/previews/${preview}`}
            alt={title || item.bookTitle || item.subject || item.type}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
          <span className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-bold">
            {fileFormatLabel}
          </span>
        </div>

        <p className="text-[15px] font-bold text-slate-800 truncate leading-snug mb-1 group-hover:text-blue-500 transition-colors">
          {title || item.bookTitle || item.subject || item.type}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {subtitle}
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

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session) redirect('/m');

  const user = session.user as { role?: string; teacherApprovalStatus?: string };
  const role = user.role || 'student';

  if (role === 'teacher' && user.teacherApprovalStatus !== 'approved') {
    redirect('/m?approval=pending');
  }

  const cookieStore = await cookies();
  const modeCookie = cookieStore.get('dre-mode')?.value;
  const currentMode: 'teacher' | 'student' =
    role === 'student' ? 'student' :
      role === 'teacher'
        ? (modeCookie === 'student' ? 'student' : 'teacher')
        : 'student';

  const sp = await searchParams;
  const headerStore = await headers();
  const userAgent = headerStore.get('user-agent') || '';
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
  const defaultView: ViewMode = isMobileDevice ? 'list' : 'grid';
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const scope: MaterialScope = (sp.scope === 'free' || sp.scope === 'ebook') ? sp.scope : 'all';
  const curriculum: CurriculumFilter =
    sp.curriculum === 'legacy' || sp.curriculum === 'revised_2022' || sp.curriculum === 'all'
      ? sp.curriculum
      : DEFAULT_CURRICULUM;
  const subject = sp.subject || '';
  const sort = sp.sort || 'newest';
  const query = sp.q || '';
  const view: ViewMode = (sp.view === 'list' || sp.view === 'grid') ? sp.view : defaultView;
  const limit = 20;
  const subjectFilterBase = curriculum === 'all'
    ? [...MATERIAL_SUBJECTS]
    : [...MATERIAL_SUBJECTS_BY_CURRICULUM[curriculum]];
  const subjectFilterOptions = subject && !subjectFilterBase.includes(subject)
    ? [subject, ...subjectFilterBase]
    : subjectFilterBase;
  const curriculumLabel = curriculum === 'all' ? '통합 보기' : MATERIAL_CURRICULUM_LABEL[curriculum];

  await connectMongo();

  // Base filter used by shelf sections and global stats
  const baseFilter: Record<string, unknown> = { isActive: true };
  if (currentMode === 'student') {
    baseFilter.fileType = { $in: ['pdf', 'both'] };
    baseFilter.targetAudience = { $in: ['student', 'all'] };
  } else {
    baseFilter.targetAudience = { $in: ['teacher', 'all'] };
  }

  // Filtered query used for full result section
  const filter: Record<string, unknown> = { ...baseFilter };
  const andFilters: Record<string, unknown>[] = [];

  if (scope === 'free') {
    andFilters.push({ isFree: true });
  } else if (scope === 'ebook') {
    andFilters.push({
      $or: [
        { sourceCategory: 'ebook' },
        { subject: '전자책' },
        { type: '전자책' },
      ],
    });
  }

  if (scope !== 'ebook' && curriculum !== 'all') {
    andFilters.push(buildCurriculumQuery(curriculum));
  }

  if (subject && scope !== 'ebook') {
    const subjectCandidates = getMaterialSubjectFilterCandidates(subject);
    andFilters.push(
      subjectCandidates.length > 1
        ? { subject: { $in: subjectCandidates } }
        : { subject }
    );
  }

  if (query) {
    andFilters.push({
      $or: [
        { subject: { $regex: query, $options: 'i' } },
        { topic: { $regex: query, $options: 'i' } },
        { schoolName: { $regex: query, $options: 'i' } },
        { bookTitle: { $regex: query, $options: 'i' } },
        { publisher: { $regex: query, $options: 'i' } },
        { ebookDescription: { $regex: query, $options: 'i' } },
        { ebookToc: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } },
      ],
    });
  }

  if (andFilters.length > 0) {
    filter.$and = andFilters;
  }

  const isSearching = !!(subject || query || scope !== 'all' || curriculum !== DEFAULT_CURRICULUM);
  const sortQuery = sortMap[sort] || sortMap.newest;

  const [materials, total, newMaterials] =
    await Promise.all([
      Material.find(filter).sort(sortQuery).skip((page - 1) * limit).limit(limit).lean() as Promise<MaterialListItem[]>,
      Material.countDocuments(filter),
      isSearching
        ? Promise.resolve([] as MaterialListItem[])
        : (Material.find(baseFilter).sort({ createdAt: -1 }).limit(8).lean() as Promise<MaterialListItem[]>),
    ]);

  const totalPage = Math.ceil(total / limit);
  const newIdSet = new Set(newMaterials.map((item) => item.materialId));
  const scopeTitle = scope === 'free' ? '무료 자료' : scope === 'ebook' ? '전자책' : '전체 자료';
  const scopeCountLabel = scope === 'free' ? '무료 자료' : scope === 'ebook' ? '전자책' : '자료';

  const buildUrl = (overrides: Record<string, string>) => {
    const nextScope = (overrides.scope as MaterialScope | undefined) ?? scope;
    const nextCurriculum = (overrides.curriculum as CurriculumFilter | undefined) ?? curriculum;
    const nextSubject = overrides.subject ?? subject;
    const nextSort = overrides.sort ?? sort;
    const nextQuery = overrides.q ?? query;
    const nextView = (overrides.view as ViewMode | undefined) ?? view;
    const nextPage = overrides.page ?? '1';

    const params = new URLSearchParams();
    if (nextScope !== 'all') params.set('scope', nextScope);
    if (nextCurriculum !== DEFAULT_CURRICULUM) params.set('curriculum', nextCurriculum);
    if (nextSubject) params.set('subject', nextSubject);
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
    if (nextQuery) params.set('q', nextQuery);
    if (nextView !== defaultView) params.set('view', nextView);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);

    const qs = params.toString();
    return qs ? `/m/materials?${qs}` : '/m/materials';
  };
  const currentListUrl = buildUrl({ page: String(page) });

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-6 sm:py-9">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="m-detail-kicker mb-2">
                {currentMode === 'teacher' ? 'Teacher Library' : 'Student Library'}
              </p>
              <h1 className="m-detail-title">
                {currentMode === 'teacher' ? '교사용 자료 라이브러리' : '학생용 자료 라이브러리'}
              </h1>
              <p className="m-detail-subtitle mt-3">
                과목, 난이도, 최신 등록순으로 원하는 자료를 빠르게 찾을 수 있게 구성했습니다.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
              <Link
                href="/m/recommend"
                className="m-detail-btn-primary inline-flex w-full justify-center px-5 py-3 text-[14px] sm:text-[15px]"
              >
                <Sparkles size={16} />
                맞춤추천
                <ArrowRight size={14} />
              </Link>
              {role === 'teacher' && (
                <ModeToggleButton currentMode={currentMode} />
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="m-detail-container max-w-7xl py-6 space-y-7">
        <section>
          <div className="m-detail-card p-4 sm:p-5 space-y-4">
            <Suspense fallback={<div className="h-[58px] rounded-2xl border border-blue-100 bg-white" />}>
              <SearchInput defaultValue={query} />
            </Suspense>

            {scope !== 'ebook' && (
            <details className="group sm:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-blue-500" />
                  과목 필터
                </span>
                <span className="text-xs font-semibold text-blue-500">{curriculumLabel} · {subject || '전체'}</span>
              </summary>
              <div className="mt-2 space-y-2.5">
                <div className="flex flex-wrap gap-2">
                  {CURRICULUM_OPTIONS.map((option) => (
                    <Link
                      key={option.value}
                      href={buildUrl({ curriculum: option.value, subject: '' })}
                      scroll={false}
                      className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                        curriculum === option.value
                          ? 'bg-blue-100 text-blue-600 border border-blue-100'
                          : 'bg-white border border-blue-100 text-gray-600 hover:border-blue-200 hover:text-blue-500'
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildUrl({ subject: '' })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                      !subject
                        ? 'bg-blue-100 text-blue-600 border border-blue-100'
                        : 'bg-white border border-blue-100 text-gray-600 hover:border-blue-200 hover:text-blue-500'
                    }`}
                  >
                    전체
                  </Link>
                  {subjectFilterOptions.map((item) => (
                    <Link
                      key={item}
                      href={buildUrl({ subject: item })}
                      scroll={false}
                      className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                        subject === item
                          ? 'bg-blue-100 text-blue-600 border border-blue-100'
                          : 'bg-white border border-blue-100 text-gray-600 hover:border-blue-200 hover:text-blue-500'
                      }`}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
            )}

            {scope !== 'ebook' && (
            <div className="hidden space-y-2 sm:block">
              <div className="m-scrollbar flex gap-2 overflow-x-auto pb-1">
                {CURRICULUM_OPTIONS.map((option) => (
                  <Link
                    key={option.value}
                    href={buildUrl({ curriculum: option.value, subject: '' })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                      curriculum === option.value
                        ? 'bg-blue-100 text-blue-600 border border-blue-100'
                        : 'bg-white border border-blue-100 text-gray-600 hover:border-blue-200 hover:text-blue-500'
                    }`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
              <div className="m-scrollbar flex gap-2 overflow-x-auto pb-1">
                <Link
                  href={buildUrl({ subject: '' })}
                  scroll={false}
                  className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                    !subject
                      ? 'bg-blue-100 text-blue-600 border border-blue-100'
                      : 'bg-white border border-blue-100 text-gray-600 hover:border-blue-200 hover:text-blue-500'
                  }`}
                >
                  전체
                </Link>
                {subjectFilterOptions.map((item) => (
                  <Link
                    key={item}
                    href={buildUrl({ subject: item })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                      subject === item
                        ? 'bg-blue-100 text-blue-600 border border-blue-100'
                        : 'bg-white border border-blue-100 text-gray-600 hover:border-blue-200 hover:text-blue-500'
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            )}

            <div className="m-scrollbar overflow-x-auto pb-1">
              <div className="inline-flex min-w-max items-center gap-3 sm:w-full sm:min-w-0 sm:justify-between">
                <div className="inline-flex min-w-max items-center rounded-xl border border-blue-100 bg-blue-50/60 p-1">
                  {SORT_OPTIONS.map((opt) => (
                    <Link
                      key={opt.value}
                      href={buildUrl({ sort: opt.value })}
                      scroll={false}
                      className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
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
                      aria-label={opt.label}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        view === opt.value
                          ? 'bg-blue-100 text-blue-600 border border-blue-100'
                          : 'text-gray-500 hover:text-blue-500'
                      }`}
                    >
                      {opt.icon}
                      <span className="sr-only">{opt.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-800 sm:text-[1.45rem]">{scopeTitle}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {query
                  ? <><strong className="text-blue-600">&ldquo;{query}&rdquo;</strong> 검색 결과 {total.toLocaleString()}개</>
                  : <>{total.toLocaleString()}개의 {scopeCountLabel}</>
                }
              </p>
            </div>

            <div className="m-scrollbar -mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
              <div className="inline-flex min-w-max items-end border-b border-gray-300">
                {SCOPE_OPTIONS.map((tab) => {
                  const active = scope === tab.value;
                  return (
                    <Link
                      key={tab.value}
                      href={buildUrl({
                        scope: tab.value,
                        ...(tab.value === 'ebook' ? { subject: '' } : {}),
                      })}
                      scroll={false}
                      className={`relative -mb-px inline-flex h-12 min-w-[7.5rem] items-center justify-center border border-gray-300 px-5 text-[15px] font-bold transition-colors first:rounded-tl-xl last:rounded-tr-xl ${
                        active
                          ? 'z-10 border-b-white bg-white text-gray-900'
                          : 'bg-gray-50 text-gray-500 hover:bg-white hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
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
