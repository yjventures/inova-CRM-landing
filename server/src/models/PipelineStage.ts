import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPipelineStage extends Document {
  name: string;
  probability: number;
  type: 'open' | 'won' | 'lost';
  color?: string;
  order: number;
  createdBy?: Types.ObjectId;
}

const PipelineStageSchema = new Schema<IPipelineStage>(
  {
    name: { type: String, required: true, trim: true },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    type: { type: String, enum: ['open', 'won', 'lost'], default: 'open', index: true },
    color: { type: String, trim: true },
    order: { type: Number, default: 0, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);


export const PipelineStage =
  mongoose.models.PipelineStage || mongoose.model<IPipelineStage>('PipelineStage', PipelineStageSchema);

export default PipelineStage;


