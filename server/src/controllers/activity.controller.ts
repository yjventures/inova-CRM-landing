import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Activity, { IActivity } from '../models/Activity';
import { ADMIN_ROLES } from '../constants/roles';

function isAdminOrManager(role?: string) {
  return role ? ADMIN_ROLES.includes(role as any) : false;
}

export const activityController = {
  async listActivities(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;

      const q = (req.query.q as string | undefined)?.trim();
      const type = req.query.type as string | undefined;
      const status = req.query.status as ('open' | 'completed' | 'canceled') | undefined;
      const priority = req.query.priority as ('low' | 'medium' | 'high') | undefined;
      const ownerIdParam = req.query.ownerId as string | undefined;
      const contactId = req.query.contactId as string | undefined;
      const dealId = req.query.dealId as string | undefined;
      const dueFrom = req.query.dueFrom as string | undefined;
      const dueTo = req.query.dueTo as string | undefined;
      const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
      const limitRaw = parseInt(String(req.query.limit ?? '10'), 10) || 10;
      const limit = Math.min(Math.max(limitRaw, 1), 100);
      const sort = (req.query.sort as string | undefined) ?? '-updatedAt';

      const filter: any = { deletedAt: null };

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (contactId) filter.contactId = contactId;
      if (dealId) filter.dealId = dealId;

      if (dueFrom || dueTo) {
        filter.dueAt = {};
        if (dueFrom) filter.dueAt.$gte = new Date(dueFrom);
        if (dueTo) filter.dueAt.$lte = new Date(dueTo);
      }

      if (isAdminOrManager(role)) {
        if (ownerIdParam) filter.ownerId = ownerIdParam;
      } else {
        filter.ownerId = requesterId;
      }

      if (q) {
        const rx = new RegExp(q, 'i');
        filter.$or = [{ title: rx }, { notes: rx }];
      }

      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Activity.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Activity.countDocuments(filter),
      ]);

      return res.json({ ok: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
      return next(err);
    }
  },

  async getActivity(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ ok: false, message: 'Activity not found' });

      const activity = await Activity.findOne({ _id: id, deletedAt: null }).lean<IActivity>();
      if (!activity) return res.status(404).json({ ok: false, message: 'Activity not found' });

      if (!isAdminOrManager(role) && String(activity.ownerId) !== String(requesterId)) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      return res.json({ ok: true, data: activity });
    } catch (err) {
      return next(err);
    }
  },

  async createActivity(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;

      const { type, title, notes, priority, dueAt, contactId, dealId, attachments, ownerId } = req.body ?? {};
      if (!type || typeof type !== 'string') return res.status(400).json({ ok: false, message: 'type is required' });
      if (!title || typeof title !== 'string') return res.status(400).json({ ok: false, message: 'title is required' });

      const payload: any = {
        type,
        title,
        notes,
        priority,
        dueAt,
        contactId,
        dealId,
        attachments,
        status: 'open',
        ownerId: isAdminOrManager(role) ? (ownerId || requesterId) : requesterId,
      };

      const created = await Activity.create(payload);
      return res.json({ ok: true, data: created });
    } catch (err) {
      return next(err);
    }
  },

  async updateActivity(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ ok: false, message: 'Activity not found' });

      const activity = await Activity.findOne({ _id: id, deletedAt: null });
      if (!activity) return res.status(404).json({ ok: false, message: 'Activity not found' });

      if (!isAdminOrManager(role) && String(activity.ownerId) !== String(requesterId)) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      const body = req.body ?? {};
      const updatable = ['title','notes','type','priority','dueAt','contactId','dealId','attachments'] as const;
      for (const key of updatable) if (key in body) (activity as any)[key] = body[key];

      await activity.save();
      return res.json({ ok: true, data: activity });
    } catch (err) {
      return next(err);
    }
  },

  async completeActivity(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ ok: false, message: 'Activity not found' });

      const activity = await Activity.findOne({ _id: id, deletedAt: null });
      if (!activity) return res.status(404).json({ ok: false, message: 'Activity not found' });

      if (!isAdminOrManager(role) && String(activity.ownerId) !== String(requesterId)) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      activity.status = 'completed';
      activity.completedAt = new Date();
      await activity.save();
      return res.json({ ok: true, data: activity });
    } catch (err) {
      return next(err);
    }
  },

  async deleteActivity(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ ok: false, message: 'Activity not found' });

      const activity = await Activity.findOne({ _id: id, deletedAt: null });
      if (!activity) return res.status(404).json({ ok: false, message: 'Activity not found' });

      if (!isAdminOrManager(role) && String(activity.ownerId) !== String(requesterId)) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      activity.deletedAt = new Date();
      await activity.save();
      return res.json({ ok: true, data: null, message: 'Deleted' });
    } catch (err) {
      return next(err);
    }
  },

  async upcomingTasks(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;
      const limitRaw = parseInt(String(req.query.limit ?? '5'), 10) || 5;
      const limit = Math.min(Math.max(limitRaw, 1), 50);

      const filter: any = { status: 'open', deletedAt: null };
      if (!isAdminOrManager(role)) filter.ownerId = requesterId;
      const now = new Date();
      filter.dueAt = { $gte: now };

      const items = await Activity.find(filter).sort({ dueAt: 1 }).limit(limit).lean();
      return res.json({ ok: true, data: items });
    } catch (err) {
      return next(err);
    }
  },
};


