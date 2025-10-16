import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import FileModel, { IFile } from '../models/File';
import { Contact, IContact } from '../models/Contact';
import Deal, { IDeal } from '../models/Deal';
import { Activity, IActivity } from '../models/Activity';
import { publicUrlFor } from '../lib/paths';

function isAdminOrManager(role?: string) {
  return role === 'admin' || role === 'manager';
}

async function checkOwnsEntity(user: any, entityType: string, entityId: string): Promise<boolean> {
  if (!user) return false;
  const requesterId = user._id || user.sub;
  if (!requesterId) return false;
  const id = entityId;
  if (entityType === 'contact') {
    const doc = await Contact.findById(id).select('ownerId').lean<IContact>();
    return doc ? String(doc.ownerId) === String(requesterId) : false;
  }
  if (entityType === 'deal') {
    const doc = await Deal.findById(id).select('ownerId').lean<IDeal>();
    return doc ? String(doc.ownerId) === String(requesterId) : false;
  }
  if (entityType === 'activity') {
    const doc = await Activity.findById(id).select('ownerId').lean<IActivity>();
    return doc ? String(doc.ownerId) === String(requesterId) : false;
  }
  return false;
}

function sanitize(file: any) {
  if (!file) return file;
  const { diskPath, __v, ...rest } = file;
  return rest;
}

export const fileController = {
  async upload(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const uploaderId = req.user?._id || req.user?.sub;
      const { entityType, entityId } = req.body as { entityType: string; entityId: string };
      if (!entityType || !entityId) return res.status(400).json({ ok: false, message: 'entityType and entityId are required' });

      if (!isAdminOrManager(role)) {
        const ok = await checkOwnsEntity(req.user, entityType, entityId);
        if (!ok) return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      const mf = req as any;
      const files: Express.Multer.File[] = [];
      if (mf.files?.files && Array.isArray(mf.files.files)) files.push(...mf.files.files);
      if (mf.files?.file && Array.isArray(mf.files.file)) files.push(...mf.files.file);
      if (mf.file) files.push(mf.file as Express.Multer.File);
      if (!files.length) return res.status(400).json({ ok: false, message: 'No files uploaded' });

      const usingCloud = Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));
      const docs = await Promise.all(
        files.map(async (f: any) => {
          const payload: any = {
            entityType,
            entityId,
            uploaderId,
            originalName: f.originalname,
            fileName: f.filename,
            mimeType: f.mimetype,
            size: f.size,
            url: usingCloud ? (f.path || f.secure_url || f.url) : publicUrlFor(f.filename),
            diskPath: usingCloud ? '' : f.path,
            cloud: usingCloud,
          };
          // multer-storage-cloudinary sets: path=secure_url, filename=public_id
          if (usingCloud) {
            payload.fileName = f.filename || f.public_id || payload.fileName;
          }
          const doc = await FileModel.create(payload);
          return sanitize(doc.toObject());
        })
      );

      return res.json({ ok: true, data: docs });
    } catch (err) {
      return next(err);
    }
  },

  async list(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const { entityType, entityId } = req.query as any;
      const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
      const limitRaw = parseInt(String(req.query.limit ?? '20'), 10) || 20;
      const limit = Math.min(Math.max(limitRaw, 1), 100);
      const skip = (page - 1) * limit;

      if (!entityType || !entityId) return res.status(400).json({ ok: false, message: 'entityType and entityId are required' });

      if (!isAdminOrManager(role)) {
        const ok = await checkOwnsEntity(req.user, entityType, entityId);
        if (!ok) return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      const filter: any = { entityType, entityId, deletedAt: null };
      const [items, total] = await Promise.all([
        FileModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        FileModel.countDocuments(filter),
      ]);

      const data = items.map((f: any) => sanitize(f));
      return res.json({ ok: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
      return next(err);
    }
  },

  async listByEntity(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const entityType = req.params.entityType as string;
      const entityId = req.params.entityId as string;
      if (!entityType || !entityId) return res.status(400).json({ ok: false, message: 'entityType and entityId are required' });

      if (!isAdminOrManager(role)) {
        const ok = await checkOwnsEntity(req.user, entityType, entityId);
        if (!ok) return res.status(403).json({ ok: false, message: 'Forbidden' });
      }

      const items = await FileModel.find({ entityType, entityId, deletedAt: null }).sort({ createdAt: -1 }).lean();
      const data = items.map((f: any) => sanitize(f));
      return res.json({ ok: true, data });
    } catch (err) {
      return next(err);
    }
  },

  async remove(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as string | undefined;
      const requesterId = req.user?._id || req.user?.sub;
      const id = req.params.id;
      const found = await FileModel.findById(id).lean<IFile>();
      if (!found) return res.status(404).json({ ok: false, message: 'File not found' });

      let allowed = isAdminOrManager(role);
      if (!allowed) {
        // Owner of entity can delete
        allowed = await checkOwnsEntity(req.user, found.entityType, String(found.entityId));
      }
      if (!allowed) return res.status(403).json({ ok: false, message: 'Forbidden' });

      // Always attempt to remove cloud asset if present
      if (found.cloud) {
        try { await cloudinary.uploader.destroy(found.fileName).catch(()=>{}); } catch {}
        await FileModel.deleteOne({ _id: id });
      } else {
        const hard = String(process.env.FILES_HARD_DELETE || '').toLowerCase() === 'true';
        if (hard) {
          try { if (found.diskPath && fs.existsSync(found.diskPath)) fs.unlinkSync(found.diskPath); } catch {}
          await FileModel.deleteOne({ _id: id });
        } else {
          await FileModel.updateOne({ _id: id }, { $set: { deletedAt: new Date(), isActive: false } });
        }
      }

      return res.json({ ok: true, message: 'Deleted' });
    } catch (err) {
      return next(err);
    }
  },
};


