import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import HallOfFameEntry from '@/lib/models/HallOfFameEntry';
import HallOfFameForm, { type HallOfFameFormData } from '../../HallOfFameForm';

type Params = { params: Promise<{ entryId: string }> };

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export default async function AdminHallOfFameEditPage({ params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  const { entryId } = await params;
  await connectMongo();
  const entry = await HallOfFameEntry.findOne({ entryId }).lean();
  if (!entry) notFound();

  const initialData: HallOfFameFormData = {
    entryId: normalizeText(entry.entryId),
    kind: entry.kind === 'review' ? 'review' : 'admission',
    isPublished: Boolean(entry.isPublished),
    sortOrder: Number(entry.sortOrder || 0),
    univ: normalizeText(entry.univ),
    major: normalizeText(entry.major),
    student: normalizeText(entry.student),
    school: normalizeText(entry.school),
    badge: normalizeText(entry.badge),
    desc: normalizeText(entry.desc),
    name: normalizeText(entry.name),
    content: normalizeText(entry.content),
    tag: normalizeText(entry.tag),
    stars: Math.max(1, Math.min(5, Math.round(Number(entry.stars || 5)))),
  };

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-container max-w-4xl py-8">
        <Link
          href="/m/admin/hall-of-fame"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-[var(--color-dre-blue)]"
        >
          <ArrowLeft size={16} />
          목록으로 돌아가기
        </Link>
        <HallOfFameForm mode="edit" initialData={initialData} />
      </div>
    </div>
  );
}
