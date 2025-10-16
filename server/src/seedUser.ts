import mongoose from 'mongoose';
import { connectMongo } from './config/db';
import { User } from './models/User';
import { ENV } from './config/env';

async function main() {
  try {
    await connectMongo(ENV.MONGO_URI as string);

    const email = 'admin@inova.ai';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('[seed] user already exists: admin@inova.ai');
      await mongoose.disconnect();
      return;
    }

    const u = await User.create({
      fullName: 'Admin User',
      email: 'admin@inova.ai',
      password: 'InovaAdmin2025!',
      role: 'admin',
      isActive: true,
    });
    console.log('[seed] created user:', u.toSafeJSON());
    await mongoose.disconnect();
  } catch (err) {
    console.error('[seed] failed', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();


