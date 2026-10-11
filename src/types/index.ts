export type ContainerType = '20ft' | '40ft';

export type ShipmentStatus = 'In Transit' | 'Delivered' | 'Delayed';

export interface CarrierRate {
  id: string;
  carrier: string;
  origin_port: string;
  destination_port: string;
  container_type: ContainerType;
  rate_usd: number;
  transit_days: number;
  updated_at?: string;
  source?: 'csv' | 'email' | 'manual';
}

export interface Shipment {
  id: string;
  shipment_id: string;
  carrier: string;
  origin_port: string;
  destination_port: string;
  container_type: ContainerType;
  departure_date: string;
  expected_arrival: string;
  delivered_date?: string | null;
  status: ShipmentStatus;
  contracted_rate_usd: number;
  invoice_amount_usd?: number;
}

export type EmailType = 'Rate Update' | 'Shipment Update' | 'Irrelevant';

export interface ParsedEmailPayload {
  carrier?: string;
  origin_port?: string;
  destination_port?: string;
  container_type?: ContainerType;
  rate_usd?: number;
  rate_20gp?: number;
  rate_40hc?: number;
  transit_days?: number;
  shipment_id?: string;
  new_status?: ShipmentStatus;
  delivered_date?: string;
  validity?: string;
  notes?: string;
}

export interface EmailRecord {
  id: string;
  from: string;
  subject: string;
  date: string;
  type: EmailType;
  processed: boolean;
  raw_body: string;
  parsed_payload?: ParsedEmailPayload;
  skip_reason?: string;
  applied_action?: string;
}

export interface ActivityUpdate {
  id: string;
  timestamp: string;
  timeAgo: string;
  type: 'rate' | 'shipment' | 'delayed';
  title: string;
  subtitle: string;
  badgeColor?: string;
}

export type UserRole = 'Admin' | 'User';

export interface UserAccount {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type ActiveNav =
  | 'dashboard'
  | 'rate_search'
  | 'shipment_tracker'
  | 'invoice_checker'
  | 'email_processor'
  | 'presentation';
