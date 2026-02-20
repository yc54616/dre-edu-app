import mongoose, { Document, Model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import {
  MATERIAL_SUBJECTS, MATERIAL_TYPES, SCHOOL_LEVELS,
  TOPIC_MAP, DIFFICULTY_LABEL, DIFFICULTY_COLOR,
  MaterialSubject, MaterialType, SchoolLevel,
} from '@/lib/constants/material';

export {
  MATERIAL_SUBJECTS, MATERIAL_TYPES, SCHOOL_LEVELS,
  TOPIC_MAP, DIFFICULTY_LABEL, DIFFICULTY_COLOR,
};
export type { MaterialSubject, MaterialType, SchoolLevel };

export interface IMaterial extends Document {
  materialId:      string;
  uploaderId:      string;
  type:            string;
  subject:         string;
  topic:           string;
  schoolLevel:     string;
  gradeNumber:     number;
  year:            number;
  semester:        number;
  period:          string;
  schoolName:      string;
  regionSido:      string;
  regionGugun:     string;
  difficulty:      number;
  difficultyRating:number;
  fileType:        string;  // 'pdf' | 'hwp' | 'both'
  targetAudience:  string;  // 'student' | 'teacher' | 'all'
  isFree:          boolean;
  priceProblem:    number;
  priceEtc:        number;
  problemFile:     string | null;
  etcFile:         string | null;
  previewImages:   string[];
  viewCount:       number;
  downloadCount:   number;
  likeCount:       number;
  isActive:        boolean;
  createdAt:       Date;
}

const materialSchema = new Schema<IMaterial>({
  materialId:      { type: String, default: () => nanoid(10), unique: true, index: true },
  uploaderId:      { type: String, required: true },
  type:            { type: String, required: true },
  subject:         { type: String, required: true },
  topic:           { type: String, default: '' },
  schoolLevel:     { type: String, default: '고등학교' },
  gradeNumber:     { type: Number, default: 2 },
  year:            { type: Number },
  semester:        { type: Number },
  period:          { type: String },
  schoolName:      { type: String },
  regionSido:      { type: String },
  regionGugun:     { type: String },
  difficulty:      { type: Number, min: 1, max: 5, default: 3 },
  difficultyRating:{ type: Number, default: 1000 },
  fileType:        { type: String, enum: ['pdf', 'hwp', 'both'], default: 'pdf' },
  targetAudience:  { type: String, enum: ['student', 'teacher', 'all'], default: 'student' },
  isFree:          { type: Boolean, default: false },
  priceProblem:    { type: Number, default: 0 },
  priceEtc:        { type: Number, default: 0 },
  problemFile:     { type: String, default: null },
  etcFile:         { type: String, default: null },
  previewImages:   { type: [String], default: [] },
  viewCount:       { type: Number, default: 0 },
  downloadCount:   { type: Number, default: 0 },
  likeCount:       { type: Number, default: 0 },
  isActive:        { type: Boolean, default: true },
  createdAt:       { type: Date, default: Date.now },
});

materialSchema.index({ subject: 1, topic: 1, type: 1, difficulty: 1 });
materialSchema.index({ difficultyRating: 1 });
materialSchema.index({ subject: 1, schoolLevel: 1, gradeNumber: 1 });
materialSchema.index({ fileType: 1, targetAudience: 1 });

const Material: Model<IMaterial> =
  mongoose.models.Material || mongoose.model<IMaterial>('Material', materialSchema);

export default Material;
