import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectMongo from '@/lib/mongoose';
import Consultation, { CONSULTATION_TYPE_LABEL, ConsultationType } from '@/lib/models/Consultation';
import { Megaphone } from 'lucide-react';
import BroadcastForm from './BroadcastForm';

export const dynamic = 'force-dynamic';

const typeColor: Record<ConsultationType, string> = {
  admission: 'text-green-600 bg-green-50 border-green-200',
  consulting: 'text-blue-600 bg-blue-50 border-blue-200',
  coaching: 'text-purple-600 bg-purple-50 border-purple-200',
  teacher: 'text-orange-600 bg-orange-50 border-orange-200',
};

export default async function BroadcastPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  await connectMongo();

  // 고유 전화번호+이름 목록 조회 (중복 제거)
  const raw = await Consultation.find(
    { status: { $ne: 'cancelled' } },
  ).select('phone name type').lean();

  // phone 기준 중복 제거
  const phoneMap = new Map<string, { phone: string; name: string; types: Set<ConsultationType> }>();
  for (const doc of raw) {
    const existing = phoneMap.get(doc.phone);
    if (existing) {
      existing.types.add(doc.type);
    } else {
      phoneMap.set(doc.phone, {
        phone: doc.phone,
        name: doc.name,
        types: new Set([doc.type]),
      });
    }
  }

  const recipients = Array.from(phoneMap.values()).map((r) => ({
    phone: r.phone,
    name: r.name,
    types: Array.from(r.types) as ConsultationType[],
  }));

  // 유형별 카운트
  const typeCounts = {} as Record<ConsultationType, number>;
  for (const r of recipients) {
    for (const t of r.types) {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
  }

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-5xl py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
            <span className="text-[14px] font-extrabold text-blue-500 tracking-wide">관리자 패널</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-[2.25rem] font-extrabold text-gray-900 tracking-tight leading-tight">친구톡 발송</h1>
              <p className="text-[16px] text-gray-400 font-medium mt-1.5">
                총 <strong className="text-blue-500 font-extrabold">{recipients.length}</strong>명의 고유 수신자
              </p>
            </div>
          </div>

          {/* 유형별 카운트 */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(CONSULTATION_TYPE_LABEL) as [ConsultationType, string][]).map(([key, label]) => (
              <div key={key} className={`m-detail-card p-4 text-center border ${typeColor[key]}`}>
                <div className="text-[13px] font-bold opacity-80">{label}</div>
                <div className="text-2xl font-extrabold mt-1">{typeCounts[key] || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="m-detail-container max-w-5xl py-8">
        {recipients.length === 0 ? (
          <div className="m-detail-card flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <Megaphone size={34} className="text-gray-300" />
            </div>
            <p className="text-[18px] font-bold text-gray-400">발송 가능한 수신자가 없습니다</p>
          </div>
        ) : (
          <BroadcastForm recipients={recipients} />
        )}
      </div>
    </div>
  );
}
