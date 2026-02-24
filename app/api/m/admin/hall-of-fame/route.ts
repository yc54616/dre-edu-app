import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import HallOfFameEntry from '@/lib/models/HallOfFameEntry';
import { clampReviewStars, type HallOfFameKind } from '@/lib/hall-of-fame';

export const dynamic = 'force-dynamic';

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeKind = (value: unknown): HallOfFameKind | null => {
  if (value === 'admission' || value === 'review') return value;
  return null;
};

const ensureAdmin = async () => {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return null;
  }
  return session;
};

const parseSortOrder = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.trunc(parsed);
};

export async function GET(req: NextRequest) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  await connectMongo();
  const { searchParams } = new URL(req.url);
  const q = normalizeText(searchParams.get('q'));
  const kind = normalizeKind(searchParams.get('kind'));
  const published = normalizeText(searchParams.get('published'));
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limitRaw = parseInt(searchParams.get('limit') || '30', 10);
  const limit = Math.max(1, Math.min(100, Number.isFinite(limitRaw) ? limitRaw : 30));

  const filter: Record<string, unknown> = {};
  if (kind) filter.kind = kind;
  if (published === 'published') filter.isPublished = true;
  if (published === 'unpublished') filter.isPublished = false;
  if (q) {
    filter.$or = [
      { univ: { $regex: q, $options: 'i' } },
      { major: { $regex: q, $options: 'i' } },
      { student: { $regex: q, $options: 'i' } },
      { school: { $regex: q, $options: 'i' } },
      { badge: { $regex: q, $options: 'i' } },
      { desc: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
      { tag: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
      { entryId: { $regex: q, $options: 'i' } },
    ];
  }

  const [entries, total] = await Promise.all([
    HallOfFameEntry.find(filter)
      .sort({ sortOrder: 1, updatedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    HallOfFameEntry.countDocuments(filter),
  ]);

  return NextResponse.json({
    entries,
    total,
    page,
    totalPage: Math.max(1, Math.ceil(total / limit)),
  });
}

export async function POST(req: NextRequest) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const kind = normalizeKind(body.kind);
  if (!kind) {
    return NextResponse.json({ error: '유형(kind)은 admission 또는 review만 가능합니다.' }, { status: 400 });
  }

  const isPublished = body.isPublished !== false;
  const sortOrder = parseSortOrder(body.sortOrder);
  const createdBy = normalizeText((session.user as { name?: string; id?: string } | undefined)?.name)
    || normalizeText((session.user as { id?: string } | undefined)?.id)
    || 'admin';

  await connectMongo();

  if (kind === 'admission') {
    const univ = normalizeText(body.univ);
    const major = normalizeText(body.major);
    const student = normalizeText(body.student);
    const school = normalizeText(body.school);
    const badge = normalizeText(body.badge);
    const desc = normalizeText(body.desc);

    if (!univ || !major || !student || !desc) {
      return NextResponse.json(
        { error: '합격 사례는 학교, 학과, 학생명, 설명이 필수입니다.' },
        { status: 400 },
      );
    }

    const entry = await HallOfFameEntry.create({
      kind,
      isPublished,
      sortOrder,
      createdBy,
      univ,
      major,
      student,
      school,
      badge: badge || '수시 합격',
      desc,
      name: '',
      content: '',
      tag: '',
      stars: 5,
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  }

  const name = normalizeText(body.name);
  const content = normalizeText(body.content);
  const tag = normalizeText(body.tag);
  const stars = clampReviewStars(body.stars);

  if (!name || !content) {
    return NextResponse.json({ error: '수강 후기는 이름과 본문이 필수입니다.' }, { status: 400 });
  }

  const entry = await HallOfFameEntry.create({
    kind,
    isPublished,
    sortOrder,
    createdBy,
    univ: '',
    major: '',
    student: '',
    school: '',
    badge: '',
    desc: '',
    name,
    content,
    tag: tag || '수강생',
    stars,
  });

  return NextResponse.json({ success: true, entry }, { status: 201 });
}
