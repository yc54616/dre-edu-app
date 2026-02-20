/**
 * ELO 기반 실력 추적 및 맞춤 자료 추천 알고리즘
 * 학생의 주제별 ELO 레이팅에 따라 PDF/HWP 자료를 추천
 */
import mongoose from 'mongoose';
import connectMongo from './mongoose';
import Material, { IMaterial } from './models/Material';
import UserSkill from './models/UserSkill';
import Order from './models/Order';

// Native MongoDB collection helper (Mongoose Map 변환 우회)
async function userSkillsCol() {
  const conn = await connectMongo();
  return conn.connection.db!.collection('userskills');
}

const K = 32;

export function expectedProbability(userRating: number, materialRating: number): number {
  return 1 / (1 + Math.pow(10, (materialRating - userRating) / 400));
}

export function updateRating(currentRating: number, difficulty: 'easy' | 'normal' | 'hard', materialRating: number): number {
  // 자료 완료 후 난이도 피드백으로 ELO 업데이트
  // easy → 자료가 쉬웠음 (이기는 것과 동일)
  // hard → 자료가 어려웠음 (지는 것과 동일)
  const isCorrect = difficulty === 'easy' || difficulty === 'normal';
  const p = expectedProbability(currentRating, materialRating);
  const delta = isCorrect ? K * (1 - p) : -K * p;
  return Math.round(Math.min(2000, Math.max(100, currentRating + delta)));
}

export interface RatingLevel {
  label: string;
  color: string;
  star: number;
}

export function ratingToLevel(rating: number): RatingLevel {
  if (rating >= 1500) return { label: '최상', color: 'red',    star: 5 };
  if (rating >= 1300) return { label: '상',   color: 'orange', star: 4 };
  if (rating >= 1100) return { label: '중상', color: 'violet', star: 3 };
  if (rating >= 900)  return { label: '중',   color: 'blue',   star: 2 };
  if (rating >= 700)  return { label: '중하', color: 'gray',   star: 1 };
  return                     { label: '기초', color: 'gray',   star: 0 };
}

/**
 * 자료 완료 피드백 처리 — ELO 업데이트
 * 자료당 1회만 가능 (feedbackHistory 중복 체크)
 * native MongoDB driver 사용 — Mongoose Map 변환 우회
 */
export async function processFeedback(opts: {
  materialId: string;
  userId: string;
  difficulty: 'easy' | 'normal' | 'hard';
}): Promise<{ newRating: number; ratingChange: number; topic: string; newMaterialRating: number }> {
  const { materialId, userId, difficulty } = opts;

  const col      = await userSkillsCol();
  const userOid  = new mongoose.Types.ObjectId(userId);
  const material = await Material.findOne({ materialId, isActive: true });
  if (!material) throw new Error('자료를 찾을 수 없습니다.');

  // 중복 피드백 방지
  const existing = await col.findOne({ userId: userOid, [`feedbackHistory.${materialId}`]: { $exists: true } });
  if (existing) throw new Error('이미 평가한 자료입니다.');

  // 현재 스킬 조회
  const doc          = await col.findOne({ userId: userOid });
  const topicSkills  = (doc?.topicSkills  ?? {}) as Record<string, { rating: number; attempts: number; correct: number; lastAttempted?: Date }>;

  const topicKey = material.topic || material.subject;
  const current  = topicSkills[topicKey] ?? { rating: 1000, attempts: 0, correct: 0 };

  const oldRating  = current.rating;
  const isCorrect  = difficulty === 'easy' || difficulty === 'normal';
  const p          = expectedProbability(oldRating, material.difficultyRating);

  const newTopicRating = updateRating(oldRating, difficulty, material.difficultyRating);
  const ratingChange   = newTopicRating - oldRating;

  const newTopicSkill = {
    rating:        newTopicRating,
    attempts:      (current.attempts || 0) + 1,
    correct:       (current.correct  || 0) + (isCorrect ? 1 : 0),
    lastAttempted: new Date(),
  };

  // overallRating 재계산
  const allTopics       = { ...topicSkills, [topicKey]: newTopicSkill };
  const ratings         = Object.values(allTopics).map((s) => s.rating);
  const newOverallRating = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);

  const totalAttempts = ((doc?.totalAttempts as number) ?? 0) + 1;
  const totalCorrect  = ((doc?.totalCorrect  as number) ?? 0) + (isCorrect ? 1 : 0);

  const materialRatingBefore = material.difficultyRating;
  const materialK     = 8;
  const materialDelta = isCorrect ? -(materialK * (1 - p)) : materialK * p;
  const newMaterialRating = Math.round(
    Math.min(2000, Math.max(100, material.difficultyRating + materialDelta))
  );

  // native driver로 직접 저장 (Mongoose Map 우회)
  await col.updateOne(
    { userId: userOid },
    {
      $set: {
        [`topicSkills.${topicKey}`]: newTopicSkill,
        [`feedbackHistory.${materialId}`]: {
          difficulty,
          topic:                topicKey,
          ratingBefore:         oldRating,
          materialRatingBefore,
          ratingChange,
          newRating:            newTopicRating,
          createdAt:            new Date(),
        },
        overallRating: newOverallRating,
        totalAttempts,
        totalCorrect,
        updatedAt:     new Date(),
      },
    },
    { upsert: true },
  );

  await Material.updateOne({ materialId }, { $set: { difficultyRating: newMaterialRating } });

  return { newRating: newTopicRating, ratingChange, topic: topicKey, newMaterialRating };
}

/**
 * 피드백 되돌리기 — ELO 원복
 * native MongoDB driver 사용 — Mongoose Map 변환 우회
 */
export async function undoFeedback(opts: {
  materialId: string;
  userId: string;
}): Promise<void> {
  const { materialId, userId } = opts;

  const col     = await userSkillsCol();
  const userOid = new mongoose.Types.ObjectId(userId);

  const doc = await col.findOne({ userId: userOid });
  if (!doc) throw new Error('사용자 정보 없음');

  const feedbackHistory = (doc.feedbackHistory ?? {}) as Record<string, { difficulty: string; topic: string; ratingBefore: number; materialRatingBefore: number; ratingChange: number; newRating: number }>;
  const record = feedbackHistory[materialId];
  if (!record) throw new Error('되돌릴 피드백이 없습니다.');

  const { topic, ratingBefore, materialRatingBefore, difficulty } = record;
  const isCorrect = difficulty === 'easy' || difficulty === 'normal';

  const topicSkills  = (doc.topicSkills ?? {}) as Record<string, { rating: number; attempts: number; correct: number; lastAttempted?: Date }>;
  const currentTopic = topicSkills[topic];

  const setFields: Record<string, unknown> = {
    overallRating: 1000,
    totalAttempts: Math.max(0, ((doc.totalAttempts as number) ?? 0) - 1),
    totalCorrect:  Math.max(0, ((doc.totalCorrect  as number) ?? 0) - (isCorrect ? 1 : 0)),
    updatedAt:     new Date(),
  };

  if (currentTopic) {
    const restoredTopic = {
      ...currentTopic,
      rating:   ratingBefore,
      attempts: Math.max(0, currentTopic.attempts - 1),
      correct:  Math.max(0, currentTopic.correct - (isCorrect ? 1 : 0)),
    };
    setFields[`topicSkills.${topic}`] = restoredTopic;
    const allTopics = { ...topicSkills, [topic]: restoredTopic };
    const ratings   = Object.values(allTopics).map((s) => s.rating);
    setFields.overallRating = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
  }

  await col.updateOne(
    { userId: userOid },
    {
      $unset: { [`feedbackHistory.${materialId}`]: '' },
      $set:   setFields,
    },
  );

  await Material.updateOne({ materialId }, { $set: { difficultyRating: materialRatingBefore } });
}

/**
 * 맞춤 자료 추천 — 학생 ELO 기반
 */
export async function getRecommendations(
  userId: string | null,
  limit = 6
): Promise<IMaterial[]> {
  await connectMongo();

  const topicRatings: Record<string, number> = {};

  if (userId) {
    const userSkill = await UserSkill.findOne({ userId });
    if (userSkill) {
      for (const [topic, skill] of userSkill.topicSkills) {
        topicRatings[topic] = skill.rating;
      }
    }
  }

  const ratingValues = Object.values(topicRatings);
  const overallRating =
    ratingValues.length > 0
      ? Math.round(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length)
      : 1000;

  let materials = await Material.find({
    isActive: true,
    difficultyRating: {
      $gte: overallRating - 350,
      $lte: overallRating + 350,
    },
  }).limit(100).lean();

  if (materials.length === 0) {
    return Material.find({ isActive: true })
      .sort({ difficultyRating: 1 })
      .limit(limit)
      .lean();
  }

  // 취약 주제 자료 우선 추천
  const scored = materials.map((m) => {
    const key = m.topic || m.subject;
    const topicRating = topicRatings[key] ?? overallRating;
    const ratingDiff = Math.abs(m.difficultyRating - (topicRating + 50));
    const topicWeakness = topicRatings[key] != null ? 1000 - topicRatings[key] : 100;
    const score = topicWeakness * 2 - ratingDiff;
    return { material: m, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topicCount: Record<string, number> = {};
  const result: IMaterial[] = [];

  for (const { material } of scored) {
    if (result.length >= limit) break;
    const key = material.topic || material.subject;
    const cnt = topicCount[key] || 0;
    if (cnt < 2) {
      result.push(material as IMaterial);
      topicCount[key] = cnt + 1;
    }
  }

  return result;
}

/**
 * 협업 필터링 — Item-based
 * "이 자료를 산 사람들이 함께 구매한 자료"
 */
export async function getCollaborativeRecs(
  materialId: string,
  excludeUserId?: string | null,
  limit = 4,
): Promise<IMaterial[]> {
  await connectMongo();

  // 1. 이 자료를 구매한 유저 IDs
  const orders = await Order.find({ materialId, status: 'paid' }).lean();
  if (orders.length === 0) return [];

  const buyerIds = orders.map((o) => o.userId);

  // 2. 같은 구매자들이 함께 구매한 다른 자료 집계
  const coPurchased = await Order.aggregate([
    {
      $match: {
        userId:     { $in: buyerIds },
        materialId: { $ne: materialId },
        status:     'paid',
        ...(excludeUserId ? { userId: { $in: buyerIds, $ne: excludeUserId } } : {}),
      },
    },
    { $group: { _id: '$materialId', count: { $sum: 1 } } },
    { $sort:  { count: -1 } },
    { $limit: limit * 3 },
  ]);

  const coIds = coPurchased.map((c: { _id: string }) => c._id);
  if (coIds.length === 0) return [];

  const materials = await Material.find({ materialId: { $in: coIds }, isActive: true })
    .limit(limit)
    .lean();

  return materials as IMaterial[];
}

/**
 * 협업 필터링 — User-based (ELO 유사도)
 * "비슷한 수준 학생들이 구매한 자료"
 */
export async function getSimilarUserRecs(
  userId: string,
  limit = 6,
): Promise<IMaterial[]> {
  await connectMongo();

  const col     = await userSkillsCol();
  const userOid = new mongoose.Types.ObjectId(userId);

  // 1. 현재 유저 overallRating
  const doc          = await col.findOne({ userId: userOid });
  const overallRating = (doc?.overallRating as number) ?? 1000;

  // 2. 유사 수준 유저 조회 (±200)
  const similarDocs = await col.find({
    userId:        { $ne: userOid },
    overallRating: { $gte: overallRating - 200, $lte: overallRating + 200 },
  }).limit(50).toArray();

  if (similarDocs.length === 0) return [];

  const similarUserIds = similarDocs.map((u) => u.userId.toString());

  // 3. 현재 유저가 이미 구매한 자료 제외
  const myOrders      = await Order.find({ userId, status: 'paid' }).lean();
  const myMaterialIds = myOrders.map((o) => o.materialId);

  // 4. 유사 유저들의 인기 구매 자료 집계
  const popular = await Order.aggregate([
    {
      $match: {
        userId:     { $in: similarUserIds },
        materialId: { $nin: myMaterialIds },
        status:     'paid',
      },
    },
    { $group: { _id: '$materialId', count: { $sum: 1 } } },
    { $sort:  { count: -1 } },
    { $limit: limit * 2 },
  ]);

  const materialIds = popular.map((p: { _id: string }) => p._id);
  if (materialIds.length === 0) return [];

  const materials = await Material.find({ materialId: { $in: materialIds }, isActive: true })
    .limit(limit)
    .lean();

  return materials as IMaterial[];
}
