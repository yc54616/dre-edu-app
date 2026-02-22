import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { generatePreview } from '@/lib/generatePreview';

export const dynamic = 'force-dynamic';

// HWP 확장자로 허용
const ALLOWED_EXTENSIONS = {
  preview: ['jpg', 'jpeg', 'png', 'webp'],
  problem: ['pdf', 'hwp'],
  etc:     ['pdf', 'hwp'],
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session || role !== 'admin') {
      return NextResponse.json({ error: '관리자만 업로드할 수 있습니다.' }, { status: 403 });
    }

    let fd: globalThis.FormData;
    try {
      fd = await req.formData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[upload] formData 파싱 실패:', msg);
      return NextResponse.json({ error: `파일 파싱 실패: ${msg}` }, { status: 400 });
    }

    const file     = fd.get('file') as File | null;
    const fileRole = (fd.get('fileRole') as string | null) || 'problem';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: '파일이 비어있습니다.' }, { status: 400 });
    }

    const ext = (file.name ?? '').split('.').pop()?.toLowerCase() ?? '';
    const allowedExts = ALLOWED_EXTENSIONS[fileRole as keyof typeof ALLOWED_EXTENSIONS] || [];

    if (!ext || !allowedExts.includes(ext)) {
      return NextResponse.json({
        error: `허용되지 않는 파일 형식입니다. (${allowedExts.join(', ')})`,
      }, { status: 400 });
    }

    const maxSize = fileRole === 'preview' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `파일 크기 초과 (최대 ${fileRole === 'preview' ? '10' : '100'}MB)`,
      }, { status: 400 });
    }

    const filename = `${nanoid(12)}.${ext}`;
    const bytes    = await file.arrayBuffer();
    const buffer   = Buffer.from(bytes);

    let previews: string[] = [];
    let previewWarning = '';

    if (fileRole === 'preview') {
      const dir = join(process.cwd(), 'public', 'uploads', 'previews');
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, filename), buffer);
    } else {
      const dir      = join(process.cwd(), 'uploads', 'files');
      await mkdir(dir, { recursive: true });
      const savedPath = join(dir, filename);
      await writeFile(savedPath, buffer);

      // 문제 파일만 미리보기 자동 생성 (답지·해설은 제외)
      if (fileRole === 'problem') {
        previews = await generatePreview(savedPath, ext);
        if (ext === 'hwp' && previews.length === 0) {
          previewWarning = 'HWP 미리보기를 자동 생성하지 못했습니다. 미리보기 이미지를 직접 업로드해 주세요.';
        }
      }
    }

    return NextResponse.json({ filename, previews, previewWarning });

  } catch (e) {
    console.error('[upload] 서버 오류:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '서버 오류' },
      { status: 500 }
    );
  }
}
