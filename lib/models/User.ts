import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  username: string;
  phone?: string | null;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  teacherApprovalStatus: 'approved' | 'pending';
  emailVerified: boolean;
  verifyTokenHash?: string | null;
  verifyTokenExpires?: Date | null;
  resetTokenHash?: string | null;
  resetTokenExpires?: Date | null;
  birthDate?: Date | null;
  isUnder14AtSignup?: boolean;
  legalGuardianConsent?: {
    agreedAt: Date;
    guardianName: string;
    guardianContact: string;
  } | null;
  consents?: {
    terms?: {
      agreedAt: Date;
      version: string;
    } | null;
    privacy?: {
      agreedAt: Date;
      version: string;
    } | null;
    marketing?: {
      agreedAt: Date;
      version: string;
    } | null;
  };
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const consentSchema = new Schema(
  {
    agreedAt: { type: Date, required: true },
    version: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const legalGuardianConsentSchema = new Schema(
  {
    agreedAt: { type: Date, required: true },
    guardianName: { type: String, required: true, trim: true },
    guardianContact: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, trim: true },
  phone: { type: String, default: null, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  teacherApprovalStatus: { type: String, enum: ['approved', 'pending'], default: 'pending' },
  emailVerified: { type: Boolean, default: true },
  verifyTokenHash: { type: String, default: null },
  verifyTokenExpires: { type: Date, default: null },
  resetTokenHash: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
  birthDate: { type: Date, default: null },
  isUnder14AtSignup: { type: Boolean, default: false },
  legalGuardianConsent: { type: legalGuardianConsentSchema, default: null },
  consents: {
    terms: { type: consentSchema, default: null },
    privacy: { type: consentSchema, default: null },
    marketing: { type: consentSchema, default: null },
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

const User: IUserModel =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
