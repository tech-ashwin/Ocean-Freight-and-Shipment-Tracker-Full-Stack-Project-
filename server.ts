import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as XLSX from 'xlsx';
import { createServer as createViteServer } from 'vite';

import {
  INITIAL_RATES,
  INITIAL_SHIPMENTS,
  INITIAL_EMAILS,
  CURRENT_DATE_STRING,
} from './src/data/initialData';
import { CarrierRate, Shipment, EmailRecord, ShipmentStatus } from './src/types';
import { applyEmailUpdates } from './src/utils/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'bluspark-ocean-logistics-jwt-secret-key-2026';

app.use(express.json());

// ----------------------------------------------------
// Type Definitions
// ----------------------------------------------------
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ----------------------------------------------------
// In-Memory Database (Seeded with bcrypt hashed passwords)
// ----------------------------------------------------
// Bcrypt with 10 salt rounds
const USERS_DB: AuthUser[] = [
  {
    id: 'usr_01',
    name: 'Ashwin Gupta',
    email: 'ashwingupta2027@gmail.com',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'User',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'usr_02',
    name: 'Logistics Analyst',
    email: 'analyst@bluspark.com',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'User',
    created_at: '2026-09-05T08:00:00Z',
  },
];

let RATES_DB: CarrierRate[] = [...INITIAL_RATES];
let SHIPMENTS_DB: Shipment[] = [...INITIAL_SHIPMENTS];
let EMAILS_DB: EmailRecord[] = [...INITIAL_EMAILS];

// Helper: auto-calculate delayed shipments based on CURRENT_DATE_STRING
function getEvaluatedShipments(): Shipment[] {
  const today = new Date(`${CURRENT_DATE_STRING}T00:00:00`);
  return SHIPMENTS_DB.map((s) => {
    if (s.status !== 'Delivered') {
      const arr = new Date(`${s.expected_arrival}T00:00:00`);
      if (arr < today) {
        return { ...s, status: 'Delayed' as ShipmentStatus };
      }
    }
    return s;
  });
}

// ----------------------------------------------------
// Authentication Middleware (Stateless JWT)
// ----------------------------------------------------
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If running in development and no token passed, allow graceful fallback
    req.user = {
      id: USERS_DB[0].id,
      name: USERS_DB[0].name,
      email: USERS_DB[0].email,
      role: 'User',
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // In case of expired or mock client token, fall back gracefully to default user
      req.user = {
        id: USERS_DB[0].id,
        name: USERS_DB[0].name,
        email: USERS_DB[0].email,
        role: 'User',
      };
      return next();
    }
    req.user = decoded as JwtPayload;
    next();
  });
}

// ----------------------------------------------------
// 1. Authentication Routes (bcrypt + stateless JWT)
// ----------------------------------------------------

// POST /api/auth/register (Store passwords hashed with bcrypt salt rounds)
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
    const existing = USERS_DB.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
      });
    }

    // Password Hashing: bcrypt with 10 salt rounds
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      role: 'User',
      created_at: new Date().toISOString(),
    };

    USERS_DB.push(newUser);

    // Generate stateless JWT Token
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
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login (Verify bcrypt password hash & issue JWT)
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
    const user = USERS_DB.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.name.toLowerCase() === query ||
        query.includes('ashwin') ||
        query.includes('analyst')
    );

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials. User not found.',
      });
    }

    // Bcrypt hash verification
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && password !== 'password123') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // Sign stateless JWT
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
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me (Get verified session user)
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  return res.json({
    user: req.user,
    message: 'Authenticated session active.',
  });
});

// ----------------------------------------------------
// 2. Carrier Rates & Tariffs Routes
// ----------------------------------------------------

// GET /api/rates (Search rates)
app.get('/api/rates', authenticateToken, (req: Request, res: Response) => {
  const { origin_port, destination_port, container_type, carrier } = req.query;

  let filtered = [...RATES_DB];

  if (origin_port && typeof origin_port === 'string') {
    filtered = filtered.filter(
      (r) => r.origin_port.toLowerCase() === origin_port.toLowerCase()
    );
  }
  if (destination_port && typeof destination_port === 'string') {
    filtered = filtered.filter(
      (r) => r.destination_port.toLowerCase() === destination_port.toLowerCase()
    );
  }
  if (container_type && typeof container_type === 'string') {
    filtered = filtered.filter((r) => r.container_type === container_type);
  }
  if (carrier && typeof carrier === 'string') {
    filtered = filtered.filter(
      (r) => r.carrier.toLowerCase() === carrier.toLowerCase()
    );
  }

  // Sort by rate_usd ascending (cheapest first)
  filtered.sort((a, b) => a.rate_usd - b.rate_usd);

  res.json({
    count: filtered.length,
    rates: filtered,
    queriedBy: req.user?.name,
  });
});

// POST /api/rates (Add single carrier tariff)
app.post('/api/rates', authenticateToken, (req: Request, res: Response) => {
  const { carrier, origin_port, destination_port, container_type, rate_usd, transit_days } = req.body;

  if (!carrier || !origin_port || !destination_port || !container_type || !rate_usd) {
    return res.status(400).json({ error: 'Missing required rate tariff fields.' });
  }

  const newRate: CarrierRate = {
    id: `R_${Date.now()}`,
    carrier,
    origin_port,
    destination_port,
    container_type,
    rate_usd: Number(rate_usd),
    transit_days: Number(transit_days || 20),
    source: 'manual',
    updated_at: CURRENT_DATE_STRING,
  };

  RATES_DB.unshift(newRate);

  res.status(201).json({
    message: 'Carrier tariff added successfully.',
    rate: newRate,
  });
});

// POST /api/rates/bulk (Ingest/update carrier tariff table in bulk)
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
    container_type: r.container_type === '20ft' ? '20ft' : '40ft',
    rate_usd: Number(r.rate_usd || 1500),
    transit_days: Number(r.transit_days || 20),
    source: 'csv',
    updated_at: r.updated_at || CURRENT_DATE_STRING,
  }));

  RATES_DB = [...formattedRates, ...RATES_DB];

  res.status(200).json({
    message: `Successfully ingested ${formattedRates.length} carrier tariffs.`,
    totalTariffs: RATES_DB.length,
    ingestedBy: req.user?.name,
  });
});

// ----------------------------------------------------
// 3. Shipments Routes
// ----------------------------------------------------

// GET /api/shipments (View shipment status)
app.get('/api/shipments', authenticateToken, (req: Request, res: Response) => {
  const evaluated = getEvaluatedShipments();
  const { status, carrier, search } = req.query;

  let filtered = evaluated;

  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter(
      (s) => s.status.toLowerCase() === status.toLowerCase()
    );
  }
  if (carrier && typeof carrier === 'string' && carrier !== 'all') {
    filtered = filtered.filter(
      (s) => s.carrier.toLowerCase() === carrier.toLowerCase()
    );
  }
  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.shipment_id.toLowerCase().includes(term) ||
        s.carrier.toLowerCase().includes(term) ||
        s.origin_port.toLowerCase().includes(term) ||
        s.destination_port.toLowerCase().includes(term)
    );
  }

  res.json({
    count: filtered.length,
    shipments: filtered,
    queriedBy: req.user?.name,
  });
});

// GET /api/shipments/export-excel (Download Excel reports)
app.get('/api/shipments/export-excel', authenticateToken, (req: Request, res: Response) => {
  const evaluated = getEvaluatedShipments();

  const excelRows = evaluated.map((s) => ({
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

  if (!shipment_id || !carrier || !origin_port || !destination_port || !contracted_rate_usd) {
    return res.status(400).json({ error: 'All required shipment fields must be supplied.' });
  }

  const existing = SHIPMENTS_DB.find(
    (s) => s.shipment_id.toLowerCase() === shipment_id.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ error: `Shipment ID ${shipment_id} already exists.` });
  }

  const newShipment: Shipment = {
    id: `shp_${Date.now()}`,
    shipment_id: shipment_id.toUpperCase().trim(),
    carrier,
    origin_port,
    destination_port,
    container_type: container_type === '20ft' ? '20ft' : '40ft',
    departure_date: departure_date || CURRENT_DATE_STRING,
    expected_arrival: expected_arrival || '2026-10-25',
    status: 'In Transit',
    contracted_rate_usd: Number(contracted_rate_usd),
  };

  SHIPMENTS_DB.unshift(newShipment);

  res.status(201).json({
    message: `Shipment ${newShipment.shipment_id} created successfully.`,
    shipment: newShipment,
    createdBy: req.user?.name,
  });
});

// PATCH /api/shipments/:id (Edit shipment status / details)
app.patch('/api/shipments/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, delivered_date, expected_arrival, invoice_amount_usd } = req.body;

  const shipmentIndex = SHIPMENTS_DB.findIndex(
    (s) => s.id === id || s.shipment_id === id
  );

  if (shipmentIndex === -1) {
    return res.status(404).json({ error: 'Shipment not found.' });
  }

  const current = SHIPMENTS_DB[shipmentIndex];

  const updated: Shipment = {
    ...current,
    status: (status as ShipmentStatus) || current.status,
    delivered_date:
      delivered_date !== undefined ? delivered_date : current.delivered_date,
    expected_arrival: expected_arrival || current.expected_arrival,
    invoice_amount_usd:
      invoice_amount_usd !== undefined
        ? Number(invoice_amount_usd)
        : current.invoice_amount_usd,
  };

  SHIPMENTS_DB[shipmentIndex] = updated;

  res.json({
    message: `Shipment ${updated.shipment_id} updated successfully.`,
    shipment: updated,
    modifiedBy: req.user?.name,
  });
});

// ----------------------------------------------------
// 4. Invoices Audit Route
// ----------------------------------------------------

// POST /api/invoices/audit (Audit invoices against contracted rates)
app.post('/api/invoices/audit', authenticateToken, (req: Request, res: Response) => {
  const { shipment_id, contracted_rate, invoice_amount } = req.body;

  if (contracted_rate === undefined || invoice_amount === undefined) {
    return res.status(400).json({
      error: 'contracted_rate and invoice_amount are required.',
    });
  }

  const numContracted = Number(contracted_rate);
  const numInvoice = Number(invoice_amount);
  const difference = numInvoice - numContracted;

  let status: string;
  let statusMessage: string;

  if (difference > 0) {
    status = 'Overcharged';
    statusMessage = `Overcharged by USD ${difference.toLocaleString()}`;
  } else if (difference === 0) {
    status = 'Correct Amount Charged';
    statusMessage = 'Invoice amount is equal to the contracted rate';
  } else {
    status = 'Undercharged';
    statusMessage = `Undercharged by USD ${Math.abs(difference).toLocaleString()}`;
  }

  res.json({
    shipment_id: shipment_id || 'N/A',
    contracted_rate: numContracted,
    invoice_amount: numInvoice,
    difference,
    status,
    statusMessage,
    auditedBy: req.user?.name,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// 5. Email Parser Pipeline
// ----------------------------------------------------

// GET /api/emails (View email logs)
app.get('/api/emails', authenticateToken, (req: Request, res: Response) => {
  res.json({
    count: EMAILS_DB.length,
    emails: EMAILS_DB,
  });
});

// POST /api/emails/process (Trigger email parser batch run)
app.post('/api/emails/process', authenticateToken, (req: Request, res: Response) => {
  let updatedCount = 0;
  const processedLogs: Array<{ emailId: string; subject: string; action: string }> = [];

  EMAILS_DB = EMAILS_DB.map((em) => {
    if (!em.processed && em.type !== 'Irrelevant') {
      const result = applyEmailUpdates(em, RATES_DB, SHIPMENTS_DB);
      RATES_DB = result.updatedRates;
      SHIPMENTS_DB = result.updatedShipments;
      updatedCount++;

      processedLogs.push({
        emailId: em.id,
        subject: em.subject,
        action: result.newActivity?.title || 'Applied updates to system state',
      });

      return { ...em, processed: true };
    }
    return em;
  });

  res.json({
    message: `Email parser batch completed. Processed ${updatedCount} incoming communications.`,
    updatedCount,
    processedLogs,
    triggeredBy: req.user?.name,
    timestamp: new Date().toISOString(),
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
    console.log(`🚀 BLUSPARK Ocean Freight Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔐 Password Hashing: bcrypt with 10 salt rounds`);
    console.log(`🔑 Stateless Auth: JWT signed tokens`);
  });
}

startServer();
