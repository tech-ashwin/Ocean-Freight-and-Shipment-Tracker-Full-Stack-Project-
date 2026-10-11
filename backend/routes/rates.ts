import { Router, Request, Response } from 'express';
import { db, CarrierRateRecord } from '../db.js';

export const ratesRouter = Router();

// GET /api/rates - Search and list rates
ratesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { origin, destination, container_type, carrier } = req.query;
    let rates = await db.getRates();

    if (origin && typeof origin === 'string') {
      rates = rates.filter(r => r.origin_port.toLowerCase() === origin.toLowerCase());
    }
    if (destination && typeof destination === 'string') {
      rates = rates.filter(r => r.destination_port.toLowerCase() === destination.toLowerCase());
    }
    if (container_type && typeof container_type === 'string') {
      rates = rates.filter(r => r.container_type === container_type);
    }
    if (carrier && typeof carrier === 'string') {
      rates = rates.filter(r => r.carrier.toLowerCase().includes(carrier.toLowerCase()));
    }

    // Sort by rate_usd ascending
    rates.sort((a, b) => a.rate_usd - b.rate_usd);

    res.json({
      success: true,
      data: rates,
      count: rates.length
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/rates - Ingest or update single rate
ratesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { carrier, origin_port, destination_port, container_type, rate_usd, transit_days, source } = req.body;
    if (!carrier || !origin_port || !destination_port || !container_type || rate_usd === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required rate fields' });
    }

    const newRate: CarrierRateRecord = {
      id: req.body.id || `R_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      carrier: String(carrier).trim(),
      origin_port: String(origin_port).trim(),
      destination_port: String(destination_port).trim(),
      container_type: container_type === '20ft' ? '20ft' : '40ft',
      rate_usd: Number(rate_usd),
      transit_days: Number(transit_days) || 18,
      source: source || 'manual',
      updated_at: new Date().toISOString().split('T')[0]
    };

    const saved = await db.upsertRate(newRate);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/rates/bulk - Bulk ingest rates (e.g., from CSV or parser batch)
ratesRouter.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { rates } = req.body;
    if (!Array.isArray(rates)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: rates array expected' });
    }

    const results: CarrierRateRecord[] = [];
    for (const r of rates) {
      const saved = await db.upsertRate({
        id: r.id || `R_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        carrier: r.carrier,
        origin_port: r.origin_port,
        destination_port: r.destination_port,
        container_type: r.container_type || '40ft',
        rate_usd: Number(r.rate_usd),
        transit_days: Number(r.transit_days) || 20,
        source: r.source || 'csv',
        updated_at: r.updated_at || new Date().toISOString().split('T')[0]
      });
      results.push(saved);
    }

    res.json({ success: true, message: `Successfully synced ${results.length} rates`, count: results.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/rates/reset - Restore initial rates
ratesRouter.post('/reset', async (req: Request, res: Response) => {
  try {
    const reset = await db.resetRates(req.body.rates);
    res.json({ success: true, message: 'Rates table reset successfully', count: reset.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
