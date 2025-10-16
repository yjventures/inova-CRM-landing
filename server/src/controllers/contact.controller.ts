import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Contact, IContact } from '../models/Contact';
import { ADMIN_ROLES } from '../constants/roles';

export const contactController = {
  async listContacts(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?.sub as string | undefined;

      const q = (req.query.q as string | undefined)?.trim();
      const status = req.query.status as ('active' | 'inactive') | undefined;
      const ownerIdParam = req.query.ownerId as string | undefined;
      const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
      const limitRaw = parseInt(String(req.query.limit ?? '10'), 10) || 10;
      const limit = Math.min(Math.max(limitRaw, 1), 100);
      const sort = (req.query.sort as string | undefined) ?? '-updatedAt';

      const filter: any = {
        $or: [
          { deletedAt: { $exists: false } },
          { deletedAt: null },
        ],
      };

      if (status) filter.status = status;

      if (q) {
        filter.$text = { $search: q };
      }

      if (role === 'rep') {
        filter.ownerId = requesterId;
      } else if (ownerIdParam) {
        filter.ownerId = ownerIdParam;
      }

      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Contact.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Contact.countDocuments(filter),
      ]);

      return res.json({
        ok: true,
        data: items,
        meta: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      return next(err);
    }
  },

  async getContact(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?.sub as string | undefined;
      const id = req.params.id;

      const contact = await Contact.findOne({
        _id: id,
        $or: [
          { deletedAt: { $exists: false } },
          { deletedAt: null },
        ],
      }).lean<IContact>();

      if (!contact) return res.status(404).json({ ok: false, message: 'User not found' });

      if (role === 'rep' && String(contact.ownerId) !== requesterId) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      return res.json({ ok: true, data: contact });
    } catch (err) {
      return next(err);
    }
  },

  async createContact(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?.sub as string | undefined;

      const {
        fullName,
        email,
        phone,
        company,
        title,
        status,
        ownerId,
        tags,
        notes,
      } = req.body ?? {};

      if (!fullName || typeof fullName !== 'string') {
        return res.status(400).json({ ok: false, message: 'fullName is required' });
      }

      if (role === 'rep') {
        if (ownerId && ownerId !== requesterId) {
          return res.status(403).json({ ok: false, message: 'Forbidden' });
        }
      }

      const payload: any = {
        fullName,
        email,
        phone,
        company,
        title,
        status,
        ownerId: ownerId ?? (role === 'rep' ? requesterId : ownerId),
        tags,
        notes,
      };

      if (!payload.ownerId) {
        return res.status(400).json({ ok: false, message: 'ownerId is required' });
      }

      const created = await Contact.create(payload);
      return res.json({ ok: true, data: created });
    } catch (err) {
      return next(err);
    }
  },

  async updateContact(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?.sub as string | undefined;
      const id = req.params.id;

      const contact = await Contact.findOne({
        _id: id,
        $or: [
          { deletedAt: { $exists: false } },
          { deletedAt: null },
        ],
      });
      if (!contact) return res.status(404).json({ ok: false, message: 'User not found' });

      if (role === 'rep' && String(contact.ownerId) !== requesterId) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      const body = req.body ?? {};
      const updatable = ['fullName','email','phone','company','title','status','tags','notes','lastContactedAt'] as const;
      for (const key of updatable) {
        if (key in body) (contact as any)[key] = body[key];
      }

      if ('ownerId' in body) {
        if (role && ADMIN_ROLES.includes(role as any)) {
          (contact as any).ownerId = body.ownerId;
        } else {
          return res.status(403).json({ ok: false, message: 'Forbidden' });
        }
      }

      await contact.save();
      return res.json({ ok: true, data: contact });
    } catch (err) {
      return next(err);
    }
  },

  async deleteContact(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?.sub as string | undefined;
      const id = req.params.id;

      const contact = await Contact.findOne({
        _id: id,
        $or: [
          { deletedAt: { $exists: false } },
          { deletedAt: null },
        ],
      });
      if (!contact) return res.status(404).json({ ok: false, message: 'User not found' });

      if (role === 'rep' && String(contact.ownerId) !== requesterId) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      contact.deletedAt = new Date();
      await contact.save();
      return res.json({ ok: true, data: null, message: 'Deleted' });
    } catch (err) {
      return next(err);
    }
  },
};




