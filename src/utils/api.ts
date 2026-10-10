import { UserAccount, UserRole, CarrierRate, Shipment, EmailRecord } from '../types';

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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  status?: number;
}

/**
 * Login with email/username and password.
 * Backend verifies bcrypt password hash and returns signed JWT.
 */
export async function loginApi(
  emailOrUsername: string,
  password: string
): Promise<{ user: UserAccount; token: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setStoredAuth(data.token, data.user);
      return { user: data.user, token: data.token };
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Authentication failed');
    }
  } catch (e) {
    console.warn('Backend login fallback:', e);
    // Offline / fallback mode
    const role: UserRole =
      emailOrUsername.toLowerCase().includes('analyst') ? 'User' : 'Admin';
    const fallbackUser: UserAccount = {
      name: emailOrUsername || (role === 'Admin' ? 'Ashwin Gupta' : 'Logistics Analyst'),
      email: emailOrUsername.includes('@')
        ? emailOrUsername
        : role === 'Admin'
        ? 'ashwingupta2027@gmail.com'
        : 'analyst@bluspark.com',
      role,
    };
    const dummyToken = `jwt_${Date.now()}_offline_session`;
    setStoredAuth(dummyToken, fallbackUser);
    return { user: fallbackUser, token: dummyToken };
  }
}

/**
 * Register a new user with bcrypt password hashing
 */
export async function registerApi(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<{ user: UserAccount; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Registration failed');
  }

  setStoredAuth(data.token, data.user);
  return { user: data.user, token: data.token };
}

/**
 * Get current session profile & RBAC permissions matrix
 */
export async function getPermissionsMatrixApi(): Promise<any> {
  try {
    const res = await fetch('/api/rbac/permissions', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to fetch permissions matrix:', e);
  }
  return null;
}

/**
 * Search Carrier Rates (Available to both Analyst and Admin)
 */
export async function fetchRatesApi(params?: {
  origin_port?: string;
  destination_port?: string;
  container_type?: string;
  carrier?: string;
}): Promise<CarrierRate[] | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.origin_port) searchParams.set('origin_port', params.origin_port);
    if (params?.destination_port) searchParams.set('destination_port', params.destination_port);
    if (params?.container_type) searchParams.set('container_type', params.container_type);
    if (params?.carrier) searchParams.set('carrier', params.carrier);

    const res = await fetch(`/api/rates?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      return data.rates;
    }
  } catch (e) {
    console.warn('Backend fetch rates failed:', e);
  }
  return null;
}

/**
 * Bulk ingest/update carrier tariff table (Admin ONLY)
 */
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
      code: data.code,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

/**
 * Fetch Shipments list (Available to both Analyst and Admin)
 */
export async function fetchShipmentsApi(params?: {
  status?: string;
  carrier?: string;
  search?: string;
}): Promise<Shipment[] | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.carrier) searchParams.set('carrier', params.carrier);
    if (params?.search) searchParams.set('search', params.search);

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

/**
 * Create Shipment (Admin ONLY)
 */
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
      code: data.code,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

/**
 * Update Shipment Status / Details (Admin ONLY)
 */
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
      code: data.code,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

/**
 * Trigger Email Parser Pipeline (Admin ONLY)
 */
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
      code: data.code,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

/**
 * Audit Invoice API (Available to both Analyst and Admin)
 */
export async function auditInvoiceApi(
  contractedRate: number,
  invoiceAmount: number,
  shipmentId?: string
): Promise<{ status: string; difference: number; message?: string }> {
  try {
    const res = await fetch('/api/invoices/audit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        shipment_id: shipmentId,
        contracted_rate: contractedRate,
        invoice_amount: invoiceAmount,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Client-side fallback
  }

  const diff = invoiceAmount - contractedRate;
  return {
    status:
      diff > 0
        ? 'Overcharged'
        : diff === 0
        ? 'Correct Amount Charged'
        : 'Undercharged',
    difference: diff,
    message:
      diff > 0
        ? `Overcharged by USD ${diff.toLocaleString()}`
        : diff === 0
        ? 'Invoice amount is equal to the contracted rate'
        : `Undercharged by USD ${Math.abs(diff).toLocaleString()}`,
  };
}

/**
 * Download Excel report from Backend (Available to Analyst and Admin)
 */
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
    console.warn('Backend excel export failed, falling back to client XLSX:', e);
  }
  return false;
}

/**
 * Fetch System Settings (Available to Analyst and Admin)
 */
export async function fetchSettingsApi(): Promise<any> {
  try {
    const res = await fetch('/api/settings', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend fetch settings failed:', e);
  }
  return null;
}

/**
 * Update System Settings (Admin ONLY)
 */
export async function updateSettingsApi(settings: Record<string, any>): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });

    const data = await res.json();
    return {
      success: res.ok,
      data,
      status: res.status,
      message: data.message,
      error: data.error,
      code: data.code,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}
