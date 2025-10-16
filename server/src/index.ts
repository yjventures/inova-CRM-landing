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
    app.listen(Number(ENV.PORT), () => {
      console.log(`[server] http://localhost:${ENV.PORT}`);
      console.log(`[server] Running on http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    console.error('[bootstrap] failed', err);
    process.exit(1);
  }
}
bootstrap();
