import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import UserSkill from '@/lib/models/UserSkill';
import { getRecommendations, getSimilarUserRecs, ratingToLevel } from '@/lib/recommendation';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import Link from 'next/link';
import { Sparkles, BookOpen, ShoppingBag, TrendingUp, Star, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
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

export default async function RecommendPage() {
  const session = await auth();
  if (!session) redirect('/m');

  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect('/m');

  await connectMongo();

  const userSkill = await UserSkill.findOne({ userId }).lean();
  const overallRating = (userSkill as { overallRating?: number })?.overallRating ?? 1000;
  const level = ratingToLevel(overallRating);

  const rawSkills = (userSkill as unknown as { topicSkills?: Record<string, { rating: number; attempts: number }> } | null)?.topicSkills;
  const topicSkills: { topic: string; rating: number; attempts: number }[] = [];
  if (rawSkills && typeof rawSkills === 'object') {
    for (const [topic, skill] of Object.entries(rawSkills)) {
      topicSkills.push({ topic, rating: skill.rating, attempts: skill.attempts });
    }
    topicSkills.sort((a, b) => a.rating - b.rating);
  }

  const [materials, similarRecs] = await Promise.all([
    getRecommendations(userId, 12),
    getSimilarUserRecs(userId, 6),
  ]);

  const levelColors: Record<string, string> = {
    red: 'text-red-500 bg-red-50 border-red-100',
    orange: 'text-orange-500 bg-orange-50 border-orange-100',
    violet: 'text-violet-500 bg-violet-50 border-violet-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    gray: 'text-gray-500 bg-gray-100 border-gray-200',
  };

  return (
    <div className="min-h-screen">

      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-[13px] tracking-wide font-extrabold text-blue-600">ELO 맞춤 추천</span>
              </div>
              <h1 className="text-3xl sm:text-[2.5rem] font-black text-gray-900 leading-tight tracking-tight">
                나에게 딱 맞는 자료
              </h1>
              <p className="text-[15px] font-medium text-gray-400 mt-2.5">
                ELO 레이팅 기반으로 현재 실력에 맞는 최고 효율의 자료를 큐레이션합니다.
              </p>
            </div>

            {/* 레이팅 배지 */}
            <div className={`shrink-0 flex flex-col items-center px-6 py-5 rounded-2xl border bg-white ${levelColors[level.color] || levelColors.blue}`}>
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < level.star ? 'fill-current' : 'opacity-30'}
                  />
                ))}
              </div>
              <p className="text-2xl font-black">{overallRating}</p>
              <p className="text-xs font-bold mt-0.5">{level.label} 레벨</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">

        {/* 주제별 약점 분석 */}
        {topicSkills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
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
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[13px] font-bold ${levelColors[lvl.color] || levelColors.blue}`}
                  >
                    <span>{topic}</span>
                    <span className="font-mono opacity-70 bg-white/60 px-1.5 rounded text-xs">{rating}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ELO 추천 자료 섹션 */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">ELO 맞춤 추천</h2>
              <p className="text-xs text-gray-400 font-medium">현재 실력에 최적화된 자료</p>
            </div>
          </div>

          {materials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-32">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                <BookOpen size={34} className="text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-400 mb-2">추천할 자료가 없습니다</p>
              <p className="text-sm text-gray-400 mb-6">자료를 학습하고 난이도 피드백을 남기면 맞춤 추천이 시작됩니다</p>
              <Link href="/m/materials" className="text-sm text-blue-600 font-semibold hover:underline">
                자료 목록에서 시작하기 →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {materials.map((m) => {
                  const dc = DIFFICULTY_COLOR[m.difficulty] || 'blue';
                  const title = buildTitle(m);

                  return (
                    <Link
                      key={m.materialId}
                      href={`/m/materials/${m.materialId}`}
                      className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 overflow-hidden"
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {m.previewImages?.[0] ? (
                          <img
                            src={`/uploads/previews/${m.previewImages[0]}`}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                              <BookOpen size={26} className="text-blue-500" strokeWidth={2.5} />
                            </div>
                            <span className="text-[12px] font-black text-blue-500 uppercase tracking-widest">{m.subject}</span>
                          </div>
                        )}
                        {m.isFree && (
                          <span className="absolute top-3 left-3 text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                            FREE
                          </span>
                        )}
                        <span className="absolute top-3 right-3 text-[10px] font-black bg-blue-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Sparkles size={10} />강력 추천
                        </span>
                        {/* 가격 배지 */}
                        <div className="absolute bottom-3 right-3">
                          {m.isFree ? (
                            <span className="text-[11px] font-black bg-white/95 border border-gray-100 rounded-xl shadow-sm px-2.5 py-1 text-emerald-600">무료</span>
                          ) : m.priceProblem > 0 ? (
                            <span className="text-[11px] font-black bg-white/95 border border-gray-100 rounded-xl shadow-sm px-2.5 py-1 text-gray-900">
                              {m.priceProblem.toLocaleString()}원~
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${diffStyle[dc]}`}>
                            {DIFFICULTY_LABEL[m.difficulty]}
                          </span>
                          <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold truncate max-w-[90px]">{m.type}</span>
                        </div>

                        <p className="text-[15px] font-bold text-gray-900 truncate leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                          {title || m.subject}
                        </p>
                        <p className="text-sm text-gray-400 truncate">{m.subject}{m.topic ? ` · ${m.topic}` : ''}</p>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <ShoppingBag size={12} className="text-gray-300" />
                            <span>{(m.downloadCount ?? 0).toLocaleString()}명 구매</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="flex justify-center mt-6">
                <p className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[14px] text-blue-600 font-bold">
                  <Sparkles size={14} />
                  ELO 레이팅 기반 맞춤 추천 자료 {materials.length}개
                </p>
              </div>
            </>
          )}
        </section>

        {/* ── 비슷한 수준 학생들의 선택 ── */}
        {similarRecs.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">비슷한 수준 학생들의 선택</h2>
                <p className="text-xs text-gray-400 font-medium">협업 필터링 추천</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {similarRecs.map((m) => {
                const dc = DIFFICULTY_COLOR[m.difficulty] || 'blue';
                const title = buildTitle(m);

                return (
                  <Link
                    key={m.materialId}
                    href={`/m/materials/${m.materialId}`}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 overflow-hidden"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {m.previewImages?.[0] ? (
                        <img
                          src={`/uploads/previews/${m.previewImages[0]}`}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-50 to-indigo-100">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                            <BookOpen size={26} className="text-indigo-500" strokeWidth={2.5} />
                          </div>
                          <span className="text-[12px] font-black text-indigo-500 uppercase tracking-widest">{m.subject}</span>
                        </div>
                      )}
                      {m.isFree && (
                        <span className="absolute top-3 left-3 text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                          FREE
                        </span>
                      )}
                      <span className="absolute top-3 right-3 text-[10px] font-black bg-indigo-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Users size={10} />함께 구매
                      </span>
                      <div className="absolute bottom-3 right-3">
                        {m.isFree ? (
                          <span className="text-[11px] font-black bg-white/95 border border-gray-100 rounded-xl shadow-sm px-2.5 py-1 text-emerald-600">무료</span>
                        ) : m.priceProblem > 0 ? (
                          <span className="text-[11px] font-black bg-white/95 border border-gray-100 rounded-xl shadow-sm px-2.5 py-1 text-gray-900">
                            {m.priceProblem.toLocaleString()}원~
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${diffStyle[dc]}`}>
                          {DIFFICULTY_LABEL[m.difficulty]}
                        </span>
                        <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-bold truncate max-w-[90px]">{m.type}</span>
                      </div>

                      <p className="text-[15px] font-bold text-gray-900 truncate leading-snug mb-1 group-hover:text-indigo-600 transition-colors">
                        {title || m.subject}
                      </p>
                      <p className="text-sm text-gray-400 truncate">{m.subject}{m.topic ? ` · ${m.topic}` : ''}</p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <ShoppingBag size={12} className="text-gray-300" />
                          <span>{(m.downloadCount ?? 0).toLocaleString()}명 구매</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
