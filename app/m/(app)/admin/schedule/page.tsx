import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Consultation, {
  CONSULTATION_TYPE_LABEL,
} from '@/lib/models/Consultation';
import type { ConsultationType } from '@/lib/models/Consultation';
import { CalendarClock, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import StatusActions from '../consultations/StatusActions';

const typeColor: Record<ConsultationType, string> = {
  admission: 'bg-green-50 text-green-700 border-green-200',
  consulting: 'bg-blue-50 text-blue-700 border-blue-200',
  coaching: 'bg-purple-50 text-purple-700 border-purple-200',
  teacher: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default async function AdminSchedulePage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  await connectMongo();

  const [scheduled, changeRequests] = await Promise.all([
    Consultation.find({ status: 'scheduled' }).sort({ scheduledDate: 1, scheduledTime: 1 }).lean(),
    Consultation.find({ scheduleChangeRequest: { $ne: '' } }).sort({ updatedAt: -1 }).lean(),
  ]);

  const changeRequestIds = new Set(changeRequests.map((c) => c.consultationId));

  // 변경 요청이 있는 건은 별도 섹션에 표시하므로 scheduled에서 제외
  const scheduledOnly = scheduled.filter((c) => !changeRequestIds.has(c.consultationId));

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-5xl py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.25)]" />
            <span className="text-[14px] font-extrabold text-indigo-500 tracking-wide">관리자 패널</span>
          </div>
          <h1 className="text-3xl sm:text-[2.25rem] font-extrabold text-gray-900 tracking-tight leading-tight">일정 관리</h1>
          <p className="text-[16px] text-gray-400 font-medium mt-1.5">
            예정 <strong className="text-indigo-500 font-extrabold">{scheduled.length}</strong>건
            {changeRequests.length > 0 && (
              <span className="ml-3 text-red-500">변경요청 <strong className="font-extrabold">{changeRequests.length}</strong>건</span>
            )}
          </p>
        </div>
      </div>

      <div className="m-detail-container max-w-5xl py-8 space-y-10">
        {/* 변경/취소 요청 섹션 */}
        {changeRequests.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="text-lg font-extrabold text-gray-900">변경/취소 요청</h2>
            </div>
            <div className="space-y-3">
              {changeRequests.map((c) => (
                <div key={c.consultationId} className="m-detail-card p-4 border-l-4 border-red-400 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold border ${typeColor[c.type as ConsultationType]}`}>
                          {CONSULTATION_TYPE_LABEL[c.type as ConsultationType]}
                        </span>
                      </div>
                      <p className="text-base font-bold text-gray-800">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.phone}</p>
                    </div>
                    {c.scheduledDate && c.scheduledTime && (
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-indigo-600">
                          {c.scheduledDate.slice(5).replace('-', '/')} {c.scheduledTime}
                        </p>
                        <p className="text-[11px] text-gray-400">기존 일정</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                    <span className="font-bold">요청:</span> {c.scheduleChangeRequest}
                  </div>

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
          </section>
        )}

        {/* 예정된 상담 목록 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock size={18} className="text-indigo-500" />
            <h2 className="text-lg font-extrabold text-gray-900">예정된 상담</h2>
          </div>

          {scheduledOnly.length === 0 ? (
            <div className="m-detail-card flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                <CalendarClock size={28} className="text-gray-300" />
              </div>
              <p className="text-[16px] font-bold text-gray-400">예정된 상담이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledOnly.map((c) => (
                <div key={c.consultationId} className="m-detail-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold border ${typeColor[c.type as ConsultationType]}`}>
                          {CONSULTATION_TYPE_LABEL[c.type as ConsultationType]}
                        </span>
                        {c.scheduleConfirmedAt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-green-50 text-green-700">
                            <CheckCircle2 size={12} /> 확정
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-500">
                            <Clock size={12} /> 미확정
                          </span>
                        )}
                      </div>
                      <p className="text-base font-bold text-gray-800">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.phone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold text-indigo-600">
                        {c.scheduledDate.slice(5).replace('-', '/')}
                      </p>
                      <p className="text-sm font-bold text-indigo-400">{c.scheduledTime}</p>
                    </div>
                  </div>

                  {c.message && (
                    <p className="text-sm text-gray-600 line-clamp-2">{c.message}</p>
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
        </section>
      </div>
    </div>
  );
}
