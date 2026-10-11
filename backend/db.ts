import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'User';
  createdAt: string;
}

export interface CarrierRateRecord {
  id: string;
  carrier: string;
  origin_port: string;
  destination_port: string;
  container_type: '20ft' | '40ft';
  rate_usd: number;
  transit_days: number;
  updated_at: string;
  source: 'csv' | 'email' | 'manual';
}

export interface ShipmentRecord {
  id: string;
  shipment_id: string;
  carrier: string;
  origin_port: string;
  destination_port: string;
  container_type: '20ft' | '40ft';
  departure_date: string;
  expected_arrival: string;
  delivered_date?: string | null;
  status: 'In Transit' | 'Delivered' | 'Delayed';
  contracted_rate_usd: number;
  invoice_amount_usd?: number;
}

export interface EmailRecordItem {
  id: string;
  from: string;
  subject: string;
  date: string;
  type: 'Rate Update' | 'Shipment Update' | 'Irrelevant';
  processed: boolean;
  raw_body: string;
  parsed_payload?: any;
  skip_reason?: string;
  applied_action?: string;
}

export interface ActivityUpdateRecord {
  id: string;
  timestamp: string;
  timeAgo: string;
  type: 'rate' | 'shipment' | 'delayed';
  title: string;
  subtitle: string;
  badgeColor?: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  rates: CarrierRateRecord[];
  shipments: ShipmentRecord[];
  emails: EmailRecordItem[];
  activityUpdates: ActivityUpdateRecord[];
}

export class JsonDatabase {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDirectoryAndFile();
    this.db = this.load();
  }

  private ensureDirectoryAndFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = this.getDefaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  }

  private load(): DatabaseSchema {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return this.getDefaultData();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  private getDefaultData(): DatabaseSchema {
    return {
      users: [
        {
          id: 'user_default_1',
          name: 'Ashwin Gupta',
          email: 'ashwingupta2027@gmail.com',
          // bcrypt hash of "password123"
          passwordHash: '$2a$10$wTf7h9Xq3v9p2E6sT.840ez38eJ6KspKx8mP30oQ4.fEcr8k4bKwe',
          role: 'User',
          createdAt: '2026-10-10T00:00:00.000Z'
        }
      ],
      rates: [
        {
          id: 'R001',
          carrier: 'OceanLink Lines',
          origin_port: 'Mumbai',
          destination_port: 'Rotterdam',
          container_type: '40ft',
          rate_usd: 1420,
          transit_days: 22,
          source: 'csv',
          updated_at: '2026-09-20'
        },
        {
          id: 'R002',
          carrier: 'BlueWave Shipping',
          origin_port: 'Mumbai',
          destination_port: 'Rotterdam',
          container_type: '40ft',
          rate_usd: 1550,
          transit_days: 20,
          source: 'csv',
          updated_at: '2026-09-21'
        },
        {
          id: 'R003',
          carrier: 'GlobalMariner',
          origin_port: 'Mumbai',
          destination_port: 'Rotterdam',
          container_type: '40ft',
          rate_usd: 1680,
          transit_days: 19,
          source: 'csv',
          updated_at: '2026-09-22'
        },
        {
          id: 'R004',
          carrier: 'PacificStar Line',
          origin_port: 'Mumbai',
          destination_port: 'Rotterdam',
          container_type: '40ft',
          rate_usd: 1490,
          transit_days: 23,
          source: 'csv',
          updated_at: '2026-09-23'
        },
        {
          id: 'R005',
          carrier: 'AtlasSea Carriers',
          origin_port: 'Mumbai',
          destination_port: 'Rotterdam',
          container_type: '40ft',
          rate_usd: 1610,
          transit_days: 21,
          source: 'csv',
          updated_at: '2026-09-24'
        },
        {
          id: 'R006',
          carrier: 'OceanLink Lines',
          origin_port: 'Shanghai',
          destination_port: 'Los Angeles',
          container_type: '40ft',
          rate_usd: 2150,
          transit_days: 14,
          source: 'csv',
          updated_at: '2026-09-22'
        },
        {
          id: 'R007',
          carrier: 'PacificStar Line',
          origin_port: 'Shanghai',
          destination_port: 'Los Angeles',
          container_type: '40ft',
          rate_usd: 2080,
          transit_days: 16,
          source: 'csv',
          updated_at: '2026-09-20'
        },
        {
          id: 'R008',
          carrier: 'BlueWave Shipping',
          origin_port: 'Singapore',
          destination_port: 'Dubai',
          container_type: '20ft',
          rate_usd: 880,
          transit_days: 11,
          source: 'csv',
          updated_at: '2026-09-25'
        },
        {
          id: 'R009',
          carrier: 'GlobalMariner',
          origin_port: 'Hamburg',
          destination_port: 'New York',
          container_type: '40ft',
          rate_usd: 1750,
          transit_days: 12,
          source: 'csv',
          updated_at: '2026-09-24'
        }
      ],
      shipments: [
        {
          id: 'S001',
          shipment_id: 'SH-2026-001',
          carrier: 'OceanLink Lines',
          origin_port: 'Mumbai',
          destination_port: 'Rotterdam',
          container_type: '40ft',
          departure_date: '2026-09-15',
          expected_arrival: '2026-10-07',
          delivered_date: null,
          status: 'Delayed',
          contracted_rate_usd: 1420,
          invoice_amount_usd: 1420
        },
        {
          id: 'S002',
          shipment_id: 'SH-2026-002',
          carrier: 'BlueWave Shipping',
          origin_port: 'Shanghai',
          destination_port: 'Los Angeles',
          container_type: '40ft',
          departure_date: '2026-09-28',
          expected_arrival: '2026-10-14',
          delivered_date: null,
          status: 'In Transit',
          contracted_rate_usd: 2150,
          invoice_amount_usd: 2280
        },
        {
          id: 'S003',
          shipment_id: 'SH-2026-003',
          carrier: 'PacificStar Line',
          origin_port: 'Singapore',
          destination_port: 'Dubai',
          container_type: '20ft',
          departure_date: '2026-09-20',
          expected_arrival: '2026-10-01',
          delivered_date: '2026-10-01',
          status: 'Delivered',
          contracted_rate_usd: 880,
          invoice_amount_usd: 880
        },
        {
          id: 'S004',
          shipment_id: 'SH-2026-004',
          carrier: 'GlobalMariner',
          origin_port: 'Hamburg',
          destination_port: 'New York',
          container_type: '40ft',
          departure_date: '2026-10-02',
          expected_arrival: '2026-10-15',
          delivered_date: null,
          status: 'In Transit',
          contracted_rate_usd: 1750,
          invoice_amount_usd: 1750
        },
        {
          id: 'S005',
          shipment_id: 'SH-2026-005',
          carrier: 'AtlasSea Carriers',
          origin_port: 'Nhava Sheva',
          destination_port: 'Savannah',
          container_type: '40ft',
          departure_date: '2026-09-10',
          expected_arrival: '2026-10-05',
          delivered_date: null,
          status: 'Delayed',
          contracted_rate_usd: 1980,
          invoice_amount_usd: 2150
        }
      ],
      emails: [
        {
          id: 'EML-001',
          from: 'pricing@pacificstarline.com',
          subject: 'Special Spot Quotation: Mumbai to Rotterdam 40ft HC',
          date: '2026-10-05 09:30',
          type: 'Rate Update',
          processed: false,
          raw_body: `Dear Valued Customer,

Please find our updated ocean freight rate for October loadings:
- Origin: Mumbai Port
- Destination: Rotterdam
- Equipment: 40ft High Cube
- Ocean Freight Rate: USD 1,380
- Transit Time: 21 Days
- Effective Date: Immediately through Oct 31, 2026

Best regards,
PacificStar Line Pricing Desk`,
          parsed_payload: {
            carrier: 'PacificStar Line',
            origin_port: 'Mumbai',
            destination_port: 'Rotterdam',
            container_type: '40ft',
            rate_usd: 1380,
            transit_days: 21,
            validity: 'October 31, 2026'
          }
        },
        {
          id: 'EML-002',
          from: 'tracking@oceanlinklines.com',
          subject: 'Vessel Arrival Notice & Discharge Confirmation - SH-2026-001',
          date: '2026-10-08 14:15',
          type: 'Shipment Update',
          processed: false,
          raw_body: `Notification for shipment ref: SH-2026-001

We are pleased to inform you that container MSKU9920140 has completed discharge at Rotterdam Gateway.
- Shipment Ref: SH-2026-001
- Current Status: Delivered
- Actual Delivered Date: 2026-10-08

Thank you for shipping with OceanLink Lines.`,
          parsed_payload: {
            shipment_id: 'SH-2026-001',
            carrier: 'OceanLink Lines',
            new_status: 'Delivered',
            delivered_date: '2026-10-08'
          }
        },
        {
          id: 'EML-003',
          from: 'marketing@globalmariner.com',
          subject: 'Join our Annual Maritime Supply Chain Webinar',
          date: '2026-10-09 11:00',
          type: 'Irrelevant',
          processed: false,
          raw_body: `Hi team, register now for our free webinar on green corridors in shipping!`,
          skip_reason: 'Marketing newsletter, no actionable rate or shipment update'
        }
      ],
      activityUpdates: [
        {
          id: 'ACT-001',
          timestamp: '2026-10-10 11:45',
          timeAgo: '12m ago',
          type: 'rate',
          title: 'New spot rate detected: Mumbai → Rotterdam',
          subtitle: 'PacificStar Line quoted USD 1,380 (saving $40 vs benchmark)',
          badgeColor: 'emerald'
        },
        {
          id: 'ACT-002',
          timestamp: '2026-10-10 09:15',
          timeAgo: '2h ago',
          type: 'shipment',
          title: 'Status changed: SH-2026-001 marked Delivered',
          subtitle: 'Discharged at Rotterdam Terminal on Oct 8',
          badgeColor: 'blue'
        },
        {
          id: 'ACT-003',
          timestamp: '2026-10-09 16:30',
          timeAgo: 'Yesterday',
          type: 'delayed',
          title: 'Delay Alert: SH-2026-005 Savannah route',
          subtitle: 'Port congestion reported at destination terminal',
          badgeColor: 'amber'
        }
      ]
    };
  }

  // Users
  getUsers() { return this.db.users; }
  findUserByEmail(email: string) {
    return this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  addUser(user: UserRecord) {
    this.db.users.push(user);
    this.save();
    return user;
  }

  // Rates
  getRates() { return this.db.rates; }
  upsertRate(rate: CarrierRateRecord) {
    const idx = this.db.rates.findIndex(
      r => r.carrier.toLowerCase() === rate.carrier.toLowerCase() &&
           r.origin_port.toLowerCase() === rate.origin_port.toLowerCase() &&
           r.destination_port.toLowerCase() === rate.destination_port.toLowerCase() &&
           r.container_type === rate.container_type
    );
    if (idx >= 0) {
      this.db.rates[idx] = { ...this.db.rates[idx], ...rate, updated_at: rate.updated_at || new Date().toISOString().split('T')[0] };
    } else {
      this.db.rates.unshift(rate);
    }
    this.save();
    return rate;
  }
  resetRates(defaultRates?: CarrierRateRecord[]) {
    this.db.rates = defaultRates ? [...defaultRates] : this.getDefaultData().rates;
    this.save();
    return this.db.rates;
  }

  // Shipments
  getShipments() { return this.db.shipments; }
  addShipment(shipment: ShipmentRecord) {
    this.db.shipments.unshift(shipment);
    this.save();
    return shipment;
  }
  updateShipmentStatus(shipmentId: string, status: 'In Transit' | 'Delivered' | 'Delayed', deliveredDate?: string | null) {
    const found = this.db.shipments.find(s => s.shipment_id === shipmentId || s.id === shipmentId);
    if (found) {
      found.status = status;
      if (status === 'Delivered') {
        found.delivered_date = deliveredDate || new Date().toISOString().split('T')[0];
      }
      this.save();
      return found;
    }
    return null;
  }
  resetShipments(defaultShipments?: ShipmentRecord[]) {
    this.db.shipments = defaultShipments ? [...defaultShipments] : this.getDefaultData().shipments;
    this.save();
    return this.db.shipments;
  }

  // Emails
  getEmails() { return this.db.emails; }
  markEmailProcessed(id: string, appliedAction?: string) {
    const email = this.db.emails.find(e => e.id === id);
    if (email) {
      email.processed = true;
      if (appliedAction) email.applied_action = appliedAction;
      this.save();
    }
    return email;
  }
  resetEmails() {
    this.db.emails = this.getDefaultData().emails;
    this.save();
    return this.db.emails;
  }

  // Activity Updates
  getActivityUpdates() { return this.db.activityUpdates; }
  addActivityUpdate(activity: ActivityUpdateRecord) {
    this.db.activityUpdates.unshift(activity);
    if (this.db.activityUpdates.length > 50) {
      this.db.activityUpdates = this.db.activityUpdates.slice(0, 50);
    }
    this.save();
    return activity;
  }
}

export const db = new JsonDatabase();
