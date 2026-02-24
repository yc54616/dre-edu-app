import mongoose, { Document, Model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

type CommunityUpgradeStatus = 'pending' | 'paid' | 'cancelled';
type CommunityUpgradeProcessStatus = 'pending' | 'completed';

export interface ICommunityUpgradeOrder extends Document {
  orderId: string;
  productKey: string;
  productName: string;
  amount: number;
  applicantName: string;
  phone: string;
  cafeNickname: string;
  status: CommunityUpgradeStatus;
  processStatus: CommunityUpgradeProcessStatus;
  paymentMethod: string;
  paymentKey: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const communityUpgradeOrderSchema = new Schema<ICommunityUpgradeOrder>({
  orderId: { type: String, default: () => nanoid(12), unique: true, index: true },
  productKey: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  applicantName: { type: String, required: true },
  phone: { type: String, required: true },
  cafeNickname: { type: String, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending', index: true },
  processStatus: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true },
  paymentMethod: { type: String, default: '' },
  paymentKey: { type: String, default: null },
  paidAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

communityUpgradeOrderSchema.index({ status: 1, createdAt: -1 });
communityUpgradeOrderSchema.index({ processStatus: 1, createdAt: -1 });

if (mongoose.models.CommunityUpgradeOrder && process.env.NODE_ENV !== 'production') {
  delete mongoose.models.CommunityUpgradeOrder;
}

const CommunityUpgradeOrder: Model<ICommunityUpgradeOrder> = (
  mongoose.models.CommunityUpgradeOrder as Model<ICommunityUpgradeOrder> | undefined
) || mongoose.model<ICommunityUpgradeOrder>('CommunityUpgradeOrder', communityUpgradeOrderSchema);

export default CommunityUpgradeOrder;
