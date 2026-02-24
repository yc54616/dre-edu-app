import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecommendations, getTeacherRecommendations } from '@/lib/recommendation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  const userId = user?.id ?? null;
  const role = user?.role || 'student';

  const rawLimit = Number.parseInt(new URL(req.url).searchParams.get('limit') || '6', 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(24, Math.max(1, rawLimit)) : 6;

  const modeCookie = req.cookies.get('dre-mode')?.value;
  const isTeacherMode = role === 'teacher' && modeCookie !== 'student';

  const materials = (isTeacherMode && userId)
    ? await getTeacherRecommendations(userId, limit)
    : await getRecommendations(userId, limit);

  return NextResponse.json({ materials, mode: isTeacherMode ? 'teacher' : 'student' });
}
