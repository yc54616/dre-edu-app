/**
 * PDF / HWP / HWPX → 미리보기 이미지 자동 생성
 *
 * PDF : pdftoppm (poppler-utils) → JPEG
 * HWP : PrvImage 추출 우선 → 실패 시 hwp5odt + soffice + pdftoppm
 * HWPX: Preview/PrvImage.* 추출 우선 → 실패 시 soffice + pdftoppm
 */
import { spawn } from 'child_process';
import { basename, extname, join } from 'path';
import { access, copyFile, mkdir, mkdtemp, readdir, rm, writeFile } from 'fs/promises';
import { nanoid } from 'nanoid';

const PREVIEW_DIR = () => join(process.cwd(), 'public', 'uploads', 'previews');
const TMP_BASE_DIR = () => join(process.cwd(), 'tmp', 'preview_gen');

type RunCommandOptions = {
  timeoutMs?: number;
  maxStdoutBytes?: number;
};

type RunCommandResult = {
  stdout: Buffer;
  stderr: string;
};

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function detectImageExtension(buffer: Buffer): 'png' | 'jpg' | 'webp' | null {
  // PNG
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // JPEG
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpg';
  }

  // WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions = {},
): Promise<RunCommandResult> {
  const timeoutMs = options.timeoutMs ?? 60_000;
  const maxStdoutBytes = options.maxStdoutBytes ?? 50 * 1024 * 1024;

  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let killedByTimeout = false;
    let killedByLimit = false;

    const timer = setTimeout(() => {
      killedByTimeout = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer | string) => {
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      stdoutBytes += bufferChunk.length;
      if (stdoutBytes > maxStdoutBytes) {
        killedByLimit = true;
        child.kill('SIGKILL');
        return;
      }
      stdoutChunks.push(bufferChunk);
    });

    child.stderr.on('data', (chunk: Buffer | string) => {
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      stderrChunks.push(bufferChunk);
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(new Error(`[${command}] 실행 실패: ${error.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      const stdout = Buffer.concat(stdoutChunks);
      const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();

      if (killedByTimeout) {
        reject(new Error(`[${command}] 타임아웃 (${timeoutMs}ms)`));
        return;
      }
      if (killedByLimit) {
        reject(new Error(`[${command}] stdout 용량 초과 (${maxStdoutBytes} bytes)`));
        return;
      }
      if (code !== 0) {
        const detail = stderr ? ` - ${stderr.slice(0, 400)}` : '';
        reject(new Error(`[${command}] 종료 코드 ${code}${detail}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function tryExtractHwpEmbeddedPreview(
  filePath: string,
  previewDir: string,
): Promise<string | null> {
  try {
    const { stdout } = await runCommand('hwp5proc', ['cat', filePath, 'PrvImage'], {
      timeoutMs: 30_000,
      maxStdoutBytes: 20 * 1024 * 1024,
    });

    if (!stdout || stdout.length < 32) return null;

    const ext = detectImageExtension(stdout);
    if (!ext) {
      console.warn('[generatePreview] HWP PrvImage 포맷 인식 실패');
      return null;
    }

    const filename = `${nanoid(12)}.${ext}`;
    await writeFile(join(previewDir, filename), stdout);
    return filename;
  } catch (error) {
    console.warn('[generatePreview] HWP PrvImage 추출 실패:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function tryExtractHwpxEmbeddedPreview(
  filePath: string,
  previewDir: string,
): Promise<string | null> {
  const pythonScript = [
    'import sys, zipfile',
    'src = sys.argv[1]',
    'with zipfile.ZipFile(src) as z:',
    "    candidates = [n for n in z.namelist() if n.lower().startswith('preview/prvimage.')]",
    '    if not candidates:',
    '        raise SystemExit(3)',
    '    sys.stdout.buffer.write(z.read(candidates[0]))',
  ].join('\n');

  try {
    const { stdout } = await runCommand('python3', ['-c', pythonScript, filePath], {
      timeoutMs: 30_000,
      maxStdoutBytes: 20 * 1024 * 1024,
    });

    if (!stdout || stdout.length < 32) return null;

    const ext = detectImageExtension(stdout);
    if (!ext) {
      console.warn('[generatePreview] HWPX Preview/PrvImage 포맷 인식 실패');
      return null;
    }

    const filename = `${nanoid(12)}.${ext}`;
    await writeFile(join(previewDir, filename), stdout);
    return filename;
  } catch (error) {
    console.warn('[generatePreview] HWPX Preview/PrvImage 추출 실패:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function convertHwpToOdt(filePath: string, odtPath: string): Promise<boolean> {
  try {
    await runCommand('hwp5odt', ['--output', odtPath, filePath], { timeoutMs: 90_000 });
    if (await pathExists(odtPath)) return true;
  } catch (error) {
    console.warn('[generatePreview] hwp5odt 기본 변환 실패:', error instanceof Error ? error.message : String(error));
  }

  // hwp5odt의 RelaxNG 검증 실패 시 우회 변환
  const pythonScript = [
    'from contextlib import closing',
    'from hwp5.hwp5odt import ODTTransform, open_odtpkg',
    'from hwp5.xmlmodel import Hwp5File',
    'import sys',
    'src, dst = sys.argv[1], sys.argv[2]',
    'transformer = ODTTransform(relaxng_compile=False)',
    'with closing(Hwp5File(src)) as hwp:',
    '    with open_odtpkg(dst) as pkg:',
    '        transformer.transform_hwp5_to_package(hwp, pkg)',
  ].join('\n');

  try {
    await runCommand('python3', ['-c', pythonScript, filePath, odtPath], { timeoutMs: 120_000 });
    return await pathExists(odtPath);
  } catch (error) {
    console.warn('[generatePreview] hwp5odt 검증 우회 변환 실패:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function convertDocumentToPdf(inputPath: string, workDir: string): Promise<string | null> {
  const stem = basename(inputPath).replace(/\.[^.]+$/, '');
  const expectedPdfPath = join(workDir, `${stem}.pdf`);
  const ext = extname(inputPath).toLowerCase();
  const commandCandidates: string[][] = [
    [
      '--headless',
      '--nologo',
      '--nolockcheck',
      '--norestore',
      '--convert-to',
      'pdf',
      inputPath,
      '--outdir',
      workDir,
    ],
  ];

  if (ext === '.hwp' || ext === '.hwpx') {
    commandCandidates.push([
      '--headless',
      '--nologo',
      '--nolockcheck',
      '--norestore',
      '--infilter=Hwp2002_File',
      '--convert-to',
      'pdf:writer_pdf_Export',
      inputPath,
      '--outdir',
      workDir,
    ]);
    commandCandidates.push([
      '--headless',
      '--nologo',
      '--nolockcheck',
      '--norestore',
      '--infilter=Hwp2002_File',
      '--convert-to',
      'pdf',
      inputPath,
      '--outdir',
      workDir,
    ]);
  }

  for (const args of commandCandidates) {
    try {
      await runCommand('soffice', args, { timeoutMs: 120_000 });
      if (await pathExists(expectedPdfPath)) return expectedPdfPath;
      const files = await readdir(workDir);
      const fallbackPdf = files.find((f) => /\.pdf$/i.test(f));
      if (fallbackPdf) return join(workDir, fallbackPdf);
    } catch (error) {
      console.warn('[generatePreview] soffice 변환 명령 실패:', error instanceof Error ? error.message : String(error));
    }
  }

  return null;
}

async function convertPdfToJpegs(
  pdfPath: string,
  workDir: string,
  previewDir: string,
  maxPages: number,
): Promise<string[]> {
  const prefix = join(workDir, `prev_${nanoid(8)}`);
  await runCommand(
    'pdftoppm',
    ['-jpeg', '-r', '150', '-l', String(maxPages), pdfPath, prefix],
    { timeoutMs: 60_000 },
  );

  const prefixBase = basename(prefix);
  const allFiles = await readdir(workDir);
  const jpegs = allFiles
    .filter((f) => f.startsWith(prefixBase) && /\.(jpg|jpeg)$/i.test(f))
    .sort((a, b) => {
      const pageA = Number(a.match(/-(\d+)\.(?:jpe?g)$/i)?.[1] ?? '0');
      const pageB = Number(b.match(/-(\d+)\.(?:jpe?g)$/i)?.[1] ?? '0');
      return pageA - pageB;
    });

  const previews: string[] = [];
  for (const jpg of jpegs) {
    const src = join(workDir, jpg);
    const destName = `${nanoid(12)}.jpg`;
    await copyFile(src, join(previewDir, destName));
    previews.push(destName);
  }

  return previews;
}

/**
 * @param filePath  저장된 원본 파일의 절대 경로
 * @param ext       'pdf' | 'hwp' | 'hwpx'
 * @param maxPages  변환할 최대 페이지 수 (기본 2)
 * @returns         생성된 미리보기 파일명 배열 (빈 배열 = 실패)
 */
export async function generatePreview(
  filePath: string,
  ext: string,
  maxPages = 2,
): Promise<string[]> {
  const previewDir = PREVIEW_DIR();
  const tmpBaseDir = TMP_BASE_DIR();

  await mkdir(previewDir, { recursive: true });
  await mkdir(tmpBaseDir, { recursive: true });

  const workDir = await mkdtemp(join(tmpBaseDir, 'job_'));

  try {
    if (ext === 'hwp') {
      // HWP 내부 미리보기가 있으면 가장 빠르고 안정적이다.
      const embeddedPreview = await tryExtractHwpEmbeddedPreview(filePath, previewDir);
      if (embeddedPreview) return [embeddedPreview];

      const odtPath = join(workDir, `hwp_${nanoid(8)}.odt`);
      const odtReady = await convertHwpToOdt(filePath, odtPath);
      const pdfPath = odtReady
        ? await convertDocumentToPdf(odtPath, workDir)
        : await convertDocumentToPdf(filePath, workDir);
      if (!pdfPath) return [];

      return await convertPdfToJpegs(pdfPath, workDir, previewDir, maxPages);
    }

    if (ext === 'hwpx') {
      // HWPX는 ZIP 컨테이너 내부 Preview/PrvImage.* 추출이 가장 안정적이다.
      const embeddedPreview = await tryExtractHwpxEmbeddedPreview(filePath, previewDir);
      if (embeddedPreview) return [embeddedPreview];

      // 일부 문서는 Preview가 없을 수 있어 soffice 변환을 보조 경로로 시도한다.
      const pdfPath = await convertDocumentToPdf(filePath, workDir);
      if (!pdfPath) return [];

      return await convertPdfToJpegs(pdfPath, workDir, previewDir, maxPages);
    }

    return await convertPdfToJpegs(filePath, workDir, previewDir, maxPages);
  } catch (error) {
    console.error('[generatePreview] 미리보기 생성 실패:', error);
    return [];
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
