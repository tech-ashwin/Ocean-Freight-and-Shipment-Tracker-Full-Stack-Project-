import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

import {
  INITIAL_RATES,
  INITIAL_SHIPMENTS,
  INITIAL_EMAILS,
  INITIAL_UPDATES,
  CURRENT_DATE_STRING,
} from '../src/data/initialData';
import {
  CarrierRate,
  Shipment,
  EmailRecord,
  ActivityUpdate,
  ShipmentStatus,
  UserRole,
} from '../src/types';
import { applyEmailUpdates, classifyEmailType, parseEmailContent } from '../src/utils/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export interface InvoiceAuditRecord {
  id: string;
  shipment_id: string;
  carrier?: string;
  contracted_rate_usd: number;
  invoice_amount_usd: number;
  difference_usd: number;
  status: 'Overcharged' | 'Correct Amount Charged' | 'Undercharged';
  status_message: string;
  contracted_rate_inr: number;
  invoice_amount_inr: number;
  difference_inr: number;
  audited_by?: string;
  notes?: string;
  timestamp: string;
}

export interface DbSchema {
  users: AuthUser[];
  rates: CarrierRate[];
  shipments: Shipment[];
  emails: EmailRecord[];
  activities: ActivityUpdate[];
  invoiceAudits: InvoiceAuditRecord[];
  settings: {
    inrExchangeRate: number;
    appName: string;
    autoDelayCheck: boolean;
    lastEmailSync?: string;
  };
}

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Initial seed users
const INITIAL_USERS: AuthUser[] = [
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
  {
    id: 'usr_03',
    name: 'Freight Operator',
    email: 'operator@bluspark.com',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'User',
    created_at: '2026-09-10T08:00:00Z',
  },
  {
    id: 'usr_04',
    name: 'Logistics Manager',
    email: 'manager@bluspark.com',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'User',
    created_at: '2026-09-12T08:00:00Z',
  },
];

const INITIAL_AUDITS: InvoiceAuditRecord[] = [
  {
    id: 'AUD_001',
    shipment_id: 'SH001',
    carrier: 'OceanLink Lines',
    contracted_rate_usd: 1420,
    invoice_amount_usd: 1550,
    difference_usd: 130,
    status: 'Overcharged',
    status_message: 'Overcharged by USD 130',
    contracted_rate_inr: 1420 * 83.5,
    invoice_amount_inr: 1550 * 83.5,
    difference_inr: 130 * 83.5,
    audited_by: 'Ashwin Gupta',
    notes: 'Bunker surcharge billed in excess of negotiated tariff',
    timestamp: '2026-10-06T15:00:00Z',
  },
  {
    id: 'AUD_002',
    shipment_id: 'SH002',
    carrier: 'BlueWave Shipping',
    contracted_rate_usd: 1550,
    invoice_amount_usd: 1550,
    difference_usd: 0,
    status: 'Correct Amount Charged',
    status_message: 'Invoice amount is equal to the contracted rate',
    contracted_rate_inr: 1550 * 83.5,
    invoice_amount_inr: 1550 * 83.5,
    difference_inr: 0,
    audited_by: 'Logistics Analyst',
    notes: 'Exact match with contracted ocean tariff',
    timestamp: '2026-10-05T11:20:00Z',
  },
];

class DatabaseEngine {
  private data: DbSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private getInitialData(): DbSchema {
    return {
      users: [...INITIAL_USERS],
      rates: [...INITIAL_RATES],
      shipments: [...INITIAL_SHIPMENTS],
      emails: [...INITIAL_EMAILS],
      activities: [...INITIAL_UPDATES],
      invoiceAudits: [...INITIAL_AUDITS],
      settings: {
        inrExchangeRate: 83.5,
        appName: 'BLUSPARK Ocean Freight Platform',
        autoDelayCheck: true,
        lastEmailSync: new Date().toISOString(),
      },
    };
  }

  private load(): DbSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all required collections exist
        return {
          users: parsed.users || [...INITIAL_USERS],
          rates: parsed.rates || [...INITIAL_RATES],
          shipments: parsed.shipments || [...INITIAL_SHIPMENTS],
          emails: parsed.emails || [...INITIAL_EMAILS],
          activities: parsed.activities || [...INITIAL_UPDATES],
          invoiceAudits: parsed.invoiceAudits || [...INITIAL_AUDITS],
          settings: parsed.settings || {
            inrExchangeRate: 83.5,
            appName: 'BLUSPARK Ocean Freight Platform',
            autoDelayCheck: true,
          },
        };
      }
    } catch (err) {
      console.warn('Error reading db.json, initializing fresh store:', err);
    }

    const initial = this.getInitialData();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DbSchema) {
    try {
      const payload = dataToSave || this.data;
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  // ----------------------------------------------------
  // Dynamic Delay Evaluation for Shipments
  // ----------------------------------------------------
  public evaluateShipments(list: Shipment[]): Shipment[] {
    const today = new Date(`${CURRENT_DATE_STRING}T00:00:00`);
    return list.map((s) => {
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
  // Users Collection
  // ----------------------------------------------------
  public getUsers(): AuthUser[] {
    return this.data.users;
  }

  public findUserByEmail(email: string): AuthUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserByQuery(query: string): AuthUser | undefined {
    const q = query.toLowerCase().trim();
    if (!q) return undefined;
    return this.data.users.find((u) => {
      const uEmail = u.email.toLowerCase();
      const uName = u.name.toLowerCase();
      const uPrefix = uEmail.split('@')[0];
      return (
        uEmail === q ||
        uName === q ||
        uPrefix === q ||
        (q.includes('ashwin') && uEmail.includes('ashwin')) ||
        (q.includes('analyst') && uEmail.includes('analyst')) ||
        (q.includes('operator') && uEmail.includes('operator')) ||
        (q.includes('manager') && uEmail.includes('manager'))
      );
    });
  }

  public findUserById(id: string): AuthUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: AuthUser): AuthUser {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<AuthUser>): AuthUser | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // ----------------------------------------------------
  // Rates Collection
  // ----------------------------------------------------
  public getRates(filters?: {
    origin_port?: string;
    destination_port?: string;
    container_type?: string;
    carrier?: string;
    source?: string;
    min_rate?: number;
    max_rate?: number;
    sortBy?: 'rate_usd' | 'transit_days' | 'carrier' | 'updated_at';
    sortOrder?: 'asc' | 'desc';
  }): CarrierRate[] {
    let result = [...this.data.rates];

    if (filters?.origin_port) {
      const q = filters.origin_port.toLowerCase();
      result = result.filter((r) => r.origin_port.toLowerCase().includes(q));
    }
    if (filters?.destination_port) {
      const q = filters.destination_port.toLowerCase();
      result = result.filter((r) => r.destination_port.toLowerCase().includes(q));
    }
    if (filters?.container_type && filters.container_type !== 'all') {
      result = result.filter((r) => r.container_type === filters.container_type);
    }
    if (filters?.carrier && filters.carrier !== 'all') {
      const q = filters.carrier.toLowerCase();
      result = result.filter((r) => r.carrier.toLowerCase().includes(q));
    }
    if (filters?.source && filters.source !== 'all') {
      result = result.filter((r) => r.source === filters.source);
    }
    if (filters?.min_rate !== undefined) {
      result = result.filter((r) => r.rate_usd >= Number(filters.min_rate));
    }
    if (filters?.max_rate !== undefined) {
      result = result.filter((r) => r.rate_usd <= Number(filters.max_rate));
    }

    const sortBy = filters?.sortBy || 'rate_usd';
    const sortOrder = filters?.sortOrder || 'asc';

    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }

  public getRateById(id: string): CarrierRate | undefined {
    return this.data.rates.find((r) => r.id === id);
  }

  public createRate(rate: CarrierRate): CarrierRate {
    this.data.rates.unshift(rate);
    this.addActivity({
      id: `ACT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: 'rate',
      title: `Tariff added for ${rate.carrier} | ${rate.origin_port} → ${rate.destination_port}`,
      subtitle: `${rate.container_type} at $${rate.rate_usd.toLocaleString()} (${rate.transit_days}d transit)`,
      badgeColor: 'emerald',
    });
    this.save();
    return rate;
  }

  public updateRate(id: string, updates: Partial<CarrierRate>): CarrierRate | null {
    const idx = this.data.rates.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const old = this.data.rates[idx];
    const updated = { ...old, ...updates, updated_at: CURRENT_DATE_STRING };
    this.data.rates[idx] = updated;

    this.addActivity({
      id: `ACT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: 'rate',
      title: `Rate adjusted for ${updated.carrier} (${updated.origin_port} → ${updated.destination_port})`,
      subtitle: `Rate: $${updated.rate_usd.toLocaleString()} | Transit: ${updated.transit_days} days`,
      badgeColor: 'emerald',
    });

    this.save();
    return updated;
  }

  public deleteRate(id: string): boolean {
    const idx = this.data.rates.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    const removed = this.data.rates.splice(idx, 1)[0];
    this.addActivity({
      id: `ACT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: 'rate',
      title: `Tariff removed: ${removed.carrier} (${removed.origin_port} → ${removed.destination_port})`,
      subtitle: `${removed.container_type} rate USD ${removed.rate_usd} deleted`,
      badgeColor: 'rose',
    });
    this.save();
    return true;
  }

  public bulkCreateRates(rates: CarrierRate[]): number {
    this.data.rates = [...rates, ...this.data.rates];
    this.addActivity({
      id: `ACT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: 'rate',
      title: `Bulk tariff import completed`,
      subtitle: `Ingested ${rates.length} rates into carrier database`,
      badgeColor: 'emerald',
    });
    this.save();
    return rates.length;
  }

  public getUniquePorts(): { origins: string[]; destinations: string[] } {
    const origins = Array.from(new Set(this.data.rates.map((r) => r.origin_port))).sort();
    const destinations = Array.from(new Set(this.data.rates.map((r) => r.destination_port))).sort();
    return { origins, destinations };
  }

  public getUniqueCarriers(): Array<{ carrier: string; rateCount: number; minRate: number }> {
    const carrierMap = new Map<string, { count: number; minRate: number }>();
    for (const r of this.data.rates) {
      const existing = carrierMap.get(r.carrier);
      if (!existing) {
        carrierMap.set(r.carrier, { count: 1, minRate: r.rate_usd });
      } else {
        existing.count += 1;
        if (r.rate_usd < existing.minRate) {
          existing.minRate = r.rate_usd;
        }
      }
    }
    return Array.from(carrierMap.entries()).map(([carrier, stat]) => ({
      carrier,
      rateCount: stat.count,
      minRate: stat.minRate,
    })).sort((a, b) => a.carrier.localeCompare(b.carrier));
  }

  // ----------------------------------------------------
  // Shipments Collection
  // ----------------------------------------------------
  public getShipments(filters?: {
    status?: string;
    carrier?: string;
    search?: string;
    sortBy?: 'expected_arrival' | 'departure_date' | 'shipment_id' | 'contracted_rate_usd';
    sortOrder?: 'asc' | 'desc';
  }): Shipment[] {
    const evaluated = this.evaluateShipments(this.data.shipments);
    let result = evaluated;

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((s) => s.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.carrier && filters.carrier !== 'all') {
      result = result.filter((s) => s.carrier.toLowerCase() === filters.carrier!.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.shipment_id.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.origin_port.toLowerCase().includes(q) ||
          s.destination_port.toLowerCase().includes(q)
      );
    }

    const sortBy = filters?.sortBy || 'expected_arrival';
    const sortOrder = filters?.sortOrder || 'asc';

    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }

  public getShipmentById(idOrShipmentId: string): Shipment | undefined {
    const evaluated = this.evaluateShipments(this.data.shipments);
    return evaluated.find(
      (s) => s.id === idOrShipmentId || s.shipment_id.toUpperCase() === idOrShipmentId.toUpperCase()
    );
  }

  public createShipment(shipment: Shipment): Shipment {
    this.data.shipments.unshift(shipment);
    this.addActivity({
      id: `ACT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: 'shipment',
      title: `Shipment ${shipment.shipment_id} created`,
      subtitle: `${shipment.carrier} | ${shipment.origin_port} → ${shipment.destination_port} ($${shipment.contracted_rate_usd.toLocaleString()})`,
      badgeColor: 'blue',
    });
    this.save();
    return shipment;
  }

  public updateShipment(idOrShipmentId: string, updates: Partial<Shipment>): Shipment | null {
    const idx = this.data.shipments.findIndex(
      (s) => s.id === idOrShipmentId || s.shipment_id.toUpperCase() === idOrShipmentId.toUpperCase()
    );
    if (idx === -1) return null;

    const current = this.data.shipments[idx];
    const updated: Shipment = {
      ...current,
      ...updates,
      status: updates.status || current.status,
      delivered_date: updates.delivered_date !== undefined ? updates.delivered_date : current.delivered_date,
      invoice_amount_usd: updates.invoice_amount_usd !== undefined ? updates.invoice_amount_usd : current.invoice_amount_usd,
    };

    this.data.shipments[idx] = updated;

    this.addActivity({
      id: `ACT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: updated.status === 'Delayed' ? 'delayed' : 'shipment',
      title: `Shipment ${updated.shipment_id} updated: ${updated.status}`,
      subtitle: updated.delivered_date ? `Delivered: ${updated.delivered_date}` : `Carrier: ${updated.carrier}`,
      badgeColor: updated.status === 'Delayed' ? 'rose' : updated.status === 'Delivered' ? 'emerald' : 'blue',
    });

    this.save();
    return updated;
  }

  public deleteShipment(idOrShipmentId: string): boolean {
    const idx = this.data.shipments.findIndex(
      (s) => s.id === idOrShipmentId || s.shipment_id.toUpperCase() === idOrShipmentId.toUpperCase()
    );
    if (idx === -1) return false;
    const removed = this.data.shipments.splice(idx, 1)[0];
    this.addActivity({
      id: `ACT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: 'shipment',
      title: `Shipment ${removed.shipment_id} removed`,
      subtitle: `${removed.carrier} container shipment deleted`,
      badgeColor: 'rose',
    });
    this.save();
    return true;
  }

  public getShipmentStats() {
    const evaluated = this.evaluateShipments(this.data.shipments);
    const total = evaluated.length;
    const inTransit = evaluated.filter((s) => s.status === 'In Transit').length;
    const delivered = evaluated.filter((s) => s.status === 'Delivered').length;
    const delayed = evaluated.filter((s) => s.status === 'Delayed').length;

    const totalContractedSpend = evaluated.reduce((sum, s) => sum + s.contracted_rate_usd, 0);
    const totalInvoicedSpend = evaluated.reduce((sum, s) => sum + (s.invoice_amount_usd || s.contracted_rate_usd), 0);

    const onTimeRate = total > 0 ? Math.round(((delivered + inTransit) / total) * 100) : 100;

    // Carrier breakdown
    const carrierCounts = new Map<string, number>();
    for (const s of evaluated) {
      carrierCounts.set(s.carrier, (carrierCounts.get(s.carrier) || 0) + 1);
    }
    const carrierDistribution = Array.from(carrierCounts.entries()).map(([carrier, count]) => ({
      carrier,
      count,
    }));

    return {
      totalShipments: total,
      inTransitCount: inTransit,
      deliveredCount: delivered,
      delayedCount: delayed,
      onTimeDeliveryRate: onTimeRate,
      totalContractedSpend,
      totalInvoicedSpend,
      spendDiscrepancy: totalInvoicedSpend - totalContractedSpend,
      carrierDistribution,
      lastUpdated: CURRENT_DATE_STRING,
    };
  }

  // ----------------------------------------------------
  // Emails Collection & Automated Extraction
  // ----------------------------------------------------
  public getEmails(filters?: {
    type?: string;
    processed?: boolean | string;
    search?: string;
  }): EmailRecord[] {
    let result = [...this.data.emails];

    if (filters?.type && filters.type !== 'all') {
      result = result.filter((e) => e.type.toLowerCase() === filters.type!.toLowerCase());
    }

    if (filters?.processed !== undefined && filters.processed !== 'all') {
      const isProc = String(filters.processed) === 'true';
      result = result.filter((e) => e.processed === isProc);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.from.toLowerCase().includes(q) ||
          e.raw_body.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getEmailById(id: string): EmailRecord | undefined {
    return this.data.emails.find((e) => e.id === id);
  }

  public createEmail(emailInput: {
    from: string;
    subject: string;
    raw_body: string;
    date?: string;
  }): EmailRecord {
    const parsed = parseEmailContent(emailInput.from, emailInput.subject, emailInput.raw_body);

    const newRecord: EmailRecord = {
      id: `EM_${Date.now()}`,
      from: emailInput.from,
      subject: emailInput.subject,
      date: emailInput.date || CURRENT_DATE_STRING,
      type: parsed.type,
      processed: false,
      raw_body: emailInput.raw_body,
      parsed_payload: parsed.parsed_payload,
      skip_reason: parsed.skip_reason,
      applied_action: parsed.applied_action,
    };

    this.data.emails.unshift(newRecord);
    this.save();
    return newRecord;
  }

  public processEmail(id: string): { email: EmailRecord; actionSummary: string } | null {
    const idx = this.data.emails.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const email = this.data.emails[idx];
    if (email.processed) {
      return { email, actionSummary: 'Email was already processed previously.' };
    }

    let actionSummary = 'No updates required (classified as Irrelevant or missing payload)';

    if (email.type !== 'Irrelevant') {
      const result = applyEmailUpdates(email, this.data.rates, this.data.shipments);
      this.data.rates = result.updatedRates;
      this.data.shipments = result.updatedShipments;

      if (result.newActivity) {
        this.addActivity(result.newActivity);
        actionSummary = result.newActivity.title;
      } else {
        actionSummary = `Processed ${email.type} payload successfully`;
      }
    }

    const updatedEmail: EmailRecord = {
      ...email,
      processed: true,
      applied_action: actionSummary,
    };

    this.data.emails[idx] = updatedEmail;
    this.save();

    return { email: updatedEmail, actionSummary };
  }

  public processAllPendingEmails(): {
    processedCount: number;
    actions: Array<{ emailId: string; subject: string; action: string }>;
  } {
    let processedCount = 0;
    const actions: Array<{ emailId: string; subject: string; action: string }> = [];

    this.data.emails = this.data.emails.map((em) => {
      if (!em.processed) {
        if (em.type !== 'Irrelevant') {
          const result = applyEmailUpdates(em, this.data.rates, this.data.shipments);
          this.data.rates = result.updatedRates;
          this.data.shipments = result.updatedShipments;
          if (result.newActivity) {
            this.addActivity(result.newActivity);
            actions.push({
              emailId: em.id,
              subject: em.subject,
              action: result.newActivity.title,
            });
          } else {
            actions.push({
              emailId: em.id,
              subject: em.subject,
              action: `Parsed ${em.type} and applied values to database`,
            });
          }
        } else {
          actions.push({
            emailId: em.id,
            subject: em.subject,
            action: 'Classified as Irrelevant communication; marked processed without DB changes',
          });
        }
        processedCount++;
        return { ...em, processed: true, applied_action: actions[actions.length - 1]?.action };
      }
      return em;
    });

    if (processedCount > 0) {
      this.addActivity({
        id: `ACT_${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        type: 'rate',
        title: `Automated Email Processing Batch Completed`,
        subtitle: `Extracted data from ${processedCount} pending carrier communications`,
        badgeColor: 'purple',
      });
      this.save();
    }

    return { processedCount, actions };
  }

  public resetEmails(): void {
    this.data.emails = [...INITIAL_EMAILS];
    this.save();
  }

  // ----------------------------------------------------
  // Activities / Audit Trail
  // ----------------------------------------------------
  public getActivities(limit = 20): ActivityUpdate[] {
    return this.data.activities.slice(0, limit);
  }

  public addActivity(activity: ActivityUpdate): ActivityUpdate {
    this.data.activities.unshift(activity);
    if (this.data.activities.length > 100) {
      this.data.activities = this.data.activities.slice(0, 100);
    }
    this.save();
    return activity;
  }

  public clearActivities(): void {
    this.data.activities = [];
    this.save();
  }

  // ----------------------------------------------------
  // Invoice Audit Log
  // ----------------------------------------------------
  public recordInvoiceAudit(auditInput: {
    shipment_id: string;
    contracted_rate_usd: number;
    invoice_amount_usd: number;
    carrier?: string;
    audited_by?: string;
    notes?: string;
  }): InvoiceAuditRecord {
    const diff = auditInput.invoice_amount_usd - auditInput.contracted_rate_usd;
    const rateInr = this.data.settings.inrExchangeRate || 83.5;

    let status: 'Overcharged' | 'Correct Amount Charged' | 'Undercharged';
    let status_message: string;

    if (diff > 0) {
      status = 'Overcharged';
      status_message = `Overcharged by USD ${diff.toLocaleString()}`;
    } else if (diff === 0) {
      status = 'Correct Amount Charged';
      status_message = 'Invoice amount is equal to the contracted rate';
    } else {
      status = 'Undercharged';
      status_message = `Undercharged by USD ${Math.abs(diff).toLocaleString()}`;
    }

    const record: InvoiceAuditRecord = {
      id: `AUD_${Date.now()}`,
      shipment_id: auditInput.shipment_id,
      carrier: auditInput.carrier,
      contracted_rate_usd: auditInput.contracted_rate_usd,
      invoice_amount_usd: auditInput.invoice_amount_usd,
      difference_usd: diff,
      status,
      status_message,
      contracted_rate_inr: auditInput.contracted_rate_usd * rateInr,
      invoice_amount_inr: auditInput.invoice_amount_usd * rateInr,
      difference_inr: diff * rateInr,
      audited_by: auditInput.audited_by || 'Ashwin Gupta',
      notes: auditInput.notes || '',
      timestamp: new Date().toISOString(),
    };

    this.data.invoiceAudits.unshift(record);

    // Update shipment's invoice amount if shipment exists
    const shipmentIdx = this.data.shipments.findIndex(
      (s) => s.shipment_id.toUpperCase() === auditInput.shipment_id.toUpperCase()
    );
    if (shipmentIdx !== -1) {
      this.data.shipments[shipmentIdx].invoice_amount_usd = auditInput.invoice_amount_usd;
    }

    this.addActivity({
      id: `ACT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: 'shipment',
      title: `Invoice Audited for Shipment ${auditInput.shipment_id}`,
      subtitle: `${status}: USD ${auditInput.invoice_amount_usd.toLocaleString()} vs contracted USD ${auditInput.contracted_rate_usd.toLocaleString()}`,
      badgeColor: diff > 0 ? 'rose' : 'emerald',
    });

    this.save();
    return record;
  }

  public getInvoiceAudits(): InvoiceAuditRecord[] {
    return this.data.invoiceAudits;
  }

  // ----------------------------------------------------
  // Settings
  // ----------------------------------------------------
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<DbSchema['settings']>) {
    this.data.settings = { ...this.data.settings, ...partial };
    this.save();
    return this.data.settings;
  }

  // ----------------------------------------------------
  // Reset Entire Database to Initial Baseline
  // ----------------------------------------------------
  public resetToInitial(): void {
    this.data = this.getInitialData();
    this.save();
  }
}

export const db = new DatabaseEngine();
