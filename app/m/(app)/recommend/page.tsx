import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import UserSkill from '@/lib/models/UserSkill';
import {
  getRecommendations,
  getSimilarUserRecs,
  getTeacherRecommendations,
  getSimilarTeacherRecs,
  ratingToLevel,
} from '@/lib/recommendation';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, BookOpen, ShoppingBag, TrendingUp, Star, Users, LayoutGrid, Rows3 } from 'lucide-react';
import { buildMaterialTitle, buildMaterialSubline } from '@/lib/material-display';

export const dynamic = 'force-dynamic';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
};

type RecommendMaterial = {
  materialId: string;
  sourceCategory?: string;
  publisher?: string | null;
  bookTitle?: string | null;
  subject: string;
  topic?: string | null;
  schoolName?: string | null;
  year?: number | null;
  gradeNumber?: number | null;
  semester?: number | null;
  difficulty: number;
  type: string;
  isFree: boolean;
  priceProblem: number;
  priceEtc?: number;
  downloadCount?: number;
  previewImages?: string[];
};

function RecommendMaterialCard({
  m,
  view,
  badgeLabel,
  badgeIcon,
}: {
  m: RecommendMaterial;
  view: 'grid' | 'list';
  badgeLabel: string;
  badgeIcon: React.ReactNode;
}) {
  const dc = DIFFICULTY_COLOR[m.difficulty] || 'blue';
  const title = buildMaterialTitle(m);
  const subline = buildMaterialSubline(m) || m.subject;

  return (
    <Link
      href={`/m/materials/${m.materialId}`}
      className={
        view === 'list'
          ? 'group m-detail-card hover:border-blue-200 hover:shadow-lg transition-all duration-200 p-3 sm:p-4 flex gap-4'
          : 'group m-detail-card hover:border-blue-200 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200 overflow-hidden'
      }
    >
      <div
        className={
          view === 'list'
            ? 'relative w-28 sm:w-40 shrink-0 overflow-hidden rounded-xl border border-gray-100'
            : 'aspect-[4/3] overflow-hidden relative'
        }
      >
        <div className={view === 'list' ? 'relative aspect-[4/3]' : 'relative h-full w-full'}>
          {m.previewImages?.[0] ? (
            <Image
              src={`/uploads/previews/${m.previewImages[0]}`}
              alt={title}
              fill
              sizes={view === 'list' ? '(max-width: 640px) 112px, 160px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-sky-50">
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 flex items-center justify-center">
                <BookOpen size={26} className="text-blue-400" strokeWidth={2.5} />
              </div>
              <span className="text-[12px] font-extrabold text-blue-400 uppercase tracking-widest">{m.subject}</span>
            </div>
          )}

          {view === 'grid' && (
            <span className="absolute top-3 right-3 text-[10px] font-extrabold text-blue-600 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              {badgeIcon}
              {badgeLabel}
            </span>
          )}

          {view === 'grid' && (
            <div className="absolute bottom-3 right-3">
              {m.isFree ? (
                <span className="text-[11px] font-extrabold bg-white/95 border border-gray-100 rounded-xl shadow-sm px-2.5 py-1 text-blue-500">무료</span>
              ) : (m.priceProblem + (m.priceEtc || 0)) > 0 ? (
                <span className="text-[11px] font-extrabold bg-white/95 border border-gray-100 rounded-xl shadow-sm px-2.5 py-1 text-gray-900">
                  {(m.priceProblem + (m.priceEtc || 0)).toLocaleString()}원~
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className={view === 'list' ? 'min-w-0 flex-1 flex flex-col' : 'p-5'}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${diffStyle[dc]}`}>
            {DIFFICULTY_LABEL[m.difficulty]}
          </span>
          <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold truncate max-w-[120px]">
            {m.type}
          </span>
          {view === 'list' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-extrabold text-blue-600">
              {badgeIcon}
              {badgeLabel}
            </span>
          )}
        </div>

        <p className={`${view === 'list' ? 'text-base' : 'text-[15px]'} font-bold text-gray-900 truncate leading-snug mb-1 group-hover:text-blue-500 transition-colors`}>
          {title || m.subject}
        </p>
        <p className="text-sm text-gray-500 truncate">{subline}</p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <ShoppingBag size={12} className="text-gray-300" />
            <span>{(m.downloadCount ?? 0).toLocaleString()}명 구매</span>
          </div>

          {view === 'list' && (
            <>
              {m.isFree ? (
                <span className="text-[11px] font-extrabold bg-blue-50 border border-blue-100 rounded-xl px-2.5 py-1 text-blue-500">
                  무료
                </span>
              ) : (m.priceProblem + (m.priceEtc || 0)) > 0 ? (
                <span className="text-[11px] font-extrabold bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-gray-900">
                  {(m.priceProblem + (m.priceEtc || 0)).toLocaleString()}원~
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function RecommendPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const headerStore = await headers();
  const userAgent = headerStore.get('user-agent') || '';
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
  const defaultView: 'grid' | 'list' = isMobileDevice ? 'list' : 'grid';
  const view: 'grid' | 'list' = (sp.view === 'list' || sp.view === 'grid') ? sp.view : defaultView;

  const session = await auth();
  if (!session) redirect('/m');

  const user = session.user as { id?: string; role?: string };
  const userId = user.id;
  const role = user.role || 'student';
  if (!userId) redirect('/m');

  const cookieStore = await cookies();
  const modeCookie = cookieStore.get('dre-mode')?.value;
  const currentMode: 'teacher' | 'student' =
    role === 'student'
      ? 'student'
      : role === 'teacher'
        ? (modeCookie === 'student' ? 'student' : 'teacher')
        : 'student';
  const isTeacherMode = currentMode === 'teacher';

  await connectMongo();

  let overallRating = 1000;
  const topicSkills: { topic: string; rating: number; attempts: number }[] = [];

  if (!isTeacherMode) {
    const userSkill = await UserSkill.findOne({ userId }).lean();
    overallRating = (userSkill as { overallRating?: number })?.overallRating ?? 1000;
    const rawSkills = (userSkill as unknown as { topicSkills?: Record<string, { rating: number; attempts: number }> } | null)?.topicSkills;
    if (rawSkills && typeof rawSkills === 'object') {
      for (const [topic, skill] of Object.entries(rawSkills)) {
        topicSkills.push({ topic, rating: skill.rating, attempts: skill.attempts });
      }
      topicSkills.sort((a, b) => a.rating - b.rating);
    }
  }

  const level = ratingToLevel(overallRating);

  const [materialsRaw, similarRecsRaw] = await Promise.all([
    isTeacherMode ? getTeacherRecommendations(userId, 12) : getRecommendations(userId, 12),
    isTeacherMode ? getSimilarTeacherRecs(userId, 6) : getSimilarUserRecs(userId, 6),
  ]);
  const materials = materialsRaw as RecommendMaterial[];
  const similarRecs = similarRecsRaw as RecommendMaterial[];

  const levelColors: Record<string, string> = {
    red: 'text-slate-600 bg-slate-50 border-slate-200',
    orange: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    violet: 'text-sky-600 bg-sky-50 border-sky-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    gray: 'text-gray-500 bg-gray-100 border-gray-200',
  };

  const heroKicker = isTeacherMode ? '수업 맞춤 추천' : 'ELO 맞춤 추천';
  const heroTitle = isTeacherMode ? '선생님을 위한 추천 자료' : '나에게 딱 맞는 자료';
  const heroSubtitle = isTeacherMode
    ? '과목/학교급/최근 활용 패턴을 바탕으로 수업 준비에 맞는 자료를 추천합니다.'
    : 'ELO 레이팅을 바탕으로 현재 실력에 맞는 자료를 가장 효율적으로 추천합니다.';
  const primarySectionTitle = isTeacherMode ? '수업 준비 맞춤 추천' : 'ELO 맞춤 추천';
  const primarySectionDesc = isTeacherMode ? '최근 활용 패턴 기반 교사용 추천' : '현재 실력에 최적화된 자료';
  const primaryBadgeLabel = isTeacherMode ? '교사 추천' : '강력 추천';
  const primarySummaryLabel = isTeacherMode
    ? `교사용 맞춤 추천 자료 ${materials.length}개`
    : `ELO 레이팅 기반 맞춤 추천 자료 ${materials.length}개`;
  const emptyTitle = isTeacherMode ? '추천할 교사용 자료가 없습니다' : '추천할 자료가 없습니다';
  const emptyDesc = isTeacherMode
    ? '교사용 자료를 활용할수록 수업 맞춤 추천 정확도가 높아집니다.'
    : '자료를 학습하고 난이도 피드백을 남기면 맞춤 추천이 시작됩니다';
  const emptyLink = isTeacherMode ? '교사용 자료에서 시작하기 →' : '자료 목록에서 시작하기 →';
  const similarSectionTitle = isTeacherMode ? '비슷한 교사의 선택' : '비슷한 수준 학생들의 선택';
  const similarSectionDesc = isTeacherMode ? '유사 활용 패턴 교사 추천' : '협업 필터링 추천';
  const similarBadgeLabel = isTeacherMode ? '함께 선택' : '함께 구매';
  const buildUrl = (nextView: 'grid' | 'list') => {
    const params = new URLSearchParams();
    if (nextView !== defaultView) params.set('view', nextView);
    const qs = params.toString();
    return qs ? `/m/recommend?${qs}` : '/m/recommend';
  };

  return (
    <div className="m-detail-page min-h-screen">

      {/* ── 페이지 헤더 ── */}
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-6 sm:py-9">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-500" />
                <span className="text-[13px] tracking-wide font-extrabold text-blue-500">{heroKicker}</span>
              </div>
              <h1 className="m-detail-title">
                {heroTitle}
              </h1>
              <p className="mt-2.5 text-[14px] font-medium text-gray-500 sm:text-[15px]">
                {heroSubtitle}
              </p>
            </div>

            {!isTeacherMode ? (
              <div className={`flex w-full max-w-none shrink-0 items-center justify-between rounded-2xl border bg-white px-4 py-3 sm:max-w-[300px] sm:flex-col sm:items-center sm:justify-center sm:px-6 sm:py-5 md:w-auto md:max-w-none ${levelColors[level.color] || levelColors.blue}`}>
                <div className="flex flex-col sm:items-center">
                  <div className="mb-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < level.star ? 'fill-current' : 'opacity-30'}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold opacity-90">{level.label} 레벨</p>
                </div>
                <p className="text-[2rem] font-extrabold leading-none sm:mt-1 sm:text-2xl">{overallRating}</p>
              </div>
            ) : (
              <div className="flex w-full max-w-none shrink-0 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 sm:max-w-[300px] sm:flex-col sm:items-center sm:justify-center sm:px-6 sm:py-5 md:w-auto md:max-w-none">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-500">
                  <Users size={18} />
                </span>
                <div className="min-w-0 sm:text-center">
                  <p className="text-sm font-extrabold text-blue-600">교사 모드</p>
                  <p className="text-xs text-gray-500 mt-0.5">수업 활용 데이터 기반 추천</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-7xl py-8 space-y-8">

        {/* 주제별 약점 분석 */}
        {!isTeacherMode && topicSkills.length > 0 && (
          <div className="m-detail-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-gray-500" />
              <p className="text-sm font-bold text-gray-700">주제별 실력 분석</p>
              <span className="text-xs text-gray-400">(낮을수록 보완 필요)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {topicSkills.slice(0, 10).map(({ topic, rating }) => {
                const lvl = ratingToLevel(rating);
                return (
                  <div
                    key={topic}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[14px] font-bold ${levelColors[lvl.color] || levelColors.blue}`}
                  >
                    <span>{topic}</span>
                    <span className="font-mono opacity-70 bg-white/60 px-1.5 rounded text-xs">{rating}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-start sm:justify-end">
          <div className="inline-flex items-center rounded-xl border border-blue-100 bg-white p-1">
            <Link
              href={buildUrl('grid')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                view === 'grid'
                  ? 'bg-blue-100 text-blue-600 border border-blue-100'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <LayoutGrid size={14} />
              카드
            </Link>
            <Link
              href={buildUrl('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                view === 'list'
                  ? 'bg-blue-100 text-blue-600 border border-blue-100'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <Rows3 size={14} />
              리스트
            </Link>
          </div>
        </div>

        {/* ELO 추천 자료 섹션 */}
        <section>
            <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center border border-blue-100 shadow-sm shadow-blue-100/60">
              <Sparkles size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">{primarySectionTitle}</h2>
              <p className="text-xs text-gray-400 font-medium">{primarySectionDesc}</p>
            </div>
          </div>

          {materials.length === 0 ? (
            <div className="m-detail-card flex flex-col items-center justify-center py-20 sm:py-32">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                <BookOpen size={34} className="text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-400 mb-2">{emptyTitle}</p>
              <p className="text-base text-gray-500 mb-6">{emptyDesc}</p>
              <Link href="/m/materials" className="text-base text-blue-500 font-semibold hover:underline">
                {emptyLink}
              </Link>
            </div>
          ) : (
            <>
              <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-3'}>
                {materials.map((m) => (
                  <RecommendMaterialCard
                    key={m.materialId}
                    m={m}
                    view={view}
                    badgeLabel={primaryBadgeLabel}
                    badgeIcon={<Sparkles size={10} />}
                  />
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <p className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[15px] text-blue-500 font-semibold">
                  <Sparkles size={14} />
                  {primarySummaryLabel}
                </p>
              </div>
            </>
          )}
        </section>

        {/* ── 비슷한 수준 학생들의 선택 ── */}
        {similarRecs.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center border border-blue-100 shadow-sm shadow-blue-100/60">
                <Users size={18} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">{similarSectionTitle}</h2>
                <p className="text-xs text-gray-400 font-medium">{similarSectionDesc}</p>
              </div>
            </div>

            <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-3'}>
              {similarRecs.map((m) => (
                <RecommendMaterialCard
                  key={m.materialId}
                  m={m}
                  view={view}
                  badgeLabel={similarBadgeLabel}
                  badgeIcon={<Users size={10} />}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
