import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Deal from '../models/Deal';

export default async function ensureDealOwnerOrRole(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  try {
    const role: string | undefined = req.user?.role;
    if (role === 'admin' || role === 'manager') {
      return next();
    }

    const dealId = req.params.id;
    if (!dealId || !Types.ObjectId.isValid(dealId)) {
      return res.status(404).json({ ok: false, message: 'Deal not found' });
    }

    const deal = await Deal.findById(dealId).select('ownerId');
    if (!deal) {
      return res.status(404).json({ ok: false, message: 'Deal not found' });
    }

    const requesterId: string | undefined = req.user?._id || req.user?.sub;
    if (!requesterId || String(deal.ownerId) !== String(requesterId)) {
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    }

    return next();
  } catch (err) {
    return next(err);
  }
}



