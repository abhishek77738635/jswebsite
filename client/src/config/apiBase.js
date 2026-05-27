/**
 * Resolves API base URL for local dev, Vercel, and custom backends.
 * - Local: uses REACT_APP_API_URL or /api (CRA proxy → localhost:5000)
 * - Production: same-origin /api (ignores localhost in env if not on localhost)
 */
export function getApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_URL?.trim().replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    if (fromEnv && (!fromEnv.includes('localhost') || isLocal)) {
      return fromEnv;
    }

    return `${window.location.origin}/api`;
  }

  return fromEnv || '/api';
}
