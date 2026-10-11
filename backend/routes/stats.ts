import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const statsRouter = Router();

// GET /api/stats - Dashboard analytics and metrics
statsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const rates = db.getRates();
    const shipments = db.getShipments();
    const emails = db.getEmails();
    const activityUpdates = db.getActivityUpdates();

    const today = new Date('2026-10-10T00:00:00');
    let delayedCount = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;

    for (const s of shipments) {
      if (s.status === 'Delivered') {
        deliveredCount++;
      } else {
        const arr = new Date(`${s.expected_arrival}T00:00:00`);
        if (arr < today || s.status === 'Delayed') {
          delayedCount++;
        } else {
          inTransitCount++;
        }
      }
    }

    const unparsedEmails = emails.filter(e => !e.processed).length;

    res.json({
      success: true,
      data: {
        totalRates: rates.length,
        totalShipments: shipments.length,
        activeInTransit: inTransitCount,
        delayedShipments: delayedCount,
        deliveredShipments: deliveredCount,
        unprocessedEmails: unparsedEmails,
        recentActivities: activityUpdates.slice(0, 10)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
