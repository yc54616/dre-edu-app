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
  Flame, Clock, Shield, Zap, ArrowRight, BadgeCheck,
} from 'lucide-react';
import SearchInput from './SearchInput';
import type { SortOrder } from 'mongoose';

export const dynamic = 'force-dynamic';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
};

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'easy', label: '쉬운순' },
  { value: 'hard', label: '어려운순' },
] as const;

const sortMap: Record<string, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  popular: { downloadCount: -1 },
  easy: { difficulty: 1 },
  hard: { difficulty: -1 },
};

// Rank badge colours
function rankStyle(rank: number) {
  if (rank === 1) return { box: 'bg-amber-50 border border-amber-200', text: 'text-amber-500' };
  if (rank === 2) return { box: 'bg-gray-50 border border-gray-200', text: 'text-gray-500' };
  if (rank === 3) return { box: 'bg-orange-50 border border-orange-200', text: 'text-orange-500' };
  return { box: 'bg-gray-50 border border-gray-200', text: 'text-gray-400' };
}

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
  const page = Math.max(1, parseInt(sp.page || '1'));
  const subject = sp.subject || '';
  const sort = sp.sort || 'newest';
  const query = sp.q || '';
  const limit = 20;

  await connectMongo();

  // Base filter (no subject/query — used for TOP10, new, stats)
  const baseFilter: Record<string, unknown> = { isActive: true };
  if (currentMode === 'student') {
    baseFilter.fileType = { $in: ['pdf', 'both'] };
    baseFilter.targetAudience = { $in: ['student', 'all'] };
  } else {
    baseFilter.fileType = { $in: ['hwp', 'both'] };
    baseFilter.targetAudience = { $in: ['teacher', 'all'] };
  }

  // Filtered query (adds subject + text search)
  const filter: Record<string, unknown> = { ...baseFilter };
  if (subject) filter.subject = subject;
  if (query) filter.$or = [
    { subject: { $regex: query, $options: 'i' } },
    { topic: { $regex: query, $options: 'i' } },
    { schoolName: { $regex: query, $options: 'i' } },
    { type: { $regex: query, $options: 'i' } },
  ];

  const isSearching = !!(subject || query);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const sortQuery = sortMap[sort] || sortMap.newest;

  const [materials, total, top10, newMaterials, purchaseAgg, totalMaterials] =
    await Promise.all([
      Material.find(filter).sort(sortQuery).skip((page - 1) * limit).limit(limit).lean(),
      Material.countDocuments(filter),
      isSearching ? Promise.resolve([]) : Material.find(baseFilter)
        .sort({ downloadCount: -1 }).limit(10).lean(),
      isSearching ? Promise.resolve([]) : Material.find({
        ...baseFilter,
        createdAt: { $gte: fourteenDaysAgo },
      }).sort({ createdAt: -1 }).limit(8).lean(),
      Material.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, sum: { $sum: '$downloadCount' } } },
      ]),
      Material.countDocuments(baseFilter),
    ]);

  const totalPage = Math.ceil(total / limit);
  const isTeacher = currentMode === 'teacher';
  const totalPurchaseCount: number = (purchaseAgg[0]?.sum as number) ?? 0;

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({
      page: '1',
      ...(subject ? { subject } : {}),
      ...(query ? { q: query } : {}),
      sort,
      ...overrides,
    });
    return `/m/materials?${params.toString()}`;
  };

  return (
    <div className="min-h-screen">

      {/* ── Hero Header ── */}
      <div className="bg-white border-b border-gray-100 relative overflow-hidden">
        {/* 장식 원형 */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-100 opacity-60 pointer-events-none" />
        <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-indigo-100 opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* 모드 배지 */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isTeacher ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]' : 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)]'}`} />
                <span className={`text-[13px] tracking-wide font-extrabold ${isTeacher ? 'text-orange-600' : 'text-blue-600'}`}>
                  {isTeacher ? '교사용 · HWP 전문' : '학생용 · PDF 자료'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-[2.5rem] font-black text-gray-900 leading-tight tracking-tight">
                {isTeacher ? '교사용 프리미엄 자료' : '학생용 추천 자료'}
              </h1>

              {/* 신뢰 통계 */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <BookOpen size={15} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    전체 <strong className="text-gray-900 font-bold">{totalMaterials.toLocaleString()}</strong>개
                  </span>
                </div>

                <div className="w-px h-8 bg-gray-100 hidden sm:block" />

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShoppingBag size={15} className="text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    총 구매 <strong className="text-gray-900 font-bold">{totalPurchaseCount.toLocaleString()}</strong>명
                  </span>
                </div>

                <div className="w-px h-8 bg-gray-100 hidden sm:block" />

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                    <BadgeCheck size={15} className="text-violet-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">DRE 연구소 검수</span>
                </div>
              </div>
            </div>

            {/* 맞춤추천 버튼 */}
            <Link
              href="/m/recommend"
              className="group flex items-center gap-2.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[14px] font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 shrink-0"
            >
              <Sparkles size={16} />
              <span>맞춤추천</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">

        {/* ── 검색창 ── */}
        <Suspense fallback={
          <div className="w-full py-4 bg-white border border-gray-200 rounded-2xl" />
        }>
          <SearchInput defaultValue={query} />
        </Suspense>

        {/* ── 과목 필터 & 정렬 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* 과목 pills */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest shrink-0 mr-1">과목</span>
              <Link
                href={buildUrl({ subject: '' })}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ${!subject
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                  }`}
              >
                전체
              </Link>
              {MATERIAL_SUBJECTS.map((s) => (
                <Link
                  key={s}
                  href={buildUrl({ subject: s })}
                  className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 whitespace-nowrap ${subject === s
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                    }`}
                >
                  {s}
                </Link>
              ))}
            </div>

            {/* 정렬 */}
            <div className="flex items-center gap-1 shrink-0 bg-gray-50 border border-gray-200 rounded-xl p-1">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildUrl({ sort: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${sort === opt.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-700'
                    }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── 🔥 인기 TOP 10 (필터 없을 때만) ── */}
        {!isSearching && top10.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                <Flame size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">인기 TOP 10</h2>
                <p className="text-xs text-gray-400 font-medium">구매 수 기준 랭킹</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {top10.map((m, idx) => {
                const rank = idx + 1;
                const rs = rankStyle(rank);
                const title = buildTitle(m as Parameters<typeof buildTitle>[0]);
                const dc = DIFFICULTY_COLOR[(m as { difficulty: number }).difficulty] || 'blue';

                return (
                  <Link
                    key={(m as { materialId: string }).materialId}
                    href={`/m/materials/${(m as { materialId: string }).materialId}`}
                    className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md p-4 transition-all duration-200"
                  >
                    {/* 순위 */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rs.box}`}>
                      <span className={`text-sm font-black ${rs.text}`}>{rank}</span>
                    </div>

                    {/* 썸네일 */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-blue-50">
                      {(m as { previewImages?: string[] }).previewImages?.[0] ? (
                        <img
                          src={`/uploads/previews/${(m as { previewImages: string[] }).previewImages[0]}`}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          (m as { fileType: string }).fileType === 'hwp'
                            ? 'bg-amber-50'
                            : 'bg-blue-50'
                        }`}>
                          <BookOpen size={20} className={
                            (m as { fileType: string }).fileType === 'hwp'
                              ? 'text-orange-400'
                              : 'text-blue-400'
                          } />
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {title || (m as { subject: string }).subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${diffStyle[dc]}`}>
                          {DIFFICULTY_LABEL[(m as { difficulty: number }).difficulty]}
                        </span>
                        <span className="text-[12px] text-gray-400">{(m as { subject: string }).subject}</span>
                      </div>
                    </div>

                    {/* 구매 수 */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                        <ShoppingBag size={11} />
                        <span>{((m as { downloadCount?: number }).downloadCount ?? 0).toLocaleString()}명</span>
                      </div>
                    </div>

                    {/* 가격 */}
                    <div className="text-right shrink-0">
                      {(m as { isFree?: boolean }).isFree ? (
                        <span className="text-[13px] font-black text-emerald-600">무료</span>
                      ) : (m as { priceProblem?: number }).priceProblem! > 0 ? (
                        <span className="text-[13px] font-black text-gray-900">
                          {(m as { priceProblem: number }).priceProblem.toLocaleString()}원~
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── ✨ 신규 자료 (14일 이내, 필터 없을 때만) ── */}
        {!isSearching && newMaterials.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">신규 자료</h2>
                <p className="text-xs text-gray-400 font-medium">최근 14일 이내 등록</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newMaterials.map((m) => {
                const title = buildTitle(m as Parameters<typeof buildTitle>[0]);
                const dc = DIFFICULTY_COLOR[(m as { difficulty: number }).difficulty] || 'blue';

                return (
                  <Link
                    key={(m as { materialId: string }).materialId}
                    href={`/m/materials/${(m as { materialId: string }).materialId}`}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 overflow-hidden"
                  >
                    {/* 썸네일 */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {(m as { previewImages?: string[] }).previewImages?.[0] ? (
                        <img
                          src={`/uploads/previews/${(m as { previewImages: string[] }).previewImages[0]}`}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full flex flex-col items-center justify-center gap-1.5 ${
                          (m as { fileType: string }).fileType === 'hwp'
                            ? 'bg-gradient-to-br from-amber-50 to-amber-100'
                            : 'bg-gradient-to-br from-blue-50 to-blue-100'
                        }`}>
                          <BookOpen size={24} className={
                            (m as { fileType: string }).fileType === 'hwp'
                              ? 'text-orange-400'
                              : 'text-blue-400'
                          } />
                          <span className="text-[11px] font-bold text-gray-400">{(m as { subject: string }).subject}</span>
                        </div>
                      )}
                      {/* NEW 배지 */}
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                        NEW
                      </span>
                      {/* 가격 배지 */}
                      <div className="absolute bottom-3 right-3">
                        {(m as { isFree?: boolean }).isFree ? (
                          <span className="text-[11px] font-black bg-white/95 border border-gray-100 rounded-xl shadow-sm px-2.5 py-1 text-emerald-600">
                            무료
                          </span>
                        ) : (m as { priceProblem?: number }).priceProblem! > 0 ? (
                          <span className="text-[11px] font-black bg-white/95 border border-gray-100 rounded-xl shadow-sm px-2.5 py-1 text-gray-900">
                            {(m as { priceProblem: number }).priceProblem.toLocaleString()}원~
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffStyle[dc]}`}>
                        {DIFFICULTY_LABEL[(m as { difficulty: number }).difficulty]}
                      </span>
                      <p className="text-[13px] font-bold text-gray-900 truncate mt-2 group-hover:text-blue-600 transition-colors">
                        {title || (m as { subject: string }).subject}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 전체 자료 ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md shadow-gray-500/10">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">전체 자료</h2>
              <p className="text-xs text-gray-400 font-medium">
                {isSearching
                  ? <>{query ? <><strong className="text-gray-700">&ldquo;{query}&rdquo;</strong> 검색 결과 </> : ''}<strong className="text-blue-600">{total.toLocaleString()}</strong>개</>
                  : <><strong className="text-blue-600">{total.toLocaleString()}</strong>개의 자료</>
                }
              </p>
            </div>
          </div>

          {materials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-32">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100">
                <BookOpen size={34} className="text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-400 mb-2">
                {query ? `"${query}" 검색 결과가 없습니다` : '자료가 없습니다'}
              </p>
              {(subject || query) && (
                <Link href="/m/materials" className="mt-3 text-sm text-blue-600 font-semibold hover:underline">
                  전체 보기 →
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {materials.map((m) => {
                  const dc = DIFFICULTY_COLOR[(m as { difficulty: number }).difficulty] || 'blue';
                  const title = buildTitle(m as Parameters<typeof buildTitle>[0]);

                  return (
                    <Link
                      key={(m as { materialId: string }).materialId}
                      href={`/m/materials/${(m as { materialId: string }).materialId}`}
                      className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 overflow-hidden"
                    >
                      {/* 썸네일 */}
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {(m as { previewImages?: string[] }).previewImages?.[0] ? (
                          <img
                            src={`/uploads/previews/${(m as { previewImages: string[] }).previewImages[0]}`}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${
                            (m as { fileType: string }).fileType === 'hwp'
                              ? 'bg-gradient-to-br from-amber-50 to-amber-100/60'
                              : 'bg-gradient-to-br from-blue-50 to-blue-100/60'
                          }`}>
                            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center ${
                              (m as { fileType: string }).fileType === 'hwp'
                                ? 'bg-orange-100/80 text-orange-500'
                                : 'bg-blue-100/80 text-blue-600'
                            }`}>
                              <BookOpen size={26} strokeWidth={2.5} />
                            </div>
                            <span className={`text-[12px] font-black tracking-widest uppercase ${
                              (m as { fileType: string }).fileType === 'hwp'
                                ? 'text-orange-500'
                                : 'text-blue-600'
                            }`}>
                              {(m as { subject: string }).subject}
                            </span>
                          </div>
                        )}

                        {/* 배지들 */}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          {(m as { isFree?: boolean }).isFree && (
                            <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                          {(m as { createdAt?: Date }).createdAt &&
                            (Date.now() - new Date((m as { createdAt: Date }).createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000 && (
                              <span className="text-[10px] font-black bg-blue-600 text-white px-2.5 py-1 rounded-full">
                                NEW
                              </span>
                            )}
                        </div>

                        {/* 가격 배지 (우하단) */}
                        <div className="absolute bottom-3 right-3">
                          {(m as { isFree?: boolean }).isFree ? (
                            <span className="text-[12px] font-black bg-white/95 border border-gray-100 rounded-xl shadow-sm px-3 py-1.5 text-emerald-600">
                              무료
                            </span>
                          ) : (m as { priceProblem?: number }).priceProblem! > 0 ? (
                            <span className="text-[12px] font-black bg-white/95 border border-gray-100 rounded-xl shadow-sm px-3 py-1.5 text-gray-900">
                              {(m as { priceProblem: number }).priceProblem.toLocaleString()}원~
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* 카드 내용 */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${diffStyle[dc]}`}>
                            {DIFFICULTY_LABEL[(m as { difficulty: number }).difficulty]}
                          </span>
                          {(m as { schoolLevel?: string }).schoolLevel && (
                            <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold">
                              {(m as { schoolLevel: string }).schoolLevel}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold truncate max-w-[90px]">
                            {(m as { type: string }).type}
                          </span>
                        </div>

                        <p className="text-[15px] font-bold text-gray-900 truncate leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                          {title || (m as { subject: string }).subject}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {(m as { subject: string }).subject}
                          {(m as { topic?: string }).topic ? ` · ${(m as { topic: string }).topic}` : ''}
                        </p>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <ShoppingBag size={12} className="text-gray-300" />
                            <span>{((m as { downloadCount?: number }).downloadCount ?? 0).toLocaleString()}명 구매</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              {totalPage > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: String(page - 1) })}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-400 transition-colors"
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
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${p === page
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
                          }`}
                      >
                        {p}
                      </Link>
                    ))}
                  {page < totalPage && (
                    <Link
                      href={buildUrl({ page: String(page + 1) })}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-blue-400 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {/* ── 신뢰 배너 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-around gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Shield size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">안전 결제</p>
                <p className="text-xs text-gray-400">SSL 암호화 보안</p>
              </div>
            </div>

            <div className="w-px h-12 bg-gray-100 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">즉시 다운로드</p>
                <p className="text-xs text-gray-400">결제 후 바로 이용</p>
              </div>
            </div>

            <div className="w-px h-12 bg-gray-100 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <BadgeCheck size={18} className="text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">DRE 검수 완료</p>
                <p className="text-xs text-gray-400">전문가 품질 보증</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
