import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Deal from '../models/Deal';
import { ADMIN_ROLES } from '../constants/roles';

function isAdminOrManager(role?: string) {
  return role ? ADMIN_ROLES.includes(role as any) : false;
}

export const dealController = {
  async listDeals(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;

      const q = (req.query.q as string | undefined)?.trim();
      const stage = req.query.stage as string | undefined;
      const ownerIdParam = req.query.ownerId as string | undefined;
      const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
      const limitRaw = parseInt(String(req.query.limit ?? '10'), 10) || 10;
      const limit = Math.min(Math.max(limitRaw, 1), 100);
      const sortParam = (req.query.sort as string | undefined) ?? '-createdAt';

      const filter: any = { deletedAt: null };

      if (stage) filter.stage = stage;

      if (isAdminOrManager(role)) {
        if (ownerIdParam) filter.ownerId = ownerIdParam;
      } else {
        filter.ownerId = requesterId;
      }

      let projection: any = undefined;
      let sort: any = sortParam;
      if (q) {
        // Prefer $text search; if text index missing, fallback to regex
        try {
          filter.$text = { $search: q };
          projection = { score: { $meta: 'textScore' } };
          sort = { score: { $meta: 'textScore' } };
          if (sortParam) {
            // apply secondary sort when needed
            if (typeof sort === 'object') {
              // naive merge: keep text score first
              if (sortParam.startsWith('-')) sort[sortParam.slice(1)] = -1; else sort[sortParam] = 1;
            }
          }
        } catch {
          // fallback regex on key fields (title/notes/tags/source/industry)
          delete filter.$text;
          const rx = new RegExp(q, 'i');
          filter.$or = [
            { title: rx },
            { notes: rx },
            { source: rx },
            { industry: rx },
            { tags: { $elemMatch: { $regex: rx } } },
          ];
        }
      }

      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Deal.find(filter, projection)
          .sort(sort as any)
          .skip(skip)
          .limit(limit)
          .populate('contactId', 'fullName company')
          .populate('ownerId', 'fullName email role')
          .lean(),
        Deal.countDocuments(filter),
      ]);

      return res.json({ ok: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
      return next(err);
    }
  },

  async getDeal(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ ok: false, message: 'Deal not found' });
      }

      const deal = await Deal.findOne({ _id: id, deletedAt: null })
        .populate('ownerId', 'fullName email role')
        .populate('contactId', 'fullName email company')
        .populate('accountId', 'name domain')
        .lean();

      if (!deal) return res.status(404).json({ ok: false, message: 'Deal not found' });

      return res.json({ ok: true, data: deal });
    } catch (err) {
      return next(err);
    }
  },

  async createDeal(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;

      const {
        title,
        amount,
        stage,
        probability,
        source,
        industry,
        tags,
        notes,
        contactId,
        accountId,
        closeDate,
        ownerId,
      } = req.body ?? {};

      if (!title || typeof title !== 'string') return res.status(400).json({ ok: false, message: 'title is required' });
      if (amount === undefined || amount === null || isNaN(Number(amount))) return res.status(400).json({ ok: false, message: 'amount is required' });
      if (!stage || typeof stage !== 'string') return res.status(400).json({ ok: false, message: 'stage is required' });

      const payload: any = {
        title,
        amount: Number(amount),
        stage,
        probability: probability ?? 0,
        source,
        industry,
        tags,
        notes,
        contactId,
        accountId,
        closeDate,
        ownerId: isAdminOrManager(role) && ownerId ? ownerId : requesterId,
      };

      const created = await Deal.create(payload);
      return res.json({ ok: true, data: created });
    } catch (err) {
      return next(err);
    }
  },

  async updateDeal(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ ok: false, message: 'Deal not found' });

      const body = req.body ?? {};
      const updatable = ['title','amount','stage','probability','source','industry','tags','notes','contactId','accountId','closeDate','isActive'] as const;
      const updates: any = {};
      for (const key of updatable) if (key in body) updates[key] = body[key];

      if ('ownerId' in body) {
        if (isAdminOrManager(role)) updates.ownerId = body.ownerId;
        else return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      const updated = await Deal.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: updates }, { new: true });
      if (!updated) return res.status(404).json({ ok: false, message: 'Deal not found' });
      return res.json({ ok: true, data: updated });
    } catch (err) {
      return next(err);
    }
  },

  async deleteDeal(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ ok: false, message: 'Deal not found' });
      const deleted = await Deal.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date(), isActive: false } }, { new: true });
      if (!deleted) return res.status(404).json({ ok: false, message: 'Deal not found' });
      return res.json({ ok: true, data: null, message: 'Deleted' });
    } catch (err) {
      return next(err);
    }
  },

  async updateDealStage(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ ok: false, message: 'Deal not found' });

      const { stage, probability } = req.body ?? {} as { stage?: string; probability?: number };
      if (!stage || typeof stage !== 'string') return res.status(400).json({ ok: false, message: 'stage is required' });

      const defaultMap: Record<string, number> = {
        'Lead': 10,
        'Qualified': 40,
        'Proposal': 60,
        'Negotiation': 80,
        'Closed Won': 100,
        'Closed Lost': 0,
      };

      const updates: any = { stage };
      if (probability === undefined || probability === null) {
        if (stage in defaultMap) updates.probability = defaultMap[stage];
      } else {
        updates.probability = probability;
      }

      const updated = await Deal.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: updates }, { new: true });
      if (!updated) return res.status(404).json({ ok: false, message: 'Deal not found' });
      return res.json({ ok: true, data: updated });
    } catch (err) {
      return next(err);
    }
  },
};
