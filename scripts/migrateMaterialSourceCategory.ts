/**
 * materials.sourceCategory 보정 마이그레이션
 *
 * 기본 동작은 dry-run(미적용)입니다.
 * 실제 반영하려면 --apply 옵션을 사용하세요.
 *
 * 실행 예시:
 *   node --experimental-strip-types scripts/migrateMaterialSourceCategory.ts
 *   node --experimental-strip-types scripts/migrateMaterialSourceCategory.ts --apply
 *   node --experimental-strip-types scripts/migrateMaterialSourceCategory.ts --apply --limit=200
 *
 * (tsx 사용 시)
 *   npx tsx scripts/migrateMaterialSourceCategory.ts --apply
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose, { type Types } from 'mongoose';
import type { AnyBulkWriteOperation, Collection } from 'mongodb';

const MATERIAL_SOURCE_CATEGORIES = ['school_exam', 'textbook', 'reference', 'ebook'] as const;
type MaterialSourceCategory = typeof MATERIAL_SOURCE_CATEGORIES[number];

const MATERIAL_TYPES_BY_SOURCE = {
  school_exam: ['내신기출', '내신', '중간고사', '기말고사', '학력평가', '수능기출', '모의고사', '개념', '심화', '킬러', '실전'],
  textbook: ['교과서 개념', '본문 분석', '단원평가', '서술형', '내신 변형'],
  reference: ['개념서', '유형서', '심화서', '실전서', '오답정리'],
  ebook: ['전자책'],
} as const;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dre-edu';
const APPLY = process.argv.includes('--apply');
const BATCH_SIZE = 300;

const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const LIMIT = limitArg
  ? Math.max(0, Number.parseInt(limitArg.split('=')[1] || '0', 10))
  : 0;

interface MaterialLikeDoc {
  _id: Types.ObjectId;
  materialId?: string;
  sourceCategory?: unknown;
  type?: unknown;
  subject?: unknown;
  teacherProductType?: unknown;
  ebookDescription?: unknown;
  ebookToc?: unknown;
  schoolLevel?: unknown;
  gradeNumber?: unknown;
  semester?: unknown;
  period?: unknown;
  schoolName?: unknown;
  regionSido?: unknown;
  regionGugun?: unknown;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isSourceCategory(value: unknown): value is MaterialSourceCategory {
  return typeof value === 'string' &&
    MATERIAL_SOURCE_CATEGORIES.includes(value as MaterialSourceCategory);
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

function resolveSourceCategory(doc: MaterialLikeDoc): MaterialSourceCategory {
  const sourceCategory = normalizeText(doc.sourceCategory);
  const normalizedSourceCategory = isSourceCategory(sourceCategory) ? sourceCategory : 'school_exam';

  const type = normalizeText(doc.type);
  const subject = normalizeText(doc.subject);
  const teacherProductType = normalizeText(doc.teacherProductType).toLowerCase();

  const lowerType = type.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  const hasEbookHint = ebookTypeHints.has(lowerType) ||
    lowerSubject === '전자책' ||
    lowerSubject === 'ebook' ||
    teacherProductType === 'ebook' ||
    normalizeText(doc.ebookDescription).length > 0 ||
    hasNonEmptyEbookToc(doc.ebookToc);

  if (hasEbookHint) return 'ebook';

  if (textbookTypeHints.has(type)) return 'textbook';
  if (referenceTypeHints.has(type)) return 'reference';

  return normalizedSourceCategory;
}

async function flushBulk(
  collection: Collection<MaterialLikeDoc>,
  operations: AnyBulkWriteOperation<MaterialLikeDoc>[]
) {
  if (operations.length === 0) return { matchedCount: 0, modifiedCount: 0 };
  const result = await collection.bulkWrite(operations, { ordered: false });
  operations.length = 0;
  return {
    matchedCount: result.matchedCount ?? 0,
    modifiedCount: result.modifiedCount ?? 0,
  };
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const materials: Collection<MaterialLikeDoc> = mongoose.connection.collection('materials');

  const query = materials.find(
    {},
    {
      projection: {
        materialId: 1,
        sourceCategory: 1,
        type: 1,
        subject: 1,
        teacherProductType: 1,
        ebookDescription: 1,
        ebookToc: 1,
        schoolLevel: 1,
        gradeNumber: 1,
        semester: 1,
        period: 1,
        schoolName: 1,
        regionSido: 1,
        regionGugun: 1,
      },
    }
  );

  if (LIMIT > 0) query.limit(LIMIT);

  const operations: AnyBulkWriteOperation<MaterialLikeDoc>[] = [];
  const transitionCount = new Map<string, number>();
  const sampleChanges: Array<{
    materialId: string;
    from: string;
    to: MaterialSourceCategory;
    set: Record<string, unknown>;
  }> = [];

  let scanned = 0;
  let changed = 0;
  let matchedCount = 0;
  let modifiedCount = 0;

  for await (const doc of query) {
    scanned += 1;
    const rawSource = normalizeText(doc.sourceCategory);
    const isRawValid = isSourceCategory(rawSource);
    const resolved = resolveSourceCategory(doc);
    const set: Record<string, unknown> = {};

    if (!isRawValid || rawSource !== resolved) {
      set.sourceCategory = resolved;
    }

    if (resolved === 'ebook') {
      if (normalizeText(doc.subject) !== '전자책') set.subject = '전자책';
      if (normalizeText(doc.schoolLevel)) set.schoolLevel = '';
      const grade = toNumber(doc.gradeNumber);
      if (grade !== null && grade !== 0) set.gradeNumber = 0;
      const semester = toNumber(doc.semester);
      if (semester !== null && semester !== 0) set.semester = 0;
      if (normalizeText(doc.period)) set.period = '';
      if (normalizeText(doc.schoolName)) set.schoolName = '';
      if (normalizeText(doc.regionSido)) set.regionSido = '';
      if (normalizeText(doc.regionGugun)) set.regionGugun = '';
    }

    if (Object.keys(set).length === 0) continue;
    changed += 1;

    const fromLabel = rawSource || '(empty)';
    const key = `${fromLabel} -> ${resolved}`;
    transitionCount.set(key, (transitionCount.get(key) || 0) + 1);

    if (sampleChanges.length < 15) {
      sampleChanges.push({
        materialId: doc.materialId || String(doc._id),
        from: fromLabel,
        to: resolved,
        set,
      });
    }

    if (APPLY) {
      operations.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: set },
        },
      });
      if (operations.length >= BATCH_SIZE) {
        const result = await flushBulk(materials, operations);
        matchedCount += result.matchedCount;
        modifiedCount += result.modifiedCount;
      }
    }
  }

  if (APPLY && operations.length > 0) {
    const result = await flushBulk(materials, operations);
    matchedCount += result.matchedCount;
    modifiedCount += result.modifiedCount;
  }

  console.log('\n=== sourceCategory 마이그레이션 결과 ===');
  console.log(`모드: ${APPLY ? 'APPLY(실반영)' : 'DRY-RUN(미적용)'}`);
  console.log(`스캔: ${scanned}건`);
  console.log(`변경 대상: ${changed}건`);

  if (transitionCount.size > 0) {
    console.log('\n분류 전환 건수:');
    for (const [transition, count] of transitionCount.entries()) {
      console.log(`- ${transition}: ${count}건`);
    }
  }

  if (sampleChanges.length > 0) {
    console.log('\n샘플 변경(최대 15건):');
    for (const sample of sampleChanges) {
      console.log(`- ${sample.materialId}: ${sample.from} -> ${sample.to}`);
      console.log(`  set: ${JSON.stringify(sample.set)}`);
    }
  }

  if (APPLY) {
    console.log('\nDB 반영 결과:');
    console.log(`- matchedCount: ${matchedCount}`);
    console.log(`- modifiedCount: ${modifiedCount}`);
  } else {
    console.log('\n실제 반영은 --apply 옵션으로 실행하세요.');
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // noop
  }
  process.exit(1);
});
