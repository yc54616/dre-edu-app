import mongoose, { Document, Model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export const SUBJECTS = ['수학(공통)', '수학I', '수학II', '미적분', '확률과통계', '기하'] as const;
export const CATEGORIES = ['개념', '유형', '수능기출', '심화', '킬러'] as const;
export const TOPIC_MAP: Record<string, string[]> = {
  '수학(공통)': ['다항식', '방정식과 부등식', '도형의 방정식', '집합과 명제', '함수'],
  '수학I':      ['지수와 로그', '지수함수와 로그함수', '삼각함수', '수열'],
  '수학II':     ['함수의 극한과 연속', '다항함수의 미분법', '다항함수의 적분법'],
  '미적분':     ['수열의 극한', '미분법', '적분법'],
  '확률과통계': ['경우의 수', '확률', '통계'],
  '기하':       ['이차곡선', '평면벡터', '공간도형과 공간벡터'],
};

export const DIFFICULTY_LABEL: Record<number, string> = {
  1: '기초', 2: '기본', 3: '표준', 4: '심화', 5: '최고난도',
};
export const DIFFICULTY_COLOR: Record<number, string> = {
  1: 'emerald', 2: 'blue', 3: 'violet', 4: 'orange', 5: 'red',
};

export type Subject = typeof SUBJECTS[number];
export type Category = typeof CATEGORIES[number];

export interface IProblem extends Document {
  problemId: string;
  title: string;
  content: string;
  options: string[];
  answer: number;
  explanation: string;
  category: Category;
  topic: string;
  subject: Subject;
  grade: number;
  difficulty: number;
  difficultyRating: number;
  isActive: boolean;
  usageCount: number;
  correctCount: number;
  createdAt: Date;
}

const DIFFICULTY_RATING: Record<number, number> = {
  1: 600, 2: 800, 3: 1000, 4: 1300, 5: 1600,
};

const problemSchema = new Schema<IProblem>({
  problemId: {
    type: String,
    default: () => nanoid(10),
    unique: true,
    index: true,
  },
  title:    { type: String, required: true, trim: true },
  content:  { type: String, required: true },
  options:  { type: [String], default: [] },
  answer:   { type: Number, required: true },
  explanation: { type: String, default: '' },
  category: { type: String, enum: CATEGORIES, required: true },
  topic:    { type: String, required: true, trim: true },
  subject:  { type: String, enum: SUBJECTS, required: true },
  grade:    { type: Number, default: 2 },
  difficulty:       { type: Number, min: 1, max: 5, required: true },
  difficultyRating: { type: Number, default: 1000 },
  isActive:    { type: Boolean, default: true },
  usageCount:  { type: Number, default: 0 },
  correctCount:{ type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
});

problemSchema.index({ subject: 1, topic: 1, category: 1, difficulty: 1 });
problemSchema.index({ difficultyRating: 1 });

// DIFFICULTY_RATING exposed as a plain export (not statics to avoid type conflict)

const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>('Problem', problemSchema);

export default Problem;
