import { Router, Request, Response } from 'express';
import { db, ShipmentRecord } from '../db.js';

export const shipmentsRouter = Router();

// GET /api/shipments - List shipments with auto delay calculation
shipmentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, carrier } = req.query;
    let shipments = await db.getShipments();

    // Auto-evaluate delay status against current date (2026-10-10)
    const today = new Date('2026-10-10T00:00:00');
    shipments = shipments.map(s => {
      if (s.status !== 'Delivered') {
        const arr = new Date(`${s.expected_arrival}T00:00:00`);
        if (arr < today) {
          return { ...s, status: 'Delayed' as const };
        }
      }
      return s;
    });

    if (status && typeof status === 'string') {
      shipments = shipments.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }
    if (carrier && typeof carrier === 'string') {
      shipments = shipments.filter(s => s.carrier.toLowerCase().includes(carrier.toLowerCase()));
    }

    res.json({
      success: true,
      data: shipments,
      count: shipments.length
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shipments - Create a new shipment
shipmentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      shipment_id,
      carrier,
      origin_port,
      destination_port,
      container_type,
      departure_date,
      expected_arrival,
      status,
      contracted_rate_usd,
      invoice_amount_usd
    } = req.body;

    if (!shipment_id || !carrier || !origin_port || !destination_port || !departure_date || !expected_arrival) {
      return res.status(400).json({ success: false, message: 'Missing required shipment attributes' });
    }

    const newShipment: ShipmentRecord = {
      id: req.body.id || `S_${Date.now()}`,
      shipment_id: String(shipment_id).trim(),
      carrier: String(carrier).trim(),
      origin_port: String(origin_port).trim(),
      destination_port: String(destination_port).trim(),
      container_type: container_type === '20ft' ? '20ft' : '40ft',
      departure_date,
      expected_arrival,
      delivered_date: req.body.delivered_date || null,
      status: status || 'In Transit',
      contracted_rate_usd: Number(contracted_rate_usd) || 0,
      invoice_amount_usd: invoice_amount_usd !== undefined ? Number(invoice_amount_usd) : Number(contracted_rate_usd) || 0
    };

    const added = await db.addShipment(newShipment);
    await db.addActivityUpdate({
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      timeAgo: 'Just now',
      type: 'shipment',
      title: `Shipment Created: ${added.shipment_id}`,
      subtitle: `${added.carrier} • ${added.origin_port} → ${added.destination_port}`,
      badgeColor: 'blue'
    });

    res.status(201).json({ success: true, data: added });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/shipments/:id/status - Update shipment status
shipmentsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, delivered_date } = req.body;

    if (!['In Transit', 'Delivered', 'Delayed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid shipment status value' });
    }

    const updated = await db.updateShipmentStatus(String(id), status, delivered_date);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Shipment with ID ${id} not found` });
    }

    await db.addActivityUpdate({
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      timeAgo: 'Just now',
      type: status === 'Delayed' ? 'delayed' : 'shipment',
      title: `Status Updated: ${updated.shipment_id} marked ${status}`,
      subtitle: `${updated.carrier} discharge / status milestone saved`,
      badgeColor: status === 'Delivered' ? 'blue' : status === 'Delayed' ? 'amber' : 'emerald'
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shipments/reset - Reset shipments list
shipmentsRouter.post('/reset', async (req: Request, res: Response) => {
  try {
    const reset = await db.resetShipments(req.body.shipments);
    res.json({ success: true, message: 'Shipments table reset successfully', count: reset.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
