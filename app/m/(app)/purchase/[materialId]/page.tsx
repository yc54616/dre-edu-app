import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL } from '@/lib/models/Material';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import PurchaseForm from './PurchaseForm';

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

  if (material.isFree) redirect(`/m/materials/${materialId}`);

  const title = [
    material.schoolName,
    material.year        ? `${material.year}년`        : '',
    material.gradeNumber ? `${material.gradeNumber}학년` : '',
    material.semester    ? `${material.semester}학기`   : '',
    material.subject,
    material.topic,
  ].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-6 sm:py-8">
          <Link
            href={`/m/materials/${materialId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-[var(--color-dre-blue)] transition-colors mb-5 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            자료로 돌아가기
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-dre-navy)]">자료 구매</h1>
          <p className="text-base text-gray-400 mt-1">
            <span className="font-semibold text-gray-600">{DIFFICULTY_LABEL[material.difficulty]}</span>
            {' · '}{title || material.subject}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-8">
        <PurchaseForm
          materialId={materialId}
          materialTitle={title || material.subject}
          priceProblem={material.priceProblem || 0}
          priceEtc={material.priceEtc || 0}
          hasProblemFile={!!material.problemFile}
          hasEtcFile={!!material.etcFile}
          tossClientKey={TOSS_CLIENT_KEY}
          userId={user.id || ''}
          userEmail={user.email || ''}
          userName={user.name || ''}
          initialFileTypes={initialFiles}
        />
      </div>
    </div>
  );
}
