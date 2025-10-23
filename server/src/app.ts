import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import contactRoutes from './routes/contact.routes';
import dealRoutes from './routes/deal.routes';
import activityRoutes from './routes/activity.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { getUploadsDir } from './lib/paths';
import mongoose from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');
import fileRoutes from './routes/file.routes';
import pipelineStageRouter from './routes/pipelineStage.routes';
import { requireAuth } from './middleware/authMiddleware';
import quotaRouter from './routes/quota.routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  const isDev = ENV.NODE_ENV !== 'production';
  const allowed = (ENV.ALLOWED_ORIGINS || []).map((s: string) => s.trim()).filter(Boolean);
  app.use(cors(
    isDev
      ? { origin: true, credentials: true }
      : {
          origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (!allowed.length || allowed.includes(origin)) return cb(null, true);
            return cb(new Error('CORS blocked'));
          },
          credentials: true,
        }
  ));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(rateLimit({ windowMs: 15*60*1000, max: 1000 }));

  // Health
  app.get('/api/health', (_req, res) => res.json({ ok: true, env: ENV.NODE_ENV, status: 'ok' }));
  app.get('/api/healthz', (_req, res) => {
    const mongo = mongoose.connection.readyState === 1 ? 'up' : 'down';
    return res.json({ ok: true, version: (pkg as any).version, uptime: process.uptime(), mongo });
  });

  // Routes
  app.use('/api', authRoutes);
  app.use('/api', adminRoutes);
  app.use('/api', contactRoutes);
  app.use('/api', dealRoutes);
  app.use('/api', activityRoutes);
  app.use('/api', dashboardRoutes);
  app.use('/api', fileRoutes);
  app.use('/api/pipeline-stages', requireAuth, pipelineStageRouter);
  app.use('/api/quotas', requireAuth, quotaRouter);

  // Simple unit-safe validation middleware example for file list by entity
  app.use('/api/files/:entityType/:entityId', (req, res, next) => {
    const t = req.params.entityType;
    if (!['deal','contact','activity'].includes(t)) {
      return res.status(400).json({ ok: false, message: 'Invalid entityType' });
    }
    next();
  });

  // Static uploads
  const uploadsDir = getUploadsDir();
  app.use('/uploads', express.static(uploadsDir));
  app.use('/api', dealRoutes);

  // 404 handler must be last
  app.use((_req, res) => res.status(404).send('Not Found'));

  // Basic error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || 500;
    if (process.env.NODE_ENV === 'production') {
      return res.status(status).json({ ok: false, error: { message: err.message || 'Server error' } });
    }
    console.error(err);
    return res.status(status).json({ ok: false, error: { message: err.message || 'Server error', stack: err.stack } });
  });

  return app;
}
