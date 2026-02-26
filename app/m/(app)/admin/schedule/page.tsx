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
import { CalendarClock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';
import ConsultFilters from '../consultations/ConsultFilters';
import StatusActions from '../consultations/StatusActions';

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

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  const sp = await searchParams;
  const type = CONSULTATION_TYPES.includes(sp.type as ConsultationType) ? sp.type : '';
  const status = CONSULTATION_STATUSES.includes(sp.status as ConsultationStatus) ? sp.status : '';
  const q = sp.q?.trim() || '';

  await connectMongo();

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { message: { $regex: q, $options: 'i' } },
      { scheduleChangeRequest: { $regex: q, $options: 'i' } },
    ];
  }

  const [consultations, totalAll, scheduleTodoCount, changeRequestCount] = await Promise.all([
    Consultation.find(filter).sort({ updatedAt: -1, createdAt: -1 }).lean(),
    Consultation.countDocuments({}),
    Consultation.countDocuments({
      status: { $nin: ['cancelled', 'completed'] },
      $or: [
        { status: { $in: ['pending', 'contacted'] } },
        { scheduleChangeRequest: { $exists: true, $ne: '' } },
      ],
    }),
    Consultation.countDocuments({ scheduleChangeRequest: { $exists: true, $ne: '' } }),
  ]);

  const hasFilter = !!(type || status || q);

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-5xl py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.25)]" />
            <span className="text-[14px] font-extrabold text-indigo-500 tracking-wide">관리자 패널</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-[2.25rem] font-extrabold text-gray-900 tracking-tight leading-tight">일정 관리</h1>
              <p className="text-[16px] text-gray-400 font-medium mt-1.5">
                전체 <strong className="text-indigo-500 font-extrabold">{totalAll.toLocaleString()}</strong>건
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[13px] font-extrabold text-indigo-600">
                <CalendarClock size={14} />
                날짜 조율 필요 {scheduleTodoCount}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[13px] font-extrabold text-red-600">
                <AlertTriangle size={14} />
                변경요청 {changeRequestCount}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <Suspense>
              <ConsultFilters resetHref="/m/admin/schedule" />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-5xl py-8">
        {consultations.length === 0 ? (
          <div className="m-detail-card flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
              <CalendarClock size={28} className="text-gray-300" />
            </div>
            <p className="text-[16px] font-bold text-gray-400">
              {q ? `"${q}" 검색 결과가 없습니다` : '일정 관리 대상이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hasFilter && (
              <p className="mb-2 text-[14px] text-gray-400 font-bold">
                {consultations.length.toLocaleString()}건 검색됨
                {q && <span className="ml-2 font-extrabold text-indigo-500">&ldquo;{q}&rdquo;</span>}
              </p>
            )}

            {consultations.map((c) => (
              <div
                key={c.consultationId}
                className={`m-detail-card p-4 space-y-3 ${
                  c.scheduleChangeRequest ? 'border-l-4 border-red-400' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold border ${typeColor[c.type as ConsultationType]}`}>
                        {CONSULTATION_TYPE_LABEL[c.type as ConsultationType]}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold ${statusColor[c.status as ConsultationStatus]}`}>
                        {CONSULTATION_STATUS_LABEL[c.status as ConsultationStatus]}
                      </span>
                      {c.scheduleChangeRequest && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">
                          <AlertTriangle size={11} />
                          변경요청
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold text-gray-800">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] text-gray-400 tabular-nums">{formatDate(c.createdAt)}</p>
                    {c.scheduledDate && c.scheduledTime ? (
                      <p className="mt-1 text-[13px] font-extrabold text-indigo-600">
                        {c.scheduledDate.slice(5).replace('-', '/')} {c.scheduledTime}
                        {c.scheduleConfirmedAt && <CheckCircle2 size={12} className="ml-1 inline text-green-600" />}
                      </p>
                    ) : (
                      <p className="mt-1 text-[12px] font-bold text-gray-400">일정 미정</p>
                    )}
                  </div>
                </div>

                {c.message && (
                  <p className="text-sm text-gray-600 line-clamp-2">{c.message}</p>
                )}

                {c.scheduleChangeRequest && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                    <span className="font-bold">변경요청:</span> {c.scheduleChangeRequest}
                  </div>
                )}

                {c.adminMemo && (
                  <div className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                    <span className="font-bold">메모:</span> {c.adminMemo}
                  </div>
                )}

                <StatusActions
                  consultationId={c.consultationId}
                  currentStatus={c.status}
                  currentMemo={c.adminMemo}
                  scheduledDate={c.scheduledDate}
                  scheduledTime={c.scheduledTime}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
