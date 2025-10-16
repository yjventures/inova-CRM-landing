import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await AuthService.login(email, password);
      return res.json({ ok: true, data: result, message: 'Logged in' });
    } catch (err) {
      return next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const result = await AuthService.refreshTokens(refreshToken);
      return res.json({ ok: true, data: result, message: 'Token refreshed' });
    } catch (err) {
      return next(err);
    }
  },

  async me(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub as string | undefined;
      const user = userId ? await User.findById(userId) : null;
      if (!user) return res.status(404).json({ ok: false, message: 'User not found' });
      return res.json({ ok: true, data: user.toSafeJSON(), message: 'Me' });
    } catch (err) {
      return next(err);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout();
      return res.json({ ok: true, data: null, message: 'Logged out' });
    } catch (err) {
      return next(err);
    }
  },
};


