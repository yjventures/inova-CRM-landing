import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { generateToken } from '../utils/generateToken';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const valid = await user.comparePassword(password);
    if (!valid) throw new Error('Invalid credentials');
    if (!user.isActive) throw new Error('User is inactive');

    const payload = { sub: user._id.toString(), role: user.role, email: user.email };
    const accessToken = generateToken(payload, env.ACCESS_SECRET, '15m');
    const refreshToken = generateToken(payload, env.REFRESH_SECRET, '7d');

    return {
      user: user.toSafeJSON(),
      tokens: { accessToken, refreshToken },
    };
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, env.REFRESH_SECRET);
  }

  static async refreshTokens(refreshToken: string) {
    const decoded = this.verifyRefreshToken(refreshToken) as any;
    const userId = decoded.sub as string;
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User is inactive');

    const payload = { sub: user._id.toString(), role: user.role, email: user.email };
    const accessToken = generateToken(payload, env.ACCESS_SECRET, '15m');
    const newRefreshToken = generateToken(payload, env.REFRESH_SECRET, '7d');
    return {
      user: user.toSafeJSON(),
      tokens: { accessToken, refreshToken: newRefreshToken },
    };
  }

  static async logout() {
    return { ok: true };
  }
}




