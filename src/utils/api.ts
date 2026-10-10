import {
  UserAccount,
  CarrierRate,
  Shipment,
  EmailRecord,
  ActivityUpdate,
  ShipmentStatus,
} from '../types';

const TOKEN_KEY = 'bluspark_auth_token';
const USER_KEY = 'bluspark_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: UserAccount): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): UserAccount | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  status?: number;
}

// ----------------------------------------------------
// 1. Authentication
// ----------------------------------------------------

export async function loginApi(
  emailOrUsername: string,
  password: string
): Promise<{ user: UserAccount; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Invalid credentials');
  }

  setStoredAuth(data.token, data.user);
  return { user: data.user, token: data.token };
}

export async function googleLoginApi(
  email: string = 'ashwingupta2027@gmail.com',
  name: string = 'Ashwin Gupta'
): Promise<{ user: UserAccount; token: string }> {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Google sign-in failed');
  }

  setStoredAuth(data.token, data.user);
  return { user: data.user, token: data.token };
}

export async function forgotPasswordApi(email: string): Promise<{ message: string; hint?: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  return {
    message: data.message || 'Recovery email dispatched.',
    hint: data.demoPasswordHint || 'password123',
  };
}

export async function registerApi(
  name: string,
  email: string,
  password: string
): Promise<{ user: UserAccount; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Registration failed');
  }

  setStoredAuth(data.token, data.user);
  return { user: data.user, token: data.token };
}

export async function fetchCurrentUserApi(): Promise<UserAccount | null> {
  try {
    const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch {}
  return getStoredUser();
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
  } catch {}
  clearStoredAuth();
}

// ----------------------------------------------------
// 2. Carrier Rates
// ----------------------------------------------------

export async function fetchRatesApi(params?: {
  origin_port?: string;
  destination_port?: string;
  container_type?: string;
  carrier?: string;
  source?: string;
  min_rate?: number;
  max_rate?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ rates: CarrierRate[]; count: number; lowestRate?: CarrierRate } | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.origin_port) searchParams.set('origin_port', params.origin_port);
    if (params?.destination_port) searchParams.set('destination_port', params.destination_port);
    if (params?.container_type && params.container_type !== 'all') {
      searchParams.set('container_type', params.container_type);
    }
    if (params?.carrier && params.carrier !== 'all') {
      searchParams.set('carrier', params.carrier);
    }
    if (params?.source && params.source !== 'all') {
      searchParams.set('source', params.source);
    }
    if (params?.min_rate) searchParams.set('min_rate', String(params.min_rate));
    if (params?.max_rate) searchParams.set('max_rate', String(params.max_rate));
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const res = await fetch(`/api/rates?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend fetch rates failed:', e);
  }
  return null;
}

export async function createRateApi(rate: Partial<CarrierRate>): Promise<ApiResponse<CarrierRate>> {
  try {
    const res = await fetch('/api/rates', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rate),
    });
    const data = await res.json();
    return { success: res.ok, data: data.rate, message: data.message, error: data.error };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function updateRateApi(
  id: string,
  rate: Partial<CarrierRate>
): Promise<ApiResponse<CarrierRate>> {
  try {
    const res = await fetch(`/api/rates/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(rate),
    });
    const data = await res.json();
    return { success: res.ok, data: data.rate, message: data.message, error: data.error };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function deleteRateApi(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`/api/rates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message, error: data.error };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function bulkIngestRatesApi(rates: CarrierRate[]): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/rates/bulk', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rates }),
    });

    const data = await res.json();
    return {
      success: res.ok,
      data,
      status: res.status,
      message: data.message,
      error: data.error,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function fetchPortsApi(): Promise<{ origins: string[]; destinations: string[] } | null> {
  try {
    const res = await fetch('/api/rates/ports', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export async function fetchCarriersApi(): Promise<Array<{ carrier: string; rateCount: number; minRate: number }> | null> {
  try {
    const res = await fetch('/api/rates/carriers', { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.carriers;
    }
  } catch {}
  return null;
}

// ----------------------------------------------------
// 3. Shipments
// ----------------------------------------------------

export async function fetchShipmentsApi(params?: {
  status?: string;
  carrier?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<Shipment[] | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.carrier) searchParams.set('carrier', params.carrier);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const res = await fetch(`/api/shipments?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      return data.shipments;
    }
  } catch (e) {
    console.warn('Backend fetch shipments failed:', e);
  }
  return null;
}

export async function fetchShipmentStatsApi(): Promise<any | null> {
  try {
    const res = await fetch('/api/shipments/stats', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export async function createShipmentApi(shipment: Partial<Shipment>): Promise<ApiResponse<Shipment>> {
  try {
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shipment),
    });

    const data = await res.json();
    return {
      success: res.ok,
      data: data.shipment,
      status: res.status,
      message: data.message,
      error: data.error,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function updateShipmentStatusApi(
  id: string,
  update: Partial<Shipment>
): Promise<ApiResponse<Shipment>> {
  try {
    const res = await fetch(`/api/shipments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(update),
    });

    const data = await res.json();
    return {
      success: res.ok,
      data: data.shipment,
      status: res.status,
      message: data.message,
      error: data.error,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function deleteShipmentApi(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`/api/shipments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message, error: data.error };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function downloadExcelFromBackend(): Promise<boolean> {
  try {
    const token = getStoredToken();
    const res = await fetch('/api/shipments/export-excel', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BLUSPARK_Ocean_Shipments_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    }
  } catch (e) {
    console.warn('Backend excel export failed:', e);
  }
  return false;
}

export async function downloadCsvFromBackend(): Promise<boolean> {
  try {
    const token = getStoredToken();
    const res = await fetch('/api/shipments/export-csv', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BLUSPARK_Ocean_Shipments_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    }
  } catch (e) {
    console.warn('Backend csv export failed:', e);
  }
  return false;
}

// ----------------------------------------------------
// 4. Invoices
// ----------------------------------------------------

export async function auditInvoiceApi(
  contractedRate: number,
  invoiceAmount: number,
  shipmentId?: string,
  carrier?: string,
  notes?: string
): Promise<{ status: string; difference: number; statusMessage?: string; difference_inr?: number }> {
  try {
    const res = await fetch('/api/invoices/audit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        shipment_id: shipmentId,
        contracted_rate: contractedRate,
        invoice_amount: invoiceAmount,
        carrier,
        notes,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const diff = invoiceAmount - contractedRate;
  return {
    status:
      diff > 0
        ? 'Overcharged'
        : diff === 0
        ? 'Correct Amount Charged'
        : 'Undercharged',
    difference: diff,
    statusMessage:
      diff > 0
        ? `Overcharged by USD ${diff.toLocaleString()}`
        : diff === 0
        ? 'Invoice amount is equal to the contracted rate'
        : `Undercharged by USD ${Math.abs(diff).toLocaleString()}`,
    difference_inr: diff * 83.5,
  };
}

export async function fetchInvoiceHistoryApi(): Promise<any[] | null> {
  try {
    const res = await fetch('/api/invoices/audit-history', { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.audits;
    }
  } catch {}
  return null;
}

export async function fetchInvoiceSummaryApi(): Promise<any | null> {
  try {
    const res = await fetch('/api/invoices/summary', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// ----------------------------------------------------
// 5. Emails
// ----------------------------------------------------

export async function fetchEmailsApi(params?: {
  type?: string;
  processed?: boolean | string;
  search?: string;
}): Promise<EmailRecord[] | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.type && params.type !== 'all') sp.set('type', params.type);
    if (params?.processed !== undefined && params.processed !== 'all') sp.set('processed', String(params.processed));
    if (params?.search) sp.set('search', params.search);

    const res = await fetch(`/api/emails?${sp.toString()}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.emails;
    }
  } catch {}
  return null;
}

export async function processSingleEmailApi(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`/api/emails/${id}/process`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, data: data.email, message: data.message };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function triggerEmailParserApi(): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/emails/process', {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    return {
      success: res.ok,
      data,
      status: res.status,
      message: data.message,
      error: data.error,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function resetEmailsApi(): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/emails/reset', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ----------------------------------------------------
// 6. Activities & Audit Trail
// ----------------------------------------------------

export async function fetchActivitiesApi(limit = 20): Promise<ActivityUpdate[] | null> {
  try {
    const res = await fetch(`/api/activities?limit=${limit}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.activities;
    }
  } catch {}
  return null;
}

// ----------------------------------------------------
// 7. Dashboard Consolidated API
// ----------------------------------------------------

export async function fetchDashboardSummaryApi(): Promise<any | null> {
  try {
    const res = await fetch('/api/dashboard/summary', { headers: getAuthHeaders() });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

// ----------------------------------------------------
// 8. System Reset
// ----------------------------------------------------

export async function resetSystemDataApi(): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/system/reset-demo-data', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
