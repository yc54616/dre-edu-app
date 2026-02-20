import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecommendations } from '@/lib/recommendation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session ? (session.user as { id?: string }).id ?? null : null;
  const limit = parseInt(new URL(req.url).searchParams.get('limit') || '6');
  const materials = await getRecommendations(userId, limit);
  return NextResponse.json({ materials });
}
