/**
 * 레거시 materials -> 신규 materials 스키마 마이그레이션
 *
 * 기본은 DRY-RUN(미반영)입니다.
 * 실제 반영은 --apply 옵션으로 실행하세요.
 *
 * 권장 순서:
 * 1) 파일 볼륨 정리 (legacy root files -> uploads/files)
 * 2) 본 스크립트 실행(메타 이관, previewImages는 기본 초기화)
 * 3) regeneratePreviews.ts로 미리보기 재생성
 *
 * 실행 예시:
 *   node --experimental-strip-types scripts/migrateLegacyMaterials.ts
 *   node --experimental-strip-types scripts/migrateLegacyMaterials.ts --apply
 *   node --experimental-strip-types scripts/migrateLegacyMaterials.ts --apply --source-db dreedu --target-db dre-edu
 *   node --experimental-strip-types scripts/migrateLegacyMaterials.ts --apply --strict-file-exists --compute-page-count
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { access } from 'fs/promises';
import mongoose, { type Connection, type Types } from 'mongoose';
import type { AnyBulkWriteOperation, Collection } from 'mongodb';
import { nanoid } from 'nanoid';

import { normalizeText } from '../lib/api-helpers';
import {
  FILE_TYPES,
  TARGET_AUDIENCES,
  resolveMaterialCurriculumFromSubject,
  type FileType,
  type MaterialCurriculum,
  type MaterialSourceCategory,
  type TargetAudience,
} from '../lib/constants/material';
import { resolveSourceCategory } from '../lib/material-display';
import { getMaterialFilePageCount } from '../lib/material-page-count';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ALLOWED_DOC_EXT = new Set(['pdf', 'hwp', 'hwpx']);
const DIFFICULTY_RATING_MAP: Record<number, number> = {
  1: 600,
  2: 800,
  3: 1000,
  4: 1300,
  5: 1600,
};

interface LegacyMaterialDoc {
  _id: Types.ObjectId;
  materialId?: unknown;
  type?: unknown;
  uploaderId?: unknown;
  regionSido?: unknown;
  regionGugun?: unknown;
  year?: unknown;
  schoolName?: unknown;
  schoolLevel?: unknown;
  gradeNumber?: unknown;
  semester?: unknown;
  period?: unknown;
  subject?: unknown;
  unit?: unknown;
  topic?: unknown;
  publisher?: unknown;
  bookTitle?: unknown;
  ebookDescription?: unknown;
  ebookToc?: unknown;
  sourceCategory?: unknown;
  curriculum?: unknown;
  difficulty?: unknown;
  difficultyRating?: unknown;
  targetAudience?: unknown;
  fileType?: unknown;
  teacherProductType?: unknown;
  teacherClassPrepType?: unknown;
  priceProblem?: unknown;
  priceEtc?: unknown;
  problemFile?: unknown;
  etcFile?: unknown;
  previewImages?: unknown;
  isFree?: unknown;
  pageCount?: unknown;
  downloadCount?: unknown;
  viewCount?: unknown;
  likeCount?: unknown;
  isActive?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface NewMaterialSet {
  uploaderId: string;
  curriculum: MaterialCurriculum;
  sourceCategory: MaterialSourceCategory;
  type: string;
  publisher: string;
  bookTitle: string;
  ebookDescription: string;
  ebookToc: string[];
  subject: string;
  topic: string;
  schoolLevel: string;
  gradeNumber: number;
  year: number;
  semester: number;
  period: string;
  schoolName: string;
  regionSido: string;
  regionGugun: string;
  difficulty: number;
  difficultyRating: number;
  fileType: FileType;
  targetAudience: TargetAudience;
  teacherProductType: '' | 'ebook' | 'class_prep' | 'naver_cert';
  teacherClassPrepType: string;
  isFree: boolean;
  priceProblem: number;
  priceEtc: number;
  problemFile: string | null;
  etcFile: string | null;
  previewImages: string[];
  pageCount: number;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  isActive: boolean;
  updatedAt: Date;
}

type ArgConfig = {
  apply: boolean;
  limit: number;
  sourceUri: string;
  sourceDb: string;
  sourceCollection: string;
  targetUri: string;
  targetDb: string;
  targetCollection: string;
  strictFileExists: boolean;
  computePageCount: boolean;
  keepPreviews: boolean;
  drySample: number;
};

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function getArgValue(name: string): string | null {
  const withEquals = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (withEquals) {
    return withEquals.slice(name.length + 1).trim() || null;
  }
  const idx = process.argv.indexOf(name);
  if (idx >= 0) {
    const next = process.argv[idx + 1];
    if (next && !next.startsWith('--')) return next.trim();
  }
  return null;
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseDbNameFromUri(uri: string, fallback: string): string {
  const match = uri.match(/\/([^/?]+)(?:\?|$)/);
  if (!match || !match[1]) return fallback;
  return decodeURIComponent(match[1]);
}

function toInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNonNegativeInt(value: unknown, fallback = 0): number {
  const parsed = toInt(value, fallback);
  return parsed < 0 ? fallback : parsed;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function normalizeLegacyFileName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.trim();
  if (!name) return null;
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_DOC_EXT.has(ext)) return null;
  return name;
}

function normalizeEbookToc(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 50);
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 50);
  }
  return [];
}

function inferFileType(
  legacyFileType: unknown,
  problemFile: string | null,
  etcFile: string | null,
): FileType {
  const normalized = normalizeText(legacyFileType).toLowerCase();
  if ((FILE_TYPES as readonly string[]).includes(normalized)) {
    return normalized as FileType;
  }

  const fileExts = [problemFile, etcFile]
    .filter((v): v is string => !!v)
    .map((name) => name.split('.').pop()?.toLowerCase() || '');

  const hasPdf = fileExts.includes('pdf');
  const hasHwp = fileExts.includes('hwp') || fileExts.includes('hwpx');
  if (hasPdf && hasHwp) return 'both';
  if (hasHwp) return 'hwp';
  return 'pdf';
}

function normalizeTargetAudience(legacyValue: unknown, fileType: FileType): TargetAudience {
  const normalized = normalizeText(legacyValue).toLowerCase();
  if ((TARGET_AUDIENCES as readonly string[]).includes(normalized)) {
    return normalized as TargetAudience;
  }
  if (fileType === 'hwp') return 'teacher';
  return 'student';
}

function normalizeCurriculum(
  legacyValue: unknown,
  sourceCategory: MaterialSourceCategory,
  subject: string,
): MaterialCurriculum {
  if (sourceCategory === 'ebook') return 'revised_2022';
  const normalized = normalizeText(legacyValue);
  if (normalized === 'legacy' || normalized === 'revised_2022') {
    return normalized;
  }
  return resolveMaterialCurriculumFromSubject(subject);
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseConfig(): ArgConfig {
  const sourceUri = getArgValue('--source-uri')
    || process.env.LEGACY_MONGODB_URI
    || process.env.MONGODB_URI
    || 'mongodb://localhost:27017/dreedu';

  const targetUri = getArgValue('--target-uri')
    || process.env.MONGODB_URI
    || 'mongodb://localhost:27017/dre-edu';

  const sourceDb = getArgValue('--source-db')
    || process.env.LEGACY_DB_NAME
    || parseDbNameFromUri(sourceUri, 'dreedu');

  const targetDb = getArgValue('--target-db')
    || process.env.TARGET_DB_NAME
    || parseDbNameFromUri(targetUri, 'dre-edu');

  return {
    apply: hasFlag('--apply'),
    limit: parsePositiveInt(getArgValue('--limit'), 0),
    sourceUri,
    sourceDb,
    sourceCollection: getArgValue('--source-collection') || 'materials',
    targetUri,
    targetDb,
    targetCollection: getArgValue('--target-collection') || 'materials',
    strictFileExists: hasFlag('--strict-file-exists'),
    computePageCount: hasFlag('--compute-page-count'),
    keepPreviews: hasFlag('--keep-previews'),
    drySample: parsePositiveInt(getArgValue('--sample'), 20),
  };
}

async function connect(uri: string, dbName: string): Promise<Connection> {
  const conn = await mongoose.createConnection(uri, { dbName }).asPromise();
  return conn;
}

async function flushBulk(
  collection: Collection,
  operations: AnyBulkWriteOperation[],
): Promise<{ matchedCount: number; modifiedCount: number; upsertedCount: number }> {
  if (operations.length === 0) {
    return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
  }
  const result = await collection.bulkWrite(operations, { ordered: false });
  operations.length = 0;
  return {
    matchedCount: result.matchedCount ?? 0,
    modifiedCount: result.modifiedCount ?? 0,
    upsertedCount: result.upsertedCount ?? 0,
  };
}

async function main() {
  const cfg = parseConfig();
  const uploadDir = path.join(process.cwd(), 'uploads', 'files');
  const sameDb = cfg.sourceUri === cfg.targetUri && cfg.sourceDb === cfg.targetDb;

  console.log('\n=== migrateLegacyMaterials ===');
  console.log(`mode: ${cfg.apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`source: ${cfg.sourceUri} / ${cfg.sourceDb}.${cfg.sourceCollection}`);
  console.log(`target: ${cfg.targetUri} / ${cfg.targetDb}.${cfg.targetCollection}`);
  console.log(`limit: ${cfg.limit > 0 ? cfg.limit : 'ALL'}`);
  console.log(`strict file exists: ${cfg.strictFileExists ? 'ON' : 'OFF'}`);
  console.log(`compute page count: ${cfg.computePageCount ? 'ON' : 'OFF'}`);
  console.log(`keep previews: ${cfg.keepPreviews ? 'ON' : 'OFF (reset)'}`);
  if (sameDb) {
    console.log('[warn] source/target DB가 동일합니다. in-place 변환 모드로 동작합니다.');
  }

  let sourceConn: Connection | null = null;
  let targetConn: Connection | null = null;

  try {
    sourceConn = await connect(cfg.sourceUri, cfg.sourceDb);
    targetConn = await connect(cfg.targetUri, cfg.targetDb);

    const sourceCol = sourceConn.collection<LegacyMaterialDoc>(cfg.sourceCollection);
    const targetCol = targetConn.collection(cfg.targetCollection);

    const cursor = sourceCol.find({}, {
      projection: {
        materialId: 1,
        type: 1,
        uploaderId: 1,
        regionSido: 1,
        regionGugun: 1,
        year: 1,
        schoolName: 1,
        schoolLevel: 1,
        gradeNumber: 1,
        semester: 1,
        period: 1,
        subject: 1,
        unit: 1,
        topic: 1,
        publisher: 1,
        bookTitle: 1,
        ebookDescription: 1,
        ebookToc: 1,
        sourceCategory: 1,
        curriculum: 1,
        difficulty: 1,
        difficultyRating: 1,
        targetAudience: 1,
        fileType: 1,
        teacherProductType: 1,
        teacherClassPrepType: 1,
        priceProblem: 1,
        priceEtc: 1,
        problemFile: 1,
        etcFile: 1,
        previewImages: 1,
        isFree: 1,
        pageCount: 1,
        downloadCount: 1,
        viewCount: 1,
        likeCount: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });
    if (cfg.limit > 0) cursor.limit(cfg.limit);

    const operations: AnyBulkWriteOperation[] = [];
    const samples: Array<{ materialId: string; sourceCategory: string; fileType: string; topic: string; problemFile: string | null; etcFile: string | null }> = [];
    const stat = {
      scanned: 0,
      converted: 0,
      autoGeneratedMaterialId: 0,
      missingProblemFile: 0,
      missingEtcFile: 0,
      invalidProblemFileExt: 0,
      invalidEtcFileExt: 0,
      ebookCount: 0,
      problemFileCount: 0,
      etcFileCount: 0,
      previewResetCount: 0,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
    };

    for await (const doc of cursor) {
      stat.scanned += 1;

      let materialId = normalizeText(doc.materialId);
      if (!materialId) {
        materialId = `legacy-${nanoid(10)}`;
        stat.autoGeneratedMaterialId += 1;
      }

      const normalizedType = normalizeText(doc.type) || '내신기출';
      const topic = normalizeText(doc.topic) || normalizeText(doc.unit);

      let problemFile = normalizeLegacyFileName(doc.problemFile);
      let etcFile = normalizeLegacyFileName(doc.etcFile);
      if (normalizeText(doc.problemFile) && !problemFile) stat.invalidProblemFileExt += 1;
      if (normalizeText(doc.etcFile) && !etcFile) stat.invalidEtcFileExt += 1;

      if (cfg.strictFileExists) {
        if (problemFile && !(await pathExists(path.join(uploadDir, problemFile)))) {
          stat.missingProblemFile += 1;
          problemFile = null;
        }
        if (etcFile && !(await pathExists(path.join(uploadDir, etcFile)))) {
          stat.missingEtcFile += 1;
          etcFile = null;
        }
      }

      if (problemFile) stat.problemFileCount += 1;
      if (etcFile) stat.etcFileCount += 1;

      const ebookTocHint = (
        Array.isArray(doc.ebookToc) || typeof doc.ebookToc === 'string'
      ) ? (doc.ebookToc as string[] | string) : null;

      const sourceCategory = resolveSourceCategory({
        sourceCategory: normalizeText(doc.sourceCategory),
        type: normalizedType,
        subject: normalizeText(doc.subject),
        ebookDescription: normalizeText(doc.ebookDescription),
        ebookToc: ebookTocHint,
      });

      if (sourceCategory === 'ebook') stat.ebookCount += 1;

      const subjectRaw = normalizeText(doc.subject);
      const subject = sourceCategory === 'ebook' ? '전자책' : subjectRaw;
      const curriculum = normalizeCurriculum(doc.curriculum, sourceCategory, subject);

      const fileType = inferFileType(doc.fileType, problemFile, etcFile);
      const targetAudience = normalizeTargetAudience(doc.targetAudience, fileType);

      let difficulty = toInt(doc.difficulty, 3);
      if (difficulty < 1 || difficulty > 5) difficulty = 3;

      const difficultyRating = (() => {
        const raw = toInt(doc.difficultyRating, 0);
        if (raw >= 100 && raw <= 3000) return raw;
        return DIFFICULTY_RATING_MAP[difficulty] || 1000;
      })();

      const priceProblemRaw = toNonNegativeInt(doc.priceProblem, 0);
      const priceEtcRaw = toNonNegativeInt(doc.priceEtc, 0);
      const isFree = Boolean(doc.isFree) || (priceProblemRaw === 0 && priceEtcRaw === 0);
      const priceProblem = isFree ? 0 : priceProblemRaw;
      const priceEtc = isFree ? 0 : priceEtcRaw;

      const schoolLevel = sourceCategory === 'ebook'
        ? ''
        : (normalizeText(doc.schoolLevel) || '고등학교');
      const gradeNumber = sourceCategory === 'ebook'
        ? 0
        : Math.max(1, toInt(doc.gradeNumber, 2));
      const semester = sourceCategory === 'ebook'
        ? 0
        : Math.max(1, toInt(doc.semester, 1));
      const year = Math.max(2000, toInt(doc.year, new Date().getFullYear()));
      const period = sourceCategory === 'ebook' ? '' : normalizeText(doc.period);
      const schoolName = sourceCategory === 'school_exam' ? normalizeText(doc.schoolName) : '';
      const regionSido = sourceCategory === 'school_exam' ? normalizeText(doc.regionSido) : '';
      const regionGugun = sourceCategory === 'school_exam' ? normalizeText(doc.regionGugun) : '';

      const publisher = normalizeText(doc.publisher);
      const topicFallback = topic || normalizeText(doc.bookTitle);
      const bookTitle = sourceCategory === 'ebook'
        ? (normalizeText(doc.bookTitle) || topicFallback)
        : normalizeText(doc.bookTitle);
      const ebookDescription = sourceCategory === 'ebook' ? normalizeText(doc.ebookDescription) : '';
      const ebookToc = sourceCategory === 'ebook' ? normalizeEbookToc(doc.ebookToc) : [];

      const createdAt = toDate(doc.createdAt) || new Date();
      const updatedAt = toDate(doc.updatedAt) || createdAt;
      const isActive = typeof doc.isActive === 'boolean' ? doc.isActive : true;

      let pageCount = toNonNegativeInt(doc.pageCount, 0);
      if (cfg.computePageCount) {
        pageCount = await getMaterialFilePageCount(problemFile || etcFile) || 0;
      }

      const previewImages = cfg.keepPreviews
        ? (Array.isArray(doc.previewImages)
          ? doc.previewImages
            .filter((v): v is string => typeof v === 'string')
            .map((v) => v.trim())
            .filter(Boolean)
            .slice(0, 2)
          : [])
        : [];
      if (!cfg.keepPreviews) stat.previewResetCount += 1;

      const setDoc: NewMaterialSet = {
        uploaderId: normalizeText(doc.uploaderId) || 'legacy-migration',
        curriculum,
        sourceCategory,
        type: normalizedType,
        publisher,
        bookTitle,
        ebookDescription,
        ebookToc,
        subject,
        topic,
        schoolLevel,
        gradeNumber,
        year,
        semester,
        period,
        schoolName,
        regionSido,
        regionGugun,
        difficulty,
        difficultyRating,
        fileType,
        targetAudience,
        teacherProductType: '',
        teacherClassPrepType: '',
        isFree,
        priceProblem,
        priceEtc,
        problemFile,
        etcFile,
        previewImages,
        pageCount,
        viewCount: toNonNegativeInt(doc.viewCount, 0),
        downloadCount: toNonNegativeInt(doc.downloadCount, 0),
        likeCount: toNonNegativeInt(doc.likeCount, 0),
        isActive,
        updatedAt,
      };

      stat.converted += 1;
      if (samples.length < cfg.drySample) {
        samples.push({
          materialId,
          sourceCategory,
          fileType,
          topic: setDoc.topic,
          problemFile: setDoc.problemFile,
          etcFile: setDoc.etcFile,
        });
      }

      if (!cfg.apply) continue;

      operations.push({
        updateOne: {
          filter: { materialId },
          update: {
            $set: setDoc,
            $setOnInsert: { materialId, createdAt },
          },
          upsert: true,
        },
      });

      if (operations.length >= 250) {
        const result = await flushBulk(targetCol, operations);
        stat.matchedCount += result.matchedCount;
        stat.modifiedCount += result.modifiedCount;
        stat.upsertedCount += result.upsertedCount;
      }
    }

    if (cfg.apply && operations.length > 0) {
      const result = await flushBulk(targetCol, operations);
      stat.matchedCount += result.matchedCount;
      stat.modifiedCount += result.modifiedCount;
      stat.upsertedCount += result.upsertedCount;
    }

    console.log('\n--- summary ---');
    console.log(`scanned: ${stat.scanned}`);
    console.log(`converted: ${stat.converted}`);
    console.log(`ebook inferred: ${stat.ebookCount}`);
    console.log(`problemFile kept: ${stat.problemFileCount}`);
    console.log(`etcFile kept: ${stat.etcFileCount}`);
    console.log(`preview reset: ${stat.previewResetCount}`);
    console.log(`auto materialId: ${stat.autoGeneratedMaterialId}`);
    console.log(`invalid problem ext: ${stat.invalidProblemFileExt}`);
    console.log(`invalid etc ext: ${stat.invalidEtcFileExt}`);
    if (cfg.strictFileExists) {
      console.log(`missing problem file: ${stat.missingProblemFile}`);
      console.log(`missing etc file: ${stat.missingEtcFile}`);
    }

    if (cfg.apply) {
      console.log('\n--- db write ---');
      console.log(`matched: ${stat.matchedCount}`);
      console.log(`modified: ${stat.modifiedCount}`);
      console.log(`upserted: ${stat.upsertedCount}`);
    } else {
      console.log('\n(dry-run) --apply 옵션으로 실제 반영');
    }

    if (samples.length > 0) {
      console.log('\n--- sample ---');
      for (const sample of samples) {
        console.log(
          `- ${sample.materialId} | ${sample.sourceCategory} | ${sample.fileType} | topic="${sample.topic}" | problem=${sample.problemFile || '-'} | etc=${sample.etcFile || '-'}`
        );
      }
    }
  } finally {
    await sourceConn?.close();
    await targetConn?.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
