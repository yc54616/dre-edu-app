const MAX_KEY_LOG_COUNT = 10;

export function normalizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, Math.max(0, maxLength));
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function pickAllowedObject(
  source: Record<string, unknown>,
  allowedKeys: readonly string[],
  context: string,
): Record<string, unknown> {
  const allowed = new Set(allowedKeys);
  const safe: Record<string, unknown> = {};
  const dropped: string[] = [];

  for (const [key, value] of Object.entries(source)) {
    if (!allowed.has(key)) {
      dropped.push(key);
      continue;
    }
    safe[key] = value;
  }

  if (dropped.length > 0) {
    const preview = dropped.slice(0, MAX_KEY_LOG_COUNT).join(', ');
    const suffix = dropped.length > MAX_KEY_LOG_COUNT ? ` +${dropped.length - MAX_KEY_LOG_COUNT}` : '';
    console.warn(`[security] dropped unknown keys (${context}): ${preview}${suffix}`);
  }

  return safe;
}

export function parsePositiveInt(value: unknown, min: number, max: number): number | null {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseInt(value, 10)
      : NaN;

  if (!Number.isInteger(parsed)) return null;
  if (parsed < min || parsed > max) return null;
  return parsed;
}
