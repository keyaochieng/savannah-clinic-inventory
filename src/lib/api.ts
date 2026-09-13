// The single doorway every API request goes through.
// Analogy: this is the "hand" that automatically flashes your wristband
// (the access token) at every bar (every request), so no individual
// request has to remember to do it. Later, this same hand will learn to
// quietly get a new wristband when the old one expires (401 → refresh → retry).

const BASE_URL = 'https://dummyjson.com';

// Where we keep the wristband info written down (see AuthContext later).
// Reading it here keeps token-handling in ONE place.
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}
// `T` is a generic type param: the caller supplies the expected
// response shape, e.g. `apiFetch<User>(...)`, so the return value
// is typed as `Promise<User>` instead of `any`/`unknown`.
// Erased at compile time — no runtime effect.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Flash the wristband — but only if we have one.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    // For now, any failure just throws. React Query will catch this and
    // turn it into an error state. (The 401-refresh cleverness comes in
    // step 6, once the refresh machinery exists.)
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
