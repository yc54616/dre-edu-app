import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import {
  MAX_PREVIEW_IMAGES,
  MATERIAL_CURRICULUMS,
  MATERIAL_SOURCE_CATEGORIES,
  MATERIAL_TYPES_BY_SOURCE,
  resolveMaterialCurriculumFromSubject,
  type MaterialCurriculum,
  type MaterialSourceCategory,
} from '@/lib/constants/material';
import { getMaterialFilePageCount } from '@/lib/material-page-count';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ materialId: string }> };

const normalizeSourceCategory = (value: unknown): MaterialSourceCategory => (
  typeof value === 'string' && MATERIAL_SOURCE_CATEGORIES.includes(value as MaterialSourceCategory)
    ? (value as MaterialSourceCategory)
    : 'school_exam'
);

const normalizeCurriculum = (
  value: unknown,
  sourceCategory: MaterialSourceCategory,
  subject: string
): MaterialCurriculum => {
  if (sourceCategory === 'ebook') return 'revised_2022';
  if (typeof value === 'string' && MATERIAL_CURRICULUMS.includes(value as MaterialCurriculum)) {
    return value as MaterialCurriculum;
  }
  return resolveMaterialCurriculumFromSubject(subject);
};

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const isEbookHint = (value: unknown) => {
  const normalized = normalizeText(value).toLowerCase();
  return normalized === '전자책' || normalized === 'ebook';
};

const textbookTypeHints: Set<string> = new Set(MATERIAL_TYPES_BY_SOURCE.textbook as readonly string[]);
const referenceTypeHints: Set<string> = new Set(MATERIAL_TYPES_BY_SOURCE.reference as readonly string[]);
const schoolNameRequiredTypeHints: Set<string> = new Set([
  '내신기출',
  '내신',
  '중간고사',
  '기말고사',
  '학교시험',
]);

const normalizeSourceCategoryWithHint = (
  sourceCategory: unknown,
  type: unknown,
  subject: unknown
): MaterialSourceCategory => {
  const normalized = normalizeSourceCategory(sourceCategory);
  const normalizedType = normalizeText(type);
  if (isEbookHint(type) || isEbookHint(subject)) return 'ebook';
  if (textbookTypeHints.has(normalizedType)) return 'textbook';
  if (referenceTypeHints.has(normalizedType)) return 'reference';
  return normalized;
};


const normalizeEbookToc = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 50);
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 50);
  }
  return [];
};

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

  try {
    await connectMongo();
    const { materialId } = await params;
    const body = await req.json();
    const existingMaterial = await Material.findOne(
      { materialId },
      { problemFile: 1, etcFile: 1, pageCount: 1 }
    ).lean() as { problemFile?: string | null; etcFile?: string | null; pageCount?: number } | null;
    if (!existingMaterial) {
      return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
    }

    const RATING_MAP: Record<number, number> = { 1: 600, 2: 800, 3: 1000, 4: 1300, 5: 1600 };
    const diff = parseInt(body.difficulty) || 3;
    const diffRating = body.difficultyRating
      ? Math.min(2000, Math.max(100, parseInt(body.difficultyRating)))
      : (RATING_MAP[diff] || 1000);
    const normalizedSourceCategory = normalizeSourceCategoryWithHint(
      body.sourceCategory,
      body.type,
      body.subject
    );
    const normalizedType = normalizeText(body.type);
    const normalizedPublisher = normalizeText(body.publisher);
    const normalizedSubject = normalizedSourceCategory === 'ebook'
      ? '전자책'
      : normalizeText(body.subject);
    const normalizedCurriculum = normalizeCurriculum(
      body.curriculum,
      normalizedSourceCategory,
      normalizedSubject
    );
    const normalizedTopic = normalizeText(body.topic);
    const normalizedBookTitleRaw = normalizeText(body.bookTitle);
    const normalizedBookTitle = normalizedSourceCategory === 'ebook'
      ? (normalizedBookTitleRaw || normalizedTopic)
      : normalizedBookTitleRaw;
    const normalizedEbookDescription = normalizedSourceCategory === 'ebook' ? normalizeText(body.ebookDescription) : '';
    const normalizedEbookToc = normalizedSourceCategory === 'ebook' ? normalizeEbookToc(body.ebookToc) : [];
    const normalizedFileType =
      ['pdf', 'hwp', 'both'].includes(body.fileType) ? body.fileType : 'pdf';
    const normalizedTargetAudience =
      ['student', 'teacher', 'all'].includes(body.targetAudience) ? body.targetAudience : 'student';
    const normalizedPriceProblem = Math.max(0, parseInt(body.priceProblem) || 0);
    const normalizedPriceEtc = Math.max(0, parseInt(body.priceEtc) || 0);
    const normalizedIsFree = !!body.isFree && normalizedPriceProblem === 0 && normalizedPriceEtc === 0;

    if (!normalizedType) {
      return NextResponse.json({ error: '유형은 필수입니다.' }, { status: 400 });
    }
    if (normalizedSourceCategory !== 'ebook' && !normalizedSubject) {
      return NextResponse.json({ error: '전자책을 제외한 자료는 과목이 필수입니다.' }, { status: 400 });
    }
    if (normalizedSourceCategory === 'ebook' && !normalizedBookTitle) {
      return NextResponse.json({ error: '전자책은 도서명 또는 주제/키워드 중 하나는 필수입니다.' }, { status: 400 });
    }
    if (
      normalizedSourceCategory === 'school_exam' &&
      schoolNameRequiredTypeHints.has(normalizedType) &&
      !(typeof body.schoolName === 'string' && body.schoolName.trim())
    ) {
      return NextResponse.json({ error: '내신기출 자료는 학교명이 필수입니다.' }, { status: 400 });
    }
    if (normalizedFileType === 'hwp' && normalizedTargetAudience === 'student') {
      return NextResponse.json({ error: 'HWP 자료는 학생용으로 등록할 수 없습니다.' }, { status: 400 });
    }
    const normalizedPreviewImages = Array.isArray(body.previewImages)
      ? body.previewImages.filter((v: unknown): v is string => typeof v === 'string').slice(0, MAX_PREVIEW_IMAGES)
      : undefined;
    const normalizedProblemFile = typeof body.problemFile !== 'undefined'
      ? (typeof body.problemFile === 'string' ? body.problemFile : null)
      : (existingMaterial.problemFile || null);
    const normalizedEtcFile = typeof body.etcFile !== 'undefined'
      ? (typeof body.etcFile === 'string' ? body.etcFile : null)
      : (existingMaterial.etcFile || null);
    const shouldRefreshPageCount =
      typeof body.problemFile !== 'undefined' ||
      typeof body.etcFile !== 'undefined' ||
      !existingMaterial.pageCount ||
      existingMaterial.pageCount <= 0;
    const normalizedPageCount = shouldRefreshPageCount
      ? await getMaterialFilePageCount(normalizedProblemFile || normalizedEtcFile)
      : (existingMaterial.pageCount ?? 0);

    const result = await Material.updateOne(
      { materialId },
      {
        $set: {
          curriculum:   normalizedCurriculum,
          sourceCategory: normalizedSourceCategory,
          type:         normalizedType,
          publisher:    normalizedPublisher,
          bookTitle:    normalizedBookTitle,
          ebookDescription: normalizedEbookDescription,
          ebookToc:     normalizedEbookToc,
          subject:      normalizedSubject,
          topic:        normalizedTopic,
          schoolLevel:  normalizedSourceCategory === 'ebook' ? '' : (body.schoolLevel || '고등학교'),
          gradeNumber:  normalizedSourceCategory === 'ebook' ? 0 : (parseInt(body.gradeNumber) || 2),
          year:         parseInt(body.year) || new Date().getFullYear(),
          semester:     normalizedSourceCategory === 'ebook' ? 0 : (parseInt(body.semester) || 1),
          period:       normalizedSourceCategory === 'ebook' ? '' : (body.period || ''),
          schoolName:   normalizedSourceCategory === 'school_exam' ? (body.schoolName || '') : '',
          regionSido:   normalizedSourceCategory === 'school_exam' ? (body.regionSido || '') : '',
          regionGugun:  normalizedSourceCategory === 'school_exam' ? (body.regionGugun || '') : '',
          difficulty:      diff,
          difficultyRating:diffRating,
          fileType:        normalizedFileType,
          targetAudience:  normalizedTargetAudience,
          teacherProductType: '',
          teacherClassPrepType: '',
          isFree:          normalizedIsFree,
          priceProblem: normalizedPriceProblem,
          priceEtc:     normalizedPriceEtc,
          ...(typeof body.problemFile !== 'undefined' && { problemFile: normalizedProblemFile }),
          ...(typeof body.etcFile     !== 'undefined' && { etcFile: normalizedEtcFile }),
          ...(shouldRefreshPageCount && { pageCount: normalizedPageCount ?? 0 }),
          ...(typeof normalizedPreviewImages !== 'undefined' && { previewImages: normalizedPreviewImages }),
          isActive:     body.isActive !== false,
          updatedAt:    new Date(),
        },
      }
    );

    if (result.matchedCount === 0) return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT /api/m/materials/[materialId]] error', error);
    return NextResponse.json({ error: '서버 오류로 자료 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 삭제할 수 있습니다.' }, { status: 403 });
  }

  await connectMongo();
  const { materialId } = await params;

  const material = await Material.findOne({ materialId })
    .select('problemFile etcFile previewImages')
    .lean() as { problemFile?: string | null; etcFile?: string | null; previewImages?: string[] } | null;

  await Material.deleteOne({ materialId });

  // 연결된 파일 삭제
  if (material) {
    const tryRemove = (path: string) => unlink(path).catch(() => {});

    if (material.problemFile) {
      await tryRemove(join(process.cwd(), 'uploads', 'files', material.problemFile));
    }
    if (material.etcFile) {
      await tryRemove(join(process.cwd(), 'uploads', 'files', material.etcFile));
    }
    for (const preview of material.previewImages ?? []) {
      await tryRemove(join(process.cwd(), 'public', 'uploads', 'previews', preview));
    }
  }

  return NextResponse.json({ success: true });
}
