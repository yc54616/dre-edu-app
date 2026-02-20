/**
 * PDF / HWP → 미리보기 이미지 자동 생성
 *
 * PDF : pdftoppm (poppler-utils) → JPEG
 * HWP : LibreOffice headless → PDF → pdftoppm → JPEG
 */
import { exec }      from 'child_process';
import { promisify } from 'util';
import { join }      from 'path';
import { mkdir, readdir, copyFile, unlink } from 'fs/promises';
import { nanoid } from 'nanoid';

const execAsync = promisify(exec);

const PREVIEW_DIR = () => join(process.cwd(), 'public', 'uploads', 'previews');
const TMP_DIR     = () => join(process.cwd(), 'tmp', 'preview_gen');

/**
 * @param filePath  저장된 원본 파일의 절대 경로
 * @param ext       'pdf' | 'hwp'
 * @param maxPages  변환할 최대 페이지 수 (기본 3)
 * @returns         생성된 미리보기 파일명 배열 (빈 배열 = 실패)
 */
export async function generatePreview(
  filePath: string,
  ext: string,
  maxPages = 3,
): Promise<string[]> {
  const previewDir = PREVIEW_DIR();
  const tmpDir     = TMP_DIR();
  await mkdir(previewDir, { recursive: true });
  await mkdir(tmpDir,     { recursive: true });

  let pdfPath    = filePath;
  let hwpTmpPdf  = '';

  try {
    // ── HWP → ODT (pyhwp) → PDF (LibreOffice headless) ─────────────────
    if (ext === 'hwp') {
      const odtPath = join(tmpDir, `hwp_${nanoid(8)}.odt`);
      try {
        // 1) HWP → ODT (pyhwp)
        await execAsync(
          `hwp5odt --output "${odtPath}" "${filePath}"`,
          { timeout: 60_000 },
        );
        // 2) ODT → PDF (LibreOffice headless — ODT는 정식 지원)
        await execAsync(
          `soffice --headless --convert-to pdf "${odtPath}" --outdir "${tmpDir}"`,
          { timeout: 60_000 },
        );
        hwpTmpPdf = odtPath.replace(/\.odt$/, '.pdf');
        pdfPath   = hwpTmpPdf;
      } catch (err) {
        console.error('[generatePreview] HWP→PDF 변환 실패:', err);
        await unlink(odtPath).catch(() => {});
        return [];
      } finally {
        await unlink(odtPath).catch(() => {});
      }
    }

    // ── PDF → JPEG (pdftoppm) ───────────────────────────────────────────
    const prefix = join(tmpDir, `prev_${nanoid(8)}`);
    try {
      await execAsync(
        `pdftoppm -jpeg -r 150 -l ${maxPages} "${pdfPath}" "${prefix}"`,
        { timeout: 30_000 },
      );
    } catch (err) {
      console.error('[generatePreview] PDF→JPEG 변환 실패:', err);
      return [];
    }

    // ── 생성 파일 수집 ──────────────────────────────────────────────────
    const prefixBase = prefix.split('/').pop()!;
    const all        = await readdir(tmpDir);
    const jpegs      = all
      .filter((f) => f.startsWith(prefixBase) && /\.(jpg|jpeg)$/i.test(f))
      .sort();

    // ── previewDir 로 복사 (nanoid 이름) ────────────────────────────────
    const previews: string[] = [];
    for (const f of jpegs) {
      const src      = join(tmpDir, f);
      const destName = `${nanoid(12)}.jpg`;
      await copyFile(src, join(previewDir, destName));
      await unlink(src).catch(() => {});
      previews.push(destName);
    }

    return previews;

  } finally {
    // HWP 중간 PDF 정리
    if (hwpTmpPdf) await unlink(hwpTmpPdf).catch(() => {});
  }
}
