import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ENV } from '../config/env';
import { generateToken } from '../utils/generateToken';

export class AuthService {
  static async login(email: string, password: string) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) throw new Error('Invalid credentials');

    const valid = await user.comparePassword(password);
    if (!valid) throw new Error('Invalid credentials');
    if (!user.isActive) throw new Error('User is inactive');

    const payload = { sub: user._id.toString(), role: user.role, email: user.email };
    const accessTtl = user.role === 'admin' ? '30m' : '15m';
    const accessToken = generateToken(payload, ENV.JWT_ACCESS_SECRET as string, accessTtl);
    const refreshToken = generateToken(payload, ENV.JWT_REFRESH_SECRET as string, '7d');

    return {
      user: user.toSafeJSON(),
      tokens: { accessToken, refreshToken },
    };
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET as string);
  }

  static async refreshTokens(refreshToken: string) {
    const decoded = this.verifyRefreshToken(refreshToken) as any;
    const userId = decoded.sub as string;
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User is inactive');

    const payload = { sub: user._id.toString(), role: user.role, email: user.email };
    const accessTtl = user.role === 'admin' ? '30m' : '15m';
    const accessToken = generateToken(payload, ENV.JWT_ACCESS_SECRET as string, accessTtl);
    const newRefreshToken = generateToken(payload, ENV.JWT_REFRESH_SECRET as string, '7d');
    return {
      user: user.toSafeJSON(),
      tokens: { accessToken, refreshToken: newRefreshToken },
    };
  }

  static async logout() {
    return { ok: true };
  }
}




