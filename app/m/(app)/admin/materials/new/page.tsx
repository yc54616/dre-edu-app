import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import MaterialFormWithPreview from '../MaterialFormWithPreview';

export default async function NewMaterialPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/admin/materials');

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">자료 등록</h1>
        <p className="text-sm text-gray-500 mt-1">새로운 PDF/HWP 자료를 등록합니다</p>
      </div>
      <MaterialFormWithPreview mode="create" />
    </div>
  );
}
