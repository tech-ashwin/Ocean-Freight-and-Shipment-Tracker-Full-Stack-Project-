import { CarrierRate, Shipment, UserAccount } from '../types';

const TOKEN_KEY = 'bluspark_auth_token';
const REFRESH_TOKEN_KEY = 'bluspark_auth_refresh_token';
const USER_KEY = 'bluspark_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: UserAccount, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function refreshTokenSession(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (res.ok && data.success && (data.accessToken || data.token)) {
      const newAccess = data.accessToken || data.token;
      setStoredAuth(newAccess, data.user, data.refreshToken || refreshToken);
      return newAccess;
    }
  } catch (err) {
    console.warn('Session refresh failed:', err);
  }

  clearStoredAuth();
  return null;
}

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  // If unauthorized and we have a refresh token, attempt transparent token refresh
  if (res.status === 401 && getStoredRefreshToken()) {
    const newToken = await refreshTokenSession();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
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

  const token = data.accessToken || data.token;
  setStoredAuth(token, data.user, data.refreshToken);
  return { token, user: data.user };
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

  const token = data.accessToken || data.token;
  setStoredAuth(token, data.user, data.refreshToken);
  return { token, user: data.user };
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
    const res = await authenticatedFetch('/api/rates/bulk', {
      method: 'POST',
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
    const res = await authenticatedFetch('/api/shipments', {
      method: 'POST',
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
    const res = await authenticatedFetch(`/api/shipments/${encodeURIComponent(shipmentId)}/status`, {
      method: 'PATCH',
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
    const res = await authenticatedFetch('/api/emails/batch-process', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
