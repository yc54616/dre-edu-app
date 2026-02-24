import {
  MATERIAL_SOURCE_CATEGORIES,
  MATERIAL_TYPES_BY_SOURCE,
  type MaterialSourceCategory,
} from '@/lib/constants/material';

export interface MaterialDisplayData {
  sourceCategory?: string | null;
  type?: string | null;
  publisher?: string | null;
  bookTitle?: string | null;
  ebookDescription?: string | null;
  ebookToc?: string[] | string | null;
  schoolName?: string | null;
  schoolLevel?: string | null;
  subject?: string | null;
  topic?: string | null;
  year?: number | null;
  gradeNumber?: number | null;
  semester?: number | null;
}

export function normalizeSourceCategory(value: unknown): MaterialSourceCategory {
  if (typeof value === 'string' && MATERIAL_SOURCE_CATEGORIES.includes(value as MaterialSourceCategory)) {
    return value as MaterialSourceCategory;
  }
  return 'school_exam';
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function hasNonEmptyEbookToc(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => typeof item === 'string' && item.trim());
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return false;
}

const ebookTypeHints = new Set([
  ...MATERIAL_TYPES_BY_SOURCE.ebook.map((value) => value.toLowerCase()),
  'ebook',
]);
const textbookTypeHints: Set<string> = new Set(MATERIAL_TYPES_BY_SOURCE.textbook as readonly string[]);
const referenceTypeHints: Set<string> = new Set(MATERIAL_TYPES_BY_SOURCE.reference as readonly string[]);

export function resolveSourceCategory(data: MaterialDisplayData): MaterialSourceCategory {
  const normalized = normalizeSourceCategory(data.sourceCategory);

  const type = normalizeText(data.type);
  const subject = normalizeText(data.subject);
  const lowerType = type.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  const hasEbookHint = ebookTypeHints.has(lowerType) ||
    lowerSubject === '전자책' ||
    lowerSubject === 'ebook' ||
    normalizeText(data.ebookDescription).length > 0 ||
    hasNonEmptyEbookToc(data.ebookToc);

  if (hasEbookHint) return 'ebook';
  if (textbookTypeHints.has(type)) return 'textbook';
  if (referenceTypeHints.has(type)) return 'reference';
  return normalized;
}

export function buildMaterialTitle(data: MaterialDisplayData): string {
  const parts = buildMaterialNameParts(data);
  return parts.join(' ');
}

export function buildMaterialSubline(data: MaterialDisplayData): string {
  const sourceCategory = resolveSourceCategory(data);
  if (sourceCategory === 'school_exam') {
    return [data.subject, data.topic].filter(Boolean).join(' · ');
  }
  if (sourceCategory === 'ebook') {
    return [data.publisher, data.year ? `${data.year}년` : '', data.topic].filter(Boolean).join(' · ');
  }
  return [data.subject, data.bookTitle || data.topic, data.publisher].filter(Boolean).join(' · ');
}

export function buildMaterialNameParts(data: MaterialDisplayData): string[] {
  const sourceCategory = resolveSourceCategory(data);
  const year = data.year ? `${data.year}년` : '';
  const grade = data.gradeNumber ? `${data.gradeNumber}학년` : '';
  const semester = data.semester ? `${data.semester}학기` : '';

  if (sourceCategory === 'school_exam') {
    return [
      data.schoolName,
      year,
      grade,
      semester,
      data.subject,
      data.topic,
    ].filter(Boolean) as string[];
  }

  if (sourceCategory === 'ebook') {
    return [
      data.bookTitle,
      data.topic,
      data.publisher,
      year,
    ].filter(Boolean) as string[];
  }

  return [
    data.publisher,
    data.schoolLevel,
    year,
    grade,
    data.subject,
    data.bookTitle,
    data.topic,
  ].filter(Boolean) as string[];
}
