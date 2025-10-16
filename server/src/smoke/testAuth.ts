import mongoose from 'mongoose';
import { connectMongo } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';

async function main() {
  try {
    await connectMongo(env.MONGO_URI);

    // Env checks
    console.log('[smoke] env checks:', {
      ACCESS_SECRET_SET: Boolean(env.ACCESS_SECRET),
      REFRESH_SECRET_SET: Boolean(env.REFRESH_SECRET),
      MONGO_URI_SET: Boolean(env.MONGO_URI),
      PORT: env.PORT,
      CORS_ORIGIN: env.CORS_ORIGIN,
    });

    // Verify seeded user and password hash prefix
    const u = await User.findOne({ email: 'admin@inova.ai' });
    if (!u) {
      console.log('[smoke] user not found in DB');
    } else {
      console.log('[smoke] user found in DB:', u.email, 'hashPrefixOk:', u.password.startsWith('$2'));
    }

    // Login
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@inova.ai', password: 'InovaAdmin2025!' })
    });
    const loginJson: any = await loginRes.json();
    console.log('[smoke] login response:', loginJson);

    const accessToken = loginJson?.data?.tokens?.accessToken as string | undefined;
    if (!accessToken) throw new Error('No access token from login');

    // Me
    const meRes = await fetch('http://localhost:4000/api/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meJson = await meRes.json();
    console.log('[smoke] me response:', meJson);

    await mongoose.disconnect();
  } catch (err) {
    console.error('[smoke] failed', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();


