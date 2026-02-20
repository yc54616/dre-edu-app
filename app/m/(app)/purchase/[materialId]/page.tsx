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
    material.year ? `${material.year}년` : '',
    material.gradeNumber ? `${material.gradeNumber}학년` : '',
    material.semester ? `${material.semester}학기` : '',
    material.subject,
    material.topic,
  ].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen">
      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-6 sm:py-8">
          <Link
            href={`/m/materials/${materialId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-blue-600 transition-colors mb-5 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            자료로 돌아가기
          </Link>
          <h1 className="text-2xl sm:text-[2rem] font-black text-gray-900 tracking-tight">자료 구매</h1>
          <p className="text-[15px] text-gray-500 mt-2.5 font-medium flex items-center gap-2">
            <span className="font-extrabold px-2.5 py-1 text-[11px] rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {DIFFICULTY_LABEL[material.difficulty]}
            </span>
            <span className="truncate">{title || material.subject}</span>
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
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
