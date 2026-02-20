import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProblemAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  attemptedAt: Date;
}

const problemAttemptSchema = new Schema<IProblemAttempt>({
  userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId:      { type: String, required: true },
  selectedAnswer: { type: Number },
  isCorrect:      { type: Boolean },
  timeSpent:      { type: Number, default: 0 },
  attemptedAt:    { type: Date, default: Date.now },
});

problemAttemptSchema.index({ userId: 1, problemId: 1 });
problemAttemptSchema.index({ userId: 1, attemptedAt: -1 });
problemAttemptSchema.index({ problemId: 1 });

const ProblemAttempt: Model<IProblemAttempt> =
  mongoose.models.ProblemAttempt ||
  mongoose.model<IProblemAttempt>('ProblemAttempt', problemAttemptSchema);

export default ProblemAttempt;
