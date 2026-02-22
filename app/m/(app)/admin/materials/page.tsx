import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import {
  FILE_TYPES,
  TARGET_AUDIENCES,
  MATERIAL_SUBJECTS,
  FILE_TYPE_LABEL,
  TARGET_AUDIENCE_LABEL,
} from '@/lib/constants/material';
import Link from 'next/link';
import { PlusCircle, Edit2, Eye, Download, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import DeleteButton from './DeleteButton';
import PreviewModal from './PreviewModal';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-100 text-violet-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
};

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  views_desc: { viewCount: -1 },
  downloads_desc: { downloadCount: -1 },
};

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'views_desc', label: '조회 많은순' },
  { value: 'downloads_desc', label: '다운 많은순' },
] as const;

export default async function TeacherMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== 'admin')) redirect('/m/materials');

  const isAdmin = role === 'admin';
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const subject = MATERIAL_SUBJECTS.includes(sp.subject as typeof MATERIAL_SUBJECTS[number]) ? sp.subject : '';
  const difficulty = ['1', '2', '3', '4', '5'].includes(sp.difficulty || '') ? sp.difficulty : '';
  const fileType = FILE_TYPES.includes(sp.fileType as typeof FILE_TYPES[number]) ? sp.fileType : '';
  const targetAudience = TARGET_AUDIENCES.includes(sp.targetAudience as typeof TARGET_AUDIENCES[number]) ? sp.targetAudience : '';
  const active = ['active', 'inactive'].includes(sp.active || '') ? sp.active : '';
  const sort = SORT_OPTIONS.some((opt) => opt.value === sp.sort) ? sp.sort : 'newest';
  const page = Math.max(1, parseInt(sp.page || '1'));
  const limit = 30;
  const hasFilter = !!(q || subject || difficulty || fileType || targetAudience || active || sort !== 'newest');

  const filter: Record<string, unknown> = {};
  if (subject) filter.subject = subject;
  if (difficulty) filter.difficulty = Number(difficulty);
  if (fileType) filter.fileType = fileType;
  if (targetAudience) filter.targetAudience = targetAudience;
  if (active) filter.isActive = active === 'active';
  if (q) {
    filter.$or = [
      { materialId: { $regex: q, $options: 'i' } },
      { subject: { $regex: q, $options: 'i' } },
      { topic: { $regex: q, $options: 'i' } },
      { type: { $regex: q, $options: 'i' } },
      { schoolName: { $regex: q, $options: 'i' } },
    ];
  }
  const sortObj = SORT_MAP[sort] ?? SORT_MAP.newest;

  await connectMongo();
  const [materials, total, totalAll] = await Promise.all([
    Material.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    Material.countDocuments(filter),
    Material.countDocuments(),
  ]);
  const totalPage = Math.ceil(total / limit);

  const buildUrl = (overrides: Record<string, string>) => {
    const nextQ = overrides.q ?? q;
    const nextSubject = overrides.subject ?? subject;
    const nextDifficulty = overrides.difficulty ?? difficulty;
    const nextFileType = overrides.fileType ?? fileType;
    const nextTargetAudience = overrides.targetAudience ?? targetAudience;
    const nextActive = overrides.active ?? active;
    const nextSort = overrides.sort ?? sort;
    const nextPage = overrides.page ?? '1';

    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextSubject) params.set('subject', nextSubject);
    if (nextDifficulty) params.set('difficulty', nextDifficulty);
    if (nextFileType) params.set('fileType', nextFileType);
    if (nextTargetAudience) params.set('targetAudience', nextTargetAudience);
    if (nextActive) params.set('active', nextActive);
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);
    const qs = params.toString();
    return qs ? `/m/admin/materials?${qs}` : '/m/admin/materials';
  };

  return (
    <div className="m-detail-page min-h-screen">
      {/* ── 페이지 헤더 ── */}
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
                <span className="text-[13px] font-extrabold text-blue-500 tracking-wide">관리자 패널</span>
              </div>
              <h1 className="text-3xl sm:text-[2.25rem] font-extrabold text-gray-900 leading-tight tracking-tight">
                자료 관리
              </h1>
              <p className="text-[15px] text-gray-400 font-medium mt-2">
                총 <strong className="text-blue-500 font-extrabold">{totalAll.toLocaleString()}</strong>개 등록
                {hasFilter && (
                  <span className="ml-2 text-gray-500">
                    · 현재 <strong className="text-blue-500 font-extrabold">{total.toLocaleString()}</strong>개 표시
                  </span>
                )}
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/m/admin/materials/new"
                className="m-detail-btn-primary flex items-center gap-2 px-5 py-3 text-[14px] rounded-2xl shrink-0"
              >
                <PlusCircle size={18} />
                새 자료 등록
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-7xl py-8">
        <div className="m-detail-card p-4 sm:p-5 mb-5">
          <form action="/m/admin/materials" method="get" className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="자료ID · 과목 · 단원 · 학교명 · 유형 검색"
                className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
              <button
                type="submit"
                className="m-detail-btn-primary px-5 py-2.5 text-sm rounded-2xl"
              >
                필터 적용
              </button>
              {hasFilter && (
                <Link
                  href="/m/admin/materials"
                  className="m-detail-btn-secondary px-5 py-2.5 text-sm border-gray-200 text-center"
                >
                  초기화
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <select
                name="subject"
                defaultValue={subject}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">과목 전체</option>
                {MATERIAL_SUBJECTS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <select
                name="difficulty"
                defaultValue={difficulty}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">난이도 전체</option>
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={String(d)}>{DIFFICULTY_LABEL[d]}</option>
                ))}
              </select>

              <select
                name="fileType"
                defaultValue={fileType}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">파일 형식 전체</option>
                {FILE_TYPES.map((type) => (
                  <option key={type} value={type}>{FILE_TYPE_LABEL[type]}</option>
                ))}
              </select>

              <select
                name="targetAudience"
                defaultValue={targetAudience}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">대상 전체</option>
                {TARGET_AUDIENCES.map((type) => (
                  <option key={type} value={type}>{TARGET_AUDIENCE_LABEL[type]}</option>
                ))}
              </select>

              <select
                name="active"
                defaultValue={active}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">상태 전체</option>
                <option value="active">공개</option>
                <option value="inactive">비공개</option>
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                {SORT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {materials.length === 0 ? (
          <div className="m-detail-card flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <BookOpen size={34} className="text-gray-300" />
            </div>
            <p className="text-[17px] font-bold text-gray-400 mb-2">
              {hasFilter ? '조건에 맞는 자료가 없습니다' : '등록된 자료가 없습니다'}
            </p>
            {hasFilter ? (
              <Link href="/m/admin/materials" className="mt-4 text-[14px] text-blue-500 font-bold hover:underline underline-offset-4">
                필터 초기화
              </Link>
            ) : (
              isAdmin && (
                <Link href="/m/admin/materials/new" className="mt-4 text-[14px] text-blue-500 font-bold hover:underline underline-offset-4">
                  첫 자료 등록하기 →
                </Link>
              )
            )}
          </div>
        ) : (
          <>
            <div className="m-detail-card overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-7 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">자료</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">유형 / 난이도</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">형식 / 대상</th>
                    <th className="text-center px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">조회 / 다운</th>
                    <th className="text-center px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">상태</th>
                    {isAdmin && (
                      <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">관리</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {materials.map((m) => {
                    const dc = DIFFICULTY_COLOR[m.difficulty] || 'blue';
                    const title = [
                      m.schoolName,
                      m.year ? `${m.year}년` : '',
                      m.gradeNumber ? `${m.gradeNumber}학년` : '',
                      m.subject,
                      m.topic,
                    ].filter(Boolean).join(' ');
                    const ftLabel = FILE_TYPE_LABEL[m.fileType] || m.fileType || 'PDF';
                    const taLabel = TARGET_AUDIENCE_LABEL[m.targetAudience] || m.targetAudience || '학생용';

                    return (
                      <tr key={m.materialId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center" style={{ height: '52px' }}>
                              {m.previewImages?.[0] ? (
                                <img src={`/uploads/previews/${m.previewImages[0]}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className={`text-[9px] font-extrabold ${m.fileType === 'hwp' ? 'text-amber-400' : 'text-blue-500'}`}>
                                  {m.fileType === 'hwp' ? 'HWP' : 'PDF'}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate max-w-[220px] text-base">{title || m.subject}</p>
                              <p className="text-sm text-gray-400 mt-0.5">{m.subject}{m.topic ? ` · ${m.topic}` : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm text-gray-600 font-medium">{m.type}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${diffStyle[dc]}`}>
                              {DIFFICULTY_LABEL[m.difficulty]}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
                              m.fileType === 'hwp' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
                            }`}>{ftLabel}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
                              m.targetAudience === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                            }`}>{taLabel}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-3 text-sm text-gray-400 font-medium">
                            <span className="flex items-center gap-1"><Eye size={13} />{m.viewCount}</span>
                            <span className="flex items-center gap-1"><Download size={13} />{m.downloadCount}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {m.isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                              <ToggleRight size={15} />공개
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                              <ToggleLeft size={15} />비공개
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <PreviewModal material={{
                                materialId: m.materialId, type: m.type, subject: m.subject,
                                topic: m.topic, schoolLevel: m.schoolLevel, gradeNumber: m.gradeNumber,
                                year: m.year, semester: m.semester, schoolName: m.schoolName,
                                difficulty: m.difficulty, isFree: m.isFree, priceProblem: m.priceProblem,
                                priceEtc: m.priceEtc, previewImages: m.previewImages || [],
                                fileType: m.fileType, targetAudience: m.targetAudience,
                              }} />
                              <Link href={`/m/admin/materials/${m.materialId}/edit`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                                <Edit2 size={16} />
                              </Link>
                              <DeleteButton materialId={m.materialId} />
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: totalPage }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <Link
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? 'bg-blue-100 text-blue-600 border border-blue-100'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
