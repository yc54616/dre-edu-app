import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import HallOfFameEntry from '@/lib/models/HallOfFameEntry';
import { clampReviewStars, type HallOfFameKind } from '@/lib/hall-of-fame';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ entryId: string }> };

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeKind = (value: unknown): HallOfFameKind | null => {
  if (value === 'admission' || value === 'review') return value;
  return null;
};

const parseSortOrder = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.trunc(parsed);
};

const ensureAdmin = async () => {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return null;
  }
  return session;
};

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  await connectMongo();
  const { entryId } = await params;
  const entry = await HallOfFameEntry.findOne({ entryId }).lean();
  if (!entry) return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json({ entry });
}

export async function PUT(req: NextRequest, { params }: Params) {
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

  await connectMongo();
  const { entryId } = await params;
  const existing = await HallOfFameEntry.findOne({ entryId }).lean();
  if (!existing) {
    return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
  }

  const nextKind = normalizeKind(body.kind) || (existing.kind as HallOfFameKind);
  const nextIsPublished = typeof body.isPublished === 'boolean'
    ? body.isPublished
    : Boolean(existing.isPublished);
  const nextSortOrder = typeof body.sortOrder !== 'undefined'
    ? parseSortOrder(body.sortOrder)
    : Number(existing.sortOrder || 0);

  const patch: Record<string, unknown> = {
    kind: nextKind,
    isPublished: nextIsPublished,
    sortOrder: nextSortOrder,
    updatedAt: new Date(),
  };

  if (nextKind === 'admission') {
    const univ = normalizeText(typeof body.univ !== 'undefined' ? body.univ : existing.univ);
    const major = normalizeText(typeof body.major !== 'undefined' ? body.major : existing.major);
    const student = normalizeText(typeof body.student !== 'undefined' ? body.student : existing.student);
    const school = normalizeText(typeof body.school !== 'undefined' ? body.school : existing.school);
    const badge = normalizeText(typeof body.badge !== 'undefined' ? body.badge : existing.badge);
    const desc = normalizeText(typeof body.desc !== 'undefined' ? body.desc : existing.desc);

    if (!univ || !major || !student || !desc) {
      return NextResponse.json(
        { error: '합격 사례는 학교, 학과, 학생명, 설명이 필수입니다.' },
        { status: 400 },
      );
    }

    patch.univ = univ;
    patch.major = major;
    patch.student = student;
    patch.school = school;
    patch.badge = badge || '수시 합격';
    patch.desc = desc;
    patch.name = '';
    patch.content = '';
    patch.tag = '';
    patch.stars = 5;
  } else {
    const name = normalizeText(typeof body.name !== 'undefined' ? body.name : existing.name);
    const content = normalizeText(typeof body.content !== 'undefined' ? body.content : existing.content);
    const tag = normalizeText(typeof body.tag !== 'undefined' ? body.tag : existing.tag);
    const stars = typeof body.stars !== 'undefined'
      ? clampReviewStars(body.stars)
      : clampReviewStars(existing.stars);

    if (!name || !content) {
      return NextResponse.json({ error: '수강 후기는 이름과 본문이 필수입니다.' }, { status: 400 });
    }

    patch.name = name;
    patch.content = content;
    patch.tag = tag || '수강생';
    patch.stars = stars;
    patch.univ = '';
    patch.major = '';
    patch.student = '';
    patch.school = '';
    patch.badge = '';
    patch.desc = '';
  }

  const result = await HallOfFameEntry.updateOne({ entryId }, { $set: patch });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
  }

  await connectMongo();
  const { entryId } = await params;
  const result = await HallOfFameEntry.deleteOne({ entryId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
