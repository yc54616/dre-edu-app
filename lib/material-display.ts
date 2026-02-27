import {
  MATERIAL_SOURCE_CATEGORIES,
  MATERIAL_TYPES_BY_SOURCE,
  getMaterialSubjectFilterCandidates,
  type MaterialSourceCategory,
} from '@/lib/constants/material';
import { normalizeText } from '@/lib/api-helpers';

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

function normalizeDisplayText(value: unknown): string {
  return normalizeText(value)
    .replace(/_+/g, ' ')
    .replace(/\s*·\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toCompareKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ _.\-·:|,()[\]{}]+/g, '');
}

function uniqueDisplayParts(parts: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const normalized = normalizeDisplayText(part);
    if (!normalized) continue;
    const key = toCompareKey(normalized);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripLeadingDisplayHint(text: string, hint: string): string {
  if (!text || !hint) return text;
  const pattern = new RegExp(`^${escapeRegExp(hint)}(?:\\s*[·\\-_:|,/]+\\s*)?`, 'i');
  return text.replace(pattern, '').trim();
}

function normalizeTopicForDisplay(topicValue: unknown, subjectValue: unknown): string {
  const topic = normalizeDisplayText(topicValue);
  const subject = normalizeDisplayText(subjectValue);
  if (!topic || !subject) return topic;

  const hints = getMaterialSubjectFilterCandidates(subject)
    .map((value) => normalizeDisplayText(value))
    .filter(Boolean);

  let stripped = topic;
  for (const hint of hints) {
    stripped = stripLeadingDisplayHint(stripped, hint);
  }

  if (!stripped || toCompareKey(stripped) === toCompareKey(subject)) {
    return '';
  }
  return stripped;
}

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
  const sourceCategory = resolveSourceCategory(data);
  const subject = normalizeDisplayText(data.subject);
  const topic = normalizeTopicForDisplay(data.topic, subject);
  const type = normalizeDisplayText(data.type);
  const bookTitle = normalizeDisplayText(data.bookTitle);
  const publisher = normalizeDisplayText(data.publisher);

  if (sourceCategory === 'school_exam') {
    return uniqueDisplayParts([
      subject,
      topic || normalizeDisplayText(data.topic) || type,
    ]).join(' ');
  }

  if (sourceCategory === 'ebook') {
    const topicWithoutBookTitle = stripLeadingDisplayHint(topic, bookTitle);
    return uniqueDisplayParts([
      bookTitle || topic || subject,
      topicWithoutBookTitle,
      publisher,
    ]).join(' ');
  }

  return uniqueDisplayParts([
    subject,
    bookTitle || topic,
    type,
  ]).join(' ');
}

export function buildMaterialSubline(data: MaterialDisplayData): string {
  const sourceCategory = resolveSourceCategory(data);
  const year = data.year ? `${data.year}년` : '';
  const grade = data.gradeNumber ? `${data.gradeNumber}학년` : '';
  const semester = data.semester ? `${data.semester}학기` : '';
  const schoolName = normalizeDisplayText(data.schoolName);
  const schoolLevel = normalizeDisplayText(data.schoolLevel);
  const subject = normalizeDisplayText(data.subject);
  const topic = normalizeTopicForDisplay(data.topic, subject);
  const bookTitle = normalizeDisplayText(data.bookTitle);
  const publisher = normalizeDisplayText(data.publisher);

  if (sourceCategory === 'school_exam') {
    return uniqueDisplayParts([
      schoolName,
      year,
      grade,
      semester,
      schoolLevel,
    ]).join(' · ');
  }

  if (sourceCategory === 'ebook') {
    const topicWithoutBookTitle = stripLeadingDisplayHint(topic, bookTitle);
    return uniqueDisplayParts([
      publisher,
      year,
      topicWithoutBookTitle,
    ]).join(' · ');
  }

  return uniqueDisplayParts([
    publisher,
    schoolLevel,
    year,
    grade,
    topic,
  ]).join(' · ');
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
