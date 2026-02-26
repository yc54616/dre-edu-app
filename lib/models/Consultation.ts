import mongoose, { Document, Model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export const CONSULTATION_TYPES = ['admission', 'consulting', 'coaching', 'teacher'] as const;
export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export const CONSULTATION_STATUSES = ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

export const CONSULTATION_TYPE_LABEL: Record<ConsultationType, string> = {
  admission: '입학 안내',
  consulting: '입시컨설팅',
  coaching: '온라인수학코칭',
  teacher: '수업설계컨설팅',
};

export const CONSULTATION_STATUS_LABEL: Record<ConsultationStatus, string> = {
  pending: '접수',
  contacted: '연락 완료',
  scheduled: '상담 예정',
  completed: '완료',
  cancelled: '취소',
};

export interface IConsultation extends Document {
  consultationId: string;
  type: ConsultationType;
  name: string;
  phone: string;
  marketingConsent: boolean;
  marketingConsentAt: Date | null;
  marketingConsentVersion: string | null;
  schoolGrade: string;
  currentScore: string;
  targetUniv: string;
  direction: string;
  gradeLevel: string;
  subject: string;
  message: string;
  status: ConsultationStatus;
  scheduledDate: string;
  scheduledTime: string;
  scheduleChangeRequest: string;
  scheduleConfirmedAt: Date | null;
  adminMemo: string;
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new Schema<IConsultation>({
  consultationId: { type: String, default: () => nanoid(10), unique: true, index: true },
  type:           { type: String, enum: CONSULTATION_TYPES, required: true, index: true },
  name:           { type: String, required: true },
  phone:          { type: String, required: true },
  marketingConsent: { type: Boolean, default: false },
  marketingConsentAt: { type: Date, default: null },
  marketingConsentVersion: { type: String, default: null },
  schoolGrade:    { type: String, default: '' },
  currentScore:   { type: String, default: '' },
  targetUniv:     { type: String, default: '' },
  direction:      { type: String, default: '' },
  gradeLevel:     { type: String, default: '' },
  subject:        { type: String, default: '' },
  message:        { type: String, default: '' },
  status:         { type: String, enum: CONSULTATION_STATUSES, default: 'pending', index: true },
  scheduledDate:  { type: String, default: '' },
  scheduledTime:  { type: String, default: '' },
  scheduleChangeRequest: { type: String, default: '' },
  scheduleConfirmedAt:   { type: Date, default: null },
  adminMemo:      { type: String, default: '' },
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now },
});

consultationSchema.index({ createdAt: -1 });

if (mongoose.models.Consultation && process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Consultation;
}

const Consultation: Model<IConsultation> = (
  mongoose.models.Consultation as Model<IConsultation> | undefined
) || mongoose.model<IConsultation>('Consultation', consultationSchema);

export default Consultation;
