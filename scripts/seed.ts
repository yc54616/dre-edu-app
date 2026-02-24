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
import Material from '../lib/models/Material';
import Problem from '../lib/models/Problem';
import Order from '../lib/models/Order';
import HallOfFameEntry from '../lib/models/HallOfFameEntry';
import Consultation from '../lib/models/Consultation';
import CommunityUpgradeOrder from '../lib/models/CommunityUpgradeOrder';
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

// ─── 1. Users ──────────────────────────────────────────────
async function seedUsers() {
  const users = [
    {
      email: 'admin@dre-edu.com',
      username: '관리자',
      password: 'admin1234!',
      role: 'admin' as const,
      emailVerified: true,
      teacherApprovalStatus: 'approved' as const,
    },
    {
      email: 'teacher@dre-edu.com',
      username: '김선생',
      password: 'teacher1234!',
      role: 'teacher' as const,
      emailVerified: true,
      teacherApprovalStatus: 'approved' as const,
    },
    {
      email: 'student@dre-edu.com',
      username: '박학생',
      password: 'student1234!',
      role: 'student' as const,
      emailVerified: true,
    },
  ];

  // User.create triggers pre-save bcrypt hook per document
  const docs = await Promise.all(users.map((u) => User.create(u)));
  return docs.length;
}

// ─── 2. CommunityUpgradeProduct ────────────────────────────
async function seedCommunityUpgradeProducts() {
  if (force) {
    await CommunityUpgradeProduct.deleteMany({});
  }
  const seeded = await seedDefaultCommunityUpgradeProductsIfEmpty();
  return seeded ? 2 : 0;
}

// ─── 3. Materials ──────────────────────────────────────────
async function seedMaterials(adminId: string) {
  const materials = [
    {
      uploaderId: adminId,
      curriculum: 'revised_2022' as const,
      sourceCategory: 'school_exam' as const,
      type: '내신기출',
      subject: '공통수학I',
      topic: '다항식',
      schoolLevel: '고등학교',
      gradeNumber: 1,
      year: 2025,
      semester: 1,
      period: '중간고사',
      schoolName: '서울고등학교',
      regionSido: '서울특별시',
      regionGugun: '강남구',
      difficulty: 3,
      isFree: true,
      priceProblem: 0,
      priceEtc: 0,
      problemFile: null,
      etcFile: null,
    },
    {
      uploaderId: adminId,
      curriculum: 'revised_2022' as const,
      sourceCategory: 'textbook' as const,
      type: '교과서 개념',
      subject: '미적분1',
      topic: '수열의 극한',
      schoolLevel: '고등학교',
      gradeNumber: 2,
      difficulty: 2,
      publisher: '비상교육',
      isFree: false,
      priceProblem: 3000,
      priceEtc: 0,
      problemFile: null,
      etcFile: null,
    },
    {
      uploaderId: adminId,
      curriculum: 'revised_2022' as const,
      sourceCategory: 'ebook' as const,
      type: '전자책',
      subject: '확률과통계',
      topic: '확률',
      schoolLevel: '고등학교',
      gradeNumber: 2,
      difficulty: 3,
      targetAudience: 'teacher' as const,
      teacherProductType: 'ebook' as const,
      ebookDescription: 'DRE 확률과통계 전자책 샘플',
      ebookToc: ['1장 경우의 수', '2장 확률', '3장 통계'],
      isFree: false,
      priceProblem: 5000,
      priceEtc: 0,
      problemFile: null,
      etcFile: null,
    },
  ];

  const docs = await Material.insertMany(materials);
  return docs.length;
}

// ─── 4. Problems ───────────────────────────────────────────
async function seedProblems() {
  const problems = [
    {
      title: '공통수학I 다항식 기본 개념',
      content: '다항식 (x+1)(x²-x+1)을 전개하시오.',
      options: ['x³+1', 'x³-1', 'x³+x²+1', 'x³-x+1'],
      answer: 1,
      explanation: '합차공식에 의해 (x+1)(x²-x+1) = x³+1',
      category: '개념' as const,
      topic: '다항식',
      subject: '공통수학I' as const,
      grade: 1,
      difficulty: 2,
    },
    {
      title: '미적분1 수열의 극한 유형',
      content: 'lim(n→∞) (3n²+n)/(n²+2) 의 값을 구하시오.',
      options: ['1', '2', '3', '4'],
      answer: 3,
      explanation: '최고차항의 계수의 비: 3/1 = 3',
      category: '유형' as const,
      topic: '수열의 극한',
      subject: '미적분1' as const,
      grade: 2,
      difficulty: 3,
    },
    {
      title: '확률과통계 조건부확률 심화',
      content: '주머니에 빨간 공 3개, 파란 공 2개가 있다. 비복원으로 2개를 꺼낼 때, 첫 번째가 빨간 공이었다는 조건 하에 두 번째도 빨간 공일 확률을 구하시오.',
      options: ['1/2', '2/4', '3/5', '1/3'],
      answer: 1,
      explanation: '첫 번째 빨간 공을 꺼낸 후 남은 공: 빨간 2개, 파란 2개. P = 2/4 = 1/2',
      category: '심화' as const,
      topic: '확률',
      subject: '확률과통계' as const,
      grade: 2,
      difficulty: 4,
    },
  ];

  const docs = await Problem.insertMany(problems);
  return docs.length;
}

// ─── 5. HallOfFameEntry ────────────────────────────────────
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

// ─── 6. Consultations ─────────────────────────────────────
async function seedConsultations() {
  const consultations = [
    {
      type: 'admission' as const,
      name: '홍길동',
      phone: '010-1234-5678',
      schoolGrade: '고1',
      currentScore: '수학 3등급',
      targetUniv: '서울대학교',
      message: '입학 상담 희망합니다.',
    },
    {
      type: 'consulting' as const,
      name: '이영희',
      phone: '010-9876-5432',
      schoolGrade: '고2',
      currentScore: '수학 2등급',
      targetUniv: '연세대학교',
      direction: '수시',
      message: '입시컨설팅 상담 신청합니다.',
    },
  ];

  const docs = await Consultation.insertMany(consultations);
  return docs.length;
}

// ─── 7. Order ──────────────────────────────────────────────
async function seedOrders(
  studentId: string,
  materialId: string,
) {
  const doc = await Order.create({
    userId: studentId,
    userEmail: 'student@dre-edu.com',
    userName: '박학생',
    materialId,
    materialTitle: '공통수학I 다항식 내신기출',
    fileTypes: ['problem'],
    amount: 0,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    paymentNote: '시드 데이터',
    paidAt: new Date(),
  });
  return doc ? 1 : 0;
}

// ─── 8. CommunityUpgradeOrder ──────────────────────────────
async function seedCommunityUpgradeOrders() {
  const doc = await CommunityUpgradeOrder.create({
    productKey: 'premium',
    productName: '네이버 dre수학 교사용 프리미엄회원 인증',
    amount: 50000,
    applicantName: '김선생',
    phone: '010-1111-2222',
    cafeNickname: '수학교사김',
    status: 'paid',
    processStatus: 'completed',
    paymentMethod: 'card',
    paidAt: new Date(),
  });
  return doc ? 1 : 0;
}

// ─── main ──────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱 시드 시작 ${force ? '(--force 모드)' : ''}\n`);
  await connectMongo();

  // 1. Users
  let adminId = '';
  let studentId = '';
  await seedCollection('User', User, async () => {
    const count = await seedUsers();
    return count;
  });
  // resolve IDs (needed for later seeds)
  const admin = await User.findOne({ email: 'admin@dre-edu.com' }).lean();
  const student = await User.findOne({ email: 'student@dre-edu.com' }).lean();
  adminId = admin?._id?.toString() ?? '';
  studentId = student?._id?.toString() ?? '';

  if (!adminId) {
    console.error('[seed] admin 유저를 찾을 수 없습니다. 중단합니다.');
    process.exit(1);
  }

  // 2. CommunityUpgradeProduct (자체 멱등성 보유)
  log('CommunityUpgradeProduct', '시드 중...');
  const cupCount = await seedCommunityUpgradeProducts();
  log('CommunityUpgradeProduct', cupCount > 0 ? `${cupCount}건 삽입 완료` : '이미 존재 — 스킵');

  // 3. Materials
  let firstMaterialId = '';
  await seedCollection('Material', Material, async () => {
    const count = await seedMaterials(adminId);
    return count;
  });
  const firstMaterial = await Material.findOne({ uploaderId: adminId }).lean();
  firstMaterialId = firstMaterial?.materialId ?? '';

  // 4. Problems
  await seedCollection('Problem', Problem, seedProblems);

  // 5. HallOfFameEntry
  await seedCollection('HallOfFameEntry', HallOfFameEntry, seedHallOfFame);

  // 6. Consultations
  await seedCollection('Consultation', Consultation, seedConsultations);

  // 7. Order
  await seedCollection('Order', Order, async () => {
    if (!studentId || !firstMaterialId) {
      log('Order', 'student 또는 material 미존재 — 스킵');
      return 0;
    }
    return seedOrders(studentId, firstMaterialId);
  });

  // 8. CommunityUpgradeOrder
  await seedCollection('CommunityUpgradeOrder', CommunityUpgradeOrder, seedCommunityUpgradeOrders);

  console.log('\n✅ 시드 완료\n');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seed] 오류:', err);
  process.exit(1);
});
