import { CarrierRate, Shipment, UserAccount } from '../types';

const TOKEN_KEY = 'bluspark_auth_token';
const USER_KEY = 'bluspark_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: UserAccount) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ---------------- AUTH API ----------------

export async function loginUser(emailOrUsername: string, password: string): Promise<{ token: string; user: UserAccount }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: emailOrUsername, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Authentication failed');
  }

  setStoredAuth(data.token, data.user);
  return { token: data.token, user: data.user };
}

export async function registerUser(name: string, email: string, password: string): Promise<{ token: string; user: UserAccount }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Registration failed');
  }

  setStoredAuth(data.token, data.user);
  return { token: data.token, user: data.user };
}

export async function forgotPassword(email: string): Promise<string> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Unable to process reset request');
  }

  return data.message;
}

// ---------------- RATES API ----------------

export async function fetchRatesFromBackend(): Promise<CarrierRate[] | null> {
  try {
    const res = await fetch('/api/rates');
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function syncRatesToBackend(rates: CarrierRate[]): Promise<boolean> {
  try {
    const res = await fetch('/api/rates/bulk', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rates }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------- SHIPMENTS API ----------------

export async function fetchShipmentsFromBackend(): Promise<Shipment[] | null> {
  try {
    const res = await fetch('/api/shipments');
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function createShipmentOnBackend(shipment: Shipment): Promise<boolean> {
  try {
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shipment),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateShipmentStatusOnBackend(
  shipmentId: string,
  status: 'In Transit' | 'Delivered' | 'Delayed',
  deliveredDate?: string | null
): Promise<boolean> {
  try {
    const res = await fetch(`/api/shipments/${encodeURIComponent(shipmentId)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, delivered_date: deliveredDate }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------- EMAILS API ----------------

export async function batchIngestEmailsToBackend(payload: {
  updates: any[];
  newRates: any[];
  newShipmentStatuses: any[];
}): Promise<boolean> {
  try {
    const res = await fetch('/api/emails/batch-process', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
