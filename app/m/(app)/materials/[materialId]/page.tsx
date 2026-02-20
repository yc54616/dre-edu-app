import mongoose from 'mongoose';
import connectMongo from '@/lib/mongoose';
import Material, { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/lib/models/Material';
import Order from '@/lib/models/Order';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import MaterialDetail from './MaterialDetail';
import { getCollaborativeRecs } from '@/lib/recommendation';

export default async function MaterialPage({ params }: { params: Promise<{ materialId: string }> }) {
  const { materialId } = await params;
  await connectMongo();

  const material = await Material.findOneAndUpdate(
    { materialId, isActive: true },
    { $inc: { viewCount: 1 } },
    { returnDocument: 'after' }
  ).lean();

  if (!material) notFound();

  const session = await auth();
  const user    = session?.user as { id?: string; role?: string } | undefined;
  const userId  = user?.id ?? null;

  // 구매 여부 조회 (유료 자료 + 로그인 상태)
  let purchasedFileTypes: string[] = [];
  if (userId && !material.isFree) {
    const order = await Order.findOne({ userId, materialId, status: 'paid' }).lean();
    if (order) purchasedFileTypes = order.fileTypes;
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
    related = await Material.find({
      isActive:   true,
      subject:    material.subject,
      materialId: { $ne: material.materialId },
      difficulty: { $gte: material.difficulty - 1, $lte: material.difficulty + 1 },
    })
      .sort({ downloadCount: -1 })
      .limit(4)
      .lean() as typeof related;
  }

  return (
    <MaterialDetail
      material={{
        materialId:      material.materialId,
        type:            material.type,
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
        isFree:          material.isFree,
        priceProblem:    material.priceProblem,
        priceEtc:        material.priceEtc,
        previewImages:   material.previewImages,
        viewCount:       material.viewCount,
        downloadCount:   material.downloadCount,
        problemFile:     material.problemFile  || null,
        etcFile:         material.etcFile      || null,
      }}
      isLoggedIn={!!userId}
      purchasedFileTypes={purchasedFileTypes}
      existingFeedback={existingFeedback}
      relatedMaterials={related.map((r) => ({
        materialId:      r.materialId,
        subject:         r.subject,
        topic:           r.topic,
        type:            r.type,
        schoolName:      r.schoolName,
        year:            r.year,
        gradeNumber:     r.gradeNumber,
        semester:        r.semester,
        difficulty:      r.difficulty,
        difficultyLabel: DIFFICULTY_LABEL[r.difficulty] || '표준',
        difficultyColor: DIFFICULTY_COLOR[r.difficulty] || 'blue',
        isFree:          r.isFree,
        priceProblem:    r.priceProblem,
        previewImages:   r.previewImages || [],
        downloadCount:   r.downloadCount,
      }))}
    />
  );
}
