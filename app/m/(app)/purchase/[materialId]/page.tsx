import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL } from '@/lib/models/Material';
import Order from '@/lib/models/Order';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import PurchaseForm from './PurchaseForm';
import { buildMaterialTitle } from '@/lib/material-display';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';

export default async function PurchasePage({
  params,
  searchParams,
}: {
  params: Promise<{ materialId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session) redirect('/m');

  const user = session.user as { id?: string; email?: string; name?: string };

  const { materialId } = await params;
  const sp = await searchParams;
  const initialFiles = sp.files ? sp.files.split(',').filter((f) => ['problem', 'etc'].includes(f)) : [];

  await connectMongo();

  const material = await Material.findOne({ materialId, isActive: true }).lean();
  if (!material) notFound();
  const isTeacherMaterial = material.targetAudience === 'teacher';

  if (material.isFree) redirect(`/m/materials/${materialId}`);

  const paidOrders = await Order.find({ userId: user.id, materialId, status: 'paid' }, { fileTypes: 1 }).lean();
  const purchasedSet = new Set<string>();
  for (const order of paidOrders) {
    for (const type of order.fileTypes || []) purchasedSet.add(type);
  }
  const purchasedFileTypes = isTeacherMaterial && paidOrders.length > 0
    ? ['problem', 'etc']
    : [...purchasedSet];

  const title = buildMaterialTitle(material);

  return (
    <div className="m-detail-page min-h-screen">
      {/* ── 페이지 헤더 ── */}
      <div className="m-detail-header">
        <div className="m-detail-container max-w-2xl py-6 sm:py-8">
          <Link
            href={`/m/materials/${materialId}`}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-gray-500 hover:text-blue-500 transition-colors mb-5 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            자료로 돌아가기
          </Link>
          <h1 className="m-detail-title">자료 구매</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-600 sm:text-base">
            <span className="font-extrabold px-2.5 py-1 text-[11px] rounded-full bg-blue-50/80 text-blue-500 border border-blue-100">
              {DIFFICULTY_LABEL[material.difficulty]}
            </span>
            <span className="min-w-0 truncate">{title || material.subject}</span>
          </p>
        </div>
      </div>

      <div className="m-detail-container max-w-2xl py-8">
        <PurchaseForm
          materialId={materialId}
          materialTitle={title || material.subject}
          priceProblem={material.priceProblem || 0}
          priceEtc={material.priceEtc || 0}
          hasProblemFile={!!material.problemFile}
          hasEtcFile={!!material.etcFile}
          isTeacherMaterial={isTeacherMaterial}
          tossClientKey={TOSS_CLIENT_KEY}
          userId={user.id || ''}
          userEmail={user.email || ''}
          userName={user.name || ''}
          initialFileTypes={initialFiles}
          purchasedFileTypes={purchasedFileTypes}
        />
      </div>
    </div>
  );
}
