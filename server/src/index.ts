import mongoose from 'mongoose';
import { createApp } from './app';
import { ENV } from './config/env';

async function bootstrap() {
  try {
    const isDev = ENV.NODE_ENV !== 'production';
    mongoose.set('autoIndex', isDev);
    console.log(`[env] Loaded ${ENV.NODE_ENV} | PORT=${ENV.PORT} | Mongo=${!!ENV.MONGO_URI}`);
    if (ENV.MONGO_URI) {
      await mongoose.connect(ENV.MONGO_URI as string);
      console.log('[mongo] connected');
    } else {
      console.warn('[mongo] MONGO_URI not set. Running without DB for now.');
    }

    const app = createApp();
    const port = process.env.PORT ? Number(process.env.PORT) : Number(ENV.PORT || 4000);
    console.log('[env]', process.env.NODE_ENV);
    app.listen(port, () => {
      console.log('[server] Listening on', port);
    });
  } catch (err) {
    console.error('[bootstrap] failed', err);
    process.exit(1);
  }
}
bootstrap();
