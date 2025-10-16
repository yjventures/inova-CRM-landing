import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/roles';

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    }
    next();
  };
}

export function requireAnyRole() {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;
    if (!role) return res.status(403).json({ ok: false, message: 'Forbidden' });
    next();
  };
}





