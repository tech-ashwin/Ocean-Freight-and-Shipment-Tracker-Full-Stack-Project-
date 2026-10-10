import * as XLSX from 'xlsx';
import { CarrierRate, Shipment } from '../types';

export function exportShipmentsToExcel(shipments: Shipment[]): void {
  const data = shipments.map((s) => ({
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

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments');

  // Column width formatting
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

  XLSX.writeFile(workbook, `ocean_shipments_${Date.now()}.xlsx`);
}

export function exportShipmentsToCSV(shipments: Shipment[]): void {
  exportShipmentsToExcel(shipments);
}

export function exportRatesToCSV(rates: CarrierRate[]): void {
  const headers = [
    'Carrier',
    'Origin Port',
    'Destination Port',
    'Container Type',
    'Rate (USD)',
    'Transit Days',
    'Source',
    'Last Updated',
  ];

  const rows = rates.map((r) => [
    `"${r.carrier}"`,
    `"${r.origin_port}"`,
    `"${r.destination_port}"`,
    r.container_type,
    r.rate_usd,
    r.transit_days,
    r.source || 'csv',
    r.updated_at || '-',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `carrier_rates_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCarrierRatesCSV(csvText: string): CarrierRate[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const rates: CarrierRate[] = [];
  const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

  const carrierIdx = header.findIndex((h) => h.includes('carrier'));
  const originIdx = header.findIndex((h) => h.includes('origin'));
  const destIdx = header.findIndex((h) => h.includes('dest'));
  const containerIdx = header.findIndex((h) => h.includes('container'));
  const rateIdx = header.findIndex((h) => h.includes('rate') || h.includes('price'));
  const transitIdx = header.findIndex((h) => h.includes('transit') || h.includes('days'));

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 4) continue;

    const carrier = carrierIdx >= 0 ? cols[carrierIdx] : cols[0];
    const origin = originIdx >= 0 ? cols[originIdx] : cols[1];
    const dest = destIdx >= 0 ? cols[destIdx] : cols[2];
    const container = containerIdx >= 0 ? cols[containerIdx] : cols[3];
    const rate = rateIdx >= 0 ? parseFloat(cols[rateIdx].replace(/[^\d.]/g, '')) : parseFloat(cols[4]);
    const transit = transitIdx >= 0 ? parseInt(cols[transitIdx].replace(/[^\d]/g, ''), 10) : 20;

    if (carrier && origin && dest && !isNaN(rate)) {
      rates.push({
        id: `R_CSV_${Date.now()}_${i}`,
        carrier,
        origin_port: origin,
        destination_port: dest,
        container_type: container.includes('20') ? '20ft' : '40ft',
        rate_usd: rate,
        transit_days: isNaN(transit) ? 20 : transit,
        source: 'csv',
        updated_at: new Date().toISOString().split('T')[0],
      });
    }
  }

  return rates;
}

export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
