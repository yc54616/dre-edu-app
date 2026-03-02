import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Material from '@/lib/models/Material';
import Order from '@/lib/models/Order';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { buildMaterialNameParts } from '@/lib/material-display';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ materialId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { materialId } = await params;
  const fileType: 'problem' | 'etc' = req.nextUrl.searchParams.get('type') === 'etc' ? 'etc' : 'problem';

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
  let paidOrder: { orderId: string } | null = null;
  if (!material.isFree && role !== 'admin') {
    const isTeacherMaterial = material.targetAudience === 'teacher';
    paidOrder = (
      isTeacherMaterial
        ? await Order.findOne(
          {
            userId: user.id,
            materialId,
            status: 'paid',
          },
          { orderId: 1 }
        ).sort({ createdAt: -1 }).lean()
        : await Order.findOne(
          {
            userId: user.id,
            materialId,
            status: 'paid',
            fileTypes: fileType,
          },
          { orderId: 1 }
        ).sort({ createdAt: -1 }).lean()
    ) as { orderId: string } | null;

    if (!paidOrder) {
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

  // 유료 주문 다운로드 이력 기록(1회라도 다운로드 시 환불 불가 정책에 사용)
  if (paidOrder) {
    // Use native collection update so this works even if an older cached Mongoose schema is loaded.
    const updateResult = await Order.collection.updateOne(
      { orderId: paidOrder.orderId, status: 'paid' },
      {
        $set: {
          hasDownloaded: true,
          downloadedAt: new Date(),
        },
        $addToSet: {
          downloadedFileTypes: fileType,
        },
      }
    );
    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: '주문 상태가 변경되어 다운로드할 수 없습니다.' }, { status: 409 });
    }
  }

  // 다운로드 수 증가
  await Material.updateOne({ materialId }, { $inc: { downloadCount: 1 } });

  const ext = filename.split('.').pop()?.toLowerCase() || 'pdf';
  const contentType =
    ext === 'hwp'
      ? 'application/x-hwp'
      : ext === 'hwpx'
        ? 'application/octet-stream'
      : 'application/pdf';

  const nameParts = buildMaterialNameParts(material);
  if (fileType === 'etc') nameParts.push('(기타)');
  const downloadName = `${nameParts.join('_') || material.materialId}.${ext}`;

  return new NextResponse(fileBuffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
      'Content-Length': String(fileBuffer.length),
    },
  });
}
