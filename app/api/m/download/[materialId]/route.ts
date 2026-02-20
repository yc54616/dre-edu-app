import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import Order from '@/lib/models/Order';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ materialId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { materialId } = await params;
  const fileType = req.nextUrl.searchParams.get('type') || 'problem'; // 'problem' | 'etc'

  await connectMongo();
  const material = await Material.findOne({ materialId, isActive: true }).lean();

  if (!material) {
    return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
  }

  const filename = fileType === 'etc' ? material.etcFile : material.problemFile;
  if (!filename) {
    return NextResponse.json({ error: '파일이 등록되지 않았습니다.' }, { status: 404 });
  }

  // 유료 자료: 관리자가 아닌 경우 구매 확인
  const user = session.user as { id?: string; role?: string };
  const role = user.role || 'student';
  if (!material.isFree && role !== 'admin') {
    const order = await Order.findOne({
      userId:     user.id,
      materialId,
      status:     'paid',
      fileTypes:  fileType,
    }).lean();
    if (!order) {
      return NextResponse.json({ error: '구매 후 다운로드할 수 있습니다.' }, { status: 403 });
    }
  }

  const filePath = join(process.cwd(), 'uploads', 'files', filename);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(filePath);
  } catch {
    return NextResponse.json({ error: '파일 읽기 실패' }, { status: 500 });
  }

  // 다운로드 수 증가
  await Material.updateOne({ materialId }, { $inc: { downloadCount: 1 } });

  const ext = filename.split('.').pop()?.toLowerCase() || 'pdf';
  const contentType =
    ext === 'hwp'
      ? 'application/x-hwp'
      : 'application/pdf';

  const downloadName = [
    material.schoolName,
    material.year         ? `${material.year}년`         : '',
    material.gradeNumber  ? `${material.gradeNumber}학년` : '',
    material.semester     ? `${material.semester}학기`    : '',
    material.subject,
    material.topic,
    fileType === 'etc' ? '(기타)' : '',
  ].filter(Boolean).join('_') + `.${ext}`;

  return new NextResponse(fileBuffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
      'Content-Length': String(fileBuffer.length),
    },
  });
}
