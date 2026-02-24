/**
 * 명예의 전당 기본 데이터 시드 스크립트
 *
 * 기본 동작은 dry-run(미적용)입니다.
 * 실제 반영하려면 --apply 옵션을 사용하세요.
 *
 * 실행 예시:
 *   node --experimental-strip-types scripts/seedHallOfFame.ts
 *   node --experimental-strip-types scripts/seedHallOfFame.ts --apply
 *
 * 선택 옵션:
 *   --unpublished  : 시드 데이터 공개 상태를 비공개(false)로 저장
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { pathToFileURL } from 'url';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose, { type Types } from 'mongoose';
import type { AnyBulkWriteOperation, Collection } from 'mongodb';
import { nanoid } from 'nanoid';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dre-edu';
const APPLY = process.argv.includes('--apply');
const PUBLISHED = !process.argv.includes('--unpublished');

type HallOfFameKind = 'admission' | 'review';

interface HallOfFameDoc {
  _id: Types.ObjectId;
  entryId?: string;
  kind?: HallOfFameKind;
  isPublished?: boolean;
  sortOrder?: number;
  createdBy?: string;
  univ?: string;
  major?: string;
  student?: string;
  school?: string;
  badge?: string;
  desc?: string;
  name?: string;
  content?: string;
  tag?: string;
  stars?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SeedItem {
  kind: HallOfFameKind;
  sortOrder: number;
  isPublished: boolean;
  createdBy: string;
  univ: string;
  major: string;
  student: string;
  school: string;
  badge: string;
  desc: string;
  name: string;
  content: string;
  tag: string;
  stars: number;
}

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const clampReviewStars = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 5;
  return Math.max(1, Math.min(5, Math.round(parsed)));
};

type DefaultAdmission = {
  univ: string;
  major: string;
  student: string;
  school: string;
  badge: string;
  desc: string;
};

type DefaultReview = {
  name: string;
  content: string;
  tag: string;
  stars: number;
};

async function loadDefaultHallOfFameData(): Promise<{
  admissions: DefaultAdmission[];
  reviews: DefaultReview[];
}> {
  const moduleUrl = pathToFileURL(path.resolve(process.cwd(), 'lib/hall-of-fame.ts')).href;
  const loaded = await import(moduleUrl) as {
    DEFAULT_HALL_OF_FAME_ADMISSIONS?: DefaultAdmission[];
    DEFAULT_HALL_OF_FAME_REVIEWS?: DefaultReview[];
  };
  return {
    admissions: Array.isArray(loaded.DEFAULT_HALL_OF_FAME_ADMISSIONS)
      ? loaded.DEFAULT_HALL_OF_FAME_ADMISSIONS
      : [],
    reviews: Array.isArray(loaded.DEFAULT_HALL_OF_FAME_REVIEWS)
      ? loaded.DEFAULT_HALL_OF_FAME_REVIEWS
      : [],
  };
}

const toSeedKey = (item: { kind: HallOfFameKind; univ?: unknown; major?: unknown; student?: unknown; name?: unknown; content?: unknown }) => {
  if (item.kind === 'admission') {
    return `admission|${normalizeText(item.univ)}|${normalizeText(item.major)}|${normalizeText(item.student)}`;
  }
  return `review|${normalizeText(item.name)}|${normalizeText(item.content)}`;
};

function buildSeedItems(
  defaultAdmissions: DefaultAdmission[],
  defaultReviews: DefaultReview[],
): SeedItem[] {
  const admissions: SeedItem[] = defaultAdmissions.map((item, index) => ({
    kind: 'admission',
    sortOrder: (index + 1) * 10,
    isPublished: PUBLISHED,
    createdBy: 'seed-script',
    univ: normalizeText(item.univ),
    major: normalizeText(item.major),
    student: normalizeText(item.student),
    school: normalizeText(item.school),
    badge: normalizeText(item.badge) || '수시 합격',
    desc: normalizeText(item.desc),
    name: '',
    content: '',
    tag: '',
    stars: 5,
  }));

  const reviews: SeedItem[] = defaultReviews.map((item, index) => ({
    kind: 'review',
    sortOrder: (index + 1) * 10,
    isPublished: PUBLISHED,
    createdBy: 'seed-script',
    univ: '',
    major: '',
    student: '',
    school: '',
    badge: '',
    desc: '',
    name: normalizeText(item.name),
    content: normalizeText(item.content),
    tag: normalizeText(item.tag) || '수강생',
    stars: clampReviewStars(item.stars),
  }));

  return [...admissions, ...reviews];
}

function differs(existing: HallOfFameDoc, next: SeedItem): boolean {
  const current = {
    isPublished: Boolean(existing.isPublished),
    sortOrder: Number(existing.sortOrder || 0),
    univ: normalizeText(existing.univ),
    major: normalizeText(existing.major),
    student: normalizeText(existing.student),
    school: normalizeText(existing.school),
    badge: normalizeText(existing.badge),
    desc: normalizeText(existing.desc),
    name: normalizeText(existing.name),
    content: normalizeText(existing.content),
    tag: normalizeText(existing.tag),
    stars: clampReviewStars(existing.stars),
  };
  return (
    current.isPublished !== next.isPublished ||
    current.sortOrder !== next.sortOrder ||
    current.univ !== next.univ ||
    current.major !== next.major ||
    current.student !== next.student ||
    current.school !== next.school ||
    current.badge !== next.badge ||
    current.desc !== next.desc ||
    current.name !== next.name ||
    current.content !== next.content ||
    current.tag !== next.tag ||
    current.stars !== next.stars
  );
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const collection: Collection<HallOfFameDoc> = mongoose.connection.collection('halloffameentries');

  const missingEntryIdDocs = await collection.find(
    {
      $or: [
        { entryId: { $exists: false } },
        { entryId: null },
        { entryId: '' },
      ],
    } as Record<string, unknown>,
    { projection: { _id: 1, entryId: 1 } },
  ).toArray();

  if (APPLY && missingEntryIdDocs.length > 0) {
    const backfillOps: AnyBulkWriteOperation<HallOfFameDoc>[] = missingEntryIdDocs.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            entryId: nanoid(12),
            updatedAt: new Date(),
          },
        },
      },
    }));
    await collection.bulkWrite(backfillOps, { ordered: false });
  }

  const { admissions: defaultAdmissions, reviews: defaultReviews } = await loadDefaultHallOfFameData();
  const seedItems = buildSeedItems(defaultAdmissions, defaultReviews);
  const existingDocs = await collection.find({}, {
    projection: {
      entryId: 1,
      kind: 1,
      isPublished: 1,
      sortOrder: 1,
      univ: 1,
      major: 1,
      student: 1,
      school: 1,
      badge: 1,
      desc: 1,
      name: 1,
      content: 1,
      tag: 1,
      stars: 1,
    },
  }).toArray();

  const existingByKey = new Map<string, HallOfFameDoc[]>();
  for (const doc of existingDocs) {
    const key = toSeedKey({
      kind: (doc.kind === 'review' ? 'review' : 'admission'),
      univ: doc.univ,
      major: doc.major,
      student: doc.student,
      name: doc.name,
      content: doc.content,
    });
    const list = existingByKey.get(key) || [];
    list.push(doc);
    existingByKey.set(key, list);
  }

  const duplicateKeys = [...existingByKey.entries()].filter(([, docs]) => docs.length > 1);

  let insertCount = 0;
  let updateCount = 0;
  let skipCount = 0;
  const operations: AnyBulkWriteOperation<HallOfFameDoc>[] = [];

  for (const item of seedItems) {
    const key = toSeedKey(item);
    const existing = existingByKey.get(key)?.[0];
    if (!existing) {
      insertCount += 1;
    } else if (differs(existing, item)) {
      updateCount += 1;
    } else {
      skipCount += 1;
    }

    if (APPLY) {
      const filter = item.kind === 'admission'
        ? { kind: 'admission', univ: item.univ, major: item.major, student: item.student }
        : { kind: 'review', name: item.name, content: item.content };

      operations.push({
        updateOne: {
          filter: filter as Record<string, unknown>,
          update: {
            $set: {
              kind: item.kind,
              isPublished: item.isPublished,
              sortOrder: item.sortOrder,
              univ: item.univ,
              major: item.major,
              student: item.student,
              school: item.school,
              badge: item.badge,
              desc: item.desc,
              name: item.name,
              content: item.content,
              tag: item.tag,
              stars: item.stars,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              entryId: nanoid(12),
              createdBy: item.createdBy,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      });
    }
  }

  console.log('\n=== 명예의 전당 시드 결과 ===');
  console.log(`모드: ${APPLY ? 'APPLY(실반영)' : 'DRY-RUN(미적용)'}`);
  console.log(`공개 상태: ${PUBLISHED ? '공개(true)' : '비공개(false)'}`);
  console.log(`기본 데이터: 합격 ${defaultAdmissions.length}건, 후기 ${defaultReviews.length}건`);
  console.log(`entryId 누락 항목: ${missingEntryIdDocs.length}건${APPLY ? ' (보정 적용됨)' : ''}`);
  console.log(`예상 삽입: ${insertCount}건`);
  console.log(`예상 수정: ${updateCount}건`);
  console.log(`변경 없음: ${skipCount}건`);

  if (duplicateKeys.length > 0) {
    console.log(`\n주의: 중복 키 ${duplicateKeys.length}개가 이미 존재합니다.`);
    for (const [key, docs] of duplicateKeys.slice(0, 10)) {
      const ids = docs.map((doc) => doc.entryId || String(doc._id)).join(', ');
      console.log(`- ${key} (${docs.length}건) => ${ids}`);
    }
    if (duplicateKeys.length > 10) {
      console.log(`... 외 ${duplicateKeys.length - 10}개`);
    }
  }

  if (APPLY) {
    const result = await collection.bulkWrite(operations, { ordered: false });
    console.log('\nDB 반영 결과:');
    console.log(`- matchedCount: ${result.matchedCount ?? 0}`);
    console.log(`- modifiedCount: ${result.modifiedCount ?? 0}`);
    console.log(`- upsertedCount: ${result.upsertedCount ?? 0}`);
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
