import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import MaterialFormWithPreview from '../../MaterialFormWithPreview';
import { resolveSourceCategory } from '@/lib/material-display';
import { resolveMaterialCurriculumFromSubject } from '@/lib/constants/material';

export default async function EditMaterialPage({ params }: { params: Promise<{ materialId: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/admin/materials');

  const { materialId } = await params;
  await connectMongo();

  const material = await Material.findOne({ materialId }).lean();
  if (!material) notFound();
  const resolvedCurriculum =
    material.curriculum === 'legacy' || material.curriculum === 'revised_2022'
      ? material.curriculum
      : resolveMaterialCurriculumFromSubject(material.subject);
  const data = {
    materialId:     material.materialId,
    curriculum:     resolvedCurriculum,
    sourceCategory: resolveSourceCategory(material),
    type:           material.type,
    publisher:      material.publisher || '',
    bookTitle:      material.bookTitle || '',
    ebookDescription: material.ebookDescription || '',
    ebookToc:       Array.isArray(material.ebookToc) ? material.ebookToc.join('\n') : '',
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
    teacherProductType: '',
    teacherClassPrepType: '',
    isFree:         material.isFree,
    priceProblem:   material.priceProblem,
    priceEtc:       material.priceEtc,
    isActive:       material.isActive,
    problemFile:    material.problemFile   || null,
    etcFile:        material.etcFile       || null,
    previewImages:  material.previewImages || [],
  };

  return (
    <div className="m-detail-page min-h-screen">
      <div className="m-detail-header">
        <div className="m-detail-container max-w-7xl py-7 sm:py-9">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">자료 수정</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1.5">자료 정보를 수정합니다</p>
        </div>
      </div>
      <div className="m-detail-container max-w-7xl py-8">
        <MaterialFormWithPreview mode="edit" initialData={data} />
      </div>
    </div>
  );
}
