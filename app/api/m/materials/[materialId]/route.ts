import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ materialId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  await connectMongo();
  const { materialId } = await params;
  const material = await Material.findOne({ materialId, isActive: true }).lean();
  if (!material) return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });

  // 조회수 증가
  await Material.updateOne({ materialId }, { $inc: { viewCount: 1 } });

  return NextResponse.json({ material });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 수정할 수 있습니다.' }, { status: 403 });
  }

  await connectMongo();
  const { materialId } = await params;
  const body = await req.json();

  const RATING_MAP: Record<number, number> = { 1: 600, 2: 800, 3: 1000, 4: 1300, 5: 1600 };
  const diff = parseInt(body.difficulty) || 3;
  const diffRating = body.difficultyRating
    ? Math.min(2000, Math.max(100, parseInt(body.difficultyRating)))
    : (RATING_MAP[diff] || 1000);

  const result = await Material.updateOne(
    { materialId },
    {
      $set: {
        type:         body.type,
        subject:      body.subject,
        topic:        body.topic || '',
        schoolLevel:  body.schoolLevel || '고등학교',
        gradeNumber:  parseInt(body.gradeNumber) || 2,
        year:         parseInt(body.year) || new Date().getFullYear(),
        semester:     parseInt(body.semester) || 1,
        period:       body.period || '',
        schoolName:   body.schoolName || '',
        regionSido:   body.regionSido || '',
        regionGugun:  body.regionGugun || '',
        difficulty:      diff,
        difficultyRating:diffRating,
        fileType:        ['pdf', 'hwp', 'both'].includes(body.fileType) ? body.fileType : 'pdf',
        targetAudience:  ['student', 'teacher', 'all'].includes(body.targetAudience) ? body.targetAudience : 'student',
        isFree:          !!body.isFree,
        priceProblem: parseInt(body.priceProblem) || 0,
        priceEtc:     parseInt(body.priceEtc) || 0,
        ...(typeof body.problemFile !== 'undefined' && { problemFile: body.problemFile || null }),
        ...(typeof body.etcFile     !== 'undefined' && { etcFile:     body.etcFile     || null }),
        ...(Array.isArray(body.previewImages)        && { previewImages: body.previewImages }),
        isActive:     body.isActive !== false,
      },
    }
  );

  if (result.matchedCount === 0) return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 삭제할 수 있습니다.' }, { status: 403 });
  }

  await connectMongo();
  const { materialId } = await params;
  await Material.deleteOne({ materialId });
  return NextResponse.json({ success: true });
}
