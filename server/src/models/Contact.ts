import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IContact extends Document {
  orgId?: string;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  status: 'active' | 'inactive';
  ownerId: Types.ObjectId;
  tags: string[];
  notes?: string;
  lastContactedAt?: Date;
  deletedAt?: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    orgId: { type: String },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    phone: { type: String, trim: true, index: true },
    company: { type: String, trim: true },
    title: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: { type: [String], default: [] },
    notes: { type: String },
    lastContactedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
ContactSchema.index({ fullName: 'text', email: 'text', company: 'text' });
ContactSchema.index({ ownerId: 1, email: 1, status: 1, createdAt: 1, deletedAt: 1 });
ContactSchema.index({ email: 1 }, { unique: true, sparse: true });

export const Contact =
  mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);




