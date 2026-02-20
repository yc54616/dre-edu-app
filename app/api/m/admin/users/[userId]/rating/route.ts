import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import UserSkill from '@/lib/models/UserSkill';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

/* ── GET /api/m/admin/users/[userId]/rating ── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { userId } = await params;
  await connectMongo();

  const user = await User.findById(userId).select('username email').lean();
  if (!user) return NextResponse.json({ error: '사용자 없음' }, { status: 404 });

  const skill = await UserSkill.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();

  const topicSkills: Record<string, { rating: number; attempts: number; correct: number }> = {};
  if (skill) {
    const raw = (skill as unknown as { topicSkills?: Record<string, { rating: number; attempts: number; correct: number }> }).topicSkills;
    if (raw && typeof raw === 'object') {
      for (const [topic, ts] of Object.entries(raw)) {
        topicSkills[topic] = { rating: ts.rating, attempts: ts.attempts, correct: ts.correct };
      }
    }
  }

  return NextResponse.json({
    overallRating: skill?.overallRating ?? 1000,
    totalAttempts: skill?.totalAttempts ?? 0,
    totalCorrect:  skill?.totalCorrect  ?? 0,
    topicSkills,
  });
}

/* ── PATCH /api/m/admin/users/[userId]/rating ── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { userId } = await params;
  const body = await req.json() as {
    overallRating?: number;
    topicSkills?: Record<string, number | null>; // null = 삭제
  };

  await connectMongo();

  let skill = await UserSkill.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (!skill) {
    skill = new UserSkill({ userId: new mongoose.Types.ObjectId(userId) });
  }

  if (typeof body.overallRating === 'number') {
    skill.overallRating = Math.max(100, Math.min(3000, body.overallRating));
  }

  if (body.topicSkills && typeof body.topicSkills === 'object') {
    for (const [topic, rating] of Object.entries(body.topicSkills)) {
      if (rating === null) {
        skill.topicSkills.delete(topic);
      } else if (typeof rating === 'number') {
        const existing = skill.topicSkills.get(topic) || { rating: 1000, attempts: 0, correct: 0 };
        skill.topicSkills.set(topic, { ...existing, rating: Math.max(100, Math.min(3000, rating)) });
      }
    }
  }

  skill.updatedAt = new Date();
  await skill.save();

  return NextResponse.json({ ok: true, overallRating: skill.overallRating });
}
