import mongoose, { Document, Model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import {
  MATERIAL_CURRICULUMS,
  MATERIAL_SOURCE_CATEGORIES,
  MATERIAL_SUBJECTS, MATERIAL_TYPES, SCHOOL_LEVELS,
  TOPIC_MAP, DIFFICULTY_LABEL, DIFFICULTY_COLOR,
  TEACHER_PRODUCT_TYPES, TEACHER_CLASS_PREP_TYPES, LEGACY_TEACHER_CLASS_PREP_TYPES,
  MaterialCurriculum, MaterialSourceCategory, MaterialSubject, MaterialType, SchoolLevel,
  TeacherProductType, TeacherClassPrepType,
} from '@/lib/constants/material';

export {
  MATERIAL_CURRICULUMS,
  MATERIAL_SOURCE_CATEGORIES,
  MATERIAL_SUBJECTS, MATERIAL_TYPES, SCHOOL_LEVELS,
  TOPIC_MAP, DIFFICULTY_LABEL, DIFFICULTY_COLOR,
  TEACHER_PRODUCT_TYPES, TEACHER_CLASS_PREP_TYPES,
};
export type {
  MaterialCurriculum,
  MaterialSourceCategory, MaterialSubject, MaterialType, SchoolLevel,
  TeacherProductType, TeacherClassPrepType,
};

export interface IMaterial extends Document {
  materialId: string;
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
  fileType: string;  // 'pdf' | 'hwp' | 'both'
  targetAudience: string;  // 'student' | 'teacher' | 'all'
  teacherProductType: TeacherProductType | '';
  teacherClassPrepType: TeacherClassPrepType | '';
  isFree: boolean;
  priceProblem: number;
  priceEtc: number;
  problemFile: string | null;
  hasAnswerInProblem: boolean;
  etcFile: string | null;
  previewImages: string[];
  pageCount: number;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>({
  materialId: { type: String, default: () => nanoid(10), unique: true, index: true },
  uploaderId: { type: String, required: true },
  curriculum: { type: String, enum: MATERIAL_CURRICULUMS, default: 'revised_2022', index: true },
  sourceCategory: { type: String, enum: MATERIAL_SOURCE_CATEGORIES, default: 'school_exam', index: true },
  type: { type: String, required: true },
  publisher: { type: String, default: '' },
  bookTitle: { type: String, default: '' },
  ebookDescription: { type: String, default: '' },
  ebookToc: { type: [String], default: [] },
  subject: { type: String, default: '' },
  topic: { type: String, default: '' },
  schoolLevel: { type: String, default: '고등학교' },
  gradeNumber: { type: Number, default: 2 },
  year: { type: Number },
  semester: { type: Number },
  period: { type: String },
  schoolName: { type: String },
  regionSido: { type: String },
  regionGugun: { type: String },
  difficulty: { type: Number, min: 1, max: 5, default: 3 },
  difficultyRating: { type: Number, default: 1000 },
  fileType: { type: String, enum: ['pdf', 'hwp', 'both'], default: 'pdf' },
  targetAudience: { type: String, enum: ['student', 'teacher', 'all'], default: 'student' },
  teacherProductType: {
    type: String,
    enum: ['', ...TEACHER_PRODUCT_TYPES],
    default: '',
    index: true,
  },
  teacherClassPrepType: {
    type: String,
    enum: ['', ...TEACHER_CLASS_PREP_TYPES, ...LEGACY_TEACHER_CLASS_PREP_TYPES],
    default: '',
    index: true,
  },
  isFree: { type: Boolean, default: false },
  priceProblem: { type: Number, default: 0 },
  priceEtc: { type: Number, default: 0 },
  problemFile: { type: String, default: null },
  hasAnswerInProblem: { type: Boolean, default: false },
  etcFile: { type: String, default: null },
  previewImages: { type: [String], default: [] },
  pageCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

materialSchema.index({ subject: 1, topic: 1, type: 1, difficulty: 1 });
materialSchema.index({ difficultyRating: 1 });
materialSchema.index({ subject: 1, schoolLevel: 1, gradeNumber: 1 });
materialSchema.index({ fileType: 1, targetAudience: 1 });
materialSchema.index({ curriculum: 1, subject: 1, type: 1 });
materialSchema.index({ sourceCategory: 1, subject: 1, type: 1 });
materialSchema.index({ updatedAt: -1, createdAt: -1 });

if (mongoose.models.Material && process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Material;
}

const Material: Model<IMaterial> = (
  mongoose.models.Material as Model<IMaterial> | undefined
) || mongoose.model<IMaterial>('Material', materialSchema);

export default Material;
