import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import { FILE_TYPE_LABEL, TARGET_AUDIENCE_LABEL } from '@/lib/constants/material';
import Link from 'next/link';
import { PlusCircle, Edit2, Eye, Download, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import DeleteButton from './DeleteButton';
import PreviewModal from './PreviewModal';

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  violet:  'bg-violet-100 text-violet-700',
  orange:  'bg-orange-100 text-orange-700',
  red:     'bg-red-100 text-red-700',
};

export default async function TeacherMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== 'admin')) redirect('/m/materials');

  const isAdmin = role === 'admin';
  const sp    = await searchParams;
  const page  = Math.max(1, parseInt(sp.page || '1'));
  const limit = 30;

  await connectMongo();
  const [materials, total] = await Promise.all([
    Material.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Material.countDocuments(),
  ]);
  const totalPage = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-bold text-red-500">관리자</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-dre-navy)] leading-tight">
                자료 관리
              </h1>
              <p className="text-base text-gray-400 mt-2">
                총 <strong className="text-gray-700">{total}</strong>개 자료 등록됨
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/m/admin/materials/new"
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-dre-blue)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-dre-blue-dark)] transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 shrink-0"
              >
                <PlusCircle size={16} />
                자료 등록
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
        {materials.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100">
              <BookOpen size={34} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-400 mb-2">등록된 자료가 없습니다</p>
            {isAdmin && (
              <Link href="/m/admin/materials/new" className="mt-4 text-sm text-[var(--color-dre-blue)] font-semibold hover:underline">
                첫 자료 등록하기 →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">자료</th>
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
                      m.year        ? `${m.year}년`        : '',
                      m.gradeNumber ? `${m.gradeNumber}학년` : '',
                      m.subject,
                      m.topic,
                    ].filter(Boolean).join(' ');
                    const ftLabel = FILE_TYPE_LABEL[m.fileType] || m.fileType || 'PDF';
                    const taLabel = TARGET_AUDIENCE_LABEL[m.targetAudience] || m.targetAudience || '학생용';

                    return (
                      <tr key={m.materialId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center" style={{ height: '52px' }}>
                              {m.previewImages?.[0] ? (
                                <img src={`/uploads/previews/${m.previewImages[0]}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className={`text-[9px] font-black ${m.fileType === 'hwp' ? 'text-amber-400' : 'text-blue-400'}`}>
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
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                              <ToggleRight size={14} />공개
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                              <ToggleLeft size={14} />비공개
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
                              <Link href={`/m/admin/materials/${m.materialId}/edit`} className="p-2 text-gray-400 hover:text-[var(--color-dre-blue)] hover:bg-blue-50 rounded-xl transition-colors">
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
                      href={`/m/admin/materials?page=${p}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? 'bg-[var(--color-dre-blue)] text-white shadow-md shadow-blue-200'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-dre-blue)]/50'
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
