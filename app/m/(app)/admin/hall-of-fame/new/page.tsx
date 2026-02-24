import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import HallOfFameForm from '../HallOfFameForm';

export default async function AdminHallOfFameNewPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

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
        <HallOfFameForm mode="create" />
      </div>
    </div>
  );
}
