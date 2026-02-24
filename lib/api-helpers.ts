export const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export const normalizeKey = (value: unknown): string =>
  normalizeText(value).toLowerCase();

export const isDuplicateKeyError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const maybeCode = (error as { code?: unknown }).code;
  if (maybeCode === 11000) return true;
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' && message.includes('E11000');
};

export const parseSortOrder = (value: unknown): number | null => {
  if (typeof value === 'undefined') return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
};

export const parseAmount = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (!Number.isInteger(parsed)) return null;
  if (parsed < 0 || parsed > 1000000000) return null;
  return parsed;
};
