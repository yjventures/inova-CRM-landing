import mongoose from 'mongoose';
import { connectMongo } from './config/db';
import { ENV } from './config/env';
import { User } from './models/User';
import { Contact } from './models/Contact';
import { Deal } from './models/Deal';

async function main() {
  try {
    await connectMongo(ENV.MONGO_URI);

    // Resolve owner (admin preferred)
    let owner = await User.findOne({ email: 'admin@inova.ai' });
    if (!owner) owner = await User.findOne();
    if (!owner) {
      console.log('[seed:deals] no users found, aborting');
      await mongoose.disconnect();
      return;
    }

    const ownerId = owner._id;

    // Ensure we have some contacts to reference for primaryContactId
    let contacts = await Contact.find().limit(3);
    if (contacts.length === 0) {
      contacts = await Contact.create([
        { fullName: 'Acme Contact', email: 'contact+acme@seed.local', status: 'active', ownerId },
        { fullName: 'Global Contact', email: 'contact+global@seed.local', status: 'active', ownerId },
        { fullName: 'Future Contact', email: 'contact+future@seed.local', status: 'active', ownerId },
      ] as any);
    }

    const contactIds = contacts.map(c => c._id);

    const deals = [
      { title:'Acme Corp - Enterprise', amount:45000, stage:'Lead', probability:20, ownerId, source:'Inbound', industry:'SaaS', tags:['enterprise'] },
      { title:'TechStart - SaaS Platform', amount:28000, stage:'Lead', probability:25, ownerId },
      { title:'Global Systems', amount:75000, stage:'Qualified', probability:40, ownerId },
      { title:'MegaCorp - Expansion', amount:250000, stage:'Proposal', probability:70, ownerId },
      { title:'FutureTech - Cloud', amount:180000, stage:'Negotiation', probability:85, ownerId },
      { title:'StartupXYZ - Growth', amount:35000, stage:'Closed Won', probability:100, ownerId },
    ] as any[];

    // Optionally assign primaryContactId
    for (let i = 0; i < deals.length; i++) {
      if (contactIds[i % contactIds.length]) {
        deals[i].primaryContactId = contactIds[i % contactIds.length];
      }
    }

    let created = 0;
    let skipped = 0;

    for (const d of deals) {
      const res = await Deal.updateOne(
        { title: d.title, ownerId: d.ownerId },
        { $setOnInsert: d },
        { upsert: true }
      );
      if ((res as any).upsertedCount && (res as any).upsertedCount > 0) created++;
      else skipped++;
    }

    console.log(`[seed:deals] created: ${created}, skipped: ${skipped}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('[seed:deals] failed', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();








