import mongoose, { Document, Model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import type { HallOfFameKind } from '@/lib/hall-of-fame';

export interface IHallOfFameEntry extends Document {
  entryId: string;
  kind: HallOfFameKind;
  isPublished: boolean;
  sortOrder: number;
  createdBy: string;
  univ: string;
  major: string;
  student: string;
  school: string;
  badge: string;
  desc: string;
  name: string;
  content: string;
  tag: string;
  stars: number;
  createdAt: Date;
  updatedAt: Date;
}

const hallOfFameEntrySchema = new Schema<IHallOfFameEntry>({
  entryId: { type: String, default: () => nanoid(12), unique: true, index: true },
  kind: { type: String, enum: ['admission', 'review'], required: true, index: true },
  isPublished: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0, index: true },
  createdBy: { type: String, default: '' },
  univ: { type: String, default: '' },
  major: { type: String, default: '' },
  student: { type: String, default: '' },
  school: { type: String, default: '' },
  badge: { type: String, default: '' },
  desc: { type: String, default: '' },
  name: { type: String, default: '' },
  content: { type: String, default: '' },
  tag: { type: String, default: '' },
  stars: { type: Number, min: 1, max: 5, default: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

hallOfFameEntrySchema.index({ kind: 1, isPublished: 1, sortOrder: 1, updatedAt: -1 });

if (mongoose.models.HallOfFameEntry && process.env.NODE_ENV !== 'production') {
  delete mongoose.models.HallOfFameEntry;
}

const HallOfFameEntry: Model<IHallOfFameEntry> = (
  mongoose.models.HallOfFameEntry as Model<IHallOfFameEntry> | undefined
) || mongoose.model<IHallOfFameEntry>('HallOfFameEntry', hallOfFameEntrySchema);

export default HallOfFameEntry;
