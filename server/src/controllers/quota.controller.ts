import { Request, Response, NextFunction } from 'express';
import Quota from '../models/Quota';

export const quotaController = {
  async getCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const year = Number(req.query.year ?? now.getFullYear());
      const doc = await Quota.findOne({ year }).lean();
      if (!doc) {
        return res.json({ ok: true, data: { year, monthlyTarget: 0, currency: 'USD' } });
      }
      return res.json({ ok: true, data: doc });
    } catch (err) {
      return next(err);
    }
  },

  async upsert(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const { year, monthlyTarget, currency } = req.body ?? {};
      if (typeof year !== 'number' || typeof monthlyTarget !== 'number') {
        return res.status(400).json({ ok: false, message: 'year and monthlyTarget are required' });
      }
      const updated = await Quota.findOneAndUpdate(
        { year },
        { $set: { monthlyTarget, currency: currency ?? 'USD', updatedBy: req.user?._id || req.user?.sub } },
        { new: true, upsert: true }
      );
      return res.json({ ok: true, data: updated });
    } catch (err) {
      return next(err);
    }
  },
};


