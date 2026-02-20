import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import { MATERIAL_SUBJECTS } from '@/lib/constants/material';
import Link from 'next/link';
import { Suspense } from 'react';
import { BookOpen, Eye, ShoppingBag, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchInput from './SearchInput';
import type { SortOrder } from 'mongoose';

export const dynamic = 'force-dynamic';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  violet:  'bg-violet-100 text-violet-700',
  orange:  'bg-orange-100 text-orange-700',
  red:     'bg-red-100 text-red-700',
};

const SORT_OPTIONS = [
  { value: 'newest',  label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'easy',    label: '쉬운순' },
  { value: 'hard',    label: '어려운순' },
] as const;

const sortMap: Record<string, Record<string, SortOrder>> = {
  newest:  { createdAt: -1 },
  popular: { viewCount: -1 },
  easy:    { difficulty: 1 },
  hard:    { difficulty: -1 },
};

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
  const modeCookie  = cookieStore.get('dre-mode')?.value;
  const currentMode: 'teacher' | 'student' =
    role === 'student' ? 'student' :
    role === 'teacher'
      ? (modeCookie === 'student' ? 'student' : 'teacher')
      : 'student';

  const sp      = await searchParams;
  const page    = Math.max(1, parseInt(sp.page    || '1'));
  const subject = sp.subject || '';
  const sort    = sp.sort    || 'newest';
  const query   = sp.q       || '';
  const limit   = 20;

  await connectMongo();

  const filter: Record<string, unknown> = { isActive: true };
  if (currentMode === 'student') {
    filter.fileType       = { $in: ['pdf', 'both'] };
    filter.targetAudience = { $in: ['student', 'all'] };
  } else {
    filter.fileType       = { $in: ['hwp', 'both'] };
    filter.targetAudience = { $in: ['teacher', 'all'] };
  }
  if (subject) filter.subject = subject;
  if (query)   filter.$or = [
    { subject:    { $regex: query, $options: 'i' } },
    { topic:      { $regex: query, $options: 'i' } },
    { schoolName: { $regex: query, $options: 'i' } },
    { type:       { $regex: query, $options: 'i' } },
  ];

  const sortQuery = sortMap[sort] || sortMap.newest;
  const [materials, total] = await Promise.all([
    Material.find(filter).sort(sortQuery).skip((page - 1) * limit).limit(limit).lean(),
    Material.countDocuments(filter),
  ]);
  const totalPage = Math.ceil(total / limit);
  const isTeacher = currentMode === 'teacher';

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({
      page: '1',
      ...(subject ? { subject } : {}),
      ...(query   ? { q:       query   } : {}),
      sort,
      ...overrides,
    });
    return `/m/materials?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* 모드 배지 */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${isTeacher ? 'bg-amber-500' : 'bg-[var(--color-dre-blue)]'}`} />
                <span className={`text-sm font-bold ${isTeacher ? 'text-amber-600' : 'text-[var(--color-dre-blue)]'}`}>
                  {isTeacher ? '교사용 · HWP' : '학생용 · PDF'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-dre-navy)] leading-tight">
                {isTeacher ? '교사용 자료' : '학생용 자료'}
              </h1>
              <p className="text-base text-gray-400 mt-2">
                {query
                  ? <><strong className="text-gray-700">"{query}"</strong> 검색 결과 <strong className="text-gray-700">{total}</strong>개</>
                  : <>총 <strong className="text-gray-700">{total}</strong>개 자료가 준비되어 있습니다</>
                }
              </p>
            </div>
            <Link
              href="/m/recommend"
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-dre-blue)] text-white rounded-xl text-sm font-bold hover:bg-[var(--color-dre-blue-dark)] transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 shrink-0"
            >
              <Sparkles size={15} />
              맞춤 추천
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">

        {/* ── 검색창 ── */}
        <div className="mb-4">
          <Suspense fallback={
            <div className="w-full py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm" />
          }>
            <SearchInput defaultValue={query} />
          </Suspense>
        </div>

        {/* ── 필터 & 정렬 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* 과목 필터 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">과목</span>
              <Link
                href={buildUrl({ subject: '' })}
                className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-all ${
                  !subject
                    ? 'bg-[var(--color-dre-navy)] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                전체
              </Link>
              {MATERIAL_SUBJECTS.map((s) => (
                <Link
                  key={s}
                  href={buildUrl({ subject: s })}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    subject === s
                      ? 'bg-[var(--color-dre-blue)] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </Link>
              ))}
            </div>

            {/* 정렬 */}
            <div className="flex items-center gap-1 shrink-0 bg-gray-100 rounded-xl p-1">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildUrl({ sort: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    sort === opt.value
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

        {/* ── 자료 목록 ── */}
        {materials.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100">
              <BookOpen size={34} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-400 mb-2">
              {query ? `"${query}" 검색 결과가 없습니다` : '자료가 없습니다'}
            </p>
            {(subject || query) && (
              <Link href="/m/materials" className="mt-3 text-sm text-[var(--color-dre-blue)] font-semibold hover:underline">
                전체 보기 →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {materials.map((m) => {
                const dc    = DIFFICULTY_COLOR[m.difficulty] || 'blue';
                const title = [
                  m.schoolName,
                  m.year        ? `${m.year}년`        : '',
                  m.gradeNumber ? `${m.gradeNumber}학년` : '',
                  m.semester    ? `${m.semester}학기`   : '',
                  m.subject,
                  m.topic,
                ].filter(Boolean).join(' ');

                const isNew = m.createdAt
                  ? (Date.now() - new Date(m.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000
                  : false;

                return (
                  <Link
                    key={m.materialId}
                    href={`/m/materials/${m.materialId}`}
                    className="block bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[var(--color-dre-blue)]/30 transition-all duration-300 overflow-hidden group relative"
                  >
                    {/* 좌측 호버 포인트 */}
                    <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[var(--color-dre-blue)] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                    {/* 썸네일 */}
                    <div className="aspect-[4/3] overflow-hidden flex items-center justify-center relative">
                      {m.previewImages?.[0] ? (
                        <img
                          src={`/uploads/previews/${m.previewImages[0]}`}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${
                          m.fileType === 'hwp'
                            ? 'bg-gradient-to-br from-amber-50 to-amber-100/60'
                            : 'bg-gradient-to-br from-blue-50 to-blue-100/60'
                        }`}>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            m.fileType === 'hwp' ? 'bg-amber-100' : 'bg-blue-100'
                          }`}>
                            <BookOpen size={24} className={m.fileType === 'hwp' ? 'text-amber-400' : 'text-blue-400'} />
                          </div>
                          <span className={`text-sm font-black tracking-widest ${
                            m.fileType === 'hwp' ? 'text-amber-400' : 'text-blue-400'
                          }`}>
                            {m.subject}
                          </span>
                        </div>
                      )}

                      {/* 상단 배지들 */}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {m.isFree && (
                          <span className="text-xs font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                            FREE
                          </span>
                        )}
                        {isNew && (
                          <span className="text-xs font-black bg-[var(--color-dre-blue)] text-white px-2.5 py-1 rounded-full shadow-sm">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* 가격 배지 (우하단) */}
                      <div className="absolute bottom-3 right-3">
                        {m.isFree ? (
                          <span className="text-sm font-black bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-md">
                            무료
                          </span>
                        ) : m.priceProblem > 0 ? (
                          <span className="text-sm font-black bg-[var(--color-dre-navy)] text-white px-3 py-1.5 rounded-xl shadow-md">
                            {m.priceProblem.toLocaleString()}원~
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* 카드 내용 */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${diffStyle[dc]}`}>
                          {DIFFICULTY_LABEL[m.difficulty]}
                        </span>
                        {m.schoolLevel && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">{m.schoolLevel}</span>
                        )}
                        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full truncate max-w-[80px] font-medium">{m.type}</span>
                      </div>

                      <p className="text-base font-bold text-gray-900 truncate leading-snug mb-1">{title || m.subject}</p>
                      <p className="text-sm text-gray-400 truncate">{m.subject}{m.topic ? ` · ${m.topic}` : ''}</p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <ShoppingBag size={12} className="text-gray-300" />
                          <span>{(m.downloadCount ?? 0).toLocaleString()}명 구매</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                          <Eye size={11} />
                          <span>{(m.viewCount ?? 0).toLocaleString()}</span>
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
                  <Link href={buildUrl({ page: String(page - 1) })} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-[var(--color-dre-blue)] transition-colors">
                    <ChevronLeft size={18} />
                  </Link>
                )}
                {Array.from({ length: totalPage }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <Link
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? 'bg-[var(--color-dre-blue)] text-white shadow-md shadow-blue-200'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-dre-blue)]/50'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                {page < totalPage && (
                  <Link href={buildUrl({ page: String(page + 1) })} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-[var(--color-dre-blue)] transition-colors">
                    <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
