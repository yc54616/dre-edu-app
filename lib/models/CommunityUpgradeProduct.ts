import mongoose, { Document, Model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ICommunityUpgradeProduct extends Document {
  productId: string;
  key: string;
  name: string;
  shortLabel: string;
  amount: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const communityUpgradeProductSchema = new Schema<ICommunityUpgradeProduct>({
  productId: { type: String, default: () => nanoid(12), unique: true, index: true },
  key: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  shortLabel: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  sortOrder: { type: Number, default: 0, index: true },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

communityUpgradeProductSchema.index({ isActive: 1, sortOrder: 1, createdAt: 1 });

if (mongoose.models.CommunityUpgradeProduct && process.env.NODE_ENV !== 'production') {
  delete mongoose.models.CommunityUpgradeProduct;
}

const CommunityUpgradeProduct: Model<ICommunityUpgradeProduct> = (
  mongoose.models.CommunityUpgradeProduct as Model<ICommunityUpgradeProduct> | undefined
) || mongoose.model<ICommunityUpgradeProduct>('CommunityUpgradeProduct', communityUpgradeProductSchema);

export default CommunityUpgradeProduct;
