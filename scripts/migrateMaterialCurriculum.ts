/**
 * materials.curriculum 보정 마이그레이션
 *
 * 기본 동작은 dry-run(미적용)입니다.
 * 실제 반영하려면 --apply 옵션을 사용하세요.
 *
 * 실행 예시:
 *   node --experimental-strip-types scripts/migrateMaterialCurriculum.ts
 *   node --experimental-strip-types scripts/migrateMaterialCurriculum.ts --apply
 *   node --experimental-strip-types scripts/migrateMaterialCurriculum.ts --apply --limit=300
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose, { type Types } from 'mongoose';
import type { AnyBulkWriteOperation, Collection } from 'mongodb';

const MATERIAL_CURRICULUMS = ['revised_2022', 'legacy'] as const;
type MaterialCurriculum = typeof MATERIAL_CURRICULUMS[number];

const LEGACY_SUBJECT_HINTS = new Set<string>([
  '수학(공통)',
  '수학I',
  '수학II',
  '미적분',
  '수학1',
  '수학2',
  '수학(상)',
  '수학(하)',
]);

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
  subject?: unknown;
  curriculum?: unknown;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isCurriculum(value: unknown): value is MaterialCurriculum {
  return typeof value === 'string' &&
    MATERIAL_CURRICULUMS.includes(value as MaterialCurriculum);
}

function resolveCurriculum(doc: MaterialLikeDoc): MaterialCurriculum {
  const sourceCategory = normalizeText(doc.sourceCategory);
  const subject = normalizeText(doc.subject);
  if (sourceCategory === 'ebook') return 'revised_2022';
  if (LEGACY_SUBJECT_HINTS.has(subject)) return 'legacy';
  return 'revised_2022';
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
        subject: 1,
        curriculum: 1,
      },
    }
  );

  if (LIMIT > 0) query.limit(LIMIT);

  const operations: AnyBulkWriteOperation<MaterialLikeDoc>[] = [];
  const transitionCount = new Map<string, number>();
  const sampleChanges: Array<{
    materialId: string;
    from: string;
    to: MaterialCurriculum;
  }> = [];

  let scanned = 0;
  let changed = 0;
  let matchedCount = 0;
  let modifiedCount = 0;

  for await (const doc of query) {
    scanned += 1;
    const rawCurriculum = normalizeText(doc.curriculum);
    const current = isCurriculum(rawCurriculum) ? rawCurriculum : '';
    const resolved = resolveCurriculum(doc);

    if (current === resolved) continue;
    changed += 1;

    const transitionKey = `${current || '(empty)'} -> ${resolved}`;
    transitionCount.set(transitionKey, (transitionCount.get(transitionKey) || 0) + 1);

    if (sampleChanges.length < 15) {
      sampleChanges.push({
        materialId: doc.materialId || String(doc._id),
        from: current || '(empty)',
        to: resolved,
      });
    }

    if (APPLY) {
      operations.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { curriculum: resolved } },
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

  console.log('\n=== curriculum 마이그레이션 결과 ===');
  console.log(`모드: ${APPLY ? 'APPLY(실반영)' : 'DRY-RUN(미적용)'}`);
  console.log(`스캔: ${scanned}건`);
  console.log(`변경 대상: ${changed}건`);

  if (transitionCount.size > 0) {
    console.log('\n전환 건수:');
    for (const [transition, count] of transitionCount.entries()) {
      console.log(`- ${transition}: ${count}건`);
    }
  }

  if (sampleChanges.length > 0) {
    console.log('\n샘플 변경(최대 15건):');
    for (const sample of sampleChanges) {
      console.log(`- ${sample.materialId}: ${sample.from} -> ${sample.to}`);
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
