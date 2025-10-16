import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFile extends Document {
  entityType: 'contact' | 'deal' | 'activity';
  entityId: Types.ObjectId;
  uploaderId: Types.ObjectId;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  diskPath: string;
  isActive: boolean;
  deletedAt: Date | null;
  cloud: boolean;
}

const FileSchema = new Schema<IFile>(
  {
    entityType: { type: String, enum: ['contact', 'deal', 'activity'], required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    url: { type: String, required: true, trim: true },
    diskPath: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    cloud: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FileSchema.index({ entityType: 1, entityId: 1, createdAt: 1, deletedAt: 1 });

export const FileModel =
  mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

export default FileModel;


