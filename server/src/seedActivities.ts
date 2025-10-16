import mongoose from 'mongoose';
import { connectMongo } from './config/db';
import { ENV } from './config/env';
import { User } from './models/User';
import { Contact } from './models/Contact';
import { Deal } from './models/Deal';
import { Activity } from './models/Activity';

async function main() {
  try {
    await connectMongo(ENV.MONGO_URI as string);

    // Resolve owner (admin preferred)
    let owner = await User.findOne({ role: 'admin' });
    if (!owner) owner = await User.findOne();
    if (!owner) {
      console.log('[seed:activities] no users found, aborting');
      await mongoose.disconnect();
      return;
    }

    const ownerId = owner._id;

    // Optionally pick one contact and deal if exist
    const contact = await Contact.findOne();
    const deal = await Deal.findOne();

    const now = Date.now();
    const docs = [
      {
        type: 'task',
        title: 'Follow up with Acme',
        priority: 'high',
        dueAt: new Date(now + 6 * 60 * 60 * 1000),
        ownerId,
        dealId: deal?._id,
        contactId: contact?._id,
      },
      {
        type: 'call',
        title: 'Call FutureTech CTO',
        priority: 'medium',
        dueAt: new Date(now + 24 * 60 * 60 * 1000),
        ownerId,
      },
      {
        type: 'email',
        title: 'Send pricing to Global Systems',
        priority: 'high',
        dueAt: new Date(now + 36 * 60 * 60 * 1000),
        ownerId,
      },
    ];

    const inserted = await Activity.insertMany(docs);
    console.log(`[seed:activities] inserted: ${inserted.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('[seed:activities] failed', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();


