/**
 * materials.problemFile 기반 미리보기 재생성 스크립트
 *
 * 기본은 DRY-RUN(미반영)입니다.
 * --apply일 때만 preview 생성 + DB 업데이트를 수행합니다.
 *
 * 실행 예시:
 *   node --experimental-strip-types scripts/regeneratePreviews.ts
 *   node --experimental-strip-types scripts/regeneratePreviews.ts --apply
 *   node --experimental-strip-types scripts/regeneratePreviews.ts --apply --all --cleanup-old
 *   node --experimental-strip-types scripts/regeneratePreviews.ts --apply --limit=100 --refresh-page-count
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { access, unlink } from 'fs/promises';
import mongoose, { type Connection, type Types } from 'mongoose';
import type { Collection } from 'mongodb';

import { generatePreview } from '../lib/generatePreview';
import { getMaterialFilePageCount } from '../lib/material-page-count';
import { MAX_PREVIEW_IMAGES } from '../lib/constants/material';
import { normalizeText } from '../lib/api-helpers';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ALLOWED_DOC_EXT = new Set(['pdf', 'hwp', 'hwpx']);

interface MaterialPreviewDoc {
  _id: Types.ObjectId;
  materialId?: string;
  problemFile?: string | null;
  etcFile?: string | null;
  previewImages?: string[];
  pageCount?: number;
}

type Config = {
  apply: boolean;
  all: boolean;
  limit: number;
  uri: string;
  dbName: string;
  collection: string;
  maxPreview: number;
  refreshPageCount: boolean;
  cleanupOld: boolean;
  sample: number;
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

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function connect(uri: string, dbName: string): Promise<Connection> {
  return await mongoose.createConnection(uri, { dbName }).asPromise();
}

function parseConfig(): Config {
  const uri = getArgValue('--uri')
    || process.env.MONGODB_URI
    || 'mongodb://localhost:27017/dre-edu';
  const dbName = getArgValue('--db')
    || process.env.TARGET_DB_NAME
    || parseDbNameFromUri(uri, 'dre-edu');
  const maxPreview = Math.min(
    10,
    Math.max(1, parsePositiveInt(getArgValue('--max-preview'), MAX_PREVIEW_IMAGES)),
  );

  return {
    apply: hasFlag('--apply'),
    all: hasFlag('--all'),
    limit: parsePositiveInt(getArgValue('--limit'), 0),
    uri,
    dbName,
    collection: getArgValue('--collection') || 'materials',
    maxPreview,
    refreshPageCount: hasFlag('--refresh-page-count'),
    cleanupOld: hasFlag('--cleanup-old'),
    sample: parsePositiveInt(getArgValue('--sample'), 20),
  };
}

async function removeOldPreviewFiles(files: string[]) {
  for (const name of files) {
    const normalized = normalizeText(name);
    if (!normalized) continue;
    const previewPath = path.join(process.cwd(), 'public', 'uploads', 'previews', normalized);
    await unlink(previewPath).catch(() => {});
  }
}

async function main() {
  const cfg = parseConfig();

  console.log('\n=== regeneratePreviews ===');
  console.log(`mode: ${cfg.apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`target: ${cfg.uri} / ${cfg.dbName}.${cfg.collection}`);
  console.log(`scope: ${cfg.all ? 'ALL(with problemFile)' : 'missing previews only'}`);
  console.log(`limit: ${cfg.limit > 0 ? cfg.limit : 'ALL'}`);
  console.log(`max preview: ${cfg.maxPreview}`);
  console.log(`refresh pageCount: ${cfg.refreshPageCount ? 'ON' : 'OFF'}`);
  console.log(`cleanup old previews: ${cfg.cleanupOld ? 'ON' : 'OFF'}`);

  let conn: Connection | null = null;

  try {
    conn = await connect(cfg.uri, cfg.dbName);
    const col: Collection<MaterialPreviewDoc> = conn.collection(cfg.collection);

    const query: Record<string, unknown> = {
      problemFile: { $type: 'string', $ne: '' },
    };

    if (!cfg.all) {
      query.$or = [
        { previewImages: { $exists: false } },
        { previewImages: { $size: 0 } },
      ];
    }

    const cursor = col.find(query, {
      projection: {
        materialId: 1,
        problemFile: 1,
        etcFile: 1,
        previewImages: 1,
        pageCount: 1,
      },
    });
    if (cfg.limit > 0) cursor.limit(cfg.limit);

    const stat = {
      scanned: 0,
      candidate: 0,
      generated: 0,
      skippedMissingFile: 0,
      skippedInvalidExt: 0,
      failedGenerate: 0,
      updated: 0,
      cleanedOldPreviewFiles: 0,
    };
    const sample: string[] = [];

    for await (const doc of cursor) {
      stat.scanned += 1;
      const materialId = doc.materialId || String(doc._id);
      const problemFile = normalizeText(doc.problemFile);
      if (!problemFile) continue;
      stat.candidate += 1;

      const ext = problemFile.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_DOC_EXT.has(ext)) {
        stat.skippedInvalidExt += 1;
        continue;
      }

      const sourcePath = path.join(process.cwd(), 'uploads', 'files', problemFile);
      const exists = await pathExists(sourcePath);
      if (!exists) {
        stat.skippedMissingFile += 1;
        if (sample.length < cfg.sample) {
          sample.push(`${materialId}: missing file ${problemFile}`);
        }
        continue;
      }

      if (!cfg.apply) {
        if (sample.length < cfg.sample) {
          sample.push(`${materialId}: would regenerate from ${problemFile}`);
        }
        continue;
      }

      try {
        if (cfg.cleanupOld && Array.isArray(doc.previewImages) && doc.previewImages.length > 0) {
          await removeOldPreviewFiles(doc.previewImages);
          stat.cleanedOldPreviewFiles += doc.previewImages.length;
        }

        const previews = await generatePreview(sourcePath, ext, cfg.maxPreview);
        const nextPreviews = previews.slice(0, cfg.maxPreview);
        if (nextPreviews.length === 0) {
          stat.failedGenerate += 1;
          if (sample.length < cfg.sample) {
            sample.push(`${materialId}: preview generation returned empty`);
          }
          continue;
        }
        stat.generated += 1;

        const setDoc: Record<string, unknown> = {
          previewImages: nextPreviews,
          updatedAt: new Date(),
        };
        if (cfg.refreshPageCount) {
          const pageCount = await getMaterialFilePageCount(problemFile || normalizeText(doc.etcFile));
          setDoc.pageCount = pageCount ?? 0;
        }

        const result = await col.updateOne(
          { _id: doc._id },
          { $set: setDoc },
        );
        if (result.modifiedCount > 0 || result.matchedCount > 0) {
          stat.updated += 1;
        }
      } catch (error) {
        stat.failedGenerate += 1;
        if (sample.length < cfg.sample) {
          const msg = error instanceof Error ? error.message : String(error);
          sample.push(`${materialId}: ${msg}`);
        }
      }
    }

    console.log('\n--- summary ---');
    console.log(`scanned: ${stat.scanned}`);
    console.log(`candidate: ${stat.candidate}`);
    console.log(`invalid ext: ${stat.skippedInvalidExt}`);
    console.log(`missing source file: ${stat.skippedMissingFile}`);
    console.log(`generated: ${stat.generated}`);
    console.log(`failed generate: ${stat.failedGenerate}`);
    if (cfg.apply) {
      console.log(`updated docs: ${stat.updated}`);
      if (cfg.cleanupOld) {
        console.log(`removed old preview files: ${stat.cleanedOldPreviewFiles}`);
      }
    } else {
      console.log('(dry-run) --apply 옵션으로 실제 반영');
    }

    if (sample.length > 0) {
      console.log('\n--- sample ---');
      for (const line of sample) {
        console.log(`- ${line}`);
      }
    }
  } finally {
    await conn?.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
