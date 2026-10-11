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
