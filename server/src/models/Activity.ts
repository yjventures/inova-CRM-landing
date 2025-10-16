import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivity extends Document {
  orgId?: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  title: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'completed' | 'canceled';
  dueAt?: Date;
  completedAt?: Date;
  ownerId: Types.ObjectId;
  contactId?: Types.ObjectId;
  dealId?: Types.ObjectId;
  attachments: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  deletedAt?: Date | null;
}

const AttachmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    size: { type: Number },
    type: { type: String, trim: true },
  },
  { _id: false }
);

const ActivitySchema = new Schema<IActivity>(
  {
    orgId: { type: String },
    type: { type: String, enum: ['call', 'email', 'meeting', 'task'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    status: { type: String, enum: ['open', 'completed', 'canceled'], default: 'open', index: true },
    dueAt: { type: Date },
    completedAt: { type: Date },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
    attachments: { type: [AttachmentSchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes
ActivitySchema.index({ ownerId: 1, status: 1, dueAt: 1, type: 1, priority: 1, deletedAt: 1 });
ActivitySchema.index({ dealId: 1 });
ActivitySchema.index({ contactId: 1 });

export const Activity =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;


