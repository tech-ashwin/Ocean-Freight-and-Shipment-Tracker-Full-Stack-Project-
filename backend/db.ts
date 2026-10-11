import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  connectMongo,
  isMongoActive,
  getUsersCollection,
  getRatesCollection,
  getShipmentsCollection,
  getEmailsCollection,
  getActivityCollection,
  getMongoError,
  DB_NAME,
  DEFAULT_MONGO_URI
} from './mongodb.js';
import {
  UserRecord,
  CarrierRateRecord,
  ShipmentRecord,
  EmailRecordItem,
  ActivityUpdateRecord,
  DatabaseSchema
} from './types.js';

export * from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export class LogisticsDatabase {
  private fileDb: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.ensureDirectoryAndFile();
    this.fileDb = this.loadFromFile();
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Attempt MongoDB connection
    const mongoSuccess = await connectMongo();
    if (mongoSuccess) {
      await this.autoSeedMongoIfEmpty();
    }
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

  private loadFromFile(): DatabaseSchema {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return this.getDefaultData();
    }
  }

  private saveToFile() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.fileDb, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  public getDefaultData(): DatabaseSchema {
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
          invoice_amount_usd: 2150
        },
        {
          id: 'S003',
          shipment_id: 'SH-2026-003',
          carrier: 'GlobalMariner',
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
          carrier: 'PacificStar Line',
          origin_port: 'Mumbai',
          destination_port: 'Rotterdam',
          container_type: '40ft',
          departure_date: '2026-10-01',
          expected_arrival: '2026-10-24',
          delivered_date: null,
          status: 'In Transit',
          contracted_rate_usd: 1490,
          invoice_amount_usd: 1490
        },
        {
          id: 'S005',
          shipment_id: 'SH-2026-005',
          carrier: 'AtlasSea Carriers',
          origin_port: 'Nhava Sheva',
          destination_port: 'Savannah',
          container_type: '40ft',
          departure_date: '2026-09-10',
          expected_arrival: '2026-10-06',
          delivered_date: null,
          status: 'Delayed',
          contracted_rate_usd: 1850,
          invoice_amount_usd: 1850
        }
      ],
      emails: [
        {
          id: 'EML-001',
          from: 'rates-desk@oceanlink.com',
          subject: 'Revised Spot Freight Q4: Nhava Sheva to Rotterdam',
          date: '2026-10-10 08:30',
          type: 'Rate Update',
          processed: false,
          raw_body: `Dear Partner,\n\nPlease note our revised ocean freight spot rate for 40ft High Cube containers from Nhava Sheva (Mumbai) to Rotterdam is now USD 1,390 valid until end of month.\nTransit time: 21 days.\n\nBest regards,\nOceanLink Rates Desk`,
          parsed_payload: {
            carrier: 'OceanLink Lines',
            origin_port: 'Mumbai',
            destination_port: 'Rotterdam',
            container_type: '40ft',
            rate_usd: 1390,
            transit_days: 21
          }
        },
        {
          id: 'EML-002',
          from: 'ops-tracking@bluewave.com',
          subject: 'Notice of Vessel Delay: SH-2026-002 ETA Update',
          date: '2026-10-10 10:15',
          type: 'Shipment Update',
          processed: false,
          raw_body: `Hello Ashwin,\n\nDue to severe berth congestion at Los Angeles Port, vessel Blue Horizon voyage 402 carrying shipment SH-2026-002 is delayed.\nNew Expected Arrival: 2026-10-19.\n\nSincerely,\nBlueWave Ops`,
          parsed_payload: {
            shipment_id: 'SH-2026-002',
            new_eta: '2026-10-19',
            status: 'Delayed',
            reason: 'Berth congestion at Los Angeles Port'
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

  public async autoSeedMongoIfEmpty(): Promise<void> {
    if (!isMongoActive()) return;

    try {
      const usersCol = getUsersCollection();
      const ratesCol = getRatesCollection();
      const shipmentsCol = getShipmentsCollection();
      const emailsCol = getEmailsCollection();
      const activityCol = getActivityCollection();

      if (!usersCol || !ratesCol || !shipmentsCol || !emailsCol || !activityCol) return;

      const userCount = await usersCol.countDocuments();
      if (userCount === 0) {
        console.log('[MongoDB] Seeding initial data from JSON store into MongoDB...');
        const sourceData = this.fileDb.users.length ? this.fileDb : this.getDefaultData();

        if (sourceData.users.length) {
          await usersCol.insertMany(sourceData.users as any);
        }
        if (sourceData.rates.length) {
          await ratesCol.insertMany(sourceData.rates as any);
        }
        if (sourceData.shipments.length) {
          await shipmentsCol.insertMany(sourceData.shipments as any);
        }
        if (sourceData.emails.length) {
          await emailsCol.insertMany(sourceData.emails as any);
        }
        if (sourceData.activityUpdates.length) {
          await activityCol.insertMany(sourceData.activityUpdates as any);
        }
        console.log('[MongoDB] Initial migration & seed into MongoDB completed successfully.');
      }
    } catch (err: any) {
      console.error('[MongoDB] Auto-seed note:', err.message);
    }
  }

  // Explicit Migration Action
  public async migrateJsonToMongo(): Promise<{ success: boolean; message: string; counts?: any }> {
    if (!isMongoActive()) {
      const connected = await connectMongo();
      if (!connected) {
        return {
          success: false,
          message: `Cannot migrate: MongoDB is not connected (${getMongoError() || 'Check MONGODB_URI'})`
        };
      }
    }

    try {
      const usersCol = getUsersCollection()!;
      const ratesCol = getRatesCollection()!;
      const shipmentsCol = getShipmentsCollection()!;
      const emailsCol = getEmailsCollection()!;
      const actCol = getActivityCollection()!;

      const json = this.loadFromFile();

      // Upsert Users
      for (const user of json.users) {
        await usersCol.updateOne({ email: user.email.toLowerCase() }, { $set: user }, { upsert: true });
      }

      // Upsert Rates
      for (const rate of json.rates) {
        await ratesCol.updateOne(
          {
            carrier: rate.carrier,
            origin_port: rate.origin_port,
            destination_port: rate.destination_port,
            container_type: rate.container_type
          },
          { $set: rate },
          { upsert: true }
        );
      }

      // Upsert Shipments
      for (const ship of json.shipments) {
        await shipmentsCol.updateOne({ shipment_id: ship.shipment_id }, { $set: ship }, { upsert: true });
      }

      // Upsert Emails
      for (const eml of json.emails) {
        await emailsCol.updateOne({ id: eml.id }, { $set: eml }, { upsert: true });
      }

      // Upsert Activity Updates
      for (const act of json.activityUpdates) {
        await actCol.updateOne({ id: act.id }, { $set: act }, { upsert: true });
      }

      const counts = {
        users: await usersCol.countDocuments(),
        rates: await ratesCol.countDocuments(),
        shipments: await shipmentsCol.countDocuments(),
        emails: await emailsCol.countDocuments(),
        activityUpdates: await actCol.countDocuments()
      };

      return {
        success: true,
        message: 'Successfully migrated all records from JSON to MongoDB',
        counts
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  // Database Status
  public async getStatus() {
    const mongoReady = isMongoActive();
    let stats = null;

    if (mongoReady) {
      try {
        const usersCol = getUsersCollection();
        const ratesCol = getRatesCollection();
        const shipmentsCol = getShipmentsCollection();
        const emailsCol = getEmailsCollection();

        stats = {
          users: await usersCol?.countDocuments() || 0,
          rates: await ratesCol?.countDocuments() || 0,
          shipments: await shipmentsCol?.countDocuments() || 0,
          emails: await emailsCol?.countDocuments() || 0
        };
      } catch {
        // fallback
      }
    } else {
      stats = {
        users: this.fileDb.users.length,
        rates: this.fileDb.rates.length,
        shipments: this.fileDb.shipments.length,
        emails: this.fileDb.emails.length
      };
    }

    return {
      activeEngine: mongoReady ? 'MongoDB' : 'JSON File Store (Fallback)',
      isMongoConnected: mongoReady,
      mongoDatabase: DB_NAME,
      mongoUriConfigured: Boolean(process.env.MONGODB_URI),
      configuredUriMasked: process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
        : 'mongodb://127.0.0.1:27017/bluspark_logistics (default)',
      connectionError: getMongoError(),
      stats
    };
  }

  // --- Users ---
  public async getUsers(): Promise<UserRecord[]> {
    if (isMongoActive()) {
      const col = getUsersCollection();
      if (col) {
        const docs = await col.find({}, { projection: { _id: 0 } }).toArray();
        return docs as UserRecord[];
      }
    }
    return this.fileDb.users;
  }

  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (isMongoActive()) {
      const col = getUsersCollection();
      if (col) {
        const doc = await col.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } }, { projection: { _id: 0 } });
        return (doc as UserRecord) || null;
      }
    }
    const found = this.fileDb.users.find(u => u.email.toLowerCase() === cleanEmail);
    return found || null;
  }

  public async addUser(user: UserRecord): Promise<UserRecord> {
    if (isMongoActive()) {
      const col = getUsersCollection();
      if (col) {
        await col.updateOne({ email: user.email.toLowerCase() }, { $set: user }, { upsert: true });
        return user;
      }
    }
    this.fileDb.users.push(user);
    this.saveToFile();
    return user;
  }

  // --- Rates ---
  public async getRates(): Promise<CarrierRateRecord[]> {
    if (isMongoActive()) {
      const col = getRatesCollection();
      if (col) {
        const docs = await col.find({}, { projection: { _id: 0 } }).toArray();
        return docs as CarrierRateRecord[];
      }
    }
    return this.fileDb.rates;
  }

  public async upsertRate(rate: CarrierRateRecord): Promise<CarrierRateRecord> {
    if (isMongoActive()) {
      const col = getRatesCollection();
      if (col) {
        await col.updateOne(
          {
            carrier: { $regex: new RegExp(`^${rate.carrier.trim()}$`, 'i') },
            origin_port: { $regex: new RegExp(`^${rate.origin_port.trim()}$`, 'i') },
            destination_port: { $regex: new RegExp(`^${rate.destination_port.trim()}$`, 'i') },
            container_type: rate.container_type
          },
          { $set: rate },
          { upsert: true }
        );
        return rate;
      }
    }

    const idx = this.fileDb.rates.findIndex(
      r => r.carrier.toLowerCase() === rate.carrier.toLowerCase() &&
           r.origin_port.toLowerCase() === rate.origin_port.toLowerCase() &&
           r.destination_port.toLowerCase() === rate.destination_port.toLowerCase() &&
           r.container_type === rate.container_type
    );
    if (idx >= 0) {
      this.fileDb.rates[idx] = { ...this.fileDb.rates[idx], ...rate, updated_at: rate.updated_at || new Date().toISOString().split('T')[0] };
    } else {
      this.fileDb.rates.unshift(rate);
    }
    this.saveToFile();
    return rate;
  }

  public async resetRates(defaultRates?: CarrierRateRecord[]): Promise<CarrierRateRecord[]> {
    const list = defaultRates ? [...defaultRates] : this.getDefaultData().rates;
    if (isMongoActive()) {
      const col = getRatesCollection();
      if (col) {
        await col.deleteMany({});
        if (list.length) await col.insertMany(list as any);
        return list;
      }
    }
    this.fileDb.rates = list;
    this.saveToFile();
    return this.fileDb.rates;
  }

  // --- Shipments ---
  public async getShipments(): Promise<ShipmentRecord[]> {
    if (isMongoActive()) {
      const col = getShipmentsCollection();
      if (col) {
        const docs = await col.find({}, { projection: { _id: 0 } }).toArray();
        return docs as ShipmentRecord[];
      }
    }
    return this.fileDb.shipments;
  }

  public async addShipment(shipment: ShipmentRecord): Promise<ShipmentRecord> {
    if (isMongoActive()) {
      const col = getShipmentsCollection();
      if (col) {
        await col.updateOne({ shipment_id: shipment.shipment_id }, { $set: shipment }, { upsert: true });
        return shipment;
      }
    }
    this.fileDb.shipments.unshift(shipment);
    this.saveToFile();
    return shipment;
  }

  public async updateShipmentStatus(
    shipmentId: string,
    status: 'In Transit' | 'Delivered' | 'Delayed',
    deliveredDate?: string | null
  ): Promise<ShipmentRecord | null> {
    const delivered = status === 'Delivered' ? (deliveredDate || new Date().toISOString().split('T')[0]) : undefined;

    if (isMongoActive()) {
      const col = getShipmentsCollection();
      if (col) {
        const updateDoc: any = { status };
        if (delivered) updateDoc.delivered_date = delivered;

        const res = await col.findOneAndUpdate(
          { $or: [{ shipment_id: shipmentId }, { id: shipmentId }] },
          { $set: updateDoc },
          { returnDocument: 'after', projection: { _id: 0 } }
        );
        return (res as ShipmentRecord) || null;
      }
    }

    const found = this.fileDb.shipments.find(s => s.shipment_id === shipmentId || s.id === shipmentId);
    if (found) {
      found.status = status;
      if (status === 'Delivered') {
        found.delivered_date = delivered || null;
      }
      this.saveToFile();
      return found;
    }
    return null;
  }

  public async resetShipments(defaultShipments?: ShipmentRecord[]): Promise<ShipmentRecord[]> {
    const list = defaultShipments ? [...defaultShipments] : this.getDefaultData().shipments;
    if (isMongoActive()) {
      const col = getShipmentsCollection();
      if (col) {
        await col.deleteMany({});
        if (list.length) await col.insertMany(list as any);
        return list;
      }
    }
    this.fileDb.shipments = list;
    this.saveToFile();
    return this.fileDb.shipments;
  }

  // --- Emails ---
  public async getEmails(): Promise<EmailRecordItem[]> {
    if (isMongoActive()) {
      const col = getEmailsCollection();
      if (col) {
        const docs = await col.find({}, { projection: { _id: 0 } }).toArray();
        return docs as EmailRecordItem[];
      }
    }
    return this.fileDb.emails;
  }

  public async markEmailProcessed(id: string, appliedAction?: string): Promise<EmailRecordItem | null> {
    if (isMongoActive()) {
      const col = getEmailsCollection();
      if (col) {
        const updateDoc: any = { processed: true };
        if (appliedAction) updateDoc.applied_action = appliedAction;

        const res = await col.findOneAndUpdate(
          { id },
          { $set: updateDoc },
          { returnDocument: 'after', projection: { _id: 0 } }
        );
        return (res as EmailRecordItem) || null;
      }
    }

    const email = this.fileDb.emails.find(e => e.id === id);
    if (email) {
      email.processed = true;
      if (appliedAction) email.applied_action = appliedAction;
      this.saveToFile();
    }
    return email || null;
  }

  public async resetEmails(): Promise<EmailRecordItem[]> {
    const list = this.getDefaultData().emails;
    if (isMongoActive()) {
      const col = getEmailsCollection();
      if (col) {
        await col.deleteMany({});
        if (list.length) await col.insertMany(list as any);
        return list;
      }
    }
    this.fileDb.emails = list;
    this.saveToFile();
    return this.fileDb.emails;
  }

  // --- Activity Updates ---
  public async getActivityUpdates(): Promise<ActivityUpdateRecord[]> {
    if (isMongoActive()) {
      const col = getActivityCollection();
      if (col) {
        const docs = await col.find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(50).toArray();
        return docs as ActivityUpdateRecord[];
      }
    }
    return this.fileDb.activityUpdates;
  }

  public async addActivityUpdate(activity: ActivityUpdateRecord): Promise<ActivityUpdateRecord> {
    if (isMongoActive()) {
      const col = getActivityCollection();
      if (col) {
        await col.insertOne(activity as any);
        return activity;
      }
    }

    this.fileDb.activityUpdates.unshift(activity);
    if (this.fileDb.activityUpdates.length > 50) {
      this.fileDb.activityUpdates = this.fileDb.activityUpdates.slice(0, 50);
    }
    this.saveToFile();
    return activity;
  }
}

export const db = new LogisticsDatabase();

// Initialize in background
db.initialize().catch((err) => {
  console.warn('[LogisticsDatabase] Initialization error:', err.message);
});
