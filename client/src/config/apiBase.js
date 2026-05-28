const API_BASE_URL = 'https://jswebsite-server.vercel.app/api';

/**
 * Use local proxy during localhost development so new backend changes
 * are immediately available. Use env/deployed URL elsewhere.
 */
export function getApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_URL?.trim().replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      if (fromEnv && (fromEnv.startsWith('/') || fromEnv.includes('localhost') || fromEnv.includes('127.0.0.1'))) {
        return fromEnv;
      }
      return '/api';
    }
  }

  if (fromEnv) return fromEnv;

  return API_BASE_URL;
}
