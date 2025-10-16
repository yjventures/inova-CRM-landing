// Quick diagnostic script to verify admin user existence and hash status
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function run() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('[checkAdmin] MONGO_URI not set');
      process.exit(1);
    }
    await mongoose.connect(uri);
    const userModule = require('../dist/models/User');
    const User = userModule.default || userModule.User;
    const u = await User.findOne({ email: 'admin@inova.ai' }).lean();
    if (!u) {
      console.log('[checkAdmin] admin user not found');
    } else {
      const hashed = typeof u.password === 'string' && (u.password.startsWith('$2a$') || u.password.startsWith('$2b$'));
      console.log('[checkAdmin] found:', { _id: String(u._id), email: u.email, hashed });
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[checkAdmin] failed', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

run();


