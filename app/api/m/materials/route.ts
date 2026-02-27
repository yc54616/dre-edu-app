import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import {
  getMaterialSubjectFilterCandidates,
  LEGACY_ONLY_MATERIAL_SUBJECTS,
  MAX_PREVIEW_IMAGES,
  MATERIAL_CURRICULUMS,
  MATERIAL_SOURCE_CATEGORIES,
  MATERIAL_TYPES_BY_SOURCE,
  resolveMaterialCurriculumFromSubject,
  type MaterialCurriculum,
  type MaterialSourceCategory,
} from '@/lib/constants/material';
import { getMaterialFilePageCount } from '@/lib/material-page-count';
import { normalizeText } from '@/lib/api-helpers';
import type { SortOrder } from 'mongoose';

export const dynamic = 'force-dynamic';

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

const legacyOnlySubjectHints = LEGACY_ONLY_MATERIAL_SUBJECTS as readonly string[];

const buildCurriculumQuery = (curriculum: MaterialCurriculum): Record<string, unknown> => (
  curriculum === 'legacy'
    ? {
        $or: [
          { curriculum: 'legacy' },
          { curriculum: { $exists: false }, subject: { $in: legacyOnlySubjectHints } },
        ],
      }
    : {
        $or: [
          { curriculum: 'revised_2022' },
          { curriculum: { $exists: false }, subject: { $nin: legacyOnlySubjectHints } },
        ],
      }
);


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

// GET /api/m/materials
export async function GET(req: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(req.url);

  const subject    = searchParams.get('subject')    || '';
  const curriculum = searchParams.get('curriculum') || '';
  const sourceCategory = searchParams.get('sourceCategory') || '';
  const topic      = searchParams.get('topic')      || '';
  const type       = searchParams.get('type')       || '';
  const difficulty = searchParams.get('difficulty') || '';
  const schoolLevel = searchParams.get('schoolLevel') || '';
  const gradeNumberParam = searchParams.get('gradeNumber') || searchParams.get('grade') || '';
  const sort       = searchParams.get('sort')       || 'latest';
  const page       = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit      = 20;

  const filter: Record<string, unknown> = { isActive: true };
  const andFilters: Record<string, unknown>[] = [];
  if (subject) {
    const subjectCandidates = getMaterialSubjectFilterCandidates(subject);
    filter.subject = subjectCandidates.length > 1 ? { $in: subjectCandidates } : subject;
  }
  if (MATERIAL_CURRICULUMS.includes(curriculum as MaterialCurriculum)) {
    andFilters.push(buildCurriculumQuery(curriculum as MaterialCurriculum));
  }
  if (sourceCategory && MATERIAL_SOURCE_CATEGORIES.includes(sourceCategory as MaterialSourceCategory)) {
    if (sourceCategory === 'ebook') {
      andFilters.push({
        $or: [
        { sourceCategory: 'ebook' },
        { type: '전자책' },
        { subject: '전자책' },
      ],
      });
    } else {
      filter.sourceCategory = sourceCategory;
    }
  }
  if (topic)      filter.topic        = topic;
  if (type)       filter.type         = type;
  if (difficulty) filter.difficulty   = Number(difficulty);
  if (schoolLevel) filter.schoolLevel = schoolLevel;
  if (gradeNumberParam) {
    const parsedGradeNumber = Number.parseInt(gradeNumberParam, 10);
    if (Number.isFinite(parsedGradeNumber)) {
      filter.gradeNumber = parsedGradeNumber;
    }
  }
  if (andFilters.length > 0) filter.$and = andFilters;

  const sortMap: Record<string, Record<string, SortOrder>> = {
    latest:   { createdAt: -1 },
    popular:  { downloadCount: -1 },
    view:     { viewCount: -1 },
    diff_asc: { difficultyRating: 1 },
    diff_desc:{ difficultyRating: -1 },
  };

  const [materials, total] = await Promise.all([
    Material.find(filter).sort(sortMap[sort] || { createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Material.countDocuments(filter),
  ]);

  return NextResponse.json({ materials, total, page, totalPage: Math.ceil(total / limit) });
}

// POST /api/m/materials — 자료 등록 (교사/관리자)
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: '관리자만 자료를 등록할 수 있습니다.' }, { status: 403 });
  }

  try {
    await connectMongo();
    const body = await req.json();
    const { sourceCategory, type, publisher, bookTitle, subject, topic, schoolLevel, gradeNumber, year, semester, period,
            schoolName, regionSido, regionGugun, difficulty,
            fileType, targetAudience, isFree, priceProblem, priceEtc } = body;
    const normalizedSourceCategory = normalizeSourceCategoryWithHint(sourceCategory, type, subject);
    const normalizedType = normalizeText(type);
    const normalizedPublisher = normalizeText(publisher);
    const normalizedSubject = normalizedSourceCategory === 'ebook'
      ? '전자책'
      : normalizeText(subject);
    const normalizedCurriculum = normalizeCurriculum(body.curriculum, normalizedSourceCategory, normalizedSubject);
    const normalizedTopic = normalizeText(topic);
    const normalizedBookTitleRaw = normalizeText(bookTitle);
    const normalizedBookTitle = normalizedSourceCategory === 'ebook'
      ? (normalizedBookTitleRaw || normalizedTopic)
      : normalizedBookTitleRaw;
    const normalizedEbookDescription = normalizedSourceCategory === 'ebook' ? normalizeText(body.ebookDescription) : '';
    const normalizedEbookToc = normalizedSourceCategory === 'ebook' ? normalizeEbookToc(body.ebookToc) : [];
    const normalizedFileType =
      ['pdf', 'hwp', 'both'].includes(fileType) ? fileType : 'pdf';
    const normalizedTargetAudience =
      ['student', 'teacher', 'all'].includes(targetAudience) ? targetAudience : 'student';
    const normalizedPriceProblem = Math.max(0, parseInt(priceProblem) || 0);
    const normalizedPriceEtc = Math.max(0, parseInt(priceEtc) || 0);
    const normalizedIsFree = !!isFree && normalizedPriceProblem === 0 && normalizedPriceEtc === 0;

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
      !(typeof schoolName === 'string' && schoolName.trim())
    ) {
      return NextResponse.json({ error: '내신기출 자료는 학교명이 필수입니다.' }, { status: 400 });
    }

    const RATING_MAP: Record<number, number> = { 1: 600, 2: 800, 3: 1000, 4: 1300, 5: 1600 };
    const diff = parseInt(difficulty) || 3;
    const diffRating = body.difficultyRating
      ? Math.min(2000, Math.max(100, parseInt(body.difficultyRating)))
      : (RATING_MAP[diff] || 1000);

    if (normalizedFileType === 'hwp' && normalizedTargetAudience === 'student') {
      return NextResponse.json({ error: 'HWP 자료는 학생용으로 등록할 수 없습니다.' }, { status: 400 });
    }

    const { problemFile, etcFile, previewImages } = body;
    const normalizedProblemFile = typeof problemFile === 'string' ? problemFile : null;
    const normalizedEtcFile = typeof etcFile === 'string' ? etcFile : null;
    const normalizedPageCount = await getMaterialFilePageCount(normalizedProblemFile || normalizedEtcFile);
    const normalizedPreviewImages = Array.isArray(previewImages)
      ? previewImages.filter((v: unknown): v is string => typeof v === 'string').slice(0, MAX_PREVIEW_IMAGES)
      : [];

    const material = await Material.create({
      uploaderId:     (session.user as { id?: string }).id || 'admin',
      curriculum:     normalizedCurriculum,
      sourceCategory: normalizedSourceCategory,
      type:           normalizedType,
      subject:        normalizedSubject,
      topic:          normalizedTopic,
      publisher:      normalizedPublisher,
      bookTitle:      normalizedBookTitle,
      ebookDescription: normalizedEbookDescription,
      ebookToc:       normalizedEbookToc,
      schoolLevel:    normalizedSourceCategory === 'ebook' ? '' : (schoolLevel || '고등학교'),
      gradeNumber:    normalizedSourceCategory === 'ebook' ? 0 : (parseInt(gradeNumber) || 2),
      year:           parseInt(year) || new Date().getFullYear(),
      semester:       normalizedSourceCategory === 'ebook' ? 0 : (parseInt(semester) || 1),
      period:         normalizedSourceCategory === 'ebook' ? '' : (period || ''),
      schoolName:     normalizedSourceCategory === 'school_exam' ? (schoolName || '') : '',
      regionSido:     normalizedSourceCategory === 'school_exam' ? (regionSido || '') : '',
      regionGugun:    normalizedSourceCategory === 'school_exam' ? (regionGugun || '') : '',
      difficulty:     diff,
      difficultyRating: diffRating,
      fileType:       normalizedFileType,
      targetAudience: normalizedTargetAudience,
      teacherProductType: '',
      teacherClassPrepType: '',
      isFree:         normalizedIsFree,
      priceProblem:   normalizedPriceProblem,
      priceEtc:       normalizedPriceEtc,
      problemFile:    normalizedProblemFile,
      etcFile:        normalizedEtcFile,
      pageCount:      normalizedPageCount ?? 0,
      previewImages:  normalizedPreviewImages,
      isActive:       true,
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/m/materials] error', error);
    return NextResponse.json({ error: '서버 오류로 자료 저장에 실패했습니다.' }, { status: 500 });
  }
}
