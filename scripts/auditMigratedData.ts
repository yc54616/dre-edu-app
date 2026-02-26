/**
 * 마이그레이션 데이터 감사(audit) 스크립트
 *
 * read-only 스크립트입니다. DB/파일 변경 없음.
 *
 * 점검 항목:
 * - 필수 enum 유효성(sourceCategory/curriculum/fileType/targetAudience)
 * - 가격/무료 플래그 불일치
 * - topic/schoolName 누락
 * - problemFile/etcFile/previewImages 파일 실존 여부
 * - materialId 중복
 *
 * 실행 예시:
 *   node --experimental-strip-types scripts/auditMigratedData.ts
 *   node --experimental-strip-types scripts/auditMigratedData.ts --sample=30
 *   node --experimental-strip-types scripts/auditMigratedData.ts --out=tmp/audit-materials.json
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { access, mkdir, writeFile } from 'fs/promises';
import mongoose, { type Connection, type Types } from 'mongoose';
import type { Collection } from 'mongodb';

import {
  FILE_TYPES,
  MATERIAL_CURRICULUMS,
  MATERIAL_SOURCE_CATEGORIES,
  TARGET_AUDIENCES,
} from '../lib/constants/material';
import { normalizeText } from '../lib/api-helpers';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface MaterialAuditDoc {
  _id: Types.ObjectId;
  materialId?: unknown;
  sourceCategory?: unknown;
  curriculum?: unknown;
  fileType?: unknown;
  targetAudience?: unknown;
  type?: unknown;
  subject?: unknown;
  topic?: unknown;
  schoolName?: unknown;
  priceProblem?: unknown;
  priceEtc?: unknown;
  isFree?: unknown;
  problemFile?: unknown;
  etcFile?: unknown;
  previewImages?: unknown;
}

type Config = {
  uri: string;
  dbName: string;
  collection: string;
  sample: number;
  skipFileCheck: boolean;
  outFile: string | null;
};

type SampleBucket = Record<string, string[]>;

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

function parseDbNameFromUri(uri: string, fallback: string): string {
  const match = uri.match(/\/([^/?]+)(?:\?|$)/);
  if (!match || !match[1]) return fallback;
  return decodeURIComponent(match[1]);
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function toNonNegativeInt(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 0 ? fallback : Math.trunc(value);
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed < 0 ? fallback : parsed;
  }
  return fallback;
}

function parseConfig(): Config {
  const uri = getArgValue('--uri')
    || process.env.MONGODB_URI
    || 'mongodb://localhost:27017/dre-edu';
  return {
    uri,
    dbName: getArgValue('--db')
      || process.env.TARGET_DB_NAME
      || parseDbNameFromUri(uri, 'dre-edu'),
    collection: getArgValue('--collection') || 'materials',
    sample: parsePositiveInt(getArgValue('--sample'), 20),
    skipFileCheck: hasFlag('--skip-file-check'),
    outFile: getArgValue('--out'),
  };
}

async function connect(uri: string, dbName: string): Promise<Connection> {
  return await mongoose.createConnection(uri, { dbName }).asPromise();
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function pushSample(samples: SampleBucket, key: string, value: string, limit: number) {
  if (!samples[key]) samples[key] = [];
  if (samples[key].length >= limit) return;
  samples[key].push(value);
}

async function main() {
  const cfg = parseConfig();
  console.log('\n=== auditMigratedData ===');
  console.log(`target: ${cfg.uri} / ${cfg.dbName}.${cfg.collection}`);
  console.log(`sample limit: ${cfg.sample}`);
  console.log(`file check: ${cfg.skipFileCheck ? 'SKIP' : 'ON'}`);
  if (cfg.outFile) console.log(`out: ${cfg.outFile}`);

  const validSource = new Set<string>(MATERIAL_SOURCE_CATEGORIES as readonly string[]);
  const validCurriculum = new Set<string>(MATERIAL_CURRICULUMS as readonly string[]);
  const validFileType = new Set<string>(FILE_TYPES as readonly string[]);
  const validAudience = new Set<string>(TARGET_AUDIENCES as readonly string[]);

  let conn: Connection | null = null;

  try {
    conn = await connect(cfg.uri, cfg.dbName);
    const col: Collection<MaterialAuditDoc> = conn.collection(cfg.collection);

    const cursor = col.find({}, {
      projection: {
        materialId: 1,
        sourceCategory: 1,
        curriculum: 1,
        fileType: 1,
        targetAudience: 1,
        type: 1,
        subject: 1,
        topic: 1,
        schoolName: 1,
        priceProblem: 1,
        priceEtc: 1,
        isFree: 1,
        problemFile: 1,
        etcFile: 1,
        previewImages: 1,
      },
    });

    const samples: SampleBucket = {};
    const bySourceCategory: Record<string, number> = {};
    const byFileType: Record<string, number> = {};
    const stat = {
      total: 0,
      invalidSourceCategory: 0,
      invalidCurriculum: 0,
      invalidFileType: 0,
      invalidTargetAudience: 0,
      missingTopic: 0,
      missingSchoolNameForSchoolExam: 0,
      missingBothFiles: 0,
      freePriceMismatch: 0,
      paidZeroPrice: 0,
      brokenProblemFileRef: 0,
      brokenEtcFileRef: 0,
      noPreviewImages: 0,
      brokenPreviewRefDoc: 0,
      brokenPreviewRefFileCount: 0,
    };

    for await (const doc of cursor) {
      stat.total += 1;
      const materialId = normalizeText(doc.materialId) || String(doc._id);

      const sourceCategory = normalizeText(doc.sourceCategory);
      const curriculum = normalizeText(doc.curriculum);
      const fileType = normalizeText(doc.fileType);
      const targetAudience = normalizeText(doc.targetAudience);

      bySourceCategory[sourceCategory || '(empty)'] = (bySourceCategory[sourceCategory || '(empty)'] || 0) + 1;
      byFileType[fileType || '(empty)'] = (byFileType[fileType || '(empty)'] || 0) + 1;

      if (!validSource.has(sourceCategory)) {
        stat.invalidSourceCategory += 1;
        pushSample(samples, 'invalidSourceCategory', materialId, cfg.sample);
      }
      if (!validCurriculum.has(curriculum)) {
        stat.invalidCurriculum += 1;
        pushSample(samples, 'invalidCurriculum', materialId, cfg.sample);
      }
      if (!validFileType.has(fileType)) {
        stat.invalidFileType += 1;
        pushSample(samples, 'invalidFileType', materialId, cfg.sample);
      }
      if (!validAudience.has(targetAudience)) {
        stat.invalidTargetAudience += 1;
        pushSample(samples, 'invalidTargetAudience', materialId, cfg.sample);
      }

      const topic = normalizeText(doc.topic);
      if (!topic) {
        stat.missingTopic += 1;
        pushSample(samples, 'missingTopic', materialId, cfg.sample);
      }

      if (sourceCategory === 'school_exam' && !normalizeText(doc.schoolName)) {
        stat.missingSchoolNameForSchoolExam += 1;
        pushSample(samples, 'missingSchoolNameForSchoolExam', materialId, cfg.sample);
      }

      const problemFile = normalizeText(doc.problemFile);
      const etcFile = normalizeText(doc.etcFile);
      if (!problemFile && !etcFile) {
        stat.missingBothFiles += 1;
        pushSample(samples, 'missingBothFiles', materialId, cfg.sample);
      }

      const priceProblem = toNonNegativeInt(doc.priceProblem, 0);
      const priceEtc = toNonNegativeInt(doc.priceEtc, 0);
      const isFree = Boolean(doc.isFree);
      if (isFree && (priceProblem > 0 || priceEtc > 0)) {
        stat.freePriceMismatch += 1;
        pushSample(samples, 'freePriceMismatch', materialId, cfg.sample);
      }
      if (!isFree && priceProblem === 0 && priceEtc === 0) {
        stat.paidZeroPrice += 1;
        pushSample(samples, 'paidZeroPrice', materialId, cfg.sample);
      }

      const previewImages = Array.isArray(doc.previewImages)
        ? doc.previewImages.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean)
        : [];

      if (previewImages.length === 0) {
        stat.noPreviewImages += 1;
        pushSample(samples, 'noPreviewImages', materialId, cfg.sample);
      }

      if (cfg.skipFileCheck) continue;

      if (problemFile) {
        const p = path.join(process.cwd(), 'uploads', 'files', problemFile);
        if (!(await pathExists(p))) {
          stat.brokenProblemFileRef += 1;
          pushSample(samples, 'brokenProblemFileRef', `${materialId} -> ${problemFile}`, cfg.sample);
        }
      }

      if (etcFile) {
        const p = path.join(process.cwd(), 'uploads', 'files', etcFile);
        if (!(await pathExists(p))) {
          stat.brokenEtcFileRef += 1;
          pushSample(samples, 'brokenEtcFileRef', `${materialId} -> ${etcFile}`, cfg.sample);
        }
      }

      let hasBrokenPreview = false;
      for (const preview of previewImages) {
        const p = path.join(process.cwd(), 'public', 'uploads', 'previews', preview);
        if (!(await pathExists(p))) {
          stat.brokenPreviewRefFileCount += 1;
          hasBrokenPreview = true;
        }
      }
      if (hasBrokenPreview) {
        stat.brokenPreviewRefDoc += 1;
        pushSample(samples, 'brokenPreviewRefDoc', materialId, cfg.sample);
      }
    }

    const duplicates = await col.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$materialId', count: { $sum: 1 } } },
      { $match: { _id: { $type: 'string', $ne: '' }, count: { $gt: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 100 },
    ]).toArray();

    const report = {
      config: {
        db: cfg.dbName,
        collection: cfg.collection,
        skipFileCheck: cfg.skipFileCheck,
      },
      stat,
      distributions: {
        bySourceCategory,
        byFileType,
      },
      duplicateMaterialIds: duplicates,
      samples,
      generatedAt: new Date().toISOString(),
    };

    console.log('\n--- summary ---');
    console.log(`total: ${stat.total}`);
    console.log(`invalid sourceCategory: ${stat.invalidSourceCategory}`);
    console.log(`invalid curriculum: ${stat.invalidCurriculum}`);
    console.log(`invalid fileType: ${stat.invalidFileType}`);
    console.log(`invalid targetAudience: ${stat.invalidTargetAudience}`);
    console.log(`missing topic: ${stat.missingTopic}`);
    console.log(`missing schoolName(school_exam): ${stat.missingSchoolNameForSchoolExam}`);
    console.log(`missing both files: ${stat.missingBothFiles}`);
    console.log(`free price mismatch: ${stat.freePriceMismatch}`);
    console.log(`paid zero price: ${stat.paidZeroPrice}`);
    if (!cfg.skipFileCheck) {
      console.log(`broken problem file ref: ${stat.brokenProblemFileRef}`);
      console.log(`broken etc file ref: ${stat.brokenEtcFileRef}`);
      console.log(`docs with broken preview refs: ${stat.brokenPreviewRefDoc}`);
      console.log(`broken preview file refs(total): ${stat.brokenPreviewRefFileCount}`);
    }
    console.log(`no previewImages: ${stat.noPreviewImages}`);
    console.log(`duplicate materialIds: ${duplicates.length}`);

    if (cfg.outFile) {
      const outPath = path.resolve(process.cwd(), cfg.outFile);
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
      console.log(`\nreport saved: ${outPath}`);
    } else {
      console.log('\n(no --out) report file 저장 생략');
    }
  } finally {
    await conn?.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
