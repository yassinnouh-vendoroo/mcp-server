import { getToken } from './auth.js';

const VAPI_BASE_URL = process.env.VAPI_BASE_URL || 'https://api.vapi.ai';

export async function vapiGet<T = unknown>(
  path: string,
  query?: Record<string, unknown>
): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('No Vapi token available');

  const url = new URL(path, VAPI_BASE_URL);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Vapi ${res.status} ${res.statusText}: ${body || path}`);
  }
  return res.json() as Promise<T>;
}
