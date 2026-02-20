import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import type { SortOrder } from 'mongoose';

export const dynamic = 'force-dynamic';

// GET /api/m/materials
export async function GET(req: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(req.url);

  const subject    = searchParams.get('subject')    || '';
  const topic      = searchParams.get('topic')      || '';
  const type       = searchParams.get('type')       || '';
  const difficulty = searchParams.get('difficulty') || '';
  const grade      = searchParams.get('grade')      || '';
  const sort       = searchParams.get('sort')       || 'latest';
  const page       = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit      = 20;

  const filter: Record<string, unknown> = { isActive: true };
  if (subject)    filter.subject      = subject;
  if (topic)      filter.topic        = topic;
  if (type)       filter.type         = type;
  if (difficulty) filter.difficulty   = Number(difficulty);
  if (grade)      filter.gradeNumber  = Number(grade);

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

  await connectMongo();
  const body = await req.json();
  const { type, subject, topic, schoolLevel, gradeNumber, year, semester, period,
          schoolName, regionSido, regionGugun, difficulty,
          fileType, targetAudience, isFree, priceProblem, priceEtc } = body;

  if (!type || !subject) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
  }

  const RATING_MAP: Record<number, number> = { 1: 600, 2: 800, 3: 1000, 4: 1300, 5: 1600 };
  const diff = parseInt(difficulty) || 3;
  const diffRating = body.difficultyRating
    ? Math.min(2000, Math.max(100, parseInt(body.difficultyRating)))
    : (RATING_MAP[diff] || 1000);

  const { problemFile, etcFile, previewImages } = body;

  const material = await Material.create({
    uploaderId:     (session.user as { name?: string }).name || 'admin',
    type, subject,  topic: topic || '',
    schoolLevel:    schoolLevel || '고등학교',
    gradeNumber:    parseInt(gradeNumber) || 2,
    year:           parseInt(year) || new Date().getFullYear(),
    semester:       parseInt(semester) || 1,
    period:         period || '',
    schoolName:     schoolName || '',
    regionSido:     regionSido || '',
    regionGugun:    regionGugun || '',
    difficulty:     diff,
    difficultyRating: diffRating,
    fileType:       ['pdf', 'hwp', 'both'].includes(fileType) ? fileType : 'pdf',
    targetAudience: ['student', 'teacher', 'all'].includes(targetAudience) ? targetAudience : 'student',
    isFree:         !!isFree,
    priceProblem:   parseInt(priceProblem) || 0,
    priceEtc:       parseInt(priceEtc) || 0,
    problemFile:    typeof problemFile === 'string' ? problemFile : null,
    etcFile:        typeof etcFile === 'string' ? etcFile : null,
    previewImages:  Array.isArray(previewImages) ? previewImages : [],
    isActive:       true,
  });

  return NextResponse.json({ material }, { status: 201 });
}
