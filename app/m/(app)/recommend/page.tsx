import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import UserSkill from '@/lib/models/UserSkill';
import { getRecommendations, getSimilarUserRecs, ratingToLevel } from '@/lib/recommendation';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import Link from 'next/link';
import { Sparkles, BookOpen, Eye, Download, TrendingUp, Star, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  violet:  'bg-violet-100 text-violet-700',
  orange:  'bg-orange-100 text-orange-700',
  red:     'bg-red-100 text-red-700',
};

export default async function RecommendPage() {
  const session = await auth();
  if (!session) redirect('/m');

  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect('/m');

  await connectMongo();

  const userSkill = await UserSkill.findOne({ userId }).lean();
  const overallRating = (userSkill as { overallRating?: number })?.overallRating ?? 1000;
  const level = ratingToLevel(overallRating);

  // lean() 호출 시 Mongoose Map → 일반 객체로 변환됨 → Object.entries() 사용
  const rawSkills = (userSkill as unknown as { topicSkills?: Record<string, { rating: number; attempts: number }> } | null)?.topicSkills;
  const topicSkills: { topic: string; rating: number; attempts: number }[] = [];
  if (rawSkills && typeof rawSkills === 'object') {
    for (const [topic, skill] of Object.entries(rawSkills)) {
      topicSkills.push({ topic, rating: skill.rating, attempts: skill.attempts });
    }
    topicSkills.sort((a, b) => a.rating - b.rating); // 약점 순 정렬
  }

  const [materials, similarRecs] = await Promise.all([
    getRecommendations(userId, 12),
    getSimilarUserRecs(userId, 6),
  ]);

  const levelColors: Record<string, string> = {
    red:    'text-red-500 bg-red-50 border-red-100',
    orange: 'text-orange-500 bg-orange-50 border-orange-100',
    violet: 'text-violet-500 bg-violet-50 border-violet-100',
    blue:   'text-blue-500 bg-blue-50 border-blue-100',
    gray:   'text-gray-500 bg-gray-100 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[var(--color-dre-blue)]" />
                <span className="text-sm font-bold text-[var(--color-dre-blue)]">ELO 맞춤 추천</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-dre-navy)] leading-tight">
                나에게 딱 맞는 자료
              </h1>
              <p className="text-base text-gray-400 mt-2">
                ELO 레이팅 기반으로 현재 실력에 맞는 자료를 추천합니다
              </p>
            </div>

            {/* 레이팅 배지 */}
            <div className={`shrink-0 flex flex-col items-center px-5 py-4 rounded-2xl border ${levelColors[level.color] || levelColors.blue}`}>
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

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">

        {/* 주제별 약점 분석 */}
        {topicSkills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${levelColors[lvl.color] || levelColors.blue}`}
                  >
                    <span>{topic}</span>
                    <span className="font-mono opacity-70">{rating}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 자료 목록 */}
        {materials.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100">
              <BookOpen size={34} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-400 mb-2">추천할 자료가 없습니다</p>
            <p className="text-sm text-gray-400 mb-6">자료를 학습하고 난이도 피드백을 남기면 맞춤 추천이 시작됩니다</p>
            <Link href="/m/materials" className="text-sm text-[var(--color-dre-blue)] font-semibold hover:underline">
              자료 목록에서 시작하기 →
            </Link>
          </div>
        ) : (
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

              return (
                <Link
                  key={m.materialId}
                  href={`/m/materials/${m.materialId}`}
                  className="block bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[var(--color-dre-blue)]/20 transition-all duration-300 overflow-hidden group"
                >
                  <div className="aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center relative">
                    {m.previewImages?.[0] ? (
                      <img
                        src={`/uploads/previews/${m.previewImages[0]}`}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                          <BookOpen size={24} className="text-blue-300" />
                        </div>
                      </div>
                    )}
                    {m.isFree && (
                      <span className="absolute top-3 left-3 text-xs font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                        FREE
                      </span>
                    )}
                    {/* 추천 배지 */}
                    <span className="absolute top-3 right-3 text-[10px] font-black bg-[var(--color-dre-blue)] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={9} />추천
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${diffStyle[dc]}`}>
                        {DIFFICULTY_LABEL[m.difficulty]}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full truncate max-w-[90px] font-medium">{m.type}</span>
                    </div>

                    <p className="text-base font-bold text-gray-900 truncate leading-snug mb-1">{title || m.subject}</p>
                    <p className="text-sm text-gray-400 truncate">{m.subject}{m.topic ? ` · ${m.topic}` : ''}</p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                        <span className="flex items-center gap-1"><Eye size={12} />{m.viewCount ?? 0}</span>
                        <span className="flex items-center gap-1"><Download size={12} />{m.downloadCount ?? 0}</span>
                      </div>
                      {m.isFree ? (
                        <span className="text-sm font-black text-emerald-500">무료</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">
                          {m.priceProblem > 0 ? `${m.priceProblem.toLocaleString()}원~` : '가격 문의'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {materials.length > 0 && (
          <p className="text-center text-sm text-gray-300 mt-8 font-medium">
            ELO 레이팅 기반 맞춤 추천 자료 {materials.length}개
          </p>
        )}

        {/* ── 비슷한 수준 학생들의 선택 ── */}
        {similarRecs.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-violet-500 rounded-full" />
              <div className="flex items-center gap-2">
                <Users size={16} className="text-violet-500" />
                <h2 className="text-xl font-bold text-gray-900">비슷한 수준 학생들의 선택</h2>
              </div>
              <span className="text-xs font-bold text-violet-500 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
                협업 추천
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {similarRecs.map((m) => {
                const dc    = DIFFICULTY_COLOR[m.difficulty] || 'blue';
                const title = [
                  m.schoolName,
                  m.year        ? `${m.year}년`        : '',
                  m.gradeNumber ? `${m.gradeNumber}학년` : '',
                  m.semester    ? `${m.semester}학기`   : '',
                  m.subject,
                  m.topic,
                ].filter(Boolean).join(' ');

                return (
                  <Link
                    key={m.materialId}
                    href={`/m/materials/${m.materialId}`}
                    className="block bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-violet-200 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center relative">
                      {m.previewImages?.[0] ? (
                        <img
                          src={`/uploads/previews/${m.previewImages[0]}`}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
                            <BookOpen size={24} className="text-violet-300" />
                          </div>
                        </div>
                      )}
                      {m.isFree && (
                        <span className="absolute top-3 left-3 text-xs font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                          FREE
                        </span>
                      )}
                      {/* 함께 구매 배지 */}
                      <span className="absolute top-3 right-3 text-[10px] font-black bg-violet-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Users size={9} />함께 구매
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${diffStyle[dc]}`}>
                          {DIFFICULTY_LABEL[m.difficulty]}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full truncate max-w-[90px] font-medium">{m.type}</span>
                      </div>

                      <p className="text-base font-bold text-gray-900 truncate leading-snug mb-1">{title || m.subject}</p>
                      <p className="text-sm text-gray-400 truncate">{m.subject}{m.topic ? ` · ${m.topic}` : ''}</p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                          <span className="flex items-center gap-1"><Eye size={12} />{m.viewCount ?? 0}</span>
                          <span className="flex items-center gap-1"><Download size={12} />{m.downloadCount ?? 0}</span>
                        </div>
                        {m.isFree ? (
                          <span className="text-sm font-black text-emerald-500">무료</span>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            {m.priceProblem > 0 ? `${m.priceProblem.toLocaleString()}원~` : '가격 문의'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
