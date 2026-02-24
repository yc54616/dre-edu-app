import { spawn } from 'child_process';
import { access, mkdir, mkdtemp, readdir, rm } from 'fs/promises';
import { basename, extname, join } from 'path';

type RunResult = {
  stdout: string;
  stderr: string;
};

const PAGE_COUNT_CACHE = new Map<string, number | null>();
const UPLOAD_DIR = () => join(process.cwd(), 'uploads', 'files');
const TMP_BASE_DIR = () => join(process.cwd(), 'tmp', 'page_count');

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function runCommand(
  command: string,
  args: string[],
  timeoutMs = 60_000,
): Promise<RunResult> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;
    });
    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(new Error(`[${command}] 실행 실패: ${error.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`[${command}] 타임아웃`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`[${command}] 종료 코드 ${code}: ${stderr.trim().slice(0, 300)}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function parsePdfPageCount(pdfInfoOutput: string): number | null {
  const match = pdfInfoOutput.match(/^Pages:\s+(\d+)/im);
  if (!match) return null;
  const count = Number.parseInt(match[1], 10);
  return Number.isFinite(count) && count > 0 ? count : null;
}

async function getPdfPageCount(pdfPath: string): Promise<number | null> {
  try {
    const { stdout } = await runCommand('pdfinfo', [pdfPath], 20_000);
    return parsePdfPageCount(stdout);
  } catch {
    return null;
  }
}

async function convertHwpToOdt(filePath: string, odtPath: string): Promise<boolean> {
  try {
    await runCommand('hwp5odt', ['--output', odtPath, filePath], 90_000);
    if (await pathExists(odtPath)) return true;
  } catch {
    // fallback below
  }

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
    await runCommand('python3', ['-c', pythonScript, filePath, odtPath], 120_000);
    return await pathExists(odtPath);
  } catch {
    return false;
  }
}

async function convertToPdf(inputPath: string, workDir: string): Promise<string | null> {
  const stem = basename(inputPath).replace(/\.[^.]+$/, '');
  const expectedPdfPath = join(workDir, `${stem}.pdf`);
  const ext = extname(inputPath).toLowerCase();
  const convertCommandCandidates: string[][] = [
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
    convertCommandCandidates.push([
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
    convertCommandCandidates.push([
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

  for (const args of convertCommandCandidates) {
    try {
      await runCommand('soffice', args, 120_000);
      if (await pathExists(expectedPdfPath)) return expectedPdfPath;
      const files = await readdir(workDir);
      const fallbackPdf = files.find((file) => /\.pdf$/i.test(file));
      if (fallbackPdf) return join(workDir, fallbackPdf);
    } catch {
      // 변환 필터/환경 차이를 고려해 후보 커맨드를 순차 재시도한다.
    }
  }

  return null;
}

async function getHwpxEstimatedPageCount(filePath: string): Promise<number | null> {
  const pythonScript = [
    'import re, sys, zipfile',
    'src = sys.argv[1]',
    'section_files = []',
    'page_breaks = 0',
    'with zipfile.ZipFile(src) as z:',
    "    section_files = sorted([n for n in z.namelist() if n.lower().startswith('contents/section') and n.lower().endswith('.xml')])",
    '    for name in section_files:',
    "        xml = z.read(name).decode('utf-8', 'ignore')",
    "        page_breaks += len(re.findall(r'<hp:p\\\\b[^>]*\\\\bpageBreak=\"1\"', xml))",
    'section_count = len(section_files)',
    'if section_count > 0:',
    '    pages = max(1, section_count + page_breaks)',
    'else:',
    '    pages = max(1, page_breaks + 1)',
    'print(pages)',
  ].join('\n');

  try {
    const { stdout } = await runCommand('python3', ['-c', pythonScript, filePath], 30_000);
    const value = Number.parseInt(stdout.trim(), 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

async function getConvertedPageCount(filePath: string): Promise<number | null> {
  const tmpBaseDir = TMP_BASE_DIR();
  await mkdir(tmpBaseDir, { recursive: true });
  const workDir = await mkdtemp(join(tmpBaseDir, 'job_'));

  try {
    let convertedPdfPath = await convertToPdf(filePath, workDir);
    if (!convertedPdfPath && extname(filePath).toLowerCase() === '.hwp') {
      const odtPath = join(workDir, `${basename(filePath).replace(/\.[^.]+$/, '')}.odt`);
      const odtReady = await convertHwpToOdt(filePath, odtPath);
      if (odtReady) {
        convertedPdfPath = await convertToPdf(odtPath, workDir);
      }
    }
    if (!convertedPdfPath) return null;
    return await getPdfPageCount(convertedPdfPath);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function getMaterialFilePageCount(fileName?: string | null): Promise<number | null> {
  if (!fileName) return null;

  if (PAGE_COUNT_CACHE.has(fileName)) {
    return PAGE_COUNT_CACHE.get(fileName) ?? null;
  }

  const filePath = join(UPLOAD_DIR(), fileName);
  if (!(await pathExists(filePath))) {
    return null;
  }

  const ext = extname(fileName).toLowerCase();
  let pageCount: number | null = null;

  if (ext === '.pdf') {
    pageCount = await getPdfPageCount(filePath);
  } else if (ext === '.hwp' || ext === '.hwpx') {
    pageCount = await getConvertedPageCount(filePath);
    if (!pageCount && ext === '.hwpx') {
      pageCount = await getHwpxEstimatedPageCount(filePath);
    }
  }

  if (pageCount && pageCount > 0) {
    PAGE_COUNT_CACHE.set(fileName, pageCount);
  } else {
    PAGE_COUNT_CACHE.delete(fileName);
  }
  return pageCount;
}
