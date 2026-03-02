import { extname, resolve, sep } from 'path';

const STORAGE_FILENAME_RE = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,127}$/;

export function isSafeStorageFilename(fileName: unknown): fileName is string {
  if (typeof fileName !== 'string') return false;
  if (!STORAGE_FILENAME_RE.test(fileName)) return false;
  if (fileName.includes('..')) return false;
  if (fileName.includes('/') || fileName.includes('\\')) return false;
  return true;
}

export function hasAllowedExtension(fileName: string, allowedExtensions: readonly string[]): boolean {
  const ext = extname(fileName).replace('.', '').toLowerCase();
  return !!ext && allowedExtensions.includes(ext);
}

export function resolveStoragePath(baseDir: string, fileName: string): string | null {
  if (!isSafeStorageFilename(fileName)) return null;

  const base = resolve(baseDir);
  const target = resolve(base, fileName);
  if (!target.startsWith(base + sep)) return null;
  return target;
}
