import mongoose, { Document, Model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IOrder extends Document {
  orderId:       string;
  userId:        string;  // user's MongoDB _id
  userEmail:     string;
  userName:      string;
  materialId:    string;
  materialTitle: string;
  fileTypes:     string[];  // ['problem', 'etc']
  amount:        number;
  status:        'pending' | 'paid' | 'cancelled';
  paymentMethod: string;  // 'card' | 'transfer' | 'virtual_account' | 'bank_transfer'
  paymentNote:   string;
  paymentKey:    string | null;  // 토스페이먼츠 paymentKey
  paidAt:        Date | null;
  hasDownloaded: boolean;
  downloadedAt:  Date | null;
  downloadedFileTypes: string[];
  createdAt:     Date;
}

const orderSchema = new Schema<IOrder>({
  orderId:       { type: String, default: () => nanoid(12), unique: true, index: true },
  userId:        { type: String, required: true, index: true },
  userEmail:     { type: String, required: true },
  userName:      { type: String, default: '' },
  materialId:    { type: String, required: true, index: true },
  materialTitle: { type: String, default: '' },
  fileTypes:     { type: [String], default: ['problem'] },
  amount:        { type: Number, required: true, default: 0 },
  status:        { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, default: 'bank_transfer' },
  paymentNote:   { type: String, default: '' },
  paymentKey:    { type: String, default: null },
  paidAt:        { type: Date, default: null },
  hasDownloaded: { type: Boolean, default: false },
  downloadedAt:  { type: Date, default: null },
  downloadedFileTypes: { type: [String], default: [] },
  createdAt:     { type: Date, default: Date.now },
});

orderSchema.index({ userId: 1, materialId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
