import { Request, Response, NextFunction } from 'express';
import PipelineStage from '../models/PipelineStage';
import Deal from '../models/Deal';
import { createPipelineStageSchema, updatePipelineStageSchema, reorderPipelineStageSchema } from '../validation/pipelineStage.schema';

export const pipelineStageController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const stages = await PipelineStage.find({}).sort({ order: 1 }).lean();
      return res.json({ ok: true, data: stages });
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const parsed = createPipelineStageSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid input' });
      const { name, probability, type, color, order } = parsed.data;
      let finalOrder = order ?? 0;
      if (order === undefined) {
        const last: any = await PipelineStage.findOne({}).sort({ order: -1 }).lean();
        const lastOrder = (last && last.order) ?? -1;
        finalOrder = lastOrder + 1;
      }
      const created = await PipelineStage.create({ name, probability, type, color, order: finalOrder, createdBy: req.user?._id || req.user?.sub });
      return res.json({ ok: true, data: created });
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updatePipelineStageSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid input' });
      const id = req.params.id;
      const updated = await PipelineStage.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
      if (!updated) return res.status(404).json({ ok: false, message: 'Not found' });
      return res.json({ ok: true, data: updated });
    } catch (err) {
      return next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const inUse = await Deal.exists({ stageId: id, deletedAt: null });
      if (inUse) return res.status(409).json({ ok: false, message: 'Stage in use' });
      const result = await PipelineStage.deleteOne({ _id: id });
      if (!result.deletedCount) return res.status(404).json({ ok: false, message: 'Not found' });
      return res.json({ ok: true, message: 'Deleted' });
    } catch (err) {
      return next(err);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = reorderPipelineStageSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid input' });
      const ops = parsed.data.items.map((it) => ({ updateOne: { filter: { _id: it.id }, update: { $set: { order: it.order } } } }));
      if (ops.length === 0) return res.json({ ok: true, data: 0 });
      const result = await PipelineStage.bulkWrite(ops);
      return res.json({ ok: true, data: result.modifiedCount || 0 });
    } catch (err) {
      return next(err);
    }
  },
};


