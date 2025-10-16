import mongoose from 'mongoose';
import { connectMongo } from './config/db';
import { ENV } from './config/env';
import { User } from './models/User';
import { Contact } from './models/Contact';

async function main() {
  try {
    await connectMongo(ENV.MONGO_URI as string);

    // Resolve owner (admin preferred)
    let owner = await User.findOne({ email: 'admin@inova.ai' });
    if (!owner) owner = await User.findOne();
    if (!owner) {
      console.log('[seed:contacts] no users found, aborting');
      await mongoose.disconnect();
      return;
    }

    const ownerId = owner._id;

    const contacts = [
      { fullName: 'Sarah Johnson', email: 'sarah@acme.com', phone: '+1 555 0101', company: 'Acme Corp', title: 'CTO', status: 'active', ownerId, tags: ['enterprise','priority'] },
      { fullName: 'Michael Chen', email: 'michael@globalsystems.io', phone: '+1 555 0102', company: 'Global Systems', title: 'Head of IT', status: 'active', ownerId, tags: ['saas'] },
      { fullName: 'Lisa Thompson', email: 'lisa@futuretech.io', phone: '+1 555 0103', company: 'FutureTech', title: 'COO', status: 'inactive', ownerId },
      { fullName: 'David Ramirez', email: 'david@novalabs.io', phone: '+1 555 0104', company: 'Nova Labs', title: 'VP Engineering', status: 'active', ownerId, tags: ['priority'] },
      { fullName: 'Priya Singh', email: 'priya@greenfield.ai', phone: '+1 555 0105', company: 'GreenField AI', title: 'Director of Ops', status: 'active', ownerId },
      { fullName: 'Emma Wilson', email: 'emma@northwind.com', phone: '+1 555 0106', company: 'Northwind', title: 'CFO', status: 'inactive', ownerId },
      { fullName: 'Tom Becker', email: 'tom@apexsolutions.io', phone: '+1 555 0107', company: 'Apex Solutions', title: 'IT Manager', status: 'active', ownerId },
      { fullName: 'Nina Petrova', email: 'nina@skylinehq.com', phone: '+1 555 0108', company: 'Skyline HQ', title: 'Head of Procurement', status: 'active', ownerId },
    ];

    let created = 0;
    let skipped = 0;

    for (const c of contacts) {
      if (c.email) {
        const res = await Contact.updateOne(
          { email: c.email },
          { $setOnInsert: c },
          { upsert: true }
        );
        if ((res as any).upsertedCount && (res as any).upsertedCount > 0) created++;
        else skipped++;
      } else {
        await Contact.create(c as any);
        created++;
      }
    }

    console.log(`[seed:contacts] created: ${created}, skipped: ${skipped}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('[seed:contacts] failed', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();




