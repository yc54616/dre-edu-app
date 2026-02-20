/**
 * 협업 필터링 테스트용 시드 데이터 생성 스크립트
 * "비슷한 수준 학생들의 선택" 섹션이 보이도록
 *
 * 실행: npx tsx scripts/seedSimilarUsers.ts
 *
 * .env.local 필요:
 *   MONGODB_URI=mongodb://...
 *
 * 생성 내용:
 *   - userskills: 가상 유저 5명 (overallRating 900~1100, 현재 유저와 유사)
 *   - orders:     해당 유저들이 기존 자료를 구매한 기록
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dre-edu';
const SEED_TAG    = 'seed_similar_user';

const SEED_MATERIALS = [
  {
    subject: '수학', topic: '미적분', type: '수능기출', schoolLevel: '고등학교',
    gradeNumber: 3, year: 2025, semester: 1, schoolName: '시드고등학교',
    difficulty: 3, difficultyRating: 1050, fileType: 'pdf', targetAudience: 'student',
    isFree: false, priceProblem: 2000, priceEtc: 0,
  },
  {
    subject: '수학', topic: '확률과통계', type: '내신대비', schoolLevel: '고등학교',
    gradeNumber: 2, year: 2025, semester: 2, schoolName: '시드고등학교',
    difficulty: 2, difficultyRating: 900, fileType: 'pdf', targetAudience: 'student',
    isFree: false, priceProblem: 1500, priceEtc: 0,
  },
  {
    subject: '수학', topic: '수열', type: '학교시험', schoolLevel: '고등학교',
    gradeNumber: 1, year: 2025, semester: 1, schoolName: '시드고등학교',
    difficulty: 4, difficultyRating: 1200, fileType: 'pdf', targetAudience: 'student',
    isFree: true, priceProblem: 0, priceEtc: 0,
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;
  console.log('MongoDB 연결됨');

  const materialsCol  = db.collection('materials');
  const userSkillsCol = db.collection('userskills');
  const ordersCol     = db.collection('orders');

  const { nanoid } = await import('nanoid');

  // 1. 기존 시드 자료 삭제 후 재생성
  await materialsCol.deleteMany({ _seedTag: SEED_TAG });
  const seedMaterialIds: string[] = [];
  for (const m of SEED_MATERIALS) {
    const materialId = nanoid(10);
    await materialsCol.insertOne({
      ...m,
      materialId,
      uploaderId: 'seed',
      regionSido: '', regionGugun: '', period: '',
      problemFile: null, etcFile: null, previewImages: [],
      viewCount: 0, downloadCount: 0, likeCount: 0,
      isActive: true,
      createdAt: new Date(),
      _seedTag: SEED_TAG,
    });
    seedMaterialIds.push(materialId);
    console.log(`📄 시드 자료 생성: ${materialId} (${m.subject} · ${m.topic})`);
  }

  // 기존 자료도 후보에 포함 (시드 자료만 추천될 수 있도록 분리)
  const materialIds = seedMaterialIds;
  console.log(`📦 시드 자료 ${materialIds.length}개로 추천 데이터 구성`);

  // 2. 이미 시드된 데이터 제거 (재실행 시 중복 방지)
  const deletedSkills = await userSkillsCol.deleteMany({ _seedTag: SEED_TAG });
  const deletedOrders = await ordersCol.deleteMany({ _seedTag: SEED_TAG });
  if (deletedSkills.deletedCount > 0 || deletedOrders.deletedCount > 0) {
    console.log(`🗑  기존 시드 데이터 삭제: userskills ${deletedSkills.deletedCount}건, orders ${deletedOrders.deletedCount}건`);
  }

  // 3. 가상 유저 5명 생성 (overallRating 900~1100)
  const fakeUsers = [
    { rating: 950,  topics: { '수학': 960,  '미적분': 940 } },
    { rating: 1000, topics: { '수학': 1000, '확률과통계': 1000 } },
    { rating: 1050, topics: { '수학': 1050, '미적분': 1060 } },
    { rating: 980,  topics: { '수학': 990,  '수학I': 970 } },
    { rating: 1020, topics: { '수학': 1020, '수학II': 1010 } },
  ];

  const insertedUserIds: mongoose.Types.ObjectId[] = [];

  for (const fu of fakeUsers) {
    const userId = new mongoose.Types.ObjectId();
    const topicSkills: Record<string, object> = {};
    for (const [topic, rating] of Object.entries(fu.topics)) {
      topicSkills[topic] = { rating, attempts: 3, correct: 2, lastAttempted: new Date() };
    }

    await userSkillsCol.insertOne({
      userId,
      topicSkills,
      feedbackHistory:  {},
      overallRating:    fu.rating,
      totalAttempts:    3,
      totalCorrect:     2,
      updatedAt:        new Date(),
      _seedTag:         SEED_TAG,
    });

    insertedUserIds.push(userId);
    console.log(`👤 가상 유저 생성: ${userId} (rating: ${fu.rating})`);
  }

  // 4. 각 유저가 자료를 1~3개씩 구매한 Order 생성
  // 유저마다 다른 자료를 구매하도록 분산
  const orderDocs = [];

  for (let i = 0; i < insertedUserIds.length; i++) {
    const userId = insertedUserIds[i];
    // 각 유저가 materialIds에서 2~3개 선택 (인덱스를 엇갈리게)
    const picked = materialIds.slice(
      (i * 3) % materialIds.length,
      ((i * 3) % materialIds.length) + 3,
    );
    // 배열 끝을 넘어가면 앞에서 이어붙이기
    const selected = picked.length < 2
      ? [...picked, ...materialIds.slice(0, 2 - picked.length)]
      : picked;

    for (const materialId of selected) {
      orderDocs.push({
        orderId:       nanoid(12),
        userId:        userId.toString(),          // Order.userId는 String
        userEmail:     `sim_user_${i}@seed.test`,
        userName:      `시드유저${i + 1}`,
        materialId,
        materialTitle: '',
        fileTypes:     ['problem'],
        amount:        3000,
        status:        'paid',
        paymentMethod: 'bank_transfer',
        paymentNote:   '시드 데이터',
        paymentKey:    null,
        paidAt:        new Date(),
        createdAt:     new Date(),
        _seedTag:      SEED_TAG,
      });
    }
  }

  if (orderDocs.length > 0) {
    await ordersCol.insertMany(orderDocs);
    console.log(`🛒 주문 ${orderDocs.length}건 생성 완료`);
  }

  // 5. 요약 출력
  console.log('\n✅ 시드 완료!');
  console.log(`   - 가상 유저: ${insertedUserIds.length}명`);
  console.log(`   - 구매 기록: ${orderDocs.length}건`);
  console.log('   - 추천 페이지에서 "비슷한 수준 학생들의 선택" 섹션을 확인하세요.\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
