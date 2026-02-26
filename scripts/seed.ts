/**
 * 통합 시드 스크립트
 *
 * 사용법:
 *   npx tsx scripts/seed.ts          # 빈 컬렉션만 시드
 *   npx tsx scripts/seed.ts --force  # 초기화 후 재삽입
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectMongo from '../lib/mongoose';
import User from '../lib/models/User';
import HallOfFameEntry from '../lib/models/HallOfFameEntry';
import { seedDefaultCommunityUpgradeProductsIfEmpty } from '../lib/community-upgrade';
import CommunityUpgradeProduct from '../lib/models/CommunityUpgradeProduct';
import {
  DEFAULT_HALL_OF_FAME_ADMISSIONS,
  DEFAULT_HALL_OF_FAME_REVIEWS,
} from '../lib/hall-of-fame';

const force = process.argv.includes('--force');

function log(label: string, msg: string) {
  console.log(`[seed] ${label}: ${msg}`);
}

async function seedCollection<T>(
  label: string,
  model: mongoose.Model<T>,
  seedFn: () => Promise<number>,
) {
  const count = await model.countDocuments();
  if (count > 0 && !force) {
    log(label, `이미 ${count}건 존재 — 스킵`);
    return;
  }
  if (force && count > 0) {
    await model.deleteMany({});
    log(label, `기존 ${count}건 삭제`);
  }
  const inserted = await seedFn();
  log(label, `${inserted}건 삽입 완료`);
}

// ─── 1. Users (관리자) ─────────────────────────────────────
async function seedUsers() {
  const doc = await User.create({
    email: 'carry0318@gmail.com',
    username: '관리자',
    password: 'william295303@',
    role: 'admin' as const,
    emailVerified: true,
    teacherApprovalStatus: 'approved' as const,
  });
  return doc ? 1 : 0;
}

// ─── 2. CommunityUpgradeProduct (네이버 상품) ──────────────
async function seedCommunityUpgradeProducts() {
  if (force) {
    await CommunityUpgradeProduct.deleteMany({});
  }
  const seeded = await seedDefaultCommunityUpgradeProductsIfEmpty();
  return seeded ? 2 : 0;
}

// ─── 3. HallOfFameEntry (명예의 전당) ──────────────────────
async function seedHallOfFame() {
  const admissions = DEFAULT_HALL_OF_FAME_ADMISSIONS.map((a, i) => ({
    kind: 'admission' as const,
    sortOrder: i,
    univ: a.univ,
    major: a.major,
    student: a.student,
    school: a.school,
    badge: a.badge,
    desc: a.desc,
  }));

  const reviews = DEFAULT_HALL_OF_FAME_REVIEWS.map((r, i) => ({
    kind: 'review' as const,
    sortOrder: i,
    name: r.name,
    content: r.content,
    tag: r.tag,
    stars: r.stars,
  }));

  const docs = await HallOfFameEntry.insertMany([...admissions, ...reviews]);
  return docs.length;
}

// ─── main ──────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱 시드 시작 ${force ? '(--force 모드)' : ''}\n`);
  await connectMongo();

  // 1. 관리자 계정
  await seedCollection('User', User, seedUsers);

  // 2. 네이버 커뮤니티 상품
  log('CommunityUpgradeProduct', '시드 중...');
  const cupCount = await seedCommunityUpgradeProducts();
  log('CommunityUpgradeProduct', cupCount > 0 ? `${cupCount}건 삽입 완료` : '이미 존재 — 스킵');

  // 3. 명예의 전당
  await seedCollection('HallOfFameEntry', HallOfFameEntry, seedHallOfFame);

  console.log('\n✅ 시드 완료\n');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seed] 오류:', err);
  process.exit(1);
});
