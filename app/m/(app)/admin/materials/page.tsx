import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import {
  FILE_TYPES,
  getMaterialSubjectFilterCandidates,
  LEGACY_ONLY_MATERIAL_SUBJECTS,
  MATERIAL_CURRICULUMS,
  MATERIAL_CURRICULUM_LABEL,
  TARGET_AUDIENCES,
  MATERIAL_SOURCE_CATEGORIES,
  MATERIAL_SOURCE_CATEGORY_LABEL,
  MATERIAL_SUBJECTS,
  FILE_TYPE_LABEL,
  resolveMaterialCurriculumFromSubject,
  TARGET_AUDIENCE_LABEL,
} from '@/lib/constants/material';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit2, Eye, Download, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import DeleteButton from './DeleteButton';
import PreviewModal from './PreviewModal';
import { buildMaterialTitle, buildMaterialSubline, resolveSourceCategory } from '@/lib/material-display';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-100 text-violet-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
};

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { updatedAt: -1, createdAt: -1 },
  oldest: { updatedAt: 1, createdAt: 1 },
  views_desc: { viewCount: -1 },
  downloads_desc: { downloadCount: -1 },
};

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'views_desc', label: '조회 많은순' },
  { value: 'downloads_desc', label: '다운 많은순' },
] as const;

const legacyOnlySubjectHints = LEGACY_ONLY_MATERIAL_SUBJECTS as readonly string[];
const buildCurriculumQuery = (curriculum: 'legacy' | 'revised_2022'): Record<string, unknown> => (
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
  const curriculum =
    MATERIAL_CURRICULUMS.includes(sp.curriculum as (typeof MATERIAL_CURRICULUMS)[number])
      ? sp.curriculum
      : '';
  const sourceCategory = MATERIAL_SOURCE_CATEGORIES.includes(sp.sourceCategory as typeof MATERIAL_SOURCE_CATEGORIES[number]) ? sp.sourceCategory : '';
  const subject = MATERIAL_SUBJECTS.includes(sp.subject as typeof MATERIAL_SUBJECTS[number]) ? sp.subject : '';
  const difficulty = ['1', '2', '3', '4', '5'].includes(sp.difficulty || '') ? sp.difficulty : '';
  const fileType = FILE_TYPES.includes(sp.fileType as typeof FILE_TYPES[number]) ? sp.fileType : '';
  const targetAudience = TARGET_AUDIENCES.includes(sp.targetAudience as typeof TARGET_AUDIENCES[number]) ? sp.targetAudience : '';
  const active = ['active', 'inactive'].includes(sp.active || '') ? sp.active : '';
  const sort = SORT_OPTIONS.some((opt) => opt.value === sp.sort) ? sp.sort : 'newest';
  const page = Math.max(1, parseInt(sp.page || '1'));
  const limit = 30;
  const hasFilter = !!(q || curriculum || sourceCategory || subject || difficulty || fileType || targetAudience || active || sort !== 'newest');

  const filter: Record<string, unknown> = {};
  const andFilters: Record<string, unknown>[] = [];

  if (sourceCategory) {
    if (sourceCategory === 'ebook') {
      andFilters.push({
        $or: [
          { sourceCategory: 'ebook' },
          { type: '전자책' },
          { subject: '전자책' },
        ],
      });
    } else {
      andFilters.push({ sourceCategory });
    }
  }
  if (curriculum) andFilters.push(buildCurriculumQuery(curriculum as 'legacy' | 'revised_2022'));
  if (subject) {
    const subjectCandidates = getMaterialSubjectFilterCandidates(subject);
    andFilters.push(
      subjectCandidates.length > 1
        ? { subject: { $in: subjectCandidates } }
        : { subject }
    );
  }
  if (difficulty) andFilters.push({ difficulty: Number(difficulty) });
  if (fileType) andFilters.push({ fileType });
  if (targetAudience) andFilters.push({ targetAudience });
  if (active) andFilters.push({ isActive: active === 'active' });
  if (q) {
    andFilters.push({
      $or: [
        { materialId: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { topic: { $regex: q, $options: 'i' } },
        { bookTitle: { $regex: q, $options: 'i' } },
        { ebookDescription: { $regex: q, $options: 'i' } },
        { ebookToc: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } },
        { schoolName: { $regex: q, $options: 'i' } },
      ],
    });
  }
  if (andFilters.length > 0) {
    filter.$and = andFilters;
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
    const nextCurriculum = overrides.curriculum ?? curriculum;
    const nextSourceCategory = overrides.sourceCategory ?? sourceCategory;
    const nextSubject = overrides.subject ?? subject;
    const nextDifficulty = overrides.difficulty ?? difficulty;
    const nextFileType = overrides.fileType ?? fileType;
    const nextTargetAudience = overrides.targetAudience ?? targetAudience;
    const nextActive = overrides.active ?? active;
    const nextSort = overrides.sort ?? sort;
    const nextPage = overrides.page ?? '1';

    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextCurriculum) params.set('curriculum', nextCurriculum);
    if (nextSourceCategory) params.set('sourceCategory', nextSourceCategory);
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
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                className="m-detail-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[14px] md:w-auto md:shrink-0"
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
                placeholder="자료ID · 과목 · 도서명 · 단원 · 학교명 · 유형 검색"
                className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
              <button
                type="submit"
                className="m-detail-btn-primary w-full rounded-2xl px-5 py-2.5 text-sm sm:w-auto"
              >
                필터 적용
              </button>
              {hasFilter && (
                <Link
                  href="/m/admin/materials"
                  className="m-detail-btn-secondary w-full border-gray-200 px-5 py-2.5 text-center text-sm sm:w-auto"
                >
                  초기화
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-2">
              <select
                name="curriculum"
                defaultValue={curriculum}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">교육과정 전체</option>
                {MATERIAL_CURRICULUMS.map((item) => (
                  <option key={item} value={item}>{MATERIAL_CURRICULUM_LABEL[item]}</option>
                ))}
              </select>

              <select
                name="sourceCategory"
                defaultValue={sourceCategory}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
              >
                <option value="">분류 전체</option>
                {MATERIAL_SOURCE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>{MATERIAL_SOURCE_CATEGORY_LABEL[item]}</option>
                ))}
              </select>

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
            <div className="space-y-3 md:hidden">
              {materials.map((m) => {
                const dc = DIFFICULTY_COLOR[m.difficulty] || 'blue';
                const title = buildMaterialTitle(m);
                const subline = buildMaterialSubline(m);
                const resolvedSourceCategory = resolveSourceCategory(m);
                const sourceLabel = MATERIAL_SOURCE_CATEGORY_LABEL[resolvedSourceCategory] || '내신기출';
                const resolvedCurriculum =
                  m.curriculum === 'legacy' || m.curriculum === 'revised_2022'
                    ? m.curriculum
                    : resolveMaterialCurriculumFromSubject(m.subject);
                const curriculumLabel = MATERIAL_CURRICULUM_LABEL[resolvedCurriculum];
                const ftLabel = FILE_TYPE_LABEL[m.fileType] || m.fileType || 'PDF';
                const taLabel = TARGET_AUDIENCE_LABEL[m.targetAudience] || m.targetAudience || '학생용';

                return (
                  <div key={m.materialId} className="m-detail-card p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                        {m.previewImages?.[0] ? (
                          <Image
                            src={`/uploads/previews/${m.previewImages[0]}`}
                            alt=""
                            width={48}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className={`text-[10px] font-extrabold ${m.fileType === 'hwp' ? 'text-amber-400' : 'text-blue-500'}`}>
                            {m.fileType === 'hwp' ? 'HWP' : 'PDF'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">{title || m.subject}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{subline || '-'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${diffStyle[dc]}`}>
                        {DIFFICULTY_LABEL[m.difficulty]}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">{curriculumLabel}</span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">{sourceLabel}</span>
                      <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-600">{m.type}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${m.fileType === 'hwp' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'}`}>{ftLabel}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${m.targetAudience === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>{taLabel}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1"><Eye size={12} />{m.viewCount}</span>
                        <span className="flex items-center gap-1"><Download size={12} />{m.downloadCount}</span>
                      </div>
                      {m.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600">
                          <ToggleRight size={13} />공개
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-extrabold text-gray-400">
                          <ToggleLeft size={13} />비공개
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1.5 border-t border-gray-100 pt-3">
                        <PreviewModal material={{
                          materialId: m.materialId, sourceCategory: resolvedSourceCategory, type: m.type,
                          publisher: m.publisher || '', bookTitle: m.bookTitle || '', subject: m.subject,
                          ebookDescription: m.ebookDescription || '', ebookToc: m.ebookToc || [],
                          topic: m.topic, schoolLevel: m.schoolLevel, gradeNumber: m.gradeNumber,
                          year: m.year, semester: m.semester, schoolName: m.schoolName,
                          difficulty: m.difficulty, isFree: m.isFree, priceProblem: m.priceProblem,
                          priceEtc: m.priceEtc, previewImages: m.previewImages || [],
                          fileType: m.fileType, targetAudience: m.targetAudience,
                        }} />
                        <Link href={`/m/admin/materials/${m.materialId}/edit`} className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500">
                          <Edit2 size={16} />
                        </Link>
                        <DeleteButton materialId={m.materialId} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block">
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
                      const title = buildMaterialTitle(m);
                      const subline = buildMaterialSubline(m);
                      const resolvedSourceCategory = resolveSourceCategory(m);
                      const sourceLabel = MATERIAL_SOURCE_CATEGORY_LABEL[resolvedSourceCategory] || '내신기출';
                      const resolvedCurriculum =
                        m.curriculum === 'legacy' || m.curriculum === 'revised_2022'
                          ? m.curriculum
                          : resolveMaterialCurriculumFromSubject(m.subject);
                      const curriculumLabel = MATERIAL_CURRICULUM_LABEL[resolvedCurriculum];
                      const ftLabel = FILE_TYPE_LABEL[m.fileType] || m.fileType || 'PDF';
                      const taLabel = TARGET_AUDIENCE_LABEL[m.targetAudience] || m.targetAudience || '학생용';

                      return (
                        <tr key={m.materialId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center" style={{ height: '52px' }}>
                                {m.previewImages?.[0] ? (
                                  <Image
                                    src={`/uploads/previews/${m.previewImages[0]}`}
                                    alt=""
                                    width={44}
                                    height={52}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className={`text-[9px] font-extrabold ${m.fileType === 'hwp' ? 'text-amber-400' : 'text-blue-500'}`}>
                                    {m.fileType === 'hwp' ? 'HWP' : 'PDF'}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate max-w-[220px] text-base">{title || m.subject}</p>
                                <p className="text-sm text-gray-400 mt-0.5">{subline || '-'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-sm text-gray-600 font-medium">{m.type}</span>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full w-fit bg-gray-100 text-gray-600">
                                {sourceLabel}
                              </span>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full w-fit bg-blue-50 text-blue-600">
                                {curriculumLabel}
                              </span>
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
                                  materialId: m.materialId, sourceCategory: resolvedSourceCategory, type: m.type,
                                  publisher: m.publisher || '', bookTitle: m.bookTitle || '', subject: m.subject,
                                  ebookDescription: m.ebookDescription || '', ebookToc: m.ebookToc || [],
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
            </div>

            {totalPage > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
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
