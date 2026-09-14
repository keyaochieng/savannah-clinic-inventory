// The single doorway every API request goes through — now with the smart
// expiry handling. Analogy: the "hand" that flashes your wristband at every
// bar, and when the bartender says "expired" (401), quietly shows the
// re-entry pass (refresh token), gets a fresh band, and re-orders — all
// without you having to leave and re-queue at the door.

import { refreshSession } from '../features/auth/api';

const BASE_URL = 'https://dummyjson.com';

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

// When a refresh succeeds we must save BOTH new tokens (DummyJSON rotates
// the refresh token — the old one becomes invalid). Keeping these in sync
// with localStorage is what lets the next request and the next refresh work.
function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearSession() {
  localStorage.removeItem('auth_user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Build the request with the current wristband attached.
async function makeRequest(path: string, options: RequestInit): Promise<Response> {
  const token = getAccessToken();
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response = await makeRequest(path, options);

  // Wristband expired mid-session? Try to get a new one and retry ONCE.
  if (response.status === 401) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      // No re-entry pass at all — nothing to try. Back to the door.
      clearSession();
      throw new Error('Session expired. Please sign in again.');
    }

    try {
      const fresh = await refreshSession(refreshToken);
      storeTokens(fresh.accessToken, fresh.refreshToken); // rotation: save both
      response = await makeRequest(path, options); // re-order with fresh band
    } catch {
      // Re-entry pass is dead too — really do have to re-queue at the door.
      clearSession();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
