import mongoose, { Document, Schema, Types } from 'mongoose';

export type DealStage =
  | 'Lead'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export interface IDeal extends Document {
  title: string;
  amount: number;
  stage: DealStage;
  probability: number;
  ownerId: Types.ObjectId;
  contactId?: Types.ObjectId;
  accountId?: Types.ObjectId;
  closeDate?: Date;
  source?: string;
  industry?: string;
  tags: string[];
  notes?: string;
  isActive: boolean;
  deletedAt: Date | null;
}

const DealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    stage: {
      type: String,
      enum: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
      required: true,
      index: true,
      trim: true,
    },
    probability: { type: Number, min: 0, max: 100, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    closeDate: { type: Date },
    source: { type: String, trim: true },
    industry: { type: String, trim: true },
    tags: { type: [String], default: [] },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuals
DealSchema.virtual('weightedAmount').get(function (this: IDeal) {
  const amount = this.amount || 0;
  const probability = this.probability || 0;
  return amount * (probability / 100);
});

// Indexes
DealSchema.index({ stage: 1, ownerId: 1, createdAt: 1, expectedCloseDate: 1, closedAt: 1, deletedAt: 1 });
// Text index for search across key fields
DealSchema.index({ title: 'text', description: 'text', notes: 'text', tags: 'text' });

export const Deal =
  mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);

export default Deal;

// Ensure indexes in development
if (process.env.NODE_ENV !== 'production') {
  // fire-and-forget
  Deal.syncIndexes().catch(() => {});
}



