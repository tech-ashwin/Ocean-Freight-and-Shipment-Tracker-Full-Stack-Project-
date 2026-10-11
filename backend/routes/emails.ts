import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const emailsRouter = Router();

// GET /api/emails - List all email records
emailsRouter.get('/', (req: Request, res: Response) => {
  try {
    const emails = db.getEmails();
    res.json({
      success: true,
      data: emails,
      count: emails.length,
      unprocessedCount: emails.filter(e => !e.processed).length
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/emails/:id/process - Mark email processed
emailsRouter.post('/:id/process', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { action } = req.body;
    const updated = db.markEmailProcessed(String(id), action);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Email ${id} not found` });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/emails/batch-process - Ingest processed results and update DB
emailsRouter.post('/batch-process', (req: Request, res: Response) => {
  try {
    const { updates, newRates, newShipmentStatuses } = req.body;

    if (Array.isArray(newRates)) {
      for (const r of newRates) {
        db.upsertRate({
          id: r.id || `R_eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          carrier: r.carrier,
          origin_port: r.origin_port,
          destination_port: r.destination_port,
          container_type: r.container_type || '40ft',
          rate_usd: Number(r.rate_usd),
          transit_days: Number(r.transit_days) || 20,
          source: 'email',
          updated_at: new Date().toISOString().split('T')[0]
        });
      }
    }

    if (Array.isArray(newShipmentStatuses)) {
      for (const s of newShipmentStatuses) {
        db.updateShipmentStatus(s.shipment_id, s.status, s.delivered_date);
      }
    }

    if (Array.isArray(updates)) {
      for (const u of updates) {
        db.addActivityUpdate({
          id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: u.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 16),
          timeAgo: 'Just now',
          type: u.type || 'rate',
          title: u.title,
          subtitle: u.subtitle,
          badgeColor: u.badgeColor || 'blue'
        });
      }
    }

    res.json({ success: true, message: 'Batch email ingestion completed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/emails/reset - Reset simulated inbox
emailsRouter.post('/reset', (req: Request, res: Response) => {
  try {
    const reset = db.resetEmails();
    res.json({ success: true, message: 'Simulated email records reset', count: reset.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
