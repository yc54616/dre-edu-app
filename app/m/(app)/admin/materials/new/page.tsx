import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import MaterialFormWithPreview from '../MaterialFormWithPreview';

export default async function NewMaterialPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/admin/materials');

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-7 sm:py-9">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">자료 등록</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1.5">새로운 PDF/HWP 자료를 등록합니다</p>
        </div>
      </div>
      <div className="m-detail-container max-w-7xl py-8">
        <MaterialFormWithPreview mode="create" />
      </div>
    </div>
  );
}
