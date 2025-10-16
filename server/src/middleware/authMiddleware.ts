import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export async function requireAuth(req: Request & { user?: any }, res: Response, next: NextFunction) {
  try {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const token = header.slice('Bearer '.length);
    const decoded = jwt.verify(token, env.ACCESS_SECRET);
    req.user = decoded;
    return next();
  } catch (_err) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }
}




