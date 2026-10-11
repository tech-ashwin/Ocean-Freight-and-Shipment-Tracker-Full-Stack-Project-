import { MongoClient, Db, Collection } from 'mongodb';
import { UserRecord, CarrierRateRecord, ShipmentRecord, EmailRecordItem, ActivityUpdateRecord } from './types.js';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnected = false;
let connectionError: string | null = null;

export const DEFAULT_MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bluspark_logistics';
export const DB_NAME = process.env.MONGODB_DB_NAME || 'bluspark_logistics';

let activeUri: string | null = null;

export async function connectMongo(uri?: string): Promise<boolean> {
  const targetUri = uri || process.env.MONGODB_URI || DEFAULT_MONGO_URI;
  try {
    if (client && isConnected && activeUri === targetUri) {
      return true;
    }

    if (client) {
      try {
        await client.close();
      } catch {
        // ignore close error
      }
      client = null;
      dbInstance = null;
    }

    activeUri = targetUri;

    // Configure connection with reasonable timeout for dev/cloud environments
    client = new MongoClient(targetUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    await client.connect();
    dbInstance = client.db(DB_NAME);
    isConnected = true;
    connectionError = null;

    console.log(`[MongoDB] Successfully connected to database: ${DB_NAME}`);
    await setupMongoIndexes();
    return true;
  } catch (err: any) {
    isConnected = false;
    dbInstance = null;
    const msg = err.message || '';
    if (msg.includes('SSL alert number 80') || msg.includes('alert internal error') || msg.includes('ssl3_read_bytes')) {
      connectionError = 'Atlas IP Access issue (SSL Alert 80): Please add "0.0.0.0/0" (Allow Access from Anywhere) in MongoDB Atlas under Network Access.';
    } else if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
      connectionError = 'Authentication failed: Incorrect MongoDB Atlas username or password.';
    } else {
      connectionError = msg || 'Failed to connect to MongoDB';
    }
    console.warn(`[MongoDB] Connection note: ${connectionError}`);
    return false;
  }
}

export function isMongoActive(): boolean {
  return isConnected && dbInstance !== null;
}

export function getMongoDb(): Db | null {
  return dbInstance;
}

export function getMongoError(): string | null {
  return connectionError;
}

// Collections
export function getUsersCollection(): Collection<UserRecord> | null {
  return dbInstance ? dbInstance.collection<UserRecord>('users') : null;
}

export function getRatesCollection(): Collection<CarrierRateRecord> | null {
  return dbInstance ? dbInstance.collection<CarrierRateRecord>('rates') : null;
}

export function getShipmentsCollection(): Collection<ShipmentRecord> | null {
  return dbInstance ? dbInstance.collection<ShipmentRecord>('shipments') : null;
}

export function getEmailsCollection(): Collection<EmailRecordItem> | null {
  return dbInstance ? dbInstance.collection<EmailRecordItem>('emails') : null;
}

export function getActivityCollection(): Collection<ActivityUpdateRecord> | null {
  return dbInstance ? dbInstance.collection<ActivityUpdateRecord>('activityUpdates') : null;
}

export async function setupMongoIndexes() {
  if (!dbInstance) return;
  try {
    const usersCol = getUsersCollection();
    if (usersCol) {
      await usersCol.createIndex({ email: 1 }, { unique: true });
    }

    const ratesCol = getRatesCollection();
    if (ratesCol) {
      await ratesCol.createIndex(
        { carrier: 1, origin_port: 1, destination_port: 1, container_type: 1 },
        { name: 'rate_lookup_idx' }
      );
    }

    const shipmentsCol = getShipmentsCollection();
    if (shipmentsCol) {
      await shipmentsCol.createIndex({ shipment_id: 1 }, { unique: true, sparse: true });
      await shipmentsCol.createIndex({ status: 1 });
    }

    const emailsCol = getEmailsCollection();
    if (emailsCol) {
      await emailsCol.createIndex({ id: 1 }, { unique: true });
    }

    const actCol = getActivityCollection();
    if (actCol) {
      await actCol.createIndex({ timestamp: -1 });
    }
  } catch (err: any) {
    console.error('[MongoDB] Index creation warning:', err.message);
  }
}
