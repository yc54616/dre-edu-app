import mongoose from 'mongoose';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import Order from '@/lib/models/Order';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import MaterialDetail from './MaterialDetail';
import { getCollaborativeRecs } from '@/lib/recommendation';
import { resolveSourceCategory } from '@/lib/material-display';
import { getMaterialFilePageCount } from '@/lib/material-page-count';

export default async function MaterialPage({ params }: { params: Promise<{ materialId: string }> }) {
  const { materialId } = await params;
  const headerStore = await headers();
  const userAgent = headerStore.get('user-agent') || '';
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
  await connectMongo();

  const material = await Material.findOneAndUpdate(
    { materialId, isActive: true },
    { $inc: { viewCount: 1 } },
    { returnDocument: 'after' }
  ).lean();

  if (!material) notFound();
  const resolvedSourceCategory = resolveSourceCategory(material);
  const existingPageCount =
    typeof (material as { pageCount?: unknown }).pageCount === 'number'
      ? (material as { pageCount: number }).pageCount
      : 0;
  const previewSourceFile = material.problemFile || material.etcFile || null;
  const resolvedPageCount =
    existingPageCount > 0 ? existingPageCount : await getMaterialFilePageCount(previewSourceFile);

  if (resolvedPageCount && resolvedPageCount > 0 && existingPageCount !== resolvedPageCount) {
    await Material.updateOne({ _id: material._id }, { $set: { pageCount: resolvedPageCount } }).catch(() => {});
  }

  const session = await auth();
  const user    = session?.user as { id?: string; role?: string } | undefined;
  const userId  = user?.id ?? null;

  // 구매 여부 조회 (유료 자료 + 로그인 상태)
  let purchasedFileTypes: string[] = [];
  const isTeacherMaterial = material.targetAudience === 'teacher';
  if (userId && !material.isFree) {
    const paidOrders = await Order.find({ userId, materialId, status: 'paid' }, { fileTypes: 1 }).lean();
    if (isTeacherMaterial && paidOrders.length > 0) {
      purchasedFileTypes = ['problem', 'etc'];
    } else {
      const purchasedSet = new Set<string>();
      for (const order of paidOrders) {
        for (const fileType of order.fileTypes || []) purchasedSet.add(fileType);
      }
      purchasedFileTypes = [...purchasedSet];
    }
  }
  // 관리자는 모든 파일 접근 가능
  if (user?.role === 'admin' && !material.isFree) {
    purchasedFileTypes = ['problem', 'etc'];
  }

  // 기존 피드백 조회 — native driver로 직접 조회 (Mongoose Map 우회)
  let existingFeedback: { difficulty: string; ratingChange: number; newRating: number } | null = null;
  if (userId) {
    const conn = await connectMongo();
    const col  = conn.connection.db!.collection('userskills');
    const doc  = await col.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    const feedbackHistory = (doc?.feedbackHistory ?? {}) as Record<string, { difficulty: string; ratingChange: number; newRating: number }>;
    const record = feedbackHistory[materialId] ?? null;
    if (record) {
      existingFeedback = {
        difficulty:   record.difficulty,
        ratingChange: record.ratingChange,
        newRating:    record.newRating,
      };
    }
  }

  // 관련 자료: 협업 필터링(함께 구매한 자료), 없으면 같은 과목+난이도 fallback
  let related = await getCollaborativeRecs(materialId, userId, 4);
  if (related.length === 0) {
    const fallbackFilter = resolvedSourceCategory === 'ebook'
      ? {
          $or: [
            { sourceCategory: 'ebook' },
            { type: '전자책' },
            { subject: '전자책' },
          ],
          isActive: true,
          materialId: { $ne: material.materialId },
        }
      : {
          isActive: true,
          subject: material.subject,
          materialId: { $ne: material.materialId },
          difficulty: { $gte: material.difficulty - 1, $lte: material.difficulty + 1 },
        };

    related = await Material.find(fallbackFilter)
      .sort({ downloadCount: -1 })
      .limit(4)
      .lean() as typeof related;
  }

  return (
    <MaterialDetail
      material={{
        materialId:      material.materialId,
        sourceCategory:  resolvedSourceCategory,
        type:            material.type,
        publisher:       material.publisher || '',
        bookTitle:       material.bookTitle || '',
        ebookDescription: material.ebookDescription || '',
        ebookToc:        Array.isArray(material.ebookToc) ? material.ebookToc : [],
        subject:         material.subject,
        topic:           material.topic,
        schoolLevel:     material.schoolLevel,
        gradeNumber:     material.gradeNumber,
        year:            material.year,
        semester:        material.semester,
        period:          material.period,
        schoolName:      material.schoolName,
        difficulty:      material.difficulty,
        difficultyLabel: DIFFICULTY_LABEL[material.difficulty] || '표준',
        difficultyColor: DIFFICULTY_COLOR[material.difficulty] || 'blue',
        fileType:        material.fileType || 'pdf',
        targetAudience:  material.targetAudience || 'student',
        isFree:          material.isFree,
        priceProblem:    material.priceProblem,
        priceEtc:        material.priceEtc,
        previewImages:   material.previewImages,
        pageCount:       resolvedPageCount ?? 0,
        viewCount:       material.viewCount,
        downloadCount:   material.downloadCount,
        problemFile:     material.problemFile  || null,
        etcFile:         material.etcFile      || null,
      }}
      isLoggedIn={!!userId}
      purchasedFileTypes={purchasedFileTypes}
      existingFeedback={existingFeedback}
      defaultRelatedViewMode={isMobileDevice ? 'list' : 'grid'}
      relatedMaterials={related.map((r) => ({
        materialId:      r.materialId,
        sourceCategory:  resolveSourceCategory(r),
        subject:         r.subject,
        topic:           r.topic,
        type:            r.type,
        publisher:       r.publisher || '',
        bookTitle:       r.bookTitle || '',
        schoolName:      r.schoolName,
        year:            r.year,
        gradeNumber:     r.gradeNumber,
        semester:        r.semester,
        difficulty:      r.difficulty,
        difficultyLabel: DIFFICULTY_LABEL[r.difficulty] || '표준',
        difficultyColor: DIFFICULTY_COLOR[r.difficulty] || 'blue',
        isFree:          r.isFree,
        priceProblem:    r.priceProblem,
        priceEtc:        r.priceEtc,
        targetAudience:  r.targetAudience || 'student',
        previewImages:   r.previewImages || [],
        downloadCount:   r.downloadCount,
      }))}
    />
  );
}
