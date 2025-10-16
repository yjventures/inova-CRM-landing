import { connectMongo } from './config/db';
import { ENV } from './config/env';
import { PipelineStage } from './models/PipelineStage';

(async () => {
  await connectMongo(ENV.MONGO_URI as string);

  const defaults = [
    { name: 'Lead', probability: 10, type: 'open', color: '#9CA3AF', order: 1 },
    { name: 'Qualified', probability: 25, type: 'open', color: '#60A5FA', order: 2 },
    { name: 'Proposal Sent', probability: 50, type: 'open', color: '#FBBF24', order: 3 },
    { name: 'Negotiation', probability: 75, type: 'open', color: '#F59E0B', order: 4 },
    { name: 'Won', probability: 100, type: 'won', color: '#10B981', order: 5 },
    { name: 'Lost', probability: 0, type: 'lost', color: '#EF4444', order: 6 },
  ];

  for (const stage of defaults) {
    const exists = await PipelineStage.findOne({ name: stage.name });
    if (!exists) await PipelineStage.create(stage);
  }

  console.log('✅ Default pipeline stages seeded.');
  process.exit(0);
})();


