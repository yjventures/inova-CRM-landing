import mongoose from 'mongoose';
import { connectMongo } from './config/db';
import { ENV } from './config/env';
import { User } from './models/User';

async function main() {
  try {
    await connectMongo(ENV.MONGO_URI as string);

    const email = 'rep@inova.ai';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('[seed:rep] user already exists:', email);
      await mongoose.disconnect();
      return;
    }

    const u = await User.create({
      fullName: 'Sales Rep',
      email,
      password: 'InovaRep2025!',
      role: 'rep',
      isActive: true,
    });

    console.log('[seed:rep] created user:', u.toSafeJSON());
    await mongoose.disconnect();
  } catch (err) {
    console.error('[seed:rep] failed', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();



