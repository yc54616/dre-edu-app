import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import Consultation, { type ConsultationType } from '@/lib/models/Consultation';
import { Megaphone } from 'lucide-react';
import BroadcastForm from './BroadcastForm';

export const dynamic = 'force-dynamic';

type BroadcastRole = 'student' | 'teacher';

const roleLabel: Record<BroadcastRole, string> = {
  student: '학생',
  teacher: '교사',
};

const roleColor: Record<BroadcastRole, string> = {
  student: 'text-blue-600 bg-blue-50 border-blue-200',
  teacher: 'text-orange-600 bg-orange-50 border-orange-200',
};

export default async function BroadcastPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  await connectMongo();

  const [rawUsers, rawConsultations] = await Promise.all([
    User.find({
      role: { $in: ['student', 'teacher'] },
      phone: { $exists: true, $nin: [null, ''] },
      'consents.marketing': { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 })
      .select('phone username role consents.marketing')
      .lean() as Promise<Array<{
        phone?: string | null;
        username?: string;
        role?: BroadcastRole;
        consents?: {
          marketing?: {
            agreedAt?: Date | string;
          } | null;
        };
      }>>,
    Consultation.find({
      status: { $ne: 'cancelled' },
      phone: { $exists: true, $nin: [null, ''] },
      marketingConsent: true,
    })
      .sort({ createdAt: -1 })
      .select('phone name type marketingConsentAt')
      .lean() as Promise<Array<{
        phone?: string | null;
        name?: string;
        type?: ConsultationType;
        marketingConsentAt?: Date | string | null;
      }>>,
  ]);

  // phone 기준으로 중복 제거 (동일 번호의 최신 사용자 이름/동의일시를 우선 사용)
  const phoneMap = new Map<string, {
    phone: string;
    name: string;
    roles: Set<BroadcastRole>;
    marketingAgreedAt: Date | null;
  }>();

  for (const doc of rawUsers) {
    const phone = typeof doc.phone === 'string' ? doc.phone.replace(/\D/g, '') : '';
    if (!phone) continue;

    const userRole = doc.role === 'teacher' ? 'teacher' : 'student';
    const agreedAt = doc.consents?.marketing?.agreedAt
      ? new Date(doc.consents.marketing.agreedAt)
      : null;
    const existing = phoneMap.get(phone);

    if (existing) {
      existing.roles.add(userRole);
      continue;
    }

    phoneMap.set(phone, {
      phone,
      name: (doc.username || '').trim() || '회원',
      roles: new Set([userRole]),
      marketingAgreedAt: agreedAt,
    });
  }

  const resolveConsultRole = (type?: ConsultationType): BroadcastRole =>
    type === 'teacher' ? 'teacher' : 'student';

  for (const doc of rawConsultations) {
    const phone = typeof doc.phone === 'string' ? doc.phone.replace(/\D/g, '') : '';
    if (!phone) continue;

    const agreedAt = doc.marketingConsentAt ? new Date(doc.marketingConsentAt) : null;
    const consultRole = resolveConsultRole(doc.type);
    const existing = phoneMap.get(phone);

    if (existing) {
      existing.roles.add(consultRole);
      if (!existing.marketingAgreedAt && agreedAt) {
        existing.marketingAgreedAt = agreedAt;
      }
      if (existing.name === '회원' && (doc.name || '').trim()) {
        existing.name = (doc.name || '').trim();
      }
      continue;
    }

    phoneMap.set(phone, {
      phone,
      name: (doc.name || '').trim() || '상담 신청자',
      roles: new Set([consultRole]),
      marketingAgreedAt: agreedAt,
    });
  }

  const recipients = Array.from(phoneMap.values()).map((r) => ({
    phone: r.phone,
    name: r.name,
    roles: Array.from(r.roles) as BroadcastRole[],
    marketingAgreedAt: r.marketingAgreedAt,
  }));

  const roleCounts: Record<BroadcastRole, number> = {
    student: 0,
    teacher: 0,
  };
  for (const r of recipients) {
    for (const oneRole of r.roles) {
      roleCounts[oneRole] += 1;
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
                총 <strong className="text-blue-500 font-extrabold">{recipients.length}</strong>명의 발송 대상
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {(Object.entries(roleLabel) as [BroadcastRole, string][]).map(([key, label]) => (
              <div key={key} className={`m-detail-card p-4 text-center border ${roleColor[key]}`}>
                <div className="text-[13px] font-bold opacity-80">{label}</div>
                <div className="text-2xl font-extrabold mt-1">{roleCounts[key]}</div>
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
