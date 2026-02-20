import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import MaterialFormWithPreview from '../../MaterialFormWithPreview';

export default async function EditMaterialPage({ params }: { params: Promise<{ materialId: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/admin/materials');

  const { materialId } = await params;
  await connectMongo();

  const material = await Material.findOne({ materialId }).lean();
  if (!material) notFound();

  const data = {
    materialId:     material.materialId,
    type:           material.type,
    subject:        material.subject,
    topic:          material.topic,
    schoolLevel:    material.schoolLevel,
    gradeNumber:    material.gradeNumber,
    year:           material.year,
    semester:       material.semester,
    period:         material.period,
    schoolName:     material.schoolName,
    regionSido:     material.regionSido,
    regionGugun:    material.regionGugun,
    difficulty:      material.difficulty,
    difficultyRating:material.difficultyRating ?? 1000,
    fileType:        material.fileType       || 'pdf',
    targetAudience: material.targetAudience || 'student',
    isFree:         material.isFree,
    priceProblem:   material.priceProblem,
    priceEtc:       material.priceEtc,
    isActive:       material.isActive,
    problemFile:    material.problemFile   || null,
    etcFile:        material.etcFile       || null,
    previewImages:  material.previewImages || [],
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">자료 수정</h1>
        <p className="text-sm text-gray-500 mt-1">자료 정보를 수정합니다</p>
      </div>
      <MaterialFormWithPreview mode="edit" initialData={data} />
    </div>
  );
}
