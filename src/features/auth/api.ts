// The two conversations with the door (the auth endpoints).
// login  = show ID, get a wristband (accessToken) + re-entry pass (refreshToken)
// refresh = trade the re-entry pass for a fresh wristband, no re-queuing

const BASE_URL = 'https://dummyjson.com';

// What the user looks like when signed in. DummyJSON returns more fields,
// but these are the ones we actually use.
export interface AuthUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      // 1-minute wristband, on purpose — so token expiry happens while
      // testing and we can prove the refresh flow works. (Brief's ask.)
      expiresInMins: 1,
    }),
  });

  if (!response.ok) {
    // Wrong ID at the door. The LoginPage turns this into a visible message.
    throw new Error('Invalid username or password');
  }

  return response.json() as Promise<AuthUser>;
}

export async function refreshSession(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, expiresInMins: 1 }),
  });

  if (!response.ok) {
    // Re-entry pass is dead too — caller must send the user back to the door.
    throw new Error('Session refresh failed');
  }

  return response.json() as Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
