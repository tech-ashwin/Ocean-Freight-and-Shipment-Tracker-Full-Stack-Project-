import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { connectMongo, isMongoActive } from '../mongodb.js';

export const databaseRouter = Router();

// GET /api/database/status
databaseRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await db.getStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/database/connect - Connect or re-connect with a MongoDB connection string
databaseRouter.post('/connect', async (req: Request, res: Response) => {
  try {
    const { uri } = req.body || {};
    const targetUri = (uri && typeof uri === 'string' && uri.trim()) ? uri.trim() : undefined;

    const connected = await connectMongo(targetUri);
    if (!connected) {
      const status = await db.getStatus();
      return res.status(400).json({
        success: false,
        message: status.connectionError || 'Could not connect to MongoDB with provided URI',
        status
      });
    }

    // Auto-migrate or seed if newly connected
    const migrationResult = await db.migrateJsonToMongo();
    const status = await db.getStatus();

    res.json({
      success: true,
      message: 'Successfully connected to MongoDB and synced records',
      migration: migrationResult,
      status
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/database/migrate - Migrate from file store to MongoDB
databaseRouter.post('/migrate', async (_req: Request, res: Response) => {
  try {
    const result = await db.migrateJsonToMongo();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
