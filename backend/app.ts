import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { ratesRouter } from './routes/rates.js';
import { shipmentsRouter } from './routes/shipments.js';
import { emailsRouter } from './routes/emails.js';
import { statsRouter } from './routes/stats.js';
import { databaseRouter } from './routes/database.js';
import { db } from './db.js';

export function createBackendApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Route Mounts
  app.use('/api/auth', authRouter);
  app.use('/api/rates', ratesRouter);
  app.use('/api/shipments', shipmentsRouter);
  app.use('/api/emails', emailsRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/database', databaseRouter);

  // Health check endpoint
  app.get('/api/health', async (_req, res) => {
    const dbStatus = await db.getStatus();
    res.json({
      status: 'healthy',
      service: 'bluspark-freight-ops-backend',
      timestamp: new Date().toISOString(),
      database: dbStatus.activeEngine,
      isMongoConnected: dbStatus.isMongoConnected
    });
  });

  return app;
}
