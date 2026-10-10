import {
  EmailRecord,
  EmailType,
  ParsedEmailPayload,
  CarrierRate,
  Shipment,
  ActivityUpdate,
  ContainerType,
} from '../types';
import { ORIGIN_PORTS, DESTINATION_PORTS } from '../data/initialData';

// Map domain to carrier display name
const DOMAIN_CARRIER_MAP: Record<string, string> = {
  'pacificstarline.com': 'PacificStar Line',
  'atlasseacarriers.com': 'AtlasSea Carriers',
  'oceanlinklines.com': 'OceanLink Lines',
  'bluewaveshipping.com': 'BlueWave Shipping',
  'globalmariner.com': 'GlobalMariner',
  'msc.com': 'MSC',
  'maersk.com': 'Maersk',
  'cma-cgm.com': 'CMA CGM',
  'hapag-lloyd.com': 'Hapag-Lloyd',
};

export function detectCarrierFromEmail(from: string, body: string): string {
  const domain = from.split('@')[1]?.toLowerCase() || '';
  if (DOMAIN_CARRIER_MAP[domain]) {
    return DOMAIN_CARRIER_MAP[domain];
  }
  for (const [d, name] of Object.entries(DOMAIN_CARRIER_MAP)) {
    if (domain.includes(d.split('.')[0])) return name;
  }
  // Check in body
  const carrierKeywords = [
    'OceanLink Lines',
    'BlueWave Shipping',
    'GlobalMariner',
    'PacificStar Line',
    'AtlasSea Carriers',
    'MSC',
    'Maersk',
    'CMA CGM',
    'Hapag-Lloyd',
  ];
  for (const c of carrierKeywords) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(body)) {
      return c;
    }
  }
  return 'Independent Carrier';
}

export function classifyEmailType(subject: string, body: string): EmailType {
  const combined = `${subject} ${body}`.toLowerCase();

  // Irrelevant indicators
  if (
    combined.includes('out of office') ||
    combined.includes('meeting reminder') ||
    combined.includes('newsletter') ||
    combined.includes('conference') ||
    combined.includes('holiday notice') ||
    combined.includes('quarterly pipeline meeting') ||
    combined.includes('bunker fuel & shipping trends') ||
    combined.includes('bunker & freight index')
  ) {
    return 'Irrelevant';
  }

  // Shipment Update indicators
  if (
    combined.includes('shipment') ||
    combined.includes('delivery confirmation') ||
    combined.includes('status update for') ||
    combined.includes('delivered') ||
    combined.includes('discharged at terminal') ||
    combined.includes('vessel mv') ||
    /shp?\d+/i.test(combined)
  ) {
    return 'Shipment Update';
  }

  // Rate Update indicators
  if (
    combined.includes('rate') ||
    combined.includes('tariff') ||
    combined.includes('spot rate') ||
    combined.includes('20gp') ||
    combined.includes('40hc') ||
    combined.includes('freight rate')
  ) {
    return 'Rate Update';
  }

  return 'Irrelevant';
}

function normalizePort(raw: string): string | null {
  const cleaned = raw.trim().replace(/\(.*\)/, '').trim().toLowerCase();
  for (const port of [...ORIGIN_PORTS, ...DESTINATION_PORTS]) {
    if (port.toLowerCase() === cleaned || cleaned.includes(port.toLowerCase())) {
      return port;
    }
  }
  return null;
}

export function parseEmailContent(
  from: string,
  subject: string,
  body: string
): {
  type: EmailType;
  processed: boolean;
  parsed_payload?: ParsedEmailPayload;
  skip_reason?: string;
  applied_action?: string;
} {
  const type = classifyEmailType(subject, body);

  if (type === 'Irrelevant') {
    return {
      type: 'Irrelevant',
      processed: false,
      skip_reason: 'Automated administrative message or general industry circular without freight directives.',
    };
  }

  const carrier = detectCarrierFromEmail(from, body);

  if (type === 'Rate Update') {
    // Check for general vague notice
    if (
      body.toLowerCase().includes('general rate revision') ||
      body.toLowerCase().includes('incoming next quarter')
    ) {
      return {
        type: 'Rate Update',
        processed: false,
        skip_reason: 'General advisory notice without specific route ports, pricing or dates.',
      };
    }

    const payload: ParsedEmailPayload = { carrier };

    // Extract Origin Port
    const originMatch =
      body.match(/origin(?:\s*port)?:\s*([^\n\r,\-]+)/i) ||
      subject.match(/([a-zA-Z\s]+)\s*(?:to|\/)\s*([a-zA-Z\s]+)/i);

    if (originMatch) {
      const portCandidate = originMatch[1].trim();
      const resolved = normalizePort(portCandidate);
      if (resolved) payload.origin_port = resolved;
    }

    // Extract Destination Port
    const destMatch =
      body.match(/destination(?:\s*port)?:\s*([^\n\r,\-]+)/i) ||
      subject.match(/(?:to|\/)\s*([a-zA-Z\s]+)/i);

    if (destMatch) {
      const portCandidate = destMatch[1].trim();
      const resolved = normalizePort(portCandidate);
      if (resolved) payload.destination_port = resolved;
    }

    // Direct route check if origin/dest not matched yet
    const routeRegex = /(?:Route:|from)\s*([a-zA-Z\s]+)\s*to\s*([a-zA-Z\s]+)/i;
    const routeMatch = body.match(routeRegex) || subject.match(routeRegex);
    if (routeMatch) {
      const orig = normalizePort(routeMatch[1]);
      const dest = normalizePort(routeMatch[2]);
      if (orig) payload.origin_port = orig;
      if (dest) payload.destination_port = dest;
    }

    // Extract Rates
    // Check for 20GP & 40HC combo
    const comboRateMatch = body.match(/20gp:\s*\$?([\d,]+).*?40hc:\s*\$?([\d,]+)/i);
    if (comboRateMatch) {
      payload.rate_20gp = parseInt(comboRateMatch[1].replace(/,/g, ''), 10);
      payload.rate_40hc = parseInt(comboRateMatch[2].replace(/,/g, ''), 10);
      payload.rate_usd = payload.rate_40hc;
      payload.container_type = '40ft';
    } else {
      // Check for 40HC or 40ft
      const rate40Match = body.match(/(?:40hc|40ft).*?\$?([\d,]+)/i) || body.match(/\$?([\d,]+).*?(?:40hc|40ft)/i);
      // General rate match
      const genericRateMatch = body.match(/(?:rate|tariff|spot rate):\s*\$?([\d,]+)/i) || body.match(/\$([\d,]{3,6})/);

      if (rate40Match) {
        payload.rate_usd = parseInt(rate40Match[1].replace(/,/g, ''), 10);
        payload.container_type = '40ft';
      } else if (genericRateMatch) {
        payload.rate_usd = parseInt(genericRateMatch[1].replace(/,/g, ''), 10);
      }
    }

    // Container Type
    if (!payload.container_type) {
      if (/20(?:ft|gp)/i.test(body) || /20(?:ft|gp)/i.test(subject)) {
        payload.container_type = '20ft';
      } else {
        payload.container_type = '40ft';
      }
    }

    // Transit time
    const transitMatch = body.match(/transit(?:\s*time)?:\s*(\d+)\s*days/i);
    if (transitMatch) {
      payload.transit_days = parseInt(transitMatch[1], 10);
    }

    // Validity
    const validityMatch = body.match(/validity:\s*([^\n\r]+)/i);
    if (validityMatch) {
      payload.validity = validityMatch[1].trim();
    }

    // Validate if actionable
    if (payload.origin_port && payload.destination_port && payload.rate_usd) {
      return {
        type: 'Rate Update',
        processed: true,
        parsed_payload: payload,
        applied_action: `Rate updated for ${carrier} | ${payload.origin_port} → ${payload.destination_port} | ${payload.container_type} (New rate: $${payload.rate_usd.toLocaleString()})`,
      };
    }

    return {
      type: 'Rate Update',
      processed: false,
      parsed_payload: payload,
      skip_reason: 'Missing full rate parameters (origin, destination, or price amount).',
    };
  }

  if (type === 'Shipment Update') {
    // Check if missing shipment ID (e.g. general port congestion advisory)
    const shipmentIdMatch =
      body.match(/\b(SH\d{3}|SHP\d{4})\b/i) ||
      subject.match(/\b(SH\d{3}|SHP\d{4})\b/i);

    if (!shipmentIdMatch) {
      return {
        type: 'Shipment Update',
        processed: false,
        skip_reason: 'Terminal advisory missing specific tracking container or shipment ID.',
      };
    }

    const shipment_id = shipmentIdMatch[1].toUpperCase();
    const payload: ParsedEmailPayload = { shipment_id, carrier };

    // Status classification
    const textLower = `${subject} ${body}`.toLowerCase();
    if (
      textLower.includes('delivered') ||
      textLower.includes('delivery confirmation') ||
      textLower.includes('proof of delivery')
    ) {
      payload.new_status = 'Delivered';
    } else if (
      textLower.includes('delayed') ||
      textLower.includes('inspection hold') ||
      textLower.includes('congestion')
    ) {
      payload.new_status = 'Delayed';
    } else if (
      textLower.includes('in transit') ||
      textLower.includes('has departed') ||
      textLower.includes('at sea')
    ) {
      payload.new_status = 'In Transit';
    } else {
      payload.new_status = 'In Transit';
    }

    // Delivered date
    const dateMatch =
      body.match(/(?:delivered|signed|date):\s*([0-9]{1,2}\s+[a-zA-Z]{3}\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}-[a-zA-Z]{3}-[0-9]{4})/i) ||
      body.match(/on\s+([0-9]{1,2}-[a-zA-Z]{3}-[0-9]{4})/i);

    if (dateMatch) {
      payload.delivered_date = dateMatch[1];
    }

    let actionText = `Shipment ${shipment_id} marked as ${payload.new_status}`;
    if (payload.delivered_date) {
      actionText += ` (Delivered date: ${payload.delivered_date})`;
    }

    return {
      type: 'Shipment Update',
      processed: true,
      parsed_payload: payload,
      applied_action: actionText,
    };
  }

  return {
    type: 'Irrelevant',
    processed: false,
    skip_reason: 'Unrecognized format or non-operational email.',
  };
}

export function applyEmailUpdates(
  email: EmailRecord,
  rates: CarrierRate[],
  shipments: Shipment[]
): {
  updatedRates: CarrierRate[];
  updatedShipments: Shipment[];
  newActivity?: ActivityUpdate;
} {
  if (!email.processed || !email.parsed_payload) {
    return { updatedRates: rates, updatedShipments: shipments };
  }

  const payload = email.parsed_payload;
  let newActivity: ActivityUpdate | undefined;

  // 1. Rate Update application
  if (email.type === 'Rate Update') {
    const carrier = payload.carrier || detectCarrierFromEmail(email.from, email.raw_body);
    const origin = payload.origin_port;
    const dest = payload.destination_port;
    const containerType: ContainerType = payload.container_type || '40ft';
    const rateUsd = payload.rate_usd || payload.rate_40hc || 1500;
    const transitDays = payload.transit_days || 20;

    let ratesCopy = [...rates];

    if (origin && dest) {
      const existingIdx = ratesCopy.findIndex(
        (r) =>
          r.carrier.toLowerCase() === carrier.toLowerCase() &&
          r.origin_port.toLowerCase() === origin.toLowerCase() &&
          r.destination_port.toLowerCase() === dest.toLowerCase() &&
          r.container_type === containerType
      );

      if (existingIdx >= 0) {
        ratesCopy[existingIdx] = {
          ...ratesCopy[existingIdx],
          rate_usd: rateUsd,
          transit_days: transitDays,
          updated_at: email.date,
          source: 'email',
        };
      } else {
        ratesCopy.push({
          id: `R_EM_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          carrier,
          origin_port: origin,
          destination_port: dest,
          container_type: containerType,
          rate_usd: rateUsd,
          transit_days: transitDays,
          updated_at: email.date,
          source: 'email',
        });
      }

      newActivity = {
        id: `ACT_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        type: 'rate',
        title: `Rate updated for ${carrier} | ${origin} → ${dest} | ${containerType}`,
        subtitle: `New rate: $${rateUsd.toLocaleString()}`,
        badgeColor: 'emerald',
      };
    }

    return { updatedRates: ratesCopy, updatedShipments: shipments, newActivity };
  }

  // 2. Shipment Update application
  if (email.type === 'Shipment Update' && payload.shipment_id) {
    let shipmentsCopy = shipments.map((shp) => {
      if (shp.shipment_id.toUpperCase() === payload.shipment_id?.toUpperCase()) {
        const newStatus = payload.new_status || shp.status;
        const deliveredDate =
          newStatus === 'Delivered'
            ? payload.delivered_date || email.date
            : shp.delivered_date;

        return {
          ...shp,
          status: newStatus,
          delivered_date: deliveredDate,
        };
      }
      return shp;
    });

    const targetShipment = shipments.find(
      (s) => s.shipment_id.toUpperCase() === payload.shipment_id?.toUpperCase()
    );

    newActivity = {
      id: `ACT_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      type: payload.new_status === 'Delayed' ? 'delayed' : 'shipment',
      title: `Shipment ${payload.shipment_id} marked as ${payload.new_status || 'Updated'}`,
      subtitle:
        payload.delivered_date
          ? `Delivered date: ${payload.delivered_date}`
          : targetShipment
          ? `Expected: ${targetShipment.expected_arrival} | Current: ${payload.new_status}`
          : `Status updated via email payload`,
      badgeColor: payload.new_status === 'Delayed' ? 'rose' : 'blue',
    };

    return { updatedRates: rates, updatedShipments: shipmentsCopy, newActivity };
  }

  return { updatedRates: rates, updatedShipments: shipments };
}
