import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Consultation, {
  CONSULTATION_TYPES,
  CONSULTATION_STATUSES,
  CONSULTATION_TYPE_LABEL,
  CONSULTATION_STATUS_LABEL,
} from '@/lib/models/Consultation';
import type { ConsultationType, ConsultationStatus } from '@/lib/models/Consultation';
import Link from 'next/link';
import { MessageSquare, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import ConsultFilters from './ConsultFilters';
import StatusActions from './StatusActions';
import { Suspense } from 'react';

const formatDate = (d: Date) => {
  const dt = new Date(d);
  const month = dt.getMonth() + 1;
  const day = dt.getDate();
  const h = dt.getHours().toString().padStart(2, '0');
  const m = dt.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${h}:${m}`;
};

const typeColor: Record<ConsultationType, string> = {
  admission: 'bg-green-50 text-green-700 border-green-200',
  consulting: 'bg-blue-50 text-blue-700 border-blue-200',
  coaching: 'bg-purple-50 text-purple-700 border-purple-200',
  teacher: 'bg-orange-50 text-orange-700 border-orange-200',
};

const statusColor: Record<ConsultationStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  contacted: 'bg-blue-50 text-blue-700',
  scheduled: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  const sp = await searchParams;
  const type = CONSULTATION_TYPES.includes(sp.type as ConsultationType) ? sp.type : '';
  const status = (sp.status === 'confirmed' || CONSULTATION_STATUSES.includes(sp.status as ConsultationStatus)) ? sp.status : '';
  const q = sp.q?.trim() || '';
  const page = Math.max(1, parseInt(sp.page || '1'));
  const limit = 30;

  await connectMongo();

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;

  if (status === 'confirmed') {
    filter.scheduleConfirmedAt = { $ne: null };
    filter.status = { $ne: 'completed' };
  } else if (status) {
    filter.status = status;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { message: { $regex: q, $options: 'i' } },
    ];
  }

  const [consultations, total, pendingCount] = await Promise.all([
    Consultation.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Consultation.countDocuments(filter),
    Consultation.countDocuments({ status: 'pending' }),
  ]);

  const totalAll = await Consultation.countDocuments({});
  const totalPage = Math.ceil(total / limit);
  const hasFilter = !!(type || status || q);

  const buildUrl = (overrides: Record<string, string>) => {
    const nextType = overrides.type ?? type;
    const nextStatus = overrides.status ?? status;
    const nextQ = overrides.q ?? q;
    const nextPage = overrides.page ?? '1';

    const params = new URLSearchParams();
    if (nextType) params.set('type', nextType);
    if (nextStatus) params.set('status', nextStatus);
    if (nextQ) params.set('q', nextQ);
    if (nextPage && nextPage !== '1') params.set('page', nextPage);
    const qs = params.toString();
    return qs ? `/m/admin/consultations?${qs}` : '/m/admin/consultations';
  };

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
            <span className="text-[14px] font-extrabold text-blue-500 tracking-wide">관리자 패널</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-[2.25rem] font-extrabold text-gray-900 tracking-tight leading-tight">상담 관리</h1>
              <p className="text-[16px] text-gray-400 font-medium mt-1.5">전체 <strong className="text-blue-500 font-extrabold">{totalAll.toLocaleString()}</strong>건</p>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-[15px] font-extrabold text-yellow-700">{pendingCount}건 미처리</span>
              </div>
            )}
          </div>

          <div className="mt-8">
            <Suspense>
              <ConsultFilters />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-7xl py-8">
        {consultations.length === 0 ? (
          <div className="m-detail-card flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <MessageSquare size={34} className="text-gray-300" />
            </div>
            <p className="text-[18px] font-bold text-gray-400">
              {q ? `"${q}" 검색 결과가 없습니다` : '상담 신청 내역이 없습니다'}
            </p>
          </div>
        ) : (
          <>
            {hasFilter && (
              <p className="mb-5 text-[15px] text-gray-400 font-bold">
                {total.toLocaleString()}건 검색됨
                {q && <span className="ml-2 font-extrabold text-blue-500">&ldquo;{q}&rdquo;</span>}
              </p>
            )}

            {/* 모바일 카드 뷰 */}
            <div className="space-y-3 md:hidden">
              {consultations.map((c) => (
                <div key={c.consultationId} className="m-detail-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold border ${typeColor[c.type as ConsultationType]}`}>
                          {CONSULTATION_TYPE_LABEL[c.type as ConsultationType]}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold ${statusColor[c.status as ConsultationStatus]}`}>
                          {CONSULTATION_STATUS_LABEL[c.status as ConsultationStatus]}
                        </span>
                      </div>
                      <p className="text-base font-bold text-gray-800">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.phone}</p>
                    </div>
                    <span className="text-sm text-gray-400 tabular-nums whitespace-nowrap">{formatDate(c.createdAt)}</span>
                  </div>

                  {(c.schoolGrade || c.gradeLevel || c.subject) && (
                    <div className="border-t border-gray-100 pt-3 text-sm text-gray-500 space-y-1">
                      {c.schoolGrade && <p>학교/학년: {c.schoolGrade}</p>}
                      {c.gradeLevel && <p>중등/고등: {c.gradeLevel}</p>}
                      {c.currentScore && <p>성적: {c.currentScore}</p>}
                      {c.targetUniv && <p>목표: {c.targetUniv}</p>}
                      {c.direction && <p>방향: {c.direction}</p>}
                      {c.subject && <p>과목: {c.subject}</p>}
                    </div>
                  )}

                  {c.message && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-sm text-gray-600 line-clamp-3">{c.message}</p>
                    </div>
                  )}

                  {c.adminMemo && (
                    <div className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                      <span className="font-bold">메모:</span> {c.adminMemo}
                    </div>
                  )}

                  {c.scheduledDate && c.scheduledTime && (
                    <div className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 flex items-center gap-2">
                      <span className="font-bold">상담 일정:</span> {c.scheduledDate.slice(5).replace('-', '/')} {c.scheduledTime}
                      {c.scheduleConfirmedAt && <CheckCircle2 size={14} className="text-green-600" />}
                    </div>
                  )}

                  {c.scheduleChangeRequest && (
                    <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                      <span className="font-bold">일정 변경 요청:</span> {c.scheduleChangeRequest}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    <StatusActions
                      consultationId={c.consultationId}
                      currentStatus={c.status}
                      currentMemo={c.adminMemo}
                      scheduledDate={c.scheduledDate}
                      scheduledTime={c.scheduledTime}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 데스크탑 테이블 뷰 */}
            <div className="hidden md:block">
              <div className="m-detail-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-6 py-3.5 text-[12px] font-extrabold text-gray-500 uppercase tracking-widest w-[220px]">신청자</th>
                        <th className="text-left px-4 py-3.5 text-[12px] font-extrabold text-gray-500 uppercase tracking-widest">상담 내용</th>
                        <th className="text-left px-4 py-3.5 text-[12px] font-extrabold text-gray-500 uppercase tracking-widest w-[110px]">신청일</th>
                        <th className="text-left px-4 py-3.5 text-[12px] font-extrabold text-gray-500 uppercase tracking-widest w-[260px]">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {consultations.map((c) => {
                        const details = [
                          c.schoolGrade && c.schoolGrade,
                          c.gradeLevel && c.gradeLevel,
                          c.currentScore && `성적 ${c.currentScore}`,
                          c.targetUniv && `목표 ${c.targetUniv}`,
                          c.direction && c.direction,
                          c.subject && c.subject,
                        ].filter(Boolean);

                        return (
                          <tr key={c.consultationId} className={`hover:bg-gray-50/50 transition-colors ${c.status === 'cancelled' ? 'opacity-50' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <span className={`shrink-0 inline-block rounded-md border px-2 py-1 text-[11px] font-bold ${typeColor[c.type as ConsultationType]}`}>
                                  {CONSULTATION_TYPE_LABEL[c.type as ConsultationType]}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[15px] font-bold text-gray-900 leading-tight">{c.name}</p>
                                  <p className="mt-0.5 text-[13px] text-gray-400 tabular-nums">{c.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {details.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {details.map((d, i) => (
                                    <span key={i} className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {c.message ? (
                                <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-2">{c.message}</p>
                              ) : (
                                <p className="text-[14px] text-gray-300">—</p>
                              )}
                              {c.adminMemo && (
                                <p className="mt-1.5 inline-block rounded bg-yellow-50 px-2 py-1 text-[12px] text-yellow-700">
                                  {c.adminMemo}
                                </p>
                              )}
                              {c.scheduledDate && c.scheduledTime && (
                                <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-[12px] text-indigo-700 ml-1">
                                  상담 {c.scheduledDate.slice(5).replace('-', '/')} {c.scheduledTime}
                                  {c.scheduleConfirmedAt && <CheckCircle2 size={11} className="text-green-600" />}
                                </span>
                              )}
                              {c.scheduleChangeRequest && (
                                <p className="mt-1.5 inline-block rounded bg-red-50 border border-red-200 px-2 py-1 text-[12px] text-red-700 ml-1">
                                  변경요청: {c.scheduleChangeRequest}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <p className="text-[13px] text-gray-400 tabular-nums">{formatDate(c.createdAt)}</p>
                            </td>
                            <td className="px-4 py-4">
                              <StatusActions
                                consultationId={c.consultationId}
                                currentStatus={c.status}
                                currentMemo={c.adminMemo}
                                scheduledDate={c.scheduledDate}
                                scheduledTime={c.scheduledTime}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 페이지네이션 */}
            {totalPage > 1 && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[15px] text-gray-400">
                  {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} / {total.toLocaleString()}건
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-blue-300">
                      <ChevronLeft size={16} />
                    </Link>
                  )}
                  {Array.from({ length: totalPage }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPage)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={`e${i}`} className="flex h-10 w-10 items-center justify-center text-[15px] text-gray-300">…</span>
                        : <Link
                          key={p}
                          href={buildUrl({ page: String(p) })}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-[15px] font-bold transition-all ${p === page
                            ? 'bg-blue-100 text-blue-600 border border-blue-100'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                        >
                          {p}
                        </Link>
                    )}
                  {page < totalPage && (
                    <Link href={buildUrl({ page: String(page + 1) })} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-blue-300">
                      <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
