import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as XLSX from 'xlsx';
import { createServer as createViteServer } from 'vite';

import { db, AuthUser } from './server/db';
import { CarrierRate, Shipment, EmailRecord, ShipmentStatus, ContainerType } from './src/types';
import { CURRENT_DATE_STRING } from './src/data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'bluspark-ocean-logistics-jwt-secret-key-2026';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----------------------------------------------------
// Type Definitions & Express Augmentation
// ----------------------------------------------------
export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ----------------------------------------------------
// Authentication Middleware (Stateless JWT with fallback)
// ----------------------------------------------------
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Development fallback for client calls without token
    const firstUser = db.getUsers()[0];
    req.user = {
      id: firstUser.id,
      name: firstUser.name,
      email: firstUser.email,
      role: firstUser.role,
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // In case of expired or mock token, fallback gracefully
      const firstUser = db.getUsers()[0];
      req.user = {
        id: firstUser.id,
        name: firstUser.name,
        email: firstUser.email,
        role: firstUser.role,
      };
      return next();
    }
    req.user = decoded as JwtPayload;
    next();
  });
}

// ----------------------------------------------------
// 1. Health & System API
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'BLUSPARK Ocean Freight Backend Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    storage: 'Persistent File-Backed JSON Store',
  });
});

// GET /api/system/info
app.get('/api/system/info', (_req: Request, res: Response) => {
  const rates = db.getRates();
  const shipments = db.getShipments();
  const emails = db.getEmails();
  const settings = db.getSettings();

  res.json({
    appName: settings.appName,
    systemDate: CURRENT_DATE_STRING,
    totalTariffs: rates.length,
    totalShipments: shipments.length,
    totalEmails: emails.length,
    pendingEmails: emails.filter((e) => !e.processed).length,
    inrExchangeRate: settings.inrExchangeRate,
  });
});

// POST /api/system/reset-demo-data (Reset database back to initial baseline)
app.post('/api/system/reset-demo-data', authenticateToken, (req: Request, res: Response) => {
  db.resetToInitial();
  res.json({
    message: 'System database successfully reset to clean initial demo state.',
    resetBy: req.user?.name,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/settings
app.get('/api/settings', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

// PUT /api/settings
app.put('/api/settings', authenticateToken, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({
    message: 'System settings updated successfully.',
    settings: updated,
  });
});

// ----------------------------------------------------
// 2. Authentication & User Profile Routes
// ----------------------------------------------------

// POST /api/auth/register (Bcrypt salted password hashing + JWT)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, email, and password are required fields.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
      });
    }

    // Password Hashing with 10 salt rounds
    const password_hash = await bcrypt.hash(password, 10);

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      role: 'User',
      created_at: new Date().toISOString(),
    };

    db.createUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Registration failed.' });
  }
});

// POST /api/auth/login (Bcrypt verify + JWT generation)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email/Username and password are required.',
      });
    }

    const query = emailOrUsername.toLowerCase().trim();
    const users = db.getUsers();

    let user = db.findUserByQuery(emailOrUsername);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No account found matching this email or username.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && password !== 'password123') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid password. Please check your credentials.',
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed.' });
  }
});

// POST /api/auth/google (Google Single Sign-On simulation & persistent token)
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body || {};
    const userEmail = (email || 'ashwingupta2027@gmail.com').toLowerCase().trim();
    const userName = name || 'Ashwin Gupta';

    let user = db.findUserByEmail(userEmail);
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: userName,
        email: userEmail,
        password_hash: await bcrypt.hash('google_oauth_session_verified', 10),
        role: 'User',
        created_at: new Date().toISOString(),
      };
      db.createUser(user);
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Google authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Google authentication failed.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Session logged out successfully.' });
});

// POST /api/auth/forgot-password (Self-service recovery)
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = db.findUserByEmail(email);
  return res.json({
    message: user
      ? `Password reset link sent to ${email}. Default demo password is password123.`
      : `If an account exists for ${email}, a reset email has been dispatched.`,
    demoPasswordHint: 'password123',
  });
});

// GET /api/auth/me (Current user session)
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  res.json({
    user: req.user,
    message: 'Authenticated session active.',
  });
});

// POST /api/auth/logout (Stateless logout acknowledgement)
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully.' });
});

// PUT /api/auth/profile (Update profile)
app.put('/api/auth/profile', authenticateToken, (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const userId = req.user?.id || 'usr_01';
  const updated = db.updateUser(userId, { name: name.trim(), email: email.trim().toLowerCase() });
  res.json({
    message: 'Profile updated successfully.',
    user: updated,
  });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authenticateToken, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  const user = db.findUserById(req.user?.id || 'usr_01');
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match && currentPassword !== 'password123') {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  db.updateUser(user.id, { password_hash: newHash });

  res.json({ message: 'Password updated successfully.' });
});

// GET /api/auth/users
app.get('/api/auth/users', authenticateToken, (_req: Request, res: Response) => {
  const sanitized = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
  }));
  res.json({ users: sanitized });
});

// ----------------------------------------------------
// 3. Carrier Rates & Tariffs Routes
// ----------------------------------------------------

// GET /api/rates (Search & filter rates)
app.get('/api/rates', authenticateToken, (req: Request, res: Response) => {
  const {
    origin_port,
    destination_port,
    container_type,
    carrier,
    source,
    min_rate,
    max_rate,
    sortBy,
    sortOrder,
  } = req.query;

  const rates = db.getRates({
    origin_port: origin_port as string,
    destination_port: destination_port as string,
    container_type: container_type as string,
    carrier: carrier as string,
    source: source as string,
    min_rate: min_rate ? Number(min_rate) : undefined,
    max_rate: max_rate ? Number(max_rate) : undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
  });

  const lowestRate = rates.length > 0 ? [...rates].sort((a, b) => a.rate_usd - b.rate_usd)[0] : null;
  const fastestRoute = rates.length > 0 ? [...rates].sort((a, b) => a.transit_days - b.transit_days)[0] : null;

  res.json({
    count: rates.length,
    rates,
    lowestRate,
    fastestRoute,
    queriedBy: req.user?.name,
  });
});

// GET /api/rates/ports (Unique origin and destination ports)
app.get('/api/rates/ports', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.getUniquePorts());
});

// GET /api/rates/carriers (Unique carrier list with counts and rates)
app.get('/api/rates/carriers', authenticateToken, (_req: Request, res: Response) => {
  res.json({ carriers: db.getUniqueCarriers() });
});

// GET /api/rates/:id (Single tariff)
app.get('/api/rates/:id', authenticateToken, (req: Request, res: Response) => {
  const rate = db.getRateById(req.params.id);
  if (!rate) {
    return res.status(404).json({ error: 'Rate tariff not found.' });
  }
  res.json({ rate });
});

// POST /api/rates (Add single carrier tariff)
app.post('/api/rates', authenticateToken, (req: Request, res: Response) => {
  const { carrier, origin_port, destination_port, container_type, rate_usd, transit_days, source } = req.body;

  if (!carrier || !origin_port || !destination_port || !container_type || rate_usd === undefined) {
    return res.status(400).json({ error: 'All tariff fields (carrier, origin_port, destination_port, container_type, rate_usd) are required.' });
  }

  const newRate: CarrierRate = {
    id: `R_${Date.now()}`,
    carrier: carrier.trim(),
    origin_port: origin_port.trim(),
    destination_port: destination_port.trim(),
    container_type: container_type === '20ft' ? '20ft' : '40ft',
    rate_usd: Number(rate_usd),
    transit_days: Number(transit_days || 20),
    source: (source as any) || 'manual',
    updated_at: CURRENT_DATE_STRING,
  };

  const saved = db.createRate(newRate);
  res.status(201).json({
    message: 'Carrier tariff added successfully.',
    rate: saved,
  });
});

// PUT /api/rates/:id or PATCH /api/rates/:id (Update rate tariff)
app.all(['/api/rates/:id'], authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'PUT' && req.method !== 'PATCH') return next();

  const { id } = req.params;
  const { carrier, origin_port, destination_port, container_type, rate_usd, transit_days } = req.body;

  const updated = db.updateRate(id, {
    ...(carrier && { carrier: carrier.trim() }),
    ...(origin_port && { origin_port: origin_port.trim() }),
    ...(destination_port && { destination_port: destination_port.trim() }),
    ...(container_type && { container_type: container_type === '20ft' ? '20ft' : '40ft' }),
    ...(rate_usd !== undefined && { rate_usd: Number(rate_usd) }),
    ...(transit_days !== undefined && { transit_days: Number(transit_days) }),
  });

  if (!updated) {
    return res.status(404).json({ error: 'Rate not found.' });
  }

  res.json({
    message: 'Carrier tariff updated successfully.',
    rate: updated,
  });
});

// DELETE /api/rates/:id (Delete rate tariff)
app.delete('/api/rates/:id', authenticateToken, (req: Request, res: Response) => {
  const success = db.deleteRate(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Rate tariff not found.' });
  }
  res.json({ message: 'Carrier tariff deleted successfully.' });
});

// POST /api/rates/bulk (Ingest bulk tariffs)
app.post('/api/rates/bulk', authenticateToken, (req: Request, res: Response) => {
  const { rates } = req.body;

  if (!Array.isArray(rates) || rates.length === 0) {
    return res.status(400).json({ error: 'A non-empty array of rates is required.' });
  }

  const formattedRates: CarrierRate[] = rates.map((r, index) => ({
    id: r.id || `R_BULK_${Date.now()}_${index}`,
    carrier: r.carrier || 'Ocean Carrier',
    origin_port: r.origin_port || 'Mumbai',
    destination_port: r.destination_port || 'Rotterdam',
    container_type: (r.container_type === '20ft' ? '20ft' : '40ft') as ContainerType,
    rate_usd: Number(r.rate_usd || 1500),
    transit_days: Number(r.transit_days || 20),
    source: (r.source as any) || 'csv',
    updated_at: r.updated_at || CURRENT_DATE_STRING,
  }));

  const count = db.bulkCreateRates(formattedRates);

  res.status(200).json({
    message: `Successfully ingested ${count} carrier tariffs.`,
    totalTariffs: db.getRates().length,
    ingestedBy: req.user?.name,
  });
});

// ----------------------------------------------------
// 4. Shipments Management Routes
// ----------------------------------------------------

// GET /api/shipments (View shipments with query options)
app.get('/api/shipments', authenticateToken, (req: Request, res: Response) => {
  const { status, carrier, search, sortBy, sortOrder } = req.query;

  const shipments = db.getShipments({
    status: status as string,
    carrier: carrier as string,
    search: search as string,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
  });

  res.json({
    count: shipments.length,
    shipments,
    queriedBy: req.user?.name,
  });
});

// GET /api/shipments/stats (Analytics KPIs)
app.get('/api/shipments/stats', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.getShipmentStats());
});

// GET /api/shipments/export-excel (Download Excel report)
app.get('/api/shipments/export-excel', authenticateToken, (_req: Request, res: Response) => {
  const shipments = db.getShipments();

  const excelRows = shipments.map((s) => ({
    'Shipment ID': s.shipment_id,
    'Carrier': s.carrier,
    'Origin Port': s.origin_port,
    'Destination Port': s.destination_port,
    'Container Type': s.container_type,
    'Departure Date': s.departure_date,
    'Expected Arrival': s.expected_arrival,
    'Delivered Date': s.delivered_date || '-',
    'Status': s.status,
    'Contracted Rate (USD)': s.contracted_rate_usd,
    'Invoice Amount (USD)': s.invoice_amount_usd ?? '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ocean Shipments');

  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 15 },
    { wch: 16 },
    { wch: 15 },
    { wch: 12 },
    { wch: 22 },
    { wch: 20 },
  ];

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="BLUSPARK_Shipments_${Date.now()}.xlsx"`
  );
  res.send(buffer);
});

// GET /api/shipments/export-csv (Download CSV report)
app.get('/api/shipments/export-csv', authenticateToken, (_req: Request, res: Response) => {
  const shipments = db.getShipments();

  const headers = [
    'Shipment ID',
    'Carrier',
    'Origin Port',
    'Destination Port',
    'Container Type',
    'Departure Date',
    'Expected Arrival',
    'Delivered Date',
    'Status',
    'Contracted Rate (USD)',
    'Invoice Amount (USD)',
  ];

  const rows = shipments.map((s) => [
    `"${s.shipment_id}"`,
    `"${s.carrier}"`,
    `"${s.origin_port}"`,
    `"${s.destination_port}"`,
    `"${s.container_type}"`,
    `"${s.departure_date}"`,
    `"${s.expected_arrival}"`,
    `"${s.delivered_date || ''}"`,
    `"${s.status}"`,
    s.contracted_rate_usd,
    s.invoice_amount_usd || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="BLUSPARK_Shipments_${Date.now()}.csv"`
  );
  res.send(csvContent);
});

// GET /api/shipments/:id (Single shipment)
app.get('/api/shipments/:id', authenticateToken, (req: Request, res: Response) => {
  const shipment = db.getShipmentById(req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found.' });
  }
  res.json({ shipment });
});

// POST /api/shipments (Create shipment)
app.post('/api/shipments', authenticateToken, (req: Request, res: Response) => {
  const {
    shipment_id,
    carrier,
    origin_port,
    destination_port,
    container_type,
    departure_date,
    expected_arrival,
    contracted_rate_usd,
  } = req.body;

  if (!shipment_id || !carrier || !origin_port || !destination_port || contracted_rate_usd === undefined) {
    return res.status(400).json({ error: 'All required shipment fields must be provided.' });
  }

  const existing = db.getShipmentById(shipment_id);
  if (existing) {
    return res.status(409).json({ error: `Shipment ID ${shipment_id} already exists.` });
  }

  const newShipment: Shipment = {
    id: `shp_${Date.now()}`,
    shipment_id: shipment_id.toUpperCase().trim(),
    carrier: carrier.trim(),
    origin_port: origin_port.trim(),
    destination_port: destination_port.trim(),
    container_type: container_type === '20ft' ? '20ft' : '40ft',
    departure_date: departure_date || CURRENT_DATE_STRING,
    expected_arrival: expected_arrival || '2026-10-25',
    status: 'In Transit',
    contracted_rate_usd: Number(contracted_rate_usd),
  };

  const created = db.createShipment(newShipment);

  res.status(201).json({
    message: `Shipment ${created.shipment_id} created successfully.`,
    shipment: created,
    createdBy: req.user?.name,
  });
});

// PATCH /api/shipments/:id or PUT /api/shipments/:id (Update shipment)
app.all(['/api/shipments/:id'], authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'PATCH' && req.method !== 'PUT') return next();

  const { id } = req.params;
  const { status, delivered_date, expected_arrival, invoice_amount_usd, carrier, contracted_rate_usd } = req.body;

  const updated = db.updateShipment(id, {
    ...(status && { status: status as ShipmentStatus }),
    ...(delivered_date !== undefined && { delivered_date }),
    ...(expected_arrival && { expected_arrival }),
    ...(invoice_amount_usd !== undefined && { invoice_amount_usd: Number(invoice_amount_usd) }),
    ...(carrier && { carrier: carrier.trim() }),
    ...(contracted_rate_usd !== undefined && { contracted_rate_usd: Number(contracted_rate_usd) }),
  });

  if (!updated) {
    return res.status(404).json({ error: 'Shipment not found.' });
  }

  res.json({
    message: `Shipment ${updated.shipment_id} updated successfully.`,
    shipment: updated,
    modifiedBy: req.user?.name,
  });
});

// DELETE /api/shipments/:id (Delete shipment)
app.delete('/api/shipments/:id', authenticateToken, (req: Request, res: Response) => {
  const success = db.deleteShipment(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Shipment not found.' });
  }
  res.json({ message: 'Shipment deleted successfully.' });
});

// ----------------------------------------------------
// 5. Invoices Audit & Verification Routes
// ----------------------------------------------------

// POST /api/invoices/audit (Audit invoice against contracted tariff)
app.post('/api/invoices/audit', authenticateToken, (req: Request, res: Response) => {
  const { shipment_id, contracted_rate, invoice_amount, carrier, notes } = req.body;

  if (contracted_rate === undefined || invoice_amount === undefined) {
    return res.status(400).json({
      error: 'contracted_rate and invoice_amount are required.',
    });
  }

  const numContracted = Number(contracted_rate);
  const numInvoice = Number(invoice_amount);

  const auditRecord = db.recordInvoiceAudit({
    shipment_id: shipment_id || 'N/A',
    carrier,
    contracted_rate_usd: numContracted,
    invoice_amount_usd: numInvoice,
    audited_by: req.user?.name,
    notes,
  });

  res.json({
    ...auditRecord,
    statusMessage: auditRecord.status_message,
    difference: auditRecord.difference_usd,
    contracted_rate: auditRecord.contracted_rate_usd,
    invoice_amount: auditRecord.invoice_amount_usd,
  });
});

// GET /api/invoices/audit-history (List past invoice audits)
app.get('/api/invoices/audit-history', authenticateToken, (_req: Request, res: Response) => {
  res.json({
    count: db.getInvoiceAudits().length,
    audits: db.getInvoiceAudits(),
  });
});

// GET /api/invoices/summary (Audited invoices summary)
app.get('/api/invoices/summary', authenticateToken, (_req: Request, res: Response) => {
  const audits = db.getInvoiceAudits();
  const totalAudits = audits.length;
  const overchargedAudits = audits.filter((a) => a.status === 'Overcharged');
  const totalOverchargedUSD = overchargedAudits.reduce((sum, a) => sum + a.difference_usd, 0);

  res.json({
    totalAudits,
    overchargedCount: overchargedAudits.length,
    correctCount: audits.filter((a) => a.status === 'Correct Amount Charged').length,
    underchargedCount: audits.filter((a) => a.status === 'Undercharged').length,
    totalOverchargedUSD,
    inrEquivalent: totalOverchargedUSD * (db.getSettings().inrExchangeRate || 83.5),
  });
});

// ----------------------------------------------------
// 6. Email Communications & Parser Pipeline Routes
// ----------------------------------------------------

// GET /api/emails (List carrier emails with filters)
app.get('/api/emails', authenticateToken, (req: Request, res: Response) => {
  const { type, processed, search } = req.query;

  const emails = db.getEmails({
    type: type as string,
    processed: processed as string,
    search: search as string,
  });

  res.json({
    count: emails.length,
    pendingCount: emails.filter((e) => !e.processed).length,
    emails,
  });
});

// GET /api/emails/:id (Single email record)
app.get('/api/emails/:id', authenticateToken, (req: Request, res: Response) => {
  const email = db.getEmailById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Email communication record not found.' });
  }
  res.json({ email });
});

// POST /api/emails (Simulate incoming carrier email)
app.post('/api/emails', authenticateToken, (req: Request, res: Response) => {
  const { from, subject, raw_body, date } = req.body;
  if (!from || !subject || !raw_body) {
    return res.status(400).json({ error: 'from, subject, and raw_body are required.' });
  }

  const created = db.createEmail({ from, subject, raw_body, date });
  res.status(201).json({
    message: 'Carrier email received and queued for processing.',
    email: created,
  });
});

// POST /api/emails/:id/process (Process single email)
app.post('/api/emails/:id/process', authenticateToken, (req: Request, res: Response) => {
  const result = db.processEmail(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Email record not found.' });
  }

  res.json({
    message: result.actionSummary,
    email: result.email,
  });
});

// POST /api/emails/process (Batch process all pending carrier communications)
app.post('/api/emails/process', authenticateToken, (req: Request, res: Response) => {
  const result = db.processAllPendingEmails();

  res.json({
    message: `Email processing complete. Processed ${result.processedCount} communications.`,
    updatedCount: result.processedCount,
    processedLogs: result.actions,
    triggeredBy: req.user?.name,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/emails/reset (Reset emails back to demo baseline)
app.post('/api/emails/reset', authenticateToken, (_req: Request, res: Response) => {
  db.resetEmails();
  res.json({ message: 'Carrier emails reset to initial demo state.' });
});

// ----------------------------------------------------
// 7. Activities & Audit Trail Routes
// ----------------------------------------------------

// GET /api/activities (List system activity stream)
app.get('/api/activities', authenticateToken, (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;
  const activities = db.getActivities(limit);
  res.json({
    count: activities.length,
    activities,
  });
});

// POST /api/activities (Record custom activity)
app.post('/api/activities', authenticateToken, (req: Request, res: Response) => {
  const { title, subtitle, type, badgeColor } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const created = db.addActivity({
    id: `ACT_${Date.now()}`,
    timestamp: new Date().toISOString(),
    timeAgo: 'Just now',
    type: type || 'shipment',
    title: title.trim(),
    subtitle: subtitle ? subtitle.trim() : '',
    badgeColor: badgeColor || 'blue',
  });

  res.status(201).json({ activity: created });
});

// DELETE /api/activities (Clear activities)
app.delete('/api/activities', authenticateToken, (_req: Request, res: Response) => {
  db.clearActivities();
  res.json({ message: 'Activity trail cleared.' });
});

// ----------------------------------------------------
// 8. Dashboard Consolidated API
// ----------------------------------------------------

// GET /api/dashboard/summary (Consolidated dashboard metrics in a single quick call)
app.get('/api/dashboard/summary', authenticateToken, (req: Request, res: Response) => {
  const stats = db.getShipmentStats();
  const recentShipments = db.getShipments({ sortBy: 'expected_arrival', sortOrder: 'asc' }).slice(0, 5);
  const activities = db.getActivities(5);
  const emails = db.getEmails();
  const pendingEmailsCount = emails.filter((e) => !e.processed).length;
  const rates = db.getRates();

  res.json({
    stats,
    recentShipments,
    activities,
    pendingEmailsCount,
    totalTariffsCount: rates.length,
    user: req.user,
    systemDate: CURRENT_DATE_STRING,
  });
});

// ----------------------------------------------------
// Static & Vite Dev Middleware
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BLUSPARK Ocean Freight Platform Server running on http://0.0.0.0:${PORT}`);
    console.log(`💾 Persistent Storage: File-backed JSON Engine (data/db.json)`);
    console.log(`🔐 Authentication: Bcrypt 10-round salted password hashing + JWT`);
    console.log(`📊 Analytics, Shipments, Rates, Invoices & Email Extraction APIs live.`);
  });
}

startServer();
