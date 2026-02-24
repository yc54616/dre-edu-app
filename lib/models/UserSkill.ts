import mongoose, { Document, Model, Schema } from 'mongoose';

export interface TopicSkill {
  rating: number;
  attempts: number;
  correct: number;
  lastAttempted?: Date;
}

export interface FeedbackRecord {
  difficulty:           'easy' | 'normal' | 'hard';
  topic:                string;
  ratingBefore:         number;  // 피드백 전 유저 토픽 레이팅
  materialRatingBefore: number;  // 피드백 전 자료 레이팅
  materialDelta?:       number;  // 피드백 시 자료 레이팅 변화량
  ratingChange:         number;  // 변화량
  newRating:            number;  // 피드백 후 유저 토픽 레이팅
  createdAt:            Date;
}

export interface IUserSkill extends Document {
  userId:          mongoose.Types.ObjectId;
  topicSkills:     Map<string, TopicSkill>;
  feedbackHistory: Map<string, FeedbackRecord>;  // key: materialId
  overallRating:   number;
  totalAttempts:   number;
  totalCorrect:    number;
  updatedAt:       Date;
  getTopicSkill(topic: string): TopicSkill;
  recalcOverall(): number;
}

const topicSkillSchema = new Schema<TopicSkill>(
  {
    rating:        { type: Number, default: 1000 },
    attempts:      { type: Number, default: 0 },
    correct:       { type: Number, default: 0 },
    lastAttempted: { type: Date },
  },
  { _id: false }
);

const feedbackRecordSchema = new Schema<FeedbackRecord>(
  {
    difficulty:           { type: String, enum: ['easy', 'normal', 'hard'], required: true },
    topic:                { type: String, required: true },
    ratingBefore:         { type: Number, required: true },
    materialRatingBefore: { type: Number, required: true },
    materialDelta:        { type: Number, default: 0 },
    ratingChange:         { type: Number, required: true },
    newRating:            { type: Number, required: true },
    createdAt:            { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSkillSchema = new Schema<IUserSkill>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  topicSkills:     { type: Map, of: topicSkillSchema,     default: {} },
  feedbackHistory: { type: Map, of: feedbackRecordSchema, default: {} },
  overallRating:   { type: Number, default: 1000 },
  totalAttempts:   { type: Number, default: 0 },
  totalCorrect:    { type: Number, default: 0 },
  updatedAt:       { type: Date, default: Date.now },
});

userSkillSchema.methods.getTopicSkill = function (topic: string): TopicSkill {
  return this.topicSkills.get(topic) || { rating: 1000, attempts: 0, correct: 0 };
};

userSkillSchema.methods.recalcOverall = function (): number {
  const skills = [...(this.topicSkills?.values() ?? [])] as TopicSkill[];
  if (skills.length === 0) return 1000;
  const sum = skills.reduce((acc, s) => acc + s.rating, 0);
  this.overallRating = Math.round(sum / skills.length);
  return this.overallRating;
};

const UserSkill: Model<IUserSkill> =
  mongoose.models.UserSkill || mongoose.model<IUserSkill>('UserSkill', userSkillSchema);

export default UserSkill;
