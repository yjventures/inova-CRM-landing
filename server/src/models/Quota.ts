import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuota extends Document {
  year: number;
  monthlyTarget: number;
  currency: string;
  updatedBy?: Types.ObjectId;
}

const QuotaSchema = new Schema<IQuota>(
  {
    year: { type: Number, required: true, index: true, unique: true },
    monthlyTarget: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Quota =
  mongoose.models.Quota || mongoose.model<IQuota>('Quota', QuotaSchema);

export default Quota;


